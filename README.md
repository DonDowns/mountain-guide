# Don Downs Mountain Guide — Version 6.2 Daily Formation Edition

Version 6.1 keeps the audited Version 5.1 reliability baseline and adds a focused premium experience rather than feature clutter.

## Material additions
- Cinematic alpine visual system with original artwork
- Summit Focus: a one-screen field sheet for the approach, Blanca–Ellingwood, or Lindsey
- Calculated civil dawn, sunrise, and sunset in Mountain Time
- Night-vision display for pre-dawn use
- Schematic route-elevation stories clearly labeled as planning profiles, not GPS
- Native-style expedition pulse strip and central mobile Focus button
- More polished typography, spacing, imagery, transitions, and responsive behavior
- Existing audited weather, offline caching, condition review, checklist, journal, 14er, privacy, and service-worker corrections preserved

## Deploy
1. Upload every file in this package to the root of `DonDowns/mountain-guide`.
2. Keep the existing `CNAME` file.
3. Commit directly to `main` with: `Deploy Mountain Guide v6 Refined Alpine Edition`.
4. Wait 1–3 minutes, then hard-refresh the live site.
5. In the installed iPhone app, accept the update banner or fully close and reopen after the new service worker installs.

## Device verification
- Open Summit Focus and switch among all three objectives.
- Confirm civil dawn/sunrise/sunset appear.
- Turn Night Vision on and off.
- Refresh Lake Como weather and confirm the NWS grid elevation remains near the lake/camp elevation rather than the valley floor.
- Test Airplane Mode after one online launch.

## Privacy
The public version excludes exact addresses, reservation numbers, private phone numbers, and other sensitive details.


## Version 6.2

Version 6.2 adds matched morning and evening Scripture/reflection cards to every itinerary day and corrects the projected 38-of-50 progress bar to 76%.

Commit message:

`Deploy Mountain Guide v6.2 Daily Formation Edition`


## Version 6.3

Version 6.3 adds a lower-right Ask AI companion. It prepares a privacy-conscious, context-aware prompt and opens ChatGPT without embedding an API key in the public site.

GitHub commit message:

`Deploy Mountain Guide v6.3 AI Companion Edition`


## Version 6.5.1

Safety-language correction: the forecast comparison never presents a green/check-mark all-clear, and every turnaround countdown prompt ends with a question.

GitHub commit message:

`Deploy Mountain Guide v6.5.1 Safety Language Fix`


## Version 6.6

Version 6.6 adds a reusable Personal Gear Locker, smart packing presets, custom gear, optional weight tracking, and gear-aware backup/import.

GitHub commit message:

`Deploy Mountain Guide v6.6 Gear Locker and Pack Builder`


## Version 6.7

Version 6.7 adds chronological personal Mountain Stories for Mount Massive, Mount of the Holy Cross, and Mount Princeton; removes the visible privacy callout; and fixes persistent dismissal of the iPhone installation banner.

GitHub commit message:

`Deploy Mountain Guide v6.7 Mountain Stories`


## Version 6.8

Version 6.8 moves Great Sand Dunes and Zapata Falls to Friday with Marin, LinZhi, and Sam; creates an unhurried Thursday for Don and Vonda; records the executed Mount Lindsey waiver privately; and adds device charging/setup checks.

GitHub commit message:

`Deploy Mountain Guide v6.8 Itinerary and Readiness Update`


## Version 7.0

Version 7.0 begins Phase 2 with an authoritative Colorado Fourteener Ledger based on Don’s August 1, 2026 14ers.com checklist: 35 of 58 named summits and 31 of 53 ranked peaks completed.

GitHub commit message:

`Deploy Mountain Guide v7.0 Colorado Summit Ledger`


## Version 7.1

Version 7.1 adds Don’s completed-climb dates, partners, repeats, solo ascents, current 14ers.com standard-route references, and a detailed summit viewer.

GitHub commit message:

`Deploy Mountain Guide v7.1 Completed Climb History`


## Version 7.1.1

Version 7.1.1 corrects the climb history to 35 unique summits and 35 ascent events, adds the Bierstadt–Sawtooth–Mount Evans Class 3 traverse, completes the North Eolus record, and displays mountain range and class on completed summit cards.

GitHub commit message:

`Deploy Mountain Guide v7.1.1 Climb History Corrections`


## Version 7.1.2

Version 7.1.2 corrects the blank summit ledger on iPhone, rebuilds the six-item
bottom navigation, aligns the Summits icon and label, and moves Ask clear of Gear.

GitHub commit message:

`Deploy Mountain Guide v7.1.2 Mobile Navigation Fix`


## Version 7.1.3

Version 7.1.3 adds Don and David Harbin’s confirmed Fort Garland lodging to the Sunday/Monday itinerary and readiness checklist while keeping booking credentials out of the public app.

GitHub commit message:

`Deploy Mountain Guide v7.1.3 Fort Garland Lodging`


## Version 7.1.4

Version 7.1.4 adds the exact Fort Garland motel address, tappable directions,
a call button, and the 10:00 AM checkout while keeping the Expedia confirmation
number and booking credentials private.

GitHub commit message:

`Deploy Mountain Guide v7.1.4 Lodging Contact and Directions`


## Version 7.2

Version 7.2 integrates the reviewed photo-verified gear inventory into the Gear Locker, adds a one-time saved-locker refresh for existing gear IDs, corrects optional gear weight behavior, and updates summit partner records from Don’s latest corrections.

GitHub commit message:

`Deploy Mountain Guide v7.2 Photo Gear Integration`


## Version 7.3

Version 7.3 incorporates Don’s transcript from his 14ers.com climb review, correcting first/second climb milestones, partners, combo climbs, summit memories, conditions, and gear-worn notes.

GitHub commit message:

`Deploy Mountain Guide v7.3 Transcript Climb History`

## Version 7.4.1

Version 7.4.1 keeps the Version 7.4 single-source-of-truth and this-device readiness fixes, then re-applies the Mount Columbia and Belford/Oxford partner corrections.

GitHub commit message:

`Deploy Mountain Guide v7.4.1 single source truth partner corrections`

## Version 7.5

Version 7.5 adds a visible Data Transfer panel and local data stamp. It does not attempt false cross-device sync detection. It is built from 7.4.1 and preserves all partner corrections.

GitHub commit message:

`Deploy Mountain Guide v7.5 Data Transfer and Local Stamp`

## Version 7.5.1

Version 7.5.1 hardens the Data Transfer feature: confirmation before import, app-scoped ddmg-* backup keys, reload after import, and no global Storage.prototype monkey patch.

GitHub commit message:

`Deploy Mountain Guide v7.5.1 Data Transfer hardening`

## Version 7.5.2

Version 7.5.2 makes the dashboard readiness card clickable and opens a Readiness Sources panel for active pack confirmations and communication checkmarks.

GitHub commit message:

`Deploy Mountain Guide v7.5.2 clickable readiness checks`

## Version 7.6

Version 7.6 makes every dashboard metric a navigation shortcut while preserving 7.5.2 readiness navigation, 7.5.1 hardened Data Transfer, and 7.4 single-source ledger facts.

GitHub commit message:

`Deploy Mountain Guide v7.6 tappable dashboard cards`

## Version 7.7

Version 7.7 adds a non-persistent Incomplete only toggle for readiness checks and larger 44px tap targets for gear and communication check rows.

GitHub commit message:

`Deploy Mountain Guide v7.7 incomplete-only readiness checks`

## Version 7.8

Version 7.8 adds a plan-based Gear Advisor that recommends gear and margin based on the active climb plan, pack type, weather flags, and unchecked items.

GitHub commit message:

`Deploy Mountain Guide v7.8 Gear Advisor`


## Version 7.9

Version 7.9 integrates the plan-based Gear Advisor, manual Trip Conditions Advisor, incomplete-only optional-item corrections, and 44px gear-row tap targets.

GitHub commit message:

`Deploy Mountain Guide v7.9 integrated trip gear advisor`


## Version 8.0

Version 8.0 adds Route Intelligence: a curated 31-profile standard-route dataset sourced from 14ers.com covering all 23 remaining and planned peaks, a parking-elevation switch for the Lake Como road, auto-populated trip conditions with per-field source labels and overrides, and a per-location forecast horizon gate that reports when a forecast is not yet in range instead of inventing one.

GitHub commit message:

`Deploy Mountain Guide v8.0 Route Intelligence`


## Version 8.1

Version 8.1 adds collapsible Planned/Completed/Remaining groups to the summit ledger with persistent state and search override, and locks the page to vertical scrolling by removing the iOS-hostile fixed background attachment, clamping horizontal overflow on html and body, and containing overscroll on the horizontal strips. It also closes the two v8.0 audit findings.

GitHub commit message:

`Deploy Mountain Guide v8.1 collapsible summit groups and scroll fix`


## Version 8.3

Version 8.3 removes the self-contradicting Source discipline note, reunites the summit ledger with the Version 8.0 route dataset so all 23 unclimbed peaks show full route intelligence, retires the redundant Status dropdown and rewires its shortcuts to the collapsible groups, moves the ledger live region to a compact status line, consolidates two incompatible backup formats into one import that still reads legacy files, and eliminates version-stamp drift with a single APP_VERSION constant.

GitHub commit message:

`Deploy Mountain Guide v8.3 ledger cleanup and route data reunification`


## Version 8.4

Version 8.4 is a deep-clean release: it completes the backup consolidation that v8.3 left partially done, replaces the stale 50-entry PEAKS array with a list derived from the 58-entry ledger, converts all twelve inline onclick handlers to listener bindings, removes dead code, and deduplicates double advisor renders. No new features.

GitHub commit message:

`Deploy Mountain Guide v8.4 deep clean dead code and duplicate data`


## Version 8.5

Version 8.5 adds 34 stored weather points — summit and access coordinates for every remaining 14er — to the existing NWS engine, grouped in the forecast selector under Future Elk, San Juan, and Sangre de Cristo. Summit coordinates are published USGS values; access points are labeled approximate; future points carry no trip date and say so honestly instead of inventing a forecast window. Bulk trip refresh is unchanged.

GitHub commit message:

`Deploy Mountain Guide v8.5 future weather points`


## Version 8.6.1

`Deploy Mountain Guide v8.6.1 final stabilization`


## Version 9.0

Trip Builder Foundation with reusable local trip records.

`Deploy Mountain Guide v9.0 Trip Builder Foundation`


## Version 9.1

Generated itinerary and trip-specific readiness.

`Deploy Mountain Guide v9.1 generated itinerary and readiness`


## Version 10.0

Intelligent Expedition Builder.

`Deploy Mountain Guide v10.0 Intelligent Expedition Builder`


## Version 11.0

Searchable Mountain Intelligence Database.

`Deploy Mountain Guide v11.0 Mountain Intelligence Database`


## Version 12.0

Expedition Command Center field companion.

`Deploy Mountain Guide v12.0 Expedition Command Center`


## Version 13.0

Climbing Journal and Expedition Archive.

`Deploy Mountain Guide v13.0 Climbing Journal and Expedition Archive`


## Version 14.0

Mountain Intelligence Engine.

`Deploy Mountain Guide v14.0 Mountain Intelligence Engine`


## Version 14.1

`Deploy Mountain Guide v14.1 Audit Fix Weather Cross-Checks and Agreement`


## Version 15.0

Modular Architecture and Mountain Knowledge Base.

`Deploy Mountain Guide v15.0 Modular Architecture and Mountain Knowledge Base`
