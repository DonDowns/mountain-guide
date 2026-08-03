# Version 7.7 — Incomplete-Only Checks and Larger Tap Targets

## Base

Built from Version 7.6.

## Added

- Non-persistent **Incomplete only** toggle in the readiness / gear area.
- Toggle defaults OFF on each reload and does not write a filter preference to storage.
- When enabled, the pack builder shows only unchecked required pack confirmations.
- Pack-section groupings remain intact, and pack sections that have no remaining required items are hidden while filtered.
- Communication check rows hide once checked while the filter is active.
- When nothing remains, the empty state says exactly: **All items checked on this device**.
- The toggle uses `aria-pressed`.
- Filter count is shown in a live status text and announced through the existing toast/status region when toggled.
- Gear and communication check rows now have a 44px minimum tap-target height for cold-hand/gloved use.

## Deliberately preserved wording discipline

The empty state does not say “ready,” “safe,” or any all-clear equivalent. It only reports what has been checked on this device.

## Preserved

- Version 7.6 tappable dashboard cards.
- Version 7.5.1 hardened data transfer.
- Version 7.4 single-source ledger-fact rendering.
- Mount Columbia: Don Downs, Mike Brown, David Harbin, and Dr. Charles Jansen.
- Belford/Oxford: Logan Jones, Amy, and David Schultheis.
- Version 7.3.1 first-climb correction.
- Version 7.2 photo-verified gear inventory and one-time gear refresh.
- Version 7.1.5 fuel/coffee/RTE meal logic.
- Lake Como itinerary.
- Fort Garland lodging.
- Weather and offline operation.
- Summit Focus.
- No green/all-clear safety states.
- All turnaround prompts remain question-framed.

## Service worker

`ddmg-v7-7-2026-08-03-1`
