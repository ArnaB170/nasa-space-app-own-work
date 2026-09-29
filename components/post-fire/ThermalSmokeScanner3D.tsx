import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Stars, OrbitControls } from "@react-three/drei";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type SimulationState = "IDLE" | "BURNING" | "ASSESSMENT" | "SCRUBBING";

export interface ThermalSmokeScanner3DProps {
  /** Current phase of the fire/ECLSS simulation. */
  simulationState: SimulationState;
  /** Calculated toxicity index: <= 1.0 safe (green), >= 3.0 critical (red). */
  tGrp: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

/** Module inner dimensions (a box roughly ISS-destiny-module shaped). */
const MODULE_SIZE = new THREE.Vector3(6, 4, 4);

const HALF = new THREE.Vector3(
  MODULE_SIZE.x / 2,
  MODULE_SIZE.y / 2,
  MODULE_SIZE.z / 2,
);

/** HVAC vent intake location, on the +X bulkhead, slightly above centre. */
const VENT_POS = new THREE.Vector3(MODULE_SIZE.x / 2 - 0.01, 0.6, 0);

/** Where the fire burns: centre of the module floor. */
const FIRE_POS = new THREE.Vector3(0, -MODULE_SIZE.y / 2 + 0.02, 0);

const PARTICLE_COUNT = 2500;
const EMBER_COUNT = 250;

const FRAME_SAFE = new THREE.Color("#2a8fff"); // ambient blue
const FRAME_TOXIC = new THREE.Color("#ff2a1a"); // critical red

const SMOKE_SAFE = new THREE.Color("#22ff66"); // tGrp <= 1.0
const SMOKE_TOXIC = new THREE.Color("#ff2a1a"); // tGrp >= 3.0
const SMOKE_IDLE = new THREE.Color("#aab4bc"); // neutral grey

/** Smoothing rate (higher = snappier) for state transitions. */
const DAMP = 3;

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

/** 0 at tGrp <= 1.0 (safe), 1 at tGrp >= 3.0 (critical). */
function toxicityFactor(tGrp: number): number {
  return THREE.MathUtils.clamp((tGrp - 1.0) / 2.0, 0, 1);
}

/** Green (safe) -> Red (toxic) mapped from the toxicity index. */
function toxicityColor(tGrp: number, out: THREE.Color): THREE.Color {
  return out.lerpColors(SMOKE_SAFE, SMOKE_TOXIC, toxicityFactor(tGrp));
}

/**
 * Soft radial-gradient sprite generated on an HTML5 canvas — no external
 * asset needed. White core fading to transparent edge.
 */
function createParticleTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  gradient.addColorStop(0.0, "rgba(255,255,255,1.0)");
  gradient.addColorStop(0.25, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.30)");
  gradient.addColorStop(1.0, "rgba(255,255,255,0.0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/* ------------------------------------------------------------------ */
/*  GLSL — procedural fire (fbm noise shaped into flames)             */
/* ------------------------------------------------------------------ */

const fireVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fireFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColorDeep;
  uniform vec3 uColorMid;
  uniform vec3 uColorTip;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float column = smoothstep(0.0, 0.12, uv.y) * (1.0 - smoothstep(0.55, 0.95, uv.y));
    vec2 q = vec2(uv.x * 3.0, uv.y * 2.2 - uTime * 1.6);
    float turb = fbm(q + fbm(q * 1.8 + uTime * 0.3) * 0.9);
    float cx = abs(uv.x - 0.5) * 2.0;
    float body = smoothstep(0.9, 0.15, cx + turb * 0.55 - uv.y * 0.35);
    float shape = body * column * smoothstep(0.0, 0.25, uv.y + turb * 0.25);
    float t = clamp(shape * 1.6, 0.0, 1.0);
    vec3 col = mix(uColorDeep, uColorMid, smoothstep(0.15, 0.55, t));
    col = mix(col, uColorTip, smoothstep(0.6, 0.95, t));
    float alpha = clamp(shape * 1.4, 0.0, 1.0) * uIntensity;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col * (1.2 + t * 1.5), alpha);
  }
`;

/* ------------------------------------------------------------------ */
/*  Volumetric fire: crossed shader planes + hot core + firelight      */
/* ------------------------------------------------------------------ */

function FireEffect({ simulationState }: { simulationState: SimulationState }) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const light2Ref = useRef<THREE.PointLight>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMat = useRef<THREE.MeshBasicMaterial>(null);
  const intensity = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uColorDeep: { value: new THREE.Color("#c1120f") },
      uColorMid: { value: new THREE.Color("#ff7a00") },
      uColorTip: { value: new THREE.Color("#ffe066") },
    }),
    [],
  );

  const planes = useMemo(() => {
    const geo = new THREE.PlaneGeometry(2.4, 2.2, 1, 1);
    return [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4].map(
      (rotY) => [geo, rotY] as const,
    );
  }, []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;

    const target = simulationState === "BURNING" ? 1 : 0;
    intensity.current = THREE.MathUtils.damp(intensity.current, target, 4, dt);
    uniforms.uTime.value = t;
    uniforms.uIntensity.value = intensity.current;

    const g = groupRef.current;
    if (!g) return;
    g.visible = intensity.current > 0.01;

    const flicker =
      0.75 +
      0.25 * Math.sin(t * 11) * Math.sin(t * 5.7 + 1.3) +
      0.1 * Math.sin(t * 23);
    const I = intensity.current * flicker;

    if (lightRef.current) {
      lightRef.current.intensity = 14 * I;
      lightRef.current.position.set(
        FIRE_POS.x + Math.sin(t * 7) * 0.15,
        FIRE_POS.y + 0.8,
        FIRE_POS.z + Math.cos(t * 6) * 0.15,
      );
    }
    if (light2Ref.current) {
      light2Ref.current.intensity = 6 * I;
    }
    if (coreMat.current) {
      coreMat.current.opacity = 0.85 * intensity.current;
    }
    if (coreRef.current) {
      const s = intensity.current * (1 + 0.06 * Math.sin(t * 9));
      coreRef.current.scale.setScalar(Math.max(s, 0.0001));
    }
  });

  return (
    <group position={FIRE_POS.toArray()}>
      <group ref={groupRef}>
        {planes.map(([geo, rotY], i) => (
          <mesh key={i} geometry={geo} rotation={[0, rotY, 0]} position={[0, 1.05, 0]}>
            <shaderMaterial
              vertexShader={fireVertexShader}
              fragmentShader={fireFragmentShader}
              uniforms={uniforms}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        <mesh ref={coreRef} position={[0, 0.12, 0]}>
          <icosahedronGeometry args={[0.34, 2]} />
          <meshBasicMaterial
            ref={coreMat}
            color="#ffd9a0"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      <pointLight
        ref={lightRef}
        color="#ff8c3b"
        distance={12}
        decay={2}
        position={[0, 0.9, 0]}
        intensity={0}
      />
      <pointLight
        ref={light2Ref}
        color="#ff3300"
        distance={7}
        decay={2}
        position={[0, 0.35, 0]}
        intensity={0}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Ember sparks                                                       */
/* ------------------------------------------------------------------ */

function EmberSparks({ simulationState }: { simulationState: SimulationState }) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const intensity = useRef(0);

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(EMBER_COUNT * 3);
    const seeds = new Float32Array(EMBER_COUNT * 2);
    for (let i = 0; i < EMBER_COUNT; i++) {
      seeds[i * 2] = Math.random();
      seeds[i * 2 + 1] = 0.6 + Math.random() * 1.4;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: g, seeds };
  }, []);

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    const target = simulationState === "BURNING" ? 1 : 0;
    intensity.current = THREE.MathUtils.damp(intensity.current, target, 4, dt);
    if (matRef.current) matRef.current.opacity = intensity.current;

    const attr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < EMBER_COUNT; i++) {
      const i3 = i * 3;
      const phase = seeds[i * 2];
      const speed = seeds[i * 2 + 1];
      const life = (t * 0.28 * speed + phase) % 1;
      const angle = phase * Math.PI * 2 + t * (0.4 + phase);
      const radius = 0.15 + life * (0.35 + phase * 0.35);
      arr[i3] = FIRE_POS.x + Math.cos(angle) * radius;
      arr[i3 + 1] = FIRE_POS.y + life * (2.0 * speed);
      arr[i3 + 2] = FIRE_POS.z + Math.sin(angle) * radius;
    }
    attr.needsUpdate = true;
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        color="#ffcc66"
        size={0.045}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Module wireframe (unchanged)                                       */
/* ------------------------------------------------------------------ */

function ModuleFrame({
  simulationState,
  tGrp,
}: {
  simulationState: SimulationState;
  tGrp: number;
}) {
  const wireMat = useRef<THREE.MeshBasicMaterial>(null);
  const frameMat = useRef<THREE.LineBasicMaterial>(null);
  const liveColor = useRef(new THREE.Color("#2a8fff"));
  const target = useMemo(() => new THREE.Color(), []);

  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(...MODULE_SIZE.toArray())),
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (simulationState === "BURNING") {
      target.copy(FRAME_TOXIC);
    } else {
      target.lerpColors(FRAME_SAFE, FRAME_TOXIC, toxicityFactor(tGrp));
    }
    liveColor.current.lerp(target, 1 - Math.exp(-DAMP * dt));
    if (wireMat.current) wireMat.current.color.copy(liveColor.current);
    if (frameMat.current) frameMat.current.color.copy(liveColor.current);
  });

  return (
    <group>
      <mesh>
        <boxGeometry args={MODULE_SIZE.toArray()} />
        <meshBasicMaterial
          ref={wireMat}
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={frameMat} linewidth={1} />
      </lineSegments>
      {[-2, 0, 2].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry
            args={[Math.min(MODULE_SIZE.y, MODULE_SIZE.z) / 2 - 0.05, 0.02, 8, 32]}
          />
          <meshBasicMaterial color="#445566" transparent opacity={0.4} />
        </mesh>
      ))}
      <gridHelper
        args={[MODULE_SIZE.x, 6, "#334455", "#223344"]}
        position={[0, -MODULE_SIZE.y / 2 + 0.001, 0]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  HVAC vent (unchanged)                                              */
/* ------------------------------------------------------------------ */

function HvacVent() {
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) {
      glow.current.intensity = 3 + Math.sin(clock.elapsedTime * 4) * 1.5;
    }
  });
  return (
    <group position={VENT_POS.toArray()} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <boxGeometry args={[1.4, 1.4, 0.08]} />
        <meshStandardMaterial color="#1a2530" metalness={0.7} roughness={0.4} />
      </mesh>
      {[-0.45, -0.15, 0.15, 0.45].map((y) => (
        <mesh key={y} position={[0, y, 0.06]}>
          <boxGeometry args={[1.2, 0.12, 0.05]} />
          <meshStandardMaterial
            color="#0af0ff"
            emissive="#0af0ff"
            emissiveIntensity={1.2}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.1]}>
        <ringGeometry args={[0.75, 0.85, 32]} />
        <meshBasicMaterial
          color="#0af0ff"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight ref={glow} color="#0af0ff" distance={6} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Smoke + fire column particles                                      */
/*                                                                     */
/*  BURNING:        particles spawn at the fire, flicker upward in a   */
/*                  convection column and gather into a thick layer    */
/*                  at the ceiling.                                    */
/*                                                                     */
/*  ASSESSMENT /    particles drift EVERYWHERE inside the module —     */
/*  SCRUBBING:      full 3D wandering on X, Y and Z, respawning at     */
/*                  random points so the whole volume stays filled.    */
/* ------------------------------------------------------------------ */

/** Height at which particles stop rising and begin to gather. */
const CEILING_Y = HALF.y - 0.12;
/** Gathering zone = top 10% of module height. */
const GATHER_START_Y = CEILING_Y - MODULE_SIZE.y * 0.1;

/* Height-based colour ramp: white -> yellow -> orange -> dark smoke. */
const RAMP_WHITE = new THREE.Color("#fff6d8");
const RAMP_YELLOW = new THREE.Color("#ffd23f");
const RAMP_ORANGE = new THREE.Color("#ff7a00");
const SMOKE_DARK = new THREE.Color("#101318");
/** Slightly luminous slate so the gathered layer reads under additive blending. */
const SMOKE_THICK = new THREE.Color("#7c8590");

function SmokeParticles({
  simulationState,
  tGrp,
}: {
  simulationState: SimulationState;
  tGrp: number;
}) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const texture = useMemo(() => createParticleTexture(), []);

  /* ---------------- particle buffers ---------------- */
  const { geometry, drifts, seeds, linger, alphas } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const drifts = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const linger = new Float32Array(PARTICLE_COUNT);
    const alphas = new Float32Array(PARTICLE_COUNT).fill(1);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * (MODULE_SIZE.x - 0.4);
      positions[i3 + 1] = (Math.random() - 0.5) * (MODULE_SIZE.y - 0.4);
      positions[i3 + 2] = (Math.random() - 0.5) * (MODULE_SIZE.z - 0.4);

      drifts[i3] = (Math.random() - 0.5) * 0.12;
      drifts[i3 + 1] = (Math.random() - 0.5) * 0.12;
      drifts[i3 + 2] = (Math.random() - 0.5) * 0.12;

      seeds[i] = Math.random() * 100;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
    return { geometry: g, drifts, seeds, linger, alphas };
  }, []);

  const scratch = useMemo(
    () => ({
      p: new THREE.Vector3(),
      randomSpawn: new THREE.Vector3(),
      fireSpawn: new THREE.Vector3(),
      c: new THREE.Color(),
      c2: new THREE.Color(),
      tint: new THREE.Color(),
    }),
    [],
  );

  /**
   * Smoothed live values — every visual/kinematic parameter eases toward
   * its per-state target each frame, so transitions never hard-snap.
   */
  const smooth = useRef({
    opacity: 0,
    size: 0.05,
    speed: 1,
    upBias: 0.02,
    fireSpawnMix: 0, // 0 = respawn anywhere, 1 = respawn at the fire
  });

  /* Inject a per-particle alpha attribute into the PointsMaterial shader. */
  const attachMaterial = (mat: THREE.PointsMaterial | null) => {
    if (!mat || matRef.current === mat) return;
    matRef.current = mat;
    mat.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nattribute float aAlpha;\nvarying float vAlpha;",
        )
        .replace(
          "#include <fog_vertex>",
          "#include <fog_vertex>\nvAlpha = aAlpha;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying float vAlpha;",
        )
        .replace(
          "#include <opaque_fragment>",
          "diffuseColor.a *= vAlpha;\n#include <opaque_fragment>",
        );
    };
    mat.customProgramCacheKey = () => "smoke-aalpha-v1";
    mat.needsUpdate = true;
  };

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05); // clamp against tab-switch spikes
    const t = clock.elapsedTime;
    const s = smooth.current;
    const { p, randomSpawn, fireSpawn, c, c2, tint } = scratch;

    /* ---------------- per-state targets (unchanged state machine) ------ */
    let tOpacity = 0;
    let tSize = 0.05;
    let tSpeed = 1;
    let tUpBias = 0.02;
    let tFireSpawn = 0;

    switch (simulationState) {
      case "BURNING": {
        tOpacity = 0.55;
        tSize = 0.14;
        tSpeed = 2.0;
        tUpBias = 1.2; // buoyant convection column
        tFireSpawn = 1;
        break;
      }
      case "ASSESSMENT":
      case "SCRUBBING": {
        tOpacity = 0.85;     // Increased for better visibility
        tSize = 0.12;        // Increased for better visibility
        tSpeed = 1.4;        // livelier drift fills the volume faster
        tUpBias = 0.0;       // no net buoyancy — smoke goes every direction
        tFireSpawn = 0;      // respawn anywhere in the module
        break;
      }
      default: {
        // IDLE — dormant, particles hidden
        break;
      }
    }

    /* ---------------- smooth toward targets ---------------- */
    s.opacity = THREE.MathUtils.damp(s.opacity, tOpacity, DAMP, dt);
    s.size = THREE.MathUtils.damp(s.size, tSize, DAMP, dt);
    s.speed = THREE.MathUtils.damp(s.speed, tSpeed, DAMP, dt);
    s.upBias = THREE.MathUtils.damp(s.upBias, tUpBias, DAMP, dt);
    s.fireSpawnMix = THREE.MathUtils.damp(s.fireSpawnMix, tFireSpawn, DAMP, dt);

    if (s.opacity < 0.004) {
      if (matRef.current) matRef.current.opacity = 0;
      return;
    }

    /* ---------------- advect particles ---------------- */
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = geometry.getAttribute("color") as THREE.BufferAttribute;
    const alpAttr = geometry.getAttribute("aAlpha") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const carr = colAttr.array as Float32Array;
    const aarr = alpAttr.array as Float32Array;

    const burning = simulationState === "BURNING";

    const respawn = (v: THREE.Vector3) => {
      randomSpawn.set(
        (Math.random() - 0.5) * (MODULE_SIZE.x - 0.6),
        (Math.random() - 0.5) * (MODULE_SIZE.y - 0.6),
        (Math.random() - 0.5) * (MODULE_SIZE.z - 0.6),
      );
      // spawn just above the fire, small radius
      const r = Math.sqrt(Math.random()) * 0.4;
      const a = Math.random() * Math.PI * 2;
      fireSpawn.set(
        FIRE_POS.x + Math.cos(a) * r,
        FIRE_POS.y + 0.3 + Math.random() * 0.4,
        FIRE_POS.z + Math.sin(a) * r,
      );
      v.lerpVectors(randomSpawn, fireSpawn, s.fireSpawnMix);
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const seed = seeds[i];
      p.set(arr[i3], arr[i3 + 1], arr[i3 + 2]);

      /* ---------------- ceiling gathering (BURNING only) ------------- */
      // After the fire stops, smoke no longer collects at the ceiling —
      // it drifts everywhere instead.
      const inGatherZone = burning && p.y > GATHER_START_Y;
      linger[i] = THREE.MathUtils.clamp(
        linger[i] + (inGatherZone ? dt * 1.6 : -dt * 2.5),
        0,
        1,
      );
      const l = linger[i];

      if (burning) {
        /* ------------- rising fire column with flicker --------------- */
        if (l < 1) {
          const flickX =
            Math.sin(t * 6.3 + seed) * 0.35 +
            Math.sin(t * 15.7 + seed * 2.1) * 0.15;
          const flickZ =
            Math.cos(t * 5.1 + seed * 1.3) * 0.35 +
            Math.cos(t * 17.3 + seed) * 0.15;
          const flickY = Math.sin(t * 9.4 + seed * 3.7) * 0.25;

          p.x += (drifts[i3] * s.speed + flickX) * (1 - l * 0.8) * dt;
          p.y +=
            ((drifts[i3 + 1] * s.speed + s.upBias) * (1 - l * 0.97) +
              flickY * 0.3) *
            dt;
          p.z += (drifts[i3 + 2] * s.speed + flickZ) * (1 - l * 0.8) * dt;

          if (inGatherZone) {
            p.y = Math.min(p.y, CEILING_Y);
          }
        }

        if (l > 0.05) {
          // gathered: near-zero vertical motion, lateral X/Z drift,
          // clamped just under the ceiling so the layer builds up
          p.y += Math.sin(t * 0.8 + seed * 5.0) * 0.02 * l * dt;
          p.x +=
            (Math.sin(t * 0.7 + seed * 2.0) * 0.25 +
              (Math.random() - 0.5) * 0.35) *
            l *
            dt *
            s.speed;
          p.z +=
            (Math.cos(t * 0.9 + seed * 4.0) * 0.25 +
              (Math.random() - 0.5) * 0.35) *
            l *
            dt *
            s.speed;
          p.y = Math.min(p.y, CEILING_Y);
        }
      } else {
        /* ------------- post-fire: smoke drifts EVERYWHERE --------------
         * Full 3D wandering — X, Y and Z — so the smoke fills the whole
         * module volume instead of pooling at the ceiling. Particles that
         * leave the box respawn at a random point inside it, keeping the
         * entire space uniformly smoky for as long as the state lasts.
         */
        p.x +=
          (drifts[i3] * s.speed +
            Math.sin(t * 0.9 + seed) * 0.1 +
            (Math.random() - 0.5) * 0.08) *
          dt;
        p.y +=
          (drifts[i3 + 1] * s.speed +
            s.upBias +
            Math.sin(t * 0.7 + seed * 2.0) * 0.1 +
            (Math.random() - 0.5) * 0.08) *
          dt;
        p.z +=
          (drifts[i3 + 2] * s.speed +
            Math.cos(t * 1.1 + seed * 3.0) * 0.1 +
            (Math.random() - 0.5) * 0.08) *
          dt;
      }

      /* ---------------- bounds handling ---------------- */
      const outX = Math.abs(p.x) > HALF.x - 0.12;
      const outZ = Math.abs(p.z) > HALF.z - 0.12;
      const outFloor = p.y < -HALF.y + 0.1;
      const outCeiling = p.y > HALF.y - 0.1;

      if ((outX || outZ || outFloor || outCeiling) && l < 0.3) {
        // free particle escaped — recycle it back into the simulation
        respawn(p);
        linger[i] = 0;
      } else {
        // gathered particles are clamped softly so the ceiling layer persists
        if (outX) p.x = Math.sign(p.x) * (HALF.x - 0.12);
        if (outZ) p.z = Math.sign(p.z) * (HALF.z - 0.12);
        if (outFloor) p.y = -HALF.y + 0.1;
        if (outCeiling) p.y = CEILING_Y;
      }

      arr[i3] = p.x;
      arr[i3 + 1] = p.y;
      arr[i3 + 2] = p.z;

      /* ---------------- dynamic colour ramp ---------------- */
      // h: 0 at floor -> 1 at ceiling
      const h = THREE.MathUtils.clamp((p.y + HALF.y) / MODULE_SIZE.y, 0, 1);

      if (burning) {
        // white -> yellow -> orange -> dark smoke, keyed to height
        if (h < 0.25) {
          c.lerpColors(RAMP_WHITE, RAMP_YELLOW, h / 0.25);
        } else if (h < 0.5) {
          c.lerpColors(RAMP_YELLOW, RAMP_ORANGE, (h - 0.25) / 0.25);
        } else if (h < 0.8) {
          c.lerpColors(RAMP_ORANGE, SMOKE_DARK, (h - 0.5) / 0.3);
        } else {
          c.copy(SMOKE_DARK);
        }
        // thickening: gathered smoke becomes a denser, visible slate haze
        c2.copy(SMOKE_DARK).lerp(SMOKE_THICK, l * 0.75);
        c.lerp(c2, l * 0.9);
        aarr[i] = 0.55 + 0.45 * l; // opacity grows as the layer lingers
      } else {
        // post-fire: smoke everywhere, tinted by the live tGrp index.
        // Colour is height-independent so the volume reads uniformly.
        toxicityColor(tGrp, tint).multiplyScalar(0.85); // Boosted for visibility
        c.copy(SMOKE_DARK).lerp(tint, 0.9);             // Biased toward bright tint
        c2.copy(tint).multiplyScalar(0.7);              // Brightened shimmer
        c.lerp(c2, 0.3 + 0.3 * Math.sin(t * 0.5 + seed)); 
        aarr[i] = 0.75 + 0.25 * Math.sin(t * 0.4 + seed * 1.7); // Increased base alpha
      }

      carr[i3] = c.r;
      carr[i3 + 1] = c.g;
      carr[i3 + 2] = c.b;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    alpAttr.needsUpdate = true;

    /* ---------------- push smoothed values to the material ---------------- */
    if (matRef.current) {
      matRef.current.opacity = s.opacity;
      matRef.current.size = s.size;
    }
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={attachMaterial}
        map={texture}
        vertexColors
        color="#ffffff"
        size={0.05}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

function ScannerScene({ simulationState, tGrp }: ThermalSmokeScanner3DProps) {
  return (
    <>
      <color attach="background" args={["#04060c"]} />
      <fog attach="fog" args={["#04060c", 12, 30]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 4]} intensity={0.6} />

      <Stars radius={60} depth={40} count={2500} factor={3} fade speed={0.4} />
      <OrbitControls makeDefault enableDamping autoRotate={false} />
      <Environment preset="night" />

      <ModuleFrame simulationState={simulationState} tGrp={tGrp} />
      <HvacVent />
      <FireEffect simulationState={simulationState} />
      <EmberSparks simulationState={simulationState} />
      <SmokeParticles simulationState={simulationState} tGrp={tGrp} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export default function ThermalSmokeScanner3D({
  simulationState,
  tGrp,
}: ThermalSmokeScanner3DProps) {
  return (
    <Canvas
      camera={{ position: [7.5, 4.5, 7.5], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <ScannerScene simulationState={simulationState} tGrp={tGrp} />
    </Canvas>
  );
}