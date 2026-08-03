# Version 7.5.1 — Data Transfer Hardening

## Base

Built from Version 7.5.

## Fixes

Version 7.5 added the right feature but had three defects. Version 7.5.1 hardens the implementation.

### 1. Import confirmation

Import now requires confirmation before replacing local Mountain Guide data. The dialog shows:

- backup date when available
- number of Mountain Guide data keys to import
- warning that the import replaces local data and cannot be undone

After import, the app reloads so every screen uses the imported values.

### 2. App-scoped export/import

Export and import are now scoped to Mountain Guide keys only:

`ddmg-*`

The export no longer dumps unrelated localStorage keys from the domain, and import no longer writes non-Mountain-Guide keys.

### 3. No global browser monkey patch

Version 7.5 used a global `Storage.prototype.setItem` wrapper. Version 7.5.1 removes that and routes the data stamp through the app’s own `storageSet()` helper instead.

## Deliberately not added

No “appears unsynced” detector. With no backend/account, the app cannot know whether another device has newer data.

## Preserved

- Version 7.4 single-source ledger-fact rendering
- Version 7.4 this-device readiness labeling
- Version 7.4.1 partner corrections
- Mount Columbia: Don Downs, Mike Brown, David Harbin, and Dr. Charles Jansen
- Belford/Oxford: Logan Jones, Amy, and David Schultheis
- Version 7.3.1 first-climb correction
- Version 7.2 photo-verified gear inventory and one-time gear refresh
- Version 7.1.5 fuel/coffee/RTE meal logic
- Lake Como itinerary
- Fort Garland lodging
- Weather and offline operation
- Summit Focus
- No green/all-clear safety states
- All turnaround prompts remain question-framed

## Service worker

`ddmg-v7-5-1-2026-08-03-1`
