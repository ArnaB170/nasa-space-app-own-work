module.exports = [
"[externals]/module [external] (module, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("module", () => require("module"));

module.exports = mod;
}),
"[project]/components/post-fire/PostFireClearanceDashboard.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PostFireClearanceDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
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
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$post$2d$fire$2f$ThermalSmokeScanner3D$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/post-fire/ThermalSmokeScanner3D.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
// ─── Physics constants ────────────────────────────────────────────────────────
/** ppm generated per second of burning, keyed by gas id. */ const GAS_RATES = {
    co: 2.5,
    hcn: 0.2,
    hcl: 0.3
};
/** Temperature rise per second of burning (°C/s). */ const TEMP_RATE = 0.5;
// ─── Safe initial telemetry (compartment nominal) ────────────────────────────
const SAFE_SEED = {
    gases: [
        {
            id: "co",
            name: "Carbon Monoxide",
            smac_1hr_ppm: 55,
            current_ppm: 2,
            hazard: "Hypoxia / Asphyxiation"
        },
        {
            id: "hcn",
            name: "Hydrogen Cyanide",
            smac_1hr_ppm: 4,
            current_ppm: 0.3,
            hazard: "Cellular Asphyxiation"
        },
        {
            id: "hcl",
            name: "Hydrogen Chloride",
            smac_1hr_ppm: 5,
            current_ppm: 0.2,
            hazard: "Acid Burn"
        }
    ],
    environment: {
        temperature_c: {
            safe_max: 27,
            current: 21.0
        },
        oxygen_percentage: {
            safe_min: 19.5,
            current: 20.9
        }
    }
};
// ─── Pure helpers ─────────────────────────────────────────────────────────────
function clamp(v, lo, hi) {
    return Math.min(Math.max(v, lo), hi);
}
function gasRatio(gas) {
    return clamp(gas.current_ppm / gas.smac_1hr_ppm, 0, 3) / 3;
}
function gasIsUnsafe(gas) {
    return gas.current_ppm > gas.smac_1hr_ppm;
}
function tempIsUnsafe(e) {
    return e.safe_max !== undefined && e.current > e.safe_max;
}
function o2IsUnsafe(e) {
    return e.safe_min !== undefined && e.current < e.safe_min;
}
function calcTGrp(gases) {
    return gases.reduce((acc, g)=>acc + g.current_ppm / g.smac_1hr_ppm, 0);
}
function calcStatus(tGrp, d) {
    return tGrp > 1.0 || tempIsUnsafe(d.environment.temperature_c) || o2IsUnsafe(d.environment.oxygen_percentage) ? "UNSAFE" : "SAFE";
}
function fmtTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}
/** Round to 2 decimal places, avoiding floating-point drift in display. */ function r2(n) {
    return Math.round(n * 100) / 100;
}
/**
 * Given the peak T_grp at the moment the fire is stopped, returns the number
 * of seconds the ECLSS must run to bring T_grp back to the safe threshold 1.0.
 * Formula: t = ceil( (peakTGrp - 1.0) / ECLSS_SCRUB_RATE )
 */ function calcScrubTime(peakTGrp) {
    return Math.ceil(Math.max(0, (peakTGrp - 1.0) / ECLSS_SCRUB_RATE));
}
// ─── Sub-components ───────────────────────────────────────────────────────────
/** Phase-aware simulation controls bar. */ function SimulationControls({ phase, fireDuration, calculatedScrubTime, scrubbing, onStartFire, onStopFire, onStartScrub }) {
    if (phase === "IDLE") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-semibold uppercase tracking-widest text-slate-500",
                            children: "Simulation Status"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 146,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-0.5 text-sm text-slate-400",
                            children: "Compartment nominal. All gases within SMAC limits."
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 145,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onStartFire,
                    className: "flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition hover:bg-red-500 active:scale-95",
                    children: "🔥 INITIATE LIVE FIRE"
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 149,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
            lineNumber: 144,
            columnNumber: 7
        }, this);
    }
    if (phase === "BURNING") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between rounded-xl border border-orange-700/60 bg-orange-950/40 px-6 py-5 shadow-[0_0_30px_rgba(251,146,60,0.15)]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex h-3 w-3 animate-ping rounded-full bg-orange-500"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 163,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-semibold uppercase tracking-widest text-orange-500",
                                    children: "🔥 Fire Active — Auto-generating toxins"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 165,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-0.5 text-2xl font-black tabular-nums text-orange-300",
                                    children: fmtTime(fireDuration)
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 166,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 164,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 162,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onStopFire,
                    className: "animate-pulse rounded-lg border border-orange-500 bg-orange-950 px-5 py-2.5 text-sm font-bold text-orange-400 transition hover:bg-orange-900 active:scale-95",
                    children: "🛑 STOP FIRE"
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 169,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
            lineNumber: 161,
            columnNumber: 7
        }, this);
    }
    // ASSESSMENT / SCRUBBING
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-semibold uppercase tracking-widest text-slate-500",
                                children: "Fire Contained"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-slate-200",
                                children: [
                                    "Fire suppressed after",
                                    " ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-black text-amber-400",
                                        children: [
                                            fireDuration,
                                            "s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 187,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 185,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onStartScrub,
                        disabled: scrubbing,
                        className: "shrink-0 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95",
                        children: scrubbing ? "⏳ Scrubbing…" : "💨 Initiate ECLSS Scrubbing"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 190,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 182,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-3 gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-4 py-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold uppercase tracking-wider text-slate-600",
                                children: "Burn Duration"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 201,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-lg font-black tabular-nums text-slate-300",
                                children: fmtTime(fireDuration)
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 202,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 200,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold uppercase tracking-wider text-slate-600",
                                children: "ECLSS Scrub Rate"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 205,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-lg font-black tabular-nums text-slate-300",
                                children: [
                                    "0.05 T",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("sub", {
                                        children: "grp"
                                    }, void 0, false, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 206,
                                        columnNumber: 86
                                    }, this),
                                    "/s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 206,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 204,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] font-bold uppercase tracking-wider text-amber-700",
                                children: "Calculated Scrub Time"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 209,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-lg font-black tabular-nums text-amber-400",
                                children: fmtTime(calculatedScrubTime)
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 210,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 208,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 199,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-600",
                children: [
                    "Formula: t = ⌈(T",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("sub", {
                        children: "grp_peak"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 214,
                        columnNumber: 25
                    }, this),
                    " − 1.0) ÷ 0.05⌉ s · Gas levels will decrease proportionally to reach SMAC limits exactly at t = 0."
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 213,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 181,
        columnNumber: 5
    }, this);
}
/** Clearance status banner — hidden during IDLE. */ function StatusBanner({ status, tGrp, phase }) {
    if (phase === "IDLE") return null;
    const isUnsafe = status === "UNSAFE";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-4 rounded-xl border px-6 py-4 ${isUnsafe ? "border-red-700 bg-red-950/70 shadow-[0_0_24px_rgba(239,68,68,0.25)]" : "border-emerald-700 bg-emerald-950/70 shadow-[0_0_24px_rgba(16,185,129,0.2)]"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `text-3xl ${isUnsafe ? "animate-pulse" : ""}`,
                children: isUnsafe ? "🚨" : "✅"
            }, void 0, false, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 235,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-lg font-extrabold tracking-widest uppercase ${isUnsafe ? "text-red-400" : "text-emerald-400"}`,
                        children: [
                            "Compartment Status: ",
                            status
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 239,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-xs text-slate-400",
                        children: isUnsafe ? "Readings exceed NASA 1-Hour SMAC limits. Re-entry prohibited." : "All readings within SMAC limits. Compartment cleared for re-entry."
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-right",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs uppercase tracking-wider text-slate-500",
                        children: "T-Group Index"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-2xl font-black tabular-nums ${isUnsafe ? "text-red-400" : "text-emerald-400"}`,
                        children: tGrp.toFixed(2)
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 250,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-600",
                        children: "limit: 1.00"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 253,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 230,
        columnNumber: 5
    }, this);
}
/** Read-only gas gauge — used in all phases. */ function GasGauge({ gas, phase }) {
    const unsafe = gasIsUnsafe(gas);
    const ratio = gasRatio(gas);
    const pct = Math.round(gas.current_ppm / gas.smac_1hr_ppm * 100);
    // Show per-second rate tag during BURNING
    const rate = GAS_RATES[gas.id];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-xl border p-5 ${unsafe ? "border-red-800/60 bg-red-950/30" : "border-emerald-800/60 bg-emerald-950/20"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-100",
                                children: gas.name
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 272,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-xs text-slate-500",
                                children: [
                                    gas.hazard,
                                    phase === "BURNING" && rate !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 font-semibold text-orange-500",
                                        children: [
                                            "+",
                                            rate,
                                            " ppm/s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 276,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 273,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 271,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${unsafe ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`,
                        children: unsafe ? "EXCEEDS SMAC" : "WITHIN SMAC"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 280,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 270,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex items-end justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-wider text-slate-500",
                                children: "Current"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 286,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-2xl font-black tabular-nums transition-colors ${unsafe ? "text-red-400" : "text-emerald-400"}`,
                                children: [
                                    r2(gas.current_ppm).toFixed(1),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-1 text-sm font-medium text-slate-500",
                                        children: "ppm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 289,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 287,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 285,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-wider text-slate-500",
                                children: "SMAC 1-Hr Limit"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 293,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-bold text-slate-300",
                                children: [
                                    gas.smac_1hr_ppm,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-1 text-sm font-medium text-slate-500",
                                        children: "ppm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 296,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 292,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 284,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative h-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `h-full rounded-full transition-all duration-500 ${unsafe ? "bg-red-500" : "bg-emerald-500"}`,
                            style: {
                                width: `${ratio * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 302,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-0 h-full w-0.5 bg-yellow-400",
                            style: {
                                left: `${1 / 3 * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 307,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 301,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 300,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1.5 text-right text-xs text-slate-500",
                children: [
                    pct,
                    "% of limit"
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 310,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 269,
        columnNumber: 5
    }, this);
}
/** Read-only environment card — used in all phases. */ function EnvironmentCard({ label, icon, current, limitLabel, limitValue, unit, unsafe, direction, rateTag }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-4 rounded-xl border p-5 ${unsafe ? "border-orange-800/60 bg-orange-950/30" : "border-emerald-800/60 bg-emerald-950/20"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-3xl",
                children: icon
            }, void 0, false, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 325,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-wider text-slate-500",
                        children: [
                            label,
                            rateTag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 font-bold text-orange-500",
                                children: rateTag
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 329,
                                columnNumber: 23
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 327,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-2xl font-black tabular-nums transition-colors ${unsafe ? "text-orange-400" : "text-emerald-400"}`,
                        children: [
                            current.toFixed(1),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 text-sm font-medium text-slate-500",
                                children: unit
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 332,
                                columnNumber: 31
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 331,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 326,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-right",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500",
                        children: limitLabel
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 336,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-bold text-slate-300",
                        children: [
                            limitValue,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 text-xs text-slate-500",
                                children: unit
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 337,
                                columnNumber: 69
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 337,
                        columnNumber: 9
                    }, this),
                    unsafe && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs font-semibold uppercase text-orange-400",
                        children: direction === "above" ? "▲ Too High" : "▼ Too Low"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 339,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 335,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 324,
        columnNumber: 5
    }, this);
}
function PostFireClearanceDashboard() {
    // ── Simulation phase ───────────────────────────────────────────────
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("IDLE");
    const [fireDuration, setFireDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    // ── Live telemetry ─────────────────────────────────────────────────
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(SAFE_SEED);
    // ── Derived values (recalculated on every render from data) ────────
    const tGrp = calcTGrp(data.gases);
    const status = calcStatus(tGrp, data);
    // ── ECLSS scrubbing ────────────────────────────────────────────────
    const [scrubbing, setScrubbing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [scrubTimer, setScrubTimer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [calculatedScrubTime, setCalcScrub] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    // ── Refs: intervals + snapshot storage ────────────────────────────
    const fireIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const scrubIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /** Mirrors scrubTimer for use inside interval callbacks (no stale closure). */ const scrubTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    /** Captures peak gas levels the instant STOP FIRE is pressed. */ const peakRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    /**
   * Always mirrors the latest committed `data` state.
   * Updated synchronously inside the fire-interval's setData callback so that
   * handleStopFire can read the exact peak values without using setData as a
   * "read" mechanism (which breaks under React Strict Mode's double-invoke).
   */ const latestDataRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(SAFE_SEED);
    // ── Phase: IDLE → BURNING ──────────────────────────────────────────
    const handleStartFire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        // Reset to safe levels before starting the drill
        latestDataRef.current = SAFE_SEED;
        setData(SAFE_SEED);
        setFireDuration(0);
        setScrubbing(false);
        setScrubTimer(0);
        scrubTimerRef.current = 0;
        peakRef.current = null;
        setPhase("BURNING");
        fireIntervalRef.current = setInterval(()=>{
            // Increment fire clock
            setFireDuration((d)=>d + 1);
            // Auto-generate toxic gas at physics rates.
            // We also keep latestDataRef in sync so handleStopFire can read peak
            // values directly without relying on setData as a read mechanism.
            setData((prev)=>{
                const next = {
                    ...prev,
                    gases: prev.gases.map((g)=>({
                            ...g,
                            current_ppm: r2(g.current_ppm + (GAS_RATES[g.id] ?? 0))
                        })),
                    environment: {
                        ...prev.environment,
                        temperature_c: {
                            ...prev.environment.temperature_c,
                            current: r2(prev.environment.temperature_c.current + TEMP_RATE)
                        }
                    }
                };
                latestDataRef.current = next; // always track the most recent state
                return next;
            });
        }, 1000);
    }, []);
    // ── Phase: BURNING → ASSESSMENT ───────────────────────────────────
    const handleStopFire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
        // latestDataRef.current is always current — updated inside the fire
        // interval's setData callback, never stale, never double-invoked.
        const peak = latestDataRef.current;
        const peakTGrp = calcTGrp(peak.gases);
        const scrubSecs = calcScrubTime(peakTGrp);
        peakRef.current = {
            gasPeaks: peak.gases.map((g)=>({
                    id: g.id,
                    peakPpm: g.current_ppm,
                    smacLimit: g.smac_1hr_ppm
                })),
            tempPeak: peak.environment.temperature_c.current,
            tempSafeMax: peak.environment.temperature_c.safe_max ?? 27,
            totalScrubTime: scrubSecs
        };
        scrubTimerRef.current = scrubSecs;
        setScrubTimer(scrubSecs);
        setCalcScrub(scrubSecs);
        setPhase("ASSESSMENT");
    }, []);
    // ── Phase: ASSESSMENT → SCRUBBING ─────────────────────────────────
    const handleStartScrub = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (scrubbing || !peakRef.current) return;
        const snap = peakRef.current;
        setScrubbing(true);
        scrubIntervalRef.current = setInterval(()=>{
            // Decrement the ref-based timer (avoids stale closure)
            scrubTimerRef.current -= 1;
            const remaining = scrubTimerRef.current;
            setScrubTimer(remaining);
            if (remaining <= 0) {
                // Scrubbing complete — snap everything exactly to safe limits
                clearInterval(scrubIntervalRef.current);
                setScrubbing(false);
                setData((prev)=>({
                        ...prev,
                        gases: prev.gases.map((g)=>{
                            const pk = snap.gasPeaks.find((p)=>p.id === g.id);
                            return pk ? {
                                ...g,
                                current_ppm: pk.smacLimit
                            } : g;
                        }),
                        environment: {
                            ...prev.environment,
                            temperature_c: {
                                ...prev.environment.temperature_c,
                                current: snap.tempSafeMax
                            }
                        }
                    }));
                return;
            }
            // Proportional decrement each tick:
            // Δppm = max(0, peak − smacLimit) / totalScrubTime
            // The Math.max(0, ...) guard prevents negative decrements: if a gas's
            // peak is still below its SMAC limit (short fire, T_grp driven by
            // additive toxicity rather than individual limits), the scrubber must
            // never increase that gas — it simply leaves it unchanged.
            setData((prev)=>({
                    ...prev,
                    gases: prev.gases.map((g)=>{
                        const pk = snap.gasPeaks.find((p)=>p.id === g.id);
                        if (!pk) return g;
                        const decrementPerSec = Math.max(0, pk.peakPpm - pk.smacLimit) / snap.totalScrubTime;
                        return {
                            ...g,
                            current_ppm: r2(Math.max(pk.smacLimit, g.current_ppm - decrementPerSec))
                        };
                    }),
                    environment: {
                        ...prev.environment,
                        temperature_c: {
                            ...prev.environment.temperature_c,
                            current: r2(Math.max(snap.tempSafeMax, prev.environment.temperature_c.current - Math.max(0, snap.tempPeak - snap.tempSafeMax) / snap.totalScrubTime))
                        }
                    }
                }));
        }, 1000);
    }, [
        scrubbing
    ]);
    // ── Cleanup on unmount ─────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        return ()=>{
            if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
            if (scrubIntervalRef.current) clearInterval(scrubIntervalRef.current);
        };
    }, []);
    // ── Derived scanner state (maps 3-phase + scrubbing bool → 4-state) ─
    const scannerState = scrubbing ? "SCRUBBING" : phase;
    // ── Render ─────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-950 px-4 py-10 font-sans text-slate-100",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-3xl space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-2xl",
                            children: "🔥"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 536,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-xl font-extrabold tracking-tight text-white",
                                    children: "Post-Fire Clearance Assessment"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 538,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-slate-500",
                                    children: "NASA 1-Hour SMAC Limits · ISS Environmental Baselines · Physics Simulation"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 541,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 537,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 535,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SimulationControls, {
                    phase: phase,
                    fireDuration: fireDuration,
                    calculatedScrubTime: calculatedScrubTime,
                    scrubbing: scrubbing,
                    onStartFire: handleStartFire,
                    onStopFire: handleStopFire,
                    onStartScrub: handleStartScrub
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 548,
                    columnNumber: 9
                }, this),
                scrubbing && scrubTimer > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between rounded-xl border border-amber-500/50 bg-amber-950/40 px-6 py-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-bold uppercase tracking-widest text-amber-500",
                                    children: "ECLSS Atmospheric Scrubbing in Progress"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 562,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-0.5 text-xs text-amber-700",
                                    children: "Gases decrementing proportionally → SMAC limits at t = 0"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 565,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 561,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-2xl font-black tabular-nums text-amber-400",
                            children: fmtTime(scrubTimer)
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 569,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 560,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBanner, {
                    status: status,
                    tGrp: tGrp,
                    phase: phase
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 576,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "overflow-hidden rounded-xl border border-slate-800 shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xs font-bold uppercase tracking-widest text-slate-400",
                                    children: "Live Volumetric Cabin Scan"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 581,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                            children: phase === "BURNING" ? "FIRE DETECTED" : scrubbing ? "ECLSS ACTIVE" : phase === "ASSESSMENT" ? "Post-Fire Scan" : "Feed Active"
                                        }, void 0, false, {
                                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                            lineNumber: 585,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `flex h-2 w-2 rounded-full ${phase === "BURNING" ? "animate-ping bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.9)]" : scrubbing ? "animate-pulse bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" : "animate-pulse bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`
                                        }, void 0, false, {
                                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                            lineNumber: 594,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 584,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 580,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-[400px] w-full bg-[#04060c]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$post$2d$fire$2f$ThermalSmokeScanner3D$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                simulationState: scannerState,
                                tGrp: tGrp,
                                scrubTimer: scrubTimer
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 604,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 603,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 579,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500",
                            children: "Atmospheric Contaminants"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 614,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4",
                            children: data.gases.map((gas)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GasGauge, {
                                    gas: gas,
                                    phase: phase
                                }, gas.id, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 619,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 617,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 613,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500",
                            children: "Environmental Conditions"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 626,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 sm:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EnvironmentCard, {
                                    label: "Compartment Temperature",
                                    icon: "🌡️",
                                    current: data.environment.temperature_c.current,
                                    limitLabel: "Safe Maximum",
                                    limitValue: data.environment.temperature_c.safe_max,
                                    unit: "°C",
                                    unsafe: tempIsUnsafe(data.environment.temperature_c),
                                    direction: "above",
                                    rateTag: phase === "BURNING" ? `+${TEMP_RATE}°C/s` : undefined
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 630,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EnvironmentCard, {
                                    label: "Oxygen Concentration",
                                    icon: "💨",
                                    current: data.environment.oxygen_percentage.current,
                                    limitLabel: "Safe Minimum",
                                    limitValue: data.environment.oxygen_percentage.safe_min,
                                    unit: "%",
                                    unsafe: o2IsUnsafe(data.environment.oxygen_percentage),
                                    direction: "below"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 640,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 629,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 625,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    className: "rounded-lg border border-slate-800 bg-slate-900/60 px-5 py-4 space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-semibold text-slate-400",
                            children: "Physics Reference (NASA-STD-3001 Vol. 1)"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 654,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "CO: +",
                                        GAS_RATES.co,
                                        " ppm/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 656,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "HCN: +",
                                        GAS_RATES.hcn,
                                        " ppm/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 657,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "HCl: +",
                                        GAS_RATES.hcl,
                                        " ppm/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 658,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "Temp: +",
                                        TEMP_RATE,
                                        " °C/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 659,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "ECLSS rate: ",
                                        ECLSS_SCRUB_RATE,
                                        " T",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("sub", {
                                            children: "grp"
                                        }, void 0, false, {
                                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                            lineNumber: 660,
                                            columnNumber: 51
                                        }, this),
                                        "/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 660,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "Scrub time = ⌈(T",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("sub", {
                                            children: "grp"
                                        }, void 0, false, {
                                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                            lineNumber: 661,
                                            columnNumber: 35
                                        }, this),
                                        " − 1.0) ÷ ",
                                        ECLSS_SCRUB_RATE,
                                        "⌉ s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 661,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 655,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 653,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
            lineNumber: 532,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 531,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/post-fire/ThermalSmokeScanner3D.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThermalSmokeScanner3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-9ce18a08.esm.js [app-ssr] (ecmascript) <export F as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Environment.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Stars$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Stars.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-ssr] (ecmascript)");
;
;
;
;
;
/* ------------------------------------------------------------------ */ /*  Constants                                                          */ /* ------------------------------------------------------------------ */ const TIMER_MAX = 300;
/** Module inner dimensions (a box roughly ISS-destiny-module shaped). */ const MODULE_SIZE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](6, 4, 4);
/** HVAC vent intake location, on the +X bulkhead, slightly above centre. */ const VENT_POS = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](MODULE_SIZE.x / 2 - 0.01, 0.6, 0);
const PARTICLE_COUNT = 1500;
const COLOR_HOT = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#ff2a1a"); // critical red
const COLOR_SAFE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#2a8fff"); // ambient blue
const SMOKE_SAFE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#22ff66"); // tGrp <= 1.0
const SMOKE_TOXIC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#ff2a1a"); // tGrp >= 3.0
const SMOKE_IDLE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#aab4bc"); // neutral grey
const FLAME_DEEP = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#ff7a00"); // orange
const FLAME_BRIGHT = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#ffd23f"); // yellow
/** Smoothing rate (higher = snappier) for state transitions. */ const DAMP = 3;
/* ------------------------------------------------------------------ */ /*  Helpers                                                            */ /* ------------------------------------------------------------------ */ /** clamp + normalise: 1 = full heat/smoke, 0 = scrubbed clean */ function scrubProgress(scrubTimer) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp(scrubTimer / TIMER_MAX, 0, 1);
}
/** Green (safe) -> Red (toxic) mapped from the toxicity index. */ function toxicityColor(tGrp, out) {
    const t = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].clamp((tGrp - 1.0) / 2.0, 0, 1); // 1.0 -> 0, 3.0 -> 1
    return out.lerpColors(SMOKE_SAFE, SMOKE_TOXIC, t);
}
/* ------------------------------------------------------------------ */ /*  Module wireframe with thermal colour lerp                          */ /* ------------------------------------------------------------------ */ function ModuleFrame({ progress }) {
    const wireMat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const frameMat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const edges = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EdgesGeometry"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BoxGeometry"](...MODULE_SIZE.toArray())), []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])(()=>{
        // Lerp critical red -> ambient blue as the timer counts down.
        const c = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]().lerpColors(COLOR_SAFE, COLOR_HOT, progress);
        if (wireMat.current) wireMat.current.color.copy(c);
        if (frameMat.current) frameMat.current.color.copy(c);
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: MODULE_SIZE.toArray()
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        ref: wireMat,
                        transparent: true,
                        opacity: 0.05,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BackSide"],
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                geometry: edges,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                    ref: frameMat,
                    linewidth: 1
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                    lineNumber: 99,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            [
                -2,
                0,
                2
            ].map((x)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    position: [
                        x,
                        0,
                        0
                    ],
                    rotation: [
                        0,
                        Math.PI / 2,
                        0
                    ],
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("torusGeometry", {
                            args: [
                                Math.min(MODULE_SIZE.y, MODULE_SIZE.z) / 2 - 0.05,
                                0.02,
                                8,
                                32
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 105,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                            color: "#445566",
                            transparent: true,
                            opacity: 0.4
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this)
                    ]
                }, x, true, {
                    fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                    lineNumber: 104,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("gridHelper", {
                args: [
                    MODULE_SIZE.x,
                    6,
                    "#334455",
                    "#223344"
                ],
                position: [
                    0,
                    -MODULE_SIZE.y / 2 + 0.001,
                    0
                ]
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /*  HVAC vent grate on the +X bulkhead                                 */ /* ------------------------------------------------------------------ */ function HvacVent({ progress }) {
    const glow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])(({ clock })=>{
        // gentle pulsing suction glow while smoke remains
        if (glow.current) {
            glow.current.intensity = 2 + progress * 6 + Math.sin(clock.elapsedTime * 4) * progress * 2;
        }
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: VENT_POS.toArray(),
        rotation: [
            0,
            Math.PI / 2,
            0
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            1.4,
                            1.4,
                            0.08
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                        color: "#1a2530",
                        metalness: 0.7,
                        roughness: 0.4
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 141,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 139,
                columnNumber: 7
            }, this),
            [
                -0.45,
                -0.15,
                0.15,
                0.45
            ].map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    position: [
                        0,
                        y,
                        0.06
                    ],
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                            args: [
                                1.2,
                                0.12,
                                0.05
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 147,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                            color: "#0af0ff",
                            emissive: "#0af0ff",
                            emissiveIntensity: 0.6 + progress * 1.4,
                            metalness: 0.5,
                            roughness: 0.3
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 148,
                            columnNumber: 11
                        }, this)
                    ]
                }, y, true, {
                    fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                    lineNumber: 146,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    0,
                    0.1
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ringGeometry", {
                        args: [
                            0.75,
                            0.85,
                            32
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#0af0ff",
                        transparent: true,
                        opacity: 0.35 + progress * 0.4,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["DoubleSide"]
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                ref: glow,
                color: "#0af0ff",
                distance: 6,
                decay: 2
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 137,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /*  Smoke / fire particle system (BufferGeometry + Points)             */ /* ------------------------------------------------------------------ */ function SmokeParticles({ progress, simulationState, tGrp }) {
    const pointsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const matRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const { positions, drifts } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const drifts = new Float32Array(PARTICLE_COUNT * 3);
        for(let i = 0; i < PARTICLE_COUNT; i++){
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
        return {
            positions,
            drifts
        };
    }, []);
    const geometry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const g = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferGeometry"]();
        g.setAttribute("position", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BufferAttribute"](positions, 3));
        return g;
    }, [
        positions
    ]);
    // scratch objects, allocated once
    const scratch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            toVent: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
            p: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
            randomSpawn: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
            floorSpawn: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Vector3"](),
            targetColor: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#aab4bc")
        }), []);
    /**
   * Smoothed live values — every visual/kinematic parameter eases toward
   * its per-state target each frame, so transitions never hard-snap.
   */ const smooth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({
        color: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Color"]("#aab4bc"),
        opacity: 0,
        size: 0.045,
        speed: 1,
        upBias: 0.02,
        ventPull: 0,
        floorSpawnMix: 0
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])(({ clock }, delta)=>{
        const dt = Math.min(delta, 0.05); // clamp against tab-switch spikes
        const s = smooth.current;
        const { targetColor } = scratch;
        /* ---------------- per-state targets ---------------- */ let tOpacity = 0;
        let tSize = 0.045;
        let tSpeed = 1;
        let tUpBias = 0.02;
        let tVentPull = 0;
        let tFloorSpawn = 0;
        switch(simulationState){
            case "BURNING":
                {
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
            case "ASSESSMENT":
                {
                    // room fills with smoke tinted by the live toxicity index
                    toxicityColor(tGrp, targetColor);
                    tOpacity = 0.5;
                    tSize = 0.05;
                    tSpeed = 1;
                    tUpBias = 0.02;
                    tVentPull = 0.08; // faint background airflow
                    break;
                }
            case "SCRUBBING":
                {
                    // same toxicity tint, but ECLSS fades/shrinks smoke as timer -> 0
                    toxicityColor(tGrp, targetColor);
                    tOpacity = 0.5 * progress;
                    tSize = 0.05 * (0.35 + 0.65 * progress);
                    tSpeed = 1;
                    tUpBias = 0.02;
                    tVentPull = 0.35 + (1 - progress) * 0.5; // suction ramps up
                    break;
                }
            default:
                {
                    // IDLE — dormant, particles hidden
                    targetColor.copy(SMOKE_IDLE);
                    break;
                }
        }
        /* ---------------- smooth toward targets ---------------- */ s.color.lerp(targetColor, 1 - Math.exp(-DAMP * dt));
        s.opacity = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.opacity, tOpacity, DAMP, dt);
        s.size = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.size, tSize, DAMP, dt);
        s.speed = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.speed, tSpeed, DAMP, dt);
        s.upBias = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.upBias, tUpBias, DAMP, dt);
        s.ventPull = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.ventPull, tVentPull, DAMP, dt);
        s.floorSpawnMix = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.floorSpawnMix, tFloorSpawn, DAMP, dt);
        // fully hidden -> skip the simulation pass entirely
        if (s.opacity < 0.004) {
            if (matRef.current) matRef.current.opacity = 0;
            return;
        }
        /* ---------------- advect particles ---------------- */ const posAttr = geometry.getAttribute("position");
        const arr = posAttr.array;
        const { toVent, p, randomSpawn, floorSpawn } = scratch;
        const respawn = (v)=>{
            randomSpawn.set((Math.random() - 0.5) * (MODULE_SIZE.x - 0.6), (Math.random() - 0.5) * (MODULE_SIZE.y - 0.6), (Math.random() - 0.5) * (MODULE_SIZE.z - 0.6));
            const r = Math.sqrt(Math.random()) * 0.9;
            const a = Math.random() * Math.PI * 2;
            floorSpawn.set(Math.cos(a) * r, -MODULE_SIZE.y / 2 + 0.1, Math.sin(a) * r);
            // blend factor itself is smoothed, so spawn zones migrate gradually
            v.lerpVectors(randomSpawn, floorSpawn, s.floorSpawnMix);
        };
        for(let i = 0; i < PARTICLE_COUNT; i++){
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
            if (p.y > MODULE_SIZE.y / 2 - 0.1 || Math.abs(p.x) > MODULE_SIZE.x / 2 - 0.1 || Math.abs(p.z) > MODULE_SIZE.z / 2 - 0.1) {
                respawn(p);
            }
            arr[i3] = p.x;
            arr[i3 + 1] = p.y;
            arr[i3 + 2] = p.z;
        }
        posAttr.needsUpdate = true;
        /* ---------------- push smoothed values to the material ---------------- */ if (matRef.current) {
            matRef.current.color.copy(s.color);
            matRef.current.opacity = s.opacity;
            matRef.current.size = s.size;
        }
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
        ref: pointsRef,
        geometry: geometry,
        frustumCulled: false,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("pointsMaterial", {
            ref: matRef,
            color: "#aab4bc",
            size: 0.045,
            transparent: true,
            opacity: 0,
            sizeAttenuation: true,
            depthWrite: false,
            blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["NormalBlending"]
        }, void 0, false, {
            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
            lineNumber: 377,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 376,
        columnNumber: 5
    }, this);
}
/* ------------------------------------------------------------------ */ /*  Scene                                                              */ /* ------------------------------------------------------------------ */ function ScannerScene({ simulationState, tGrp, scrubTimer }) {
    const progress = scrubProgress(scrubTimer);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("color", {
                attach: "background",
                args: [
                    "#04060c"
                ]
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 399,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("fog", {
                attach: "fog",
                args: [
                    "#04060c",
                    12,
                    30
                ]
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 400,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: 0.25
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 402,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    5,
                    8,
                    4
                ],
                intensity: 0.6
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 403,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Stars$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Stars"], {
                radius: 60,
                depth: 40,
                count: 2500,
                factor: 3,
                fade: true,
                speed: 0.4
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 405,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["OrbitControls"], {
                makeDefault: true,
                enableDamping: true,
                autoRotate: false
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 406,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Environment"], {
                preset: "night"
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 407,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ModuleFrame, {
                progress: progress
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 409,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HvacVent, {
                progress: progress
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 410,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SmokeParticles, {
                progress: progress,
                simulationState: simulationState,
                tGrp: tGrp
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 411,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 398,
        columnNumber: 5
    }, this);
}
function ThermalSmokeScanner3D({ simulationState, tGrp, scrubTimer }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
        camera: {
            position: [
                7.5,
                4.5,
                7.5
            ],
            fov: 45
        },
        gl: {
            antialias: true,
            alpha: false
        },
        dpr: [
            1,
            2
        ],
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ScannerScene, {
            simulationState: simulationState,
            tGrp: tGrp,
            scrubTimer: scrubTimer
        }, void 0, false, {
            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
            lineNumber: 431,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 426,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1tr74f_._.js.map