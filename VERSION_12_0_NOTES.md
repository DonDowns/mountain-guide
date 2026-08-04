# Version 12.0 — Expedition Command Center

## Added

A field-focused operational screen for the active trip:

- expedition start, pause, resume, and end state
- local clock, elapsed time, fixed turnaround target, and margin
- manual route-stage progression
- saved weather/forecast-horizon evidence
- question-framed decision center
- route, trip, mountain, and gear shortcuts
- communication readiness and next check-in time
- manual water and calorie tracking
- compact emergency reference
- route-specific mountain notes
- timestamped live field journal
- copyable expedition journal

## Explicit limitations

Version 12 does not:

- track live GPS location
- calculate actual distance remaining
- monitor inReach battery or satellite status
- issue automated continue/abort decisions
- provide real-time lightning detection
- certify medical, rescue, navigation, weather, or route safety

## Data

Command Center state is stored under `ddmg-v12-command-state`, remains device-local, and is included in the unified app-data export because it uses the `ddmg-` namespace.

## Preserved

All Version 11, 10, 9.1, 9.0, and 8.6.1 functionality remains present.
