/* ============================================================
   Version 9.0 — Trip Builder Foundation
   Reusable local trip records. Lake Como remains the field-ready
   static expedition while future trips use this reusable schema.
   ============================================================ */
const TRIP_LIBRARY_KEY='ddmg-v9-trip-library';
const ACTIVE_TRIP_KEY='ddmg-v9-active-trip';
const TRIP_SCHEMA_VERSION=1;
let tripLibrary=[];
let activeTripId='';
let tripBuilderApplying=false;

function tripId(){
 return `trip-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
}
function tripIsoNow(){return new Date().toISOString()}
function tripSeedLakeComo(){
 return {
  id:'lake-como-2026',
  schemaVersion:TRIP_SCHEMA_VERSION,
  name:'Lake Como / Blanca / Ellingwood / Mount Lindsey 2026',
  peak:'Blanca Peak',
  routeId:'elli3',
  startPointId:'lake',
  climbDate:'2026-08-23',
  startDate:'2026-08-19',
  endDate:'2026-08-25',
  plannedStart:'04:15',
  turnaround:'11:30',
  partners:'Don Downs and climbing group',
  vehicle:'Audi Q5',
  lodging:'Lake Como camp; Fort Garland lodging before Mount Lindsey',
  summitWeatherId:'blanca',
  accessWeatherId:'lake',
  notes:'Blanca + Ellingwood primary summit day; Mount Lindsey separate Monday objective; Great Sand Dunes and Zapata Falls family day Friday.',
  prep:{gpx:false,map:false,photos:false,screens:false},generatedChecks:{},
  systemTrip:true,
  createdAt:'2026-08-03T00:00:00.000Z',
  updatedAt:tripIsoNow()
 };
}
function tripBlank(){
 const first=COLORADO_SUMMITS.find(x=>x.status!=='completed')||COLORADO_SUMMITS[0];
 return {
  id:tripId(),schemaVersion:TRIP_SCHEMA_VERSION,
  name:first?`${first.name} trip`:'New mountain trip',
  peak:first?.name||'',routeId:'',startPointId:'',
  climbDate:'',startDate:'',endDate:'',plannedStart:'04:30',turnaround:'11:30',
  partners:'',vehicle:'Audi Q5',lodging:'',summitWeatherId:'',accessWeatherId:'',notes:'',
  prep:{gpx:false,map:false,photos:false,screens:false},generatedChecks:{},
  systemTrip:false,createdAt:tripIsoNow(),updatedAt:tripIsoNow()
 };
}
function tripLoadLibrary(){
 const raw=storageGet(TRIP_LIBRARY_KEY);
 try{tripLibrary=raw?JSON.parse(raw):[]}catch(e){tripLibrary=[]}
 if(!Array.isArray(tripLibrary))tripLibrary=[];
 if(!tripLibrary.some(t=>t.id==='lake-como-2026'))tripLibrary.unshift(tripSeedLakeComo());
 activeTripId=storageGet(ACTIVE_TRIP_KEY)||'lake-como-2026';
 if(!tripLibrary.some(t=>t.id===activeTripId))activeTripId=tripLibrary[0]?.id||'';
 tripSaveLibrary(false);
}
function tripSaveLibrary(stamp=true){
 storageSet(TRIP_LIBRARY_KEY,JSON.stringify(tripLibrary));
 storageSet(ACTIVE_TRIP_KEY,activeTripId);
 if(stamp)renderLocalDataStamp?.();
}
function tripActive(){return tripLibrary.find(t=>t.id===activeTripId)||null}
function tripRouteById(id){return ROUTE_PROFILES.find(r=>r.id===id)||null}
function tripRoutesForPeak(peak){
 return ROUTE_PROFILES.filter(r=>r.peaks.includes(peak))
  .sort((a,b)=>Number(b.standard)-Number(a.standard)||Number(a.combo)-Number(b.combo)||a.label.localeCompare(b.label));
}
function tripPeakWeatherMatches(peak){
 const n=peak.toLowerCase().replace(/^mount /,'').replace(/ peak$/,'').trim();
 const future=FUTURE_WEATHER_POINTS.filter(p=>p.kind==='summit'&&p.name.toLowerCase().includes(n));
 const current=WEATHER_LOCATIONS.filter(p=>p.name.toLowerCase().includes(n));
 return [...current,...future];
}
function tripAccessWeatherMatches(route,peak){
 const group=(route?.range||COLORADO_SUMMITS.find(x=>x.name===peak)?.range||'').replace(' Range','');
 const future=FUTURE_WEATHER_POINTS.filter(p=>p.kind==='access'&&(p.group.includes(group)||group.includes(p.group)));
 const current=WEATHER_LOCATIONS.filter(p=>['lake','dunes'].includes(p.id));
 return [...current,...future];
}
function tripOption(select,value,label){
 const o=document.createElement('option');o.value=value;o.textContent=label;select.appendChild(o);
}
function tripPopulatePeaks(selected=''){
 const el=document.getElementById('tripPeak');if(!el)return;
 el.innerHTML='';
 COLORADO_SUMMITS.slice().sort((a,b)=>{
  const order={planned:0,remaining:1,completed:2};
  return order[a.status]-order[b.status]||a.range.localeCompare(b.range)||a.name.localeCompare(b.name)
 }).forEach(p=>tripOption(el,p.name,`${p.name} · ${p.status} · ${p.range}`));
 el.value=selected&&[...el.options].some(o=>o.value===selected)?selected:el.options[0]?.value||'';
}
function tripPopulateRoutes(peak,selected=''){
 const el=document.getElementById('tripRoute');if(!el)return;
 el.innerHTML='';
 const routes=tripRoutesForPeak(peak);
 if(!routes.length){tripOption(el,'',`No curated v8 route profile for ${peak}`);el.disabled=true;return}
 el.disabled=false;
 routes.forEach(r=>tripOption(el,r.id,`${r.standard?'Standard · ':r.combo?'Combo · ':''}${r.label} · ${r.cls}`));
 el.value=selected&&routes.some(r=>r.id===selected)?selected:(routes.find(r=>r.standard)?.id||routes[0].id);
}
function tripPopulateStarts(route,selected=''){
 const el=document.getElementById('tripStartPoint');if(!el)return;
 el.innerHTML='';
 const points=route?.startPoints||[];
 if(!points.length){tripOption(el,'default','Published route start');el.disabled=true;return}
 el.disabled=false;
 points.forEach(p=>tripOption(el,p.id,`${p.label} · ${p.miles} mi · ${Number(p.gain).toLocaleString()} ft`));
 el.value=selected&&points.some(p=>p.id===selected)?selected:points[0].id;
}
function tripPopulateWeather(peak,route,summitSelected='',accessSelected=''){
 const summit=document.getElementById('tripSummitWeather');
 const access=document.getElementById('tripAccessWeather');
 if(!summit||!access)return;
 summit.innerHTML='';access.innerHTML='';
 tripOption(summit,'','No summit point selected');
 tripPeakWeatherMatches(peak).forEach(p=>tripOption(summit,p.id,`${p.name}${p.approx?' · approx':''}`));
 tripOption(access,'','No access point selected');
 tripAccessWeatherMatches(route,peak).forEach(p=>tripOption(access,p.id,`${p.name}${p.approx?' · approx':''}`));
 summit.value=[...summit.options].some(o=>o.value===summitSelected)?summitSelected:(summit.options[1]?.value||'');
 access.value=[...access.options].some(o=>o.value===accessSelected)?accessSelected:(access.options[1]?.value||'');
}
function tripReadForm(){
 const val=id=>document.getElementById(id)?.value?.trim()||'';
 const checked=id=>!!document.getElementById(id)?.checked;
 const current=tripActive()||tripBlank();
 return {...current,
  name:val('tripName')||`${val('tripPeak')} trip`,
  peak:val('tripPeak'),routeId:val('tripRoute'),startPointId:val('tripStartPoint'),
  climbDate:val('tripClimbDate'),startDate:val('tripStartDate'),endDate:val('tripEndDate'),
  plannedStart:val('tripPlannedStart'),turnaround:val('tripTurnaround'),
  partners:val('tripPartners'),vehicle:val('tripVehicle'),lodging:val('tripLodging'),
  summitWeatherId:val('tripSummitWeather'),accessWeatherId:val('tripAccessWeather'),
  notes:val('tripNotes'),
  prep:{gpx:checked('tripGpxReady'),map:checked('tripMapReady'),photos:checked('tripPhotosReady'),screens:checked('tripScreensReady')},
  updatedAt:tripIsoNow()
 };
}
function tripApplyForm(trip){
 tripBuilderApplying=true;
 tripPopulatePeaks(trip.peak);
 tripPopulateRoutes(trip.peak,trip.routeId);
 const route=tripRouteById(document.getElementById('tripRoute')?.value);
 tripPopulateStarts(route,trip.startPointId);
 tripPopulateWeather(trip.peak,route,trip.summitWeatherId,trip.accessWeatherId);
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.value=v||''};
 set('tripName',trip.name);set('tripClimbDate',trip.climbDate);set('tripStartDate',trip.startDate);set('tripEndDate',trip.endDate);
 set('tripPlannedStart',trip.plannedStart);set('tripTurnaround',trip.turnaround);set('tripPartners',trip.partners);
 set('tripVehicle',trip.vehicle);set('tripLodging',trip.lodging);set('tripNotes',trip.notes);
 document.getElementById('tripGpxReady').checked=!!trip.prep?.gpx;
 document.getElementById('tripMapReady').checked=!!trip.prep?.map;
 document.getElementById('tripPhotosReady').checked=!!trip.prep?.photos;
 document.getElementById('tripScreensReady').checked=!!trip.prep?.screens;
 document.getElementById('tripBuilderHeading').textContent=trip.name||'New mountain trip';
 tripBuilderApplying=false;
 tripRenderContext();tripRenderGeneratedPlan();renderExpeditionBrief();if(typeof commandRender==='function')commandRender();if(typeof engineRenderCompleteness==='function')engineRenderCompleteness();if(typeof weatherReviewRender==='function')weatherReviewRender();
}
function tripStartPoint(route,id){
 return route?.startPoints?.find(p=>p.id===id)||null;
}
function tripDateLabel(v){
 if(!v)return 'Not set';
 const d=new Date(`${v}T12:00:00`);
 return Number.isNaN(d.getTime())?v:d.toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
}
function tripWeatherName(id){
 return locationById(id)?.name||futurePointById(id)?.name||'Not selected';
}
function tripRenderContext(){
 const data=tripReadForm();
 const route=tripRouteById(data.routeId);
 const start=tripStartPoint(route,data.startPointId);
 const miles=start?.miles??route?.miles;
 const gain=start?.gain??route?.gain;
 const routeBox=document.getElementById('tripRouteContext');
 const timing=document.getElementById('tripTimingContext');
 const offline=document.getElementById('tripOfflineContext');
 if(routeBox)routeBox.innerHTML=route?`
  <h3>${escapeHtml(route.label)}</h3>
  <div class="trip-fact-grid">
   <span><b>${escapeHtml(route.cls)}</b>Class</span>
   <span><b>${Number.isFinite(miles)?miles+' mi':'—'}</b>Round trip</span>
   <span><b>${Number.isFinite(gain)?Number(gain).toLocaleString()+' ft':'—'}</b>Gain</span>
   <span><b>${escapeHtml(route.range)}</b>Range</span>
  </div>
  <p>${escapeHtml(route.access||'Use the standard route profile and current trailhead information.')}</p>
  ${route.objective===false?'<p class="ri-flag" data-tone="stop">Reference route only — not marked as a current objective.</p>':''}
 `:`<p>No curated route profile is available for this peak yet.</p>`;
 if(timing)timing.innerHTML=`
  <h3>${escapeHtml(data.name||'Unnamed trip')}</h3>
  <p><b>Climb:</b> ${escapeHtml(tripDateLabel(data.climbDate))} · <b>Start:</b> ${escapeHtml(data.plannedStart||'not set')} · <b>Turn:</b> ${escapeHtml(data.turnaround||'not set')}</p>
  <p><b>Travel window:</b> ${escapeHtml(tripDateLabel(data.startDate))} to ${escapeHtml(tripDateLabel(data.endDate))}</p>
  <p><b>Partners:</b> ${escapeHtml(data.partners||'Not set')}<br><b>Transportation:</b> ${escapeHtml(data.vehicle||'Not set')}<br><b>Lodging/camp:</b> ${escapeHtml(data.lodging||'Not set')}</p>
  <p><b>Weather:</b> ${escapeHtml(tripWeatherName(data.summitWeatherId))} · ${escapeHtml(tripWeatherName(data.accessWeatherId))}</p>`;
 const ready=Object.values(data.prep||{}).filter(Boolean).length;
 if(offline)offline.innerHTML=`
  <h3>${ready} of 4 offline-preparation checks confirmed</h3>
  <p>${data.prep?.gpx?'✓':'○'} Route file · ${data.prep?.map?'✓':'○'} Offline map · ${data.prep?.photos?'✓':'○'} Route photos · ${data.prep?.screens?'✓':'○'} Screenshots</p>
  <p>This confirms only what was checked on this device; it does not certify route readiness.</p>`;
 const routeLink=document.getElementById('tripOpenRoute');
 if(routeLink){
  routeLink.href=route?.url||'#';
  routeLink.setAttribute('aria-disabled',route?.url?'false':'true');
 }
}
function tripRenderLibrary(){
 const select=document.getElementById('tripLibrarySelect');
 const list=document.getElementById('tripLibraryList');
 if(select){
  select.innerHTML='';
  tripLibrary.forEach(t=>tripOption(select,t.id,`${t.name}${t.id===activeTripId?' · active':''}`));
  select.value=activeTripId;
 }
 if(list)list.innerHTML=tripLibrary.map(t=>`
  <button class="trip-library-item ${t.id===activeTripId?'active':''}" data-trip-load="${escapeHtml(t.id)}" type="button">
   <b>${escapeHtml(t.name)}</b>
   <small>${escapeHtml(t.peak||'No peak')} · ${escapeHtml(tripDateLabel(t.climbDate))}</small>
  </button>`).join('');
 document.querySelectorAll('[data-trip-load]').forEach(btn=>btn.addEventListener('click',()=>tripLoad(btn.dataset.tripLoad)));
}
function tripLoad(id){
 const trip=tripLibrary.find(t=>t.id===id);if(!trip)return;
 activeTripId=id;tripSaveLibrary();tripRenderLibrary();tripApplyForm(trip);
 document.getElementById('trip-builder')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function tripSave(){
 const data=tripReadForm();
 const i=tripLibrary.findIndex(t=>t.id===data.id);
 if(i>=0)tripLibrary[i]=data;else tripLibrary.unshift(data);
 activeTripId=data.id;tripSaveLibrary();tripRenderLibrary();tripApplyForm(data);
 tripRenderGeneratedPlan();renderExpeditionBrief();toast('Trip saved on this device');
}
function tripNew(){
 const data=tripBlank();tripLibrary.unshift(data);activeTripId=data.id;tripSaveLibrary();tripRenderLibrary();tripApplyForm(data);
}
function tripDuplicate(){
 const source=tripLibrary.find(t=>t.id===(document.getElementById('tripLibrarySelect')?.value||activeTripId));
 if(!source)return;
 const copy={...JSON.parse(JSON.stringify(source)),id:tripId(),name:`${source.name} — copy`,systemTrip:false,createdAt:tripIsoNow(),updatedAt:tripIsoNow()};
 tripLibrary.unshift(copy);activeTripId=copy.id;tripSaveLibrary();tripRenderLibrary();tripApplyForm(copy);toast('Trip duplicated');
}
function tripDelete(){
 const trip=tripActive();if(!trip||trip.systemTrip){toast('The Lake Como seed trip is preserved');return}
 if(!confirm(`Delete “${trip.name}” from this device? This cannot be undone.`))return;
 tripLibrary=tripLibrary.filter(t=>t.id!==trip.id);activeTripId=tripLibrary[0]?.id||'';tripSaveLibrary();tripRenderLibrary();tripApplyForm(tripActive()||tripBlank());
}
function tripBuilderAiContext(){
 const t=tripActive();
 if(!t)return 'Lake Como / Blanca / Ellingwood / Mount Lindsey, August 19–25, 2026';
 const route=tripRouteById(t.routeId);
 return `${t.name}; primary peak ${t.peak||'not set'}; route ${route?.label||'not set'}; climb date ${t.climbDate||'not set'}; trail start ${t.plannedStart||'not set'}; turnaround ${t.turnaround||'not set'}; partners ${t.partners||'not set'}; transportation ${t.vehicle||'not set'}; lodging/camp ${t.lodging||'not set'}`;
}

/* ============================================================
   Version 9.1 — Generated Itinerary and Readiness
   ============================================================ */
function tripDurationDays(trip){
 if(!trip.startDate||!trip.endDate)return 1;
 const a=new Date(`${trip.startDate}T12:00:00`);
 const b=new Date(`${trip.endDate}T12:00:00`);
 const diff=Math.round((b-a)/86400000)+1;
 return Number.isFinite(diff)&&diff>0?diff:1;
}
function tripRouteStats(trip){
 const route=tripRouteById(trip.routeId);
 const start=tripStartPoint(route,trip.startPointId);
 return {
  route,
  miles:start?.miles??route?.miles??null,
  gain:start?.gain??route?.gain??null,
  cls:route?.cls||'Unknown',
  commitment:route?.commitment||'Not rated',
  water:route?.water||'Not specified'
 };
}
function tripEstimateMovingHours(trip){
 const s=tripRouteStats(trip);
 if(!Number.isFinite(s.miles)&&!Number.isFinite(s.gain))return null;
 const miles=Number.isFinite(s.miles)?s.miles:0;
 const gain=Number.isFinite(s.gain)?s.gain:0;
 let hours=(miles/2)+(gain/2000);
 if(/Class 3|Class 4/.test(s.cls))hours*=1.2;
 if(/Considerable|High|Extreme/i.test(s.commitment))hours*=1.15;
 return Math.max(2,Math.round(hours*2)/2);
}
function tripTimeToMinutes(v){
 if(!/^\d{2}:\d{2}$/.test(v||''))return null;
 const [h,m]=v.split(':').map(Number);return h*60+m;
}
function tripMinutesToTime(n){
 if(!Number.isFinite(n))return '';
 n=((Math.round(n)%1440)+1440)%1440;
 const h=Math.floor(n/60),m=n%60;
 return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function tripGeneratedChecklist(trip){
 const stats=tripRouteStats(trip);
 const long=Number.isFinite(stats.miles)&&stats.miles>=10;
 const highGain=Number.isFinite(stats.gain)&&stats.gain>=4000;
 const technical=/Class 3|Class 4/.test(stats.cls);
 const multi=stats.route?.peaks?.length>1||stats.route?.combo;
 const overnight=tripDurationDays(trip)>1||/camp|basin|backpack/i.test(`${trip.lodging} ${trip.notes}`);
 const checks=[
  ['route-reviewed','Review the current standard-route page and recent condition reports','route'],
  ['trailhead-reviewed','Verify trailhead access, road status, parking, permits, and closures','route'],
  ['weather-refreshed','Refresh summit and access forecasts when the climb enters the forecast horizon','weather'],
  ['turnaround-reviewed','Confirm start time, turnaround target, and descent margin','timing'],
  ['offline-nav','Confirm GPX/KML, offline map, route photos, and screenshots','navigation'],
  ['communication-plan','Confirm inReach setup, contacts, check-in plan, and charger','communication'],
  ['water-plan','Set water carry and refill plan','water'],
  ['fuel-plan','Set calorie plan for the expected duration','food']
 ];
 if(long||highGain)checks.push(['extra-margin','Add food, water, light, and time margin for the long/high-gain day','margin']);
 if(technical)checks.push(['technical-review','Review exposure, descent, helmet, route-finding, and group ability','technical']);
 if(multi)checks.push(['second-summit-decision','Define the decision point before committing to the second summit','timing']);
 if(overnight)checks.push(['camp-system','Confirm camp, sleep, stove/fuel, and morning repack system','camp']);
 return checks;
}
function tripCheckId(trip,key){return `${trip.id}:${key}`}
function tripGeneratedCheckValue(trip,key){return !!trip.generatedChecks?.[key]}
function tripSetGeneratedCheck(key,checked){
 const trip=tripActive();if(!trip)return;
 trip.generatedChecks={...(trip.generatedChecks||{}),[key]:checked};
 trip.updatedAt=tripIsoNow();
 const i=tripLibrary.findIndex(t=>t.id===trip.id);
 if(i>=0)tripLibrary[i]=trip;
 tripSaveLibrary();
 tripRenderGeneratedPlan();
}
function tripGeneratedSchedule(trip){
 const stats=tripRouteStats(trip);
 const moving=tripEstimateMovingHours(trip);
 const startM=tripTimeToMinutes(trip.plannedStart);
 const turnM=tripTimeToMinutes(trip.turnaround);
 const summitEstimate=startM!==null&&moving!==null?tripMinutesToTime(startM+Math.round(moving*30)):null;
 const finishEstimate=startM!==null&&moving!==null?tripMinutesToTime(startM+Math.round(moving*60)):null;
 const rows=[];
 if(trip.startDate)rows.push(['Travel begins',tripDateLabel(trip.startDate),'Confirm drive, lodging/camp, and arrival buffer.']);
 if(trip.climbDate)rows.push(['Climb day',tripDateLabel(trip.climbDate),`Trail start ${trip.plannedStart||'not set'}; turnaround ${trip.turnaround||'not set'}.`]);
 if(summitEstimate)rows.push(['Planning estimate',`Summit midpoint ~${summitEstimate}`,`Derived from published ${stats.miles??'—'} miles / ${stats.gain??'—'} ft and route class; actual pace governs.`]);
 if(finishEstimate)rows.push(['Planning estimate',`Route finish ~${finishEstimate}`,'Not a promise; stops, terrain, weather, navigation, and group pace change this.']);
 if(turnM!==null&&startM!==null)rows.push(['Turnaround window',`${Math.max(0,turnM-startM)} minutes after start`,'The fixed clock remains a discipline tool, not a forecast clearance.']);
 if(trip.endDate)rows.push(['Trip ends',tripDateLabel(trip.endDate),'Archive notes, photos, route file, partners, and lessons learned.']);
 return rows;
}
function tripFuelWaterPlan(trip){
 const stats=tripRouteStats(trip);
 const hours=tripEstimateMovingHours(trip);
 const long=Number.isFinite(stats.miles)&&stats.miles>=10;
 const hot=/dry|limited/i.test(stats.water||'')||/sun|hot|dry/i.test(trip.notes||'');
 const liters=hours?Math.max(2,Math.min(5,Math.round((hours*(hot?0.55:0.4))*2)/2)):null;
 const calories=hours?Math.round(hours*225/50)*50:null;
 return {
  hours,
  liters,
  calories,
  statements:[
   liters?`Planning starting point: about ${liters} L total fluid capacity, adjusted for refill reliability, heat, and personal sweat rate.`:'Set fluid capacity after route duration and refill points are confirmed.',
   calories?`Planning starting point: about ${calories} kcal of accessible moving fuel, plus reserve.`:'Set accessible calories after duration is confirmed.',
   long?'Long-day margin applies: keep an emergency calorie reserve and protect the final descent fuel.':'Use food that remains tolerable and accessible while moving.',
   'These are planning estimates, not individualized hydration or nutrition prescriptions.'
  ]
 };
}
function tripWeatherWindowState(trip){
 if(!trip.climbDate)return {tone:'none',title:'No climb date set',body:'Set a climb date before the app can evaluate forecast-horizon timing.'};
 const target=new Date(`${trip.climbDate}T12:00:00`);
 const now=new Date();
 const days=Math.ceil((target-now)/86400000);
 if(days>8)return {tone:'none',title:`Forecast window opens in about ${days-7} day${days-7===1?'':'s'}`,body:'Do not substitute today’s weather for the planned climb date. Refresh when the target enters the NWS horizon.'};
 if(days>=0)return {tone:'watch',title:'Climb is inside the practical forecast horizon',body:'Refresh both summit and access points. Use the forecast as evidence; actual sky, wind, terrain, access, pace, and group condition govern.'};
 return {tone:'none',title:'Climb date has passed',body:'Archive the trip or revise its date before using forecast planning.'};
}
function tripRenderGeneratedPlan(){
 const trip=tripActive()||tripReadForm();
 if(!trip)return;
 const summary=document.getElementById('tripPlanSummary');
 const scheduleEl=document.getElementById('tripGeneratedSchedule');
 const routeEl=document.getElementById('tripGeneratedRouteReview');
 const fuelEl=document.getElementById('tripGeneratedFuelWater');
 const commEl=document.getElementById('tripGeneratedCommunication');
 const weatherEl=document.getElementById('tripGeneratedWeatherWindow');
 const readinessEl=document.getElementById('tripGeneratedReadiness');
 if(!summary||!scheduleEl||!routeEl||!fuelEl||!commEl||!weatherEl||!readinessEl)return;

 const checks=tripGeneratedChecklist(trip);
 const done=checks.filter(([key])=>tripGeneratedCheckValue(trip,key)).length;
 summary.textContent=`${trip.name}: ${done} of ${checks.length} generated planning checks confirmed on this device.`;

 const schedule=tripGeneratedSchedule(trip);
 scheduleEl.innerHTML=schedule.length?`<div class="generated-timeline">${schedule.map(([label,time,note])=>`
  <div><b>${escapeHtml(label)}</b><strong>${escapeHtml(time)}</strong><small>${escapeHtml(note)}</small></div>`).join('')}</div>`:'<p>Set dates and timing to generate the schedule.</p>';

 const stats=tripRouteStats(trip);
 routeEl.innerHTML=stats.route?`
  <h4>${escapeHtml(stats.route.label)}</h4>
  <p>${escapeHtml(stats.cls)} · ${Number.isFinite(stats.miles)?stats.miles+' miles':'distance unavailable'} · ${Number.isFinite(stats.gain)?Number(stats.gain).toLocaleString()+' ft gain':'gain unavailable'}</p>
  <p>Commitment: ${escapeHtml(stats.commitment)}. Water: ${escapeHtml(stats.water)}.</p>
  <p>Review current route, trailhead, access, closures, condition reports, and descent before departure.</p>`:'<p>No curated route profile is selected.</p>';

 const fuel=tripFuelWaterPlan(trip);
 fuelEl.innerHTML=`<ul class="generated-plan-list">${fuel.statements.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`;

 commEl.innerHTML=`<ul class="generated-plan-list">
  <li>Confirm inReach is charged, activated, paired, and tested.</li>
  <li>Confirm Garmin/watch and headlamps are charged; carry the appropriate charger block.</li>
  <li>Set check-in contacts, expected return, escalation time, and who initiates help.</li>
  <li>Keep phone route data, maps, and screenshots available offline.</li>
 </ul>`;

 const weather=tripWeatherWindowState(trip);
 weatherEl.innerHTML=`<div class="generated-weather-state" data-tone="${escapeHtml(weather.tone)}"><b>${escapeHtml(weather.title)}</b><p>${escapeHtml(weather.body)}</p></div>
  <p><b>Summit point:</b> ${escapeHtml(tripWeatherName(trip.summitWeatherId))}<br><b>Access point:</b> ${escapeHtml(tripWeatherName(trip.accessWeatherId))}</p>`;

 readinessEl.innerHTML=`<div class="generated-check-list">${checks.map(([key,label,group])=>`
  <label>
   <input type="checkbox" data-generated-check="${escapeHtml(key)}" ${tripGeneratedCheckValue(trip,key)?'checked':''}>
   <span><b>${escapeHtml(label)}</b><small>${escapeHtml(group)}</small></span>
  </label>`).join('')}</div>
  ${done===checks.length?'<p class="generated-complete-note">All generated planning checks are confirmed on this device. This is not a statement that the climb or pack is safe or complete.</p>':''}`;

 readinessEl.querySelectorAll('[data-generated-check]').forEach(input=>{
  input.addEventListener('change',()=>tripSetGeneratedCheck(input.dataset.generatedCheck,input.checked));
 });
}


