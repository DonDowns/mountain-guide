# Version 8.1 QA Results

## Structural
- app.js syntax: passed
- sw.js syntax: passed
- manifest JSON: passed
- duplicate HTML IDs: none
- missing JavaScript DOM targets: none
- footer version 8.1: passed
- expand/collapse controls present: passed
- service-worker cache: ddmg-v8-1-2026-08-03-1

## Collapsible summit groups
- groups rendered in order: Planned, Completed, Remaining
- counts: 3 planned + 35 completed + 20 remaining = 58 (matches ledger)
- default expanded state: planned=true, completed=false, remaining=false
- `hidden` attribute agrees with `aria-expanded` on every group: passed
- toggle persists to ddmg-v8-1-summit-groups: passed
- expand all / collapse all: passed
- search "blanca" with all groups collapsed: 1 card surfaced, every group force-expanded: passed
- no-match empty state preserved: passed
- group header height 56 px (above the 44 px tap-target floor): passed
- card click delegation still resolves through the new nesting: passed

## Scroll fixes
- `background-attachment: fixed` removed from body: passed
- `body::before` fixed background layer present: passed
- `html, body { max-width:100%; overflow-x:hidden; overscroll-behavior-x:none }`: passed
- `overscroll-behavior-x: contain` on .navin, .hour-strip, .wx-summary, .weather-stats: passed
- `touch-action: pan-y` on ledger containers: passed

## Audit findings closed
- backup payload version stamp now reads 8.1 (was 7.7): passed
- legacy gear-backup export now carries routeSelected, routeStartPoint, conditionOverrides, summitGroups: passed

## v8.0 regression
- route profiles still loaded: 31
- Route Intelligence panel, forecast state, and field-source strip present: passed
- all turnaround prompts remain question-framed: passed
- no green/all-clear state: passed

## Not verified here
The scroll fixes are CSS-level and were validated by inspection, not in a browser. Confirm on the iPhone after the service worker updates.
