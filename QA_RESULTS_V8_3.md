# Version 8.3 QA Results

## Structural
- app.js, sw.js syntax: passed
- manifest JSON: passed
- duplicate HTML IDs: none
- footer version 8.3: passed
- service-worker cache: ddmg-v8-3-2026-08-03-1
- no hardcoded version strings remain in JavaScript: passed

## Version stamp
- APP_VERSION constant: 8.3
- internal local-data stamp writes 8.3 (was 7.7): passed
- export payload writes 8.3: passed
- both now read the same constant: passed

## Route data reunification
- unclimbed peaks in ledger: 23
- unclimbed peaks resolving to a route profile: 23 (none missing)
- Blanca Peak: blan1, Difficult Class 2, 17 mi / 6,500 ft
- Mount Lindsey: lind1, Easy Class 3, 8.25 mi / 3,500 ft, access flag present, waiver text rendered
- Little Bear Peak: litt6, Class 4, flagged reference-only in the detail sheet
- Crestone Needle: cnee1, Class 4, 12 mi / 4,400 ft
- Capitol Peak: capi1, Class 4, 17 mi / 5,300 ft
- risk chips and 14ers.com link render in the detail sheet: passed

## Removals verified
- Source discipline note absent from index.html: passed
- Status dropdown absent: passed
- legacy export/import buttons and file input absent: passed
- single export and single import remain: passed
- every surviving reference to a removed element is null-safe: passed
  (three unguarded `summitStatusFilter` writes were found and fixed during build)

## Rewired shortcuts
- Show planned summits: opens Planned, collapses the other two: passed
- Range card: expands all groups so the selection is visible: passed
- Reset: clears search and range, announces: passed

## Accessibility
- `aria-live` removed from #summitGrid: passed
- #summitGroupStatus is `role="status"` `aria-live="polite"`: passed
- toggle announcement: "Completed expanded, 35 summits."
- collapse-all announcement: "All summit groups collapsed."

## Backup compatibility
- legacy v6.6 schema file imported through the single import path: passed
- remapped correctly: route selection (lind1), start point (8000), condition overrides, group state, gear locker, journal

## v8.2 regression
- overflow-x:clip retained; body not a scroll container: passed
- body::before background layer retained: passed
- overscroll containment on horizontal strips retained: passed
- 31 route profiles intact: passed
- turnaround prompts question-framed: passed
- no green/all-clear state: passed

## Defects found and fixed during build
1. Three unguarded writes to the removed `summitStatusFilter` element would have thrown on Reset, Show planned, and Range card taps.
2. `showPlannedSummits` and the range cards would have become inert once the dropdown was removed. Both rewired to the group model.
3. `rangeSelect.append` was unguarded.

## Not verified here
Rendering, scroll behavior, and VoiceOver output were validated by inspection and in a stubbed JavaScript context, not in a browser. Confirm on the iPhone after the service worker updates.
