/* ============================================================
   Version 13.0 — Climbing Journal and Expedition Archive
   ============================================================ */
const EXPEDITION_ARCHIVE_KEY='ddmg-v13-expedition-archive';
let expeditionArchive=[];
let activeArchiveId='';

function archiveId(){return `archive-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function archiveLoad(){
 const raw=storageGet(EXPEDITION_ARCHIVE_KEY);
 try{expeditionArchive=raw?JSON.parse(raw):[]}catch(e){expeditionArchive=[]}
 if(!Array.isArray(expeditionArchive))expeditionArchive=[];
 activeArchiveId=expeditionArchive[0]?.id||'';
}
function archiveSaveStore(){
 storageSet(EXPEDITION_ARCHIVE_KEY,JSON.stringify(expeditionArchive));
}
function archiveActive(){return expeditionArchive.find(x=>x.id===activeArchiveId)||null}
function archiveTripById(id){return tripLibrary.find(t=>t.id===id)||null}
function archiveCommandSnapshot(){
 const state=JSON.parse(JSON.stringify(commandState||{}));
 return {
  startedAt:state.startedAt||'',
  endedAt:state.endedAt||'',
  elapsedMs:commandElapsedMs(),
  stageIndex:state.stageIndex||0,
  nextCheckin:state.nextCheckin||'',
  decisions:state.decisions||{},
  communication:state.communication||{},
  waterStarted:state.waterStarted||'',
  waterRemaining:state.waterRemaining||'',
  caloriesStarted:state.caloriesStarted||'',
  caloriesRemaining:state.caloriesRemaining||'',
  nutritionLog:state.nutritionLog||[],
  journal:state.journal||[],
  mountainNotes:state.mountainNotes||''
 };
}
function archiveFromCurrentSession(){
 const trip=commandTrip()||tripActive();
 if(!trip){toast('No trip is available to archive');return null}
 const snapshot=archiveCommandSnapshot();
 const existing=expeditionArchive.find(a=>a.commandSessionStartedAt&&a.commandSessionStartedAt===snapshot.startedAt&&a.tripId===trip.id);
 if(existing){
  activeArchiveId=existing.id;archiveApplyForm(existing);archiveRender();toast('That field session is already archived');return existing;
 }
 const record={
  id:archiveId(),tripId:trip.id,tripName:trip.name,peak:trip.peak,routeId:trip.routeId,
  climbDate:trip.climbDate,partners:trip.partners||'',result:'unknown',
  actualStart:snapshot.startedAt?new Date(snapshot.startedAt).toTimeString().slice(0,5):'',
  actualSummit:'',actualTurn:'',actualFinish:snapshot.endedAt?new Date(snapshot.endedAt).toTimeString().slice(0,5):'',
  weatherObserved:'',gearReflection:'',
  nutritionReflection:[
   snapshot.waterStarted!==''?`Water started: ${snapshot.waterStarted} L.`:'',
   snapshot.waterRemaining!==''?`Water remaining: ${snapshot.waterRemaining} L.`:'',
   snapshot.caloriesStarted!==''?`Calories started: ${snapshot.caloriesStarted} kcal.`:'',
   snapshot.caloriesRemaining!==''?`Calories remaining: ${snapshot.caloriesRemaining} kcal.`:''
  ].filter(Boolean).join(' '),
  routeReflection:snapshot.mountainNotes||trip.notes||'',
  wentWell:'',changeNext:'',favoriteMemory:'',spiritualReflection:'',
  photoReferences:'',lessons:'',
  fieldJournal:snapshot.journal||[],decisionSnapshot:snapshot.decisions||{},
  communicationSnapshot:snapshot.communication||{},nutritionLog:snapshot.nutritionLog||[],
  stageIndex:snapshot.stageIndex,elapsedMs:snapshot.elapsedMs,
  commandSessionStartedAt:snapshot.startedAt||'',commandSessionEndedAt:snapshot.endedAt||'',
  createdAt:tripIsoNow(),updatedAt:tripIsoNow()
 };
 expeditionArchive.unshift(record);activeArchiveId=record.id;archiveSaveStore();archiveRender();archiveApplyForm(record);
 toast('Current field session copied into the expedition archive');
 return record;
}
function archiveReadForm(){
 const current=archiveActive();
 if(!current)return null;
 const val=id=>document.getElementById(id)?.value?.trim()||'';
 return {...current,
  result:val('archiveResult')||'unknown',
  actualStart:val('archiveActualStart'),actualSummit:val('archiveActualSummit'),
  actualTurn:val('archiveActualTurn'),actualFinish:val('archiveActualFinish'),
  weatherObserved:val('archiveWeatherObserved'),partners:val('archivePartners'),
  gearReflection:val('archiveGearReflection'),nutritionReflection:val('archiveNutritionReflection'),
  routeReflection:val('archiveRouteReflection'),wentWell:val('archiveWentWell'),
  changeNext:val('archiveChangeNext'),favoriteMemory:val('archiveFavoriteMemory'),
  spiritualReflection:val('archiveSpiritualReflection'),photoReferences:val('archivePhotoReferences'),
  lessons:val('archiveLessons'),updatedAt:tripIsoNow()
 };
}
function archiveApplyForm(record){
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v||''};
 document.getElementById('archiveEditorTitle').textContent=record?record.tripName||record.peak||'Archived expedition':'Create or edit archive';
 if(!record){
  ['archiveResult','archiveActualStart','archiveActualSummit','archiveActualTurn','archiveActualFinish',
   'archiveWeatherObserved','archivePartners','archiveGearReflection','archiveNutritionReflection',
   'archiveRouteReflection','archiveWentWell','archiveChangeNext','archiveFavoriteMemory',
   'archiveSpiritualReflection','archivePhotoReferences','archiveLessons'].forEach(id=>set(id,''));
  set('archiveResult','unknown');return;
 }
 set('archiveResult',record.result);set('archiveActualStart',record.actualStart);
 set('archiveActualSummit',record.actualSummit);set('archiveActualTurn',record.actualTurn);
 set('archiveActualFinish',record.actualFinish);set('archiveWeatherObserved',record.weatherObserved);
 set('archivePartners',record.partners);set('archiveGearReflection',record.gearReflection);
 set('archiveNutritionReflection',record.nutritionReflection);set('archiveRouteReflection',record.routeReflection);
 set('archiveWentWell',record.wentWell);set('archiveChangeNext',record.changeNext);
 set('archiveFavoriteMemory',record.favoriteMemory);set('archiveSpiritualReflection',record.spiritualReflection);
 set('archivePhotoReferences',record.photoReferences);set('archiveLessons',record.lessons);
}
function archiveSearchText(record){
 const trip=archiveTripById(record.tripId);
 const route=tripRouteById(record.routeId);
 return [
  record.tripName,record.peak,record.climbDate,record.partners,record.result,
  route?.label,route?.cls,record.weatherObserved,record.gearReflection,record.nutritionReflection,
  record.routeReflection,record.wentWell,record.changeNext,record.favoriteMemory,
  record.spiritualReflection,record.photoReferences,record.lessons,
  ...(record.fieldJournal||[]).map(x=>x.text||'')
 ].join(' ').toLowerCase();
}
function archiveFiltered(){
 const q=(document.getElementById('archiveSearch')?.value||'').trim().toLowerCase();
 const result=document.getElementById('archiveResultFilter')?.value||'all';
 const sort=document.getElementById('archiveSort')?.value||'newest';
 const data=expeditionArchive.filter(a=>{
  if(result!=='all'&&a.result!==result)return false;
  if(q&&!archiveSearchText(a).includes(q))return false;
  return true;
 });
 data.sort((a,b)=>{
  if(sort==='mountain')return String(a.peak||'').localeCompare(String(b.peak||''))||String(b.climbDate||'').localeCompare(String(a.climbDate||''));
  if(sort==='oldest')return String(a.climbDate||a.createdAt||'').localeCompare(String(b.climbDate||b.createdAt||''));
  return String(b.climbDate||b.createdAt||'').localeCompare(String(a.climbDate||a.createdAt||''));
 });
 return data;
}
function archiveResultLabel(result){
 return {summited:'Summited',turned:'Turned before summit',partial:'Partial / modified',unknown:'Not recorded'}[result]||'Not recorded';
}
function archiveRenderList(){
 const list=document.getElementById('archiveList');
 const count=document.getElementById('archiveCount');
 if(!list||!count)return;
 const data=archiveFiltered();
 count.textContent=`${data.length} record${data.length===1?'':'s'}`;
 list.innerHTML=data.length?data.map(a=>`
  <button class="archive-index-item ${a.id===activeArchiveId?'active':''}" data-archive-id="${escapeHtml(a.id)}" type="button">
   <span><b>${escapeHtml(a.peak||a.tripName||'Unnamed expedition')}</b><small>${escapeHtml(tripDateLabel(a.climbDate))} · ${escapeHtml(a.partners||'Partners not recorded')}</small></span>
   <em data-result="${escapeHtml(a.result||'unknown')}">${escapeHtml(archiveResultLabel(a.result))}</em>
  </button>`).join(''):'<p class="archive-empty-note">No archived expeditions match the current filters.</p>';
 list.querySelectorAll('[data-archive-id]').forEach(btn=>btn.addEventListener('click',()=>archiveOpen(btn.dataset.archiveId)));
}
function archiveDecisionSummary(record){
 const entries=Object.entries(record.decisionSnapshot||{}).filter(([,v])=>v);
 if(!entries.length)return 'No decision-center responses were recorded.';
 const labels=Object.fromEntries(commandDecisionDefinitions());
 return entries.map(([k,v])=>`${labels[k]||k}: ${v}`).join('; ');
}
function archiveCommunicationSummary(record){
 const defs=commandCommunicationDefinitions();
 const complete=defs.filter(([k])=>record.communicationSnapshot?.[k]).length;
 return `${complete} of ${defs.length} communication checks were confirmed in the archived session.`;
}
function archiveRenderDetail(){
 const record=archiveActive();
 const el=document.getElementById('archiveDetail');if(!el)return;
 if(!record){
  el.innerHTML='<div class="archive-empty"><h3>No archived expedition selected</h3><p>Archive an ended Command Center session or select a saved expedition record.</p></div>';
  return;
 }
 const trip=archiveTripById(record.tripId);
 const route=tripRouteById(record.routeId);
 const journal=record.fieldJournal||[];
 el.innerHTML=`
  <div class="archive-detail-hero">
   <div>
    <div class="kicker">${escapeHtml(route?.range||COLORADO_SUMMITS.find(p=>p.name===record.peak)?.range||'Archived expedition')}</div>
    <h3>${escapeHtml(record.tripName||record.peak||'Archived expedition')}</h3>
    <p>${escapeHtml(tripDateLabel(record.climbDate))} · ${escapeHtml(archiveResultLabel(record.result))}</p>
   </div>
   <button id="archiveOpenTripBtn" type="button">Open trip</button>
  </div>

  <div class="archive-fact-grid">
   <span><b>${escapeHtml(route?.label||'Not recorded')}</b>Route</span>
   <span><b>${escapeHtml(record.partners||'Not recorded')}</b>Partners</span>
   <span><b>${escapeHtml(record.actualStart||'—')}</b>Actual start</span>
   <span><b>${escapeHtml(record.actualSummit||'—')}</b>Summit / high point</span>
   <span><b>${escapeHtml(record.actualTurn||'—')}</b>Turnaround</span>
   <span><b>${escapeHtml(record.actualFinish||'—')}</b>Finish</span>
  </div>

  <div class="archive-detail-grid">
   <section><div class="kicker">Weather encountered</div><p>${escapeHtml(record.weatherObserved||'Not recorded')}</p></section>
   <section><div class="kicker">Gear reflection</div><p>${escapeHtml(record.gearReflection||'Not recorded')}</p></section>
   <section><div class="kicker">Food &amp; water</div><p>${escapeHtml(record.nutritionReflection||'Not recorded')}</p></section>
   <section><div class="kicker">Route &amp; hazards</div><p>${escapeHtml(record.routeReflection||'Not recorded')}</p></section>
   <section><div class="kicker">What went well</div><p>${escapeHtml(record.wentWell||'Not recorded')}</p></section>
   <section><div class="kicker">Change next time</div><p>${escapeHtml(record.changeNext||'Not recorded')}</p></section>
   <section><div class="kicker">Favorite memory</div><p>${escapeHtml(record.favoriteMemory||'Not recorded')}</p></section>
   <section><div class="kicker">Scripture / prayer</div><p>${escapeHtml(record.spiritualReflection||'Not recorded')}</p></section>
   <section><div class="kicker">Photo references</div><p>${escapeHtml(record.photoReferences||'Not recorded')}</p></section>
   <section><div class="kicker">Additional lessons</div><p>${escapeHtml(record.lessons||'Not recorded')}</p></section>
  </div>

  <div class="archive-session-summary">
   <div class="kicker">Field-session record</div>
   <p><b>Elapsed:</b> ${escapeHtml(commandFormatDuration(record.elapsedMs||0))}</p>
   <p><b>Decision Center:</b> ${escapeHtml(archiveDecisionSummary(record))}</p>
   <p><b>Communication:</b> ${escapeHtml(archiveCommunicationSummary(record))}</p>
  </div>

  <div class="archive-journal-section">
   <div class="kicker">Field journal</div>
   ${journal.length?journal.map(e=>`<article><time>${escapeHtml(new Date(e.time).toLocaleString())}</time><p>${escapeHtml(e.text||'')}</p></article>`).join(''):'<p>No field journal entries were archived.</p>'}
  </div>`;
 document.getElementById('archiveOpenTripBtn')?.addEventListener('click',()=>{
  if(!record.tripId)return;
  tripLoad(record.tripId);
  document.getElementById('trip-builder')?.scrollIntoView({behavior:'smooth',block:'start'});
 });
}
function archiveRender(){
 archiveRenderList();archiveRenderDetail();
}
function archiveOpen(id){
 const record=expeditionArchive.find(a=>a.id===id);if(!record)return;
 activeArchiveId=id;archiveRender();archiveApplyForm(record);
 document.getElementById('archiveDetail')?.scrollIntoView({behavior:'smooth',block:'start'});
}
function archiveSave(){
 const updated=archiveReadForm();if(!updated){toast('Archive a field session first');return}
 const i=expeditionArchive.findIndex(a=>a.id===updated.id);
 if(i>=0)expeditionArchive[i]=updated;
 archiveSaveStore();archiveRender();archiveApplyForm(updated);if(typeof engineRender==='function')engineRender();if(typeof mountainOpen==='function'&&activeMountainIntelName)mountainOpen(activeMountainIntelName,false);toast('Archived expedition saved');
}
function archiveDelete(){
 const record=archiveActive();if(!record){toast('No archive selected');return}
 if(!confirm(`Delete the archived expedition “${record.tripName||record.peak}”? This cannot be undone.`))return;
 expeditionArchive=expeditionArchive.filter(a=>a.id!==record.id);
 activeArchiveId=expeditionArchive[0]?.id||'';
 archiveSaveStore();archiveRender();archiveApplyForm(archiveActive());if(typeof engineRender==='function')engineRender();toast('Archived expedition deleted');
}
function archiveText(record){
 const route=tripRouteById(record.routeId);
 return [
  record.tripName||record.peak||'Archived expedition',
  `Date: ${record.climbDate||'Not recorded'}`,
  `Result: ${archiveResultLabel(record.result)}`,
  `Peak: ${record.peak||'Not recorded'}`,
  `Route: ${route?.label||'Not recorded'}`,
  `Partners: ${record.partners||'Not recorded'}`,
  `Actual start: ${record.actualStart||'—'}`,
  `Summit / high point: ${record.actualSummit||'—'}`,
  `Turnaround: ${record.actualTurn||'—'}`,
  `Finish: ${record.actualFinish||'—'}`,
  '',
  `Weather encountered: ${record.weatherObserved||'Not recorded'}`,
  `Gear reflection: ${record.gearReflection||'Not recorded'}`,
  `Food and water: ${record.nutritionReflection||'Not recorded'}`,
  `Route and hazards: ${record.routeReflection||'Not recorded'}`,
  `What went well: ${record.wentWell||'Not recorded'}`,
  `Change next time: ${record.changeNext||'Not recorded'}`,
  `Favorite memory: ${record.favoriteMemory||'Not recorded'}`,
  `Scripture / prayer: ${record.spiritualReflection||'Not recorded'}`,
  `Photo references: ${record.photoReferences||'Not recorded'}`,
  `Additional lessons: ${record.lessons||'Not recorded'}`,
  '',
  'Field journal:',
  ...(record.fieldJournal||[]).map(e=>`${new Date(e.time).toLocaleString()} — ${e.text}`),
  '',
  'Archived observations are user-entered records, not verified telemetry.'
 ].join('\n');
}
async function archiveCopy(){
 const record=archiveActive();if(!record){toast('No archive selected');return}
 try{await navigator.clipboard.writeText(archiveText(record));toast('Archived expedition copied')}
 catch(e){toast('Copy was not available')}
}
function archiveSetup(){
 archiveLoad();archiveRender();archiveApplyForm(archiveActive());if(typeof mountainOpen==='function'&&activeMountainIntelName)mountainOpen(activeMountainIntelName,false);
 ['archiveSearch','archiveResultFilter','archiveSort'].forEach(id=>{
  const el=document.getElementById(id);
  el?.addEventListener(id==='archiveSearch'?'input':'change',archiveRender);
 });
 document.getElementById('archiveCurrentSessionBtn')?.addEventListener('click',archiveFromCurrentSession);
 document.getElementById('saveArchiveBtn')?.addEventListener('click',archiveSave);
 document.getElementById('deleteArchiveBtn')?.addEventListener('click',archiveDelete);
 document.getElementById('copyArchiveBtn')?.addEventListener('click',archiveCopy);
}



