# Don Downs Mountain Guide — Version 15.3.7

A private-use, offline-capable Colorado mountain planning and summit-history web app. Version 15.3.7 is the current production release.

## Current release

**Version 15.3.7 — Field UI Controls and Navigation**

This release includes:

- a reliable full-guide Red display toggle with synchronized labels and pressed state;
- higher-contrast access to the climb-only field page;
- a clear return from Trip Intelligence to the Mountain Guide home;

- renderer-level My 50 / Still to climb / All 58 filtering, with updated group and range-summary counts;
- automatic expansion and scrolling to the filtered ledger after each selection;
- visible Road to 50 status at both the controls and the displayed ledger;
- a return control beside the displayed ledger count that scrolls back to the Road to 50 filters without changing scope;
- a service-worker-safe shared version value and a fresh Version 15.3.7 cache;

- a dedicated climb-only field page (`climb.html`);
- My Road to 50 filters and summit-ledger integration;
- objective-driven start and turnaround times;
- honest saved-forecast rendering with explicit unavailable and stale states;
- persistent field checks and status notes by objective and date;
- verified county sheriff/dispatch information for the current expedition and Road to 50 objectives;
- device-local personal emergency-contact setup;
- recipient-free SMS and email drafts when no personal contact is saved;
- a single release-number source in `js/version.js`;
- corrected offline/PWA behavior for both the full guide and Climb Mode.

## Privacy

Personal emergency-contact phone numbers and email addresses are **not stored in this repository**. They are entered separately on each device and saved only in that browser's local storage.

The public source contains official county sheriff and dispatch numbers used for trip-aware emergency reference. The app does not claim that a message was sent, that help was requested, or that rescue was activated.

## Production structure

The live application uses:

- `index.html` — full Mountain Guide;
- `climb.html` — field-focused Climb Mode;
- `styles.css` — shared styling;
- `manifest.webmanifest` and `sw.js` — installable/offline PWA support;
- `js/` — all executable modules;
- local icons, hero artwork, and Mountain Stories images.

Do not move files out of the `js` directory. Relative paths are required by the HTML and service worker.

## Deployment

GitHub Pages should publish from:

- **Branch:** `main`
- **Folder:** `/ (root)`

Upload the contents of the clean release folder directly into the repository root while preserving the `js` directory.

Recommended commit message:

`Deploy Mountain Guide v15.3.7 field UI controls`

After deployment:

1. Confirm the footer displays **Version 15.3.7**.
2. Open Climb Mode and confirm the selected objective and forecast state are correct.
3. Enter the personal emergency contact locally on the intended phone.
4. Confirm SMS and email drafts open correctly.
5. Relaunch both pages in Airplane Mode.

## Release history

### Version 15.3.7
Restores the full-guide Red display toggle, improves Climb Mode link contrast, and adds a clear Trip Intelligence return control for desktop and mobile use.

### Version 15.3.6
Adds a desktop- and mobile-friendly return control beside the filtered ledger status so users can move smoothly back to the Road to 50 filters without resetting the selected scope.

### Version 15.3.5
Makes Road to 50 filtering unmistakable in the visible ledger: scope-aware range summaries, an adjacent rendered-count line, expanded result groups, and automatic movement to the filtered list.

### Version 15.3.4
Road to 50 filtering now happens inside the summit renderer, so the rendered groups, counts, and visible cards change together. Adds an explicit scope status line and refreshes the offline cache.

### Version 15.3.3
Privacy-safe device-local emergency contacts, verified county emergency references, field-page integrity corrections, and clean production packaging.

### Version 15.3.1
Objective-driven Climb Mode, saved-forecast integrity, persistent field checks, corrected Ellingwood route reference, Road to 50 ledger integration, and trip-aware emergency contacts. Superseded by 15.3.3 because personal contact details were moved out of public source.

### Version 15.3
Initial Road to 50 and Climb Mode release. Rejected and superseded after field-page audit findings.

### Version 15.2
Full-system audit and elevation-profile integrity release.

### Version 15.1
Mountain Intelligence search stabilization and Mount Evans/Mount Blue Sky alias support.

### Version 15.0
Modular architecture and mountain knowledge base.

## Safety statement

This app is a planning and personal-reference tool. Weather, route data, saved checks, and emergency contacts are evidence and reference—not permission, rescue guidance, medical clearance, or a go/no-go determination. Actual conditions, terrain, access, group condition, and official emergency instructions govern decisions.
