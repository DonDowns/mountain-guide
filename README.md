# Don Downs Mountain Guide — Version 5.1 Audited

Version 5.1 Audited is the upload-ready web and iPhone Home Screen release.

## Material improvements in this release
- Polished selectable summit-weather panel in the hero area
- Current six-hour forecast and trip-window modes
- Automatic refresh on launch, foreground return, location change, and every 30 minutes while open
- Cached last-successful forecast for offline use
- Forecast-grid elevation shown beside the mountain/location elevation
- Objective planning flags for wind, thunderstorms, precipitation, near-freezing temperatures, active alerts, and stale data
- Mobile bottom navigation modeled after native iPhone apps
- Contextual “Next best action” card
- Shareable, privacy-safe expedition status
- iPhone installation coach
- Better focus states, reduced-motion support, and responsive behavior
- Existing Version 4 Trip Intelligence, condition-review workflow, checklists, journal, 14er database, field mode, dark mode, and offline service worker retained

## Upload to GitHub
1. Download and unzip the Version 5.1 Audited package.
2. Open the `DonDowns/mountain-guide` repository.
3. Select **Add file → Upload files**.
4. Drag every extracted file into GitHub.
5. Keep the existing `CNAME` file.
6. Commit directly to `main` with: `Deploy Mountain Guide v5`.
7. Wait 1–3 minutes and open `https://mountainguide.vondadowns.com`.
8. On Mac, use **Command + Shift + R** if an older version remains.
9. On iPhone, open the site in Safari, tap **Share → Add to Home Screen**, launch once online, then test in Airplane Mode.

## Weather behavior
Weather is supplied by the official National Weather Service API. The panel displays forecast-grid data, not a summit instrument reading. It refreshes while the app is active; iOS does not guarantee continuous background refresh while the web app is closed.

## Privacy
The public app excludes exact addresses, reservation numbers, private phone numbers, and other sensitive travel details.


## Independent audit corrections applied

This package incorporates the independent pre-deployment audit:

- Lake Como forecast point moved from the 8,000-ft road trailhead to the lake/camp area near 11,750 ft.
- Service-worker navigation is cache-consistent and will not replace the offline shell with an error page.
- Initial service-worker control no longer forces a mid-read reload.
- Today logic matches complete Mountain Time dates.
- NWS requests time out after 15 seconds and preserve saved data.
- Offline manual refresh no longer reports false success.
- Forecast-mode and bottom-navigation states expose accessibility attributes.
- Local storage access is guarded against restricted/quota failures.
- Missing precipitation data displays as unknown rather than 0%.
- NWS issue time is displayed separately from fetch time.
- Mount Lindsey standard route and required waiver are directly linked.
- Public itinerary says “home” rather than publishing the home town.
