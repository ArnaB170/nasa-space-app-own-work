"use client";

/**
 * PostFireClearanceDashboard
 *
 * Physics-based 3-phase fire simulation:
 *   IDLE       → compartment nominal, safe gas levels
 *   BURNING    → gases auto-generate at rated ppm/s; T_grp climbs live
 *   ASSESSMENT → fire stopped; ECLSS scrub time calculated from peak T_grp
 *   SCRUBBING  → gases decrement proportionally; timer counts to 0
 *
 * Physics constants (NASA-STD-3001 / ISS ECLSS reference):
 *   CO  rate : +2.5 ppm/s      ECLSS scrub rate : 0.05 T_grp/s
 *   HCN rate : +0.2 ppm/s      Scrub time = ceil((peak_Tgrp - 1.0) / 0.05)
 *   HCl rate : +0.3 ppm/s      Gases decrement proportionally to hit SMAC
 *   Temp rate: +0.5 °C/s       exactly when scrubTimer reaches 0
 */

import { useCallback, useEffect, useRef, useState } from "react";
import ThermalSmokeScanner3D, { SimulationState } from "./ThermalSmokeScanner3D";

// ─── Types ────────────────────────────────────────────────────────────────────

// SimulationState ("IDLE"|"BURNING"|"ASSESSMENT"|"SCRUBBING") is imported from
// ThermalSmokeScanner3D. The dashboard's own phase uses the first three.
type DashboardPhase = "IDLE" | "BURNING" | "ASSESSMENT";
type ClearanceStatus = "UNSAFE" | "SAFE";

interface Gas {
  id: string;
  name: string;
  smac_1hr_ppm: number;
  current_ppm: number;
  hazard: string;
}

interface EnvironmentReading {
  safe_max?: number;
  safe_min?: number;
  current: number;
}

interface SmacData {
  gases: Gas[];
  environment: {
    temperature_c: EnvironmentReading;
    oxygen_percentage: EnvironmentReading;
  };
}

/** Snapshot captured the instant STOP FIRE is pressed. */
interface PeakSnapshot {
  gasPeaks: Array<{ id: string; peakPpm: number; smacLimit: number }>;
  tempPeak: number;
  tempSafeMax: number;
  totalScrubTime: number; // seconds, pre-calculated
}

// ─── Physics constants ────────────────────────────────────────────────────────

/** ppm generated per second of burning, keyed by gas id. */
const GAS_RATES: Record<string, number> = { co: 2.5, hcn: 0.2, hcl: 0.3 };

/** Temperature rise per second of burning (°C/s). */
const TEMP_RATE = 0.5;

// ─── Safe initial telemetry (compartment nominal) ────────────────────────────

const SAFE_SEED: SmacData = {
  gases: [
    { id: "co",  name: "Carbon Monoxide",   smac_1hr_ppm: 55, current_ppm: 2,   hazard: "Hypoxia / Asphyxiation" },
    { id: "hcn", name: "Hydrogen Cyanide",  smac_1hr_ppm: 4,  current_ppm: 0.3, hazard: "Cellular Asphyxiation" },
    { id: "hcl", name: "Hydrogen Chloride", smac_1hr_ppm: 5,  current_ppm: 0.2, hazard: "Acid Burn" },
  ],
  environment: {
    temperature_c:     { safe_max: 27,   current: 21.0 },
    oxygen_percentage: { safe_min: 19.5, current: 20.9 },
  },
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

function gasRatio(gas: Gas) {
  return clamp(gas.current_ppm / gas.smac_1hr_ppm, 0, 3) / 3;
}

function gasIsUnsafe(gas: Gas)              { return gas.current_ppm > gas.smac_1hr_ppm; }
function tempIsUnsafe(e: EnvironmentReading){ return e.safe_max !== undefined && e.current > e.safe_max; }
function o2IsUnsafe(e: EnvironmentReading)  { return e.safe_min !== undefined && e.current < e.safe_min; }

function calcTGrp(gases: Gas[]) {
  return gases.reduce((acc, g) => acc + g.current_ppm / g.smac_1hr_ppm, 0);
}

function calcStatus(tGrp: number, d: SmacData): ClearanceStatus {
  return tGrp > 1.0 || tempIsUnsafe(d.environment.temperature_c) ||
    o2IsUnsafe(d.environment.oxygen_percentage) ? "UNSAFE" : "SAFE";
}

function fmtTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Round to 2 decimal places, avoiding floating-point drift in display. */
function r2(n: number) { return Math.round(n * 100) / 100; }

/**
 * Given the peak T_grp at the moment the fire is stopped, returns the number
 * of seconds the ECLSS must run to bring T_grp back to the safe threshold 1.0.
 * Formula: t = ceil( (peakTGrp - 1.0) / ECLSS_SCRUB_RATE )
 */
function calcScrubTime(peakTGrp: number): number {
  return Math.ceil(Math.max(0, (peakTGrp - 1.0) / ECLSS_SCRUB_RATE));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Phase-aware simulation controls bar. */
function SimulationControls({
  phase,
  fireDuration,
  calculatedScrubTime,
  scrubbing,
  onStartFire,
  onStopFire,
  onStartScrub,
}: {
  phase: DashboardPhase;
  fireDuration: number;
  calculatedScrubTime: number;
  scrubbing: boolean;
  onStartFire: () => void;
  onStopFire: () => void;
  onStartScrub: () => void;
}) {
  if (phase === "IDLE") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Simulation Status</p>
          <p className="mt-0.5 text-sm text-slate-400">Compartment nominal. All gases within SMAC limits.</p>
        </div>
        <button
          onClick={onStartFire}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition hover:bg-red-500 active:scale-95"
        >
          🔥 INITIATE LIVE FIRE
        </button>
      </div>
    );
  }

  if (phase === "BURNING") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-orange-700/60 bg-orange-950/40 px-6 py-5 shadow-[0_0_30px_rgba(251,146,60,0.15)]">
        <div className="flex items-center gap-4">
          <span className="flex h-3 w-3 animate-ping rounded-full bg-orange-500" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">🔥 Fire Active — Auto-generating toxins</p>
            <p className="mt-0.5 text-2xl font-black tabular-nums text-orange-300">{fmtTime(fireDuration)}</p>
          </div>
        </div>
        <button
          onClick={onStopFire}
          className="animate-pulse rounded-lg border border-orange-500 bg-orange-950 px-5 py-2.5 text-sm font-bold text-orange-400 transition hover:bg-orange-900 active:scale-95"
        >
          🛑 STOP FIRE
        </button>
      </div>
    );
  }

  // ASSESSMENT / SCRUBBING
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Fire Contained</p>
          <p className="mt-0.5 text-slate-200">
            Fire suppressed after{" "}
            <span className="font-black text-amber-400">{fireDuration}s</span>
          </p>
        </div>
        <button
          onClick={onStartScrub}
          disabled={scrubbing}
          className="shrink-0 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
        >
          {scrubbing ? "⏳ Scrubbing…" : "💨 Initiate ECLSS Scrubbing"}
        </button>
      </div>
      {/* Calculated scrub time display */}
      <div className="grid grid-cols-3 gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Burn Duration</p>
          <p className="mt-0.5 text-lg font-black tabular-nums text-slate-300">{fmtTime(fireDuration)}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">ECLSS Scrub Rate</p>
          <p className="mt-0.5 text-lg font-black tabular-nums text-slate-300">0.05 T<sub>grp</sub>/s</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Calculated Scrub Time</p>
          <p className="mt-0.5 text-lg font-black tabular-nums text-amber-400">{fmtTime(calculatedScrubTime)}</p>
        </div>
      </div>
      <p className="text-xs text-slate-600">
        Formula: t = ⌈(T<sub>grp_peak</sub> − 1.0) ÷ 0.05⌉ s · Gas levels will decrease
        proportionally to reach SMAC limits exactly at t = 0.
      </p>
    </div>
  );
}

/** Clearance status banner — hidden during IDLE. */
function StatusBanner({
  status, tGrp, phase,
}: {
  status: ClearanceStatus; tGrp: number; phase: DashboardPhase;
}) {
  if (phase === "IDLE") return null;
  const isUnsafe = status === "UNSAFE";
  return (
    <div className={`flex items-center gap-4 rounded-xl border px-6 py-4 ${
      isUnsafe
        ? "border-red-700 bg-red-950/70 shadow-[0_0_24px_rgba(239,68,68,0.25)]"
        : "border-emerald-700 bg-emerald-950/70 shadow-[0_0_24px_rgba(16,185,129,0.2)]"
    }`}>
      <span className={`text-3xl ${isUnsafe ? "animate-pulse" : ""}`}>
        {isUnsafe ? "🚨" : "✅"}
      </span>
      <div className="flex-1">
        <p className={`text-lg font-extrabold tracking-widest uppercase ${isUnsafe ? "text-red-400" : "text-emerald-400"}`}>
          Compartment Status: {status}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">
          {isUnsafe
            ? "Readings exceed NASA 1-Hour SMAC limits. Re-entry prohibited."
            : "All readings within SMAC limits. Compartment cleared for re-entry."}
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs uppercase tracking-wider text-slate-500">T-Group Index</p>
        <p className={`text-2xl font-black tabular-nums ${isUnsafe ? "text-red-400" : "text-emerald-400"}`}>
          {tGrp.toFixed(2)}
        </p>
        <p className="text-xs text-slate-600">limit: 1.00</p>
      </div>
    </div>
  );
}

/** Read-only gas gauge — used in all phases. */
function GasGauge({ gas, phase }: { gas: Gas; phase: DashboardPhase }) {
  const unsafe = gasIsUnsafe(gas);
  const ratio  = gasRatio(gas);
  const pct    = Math.round((gas.current_ppm / gas.smac_1hr_ppm) * 100);

  // Show per-second rate tag during BURNING
  const rate = GAS_RATES[gas.id];

  return (
    <div className={`rounded-xl border p-5 ${unsafe ? "border-red-800/60 bg-red-950/30" : "border-emerald-800/60 bg-emerald-950/20"}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-100">{gas.name}</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            {gas.hazard}
            {phase === "BURNING" && rate !== undefined && (
              <span className="ml-2 font-semibold text-orange-500">+{rate} ppm/s</span>
            )}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${unsafe ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>
          {unsafe ? "EXCEEDS SMAC" : "WITHIN SMAC"}
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Current</p>
          <p className={`text-2xl font-black tabular-nums transition-colors ${unsafe ? "text-red-400" : "text-emerald-400"}`}>
            {r2(gas.current_ppm).toFixed(1)}
            <span className="ml-1 text-sm font-medium text-slate-500">ppm</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">SMAC 1-Hr Limit</p>
          <p className="text-lg font-bold text-slate-300">
            {gas.smac_1hr_ppm}
            <span className="ml-1 text-sm font-medium text-slate-500">ppm</span>
          </p>
        </div>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60">
        <div className="relative h-full">
          <div
            className={`h-full rounded-full transition-all duration-500 ${unsafe ? "bg-red-500" : "bg-emerald-500"}`}
            style={{ width: `${ratio * 100}%` }}
          />
          {/* Yellow SMAC threshold marker at 1× limit */}
          <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${(1 / 3) * 100}%` }} />
        </div>
      </div>
      <p className="mt-1.5 text-right text-xs text-slate-500">{pct}% of limit</p>
    </div>
  );
}

/** Read-only environment card — used in all phases. */
function EnvironmentCard({
  label, icon, current, limitLabel, limitValue, unit, unsafe, direction, rateTag,
}: {
  label: string; icon: string; current: number; limitLabel: string;
  limitValue: number; unit: string; unsafe: boolean;
  direction: "above" | "below"; rateTag?: string;
}) {
  return (
    <div className={`flex items-center gap-4 rounded-xl border p-5 ${unsafe ? "border-orange-800/60 bg-orange-950/30" : "border-emerald-800/60 bg-emerald-950/20"}`}>
      <span className="text-3xl">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
          {rateTag && <span className="ml-2 font-bold text-orange-500">{rateTag}</span>}
        </p>
        <p className={`text-2xl font-black tabular-nums transition-colors ${unsafe ? "text-orange-400" : "text-emerald-400"}`}>
          {current.toFixed(1)}<span className="ml-1 text-sm font-medium text-slate-500">{unit}</span>
        </p>
      </div>
      <div className="text-right">
        <p className="text-xs text-slate-500">{limitLabel}</p>
        <p className="text-sm font-bold text-slate-300">{limitValue}<span className="ml-1 text-xs text-slate-500">{unit}</span></p>
        {unsafe && (
          <p className="mt-1 text-xs font-semibold uppercase text-orange-400">
            {direction === "above" ? "▲ Too High" : "▼ Too Low"}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PostFireClearanceDashboard() {

  // ── Simulation phase ───────────────────────────────────────────────
  const [phase, setPhase]               = useState<DashboardPhase>("IDLE");
  const [fireDuration, setFireDuration] = useState<number>(0);

  // ── Live telemetry ─────────────────────────────────────────────────
  const [data, setData] = useState<SmacData>(SAFE_SEED);

  // ── Derived values (recalculated on every render from data) ────────
  const tGrp   = calcTGrp(data.gases);
  const status  = calcStatus(tGrp, data);

  // ── ECLSS scrubbing ────────────────────────────────────────────────
  const [scrubbing, setScrubbing]             = useState<boolean>(false);
  const [scrubTimer, setScrubTimer]           = useState<number>(0);
  const [calculatedScrubTime, setCalcScrub]   = useState<number>(0);

  // ── Refs: intervals + snapshot storage ────────────────────────────
  const fireIntervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrubIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Mirrors scrubTimer for use inside interval callbacks (no stale closure). */
  const scrubTimerRef    = useRef<number>(0);
  /** Captures peak gas levels the instant STOP FIRE is pressed. */
  const peakRef          = useRef<PeakSnapshot | null>(null);
  /**
   * Always mirrors the latest committed `data` state.
   * Updated synchronously inside the fire-interval's setData callback so that
   * handleStopFire can read the exact peak values without using setData as a
   * "read" mechanism (which breaks under React Strict Mode's double-invoke).
   */
  const latestDataRef    = useRef<SmacData>(SAFE_SEED);

  // ── Phase: IDLE → BURNING ──────────────────────────────────────────
  const handleStartFire = useCallback(() => {
    // Reset to safe levels before starting the drill
    latestDataRef.current = SAFE_SEED;
    setData(SAFE_SEED);
    setFireDuration(0);
    setScrubbing(false);
    setScrubTimer(0);
    scrubTimerRef.current = 0;
    peakRef.current = null;
    setPhase("BURNING");

    fireIntervalRef.current = setInterval(() => {
      // Increment fire clock
      setFireDuration((d) => d + 1);

      // Auto-generate toxic gas at physics rates.
      // We also keep latestDataRef in sync so handleStopFire can read peak
      // values directly without relying on setData as a read mechanism.
      setData((prev) => {
        const next: SmacData = {
          ...prev,
          gases: prev.gases.map((g) => ({
            ...g,
            current_ppm: r2(g.current_ppm + (GAS_RATES[g.id] ?? 0)),
          })),
          environment: {
            ...prev.environment,
            temperature_c: {
              ...prev.environment.temperature_c,
              current: r2(prev.environment.temperature_c.current + TEMP_RATE),
            },
          },
        };
        latestDataRef.current = next; // always track the most recent state
        return next;
      });
    }, 1000);
  }, []);

  // ── Phase: BURNING → ASSESSMENT ───────────────────────────────────
  const handleStopFire = useCallback(() => {
    if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);

    // latestDataRef.current is always current — updated inside the fire
    // interval's setData callback, never stale, never double-invoked.
    const peak = latestDataRef.current;
    const peakTGrp = calcTGrp(peak.gases);
    const scrubSecs = calcScrubTime(peakTGrp);

    peakRef.current = {
      gasPeaks: peak.gases.map((g) => ({
        id: g.id,
        peakPpm:   g.current_ppm,
        smacLimit: g.smac_1hr_ppm,
      })),
      tempPeak:       peak.environment.temperature_c.current,
      tempSafeMax:    peak.environment.temperature_c.safe_max ?? 27,
      totalScrubTime: scrubSecs,
    };

    scrubTimerRef.current = scrubSecs;
    setScrubTimer(scrubSecs);
    setCalcScrub(scrubSecs);
    setPhase("ASSESSMENT");
  }, []);

  // ── Phase: ASSESSMENT → SCRUBBING ─────────────────────────────────
  const handleStartScrub = useCallback(() => {
    if (scrubbing || !peakRef.current) return;
    const snap = peakRef.current;
    setScrubbing(true);

    scrubIntervalRef.current = setInterval(() => {
      // Decrement the ref-based timer (avoids stale closure)
      scrubTimerRef.current -= 1;
      const remaining = scrubTimerRef.current;
      setScrubTimer(remaining);

      if (remaining <= 0) {
        // Scrubbing complete — snap everything exactly to safe limits
        clearInterval(scrubIntervalRef.current!);
        setScrubbing(false);
        setData((prev) => ({
          ...prev,
          gases: prev.gases.map((g) => {
            const pk = snap.gasPeaks.find((p) => p.id === g.id);
            return pk ? { ...g, current_ppm: pk.smacLimit } : g;
          }),
          environment: {
            ...prev.environment,
            temperature_c: {
              ...prev.environment.temperature_c,
              current: snap.tempSafeMax,
            },
          },
        }));
        return;
      }

      // Proportional decrement each tick:
      // Δppm = max(0, peak − smacLimit) / totalScrubTime
      // The Math.max(0, ...) guard prevents negative decrements: if a gas's
      // peak is still below its SMAC limit (short fire, T_grp driven by
      // additive toxicity rather than individual limits), the scrubber must
      // never increase that gas — it simply leaves it unchanged.
      setData((prev) => ({
        ...prev,
        gases: prev.gases.map((g) => {
          const pk = snap.gasPeaks.find((p) => p.id === g.id);
          if (!pk) return g;
          const decrementPerSec =
            Math.max(0, pk.peakPpm - pk.smacLimit) / snap.totalScrubTime;
          return {
            ...g,
            current_ppm: r2(Math.max(pk.smacLimit, g.current_ppm - decrementPerSec)),
          };
        }),
        environment: {
          ...prev.environment,
          temperature_c: {
            ...prev.environment.temperature_c,
            current: r2(
              Math.max(
                snap.tempSafeMax,
                prev.environment.temperature_c.current -
                  Math.max(0, snap.tempPeak - snap.tempSafeMax) / snap.totalScrubTime,
              ),
            ),
          },
        },
      }));
    }, 1000);
  }, [scrubbing]);

  // ── Cleanup on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (fireIntervalRef.current)  clearInterval(fireIntervalRef.current);
      if (scrubIntervalRef.current) clearInterval(scrubIntervalRef.current);
    };
  }, []);

  // ── Derived scanner state (maps 3-phase + scrubbing bool → 4-state) ─
  const scannerState: SimulationState = scrubbing ? "SCRUBBING" : phase;

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 font-sans text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ── Page Header ── */}
        <header className="flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white">
              Post-Fire Clearance Assessment
            </h1>
            <p className="text-xs text-slate-500">
              NASA 1-Hour SMAC Limits · ISS Environmental Baselines · Physics Simulation
            </p>
          </div>
        </header>

        {/* ── Simulation Controls ── */}
        <SimulationControls
          phase={phase}
          fireDuration={fireDuration}
          calculatedScrubTime={calculatedScrubTime}
          scrubbing={scrubbing}
          onStartFire={handleStartFire}
          onStopFire={handleStopFire}
          onStartScrub={handleStartScrub}
        />

        {/* ── ECLSS scrubbing countdown ── */}
        {scrubbing && scrubTimer > 0 && (
          <div className="flex items-center justify-between rounded-xl border border-amber-500/50 bg-amber-950/40 px-6 py-4">
            <div>
              <p className="font-bold uppercase tracking-widest text-amber-500">
                ECLSS Atmospheric Scrubbing in Progress
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Gases decrementing proportionally → SMAC limits at t = 0
              </p>
            </div>
            <span className="text-2xl font-black tabular-nums text-amber-400">
              {fmtTime(scrubTimer)}
            </span>
          </div>
        )}

        {/* ── Clearance Status Banner ── */}
        <StatusBanner status={status} tGrp={tGrp} phase={phase} />

        {/* ── 3D Volumetric Thermal Scan ── */}
        <section className="overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Live Volumetric Cabin Scan
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {phase === "BURNING"
                  ? "FIRE DETECTED"
                  : scrubbing
                    ? "ECLSS ACTIVE"
                    : phase === "ASSESSMENT"
                      ? "Post-Fire Scan"
                      : "Feed Active"}
              </span>
              <span className={`flex h-2 w-2 rounded-full ${
                phase === "BURNING"
                  ? "animate-ping bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.9)]"
                  : scrubbing
                    ? "animate-pulse bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"
                    : "animate-pulse bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              }`} />
            </div>
          </div>
          <div className="h-[400px] w-full bg-[#04060c]">
            <ThermalSmokeScanner3D
              simulationState={scannerState}
              tGrp={tGrp}
              scrubTimer={scrubTimer}
            />
          </div>
        </section>

        {/* ── Atmospheric Contaminants ── */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Atmospheric Contaminants
          </h2>
          <div className="grid gap-4">
            {data.gases.map((gas) => (
              <GasGauge key={gas.id} gas={gas} phase={phase} />
            ))}
          </div>
        </section>

        {/* ── Environmental Conditions ── */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Environmental Conditions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <EnvironmentCard
              label="Compartment Temperature" icon="🌡️"
              current={data.environment.temperature_c.current}
              limitLabel="Safe Maximum"
              limitValue={data.environment.temperature_c.safe_max!}
              unit="°C"
              unsafe={tempIsUnsafe(data.environment.temperature_c)}
              direction="above"
              rateTag={phase === "BURNING" ? `+${TEMP_RATE}°C/s` : undefined}
            />
            <EnvironmentCard
              label="Oxygen Concentration" icon="💨"
              current={data.environment.oxygen_percentage.current}
              limitLabel="Safe Minimum"
              limitValue={data.environment.oxygen_percentage.safe_min!}
              unit="%"
              unsafe={o2IsUnsafe(data.environment.oxygen_percentage)}
              direction="below"
            />
          </div>
        </section>

        {/* ── Physics Reference Footer ── */}
        <footer className="rounded-lg border border-slate-800 bg-slate-900/60 px-5 py-4 space-y-1">
          <p className="text-xs font-semibold text-slate-400">Physics Reference (NASA-STD-3001 Vol. 1)</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600">
            <span>CO: +{GAS_RATES.co} ppm/s</span>
            <span>HCN: +{GAS_RATES.hcn} ppm/s</span>
            <span>HCl: +{GAS_RATES.hcl} ppm/s</span>
            <span>Temp: +{TEMP_RATE} °C/s</span>
            <span>ECLSS rate: {ECLSS_SCRUB_RATE} T<sub>grp</sub>/s</span>
            <span>Scrub time = ⌈(T<sub>grp</sub> − 1.0) ÷ {ECLSS_SCRUB_RATE}⌉ s</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
