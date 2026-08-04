# Version 15.0 — Modular Architecture and Mountain Knowledge Base

## Architecture

The 3,976-line monolithic application script is split into ordered classic-script modules:

- `js/core.js`
- `js/trips.js`
- `js/expedition.js`
- `js/mountains.js`
- `js/command.js`
- `js/archive.js`
- `js/insights.js`
- `js/bootstrap.js`

The split preserves the existing global execution model and load order, minimizing refactor risk while making future development and audits more manageable.

## Living mountain knowledge pages

Every mountain page now combines available:

- route profiles and standard route
- weather points and external weather resources
- ascent history
- reusable trip records
- archived expeditions
- partner history
- gear reflections
- route lessons and hazards
- favorite memories
- Scripture, prayer, and spiritual reflections
- personal photographs
- explicit planning gaps

Missing information is shown as missing rather than invented.

## Preserved

All Version 14.1 weather cross-checks, forecast agreement, audit hardening, safety language, route data, gear migrations, Command Center, archives, and Expedition Insights remain present.
