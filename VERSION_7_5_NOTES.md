# Version 7.5 — Data Transfer and Local Data Stamp

## Base

Built from Version 7.4.1, which preserved Claude's Version 7.4 single-source-of-truth work and re-applied the final partner corrections.

## Added

- Visible Data Transfer panel in the Gear / readiness area.
- Export button for this browser/app installation's local data.
- Import control for a previously exported backup file.
- Local data stamp showing when this copy was last changed.
- Plain language that readiness, gear status, pack checkmarks, weather snapshots, and preferences are local to this installation.

## Deliberately not added

No “appears unsynced” detector was added. With no backend or account, the app cannot know whether another device has newer data. The app now shows the last-changed timestamp and the device-local scope instead.

## Preserved

- Version 7.4 single-source ledger-fact rendering.
- Version 7.4 this-device readiness labeling.
- Version 7.4.1 partner corrections.
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

`ddmg-v7-5-2026-08-03-1`
