# Version 8.4 QA Results

## Structural
- app.js, sw.js syntax: passed
- duplicate HTML IDs: none
- missing JavaScript DOM targets: none
- inline onclick handlers remaining: 0 (was 12)
- footer version 8.4: passed
- service-worker cache: ddmg-v8-4-2026-08-03-1
- APP_VERSION is the only version string in JavaScript: passed

## Backup consolidation (completed)
- legacy exportData and importBackupFile functions deleted: passed
- both surviving legacy "Export backup" buttons now call the unified export: passed
- exactly one export function and one import function remain: passed
- legacy v6.6 backup files still restore through the unified import: passed (rerun)

## Derived peak list
- PEAKS entries: 58 (was 50)
- Capitol Peak, Crestone Needle, and the other six missing peaks now present: passed
- status counts: 35 Completed, 3 Planned, 20 Goal — matches ledger exactly
- derived at load from COLORADO_SUMMITS; cannot drift: passed

## Dead code removal
- exportData, importBackupFile, resetChecks, setSummitStatusFilter: not defined (verified by invocation)
- all converted handler functions still defined and bound: passed
- summitStatusFilter absent from JavaScript entirely: passed
- double renderTripConditionsAdvisor calls: 0 (was 2)

## Regression (v8.0–v8.3)
- collapsible groups render: planned 3 / completed 35 / remaining 20: passed
- 31 route profiles; Blanca resolves to blan1; Lindsey carries waiver text; Little Bear flagged reference-only: passed
- scroll fixes retained (overflow-x:clip, body::before, overscroll containment): passed
- turnaround prompts question-framed; no green/all-clear verdict: passed

## Audited, no action required
- 5 empty catch blocks: all guard localStorage in private-mode Safari
- 2 thirty-second intervals: one page-lifetime by design, one cleared on Focus close
- repeated CSS selectors: responsive/campfire cascade layers, not duplication
- escapeHtml coverage: no unescaped user-data interpolation found
- apparent orphan ids: all reached via template-built ids or data attributes

## Defect found in my own prior release
The v8.3 "consolidated to one backup export" claim was wrong: two inline-onclick export buttons kept the legacy format reachable. Root cause: inline handlers are invisible to id-based audits. Fixed here, and the handler pattern that hid it is eliminated.

## Not verified here
Browser rendering, VoiceOver, and on-device scroll behavior. Confirm on the iPhone after the service worker updates.
