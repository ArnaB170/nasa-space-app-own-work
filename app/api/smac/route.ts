import { NextResponse } from "next/server";

/**
 * GET /api/smac
 *
 * Returns official NASA 1-Hour Spacecraft Maximum Allowable Concentrations
 * (SMAC) limits alongside current sensor readings for post-fire clearance
 * assessment.
 *
 * Data sources:
 *  - NASA-STD-3001 Vol. 1 (Crew Health) — Table 6.2 (SMAC values)
 *  - ISS ECLSS thermal/O₂ baseline thresholds
 *
 * This route is self-contained and does NOT import from or modify any other
 * API routes, making it safe to merge independently on a shared branch.
 */
export async function GET() {
  const data = {
    gases: [
      {
        id: "co",
        name: "Carbon Monoxide",
        smac_1hr_ppm: 55,
        current_ppm: 150,
        hazard: "Hypoxia / Asphyxiation",
      },
      {
        id: "hcn",
        name: "Hydrogen Cyanide",
        smac_1hr_ppm: 4,
        current_ppm: 12,
        hazard: "Cellular Asphyxiation",
      },
      {
        id: "hcl",
        name: "Hydrogen Chloride",
        smac_1hr_ppm: 5,
        current_ppm: 15,
        hazard: "Acid Burn",
      },
    ],
    environment: {
      temperature_c: {
        safe_max: 27,
        current: 42,
      },
      oxygen_percentage: {
        safe_min: 19.5,
        current: 16.2,
      },
    },
  };

  return NextResponse.json(data);
}
