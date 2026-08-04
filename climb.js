/* ============================================================
   Version 10.0 — Intelligent Expedition Builder
   ============================================================ */
function expeditionPeaks(){
 return COLORADO_SUMMITS.slice().sort((a,b)=>{
  const order={planned:0,remaining:1,completed:2};
  return order[a.status]-order[b.status]||a.range.localeCompare(b.range)||a.name.localeCompare(b.name)
 });
}
function expeditionDefaultDate(){
 const d=new Date();d.setDate(d.getDate()+14);
 return d.toISOString().slice(0,10);
}
function expeditionStandardRoute(peak){
 const routes=tripRoutesForPeak(peak);
 return routes.find(r=>r.standard&&!r.combo)||routes.find(r=>r.standard)||routes[0]||null;
}
function expeditionStyleFor(route,explicit='auto'){
 if(explicit&&explicit!=='auto')return explicit;
 if(route?.combo||route?.peaks?.length>1)return 'combo';
 const miles=Math.max(...(route?.startPoints||[]).map(p=>Number(p.miles)||0),Number(route?.miles)||0);
 const gain=Math.max(...(route?.startPoints||[]).map(p=>Number(p.gain)||0),Number(route?.gain)||0);
 if(miles>=14||gain>=5500||/camp|basin|backpack/i.test(route?.access||''))return 'overnight';
 return 'day';
}
function expeditionPreferredStart(route,style){
 const points=route?.startPoints||[];
 if(!points.length)return null;
 if(style==='overnight')return points[0];
 if(style==='combo'){
  return points.find(p=>/upper|high|camp|basin/i.test(p.label))||points[Math.min(1,points.length-1)]||points[0];
 }
 return points.find(p=>/upper|outhouse|4wd|high/i.test(p.label))||points[0];
}
function expeditionPlanningHours(route,start,posture){
 const miles=start?.miles??route?.miles??0;
 const gain=start?.gain??route?.gain??0;
 let hours=(miles/2)+(gain/2000);
 if(/Class 3|Class 4/.test(route?.cls||''))hours*=1.2;
 if(/Considerable|High|Extreme/i.test(route?.commitment||''))hours*=1.15;
 const modifier=posture==='fast'?.86:posture==='conservative'?1.14:1;
 return Math.max(2,Math.round(hours*modifier*2)/2);
}
function expeditionRecommendedStart(route,style,date,posture){
 const hours=expeditionPlanningHours(route,expeditionPreferredStart(route,style),posture);
 let minutes=style==='overnight'?240:270;
 if(route?.combo||hours>=9)minutes-=30;
 if(/Class 3|Class 4/.test(route?.cls||''))minutes-=15;
 return tripMinutesToTime(minutes);
}
function expeditionRecommendedTurnaround(route,style,start,posture){
 const startM=tripTimeToMinutes(start)||270;
 const hours=expeditionPlanningHours(route,expeditionPreferredStart(route,style),posture);
 const latest=style==='overnight'?690:660;
 return tripMinutesToTime(Math.min(latest,startM+Math.round(hours*.62*60)));
}
function expeditionWeatherBindings(peak,route){
 const summit=tripPeakWeatherMatches(peak)[0]?.id||'';
 const access=tripAccessWeatherMatches(route,peak)[0]?.id||'';
 return {summit,access};
}
function expeditionVehicleRecommendation(route,start){
 const text=`${route?.access||''} ${start?.label||''}`.toLowerCase();
 if(/4wd|rough|high clearance|road/.test(text))return 'High-clearance vehicle recommended; verify current road conditions and driver comfort.';
 return 'Standard vehicle may be suitable; verify current trailhead road and parking conditions.';
}
function expeditionLodgingRecommendation(style,route){
 if(style==='overnight')return 'Plan trailhead/basin camp or nearby lodging; verify camping rules and water.';
 if(/san juan/i.test(route?.range||''))return 'Consider nearby lodging or camping to protect an early trail start.';
 return 'Day trip or nearby lodging depending on drive time and planned start.';
}
function expeditionPackStrategy(route,style){
 const start=expeditionPreferredStart(route,style);
 const miles=start?.miles??route?.miles??0;
 const gain=start?.gain??route?.gain??0;
 const technical=/Class 3|Class 4/.test(route?.cls||'');
 const long=miles>=10||gain>=4000;
 const items=[];
 if(style==='overnight')items.push('Main approach pack plus a separate summit/day pack.');
 else items.push('Day/summit pack; keep route-critical items reachable.');
 if(long)items.push('Add food, water, light, and emergency margin for a long/high-gain day.');
 if(technical)items.push('Helmet and explicit descent/route-finding review; gear does not replace ability.');
 if(/limited|dry/i.test(route?.water||''))items.push('Carry a conservative water plan; do not assume refill.');
 items.push('Shell, insulation, gloves, beanie, navigation, communication, and backup light remain baseline alpine considerations.');
 return items;
}
function expeditionRequiredDecisions(route,style,date){
 const decisions=[
  'Confirm current standard-route and trailhead condition reports.',
  'Confirm road access, parking, permits, closures, and land restrictions.',
  'Set partners, check-in contact, escalation time, and communication plan.',
  'Download GPX/KML, offline map, route photos, and critical screenshots.',
  'Refresh summit and access forecasts when the climb enters the forecast horizon.'
 ];
 if(route?.combo||style==='combo')decisions.push('Define the decision point before committing to the second summit.');
 if(/Class 3|Class 4/.test(route?.cls||''))decisions.push('Confirm every partner’s exposure, scrambling, and descent competence.');
 if(style==='overnight')decisions.push('Confirm camp, sleep, stove/fuel, water, and morning repack systems.');
 return decisions;
}
function expeditionDraft(peak,date,styleInput,posture){
 const route=expeditionStandardRoute(peak);
 if(!route)return null;
 const style=expeditionStyleFor(route,styleInput);
 const startPoint=expeditionPreferredStart(route,style);
 const start=expeditionRecommendedStart(route,style,date,posture);
 const turnaround=expeditionRecommendedTurnaround(route,style,start,posture);
 const weather=expeditionWeatherBindings(peak,route);
 const peakData=COLORADO_SUMMITS.find(p=>p.name===peak);
 const startDate=date||'';
 const endDate=date||'';
 const name=`${peak} — ${date?tripDateLabel(date):'future trip'}`;
 return {
  id:tripId(),schemaVersion:TRIP_SCHEMA_VERSION,name,peak,
  routeId:route.id,startPointId:startPoint?.id||'',
  climbDate:date,startDate,endDate,plannedStart:start,turnaround,
  partners:'',vehicle:'Audi Q5',
  lodging:expeditionLodgingRecommendation(style,route),
  summitWeatherId:weather.summit,accessWeatherId:weather.access,
  notes:`Generated as a ${style} expedition using the verified standard-route profile. Review all fields before saving.`,
  prep:{gpx:false,map:false,photos:false,screens:false},generatedChecks:{},
  systemTrip:false,createdAt:tripIsoNow(),updatedAt:tripIsoNow(),
  expeditionMeta:{
   generated:true,style,posture,range:peakData?.range||route.range,
   generatedAt:tripIsoNow(),
   planningHours:expeditionPlanningHours(route,startPoint,posture),
   vehicleRecommendation:expeditionVehicleRecommendation(route,startPoint)
  }
 };
}
function expeditionPopulateControls(){
 const peak=document.getElementById('expeditionPeak');
 if(peak&&!peak.options.length){
  expeditionPeaks().forEach(p=>tripOption(peak,p.name,`${p.name} · ${p.status} · ${p.range}`));
 }
 const date=document.getElementById('expeditionDate');
 if(date&&!date.value)date.value=expeditionDefaultDate();
}
function expeditionPreview(draft){
 const el=document.getElementById('expeditionBuilderPreview');if(!el)return;
 if(!draft){el.textContent='No verified standard-route profile is available for that mountain.';return}
 const route=tripRouteById(draft.routeId);
 const start=tripStartPoint(route,draft.startPointId);
 el.innerHTML=`
  <div class="expedition-preview-grid">
   <span><b>${escapeHtml(route.label)}</b>Standard route</span>
   <span><b>${escapeHtml(route.cls)}</b>Class</span>
   <span><b>${Number.isFinite(start?.miles)?start.miles+' mi':Number.isFinite(route.miles)?route.miles+' mi':'—'}</b>Distance</span>
   <span><b>${Number.isFinite(start?.gain)?Number(start.gain).toLocaleString()+' ft':Number.isFinite(route.gain)?Number(route.gain).toLocaleString()+' ft':'—'}</b>Gain</span>
   <span><b>${escapeHtml(draft.plannedStart)}</b>Planned start</span>
   <span><b>${escapeHtml(draft.turnaround)}</b>Turn target</span>
  </div>
  <p>${escapeHtml(draft.expeditionMeta.vehicleRecommendation)}</p>
  <p>Estimated moving time: ${escapeHtml(String(draft.expeditionMeta.planningHours))} hours. Review against your pace, current conditions, access, and group.</p>`;
}
function expeditionBuild(save){
 const peak=document.getElementById('expeditionPeak')?.value||'';
 const date=document.getElementById('expeditionDate')?.value||'';
 const style=document.getElementById('expeditionStyle')?.value||'auto';
 const posture=document.getElementById('expeditionPosture')?.value||'conservative';
 const draft=expeditionDraft(peak,date,style,posture);
 expeditionPreview(draft);
 if(!draft||!save)return;
 tripLibrary.unshift(draft);activeTripId=draft.id;tripSaveLibrary();
 tripRenderLibrary();tripApplyForm(draft);tripRenderGeneratedPlan();renderExpeditionBrief();
 toast('Expedition draft created. Review every field before saving.');
 document.getElementById('trip-builder')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function expeditionBriefData(trip){
 const route=tripRouteById(trip?.routeId);
 const start=tripStartPoint(route,trip?.startPointId);
 const style=trip?.expeditionMeta?.style||expeditionStyleFor(route,'auto');
 const hours=trip?.expeditionMeta?.planningHours||expeditionPlanningHours(route,start,'conservative');
 return {trip,route,start,style,hours,
  pack:expeditionPackStrategy(route,style),
  decisions:expeditionRequiredDecisions(route,style,trip?.climbDate),
  vehicle:trip?.expeditionMeta?.vehicleRecommendation||expeditionVehicleRecommendation(route,start)
 };
}
function renderExpeditionBrief(){
 const trip=tripActive();if(!trip)return;
 const d=expeditionBriefData(trip);
 const set=(id,html)=>{const el=document.getElementById(id);if(el)el.innerHTML=html};
 document.getElementById('expeditionBriefTitle').textContent=trip.name||'Active expedition';
 if(d.route){
  set('expeditionBriefRoute',`<h4>${escapeHtml(d.route.label)}</h4><p>${escapeHtml(d.route.cls)} · ${Number.isFinite(d.start?.miles)?d.start.miles:Number.isFinite(d.route.miles)?d.route.miles:'—'} miles · ${Number.isFinite(d.start?.gain)?Number(d.start.gain).toLocaleString():Number.isFinite(d.route.gain)?Number(d.route.gain).toLocaleString():'—'} ft gain</p><p>${escapeHtml(d.route.access||'Verify route access.')}</p>`);
 }else set('expeditionBriefRoute','<p>No route profile selected.</p>');
 set('expeditionBriefTiming',`<p><b>Climb:</b> ${escapeHtml(tripDateLabel(trip.climbDate))}<br><b>Start:</b> ${escapeHtml(trip.plannedStart||'not set')}<br><b>Turn:</b> ${escapeHtml(trip.turnaround||'not set')}<br><b>Estimated moving time:</b> ${escapeHtml(String(d.hours||'—'))} hours</p>`);
 set('expeditionBriefWeather',`<p><b>Summit:</b> ${escapeHtml(tripWeatherName(trip.summitWeatherId))}<br><b>Access:</b> ${escapeHtml(tripWeatherName(trip.accessWeatherId))}</p><p>${escapeHtml(tripWeatherWindowState(trip).body)}</p>`);
 set('expeditionBriefPack',`<ul class="generated-plan-list">${d.pack.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
 set('expeditionBriefTravel',`<p><b>Vehicle:</b> ${escapeHtml(trip.vehicle||'Not set')}</p><p>${escapeHtml(d.vehicle)}</p><p><b>Lodging/camp:</b> ${escapeHtml(trip.lodging||'Not set')}</p>`);
 set('expeditionBriefDecisions',`<ul class="generated-plan-list">${d.decisions.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`);
}
function expeditionBriefText(){
 const t=tripActive();if(!t)return '';
 const d=expeditionBriefData(t);
 return [
  t.name,
  `Peak: ${t.peak}`,
  `Route: ${d.route?.label||'Not set'} (${d.route?.cls||'class unknown'})`,
  `Start point: ${d.start?.label||'Not set'}`,
  `Climb date: ${t.climbDate||'Not set'}`,
  `Planned trail start: ${t.plannedStart||'Not set'}`,
  `Turnaround target: ${t.turnaround||'Not set'}`,
  `Partners: ${t.partners||'Not set'}`,
  `Transportation: ${t.vehicle||'Not set'}`,
  `Lodging/camp: ${t.lodging||'Not set'}`,
  '',
  'Pack strategy:',
  ...d.pack.map(x=>`- ${x}`),
  '',
  'Required decisions:',
  ...d.decisions.map(x=>`- ${x}`),
  '',
  'Planning draft only; verify current conditions, access, weather, route, and group.'
 ].join('\n');
}
async function copyExpeditionBrief(){
 const text=expeditionBriefText();if(!text)return;
 try{await navigator.clipboard.writeText(text);toast('Expedition brief copied')}
 catch(e){toast('Copy was not available; select and copy from the brief')}
}
function expeditionSetup(){
 expeditionPopulateControls();
 document.getElementById('buildExpeditionBtn')?.addEventListener('click',()=>expeditionBuild(true));
 document.getElementById('previewExpeditionBtn')?.addEventListener('click',()=>expeditionBuild(false));
 document.getElementById('expeditionPeak')?.addEventListener('change',()=>expeditionBuild(false));
 document.getElementById('expeditionDate')?.addEventListener('change',()=>expeditionBuild(false));
 document.getElementById('expeditionStyle')?.addEventListener('change',()=>expeditionBuild(false));
 document.getElementById('expeditionPosture')?.addEventListener('change',()=>expeditionBuild(false));
 document.getElementById('copyExpeditionBriefBtn')?.addEventListener('click',copyExpeditionBrief);
 expeditionBuild(false);renderExpeditionBrief();
}



