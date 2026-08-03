# Version 7.4.1 — Single Source of Truth With Partner Corrections

## Base

Built from Claude's Version 7.4 package.

Version 7.4 correctly addressed the single-source-of-truth problem:

- ledger facts are computed from the summit dataset
- milestone strip is generated from ascent records
- readiness is labeled as this-device local data
- static hardcoded summit-stat drift is avoided

## Partner corrections re-applied

Claude's 7.4 package was built from an older base and did not include the final partner corrections from Versions 7.3.2 and 7.3.3. Version 7.4.1 merges those corrections back in.

### Mount Columbia

Mount Columbia is recorded as climbed by:

- Don Downs
- Mike Brown
- David Harbin
- Dr. Charles Jansen

It is explicitly not recorded as climbed with David Schultheis or Logan Jones.

### Belford/Oxford

Mount Belford and Mount Oxford are recorded as a combo climb on September 14, 2019, with:

- Logan Jones
- Amy
- David Schultheis

## Preserved

- Version 7.4 single-source ledger-fact rendering
- Version 7.4 this-device readiness labeling
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

`ddmg-v7-4-1-2026-08-03-1`
