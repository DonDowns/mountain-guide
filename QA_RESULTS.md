# Version 6 QA Results

## Automated checks

- `app.js` syntax: passed `node --check`
- `sw.js` syntax: passed `node --check`
- Manifest JSON: valid
- Duplicate HTML IDs: none
- Missing JavaScript DOM targets: none
- Missing local HTML assets: none
- Missing service-worker core assets: none
- External links without `noopener`: none
- Obsolete Lake Como valley coordinates: absent
- Correct Lake Como camp coordinates: present
- Capital-I `Index.html` in package: no

## Runtime interaction harness

An in-memory Chromium rendering harness completed without JavaScript page errors at desktop and iPhone-sized viewports. It verified:

- civil dawn calculation rendered as 5:58 AM for the Aug. 23 Blanca objective
- Summit Focus opened and closed
- objective start, first light, and turn/exit rendered
- Night Vision toggled the complete theme
- desktop and mobile screenshots rendered

The harness omitted service-worker registration and live NWS network calls because the execution environment blocks local browser navigation.

## Physical-device checks after deployment

- service-worker upgrade from 5.1 to 6
- installed iPhone layout and safe-area behavior
- live NWS refresh and active-alert responses
- offline relaunch after one online load
- VoiceOver
