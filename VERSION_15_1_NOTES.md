# Version 15.1 — Mountain Intelligence Search Stabilization

## Fixed

A blocking Mountain Intelligence search defect reported in Version 15.0:

- the Mountain Intelligence search field could appear non-editable in the deployed web app
- typed characters were not visibly appearing for the user
- search results did not update when searching for “Evans”

## Changes

- hardened the Mountain Intelligence search input with explicit editable, visible, iOS/PWA-safe CSS
- added defensive runtime setup to remove any accidental disabled/readonly state
- bound `input`, `keyup`, and `search` events to the Mountain Intelligence renderer
- added former-name alias support so “Evans,” “Mount Evans,” and “Mt Evans” find Mount Blue Sky
- expanded Mountain Intelligence search text to include peak notes, route, difficulty, ascent notes, conditions, and outing names

## Preserved

- Version 15 modular architecture
- Version 14.1 weather cross-checks and forecast-agreement scoring
- Version 14 Expedition Insights debounce fix
- all prior data-transfer hardening and safety constraints
