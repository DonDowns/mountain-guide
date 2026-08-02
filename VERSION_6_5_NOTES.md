# Version 6.5

Two changes on the audited 6.4 base. No new subsystems, no dependencies.

## Added — turnaround countdown (a discipline timer, not a weather trigger)
A prominent countdown at the top of Summit Focus, against your OWN fixed
turnaround clock (the objective's turn time), not the forecast.

- Nudges at −60 (watch), −30 (warn), −15 (now), and past-turnaround, each
  escalating in color and urgency, with non-color cues for Night Vision.
- Every message hands the decision back and never asserts safety. The −0 and
  past states are framed as questions ("Are you descending? If not, why not?").
- Runs ONLY while the Focus panel is open. No notifications API, no background
  code, no service-worker involvement — GitHub Pages can't wake a closed app,
  so pretending otherwise would be dishonest. Set a real alarm on your watch too.
- Timer is created on open, cleared on every close path (button, Esc, overlay
  tap, Today) — verified no orphaned intervals.
- Only visible in a same-day window (6h before to 3h after the turnaround);
  hidden otherwise.

## Changed — Summit Focus hierarchy
The "Turn / exit" stat is now visually primary (gold, larger) so it outranks
Start and Astronomical dawn. The turnaround is the decision that matters; the
layout now says so.

## Changed — footer
Ended the edition-name accretion. Footer now reads simply "Version 6.5".

## Important honesty note carried from 6.4
The turnaround CHECK and this COUNTDOWN both use the forecast and your fixed
clock. Neither sees live conditions. Real turnaround decisions are made by
looking at the sky. Every state in both features defers to observed weather and
never shows a green light. Do not "improve" this by adding a confident
all-clear — that would be the dangerous change.

## Unchanged
Weather architecture, offline behavior, service-worker fetch strategy, privacy,
authoritative links, formation content, the honest online-only AI panel, and all
5.1 hardening.

## Verification
- app.js / sw.js syntax: pass; manifest JSON: pass
- every getElementById target exists; no duplicate IDs; noopener on all _blank
- all 11 precached assets present; cache bumped to ddmg-v6-5-2026-08-02-1
- countdown thresholds and Mountain-Time turn instant unit-tested (turn resolves
  to 11:30 AM MT exactly; nudges fire at the correct offsets)
- timer cleanup verified across all four close paths

## Recommended NEXT — subtraction, not addition
The highest-value remaining work is consolidation: make Summit Focus the default
view during Aug 19–25 (rather than a modal), and consider whether all three
display modes and the full formation set still earn their place. Hold the line
on new features.

## Still requires on-device verification
Installed iPhone PWA update, offline relaunch, live NWS states, VoiceOver.
