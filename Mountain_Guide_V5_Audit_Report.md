# Don Downs Mountain Guide — Version 5 Pre-Deployment Audit

Audit target: the uploaded Version 5 ZIP (authoritative). Live site and repository were not used as references. Static analysis, data verification, and live link verification were performed; no real iPhone, Safari, or live-NWS execution was possible in this environment, and those items are marked Not tested.

---

## 1. Release recommendation

**Deploy after minor corrections.**

The code is well-constructed: syntax is valid, every referenced DOM id and inline handler resolves, all NWS-derived strings are HTML-escaped, resets are correctly scoped, and the weather language is careful ("listed wind," "Planning aid only—not a safety clearance"). No JavaScript runtime blocker was found.

However, three High-severity issues should be corrected in the same upload, because each undermines a core safety promise of the app: **(1)** the "Lake Como area" forecast coordinates actually point to the ~7,900 ft valley-floor parking area, 6.5 km from the 11,750 ft lake the label claims; **(2)** the service worker can overwrite the offline copy of the app with a server error page, breaking offline relaunch in the field; **(3)** after any future deployment, the service worker can serve a new index.html with the old app.js/styles.css until the update banner is applied, risking runtime failures mid-session. All three have minimal patches below.

---

## 2. Findings table

| ID | Sev. | Category | File / location | Reproduction | Expected | Actual / likely | Correction |
|----|------|----------|-----------------|--------------|----------|-----------------|------------|
| F1 | **High** | Data accuracy / misleading weather | `app.js` line 12 (`{id:'lake',…lat:37.53861,lon:-105.57611,elevationFt:11750}`); `index.html` line 87 (`wx-lake` MapClick link, same coords) | Select "Lake Como area · 11,750 ft"; compare grid elevation shown vs. the labeled elevation | Forecast for the lake/camp at ~11,750 ft (USGS: 37.5696, −105.5141, 11,749 ft) | The point is **0.4 km from the ~7,870 ft base parking area** and **6.5 km from the actual lake**. NWS returns a valley-floor grid: warmer temps, different wind — misleading for the Saturday approach and the pre-summit camp night | Patch A: change to `lat:37.56960, lon:-105.51406` in both files |
| F2 | **High** | Service worker / offline reliability | `sw.js` navigation branch (`cache.put('./index.html',copy)` with no `response.ok` check) | While online, GitHub Pages returns a 404/500/maintenance page for one navigation; then go offline and relaunch | Offline relaunch always shows the last good app shell | The error page is cached **as** `./index.html`; the next offline launch (at a trailhead) shows the error page instead of the guide | Patch B: only cache when `response.ok`; fall back to the cached shell on a non-OK response |
| F3 | **High** | Service worker / version consistency | `sw.js`: navigations are network-first, but `app.js`/`styles.css` are cache-first | Deploy a future V6 that renames an element; load the site before tapping "Update now" | HTML, JS, and CSS always come from the same version | Old SW serves **new** index.html + **old** app.js/styles.css until the banner is applied → possible `null`-element errors / broken handlers | Patch B: serve navigations cache-first; new versions arrive atomically via the existing versioned-cache install + update banner |
| F4 | Medium | Service worker / UX | `app.js` line 335 `controllerchange → location.reload()` with `clients.claim()` in `sw.js` | Visit the site for the first time (or after clearing site data) | Page loads once | `claim()` fires `controllerchange` seconds after first load → the page reloads mid-read | Patch C: only reload when the user pressed "Update now" |
| F5 | Medium | Time-zone / date logic | `app.js` lines 95–99 `openToday()` uses `d.getDate()` (device-local, day-of-month only) | Tap "Today" on Sept 19, or on the 22nd of any month; or with device timezone ≠ Denver near midnight | "Today" opens the correct trip day only during Aug 19–25, 2026 (Mountain Time), and behaves sensibly otherwise | Any month's 19th–25th opens a trip day as if current; days 1–18/26–31 silently open Saturday; matching uses device timezone, not America/Denver | Patch D: match full Denver ISO dates via existing `denverParts()` |
| F6 | Medium | Misleading status | `app.js` line 316 (hero refresh click handler) | Go offline; tap the hero refresh button | "Offline — showing the last saved forecast" | The offline toast is immediately replaced by "Selected forecast refreshed" (refreshLocation resolves with stored data) | Patch E: only show the success toast after a real network refresh |
| F7 | Medium | Network resilience | `app.js` lines 125–129 `fetchJson()` — no timeout | Weak 1-bar LTE at a trailhead; request stalls | Refresh fails cleanly and saved data is retained | Button spins indefinitely; the sequential Trip Intelligence loop stalls on one hung request | Patch F: 15 s AbortController timeout |
| F8 | Medium | Accessibility (WCAG 4.1.2 / 1.4.1) | `index.html` lines 33–36 (mode toggle), 294–300 (bottom nav); `app.js` lines 190, 329 | VoiceOver over the "Now + 6 hours / Trip window" toggle and bottom nav | Toggle state and current section announced | Active state is conveyed by color/class only; no `aria-pressed` / `aria-current` | Patch G: set `aria-pressed` on mode buttons and `aria-current` on the active nav link |
| F9 | Low | Storage resilience | `app.js` — all `localStorage.setItem` calls unguarded (e.g., journal input line 87, weather store lines 153/156) | Storage quota exceeded or restricted context | Write fails silently; app keeps working | Uncaught exception in the input/refresh path | Wrap writes in a small `safeSet()` try/catch helper |
| F10 | Low | iOS Safari compatibility | `styles.css` — `backdrop-filter` used without `-webkit-` prefix (`.ghost`, `.nav`, `.summit-weather`, `.bottom-nav`) | iOS Safari 16–17 | Glass blur renders | Blur silently absent (backgrounds are opaque enough that contrast survives — degradation is graceful) | Add `-webkit-backdrop-filter` beside each use |
| F11 | Low | Edge-case rendering | `app.js` line 123 `Math.min(...temps)` with a possibly empty array | NWS returns non-numeric temperatures for every target-window period | A "not available" message | Trip window renders `Infinity–-Infinity°F` | Guard: if `!temps.length` treat as `available:false` |
| F12 | Low | Data honesty | `app.js` line 113 — null `probabilityOfPrecipitation` becomes `0` | NWS omits PoP for a period | Missing data flagged as unknown | Displayed as "0%" precipitation | Acceptable trade-off; optionally render "—" when the source value is null |
| F13 | Low | Code hygiene | `app.js` line 81 — `${p.status}` not passed through `escapeHtml` | n/a (PEAKS is static) | Consistent escaping discipline | Safe today; a future dynamic status would be injectable | `escapeHtml(p.status)` |
| F14 | Low | PWA icons | `icon-192.png` / `icon-512.png`, manifest `purpose:"any maskable"` | Android maskable/circle mask | Key content within the inner 80 % safe zone | Icons are fully opaque edge-to-edge (verified — no transparent-corner artifacts), but the baked-in rounded inner border will be clipped by circular masks. Cosmetic only | Optionally regenerate the maskable variants without the drawn border |
| F15 | Low | Freshness transparency | `app.js` — `sourceUpdatedAt` captured (line 141) but never displayed | Fetch a forecast NWS last updated hours ago | User can distinguish "fetched 5 min ago" from "NWS issued 4 h ago" | Only fetch age is shown | Optionally append "NWS updated {formatStamp(sourceUpdatedAt)}" in the panel footer |
| F16 | Low | Content labels | `index.html` select options / `app.js` `elevationFt` | Compare with 14ers.com current (post-LIDAR) figures | — | App shows Blanca 14,350 / Ellingwood 14,042 / Lindsey 14,048; 14ers.com now lists 14,351 / 14,057 / 14,055. Labels only; no functional effect | Optional label update |
| F17 | Low | External link | `index.html` line 213 `https://www.14ers.org/peaks/sangre-de-cristo-range/mount-lindsey/` | Open the link | CFI Mount Lindsey access page | The deep path could not be verified live (only `14ers.org/peaks/` was confirmed); risk of 404/redirect. Meanwhile the operative access fact — the **mandatory Trinchera Blanca Ranch waiver** — is best served directly | Replace/augment with `https://www.14ers.com/route.php?route=lind1` (standard route, states the waiver requirement) and the waiver site referenced there |
| F18 | Low | Privacy (judgment call) | `index.html` itinerary — "Depart Frederick with Vonda," family first names, exact away dates | View public page | Per the stated policy, exact addresses/numbers are excluded — and they are | The **combination** of home town + household names + specific Aug 19–24 absence dates is publicly advertised. Within your stated policy, but worth a conscious decision | Consider "Depart home" instead of "Depart Frederick"; everything else is your call |

Deliberately excluded as non-defects: the Aug 19–20 "Next best action" showing Trip Intelligence rather than "Open today" (defensible during travel days); the tall mobile hero (≤ 780 px sets 760 px min-height — scrolls fine, just tall on an iPhone SE); the footer "net2" status dot being static text.

---

## 3. Blocking patch set (High findings)

### Patch A — Lake Como coordinates (F1)

`app.js`, line 12 — replace:

```js
 {id:'lake',name:'Lake Como area',lat:37.53861,lon:-105.57611,elevationFt:11750,targetDate:'2026-08-22',startHour:8,endHour:17,tripLabel:'Saturday approach'},
```

with:

```js
 {id:'lake',name:'Lake Como area',lat:37.56960,lon:-105.51406,elevationFt:11750,targetDate:'2026-08-22',startHour:8,endHour:17,tripLabel:'Saturday approach'},
```

`index.html`, line 87 (`wx-lake` card) — replace the link:

```html
href="https://forecast.weather.gov/MapClick.php?lat=37.53861&lon=-105.57611"
```

with:

```html
href="https://forecast.weather.gov/MapClick.php?lat=37.56960&lon=-105.51406"
```

After this change the displayed NWS grid elevation should land near the labeled 11,750 ft instead of ~8,000 ft — a built-in sanity check that the fix took.

### Patch B — Service worker: no error-page poisoning, version-consistent shell (F2 + F3)

`sw.js` — replace the navigation branch:

```js
 if(event.request.mode==='navigate'){
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));return response}).catch(()=>caches.match('./index.html')));
  return;
 }
```

with:

```js
 if(event.request.mode==='navigate'){
  event.respondWith(caches.match('./index.html').then(cached=>{
   const network=fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy))}
    return response
   }).catch(()=>cached);
   return cached||network
  }));
  return;
 }
```

Effects: (a) a non-OK server response is never stored as the app shell; (b) the shell is served from the same versioned cache as `app.js`/`styles.css`, so HTML and assets can never mismatch; (c) new deployments still arrive normally — the browser re-checks `sw.js` on navigation, the new cache installs in the background, and your existing "Update now" banner applies it atomically. Trade-off: page content updates only land through that banner flow, which is exactly the flow V5 already built.

### Patch C — reload only on a user-applied update (F4)

`app.js`, lines 333–337 — replace:

```js
 navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload())
}
function applyUpdate(){if(newWorker)newWorker.postMessage({type:'SKIP_WAITING'})}
```

with:

```js
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(window.__updateApplied)location.reload()})
}
function applyUpdate(){if(newWorker){window.__updateApplied=true;newWorker.postMessage({type:'SKIP_WAITING'})}}
```

### Recommended Medium patches (small, optional but advised)

**Patch D (F5)** — `app.js` lines 95–99, replace `openToday()`:

```js
function openToday(){
 const today=denverParts(new Date().toISOString()).date;
 const ids={'2026-08-19':'wed','2026-08-20':'thu','2026-08-21':'fri','2026-08-22':'sat','2026-08-23':'sun','2026-08-24':'mon','2026-08-25':'tue'};
 document.querySelectorAll('details.day').forEach(x=>x.open=false);
 const el=document.getElementById(ids[today]||'wed');
 if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}
 if(!ids[today])toast('Outside the Aug 19–25 window — showing Day 1');
}
```

**Patch E (F6)** — `app.js` line 316, replace the click handler:

```js
document.getElementById('heroWeatherRefresh').addEventListener('click',()=>{const wasOnline=navigator.onLine;refreshLocation(selectedWeatherId,{force:true}).then(()=>{if(wasOnline)toast('Selected forecast refreshed')}).catch(()=>{})});
```

**Patch F (F7)** — `app.js` lines 125–129, replace `fetchJson`:

```js
async function fetchJson(url){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 let r;
 try{r=await fetch(url,{headers:{Accept:'application/geo+json'},signal:controller.signal})}
 finally{clearTimeout(timer)}
 if(!r.ok)throw new Error(`Weather service returned HTTP ${r.status}`);
 return r.json()
}
```

**Patch G (F8)** — `index.html` mode buttons: add `aria-pressed="true"` / `aria-pressed="false"` to the two `[data-weather-mode]` buttons. `app.js` line 190, replace:

```js
document.querySelectorAll('[data-weather-mode]').forEach(b=>{const on=b.dataset.weatherMode===weatherMode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});
```

`app.js` line 329 (bottom nav), replace the toggle line:

```js
links.forEach(a=>{const on=a.getAttribute('href')==='#'+visible.target.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current')});
```

---

## 4. Mobile / PWA test matrix

| Scenario | Result | Basis |
|---|---|---|
| Desktop Chrome | Not tested | No browser in this environment |
| Desktop Safari | Not tested | — |
| iPhone Safari | Not tested | Static review found no iOS-blocking API use; all JS features used are iOS ≥ 15.4 (`.at()`, optional chaining, `color-mix` needs iOS 16.2+; see F10) |
| Installed iPhone PWA | Not tested | Manifest is valid; `apple-mobile-web-app-*` meta present; standalone detection and install coach implemented |
| First online load | Pass with caveat | F4 causes one spurious reload seconds after first load (Patch C) |
| Offline relaunch | Pass by design **after Patch B** | Pre-patch, F2 can poison the shell; CORE precache covers every referenced asset |
| Version update V4 → V5 | Not tested | V4's service worker was not in the package. Design is sound: new cache name `ddmg-v5-2026-08-02-1`, old caches deleted on activate, banner + SKIP_WAITING flow. Note: if any CORE asset 404s on the server, `cache.addAll` rejects and V5's SW silently never installs — verify all 11 files upload |
| NWS success | Pass (static reasoning) | points → forecastHourly → periods pipeline matches the current NWS schema; alerts fetched with `?point=lat,lon`; alert failure degrades to empty list |
| NWS partial failure | Pass (static reasoning) | Per-location failure preserves prior saved data (`app.js` 155–158); ok/fail counts accurate; in-flight dedupe prevents duplicate requests |
| NWS total failure | Pass with caveat | Clean error path and retained data, but no timeout (F7) can hang the sequential loop |
| Trip outside forecast horizon | Pass (static reasoning) | Explicit "horizon ends {date}" and "target hours not populated" states in both the hero panel and intel cards; `>7 days` planning-phase banner |
| Active-alert state | Pass (static reasoning) | Alert count flag in hero; named alerts (escaped) in intel cards, including the beyond-horizon branch |
| Dark mode | Pass (static reasoning) | `prefers-color-scheme` overrides cover tokens, callout, and devotional backgrounds |
| 200 % zoom | Pass with caveat | Full-page zoom scales the px-based layout correctly; text-only zoom has limited effect since sizes are px |
| VoiceOver / screen-reader reasoning | Partial | Good: `aria-live` on the weather body and toast, sr-only select label, labeled icon buttons, semantic checkboxes-in-labels. Gaps: F8 state semantics; `#refreshProgress` updates are not in a live region; the decorative `＋/–` summary pseudo-content may be announced by some readers |

Auto-refresh audit: launch + visibility-return + online-return + 30-minute interval refresh **only the selected location**, gated by a 0.5 h freshness check and an in-flight map; the 4-location loop runs only on explicit "Refresh Trip Intelligence." No request-loop risk found.

---

## 5. Link and data verification

All verification performed live on August 1, 2026.

**Correct (verified live):**

| App link | Resolves to | Verdict |
|---|---|---|
| `14ers.com/route.php?route=elli3` | Combination Route — Blanca and Ellingwood | ✓ intended target |
| `14ers.com/route.php?route=blan1` | Blanca Peak — Northwest Ridge (standard) | ✓ |
| `14ers.com/route.php?route=elli2` | Ellingwood Point South Face (standard) | ✓ |
| `peakstatus_peak.php?peakparm=10004` | Blanca Peak Condition Updates | ✓ |
| `peakstatus_peak.php?peakparm=10042` | Ellingwood Point Condition Updates | ✓ |
| `peakstatus_peak.php?peakparm=10043` | Mt. Lindsey Condition Updates | ✓ |
| `trailheadsview.php?thparm=sc01` | Lake Como (Blanca Pk) Trailhead | ✓ |
| `trailheadsview.php?thparm=sc02` | Huerfano/Lily Lake Trailhead | ✓ |
| `opensnow.com/news/post/colorado-14er-weather-forecasts` | Live, updated June 2025 | ✓ |
| `support.garmin.com/en-US/?faq=6yhhs5lLq01fp1S5460Pf9` | "Requesting Weather Forecasts With the Garmin Messenger App" | ✓ valid — but it is the **phone-app** variant; confirm it matches how your inReach unit requests weather, or add the device-specific FAQ |
| `weather.gov`, `windy.com`, hero/card `forecast.weather.gov/MapClick` links | Standard, stable | ✓ (the `wx-lake` MapClick link inherits F1 until Patch A) |

**Concerns:**

- **F1 (High):** "Lake Como area" coordinates (37.53861, −105.57611) sit at the ~7,870 ft base parking area, 6.5 km from the actual lake (USGS: 37.5696, −105.5141, 11,749 ft) while the UI labels the location 11,750 ft.
- **F17:** `14ers.org/peaks/sangre-de-cristo-range/mount-lindsey/` could not be confirmed live; only the `/peaks/` index was verified. Recommend the 14ers.com Lindsey standard route page instead, which also states the current access rule.
- **Access verification (content, not code):** Mount Lindsey is open **only via a mandatory Trinchera Blanca Ranch liability waiver**, signed online before the hike (reopened March 2025 after a multi-year closure; waiver covers the two routes from the Huerfano/Lily Lake trailhead). The Friday itinerary's "Lindsey waiver status" line is exactly right — consider linking the waiver directly.
- **Coordinates otherwise:** Blanca (≈ 35 m from the USGS summit), Ellingwood, Lindsey (matches 14ers.com's published 37.58389, −105.44490 exactly), and Great Sand Dunes (visitor-center area, ~8,175 ft) are all correct. Peak-database counts are internally consistent (35 completed / 15 goals = 50 entries; matches "35 → 38" and the section copy). Itinerary weekday labels all match the 2026 calendar; MDT (−06:00) offsets are correct for August.
- **Elevation labels (F16):** minor drift vs. 14ers.com's post-LIDAR figures (Ellingwood 14,057; Lindsey 14,055); cosmetic.

---

## 6. Final prioritized action list

1. **Patch A** — fix the Lake Como forecast coordinates in `app.js` and the `wx-lake` link in `index.html` (misleading camp/approach weather).
2. **Patch B** — service-worker navigation fix: never cache non-OK responses; serve the shell cache-first so HTML/JS/CSS can't mismatch (offline reliability is this app's core field promise).
3. **Patch C** — reload only on user-applied updates (removes the first-visit reload).
4. **Patch D** — make "Today" match full Mountain-Time dates, not day-of-month.
5. **Patch F** — add the 15 s timeout to NWS fetches (weak-signal trailhead resilience).
6. **Patch E** — stop the false "Selected forecast refreshed" toast when offline.
7. **Patch G** — `aria-pressed` on the forecast-mode toggle and `aria-current` on the bottom nav.
8. **F17** — swap the unverified 14ers.org link for the 14ers.com Lindsey standard-route page and link the ranch waiver; re-confirm waiver status during the Friday group check.
9. **F9 + F10** — guard `localStorage` writes; add `-webkit-backdrop-filter` prefixes.
10. **F18 (your call)** — consider "Depart home" instead of "Depart Frederick" on the public page, given the site also advertises the exact away dates. After upload, verify all 11 files deployed (a missing asset silently prevents the V5 service worker from installing) and confirm the grid elevation shown for Lake Como now reads ~11,000+ ft.
