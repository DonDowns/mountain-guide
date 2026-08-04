/* ============================================================
   Version 14.0 — Mountain Intelligence Engine
   ============================================================ */
const ENGINE_STOPWORDS=new Set(['the','and','for','with','from','that','this','was','were','have','had','into','not','but','too','very','next','time','used','trip','climb','route','gear','water','food','weather','recorded','not recorded']);
const ENGINE_GEAR_TERMS=[
 'microspikes','spikes','gaiters','headlamp','helmet','stove','fuel','filter','bivy',
 'rain shell','shell','down jacket','vest','boots','shoes','trekking poles','inreach',
 'garmin','charger','battery','gloves','beanie','merino','pack','flash 18','paragon 60'
];

function engineArchives(){return Array.isArray(expeditionArchive)?expeditionArchive:[]}
function engineNormalizeName(name){return String(name||'').trim().replace(/\s+/g,' ')}
function enginePartnerNames(){
 const counts={};
 engineArchives().forEach(a=>{
  String(a.partners||'').split(/,| and | & |;/i).map(engineNormalizeName).filter(Boolean).forEach(name=>{
   if(/^not recorded$/i.test(name))return;
   counts[name]=(counts[name]||0)+1;
  });
 });
 return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
}
function engineGearMentions(){
 const counts={};
 const evidence={};
 engineArchives().forEach(a=>{
  const text=`${a.gearReflection||''} ${a.routeReflection||''} ${(a.fieldJournal||[]).map(e=>e.text||'').join(' ')}`.toLowerCase();
  ENGINE_GEAR_TERMS.forEach(term=>{
   const matches=text.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'));
   if(matches){
    counts[term]=(counts[term]||0)+matches.length;
    (evidence[term]||(evidence[term]=[])).push(a.peak||a.tripName||'Unnamed expedition');
   }
  });
 });
 return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).map(([term,count])=>({term,count,expeditions:[...new Set(evidence[term]||[])]}));
}
function engineKeywordCounts(fields){
 const counts={};
 engineArchives().forEach(a=>{
  const text=fields.map(f=>String(a[f]||'')).join(' ').toLowerCase();
  text.replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(w=>w.length>=4&&!ENGINE_STOPWORDS.has(w)).forEach(w=>counts[w]=(counts[w]||0)+1);
 });
 return Object.entries(counts).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
}
function engineLessonCount(){
 return engineArchives().filter(a=>[a.wentWell,a.changeNext,a.lessons,a.routeReflection].some(x=>String(x||'').trim())).length;
}
function engineSummaryFacts(){
 const archives=engineArchives();
 return {
  archives:archives.length,
  mountains:new Set(archives.map(a=>a.peak).filter(Boolean)).size,
  partners:enginePartnerNames().length,
  gear:engineGearMentions().length,
  lessons:engineLessonCount()
 };
}
function enginePatternItems(){
 const a=engineArchives();
 const items=[];
 if(!a.length)return ['No archived expeditions exist yet. Archive field sessions before the engine can identify personal patterns.'];
 const summited=a.filter(x=>x.result==='summited').length;
 const turned=a.filter(x=>x.result==='turned').length;
 const partial=a.filter(x=>x.result==='partial').length;
 items.push(`${a.length} archived expedition${a.length===1?'':'s'}: ${summited} summited, ${turned} turned before summit, ${partial} partial or modified.`);
 const withJournal=a.filter(x=>(x.fieldJournal||[]).length).length;
 if(withJournal)items.push(`${withJournal} archive${withJournal===1?'':'s'} include timestamped field-journal evidence.`);
 const withWeather=a.filter(x=>String(x.weatherObserved||'').trim()).length;
 if(withWeather)items.push(`${withWeather} archive${withWeather===1?'':'s'} record encountered weather.`);
 const withTimes=a.filter(x=>x.actualStart&&x.actualFinish).length;
 if(withTimes)items.push(`${withTimes} archive${withTimes===1?'':'s'} include actual start and finish times.`);
 const partners=enginePartnerNames().slice(0,3);
 if(partners.length)items.push(`Most frequently recorded partners: ${partners.map(([n,c])=>`${n} (${c})`).join(', ')}.`);
 return items;
}
function engineRecommendationItems(){
 const items=[];
 const a=engineArchives();
 if(!a.length)return ['No history-based planning observations are available yet.'];
 const missingTimes=a.filter(x=>!x.actualStart||!x.actualFinish).length;
 if(missingTimes)items.push(`${missingTimes} archive${missingTimes===1?' is':'s are'} missing actual start or finish time; recording those will improve timing comparisons.`);
 const missingWeather=a.filter(x=>!String(x.weatherObserved||'').trim()).length;
 if(missingWeather)items.push(`${missingWeather} archive${missingWeather===1?' is':'s are'} missing encountered-weather notes; forecast-versus-reality learning remains limited.`);
 const missingGear=a.filter(x=>!String(x.gearReflection||'').trim()).length;
 if(missingGear)items.push(`${missingGear} archive${missingGear===1?' is':'s are'} missing gear reflection; repeated-use and failure patterns remain incomplete.`);
 const repeated=engineGearMentions().filter(x=>x.expeditions.length>=2).slice(0,3);
 if(repeated.length)items.push(`Repeated gear mentions across expeditions: ${repeated.map(x=>`${x.term} (${x.expeditions.length})`).join(', ')}.`);
 const routes=engineKeywordCounts(['routeReflection','lessons']).filter(([,c])=>c>=2).slice(0,3);
 if(routes.length)items.push(`Repeated route-learning terms: ${routes.map(([w,c])=>`${w} (${c})`).join(', ')}.`);
 items.push('Treat these as prompts for review, not automated conclusions.');
 return items;
}
function enginePartnerCards(){
 const partners=enginePartnerNames();
 if(!partners.length)return '<p>No archived partner history yet.</p>';
 return partners.slice(0,12).map(([name,count])=>{
  const mountains=[...new Set(engineArchives().filter(a=>String(a.partners||'').toLowerCase().includes(name.toLowerCase())).map(a=>a.peak).filter(Boolean))];
  return `<div class="engine-mini-row"><b>${escapeHtml(name)}</b><span>${count} expedition${count===1?'':'s'} · ${escapeHtml(mountains.slice(0,4).join(', ')||'mountain not recorded')}</span></div>`;
 }).join('');
}
function engineGearCards(){
 const gear=engineGearMentions();
 if(!gear.length)return '<p>No recognizable gear terms are present in archived reflections yet.</p>';
 return gear.slice(0,14).map(g=>`<div class="engine-mini-row"><b>${escapeHtml(g.term)}</b><span>${g.count} mention${g.count===1?'':'s'} · ${escapeHtml(g.expeditions.slice(0,4).join(', '))}</span></div>`).join('');
}
function engineRouteCards(){
 const terms=engineKeywordCounts(['routeReflection','lessons']);
 const archives=engineArchives().filter(a=>String(a.routeReflection||a.lessons||'').trim());
 if(!archives.length)return '<p>No route observations have been archived yet.</p>';
 return archives.slice(0,10).map(a=>`<div class="engine-evidence"><b>${escapeHtml(a.peak||a.tripName||'Unnamed expedition')}</b><p>${escapeHtml((a.routeReflection||a.lessons).slice(0,260))}</p></div>`).join('')+
  (terms.length?`<p class="command-small">Frequent terms: ${escapeHtml(terms.slice(0,8).map(([w,c])=>`${w} (${c})`).join(', '))}</p>`:'');
}
function engineWeatherCards(){
 const archives=engineArchives().filter(a=>String(a.weatherObserved||'').trim());
 if(!archives.length)return '<p>No encountered-weather observations have been archived yet.</p>';
 return archives.slice(0,10).map(a=>`<div class="engine-evidence"><b>${escapeHtml(a.peak||a.tripName||'Unnamed expedition')}</b><p>${escapeHtml(a.weatherObserved)}</p></div>`).join('');
}
function engineSpiritualCards(){
 const archives=engineArchives().filter(a=>String(a.spiritualReflection||'').trim());
 if(!archives.length)return '<p>No Scripture, prayer, or spiritual reflections have been archived yet.</p>';
 return archives.slice(0,10).map(a=>`<div class="engine-evidence"><b>${escapeHtml(a.peak||a.tripName||'Unnamed expedition')}</b><p>${escapeHtml(a.spiritualReflection)}</p></div>`).join('');
}
function engineSearchResults(){
 const q=(document.getElementById('engineSearch')?.value||'').trim().toLowerCase();
 const view=document.getElementById('engineView')?.value||'overview';
 const title=document.getElementById('engineSearchTitle');
 if(title)title.textContent=q?`Results for “${q}”`:`${view.charAt(0).toUpperCase()+view.slice(1)} evidence`;
 let source=engineArchives();
 if(q)source=source.filter(a=>archiveSearchText(a).includes(q));
 if(view==='partners'&&!q)source=source.filter(a=>String(a.partners||'').trim());
 if(view==='gear'&&!q)source=source.filter(a=>String(a.gearReflection||'').trim());
 if(view==='routes'&&!q)source=source.filter(a=>String(a.routeReflection||'').trim());
 if(view==='weather'&&!q)source=source.filter(a=>String(a.weatherObserved||'').trim());
 if(view==='spiritual'&&!q)source=source.filter(a=>String(a.spiritualReflection||'').trim());
 if(!source.length)return '<p>No archived evidence matches the current search and view.</p>';
 return source.slice(0,20).map(a=>`
  <button class="engine-search-result" data-engine-archive="${escapeHtml(a.id)}" type="button">
   <b>${escapeHtml(a.peak||a.tripName||'Unnamed expedition')}</b>
   <span>${escapeHtml(tripDateLabel(a.climbDate))} · ${escapeHtml(a.partners||'partners not recorded')} · ${escapeHtml(archiveResultLabel(a.result))}</span>
  </button>`).join('');
}
function engineCompleteness(){
 const trip=tripActive();
 if(!trip)return {title:'No active trip',pct:null,items:[]};
 const route=tripRouteById(trip.routeId);
 const checks=[
  ['Peak selected',!!trip.peak],
  ['Verified route selected',!!route],
  ['Climb date set',!!trip.climbDate],
  ['Travel window set',!!trip.startDate&&!!trip.endDate],
  ['Trail start set',!!trip.plannedStart],
  ['Turnaround set',!!trip.turnaround],
  ['Partners recorded',!!String(trip.partners||'').trim()],
  ['Transportation recorded',!!String(trip.vehicle||'').trim()],
  ['Lodging or camp recorded',!!String(trip.lodging||'').trim()],
  ['Summit weather point bound',!!trip.summitWeatherId],
  ['Access weather point bound',!!trip.accessWeatherId],
  ['GPX/KML confirmed',!!trip.prep?.gpx],
  ['Offline map confirmed',!!trip.prep?.map],
  ['Route photos confirmed',!!trip.prep?.photos],
  ['Screenshots confirmed',!!trip.prep?.screens],
  ['Generated readiness reviewed',Object.keys(trip.generatedChecks||{}).length>0]
 ];
 const done=checks.filter(([,v])=>v).length;
 return {title:trip.name,pct:Math.round(done/checks.length*100),items:checks};
}
function engineRenderCompleteness(){
 const c=engineCompleteness();
 document.getElementById('engineCompletenessTitle').textContent=c.title;
 document.getElementById('engineCompletenessValue').textContent=c.pct===null?'—':`${c.pct}%`;
 document.getElementById('engineCompletenessBar').style.width=c.pct===null?'0%':`${c.pct}%`;
 document.getElementById('engineCompletenessDetails').innerHTML=c.items.length?`
  <div class="engine-completeness-list">${c.items.map(([label,done])=>`<span class="${done?'done':''}">${done?'✓':'○'} ${escapeHtml(label)}</span>`).join('')}</div>`:'<p>No active trip record is available.</p>';
}
function engineRender(){
 const facts=engineSummaryFacts();
 document.getElementById('engineArchiveCount').textContent=facts.archives;
 document.getElementById('engineMountainCount').textContent=facts.mountains;
 document.getElementById('enginePartnerCount').textContent=facts.partners;
 document.getElementById('engineGearCount').textContent=facts.gear;
 document.getElementById('engineLessonCount').textContent=facts.lessons;
 document.getElementById('enginePatterns').innerHTML=`<ul class="generated-plan-list">${enginePatternItems().map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`;
 document.getElementById('engineRecommendations').innerHTML=`<ul class="generated-plan-list">${engineRecommendationItems().map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`;
 document.getElementById('enginePartners').innerHTML=enginePartnerCards();
 document.getElementById('engineGear').innerHTML=engineGearCards();
 document.getElementById('engineRoutes').innerHTML=engineRouteCards();
 document.getElementById('engineWeather').innerHTML=engineWeatherCards();
 document.getElementById('engineSpiritual').innerHTML=engineSpiritualCards();
 engineRenderSearchOnly();
 engineRenderCompleteness();
}
let engineSearchTimer=null;
function engineRenderSearchOnly(){
 const results=document.getElementById('engineSearchResults');if(!results)return;
 results.innerHTML=engineSearchResults();
 results.querySelectorAll('[data-engine-archive]').forEach(btn=>btn.addEventListener('click',()=>{
  archiveOpen(btn.dataset.engineArchive);
  document.getElementById('expedition-archive')?.scrollIntoView({behavior:'smooth',block:'start'});
 }));
}
function engineScheduleSearch(){
 if(engineSearchTimer)clearTimeout(engineSearchTimer);
 engineSearchTimer=setTimeout(engineRenderSearchOnly,150);
}
function engineSetup(){
 document.getElementById('engineSearch')?.addEventListener('input',engineScheduleSearch);
 document.getElementById('engineView')?.addEventListener('change',engineRenderSearchOnly);
 document.getElementById('engineRefreshBtn')?.addEventListener('click',()=>{
  archiveLoad();engineRender();toast('Expedition insights refreshed from this device');
 });
 engineRender();
}
document.addEventListener('DOMContentLoaded',engineSetup);

/* Version 14.1 — Weather source review and objective agreement */
const WEATHER_SOURCE_REVIEW_KEY='ddmg-v14-1-weather-source-reviews';
const WEATHER_SOURCES=[
 {id:'nws',label:'NWS / NOAA',mode:'Integrated',url:'https://www.weather.gov/pub/colorado14ers'},
 {id:'14ers',label:'14ers.com Weather & Conditions',mode:'External review',url:'https://www.14ers.com/14ers'},
 {id:'mountainForecast',label:'Mountain-Forecast',mode:'External review',url:'https://www.mountain-forecast.com/'},
 {id:'summitcast',label:'BoulderCAST SummitCAST',mode:'External review',url:'https://bouldercast.com/summitcast-hiking-forecast/'},
 {id:'opensnow',label:'OpenSnow',mode:'External review',url:'https://opensnow.com/news/post/colorado-14er-weather-forecasts'}
];
let weatherSourceReviews=safeParse(storageGet(WEATHER_SOURCE_REVIEW_KEY),{});
function weatherReviewScope(){return tripActive()?.id||'general'}
function weatherReviewRecord(){const d=weatherSourceReviews[weatherReviewScope()];return d&&typeof d==='object'?d:{sources:{},agreement:{}}}
function weatherAgreementConfidence(record){
 const reviewed=WEATHER_SOURCES.filter(s=>record.sources?.[s.id]).length;
 const values=['wind','temp','storm','cloud'].map(k=>record.agreement?.[k]).filter(Boolean);
 if(reviewed<2||values.length<2)return {label:'Insufficient comparison',detail:'Review at least two sources and compare at least two variables.'};
 const low=values.filter(v=>v==='low').length,high=values.filter(v=>v==='high').length;
 if(low>=2)return {label:'Low agreement',detail:'Multiple forecast variables differ materially across reviewed sources.'};
 if(low===1||high<Math.ceil(values.length/2))return {label:'Moderate agreement',detail:'Some variables align, but at least one important difference remains.'};
 return {label:'High agreement',detail:'Most recorded variables are similar across the reviewed sources.'};
}
function weatherReviewRender(){
 const list=document.getElementById('weatherSourceReviewList');if(!list)return;
 const trip=tripActive(),record=weatherReviewRecord();
 document.getElementById('weatherAgreementTitle').textContent=`${trip?.name||'General planning'} · source comparison`;
 list.innerHTML=WEATHER_SOURCES.map(s=>`<article class="weather-source-review-row"><div><b>${escapeHtml(s.label)}</b><small>${escapeHtml(s.mode)}</small><span>${record.sources?.[s.id]?`Reviewed ${escapeHtml(new Date(record.sources[s.id]).toLocaleString())}`:'Not marked reviewed'}</span></div><div class="weather-source-review-actions"><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">Open</a><button type="button" data-weather-reviewed="${escapeHtml(s.id)}">Mark reviewed</button></div></article>`).join('');
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
 set('weatherAgreementWind',record.agreement?.wind);set('weatherAgreementTemp',record.agreement?.temp);set('weatherAgreementStorm',record.agreement?.storm);set('weatherAgreementCloud',record.agreement?.cloud);
 const c=weatherAgreementConfidence(record);
 document.getElementById('weatherAgreementSummary').innerHTML=`<b>${escapeHtml(c.label)}</b><p>${escapeHtml(c.detail)}</p><p>${WEATHER_SOURCES.filter(s=>record.sources?.[s.id]).length} of ${WEATHER_SOURCES.length} sources marked reviewed.</p>`;
}
function weatherMarkReviewed(id){const scope=weatherReviewScope(),r=weatherReviewRecord();weatherSourceReviews={...weatherSourceReviews,[scope]:{...r,sources:{...(r.sources||{}),[id]:new Date().toISOString()}}};storageSet(WEATHER_SOURCE_REVIEW_KEY,JSON.stringify(weatherSourceReviews));weatherReviewRender();if(typeof commandRenderWeather==='function')commandRenderWeather()}
function weatherAgreementSave(){const scope=weatherReviewScope(),r=weatherReviewRecord(),val=id=>document.getElementById(id)?.value||'';weatherSourceReviews={...weatherSourceReviews,[scope]:{...r,agreement:{wind:val('weatherAgreementWind'),temp:val('weatherAgreementTemp'),storm:val('weatherAgreementStorm'),cloud:val('weatherAgreementCloud')},updatedAt:new Date().toISOString()}};storageSet(WEATHER_SOURCE_REVIEW_KEY,JSON.stringify(weatherSourceReviews));weatherReviewRender();if(typeof commandRenderWeather==='function')commandRenderWeather();toast('Forecast comparison saved for the active trip')}
function weatherReviewClear(){const scope=weatherReviewScope();if(!weatherSourceReviews[scope]){toast('No saved comparison exists');return}if(!confirm('Clear the weather-source review and agreement record for the active trip?'))return;const next={...weatherSourceReviews};delete next[scope];weatherSourceReviews=next;storageSet(WEATHER_SOURCE_REVIEW_KEY,JSON.stringify(weatherSourceReviews));weatherReviewRender();if(typeof commandRenderWeather==='function')commandRenderWeather()}
function weatherReviewSummary(trip=tripActive()){const r=weatherSourceReviews[trip?.id||'general']||{sources:{},agreement:{}};const c=weatherAgreementConfidence(r);return `${WEATHER_SOURCES.filter(s=>r.sources?.[s.id]).length}/${WEATHER_SOURCES.length} sources reviewed · ${c.label}`}
function weatherReviewSetup(){weatherReviewRender();document.getElementById('weatherSourceReviewList')?.addEventListener('click',e=>{const b=e.target.closest('[data-weather-reviewed]');if(b)weatherMarkReviewed(b.dataset.weatherReviewed)});document.getElementById('weatherAgreementSaveBtn')?.addEventListener('click',weatherAgreementSave);document.getElementById('weatherSourceReviewClearBtn')?.addEventListener('click',weatherReviewClear)}
document.addEventListener('DOMContentLoaded',weatherReviewSetup);

