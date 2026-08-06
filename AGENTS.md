# Mountain Guide standing project rules

These rules apply to the entire repository.

1. `main` is production only.
2. All changes require a `feature/*`, `fix/*`, `hotfix/*`, or `docs/*` branch.
3. Never commit directly to `main`.
4. Never push or merge without explicit user approval.
5. `js/version.js` is the single release-version source.
6. Any browser-served file change requires synchronized version, release-module, service-worker cache, and README updates.
7. Never fabricate weather, route, safety, emergency, or rescue state.
8. Weather is evidence, not permission.
9. Never add all-clear, safe-to-go, or route-authorization language.
10. Emergency messaging must never claim that rescue was requested or activated.
11. SMS and email actions create drafts only; they never claim a message was sent.
12. Personal contacts remain device-local and must never be committed.
13. `.DS_Store`, dependencies, browser profiles, reports, screenshots, videos, traces, logs, coverage, and other generated artifacts must never be committed.
14. Service-worker changes require upgrade and offline regression tests.
15. Physical-iPhone verification remains mandatory for PWA-sensitive releases.
16. Road to 50 expectations must derive from app data rather than permanent hardcoded counts.
17. Failed checks block merge.
18. Codex may not merge without explicit user approval.
