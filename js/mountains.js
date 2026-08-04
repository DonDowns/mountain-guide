/* ============================================================
   Version 11.0 — Mountain Intelligence Database
   ============================================================ */
let activeMountainIntelName='';

function mountainSlug(name){
 return String(name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function mountainRoutes(name){
 return ROUTE_PROFILES.filter(r=>r.peaks.includes(name))
  .sort((a,b)=>Number(b.standard)-Number(a.standard)||Number(a.combo)-Number(b.combo)||a.label.localeCompare(b.label));
}
function mountainWeatherPoints(name){
 const needle=name.toLowerCase().replace(/^mount /,'').replace(/ peak$/,'').trim();
 return [...WEATHER_LOCATIONS,...FUTURE_WEATHER_POINTS].filter(p=>{
  const text=`${p.name||''} ${p.group||''}`.toLowerCase();
  return text.includes(needle);
 });
}
function mountainPhotos(name){
 const map={
  'Mount Massive':[
   {src:'massive-01-trailhead.jpg',caption:'Caleb and Don at the beginning of the climb.'},
   {src:'massive-02-sunrise-silhouette.jpg',caption:'The first and only sunrise summit shared by Caleb and Don.'},
   {src:'massive-03-caleb-camera.jpg',caption:'Caleb photographing the mountain during the climb.'},
   {src:'massive-04-outcrop.jpg',caption:'Don silhouetted on the outcrop as morning light spread across the mountains.'},
   {src:'massive-05-summit-together.jpg',caption:'Caleb and Don together on the summit.'}
  ],
  'Mount of the Holy Cross':[
   {src:'holy-cross-01-approach-landscape.jpg',caption:'The approach into the Holy Cross Wilderness.'},
   {src:'holy-cross-02-peak-ahead.jpg',caption:'The mountain ahead during the climb.'},
   {src:'holy-cross-03-steep-basin-view.jpg',caption:'Steep basin terrain and the route environment.'},
   {src:'holy-cross-04-summit-portrait.jpg',caption:'Don on the summit with the lake far below.'},
   {src:'holy-cross-05-forest-descent.jpg',caption:'Forest descent after the summit.'}
  ],
  'Mount Princeton':[
   {src:'princeton-01-trailhead-family.jpg',caption:'The family together before leaving the trailhead.'},
   {src:'princeton-02-don-vonda-ascent.jpg',caption:'Don and Vonda during the ascent.'},
   {src:'princeton-03-caleb-shelby-trail.jpg',caption:'Caleb and Shelby on the trail.'},
   {src:'princeton-04-family-high-route.jpg',caption:'The family together high on the route.'},
   {src:'princeton-05-family-summit-announcement.jpg',caption:'The family summit and the announcement: “Welcome baby Downs April 2020!”'},
   {src:'princeton-06-don-vonda-summit.jpg',caption:'Don and Vonda together on the summit.'}
  ]
 };
 return map[name]||[];
}
function mountainAscents(peak){
 return Array.isArray(peak.ascents)?peak.ascents:[];
}
function mountainSearchText(peak){
 const routes=mountainRoutes(peak.name);
 const ascents=mountainAscents(peak);
 return [
  peak.name,peak.range,peak.status,peak.milestone||'',peak.memory||'',
  ...routes.flatMap(r=>[r.label,r.cls,r.commitment||'',r.access||'',r.water||'']),
  ...ascents.flatMap(a=>[a.date||'',a.partners||'',a.memory||'',a.gear||'',a.notes||''])
 ].join(' ').toLowerCase();
}
function mountainFilteredData(){
 const q=(document.getElementById('mountainIntelSearch')?.value||'').trim().toLowerCase();
 const status=document.getElementById('mountainIntelStatus')?.value||'all';
 const range=document.getElementById('mountainIntelRange')?.value||'all';
 return COLORADO_SUMMITS.filter(p=>{
  if(status!=='all'&&p.status!==status)return false;
  if(range!=='all'&&p.range!==range)return false;
  if(q&&!mountainSearchText(p).includes(q))return false;
  return true;
 }).sort((a,b)=>a.range.localeCompare(b.range)||a.name.localeCompare(b.name));
}
function mountainPopulateRanges(){
 const el=document.getElementById('mountainIntelRange');if(!el||el.options.length>1)return;
 [...new Set(COLORADO_SUMMITS.map(p=>p.range))].sort().forEach(range=>tripOption(el,range,range));
}
function mountainRouteCard(route){
 const start=route.startPoints?.[0];
 const miles=start?.miles??route.miles;
 const gain=start?.gain??route.gain;
 return `<article class="mountain-route-card">
  <div class="mountain-route-head">
   <div><b>${escapeHtml(route.label)}</b><small>${route.standard?'Standard route':route.combo?'Combo / traverse':'Alternate or reference route'}</small></div>
   <span>${escapeHtml(route.cls)}</span>
  </div>
  <div class="mountain-route-facts">
   <span><b>${Number.isFinite(miles)?miles+' mi':'—'}</b>Distance</span>
   <span><b>${Number.isFinite(gain)?Number(gain).toLocaleString()+' ft':'—'}</b>Gain</span>
   <span><b>${escapeHtml(route.commitment||'Not rated')}</b>Commitment</span>
   <span><b>${escapeHtml(route.water||'Not recorded')}</b>Water</span>
  </div>
  <p>${escapeHtml(route.access||'Current access information has not been recorded in this profile.')}</p>
  ${route.url?`<a href="${escapeHtml(route.url)}" target="_blank" rel="noopener">Open route source</a>`:''}
 </article>`;
}
function mountainAscentCard(ascent){
 return `<article class="mountain-ascent-card">
  <div><b>${escapeHtml(ascent.date||'Date not recorded')}</b><span>${ascent.solo?'Solo':'With partners'}</span></div>
  <p><b>Partners:</b> ${escapeHtml(ascent.partners||'Not recorded')}</p>
  ${ascent.memory?`<p>${escapeHtml(ascent.memory)}</p>`:''}
  ${ascent.gear?`<p><b>Gear noted:</b> ${escapeHtml(ascent.gear)}</p>`:''}
 </article>`;
}
/* Version 15.0 — Living Mountain Knowledge Base */
function mountainArchiveRecords(name){
 return (typeof expeditionArchive!=='undefined'&&Array.isArray(expeditionArchive)?expeditionArchive:[])
  .filter(a=>a.peak===name||a.tripName===name);
}
function mountainTripRecords(name){
 return (typeof tripLibrary!=='undefined'&&Array.isArray(tripLibrary)?tripLibrary:[])
  .filter(t=>t.peak===name);
}
function mountainPartnerKnowledge(peak,archives){
 const counts={};
 mountainAscents(peak).forEach(a=>String(a.partners||'').split(/,| and | & |;/i).map(x=>x.trim()).filter(Boolean).forEach(n=>counts[n]=(counts[n]||0)+1));
 archives.forEach(a=>String(a.partners||'').split(/,| and | & |;/i).map(x=>x.trim()).filter(Boolean).forEach(n=>counts[n]=(counts[n]||0)+1));
 return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
}
function mountainGearKnowledge(peak,archives){
 const evidence=[];
 mountainAscents(peak).forEach(a=>{if(a.gear)evidence.push({source:a.date||'Ascent record',text:a.gear})});
 archives.forEach(a=>{if(a.gearReflection)evidence.push({source:a.climbDate||'Archive',text:a.gearReflection})});
 return evidence;
}
function mountainLessonKnowledge(archives){
 const fields=[['Route / hazards','routeReflection'],['What went well','wentWell'],['Change next time','changeNext'],['Additional lessons','lessons'],['Favorite memory','favoriteMemory'],['Scripture / prayer','spiritualReflection']];
 const rows=[];
 archives.forEach(a=>fields.forEach(([label,key])=>{if(String(a[key]||'').trim())rows.push({label,source:a.climbDate||a.tripName||'Archive',text:a[key]})}));
 return rows;
}
function mountainKnowledgeSummary(peak,routes,weather,photos,archives,trips,partners,gear,lessons){
 return [
  ['Route profiles',routes.length],['Weather points',weather.length],['Recorded ascents',mountainAscents(peak).length],
  ['Trip records',trips.length],['Archived expeditions',archives.length],['Partners',partners.length],
  ['Gear reflections',gear.length],['Lessons / reflections',lessons.length],['Personal photos',photos.length]
 ];
}
function mountainWeatherResourceLinks(peak,standard){
 return `<div class="mountain-resource-list">
  ${standard?.url?`<a href="${escapeHtml(standard.url)}" target="_blank" rel="noopener">14ers.com standard route</a>`:''}
  <a href="https://www.weather.gov/pub/colorado14ers" target="_blank" rel="noopener">NWS Colorado 14ers</a>
  <a href="https://www.14ers.com/php14ers/weather.php" target="_blank" rel="noopener">14ers.com Weather Center</a>
  <a href="https://www.mountain-forecast.com/" target="_blank" rel="noopener">Mountain-Forecast elevation bands</a>
  <a href="https://bouldercast.com/summitcast-hiking-forecast/" target="_blank" rel="noopener">BoulderCAST SummitCAST</a>
  <a href="https://opensnow.com/news/post/colorado-14er-weather-forecasts" target="_blank" rel="noopener">OpenSnow 14er forecasts</a>
 </div>`;
}

function mountainPlanningGaps(peak,routes,weather,photos){
 const gaps=[];
 if(!routes.length)gaps.push('No curated Route Intelligence profile is stored.');
 if(routes.length&&!routes.some(r=>r.standard))gaps.push('No route is explicitly marked as the standard route.');
 if(!weather.length)gaps.push('No dedicated summit or access weather point is linked by mountain name.');
 if(!mountainAscents(peak).length&&peak.status==='completed')gaps.push('Completed status has no detailed ascent record.');
 if(!photos.length&&peak.status==='completed')gaps.push('No personal mountain photographs are stored in the app package.');
 if(!routes.some(r=>r.access))gaps.push('Access/road notes are not recorded in the route profile.');
 return gaps;
}
function mountainRenderList(){
 const list=document.getElementById('mountainIntelList');
 const count=document.getElementById('mountainIntelCount');
 if(!list||!count)return;
 const data=mountainFilteredData();
 count.textContent=`${data.length} mountain${data.length===1?'':'s'}`;
 list.innerHTML=data.map(p=>`
  <button class="mountain-index-item ${p.name===activeMountainIntelName?'active':''}" data-mountain-name="${escapeHtml(p.name)}" type="button">
   <span><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.range)}</small></span>
   <em data-status="${escapeHtml(p.status)}">${escapeHtml(p.status)}</em>
  </button>`).join('');
 list.querySelectorAll('[data-mountain-name]').forEach(btn=>btn.addEventListener('click',()=>mountainOpen(btn.dataset.mountainName)));
 if(data.length&&!data.some(p=>p.name===activeMountainIntelName))mountainOpen(data[0].name,false);
 if(!data.length){
  list.innerHTML='<p class="mountain-empty">No mountains match the current filters.</p>';
  document.getElementById('mountainIntelProfile').innerHTML='<div class="mountain-profile-empty"><h3>No matching mountain</h3><p>Change the search or filters.</p></div>';
 }
}
function mountainOpen(name,scroll=true){
 const peak=COLORADO_SUMMITS.find(p=>p.name===name);if(!peak)return;
 activeMountainIntelName=name;
 mountainRenderList();
 const routes=mountainRoutes(name);
 const weather=mountainWeatherPoints(name);
 const photos=mountainPhotos(name);
 const ascents=mountainAscents(peak);
 const archives=mountainArchiveRecords(name);
 const trips=mountainTripRecords(name);
 const partners=mountainPartnerKnowledge(peak,archives);
 const gearKnowledge=mountainGearKnowledge(peak,archives);
 const lessons=mountainLessonKnowledge(archives);
 const gaps=mountainPlanningGaps(peak,routes,weather,photos);
 const standard=routes.find(r=>r.standard&&!r.combo)||routes.find(r=>r.standard)||routes[0];
 const knowledgeSummary=mountainKnowledgeSummary(peak,routes,weather,photos,archives,trips,partners,gearKnowledge,lessons);
 const profile=document.getElementById('mountainIntelProfile');if(!profile)return;
 profile.innerHTML=`
  <div class="mountain-profile-hero">
   <div>
    <div class="kicker">${escapeHtml(peak.range)} · ${escapeHtml(peak.status)}</div>
    <h3>${escapeHtml(peak.name)}</h3>
    <p>${peak.elevation?`${Number(peak.elevation).toLocaleString()} ft`:''}${peak.rank?` · Rank ${escapeHtml(String(peak.rank))}`:''}</p>
   </div>
   <button type="button" id="mountainBuildTripBtn">Build expedition</button>
  </div>
  ${peak.milestone?`<div class="mountain-memory-callout"><b>Milestone</b><p>${escapeHtml(peak.milestone)}</p></div>`:''}
  ${peak.memory?`<div class="mountain-memory-callout"><b>Memory</b><p>${escapeHtml(peak.memory)}</p></div>`:''}

  <div class="mountain-knowledge-summary">${knowledgeSummary.map(([label,count])=>`<span><b>${count}</b>${escapeHtml(label)}</span>`).join('')}</div>

  <div class="mountain-profile-grid">
   <section>
    <div class="kicker">Standard-route intelligence</div>
    ${standard?mountainRouteCard(standard):'<p>No verified route profile stored.</p>'}
    ${routes.length>1?`<details class="mountain-more-routes"><summary>${routes.length-1} additional route profile${routes.length-1===1?'':'s'}</summary>${routes.filter(r=>r!==standard).map(mountainRouteCard).join('')}</details>`:''}
   </section>
   <section>
    <div class="kicker">Weather points</div>
    ${weather.length?`<div class="mountain-weather-list">${weather.map(w=>`<span><b>${escapeHtml(w.name)}</b><small>${escapeHtml(w.kind||'trip point')}${w.approx?' · approximate':''}</small></span>`).join('')}</div>`:'<p>No dedicated weather point linked by mountain name.</p>'}
   </section>
   <section>
    <div class="kicker">Climb history</div>
    ${ascents.length?ascents.map(mountainAscentCard).join(''):'<p>No completed ascent record stored.</p>'}
   </section>
   <section>
    <div class="kicker">Planning gaps</div>
    ${gaps.length?`<ul class="generated-plan-list">${gaps.map(g=>`<li>${escapeHtml(g)}</li>`).join('')}</ul>`:'<p>No structural data gaps identified in the current app dataset.</p>'}
   </section>
   <section>
    <div class="kicker">Trip & archive history</div>
    ${trips.length||archives.length?`<div class="mountain-history-list">
      ${trips.map(t=>`<div><b>${escapeHtml(t.name)}</b><small>${escapeHtml(tripDateLabel(t.climbDate))} · trip record</small></div>`).join('')}
      ${archives.map(a=>`<button type="button" data-mountain-archive="${escapeHtml(a.id)}"><b>${escapeHtml(a.tripName||a.peak)}</b><small>${escapeHtml(tripDateLabel(a.climbDate))} · ${escapeHtml(archiveResultLabel(a.result))}</small></button>`).join('')}
     </div>`:'<p>No reusable trip or archived expedition is linked yet.</p>'}
   </section>
   <section>
    <div class="kicker">Partner history</div>
    ${partners.length?`<div class="mountain-knowledge-list">${partners.map(([partner,count])=>`<span><b>${escapeHtml(partner)}</b><small>${count} recorded connection${count===1?'':'s'}</small></span>`).join('')}</div>`:'<p>No partner history recorded for this mountain.</p>'}
   </section>
   <section>
    <div class="kicker">Gear history</div>
    ${gearKnowledge.length?`<div class="mountain-evidence-list">${gearKnowledge.map(g=>`<div><b>${escapeHtml(g.source)}</b><p>${escapeHtml(g.text)}</p></div>`).join('')}</div>`:'<p>No mountain-specific gear reflection recorded.</p>'}
   </section>
   <section>
    <div class="kicker">Lessons, memories & spiritual record</div>
    ${lessons.length?`<div class="mountain-evidence-list">${lessons.map(x=>`<div><b>${escapeHtml(x.label)} · ${escapeHtml(x.source)}</b><p>${escapeHtml(x.text)}</p></div>`).join('')}</div>`:'<p>No archived lessons or reflections recorded for this mountain.</p>'}
   </section>
   <section>
    <div class="kicker">Weather & route resources</div>
    ${mountainWeatherResourceLinks(peak,standard)}
    <p class="command-small">NWS remains the automated source. Other sites are external cross-checks and are not silently imported.</p>
   </section>
  </div>

  ${photos.length?`<div class="mountain-photo-section"><div class="kicker">Personal photographs</div><div class="mountain-photo-grid">${photos.map((p,i)=>`<figure><img src="${escapeHtml(p.src)}" alt="${escapeHtml(`${peak.name} personal photograph ${i+1}`)}"><figcaption>${escapeHtml(p.caption)}</figcaption></figure>`).join('')}</div></div>`:''}

  <div class="mountain-profile-actions">
   ${standard?.url?`<a href="${escapeHtml(standard.url)}" target="_blank" rel="noopener">Open standard route</a>`:''}
   <button type="button" id="mountainCopySummaryBtn">Copy mountain summary</button>
  </div>
 `;
 document.getElementById('mountainBuildTripBtn')?.addEventListener('click',()=>{
  document.getElementById('expeditionPeak').value=peak.name;
  expeditionBuild(false);
  document.getElementById('trip-builder')?.scrollIntoView({behavior:'smooth',block:'start'});
 });
 document.getElementById('mountainCopySummaryBtn')?.addEventListener('click',()=>mountainCopySummary(peak,standard,gaps));
 profile.querySelectorAll('[data-mountain-archive]').forEach(button=>button.addEventListener('click',()=>{
  if(typeof archiveOpen==='function')archiveOpen(button.dataset.mountainArchive);
  document.getElementById('expedition-archive')?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
 if(scroll)profile.scrollIntoView({behavior:'smooth',block:'start'});
}
async function mountainCopySummary(peak,route,gaps){
 const ascent=mountainAscents(peak)[0];
 const lines=[
  peak.name,
  `${peak.elevation?Number(peak.elevation).toLocaleString()+' ft':''}${peak.range?' · '+peak.range:''}`,
  `Status: ${peak.status}`,
  `Standard route: ${route?.label||'Not stored'}`,
  `Class: ${route?.cls||'Not stored'}`,
  `Distance: ${Number.isFinite(route?.miles)?route.miles+' miles':'See start-point data'}`,
  `Gain: ${Number.isFinite(route?.gain)?Number(route.gain).toLocaleString()+' ft':'See start-point data'}`,
  ascent?`Recorded ascent: ${ascent.date||'date not recorded'}; partners: ${ascent.partners||'not recorded'}`:'No recorded ascent',
  gaps.length?'Planning gaps: '+gaps.join('; '):'No structural data gaps identified',
  'Verify current route conditions, access, closures, permits, weather, and group ability.'
 ];
 try{await navigator.clipboard.writeText(lines.join('\n'));toast('Mountain summary copied')}
 catch(e){toast('Copy was not available')}
}
function mountainIntelSetup(){
 mountainPopulateRanges();
 ['mountainIntelSearch','mountainIntelStatus','mountainIntelRange'].forEach(id=>{
  const el=document.getElementById(id);
  el?.addEventListener(id==='mountainIntelSearch'?'input':'change',mountainRenderList);
 });
 activeMountainIntelName=COLORADO_SUMMITS.find(p=>p.status==='planned')?.name||COLORADO_SUMMITS[0]?.name||'';
 mountainRenderList();
}
document.addEventListener('DOMContentLoaded',mountainIntelSetup);


