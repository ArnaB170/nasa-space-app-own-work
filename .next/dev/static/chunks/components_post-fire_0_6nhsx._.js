(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/post-fire/PostFireClearanceDashboard.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PostFireClearanceDashboard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * PostFireClearanceDashboard
 *
 * Physics-based 3-phase fire simulation:
 *   IDLE       → compartment nominal, safe gas levels
 *   BURNING    → gases auto-generate at rated ppm/s; T_grp climbs live
 *   ASSESSMENT → fire stopped; peak readings locked; reset available
 *
 * Physics constants (NASA-STD-3001):
 *   CO  rate : +2.5 ppm/s
 *   HCN rate : +0.2 ppm/s
 *   HCl rate : +0.3 ppm/s
 *   Temp rate: +0.5 °C/s
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$post$2d$fire$2f$ThermalSmokeScanner3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/post-fire/ThermalSmokeScanner3D.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
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
// ─── Sub-components ───────────────────────────────────────────────────────────
/** Phase-aware simulation controls bar. */ function SimulationControls({ phase, fireDuration, onStartFire, onStopFire, onReset }) {
    if (phase === "IDLE") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/30 px-6 py-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-semibold uppercase tracking-widest text-slate-500",
                            children: "Simulation Status"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 123,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-0.5 text-sm text-slate-400",
                            children: "Compartment nominal. All gases within SMAC limits."
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 122,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onStartFire,
                    className: "flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] transition hover:bg-red-500 active:scale-95",
                    children: "🔥 INITIATE LIVE FIRE"
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 126,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
            lineNumber: 121,
            columnNumber: 7
        }, this);
    }
    if (phase === "BURNING") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between rounded-xl border border-orange-700/60 bg-orange-950/40 px-6 py-5 shadow-[0_0_30px_rgba(251,146,60,0.15)]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex h-3 w-3 animate-ping rounded-full bg-orange-500"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 140,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-semibold uppercase tracking-widest text-orange-500",
                                    children: "🔥 Fire Active — Auto-generating toxins"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 142,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-0.5 text-2xl font-black tabular-nums text-orange-300",
                                    children: fmtTime(fireDuration)
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 143,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 141,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 139,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: onStopFire,
                    className: "animate-pulse rounded-lg border border-orange-500 bg-orange-950 px-5 py-2.5 text-sm font-bold text-orange-400 transition hover:bg-orange-900 active:scale-95",
                    children: "🛑 STOP FIRE"
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 146,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
            lineNumber: 138,
            columnNumber: 7
        }, this);
    }
    // ASSESSMENT — locked peak readings, reset available
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-widest text-slate-500",
                        children: "Fire Contained"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-slate-200",
                        children: [
                            "Fire suppressed after",
                            " ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-black text-amber-400",
                                children: [
                                    fireDuration,
                                    "s"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this),
                            " ",
                            "· Peak readings locked below."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 161,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 159,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: onReset,
                className: "shrink-0 rounded-lg border border-slate-600 bg-slate-800 px-5 py-2.5 text-sm font-bold text-slate-300 transition hover:bg-slate-700 hover:text-white active:scale-95",
                children: "🔄 RESET SIMULATION"
            }, void 0, false, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 158,
        columnNumber: 5
    }, this);
}
_c = SimulationControls;
/** Clearance status banner — hidden during IDLE. */ function StatusBanner({ status, tGrp, phase }) {
    if (phase === "IDLE") return null;
    const isUnsafe = status === "UNSAFE";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-4 rounded-xl border px-6 py-4 ${isUnsafe ? "border-red-700 bg-red-950/70 shadow-[0_0_24px_rgba(239,68,68,0.25)]" : "border-emerald-700 bg-emerald-950/70 shadow-[0_0_24px_rgba(16,185,129,0.2)]"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `text-3xl ${isUnsafe ? "animate-pulse" : ""}`,
                children: isUnsafe ? "🚨" : "✅"
            }, void 0, false, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-lg font-extrabold tracking-widest uppercase ${isUnsafe ? "text-red-400" : "text-emerald-400"}`,
                        children: [
                            "Compartment Status: ",
                            status
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-0.5 text-xs text-slate-400",
                        children: isUnsafe ? "Readings exceed NASA 1-Hour SMAC limits. Re-entry prohibited." : "All readings within SMAC limits. Compartment cleared for re-entry."
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 198,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-right",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs uppercase tracking-wider text-slate-500",
                        children: "T-Group Index"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 205,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-2xl font-black tabular-nums ${isUnsafe ? "text-red-400" : "text-emerald-400"}`,
                        children: tGrp.toFixed(2)
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-600",
                        children: "limit: 1.00"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 209,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 204,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 186,
        columnNumber: 5
    }, this);
}
_c1 = StatusBanner;
/** Read-only gas gauge — used in all phases. */ function GasGauge({ gas, phase }) {
    const unsafe = gasIsUnsafe(gas);
    const ratio = gasRatio(gas);
    const pct = Math.round(gas.current_ppm / gas.smac_1hr_ppm * 100);
    const rate = GAS_RATES[gas.id];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-xl border p-5 ${unsafe ? "border-red-800/60 bg-red-950/30" : "border-emerald-800/60 bg-emerald-950/20"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-sm font-bold text-slate-100",
                                children: gas.name
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 226,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-0.5 text-xs text-slate-500",
                                children: [
                                    gas.hazard,
                                    phase === "BURNING" && rate !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 font-semibold text-orange-500",
                                        children: [
                                            "+",
                                            rate,
                                            " ppm/s"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 230,
                                        columnNumber: 15
                                    }, this),
                                    phase === "ASSESSMENT" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 font-semibold text-slate-600",
                                        children: "Peak"
                                    }, void 0, false, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 233,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 225,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${unsafe ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`,
                        children: unsafe ? "EXCEEDS SMAC" : "WITHIN SMAC"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 237,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 224,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 flex items-end justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-wider text-slate-500",
                                children: "Current"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 243,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: `text-2xl font-black tabular-nums transition-colors ${unsafe ? "text-red-400" : "text-emerald-400"}`,
                                children: [
                                    r2(gas.current_ppm).toFixed(1),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-1 text-sm font-medium text-slate-500",
                                        children: "ppm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 246,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 244,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs uppercase tracking-wider text-slate-500",
                                children: "SMAC 1-Hr Limit"
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 250,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-bold text-slate-300",
                                children: [
                                    gas.smac_1hr_ppm,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-1 text-sm font-medium text-slate-500",
                                        children: "ppm"
                                    }, void 0, false, {
                                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                        lineNumber: 253,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 251,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-700/60",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative h-full",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `h-full rounded-full transition-all duration-500 ${unsafe ? "bg-red-500" : "bg-emerald-500"}`,
                            style: {
                                width: `${ratio * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 259,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-0 h-full w-0.5 bg-yellow-400",
                            style: {
                                left: `${1 / 3 * 100}%`
                            }
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 264,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 258,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 257,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1.5 text-right text-xs text-slate-500",
                children: [
                    pct,
                    "% of limit"
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 267,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 223,
        columnNumber: 5
    }, this);
}
_c2 = GasGauge;
/** Read-only environment card — used in all phases. */ function EnvironmentCard({ label, icon, current, limitLabel, limitValue, unit, unsafe, direction, rateTag }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center gap-4 rounded-xl border p-5 ${unsafe ? "border-orange-800/60 bg-orange-950/30" : "border-emerald-800/60 bg-emerald-950/20"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-3xl",
                children: icon
            }, void 0, false, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 282,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-wider text-slate-500",
                        children: [
                            label,
                            rateTag && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-2 font-bold text-orange-500",
                                children: rateTag
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 286,
                                columnNumber: 23
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 284,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-2xl font-black tabular-nums transition-colors ${unsafe ? "text-orange-400" : "text-emerald-400"}`,
                        children: [
                            current.toFixed(1),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 text-sm font-medium text-slate-500",
                                children: unit
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 289,
                                columnNumber: 31
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 288,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 283,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-right",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500",
                        children: limitLabel
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 293,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-bold text-slate-300",
                        children: [
                            limitValue,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "ml-1 text-xs text-slate-500",
                                children: unit
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 294,
                                columnNumber: 69
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 294,
                        columnNumber: 9
                    }, this),
                    unsafe && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs font-semibold uppercase text-orange-400",
                        children: direction === "above" ? "▲ Too High" : "▼ Too Low"
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                        lineNumber: 296,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                lineNumber: 292,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 281,
        columnNumber: 5
    }, this);
}
_c3 = EnvironmentCard;
function PostFireClearanceDashboard() {
    _s();
    // ── Simulation phase ──────────────────────────────────────────────
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("IDLE");
    const [fireDuration, setFireDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // ── Live telemetry (auto-increments during BURNING, locked in ASSESSMENT) ─
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(SAFE_SEED);
    // ── Derived values ────────────────────────────────────────────────
    const tGrp = calcTGrp(data.gases);
    const status = calcStatus(tGrp, data);
    // ── Refs ──────────────────────────────────────────────────────────
    const fireIntervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    /**
   * Always mirrors the latest committed `data` state inside the fire interval.
   * Lets handleStopFire read peak values without using setData as a read
   * mechanism (which is unsafe under React Strict Mode's double-invoke).
   */ const latestDataRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(SAFE_SEED);
    // ── Phase: IDLE → BURNING ─────────────────────────────────────────
    const handleStartFire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PostFireClearanceDashboard.useCallback[handleStartFire]": ()=>{
            latestDataRef.current = SAFE_SEED;
            setData(SAFE_SEED);
            setFireDuration(0);
            setPhase("BURNING");
            fireIntervalRef.current = setInterval({
                "PostFireClearanceDashboard.useCallback[handleStartFire]": ()=>{
                    setFireDuration({
                        "PostFireClearanceDashboard.useCallback[handleStartFire]": (d)=>d + 1
                    }["PostFireClearanceDashboard.useCallback[handleStartFire]"]);
                    setData({
                        "PostFireClearanceDashboard.useCallback[handleStartFire]": (prev)=>{
                            const next = {
                                ...prev,
                                gases: prev.gases.map({
                                    "PostFireClearanceDashboard.useCallback[handleStartFire]": (g)=>({
                                            ...g,
                                            current_ppm: r2(g.current_ppm + (GAS_RATES[g.id] ?? 0))
                                        })
                                }["PostFireClearanceDashboard.useCallback[handleStartFire]"]),
                                environment: {
                                    ...prev.environment,
                                    temperature_c: {
                                        ...prev.environment.temperature_c,
                                        current: r2(prev.environment.temperature_c.current + TEMP_RATE)
                                    }
                                }
                            };
                            latestDataRef.current = next;
                            return next;
                        }
                    }["PostFireClearanceDashboard.useCallback[handleStartFire]"]);
                }
            }["PostFireClearanceDashboard.useCallback[handleStartFire]"], 1000);
        }
    }["PostFireClearanceDashboard.useCallback[handleStartFire]"], []);
    // ── Phase: BURNING → ASSESSMENT (data freezes at peak) ───────────
    const handleStopFire = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PostFireClearanceDashboard.useCallback[handleStopFire]": ()=>{
            if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
            // Data stays exactly as-is — the gauges are now showing peak readings.
            setPhase("ASSESSMENT");
        }
    }["PostFireClearanceDashboard.useCallback[handleStopFire]"], []);
    // ── Phase: ASSESSMENT → IDLE (full reset) ────────────────────────
    const handleReset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PostFireClearanceDashboard.useCallback[handleReset]": ()=>{
            if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
            latestDataRef.current = SAFE_SEED;
            setData(SAFE_SEED);
            setFireDuration(0);
            setPhase("IDLE");
        }
    }["PostFireClearanceDashboard.useCallback[handleReset]"], []);
    // ── Cleanup on unmount ────────────────────────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PostFireClearanceDashboard.useEffect": ()=>{
            return ({
                "PostFireClearanceDashboard.useEffect": ()=>{
                    if (fireIntervalRef.current) clearInterval(fireIntervalRef.current);
                }
            })["PostFireClearanceDashboard.useEffect"];
        }
    }["PostFireClearanceDashboard.useEffect"], []);
    // ── Render ────────────────────────────────────────────────────────
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-950 px-4 py-10 font-sans text-slate-100",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-3xl space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "flex items-center gap-3",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-2xl",
                            children: "🔥"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 390,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-xl font-extrabold tracking-tight text-white",
                                    children: "Post-Fire Clearance Assessment"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 392,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-slate-500",
                                    children: "NASA 1-Hour SMAC Limits · ISS Environmental Baselines · Physics Simulation"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 395,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 391,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 389,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SimulationControls, {
                    phase: phase,
                    fireDuration: fireDuration,
                    onStartFire: handleStartFire,
                    onStopFire: handleStopFire,
                    onReset: handleReset
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 402,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatusBanner, {
                    status: status,
                    tGrp: tGrp,
                    phase: phase
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 411,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "overflow-hidden rounded-xl border border-slate-800 shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-5 py-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-xs font-bold uppercase tracking-widest text-slate-400",
                                    children: "Live Volumetric Cabin Scan"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 416,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-bold uppercase tracking-wider text-slate-500",
                                            children: phase === "BURNING" ? "FIRE DETECTED" : phase === "ASSESSMENT" ? "Post-Fire Scan" : "Feed Active"
                                        }, void 0, false, {
                                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                            lineNumber: 420,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `flex h-2 w-2 rounded-full ${phase === "BURNING" ? "animate-ping bg-orange-500 shadow-[0_0_8px_rgba(251,146,60,0.9)]" : "animate-pulse bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"}`
                                        }, void 0, false, {
                                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                            lineNumber: 423,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 419,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 415,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-[400px] w-full bg-[#04060c]",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$post$2d$fire$2f$ThermalSmokeScanner3D$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                simulationState: phase,
                                tGrp: tGrp
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                lineNumber: 431,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 430,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 414,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500",
                            children: [
                                "Atmospheric Contaminants",
                                phase === "ASSESSMENT" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500",
                                    children: "🔒 PEAK LOCKED"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 443,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 440,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4",
                            children: data.gases.map((gas)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GasGauge, {
                                    gas: gas,
                                    phase: phase
                                }, gas.id, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 450,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 448,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 439,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500",
                            children: [
                                "Environmental Conditions",
                                phase === "ASSESSMENT" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-500",
                                    children: "🔒 PEAK LOCKED"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 460,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 457,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 sm:grid-cols-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EnvironmentCard, {
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
                                    lineNumber: 466,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EnvironmentCard, {
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
                                    lineNumber: 476,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 465,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 456,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    className: "rounded-lg border border-slate-800 bg-slate-900/60 px-5 py-4 space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs font-semibold text-slate-400",
                            children: "Physics Reference (NASA-STD-3001 Vol. 1)"
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 490,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "CO: +",
                                        GAS_RATES.co,
                                        " ppm/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 492,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "HCN: +",
                                        GAS_RATES.hcn,
                                        " ppm/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 493,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "HCl: +",
                                        GAS_RATES.hcl,
                                        " ppm/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 494,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: [
                                        "Temp: +",
                                        TEMP_RATE,
                                        " °C/s"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 495,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "T-Group limit: 1.00 (additive toxicity index)"
                                }, void 0, false, {
                                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                                    lineNumber: 496,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                            lineNumber: 491,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
                    lineNumber: 489,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
            lineNumber: 386,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/post-fire/PostFireClearanceDashboard.tsx",
        lineNumber: 385,
        columnNumber: 5
    }, this);
}
_s(PostFireClearanceDashboard, "VYNr5Vg4gJ2zvlhPhgJo/cLAAN4=");
_c4 = PostFireClearanceDashboard;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "SimulationControls");
__turbopack_context__.k.register(_c1, "StatusBanner");
__turbopack_context__.k.register(_c2, "GasGauge");
__turbopack_context__.k.register(_c3, "EnvironmentCard");
__turbopack_context__.k.register(_c4, "PostFireClearanceDashboard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/post-fire/ThermalSmokeScanner3D.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ThermalSmokeScanner3D
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-9ce18a08.esm.js [app-client] (ecmascript) <export F as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Environment.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Stars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Stars.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/OrbitControls.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
;
;
;
;
/* ------------------------------------------------------------------ */ /*  Constants                                                         */ /* ------------------------------------------------------------------ */ /** Module inner dimensions (a box roughly ISS-destiny-module shaped). */ const MODULE_SIZE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](6, 4, 4);
const HALF = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](MODULE_SIZE.x / 2, MODULE_SIZE.y / 2, MODULE_SIZE.z / 2);
/** HVAC vent intake location, on the +X bulkhead, slightly above centre. */ const VENT_POS = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](MODULE_SIZE.x / 2 - 0.01, 0.6, 0);
/** Where the fire burns: centre of the module floor. */ const FIRE_POS = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](0, -MODULE_SIZE.y / 2 + 0.02, 0);
const PARTICLE_COUNT = 2500;
const EMBER_COUNT = 250;
const FRAME_SAFE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#2a8fff"); // ambient blue
const FRAME_TOXIC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#ff2a1a"); // critical red
const SMOKE_SAFE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#22ff66"); // tGrp <= 1.0
const SMOKE_TOXIC = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#ff2a1a"); // tGrp >= 3.0
const SMOKE_IDLE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#aab4bc"); // neutral grey
/** Smoothing rate (higher = snappier) for state transitions. */ const DAMP = 3;
/* ------------------------------------------------------------------ */ /*  Helpers                                                           */ /* ------------------------------------------------------------------ */ /** 0 at tGrp <= 1.0 (safe), 1 at tGrp >= 3.0 (critical). */ function toxicityFactor(tGrp) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp((tGrp - 1.0) / 2.0, 0, 1);
}
/** Green (safe) -> Red (toxic) mapped from the toxicity index. */ function toxicityColor(tGrp, out) {
    return out.lerpColors(SMOKE_SAFE, SMOKE_TOXIC, toxicityFactor(tGrp));
}
/**
 * Soft radial-gradient sprite generated on an HTML5 canvas — no external
 * asset needed. White core fading to transparent edge.
 */ function createParticleTexture() {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0.0, "rgba(255,255,255,1.0)");
    gradient.addColorStop(0.25, "rgba(255,255,255,0.85)");
    gradient.addColorStop(0.55, "rgba(255,255,255,0.30)");
    gradient.addColorStop(1.0, "rgba(255,255,255,0.0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const texture = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CanvasTexture"](canvas);
    texture.needsUpdate = true;
    return texture;
}
/* ------------------------------------------------------------------ */ /*  GLSL — procedural fire (fbm noise shaped into flames)             */ /* ------------------------------------------------------------------ */ const fireVertexShader = /* glsl */ `
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
/* ------------------------------------------------------------------ */ /*  Volumetric fire: crossed shader planes + hot core + firelight      */ /* ------------------------------------------------------------------ */ function FireEffect({ simulationState }) {
    _s();
    const groupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const lightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const light2Ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const coreRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const coreMat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const intensity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const uniforms = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FireEffect.useMemo[uniforms]": ()=>({
                uTime: {
                    value: 0
                },
                uIntensity: {
                    value: 0
                },
                uColorDeep: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#c1120f")
                },
                uColorMid: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#ff7a00")
                },
                uColorTip: {
                    value: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#ffe066")
                }
            })
    }["FireEffect.useMemo[uniforms]"], []);
    const planes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FireEffect.useMemo[planes]": ()=>{
            const geo = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PlaneGeometry"](2.4, 2.2, 1, 1);
            return [
                0,
                Math.PI / 4,
                Math.PI / 2,
                3 * Math.PI / 4
            ].map({
                "FireEffect.useMemo[planes]": (rotY)=>[
                        geo,
                        rotY
                    ]
            }["FireEffect.useMemo[planes]"]);
        }
    }["FireEffect.useMemo[planes]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])({
        "FireEffect.useFrame": ({ clock }, delta)=>{
            const dt = Math.min(delta, 0.05);
            const t = clock.elapsedTime;
            const target = simulationState === "BURNING" ? 1 : 0;
            intensity.current = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(intensity.current, target, 4, dt);
            uniforms.uTime.value = t;
            uniforms.uIntensity.value = intensity.current;
            const g = groupRef.current;
            if (!g) return;
            g.visible = intensity.current > 0.01;
            const flicker = 0.75 + 0.25 * Math.sin(t * 11) * Math.sin(t * 5.7 + 1.3) + 0.1 * Math.sin(t * 23);
            const I = intensity.current * flicker;
            if (lightRef.current) {
                lightRef.current.intensity = 14 * I;
                lightRef.current.position.set(FIRE_POS.x + Math.sin(t * 7) * 0.15, FIRE_POS.y + 0.8, FIRE_POS.z + Math.cos(t * 6) * 0.15);
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
        }
    }["FireEffect.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: FIRE_POS.toArray(),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                ref: groupRef,
                children: [
                    planes.map(([geo, rotY], i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                            geometry: geo,
                            rotation: [
                                0,
                                rotY,
                                0
                            ],
                            position: [
                                0,
                                1.05,
                                0
                            ],
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("shaderMaterial", {
                                vertexShader: fireVertexShader,
                                fragmentShader: fireFragmentShader,
                                uniforms: uniforms,
                                transparent: true,
                                depthWrite: false,
                                blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"],
                                side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                                lineNumber: 232,
                                columnNumber: 13
                            }, this)
                        }, i, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 231,
                            columnNumber: 11
                        }, this)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                        ref: coreRef,
                        position: [
                            0,
                            0.12,
                            0
                        ],
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("icosahedronGeometry", {
                                args: [
                                    0.34,
                                    2
                                ]
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                                lineNumber: 245,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                                ref: coreMat,
                                color: "#ffd9a0",
                                transparent: true,
                                opacity: 0,
                                blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"],
                                depthWrite: false
                            }, void 0, false, {
                                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                                lineNumber: 246,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 244,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 229,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                ref: lightRef,
                color: "#ff8c3b",
                distance: 12,
                decay: 2,
                position: [
                    0,
                    0.9,
                    0
                ],
                intensity: 0
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 257,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                ref: light2Ref,
                color: "#ff3300",
                distance: 7,
                decay: 2,
                position: [
                    0,
                    0.35,
                    0
                ],
                intensity: 0
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 265,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 228,
        columnNumber: 5
    }, this);
}
_s(FireEffect, "ORJUsDjAi4r6nm2xN6bsYA90qLA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"]
    ];
});
_c = FireEffect;
/* ------------------------------------------------------------------ */ /*  Ember sparks                                                       */ /* ------------------------------------------------------------------ */ function EmberSparks({ simulationState }) {
    _s1();
    const matRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const intensity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const { geometry, seeds } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "EmberSparks.useMemo": ()=>{
            const positions = new Float32Array(EMBER_COUNT * 3);
            const seeds = new Float32Array(EMBER_COUNT * 2);
            for(let i = 0; i < EMBER_COUNT; i++){
                seeds[i * 2] = Math.random();
                seeds[i * 2 + 1] = 0.6 + Math.random() * 1.4;
            }
            const g = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
            g.setAttribute("position", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](positions, 3));
            return {
                geometry: g,
                seeds
            };
        }
    }["EmberSparks.useMemo"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])({
        "EmberSparks.useFrame": ({ clock }, delta)=>{
            const dt = Math.min(delta, 0.05);
            const t = clock.elapsedTime;
            const target = simulationState === "BURNING" ? 1 : 0;
            intensity.current = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(intensity.current, target, 4, dt);
            if (matRef.current) matRef.current.opacity = intensity.current;
            const attr = geometry.getAttribute("position");
            const arr = attr.array;
            for(let i = 0; i < EMBER_COUNT; i++){
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
        }
    }["EmberSparks.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
        geometry: geometry,
        frustumCulled: false,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointsMaterial", {
            ref: matRef,
            color: "#ffcc66",
            size: 0.045,
            transparent: true,
            opacity: 0,
            sizeAttenuation: true,
            depthWrite: false,
            blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"]
        }, void 0, false, {
            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
            lineNumber: 323,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 322,
        columnNumber: 5
    }, this);
}
_s1(EmberSparks, "ZQLgbTujIKiZuBy/124NpnZcRkE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"]
    ];
});
_c1 = EmberSparks;
/* ------------------------------------------------------------------ */ /*  Module wireframe (unchanged)                                       */ /* ------------------------------------------------------------------ */ function ModuleFrame({ simulationState, tGrp }) {
    _s2();
    const wireMat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const frameMat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const liveColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#2a8fff"));
    const target = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ModuleFrame.useMemo[target]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]()
    }["ModuleFrame.useMemo[target]"], []);
    const edges = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "ModuleFrame.useMemo[edges]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EdgesGeometry"](new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BoxGeometry"](...MODULE_SIZE.toArray()))
    }["ModuleFrame.useMemo[edges]"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])({
        "ModuleFrame.useFrame": (_, delta)=>{
            const dt = Math.min(delta, 0.05);
            if (simulationState === "BURNING") {
                target.copy(FRAME_TOXIC);
            } else {
                target.lerpColors(FRAME_SAFE, FRAME_TOXIC, toxicityFactor(tGrp));
            }
            liveColor.current.lerp(target, 1 - Math.exp(-DAMP * dt));
            if (wireMat.current) wireMat.current.color.copy(liveColor.current);
            if (frameMat.current) frameMat.current.color.copy(liveColor.current);
        }
    }["ModuleFrame.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: MODULE_SIZE.toArray()
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 373,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        ref: wireMat,
                        transparent: true,
                        opacity: 0.05,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BackSide"],
                        depthWrite: false
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 374,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 372,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineSegments", {
                geometry: edges,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("lineBasicMaterial", {
                    ref: frameMat,
                    linewidth: 1
                }, void 0, false, {
                    fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                    lineNumber: 383,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 382,
                columnNumber: 7
            }, this),
            [
                -2,
                0,
                2
            ].map((x)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("torusGeometry", {
                            args: [
                                Math.min(MODULE_SIZE.y, MODULE_SIZE.z) / 2 - 0.05,
                                0.02,
                                8,
                                32
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 387,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                            color: "#445566",
                            transparent: true,
                            opacity: 0.4
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 390,
                            columnNumber: 11
                        }, this)
                    ]
                }, x, true, {
                    fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                    lineNumber: 386,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("gridHelper", {
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
                lineNumber: 393,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 371,
        columnNumber: 5
    }, this);
}
_s2(ModuleFrame, "U5pPp+MvnOcNjKswgEGqcEYgxj8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"]
    ];
});
_c2 = ModuleFrame;
/* ------------------------------------------------------------------ */ /*  HVAC vent (unchanged)                                              */ /* ------------------------------------------------------------------ */ function HvacVent() {
    _s3();
    const glow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])({
        "HvacVent.useFrame": ({ clock })=>{
            if (glow.current) {
                glow.current.intensity = 3 + Math.sin(clock.elapsedTime * 4) * 1.5;
            }
        }
    }["HvacVent.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
        position: VENT_POS.toArray(),
        rotation: [
            0,
            Math.PI / 2,
            0
        ],
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                        args: [
                            1.4,
                            1.4,
                            0.08
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 415,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                        color: "#1a2530",
                        metalness: 0.7,
                        roughness: 0.4
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 416,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 414,
                columnNumber: 7
            }, this),
            [
                -0.45,
                -0.15,
                0.15,
                0.45
            ].map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                    position: [
                        0,
                        y,
                        0.06
                    ],
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("boxGeometry", {
                            args: [
                                1.2,
                                0.12,
                                0.05
                            ]
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 420,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshStandardMaterial", {
                            color: "#0af0ff",
                            emissive: "#0af0ff",
                            emissiveIntensity: 1.2,
                            metalness: 0.5,
                            roughness: 0.3
                        }, void 0, false, {
                            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                            lineNumber: 421,
                            columnNumber: 11
                        }, this)
                    ]
                }, y, true, {
                    fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                    lineNumber: 419,
                    columnNumber: 9
                }, this)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                position: [
                    0,
                    0,
                    0.1
                ],
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ringGeometry", {
                        args: [
                            0.75,
                            0.85,
                            32
                        ]
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 431,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshBasicMaterial", {
                        color: "#0af0ff",
                        transparent: true,
                        opacity: 0.5,
                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DoubleSide"]
                    }, void 0, false, {
                        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                        lineNumber: 432,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 430,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                ref: glow,
                color: "#0af0ff",
                distance: 6,
                decay: 2
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 439,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 413,
        columnNumber: 5
    }, this);
}
_s3(HvacVent, "HmCosR6sJduk04vZ+9H/tDsAluQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"]
    ];
});
_c3 = HvacVent;
/* ------------------------------------------------------------------ */ /*  Smoke + fire column particles                                      */ /*                                                                     */ /*  BURNING:        particles spawn at the fire, flicker upward in a   */ /*                  convection column and gather into a thick layer    */ /*                  at the ceiling.                                    */ /*                                                                     */ /*  ASSESSMENT /    particles drift EVERYWHERE inside the module —     */ /*  SCRUBBING:      full 3D wandering on X, Y and Z, respawning at     */ /*                  random points so the whole volume stays filled.    */ /* ------------------------------------------------------------------ */ /** Height at which particles stop rising and begin to gather. */ const CEILING_Y = HALF.y - 0.12;
/** Gathering zone = top 10% of module height. */ const GATHER_START_Y = CEILING_Y - MODULE_SIZE.y * 0.1;
/* Height-based colour ramp: white -> yellow -> orange -> dark smoke. */ const RAMP_WHITE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#fff6d8");
const RAMP_YELLOW = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#ffd23f");
const RAMP_ORANGE = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#ff7a00");
const SMOKE_DARK = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#101318");
/** Slightly luminous slate so the gathered layer reads under additive blending. */ const SMOKE_THICK = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]("#7c8590");
function SmokeParticles({ simulationState, tGrp }) {
    _s4();
    const matRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const texture = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SmokeParticles.useMemo[texture]": ()=>createParticleTexture()
    }["SmokeParticles.useMemo[texture]"], []);
    /* ---------------- particle buffers ---------------- */ const { geometry, drifts, seeds, linger, alphas } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SmokeParticles.useMemo": ()=>{
            const positions = new Float32Array(PARTICLE_COUNT * 3);
            const colors = new Float32Array(PARTICLE_COUNT * 3);
            const drifts = new Float32Array(PARTICLE_COUNT * 3);
            const seeds = new Float32Array(PARTICLE_COUNT);
            const linger = new Float32Array(PARTICLE_COUNT);
            const alphas = new Float32Array(PARTICLE_COUNT).fill(1);
            for(let i = 0; i < PARTICLE_COUNT; i++){
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * (MODULE_SIZE.x - 0.4);
                positions[i3 + 1] = (Math.random() - 0.5) * (MODULE_SIZE.y - 0.4);
                positions[i3 + 2] = (Math.random() - 0.5) * (MODULE_SIZE.z - 0.4);
                drifts[i3] = (Math.random() - 0.5) * 0.12;
                drifts[i3 + 1] = (Math.random() - 0.5) * 0.12;
                drifts[i3 + 2] = (Math.random() - 0.5) * 0.12;
                seeds[i] = Math.random() * 100;
            }
            const g = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferGeometry"]();
            g.setAttribute("position", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](positions, 3));
            g.setAttribute("color", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](colors, 3));
            g.setAttribute("aAlpha", new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BufferAttribute"](alphas, 1));
            return {
                geometry: g,
                drifts,
                seeds,
                linger,
                alphas
            };
        }
    }["SmokeParticles.useMemo"], []);
    const scratch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SmokeParticles.useMemo[scratch]": ()=>({
                p: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
                randomSpawn: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
                fireSpawn: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vector3"](),
                c: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](),
                c2: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](),
                tint: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"]()
            })
    }["SmokeParticles.useMemo[scratch]"], []);
    /**
   * Smoothed live values — every visual/kinematic parameter eases toward
   * its per-state target each frame, so transitions never hard-snap.
   */ const smooth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        opacity: 0,
        size: 0.05,
        speed: 1,
        upBias: 0.02,
        fireSpawnMix: 0
    });
    /* Inject a per-particle alpha attribute into the PointsMaterial shader. */ const attachMaterial = (mat)=>{
        if (!mat || matRef.current === mat) return;
        matRef.current = mat;
        mat.onBeforeCompile = (shader)=>{
            shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nattribute float aAlpha;\nvarying float vAlpha;").replace("#include <fog_vertex>", "#include <fog_vertex>\nvAlpha = aAlpha;");
            shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\nvarying float vAlpha;").replace("#include <opaque_fragment>", "diffuseColor.a *= vAlpha;\n#include <opaque_fragment>");
        };
        mat.customProgramCacheKey = ()=>"smoke-aalpha-v1";
        mat.needsUpdate = true;
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"])({
        "SmokeParticles.useFrame": ({ clock }, delta)=>{
            const dt = Math.min(delta, 0.05); // clamp against tab-switch spikes
            const t = clock.elapsedTime;
            const s = smooth.current;
            const { p, randomSpawn, fireSpawn, c, c2, tint } = scratch;
            /* ---------------- per-state targets (unchanged state machine) ------ */ let tOpacity = 0;
            let tSize = 0.05;
            let tSpeed = 1;
            let tUpBias = 0.02;
            let tFireSpawn = 0;
            switch(simulationState){
                case "BURNING":
                    {
                        tOpacity = 0.55;
                        tSize = 0.14;
                        tSpeed = 2.0;
                        tUpBias = 1.2; // buoyant convection column
                        tFireSpawn = 1;
                        break;
                    }
                case "ASSESSMENT":
                case "SCRUBBING":
                    {
                        tOpacity = 0.85; // Increased for better visibility
                        tSize = 0.12; // Increased for better visibility
                        tSpeed = 1.4; // livelier drift fills the volume faster
                        tUpBias = 0.0; // no net buoyancy — smoke goes every direction
                        tFireSpawn = 0; // respawn anywhere in the module
                        break;
                    }
                default:
                    {
                        break;
                    }
            }
            /* ---------------- smooth toward targets ---------------- */ s.opacity = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.opacity, tOpacity, DAMP, dt);
            s.size = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.size, tSize, DAMP, dt);
            s.speed = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.speed, tSpeed, DAMP, dt);
            s.upBias = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.upBias, tUpBias, DAMP, dt);
            s.fireSpawnMix = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].damp(s.fireSpawnMix, tFireSpawn, DAMP, dt);
            if (s.opacity < 0.004) {
                if (matRef.current) matRef.current.opacity = 0;
                return;
            }
            /* ---------------- advect particles ---------------- */ const posAttr = geometry.getAttribute("position");
            const colAttr = geometry.getAttribute("color");
            const alpAttr = geometry.getAttribute("aAlpha");
            const arr = posAttr.array;
            const carr = colAttr.array;
            const aarr = alpAttr.array;
            const burning = simulationState === "BURNING";
            const respawn = {
                "SmokeParticles.useFrame.respawn": (v)=>{
                    randomSpawn.set((Math.random() - 0.5) * (MODULE_SIZE.x - 0.6), (Math.random() - 0.5) * (MODULE_SIZE.y - 0.6), (Math.random() - 0.5) * (MODULE_SIZE.z - 0.6));
                    // spawn just above the fire, small radius
                    const r = Math.sqrt(Math.random()) * 0.4;
                    const a = Math.random() * Math.PI * 2;
                    fireSpawn.set(FIRE_POS.x + Math.cos(a) * r, FIRE_POS.y + 0.3 + Math.random() * 0.4, FIRE_POS.z + Math.sin(a) * r);
                    v.lerpVectors(randomSpawn, fireSpawn, s.fireSpawnMix);
                }
            }["SmokeParticles.useFrame.respawn"];
            for(let i = 0; i < PARTICLE_COUNT; i++){
                const i3 = i * 3;
                const seed = seeds[i];
                p.set(arr[i3], arr[i3 + 1], arr[i3 + 2]);
                /* ---------------- ceiling gathering (BURNING only) ------------- */ // After the fire stops, smoke no longer collects at the ceiling —
                // it drifts everywhere instead.
                const inGatherZone = burning && p.y > GATHER_START_Y;
                linger[i] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp(linger[i] + (inGatherZone ? dt * 1.6 : -dt * 2.5), 0, 1);
                const l = linger[i];
                if (burning) {
                    /* ------------- rising fire column with flicker --------------- */ if (l < 1) {
                        const flickX = Math.sin(t * 6.3 + seed) * 0.35 + Math.sin(t * 15.7 + seed * 2.1) * 0.15;
                        const flickZ = Math.cos(t * 5.1 + seed * 1.3) * 0.35 + Math.cos(t * 17.3 + seed) * 0.15;
                        const flickY = Math.sin(t * 9.4 + seed * 3.7) * 0.25;
                        p.x += (drifts[i3] * s.speed + flickX) * (1 - l * 0.8) * dt;
                        p.y += ((drifts[i3 + 1] * s.speed + s.upBias) * (1 - l * 0.97) + flickY * 0.3) * dt;
                        p.z += (drifts[i3 + 2] * s.speed + flickZ) * (1 - l * 0.8) * dt;
                        if (inGatherZone) {
                            p.y = Math.min(p.y, CEILING_Y);
                        }
                    }
                    if (l > 0.05) {
                        // gathered: near-zero vertical motion, lateral X/Z drift,
                        // clamped just under the ceiling so the layer builds up
                        p.y += Math.sin(t * 0.8 + seed * 5.0) * 0.02 * l * dt;
                        p.x += (Math.sin(t * 0.7 + seed * 2.0) * 0.25 + (Math.random() - 0.5) * 0.35) * l * dt * s.speed;
                        p.z += (Math.cos(t * 0.9 + seed * 4.0) * 0.25 + (Math.random() - 0.5) * 0.35) * l * dt * s.speed;
                        p.y = Math.min(p.y, CEILING_Y);
                    }
                } else {
                    /* ------------- post-fire: smoke drifts EVERYWHERE --------------
         * Full 3D wandering — X, Y and Z — so the smoke fills the whole
         * module volume instead of pooling at the ceiling. Particles that
         * leave the box respawn at a random point inside it, keeping the
         * entire space uniformly smoky for as long as the state lasts.
         */ p.x += (drifts[i3] * s.speed + Math.sin(t * 0.9 + seed) * 0.1 + (Math.random() - 0.5) * 0.08) * dt;
                    p.y += (drifts[i3 + 1] * s.speed + s.upBias + Math.sin(t * 0.7 + seed * 2.0) * 0.1 + (Math.random() - 0.5) * 0.08) * dt;
                    p.z += (drifts[i3 + 2] * s.speed + Math.cos(t * 1.1 + seed * 3.0) * 0.1 + (Math.random() - 0.5) * 0.08) * dt;
                }
                /* ---------------- bounds handling ---------------- */ const outX = Math.abs(p.x) > HALF.x - 0.12;
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
                /* ---------------- dynamic colour ramp ---------------- */ // h: 0 at floor -> 1 at ceiling
                const h = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].clamp((p.y + HALF.y) / MODULE_SIZE.y, 0, 1);
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
                    c.copy(SMOKE_DARK).lerp(tint, 0.9); // Biased toward bright tint
                    c2.copy(tint).multiplyScalar(0.7); // Brightened shimmer
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
            /* ---------------- push smoothed values to the material ---------------- */ if (matRef.current) {
                matRef.current.opacity = s.opacity;
                matRef.current.size = s.size;
            }
        }
    }["SmokeParticles.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
        geometry: geometry,
        frustumCulled: false,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointsMaterial", {
            ref: attachMaterial,
            map: texture,
            vertexColors: true,
            color: "#ffffff",
            size: 0.05,
            transparent: true,
            opacity: 0,
            sizeAttenuation: true,
            depthWrite: false,
            blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"]
        }, void 0, false, {
            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
            lineNumber: 787,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 786,
        columnNumber: 5
    }, this);
}
_s4(SmokeParticles, "kBD4adTaeGnOusDKe0kZ2f4o0OA=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$9ce18a08$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__F__as__useFrame$3e$__["useFrame"]
    ];
});
_c4 = SmokeParticles;
/* ------------------------------------------------------------------ */ /*  Scene                                                              */ /* ------------------------------------------------------------------ */ function ScannerScene({ simulationState, tGrp }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("color", {
                attach: "background",
                args: [
                    "#04060c"
                ]
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 810,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("fog", {
                attach: "fog",
                args: [
                    "#04060c",
                    12,
                    30
                ]
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 811,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: 0.25
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 813,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("directionalLight", {
                position: [
                    5,
                    8,
                    4
                ],
                intensity: 0.6
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 814,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Stars$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Stars"], {
                radius: 60,
                depth: 40,
                count: 2500,
                factor: 3,
                fade: true,
                speed: 0.4
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 816,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$OrbitControls$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["OrbitControls"], {
                makeDefault: true,
                enableDamping: true,
                autoRotate: false
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 817,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Environment"], {
                preset: "night"
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 818,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ModuleFrame, {
                simulationState: simulationState,
                tGrp: tGrp
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 820,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(HvacVent, {}, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 821,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(FireEffect, {
                simulationState: simulationState
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 822,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(EmberSparks, {
                simulationState: simulationState
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 823,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SmokeParticles, {
                simulationState: simulationState,
                tGrp: tGrp
            }, void 0, false, {
                fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
                lineNumber: 824,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 809,
        columnNumber: 5
    }, this);
}
_c5 = ScannerScene;
function ThermalSmokeScanner3D({ simulationState, tGrp }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
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
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ScannerScene, {
            simulationState: simulationState,
            tGrp: tGrp
        }, void 0, false, {
            fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
            lineNumber: 843,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/post-fire/ThermalSmokeScanner3D.tsx",
        lineNumber: 838,
        columnNumber: 5
    }, this);
}
_c6 = ThermalSmokeScanner3D;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "FireEffect");
__turbopack_context__.k.register(_c1, "EmberSparks");
__turbopack_context__.k.register(_c2, "ModuleFrame");
__turbopack_context__.k.register(_c3, "HvacVent");
__turbopack_context__.k.register(_c4, "SmokeParticles");
__turbopack_context__.k.register(_c5, "ScannerScene");
__turbopack_context__.k.register(_c6, "ThermalSmokeScanner3D");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_post-fire_0_6nhsx._.js.map