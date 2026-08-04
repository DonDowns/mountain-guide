# Don Downs Mountain Guide — Version 15.3.2

## Release purpose

Version 15.3.2 is a privacy and release-integrity correction to Version 15.3.1.

## Privacy correction

- Removes the personal emergency-contact phone number and email address from all public HTML, JavaScript, documentation, and release metadata.
- Adds a collapsible contact-setup panel to the full Emergency section and Climb Mode.
- Stores the phone number and email only in that browser's local storage.
- When no recipient is stored, Text Vonda and Email Vonda still open a complete draft but leave the recipient blank for manual selection.
- Clear saved contact removes both values from the device.
- Copy update remains available without a saved recipient.

## Release-integrity correction

- The build is generated from the clean, previously verified Version 15.3.1 extraction rather than the later altered working directory.
- `index.html` and the service worker both load `js/v15_3_2.js`, and the file is present in the package.
- `js/version.js` remains the only executable source of the release number.
- The service-worker cache identifier and asset list are aligned to Version 15.3.2.

## Safety behavior retained

- No hardcoded forecast is displayed.
- Missing forecast data produces an explicit unavailable state.
- Ellingwood's standard route remains `elli2`; the combination route remains `elli3`.
- Field checks and status notes remain device-local and persistent by objective and date.
- 911 remains the primary emergency action.
- County sheriff/dispatch contacts remain objective-specific and display verification dates and source links.
- The app never states that a message was sent or that rescue was activated.

## Deployment note

Personal contact details must be entered separately on each browser/device after deployment. Browser local storage is device- and browser-specific and may be cleared by the user, browser settings, private browsing, or site-data removal.
