# Version 5.1 Audited — corrections applied

Based on the independent pre-deployment audit in `Mountain_Guide_V5_Audit_Report.md`.

## High-severity corrections

1. Corrected Lake Como camp forecast coordinates to 37.56960, -105.51406.
2. Prevented non-OK navigation responses from replacing the offline app shell.
3. Made the cached HTML, JavaScript and CSS update atomically through the service-worker update flow.

## Medium and selected low-severity corrections

- Full America/Denver date matching for “Today.”
- Fifteen-second NWS request timeout.
- Accurate offline refresh messaging.
- `aria-pressed` and `aria-current` state semantics.
- No automatic reload on first service-worker control.
- Guarded storage reads/writes/removals.
- `-webkit-backdrop-filter` fallbacks.
- Empty-temperature guard.
- Missing precipitation shown as unknown.
- NWS source-issue time shown separately from fetch time.
- Direct Mount Lindsey route and required-waiver links.
- Home-town wording removed from the public itinerary.
- Ellingwood and Lindsey displayed elevations updated to current 14ers.com values.

## Still requires physical-device verification

- iPhone Safari
- Add to Home Screen
- Installed PWA update from the currently deployed version
- Offline relaunch after one online load
- VoiceOver
- Live NWS success, timeout and partial-failure states
