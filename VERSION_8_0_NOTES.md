# Version 8.0 — Route Intelligence

## Added

- **Curated standard-route dataset (31 route profiles).** Sourced manually from 14ers.com; not scraped at runtime. Covers all 23 remaining/planned peaks in the ledger plus the Lake Como cluster and its combos. Each profile carries route name, class, round-trip distance, elevation gain, all four 14ers.com risk factors (exposure, rockfall, route-finding, commitment), access notes, and the route link.
- **Parking-elevation switch.** Lake Como routes store distance and gain per start point rather than as a single number, because on this road the parking elevation sets the entire day.
- **Auto-populated Trip Conditions with per-field override.** Length, summits, distance, terrain, and water derive from the selected route. Cold, snow, and wind derive only from a saved forecast that is actually inside the forecast window. Every field shows its source: from route, from forecast, your override, or not derived. Any manual change is preserved until reset.
- **Per-location forecast horizon gate.** Each trip location computes its own window from its target date against a seven-day horizon. States: forecast not yet in range (with the approximate date it opens), in range but not loaded, loaded but stale, or available. There is no "safe" state.
- **Route-derived Gear Advisor considerations.** Heavy gain, long mileage, rockfall, route-finding, commitment, and exposure ratings each raise their own consideration with a reason.

## Safety discipline

- Reference-only routes (Little Bear West Ridge/Hourglass, Little Bear + Blanca Traverse, Bells Traverse) are flagged `objective: false`. Selecting one produces a priority notice that it is not an objective, before any packing advice.
- Access-restricted routes (Mount Lindsey, Culebra) raise an access consideration ahead of gear.
- Four combo routes have no published distance or gain in this dataset. They are flagged rather than estimated, and mileage-driven margin is suppressed for them.
- No sufficiency verdict, no all-clear state, no green readiness. Turnaround prompts remain question-framed.

## Corrections

- The ledger holds **23** remaining or planned peaks (35 of 58 complete), not 22.
- The 8,800 ft distance and gain for the Lake Como approach are an arithmetic derivation from the published 8,000 ft figures, and are labeled as such in the app.

## Fixed during build

- Temporal-dead-zone fault: the weather renderer could reach the Route Intelligence panel before its dataset initialized, throwing on load. Guarded with a hoisted readiness flag.
- A short day from a high camp no longer maps to "short / ordinary" when the route carries a Considerable or higher commitment rating.

## Preserved

Version 7.9 integrated advisors · 7.8 plan-based Gear Advisor · 7.7 incomplete-only checks · 7.6 tappable dashboard cards · 7.5.1 hardened data transfer · 7.4 single-source ledger facts · Mount Columbia correction · Belford/Oxford correction · gear/fuel refresh flags · ascent renderer escaping · no green/all-clear state · question-framed turnaround prompts.

## Dataset maintenance

Refresh the dataset manually when 14ers.com route statistics change. The stamp is `RI_DATASET_STAMP` in `app.js` (currently 2026-08-03) and is displayed in the panel.

## Service worker

`ddmg-v8-0-2026-08-03-1`

## GitHub commit message

`Deploy Mountain Guide v8.0 Route Intelligence`
