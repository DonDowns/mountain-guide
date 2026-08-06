# Don Downs Mountain Guide — Version 15.3.10

A private-use, offline-capable Colorado mountain planning and summit-history web app. Version 15.3.10 is the current field-readiness hotfix candidate.

## Current release

**Version 15.3.10 — Lake Como Field-Readiness Hotfix**

This release includes:

- cautious, location-aware emergency wording for Lake Como / Blanca / Ellingwood and Mount Lindsey, with Alamosa, Costilla, and Huerfano public contacts retained;
- draft-message wording that tells the user to call 911 and provide an exact location without asserting a single definitive county;
- prominent failed-refresh and saved/offline weather notices that override Fresh/Current presentation and retain last-successful data;
- Climb Mode alert wording that reports alerts “at last refresh” and directs users to the full guide for saved details;
- a restored 390px Summit Focus in-sheet Red-display control, with the full-guide and Climb Mode Red state synchronized across navigation;

- a reliable Summit Focus card Red-display control on narrow iPhone screens, with all three Red/Normal controls synchronized;
- unambiguous “Designed for pre-dawn starts” wording while retaining the saved 4:15 AM trip start;
- readable saved NWS alert details with severity, affected area, expiration, and last-refresh context when available;
- explicit saved/stale offline alert wording and a non-actionable fallback when only an alert count is available;
- an explicit refresh failure when NWS alert details cannot be retrieved, preserving the last successful cached forecast;

- corrected dark-theme surface variables so controls keep readable text/background contrast throughout the full app;
- readable Open/Close Trip Builder accordion headers in both normal and dark appearance;
- clearer official-source links in Climb Mode and audited 44px-or-larger button/select targets;
- stronger bottom-navigation active-state contrast on mobile;
- a reliable full-guide Red display toggle with synchronized labels and pressed state;
- higher-contrast access to the climb-only field page;
- a clear return from Trip Intelligence to the Mountain Guide home;

- renderer-level My 50 / Still to climb / All 58 filtering, with updated group and range-summary counts;
- automatic expansion and scrolling to the filtered ledger after each selection;
- visible Road to 50 status at both the controls and the displayed ledger;
- a return control beside the displayed ledger count that scrolls back to the Road to 50 filters without changing scope;
- a service-worker-safe shared version value and a fresh Version 15.3.10 cache;
- cache-upgrade hardening that forces fresh release assets and prevents mixed 15.3.7/15.3.8 modules;
- explicit browser icons on both app pages, eliminating the otherwise implicit missing-favicon request;
- stronger normal-mode muted-text contrast on cream and mist surfaces;

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

## Static release-safety checks

The repository includes dependency-free Node checks for release consistency, offline-cache completeness, local references, privacy, safety-language review, and repository cleanliness. No `npm install` is required.

Run the complete gate:

```sh
npm run check
```

Run an individual check when investigating a failure:

```sh
npm run check:version
npm run check:sw
npm run check:refs
npm run check:privacy
npm run check:safety
npm run check:clean
```

The safety-language check reports listed phrases for human review without inferring whether their context is acceptable. The privacy check reports every detected phone number or email and permits only its labeled public agency/business allowlist.

## Deployment

GitHub Pages should publish from:

- **Branch:** `main`
- **Folder:** `/ (root)`

Upload the contents of the clean release folder directly into the repository root while preserving the `js` directory.

Recommended commit message:

`Deploy Mountain Guide v15.3.10 field-readiness hotfix`

After deployment:

1. Confirm the footer displays **Version 15.3.10**.
2. Open Climb Mode and confirm the selected objective and forecast state are correct.
3. Enter the personal emergency contact locally on the intended phone.
4. Confirm SMS and email drafts open correctly.
5. Relaunch both pages in Airplane Mode.

## Release history

### Version 15.3.10
Makes current-expedition emergency guidance location-aware, prevents failed or offline weather from appearing current, clarifies cached alert counts in Climb Mode, and restores the in-sheet Summit Focus Red-display control on 390px mobile layouts.

### Version 15.3.9
Fixes the Summit Focus card Red-display control on physical-size iPhone layouts, clarifies pre-dawn wording without changing the trip start, and makes saved NWS alert counts disclose readable cached details or an explicit unavailable state online and offline.

### Version 15.3.8
Completes a full-app desktop and mobile control audit, fixes shared light/dark-theme contrast failures, improves field-source link readability, standardizes practical mobile control targets, and hardens service-worker upgrades against mixed-version assets.

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
