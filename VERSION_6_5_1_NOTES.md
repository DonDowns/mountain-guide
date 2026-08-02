# Version 6.5.1 — Safety Language Fix

This patch preserves Version 6.5 and changes only the most safety-sensitive presentation:

1. The turnaround-vs-forecast check no longer uses a green check mark or an `ok` state when no threshold risk appears in the saved forecast.
2. The neutral message now explicitly states that absence of a listed threshold is not an all-clear.
3. Every turnaround countdown message now ends with a question rather than a command.
4. The service-worker cache is bumped to `ddmg-v6-5-1-2026-08-02-1`.

The fixed turnaround clock, forecast comparison, Summit Focus behavior, AI companion, formation content, weather architecture, and all 5.1 hardening remain unchanged.
