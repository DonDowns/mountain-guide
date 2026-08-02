# Version 7.1.5 — Camp Fuel, Coffee & RTE Meals

Built on the audited 7.1.4 base. Data and coaching additions only — no new
subsystems, no UI restructuring.

## Added — gear items (Lake Como preset, Paragon 60 section)
- **Instant coffee** — for the Sunday 3:30 AM camp breakfast before the
  Blanca/Ellingwood start.
- **Ready-to-eat (RTE) meals** — no-stove meals, counted per meal: Saturday
  trail lunch, Sunday break-camp meal, Monday pre-dawn Lindsey breakfast and
  trailhead food. (The motel covers Sunday dinner.)

## Updated — shared stove & fuel
- **Mike Brown's stove** (was "Friend's stove"): used exactly twice — Saturday
  camp dinner and Sunday 3:30 AM breakfast; Sunday night is the motel. Confirm
  the handoff and fuel match.
- **Stove fuel (Don carries)** — status set to "needs verification" until the
  stove type is confirmed. Note now carries the fuel coaching: confirm Mike's
  stove type first; if canister (most common), one 230 g isobutane canister
  covers both camp uses for four with margin; cold weakens canister pressure —
  keep it in the tent overnight and warm it in a jacket before the 3:30 AM
  boil; if liquid-fuel, bring what Mike specifies; test-fit fuel to stove at
  the Friday evening readiness check.

## Itinerary — two lines
- Saturday arrival: camp dinner = RTE + hot water on Mike Brown's stove; Don
  carries the fuel.
- Sunday 3:30 AM: instant coffee and breakfast — the trip's last stove use;
  keep the canister warm overnight.

## Mechanism note (for future maintainers)
The gear locker merge gives STORED items precedence over seed data, so seed
edits to existing IDs never reach devices that already saved a locker. This
release therefore includes a one-time refresh (flag `ddmg-v7-1-5-fuelnotes`)
that updates only the name/note/status/location of `sharedStove` and
`sharedFuel` in the merged locker, then saves. New items (`instantCoffee`,
`rteMeals`) flow through the normal merge automatically. Any future seed edit
to an EXISTING item id needs the same treatment or it will silently not appear.

## Preserved
All 7.1.4 features and every safety behavior: no green/all-clear states, all
five countdown prompts question-framed, turnaround check, migration flags,
hardening, precache (24 assets), escaping discipline.

## Verification
Syntax, manifest, DOM ids, duplicates, precache existence, CSS balance, and
safety greps all pass. Cache: ddmg-v7-1-5-2026-08-02-1.
