# Version 15.3.2 QA Results

**Result: PASS — deployable after normal on-device verification**

## Static package checks

- All JavaScript files and the service worker pass syntax validation.
- Both HTML documents contain no duplicate IDs.
- All local HTML, CSS, manifest, script, image, and service-worker references resolve.
- All internal fragment links resolve.
- The web manifest parses and its icons exist.
- `js/version.js` is the only executable source containing `15.3.2`.
- No `15.3.1` executable version strings remain.
- No personal emergency-contact phone number or email address appears anywhere in the package.

## Chromium runtime checks

The full guide and Climb Mode were executed in Chromium with an isolated in-memory storage harness.

Verified:

1. With no personal contact stored, SMS and email drafts contain the complete trip update and no recipient.
2. A synthetic test phone/email can be saved in local storage.
3. After saving, both drafts are addressed to the locally stored test recipient.
4. The saved contact is available from both Climb Mode and the full guide.
5. Clear saved contact removes the local-storage record and returns both drafts to recipient-free mode.
6. Version 15.3.2 renders on both pages.
7. No application runtime errors occurred during the targeted contact workflow.

No real personal phone number or email address was used in the runtime test.

## Emergency-content checks retained from 15.3.1

- Blanca/Ellingwood and Lake Como map to Alamosa County.
- Mount Lindsey maps to Huerfano County.
- 911 remains visually separate and primary.
- Local county numbers are presented as sheriff/dispatch contacts, not as proof that rescue has been activated.
- Unverified jurisdictions display no guessed number.

## Required on-device deployment checks

- Enter the personal contact separately on the intended iPhone.
- Confirm Text Vonda opens Messages with the correct recipient and body.
- Confirm Email Vonda opens the preferred mail app with the correct recipient, subject, and body.
- Close and reopen both the full guide and Climb Mode to confirm persistence.
- Test after Airplane Mode relaunch.
- Confirm the footer and Climb Mode display Version 15.3.2.
