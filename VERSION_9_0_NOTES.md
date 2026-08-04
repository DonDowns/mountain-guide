# Version 9.0 — Trip Builder Foundation

## New architecture

Version 9.0 introduces reusable local trip records while preserving the Lake Como expedition as the stable field-ready trip.

## Trip record fields

- trip name
- primary peak
- curated standard route
- published start point
- climb date and travel window
- planned trail start and turnaround
- partners
- transportation
- lodging/camp
- summit and access weather-point bindings
- additional objectives and notes
- GPX/KML, offline-map, route-photo, and screenshot preparation status

## Trip Library

- Lake Como is seeded as the first system trip.
- Create, save, load, duplicate, and delete custom trips.
- Data is local to the current browser/app and included in the unified `ddmg-*` export.
- Lake Como cannot be deleted.

## Standard-route behavior

The builder defaults to the curated standard route for the selected peak when one exists. Combo routes remain selectable but are not silently substituted for the standard route.

## Route files

Version 9.0 tracks preparation and opens the authoritative route page. It does not redistribute third-party GPX files or provide turn-by-turn navigation.

## Preserved

All Version 8.6.1 route, weather, gear, summit-history, safety, data-transfer, and offline functionality remains present.
