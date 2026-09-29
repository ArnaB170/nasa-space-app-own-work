import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Stars, OrbitControls } from "@react-three/drei";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SimulationState = "IDLE" | "BURNING" | "ASSESSMENT" | "SCRUBBING";

export interface ThermalSmokeScanner3DProps {
  /** Current phase of the fire/ECLSS simulation. */
  simulationState: SimulationState;
  /** Calculated toxicity index: <= 1.0 safe (green), >= 3.0 critical (red). */
  tGrp: number;
  /** Seconds remaining in the ECLSS scrub cycle (300 -> 0). */
  scrubTimer: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const TIMER_MAX = 300;

/** Module inner dimensions (a box roughly ISS-destiny-module shaped). */
const MODULE_SIZE = new THREE.Vector3(6, 4, 4);

/** HVAC vent intake location, on the +X bulkhead, slightly above centre. */
const VENT_POS = new THREE.Vector3(MODULE_SIZE.x / 2 - 0.01, 0.6, 0);

const PARTICLE_COUNT = 1500;

const COLOR_HOT = new THREE.Color("#ff2a1a"); // critical red
const COLOR_SAFE = new THREE.Color("#2a8fff"); // ambient blue

const SMOKE_SAFE = new THREE.Color("#22ff66"); // tGrp <= 1.0
const SMOKE_TOXIC = new THREE.Color("#ff2a1a"); // tGrp >= 3.0
const SMOKE_IDLE = new THREE.Color("#aab4bc"); // neutral grey

const FLAME_DEEP = new THREE.Color("#ff7a00"); // orange
const FLAME_BRIGHT = new THREE.Color("#ffd23f"); // yellow

/** Smoothing rate (higher = snappier) for state transitions. */
const DAMP = 3;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** clamp + normalise: 1 = full heat/smoke, 0 = scrubbed clean */
function scrubProgress(scrubTimer: number): number {
  return THREE.MathUtils.clamp(scrubTimer / TIMER_MAX, 0, 1);
}

/** Green (safe) -> Red (toxic) mapped from the toxicity index. */
function toxicityColor(tGrp: number, out: THREE.Color): THREE.Color {
  const t = THREE.MathUtils.clamp((tGrp - 1.0) / 2.0, 0, 1); // 1.0 -> 0, 3.0 -> 1
  return out.lerpColors(SMOKE_SAFE, SMOKE_TOXIC, t);
}

/* ------------------------------------------------------------------ */
/*  Module wireframe with thermal colour lerp                          */
/* ------------------------------------------------------------------ */

function ModuleFrame({ progress }: { progress: number }) {
  const wireMat = useRef<THREE.MeshBasicMaterial>(null);
  const frameMat = useRef<THREE.LineBasicMaterial>(null);

  const edges = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(...MODULE_SIZE.toArray())),
    [],
  );

  useFrame(() => {
    // Lerp critical red -> ambient blue as the timer counts down.
    const c = new THREE.Color().lerpColors(COLOR_SAFE, COLOR_HOT, progress);
    if (wireMat.current) wireMat.current.color.copy(c);
    if (frameMat.current) frameMat.current.color.copy(c);
  });

  return (
    <group>
      {/* faint translucent hull so the wireframe reads as a volume */}
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

      {/* the actual wireframe edges */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={frameMat} linewidth={1} />
      </lineSegments>

      {/* a couple of internal ring frames for parallax / depth */}
      {[-2, 0, 2].map((x) => (
        <mesh key={x} position={[x, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry
            args={[Math.min(MODULE_SIZE.y, MODULE_SIZE.z) / 2 - 0.05, 0.02, 8, 32]}
          />
          <meshBasicMaterial color="#445566" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* floor grid */}
      <gridHelper
        args={[MODULE_SIZE.x, 6, "#334455", "#223344"]}
        position={[0, -MODULE_SIZE.y / 2 + 0.001, 0]}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  HVAC vent grate on the +X bulkhead                                 */
/* ------------------------------------------------------------------ */

function HvacVent({ progress }: { progress: number }) {
  const glow = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    // gentle pulsing suction glow while smoke remains
    if (glow.current) {
      glow.current.intensity =
        2 + progress * 6 + Math.sin(clock.elapsedTime * 4) * progress * 2;
    }
  });

  return (
    <group position={VENT_POS.toArray()} rotation={[0, Math.PI / 2, 0]}>
      {/* mounting plate */}
      <mesh>
        <boxGeometry args={[1.4, 1.4, 0.08]} />
        <meshStandardMaterial color="#1a2530" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* grille slats */}
      {[-0.45, -0.15, 0.15, 0.45].map((y) => (
        <mesh key={y} position={[0, y, 0.06]}>
          <boxGeometry args={[1.2, 0.12, 0.05]} />
          <meshStandardMaterial
            color="#0af0ff"
            emissive="#0af0ff"
            emissiveIntensity={0.6 + progress * 1.4}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* target ring */}
      <mesh position={[0, 0, 0.1]}>
        <ringGeometry args={[0.75, 0.85, 32]} />
        <meshBasicMaterial
          color="#0af0ff"
          transparent
          opacity={0.35 + progress * 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      <pointLight ref={glow} color="#0af0ff" distance={6} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/*  Smoke / fire particle system (BufferGeometry + Points)             */
/* ------------------------------------------------------------------ */

function SmokeParticles({
  progress,
  simulationState,
  tGrp,
}: {
  progress: number;
  simulationState: SimulationState;
  tGrp: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const { positions, drifts } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const drifts = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // random point inside the module, inset slightly from the walls
      positions[i3] = (Math.random() - 0.5) * (MODULE_SIZE.x - 0.4);
      positions[i3 + 1] = (Math.random() - 0.5) * (MODULE_SIZE.y - 0.4);
      positions[i3 + 2] = (Math.random() - 0.5) * (MODULE_SIZE.z - 0.4);

      // per-particle random ambient drift
      drifts[i3] = (Math.random() - 0.5) * 0.12;
      drifts[i3 + 1] = (Math.random() - 0.5) * 0.12 + 0.02; // slight buoyancy
      drifts[i3 + 2] = (Math.random() - 0.5) * 0.12;
    }
    return { positions, drifts };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  // scratch objects, allocated once
  const scratch = useMemo(
    () => ({
      toVent: new THREE.Vector3(),
      p: new THREE.Vector3(),
      randomSpawn: new THREE.Vector3(),
      floorSpawn: new THREE.Vector3(),
      targetColor: new THREE.Color("#aab4bc"),
    }),
    [],
  );

  /**
   * Smoothed live values — every visual/kinematic parameter eases toward
   * its per-state target each frame, so transitions never hard-snap.
   */
  const smooth = useRef({
    color: new THREE.Color("#aab4bc"),
    opacity: 0,
    size: 0.045,
    speed: 1, // multiplier on ambient drift
    upBias: 0.02, // constant upward velocity component
    ventPull: 0, // strength of the collective HVAC suction vector
    floorSpawnMix: 0, // 0 = respawn anywhere, 1 = respawn at floor centre
  });

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05); // clamp against tab-switch spikes
    const s = smooth.current;
    const { targetColor } = scratch;

    /* ---------------- per-state targets ---------------- */
    let tOpacity = 0;
    let tSize = 0.045;
    let tSpeed = 1;
    let tUpBias = 0.02;
    let tVentPull = 0;
    let tFloorSpawn = 0;

    switch (simulationState) {
      case "BURNING": {
        // flickering orange <-> yellow flame palette
        const t = clock.elapsedTime;
        const flicker = 0.5 + 0.5 * Math.sin(t * 13 + Math.sin(t * 7.3) * 2);
        targetColor.lerpColors(FLAME_DEEP, FLAME_BRIGHT, flicker);
        tOpacity = 0.9;
        tSize = 0.06;
        tSpeed = 6; // rapid turbulent motion
        tUpBias = 2.4; // strong buoyant rise
        tVentPull = 0;
        tFloorSpawn = 1; // spawn from the centre of the floor
        break;
      }
      case "ASSESSMENT": {
        // room fills with smoke tinted by the live toxicity index
        toxicityColor(tGrp, targetColor);
        tOpacity = 0.5;
        tSize = 0.05;
        tSpeed = 1;
        tUpBias = 0.02;
        tVentPull = 0.08; // faint background airflow
        break;
      }
      case "SCRUBBING": {
        // same toxicity tint, but ECLSS fades/shrinks smoke as timer -> 0
        toxicityColor(tGrp, targetColor);
        tOpacity = 0.5 * progress;
        tSize = 0.05 * (0.35 + 0.65 * progress);
        tSpeed = 1;
        tUpBias = 0.02;
        tVentPull = 0.35 + (1 - progress) * 0.5; // suction ramps up
        break;
      }
      default: {
        // IDLE — dormant, particles hidden
        targetColor.copy(SMOKE_IDLE);
        break;
      }
    }

    /* ---------------- smooth toward targets ---------------- */
    s.color.lerp(targetColor, 1 - Math.exp(-DAMP * dt));
    s.opacity = THREE.MathUtils.damp(s.opacity, tOpacity, DAMP, dt);
    s.size = THREE.MathUtils.damp(s.size, tSize, DAMP, dt);
    s.speed = THREE.MathUtils.damp(s.speed, tSpeed, DAMP, dt);
    s.upBias = THREE.MathUtils.damp(s.upBias, tUpBias, DAMP, dt);
    s.ventPull = THREE.MathUtils.damp(s.ventPull, tVentPull, DAMP, dt);
    s.floorSpawnMix = THREE.MathUtils.damp(s.floorSpawnMix, tFloorSpawn, DAMP, dt);

    // fully hidden -> skip the simulation pass entirely
    if (s.opacity < 0.004) {
      if (matRef.current) matRef.current.opacity = 0;
      return;
    }

    /* ---------------- advect particles ---------------- */
    const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    const { toVent, p, randomSpawn, floorSpawn } = scratch;

    const respawn = (v: THREE.Vector3) => {
      randomSpawn.set(
        (Math.random() - 0.5) * (MODULE_SIZE.x - 0.6),
        (Math.random() - 0.5) * (MODULE_SIZE.y - 0.6),
        (Math.random() - 0.5) * (MODULE_SIZE.z - 0.6),
      );
      const r = Math.sqrt(Math.random()) * 0.9;
      const a = Math.random() * Math.PI * 2;
      floorSpawn.set(
        Math.cos(a) * r,
        -MODULE_SIZE.y / 2 + 0.1,
        Math.sin(a) * r,
      );
      // blend factor itself is smoothed, so spawn zones migrate gradually
      v.lerpVectors(randomSpawn, floorSpawn, s.floorSpawnMix);
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      p.set(arr[i3], arr[i3 + 1], arr[i3 + 2]);

      // ambient turbulence (scaled by the smoothed state speed)
      p.x += drifts[i3] * s.speed * dt;
      p.y += (drifts[i3 + 1] * s.speed + s.upBias) * dt;
      p.z += drifts[i3 + 2] * s.speed * dt;

      // shared suction vector toward the HVAC vent
      if (s.ventPull > 0.01) {
        toVent.copy(VENT_POS).sub(p);
        const dist = toVent.length();
        if (dist > 1e-4) {
          toVent.normalize().multiplyScalar(s.ventPull * dt * Math.min(dist, 1.5));
          p.add(toVent);
        }
        if (dist < 0.35) respawn(p); // captured by the vent
      }

      // ceiling / wall containment — recycle out-of-bounds particles
      if (
        p.y > MODULE_SIZE.y / 2 - 0.1 ||
        Math.abs(p.x) > MODULE_SIZE.x / 2 - 0.1 ||
        Math.abs(p.z) > MODULE_SIZE.z / 2 - 0.1
      ) {
        respawn(p);
      }

      arr[i3] = p.x;
      arr[i3 + 1] = p.y;
      arr[i3 + 2] = p.z;
    }
    posAttr.needsUpdate = true;

    /* ---------------- push smoothed values to the material ---------------- */
    if (matRef.current) {
      matRef.current.color.copy(s.color);
      matRef.current.opacity = s.opacity;
      matRef.current.size = s.size;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        color="#aab4bc"
        size={0.045}
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

function ScannerScene({ simulationState, tGrp, scrubTimer }: ThermalSmokeScanner3DProps) {
  const progress = scrubProgress(scrubTimer);
  return (
    <>
      <color attach="background" args={["#04060c"]} />
      <fog attach="fog" args={["#04060c", 12, 30]} />

      <ambientLight intensity={0.25} />
      <directionalLight position={[5, 8, 4]} intensity={0.6} />

      <Stars radius={60} depth={40} count={2500} factor={3} fade speed={0.4} />
      <OrbitControls makeDefault enableDamping autoRotate={false} />
      <Environment preset="night" />

      <ModuleFrame progress={progress} />
      <HvacVent progress={progress} />
      <SmokeParticles progress={progress} simulationState={simulationState} tGrp={tGrp} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Public component                                                   */
/* ------------------------------------------------------------------ */

export default function ThermalSmokeScanner3D({
  simulationState,
  tGrp,
  scrubTimer,
}: ThermalSmokeScanner3DProps) {
  return (
    <Canvas
      camera={{ position: [7.5, 4.5, 7.5], fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <ScannerScene simulationState={simulationState} tGrp={tGrp} scrubTimer={scrubTimer} />
    </Canvas>
  );
}
