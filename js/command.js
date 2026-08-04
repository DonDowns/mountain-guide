/* ============================================================
   Version 12.0 — Expedition Command Center
   ============================================================ */
const COMMAND_STATE_KEY='ddmg-v12-command-state';
let commandTimer=null;
let commandState={};

function commandDefaultState(){
 return {
  active:false,paused:false,tripId:'',startedAt:'',pausedAt:'',pausedTotalMs:0,
  stageIndex:0,nextCheckin:'',decisions:{},communication:{},
  waterStarted:'',waterRemaining:'',caloriesStarted:'',caloriesRemaining:'',
  nutritionLog:[],journal:[],mountainNotes:'',endedAt:''
 };
}
function commandLoadState(){
 const raw=storageGet(COMMAND_STATE_KEY);
 try{commandState=raw?JSON.parse(raw):commandDefaultState()}catch(e){commandState=commandDefaultState()}
 if(!commandState||typeof commandState!=='object')commandState=commandDefaultState();
 commandState={...commandDefaultState(),...commandState};
}
function commandSaveState(){
 storageSet(COMMAND_STATE_KEY,JSON.stringify(commandState));
}
function commandTrip(){
 return tripLibrary.find(t=>t.id===commandState.tripId)||tripActive();
}
function commandStages(trip){
 const route=tripRouteById(trip?.routeId);
 const stages=['Trailhead / start','Treeline or lower route','Upper basin / ridge approach'];
 if(route?.combo||route?.peaks?.length>1)stages.push('First summit / decision point','Second summit');
 else stages.push('Saddle / crux approach','Summit');
 stages.push('Descent','Trailhead / route complete');
 return stages;
}
function commandElapsedMs(){
 if(!commandState.active||!commandState.startedAt)return 0;
 const end=commandState.paused&&commandState.pausedAt?new Date(commandState.pausedAt):new Date();
 return Math.max(0,end-new Date(commandState.startedAt)-(commandState.pausedTotalMs||0));
}
function commandFormatDuration(ms){
 const total=Math.floor(ms/1000);
 const h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
 return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
function commandTodayTurnInstant(trip){
 if(!trip?.turnaround)return null;
 const [h,m]=trip.turnaround.split(':').map(Number);
 if(!Number.isFinite(h)||!Number.isFinite(m))return null;
 const d=new Date();d.setHours(h,m,0,0);return d;
}
function commandMarginLabel(trip){
 const turn=commandTodayTurnInstant(trip);
 if(!turn)return 'Not set';
 const diff=turn-new Date();
 const mins=Math.round(Math.abs(diff)/60000);
 if(diff>=0)return `${Math.floor(mins/60)}h ${mins%60}m remaining`;
 return `${Math.floor(mins/60)}h ${mins%60}m past`;
}
function commandDecisionDefinitions(){
 return [
  ['clouds','Have clouds grown or changed character?'],
  ['wind','Has wind increased or become less manageable?'],
  ['pace','Has pace slowed enough to reduce descent margin?'],
  ['group','Is everyone still coordinated, comfortable, and able to descend?'],
  ['water','Does remaining water fit the distance and conditions?'],
  ['route','Is the route still understood and available offline?'],
  ['turn','What does the fixed turnaround clock require you to reconsider?']
 ];
}
function commandCommunicationDefinitions(){
 return [
  ['inreach','inReach charged, activated, paired, and accessible'],
  ['headlamp','Primary and backup headlamps available'],
  ['phone','Phone and offline route data available'],
  ['contact','Check-in contact and escalation time understood'],
  ['battery','Watch/Garmin and charger block available']
 ];
}
function commandWeatherSummary(trip){
 const ids=[trip?.summitWeatherId,trip?.accessWeatherId].filter(Boolean);
 const lines=[];
 ids.forEach(id=>{
  const loc=locationById(id)||futurePointById(id);
  const data=weatherStore[id];
  if(data?.summary)lines.push(`${loc?.name||id}: ${data.summary}`);
  else if(loc)lines.push(`${loc.name}: saved/current forecast not loaded in this session`);
 });
 return lines.length?lines:['No summit or access weather point is bound to this trip.'];
}
function commandRenderHeader(){
 const trip=commandTrip();
 document.getElementById('commandTripName').textContent=trip?.name||'No active trip';
 document.getElementById('commandTripMeta').textContent=trip
  ?`${trip.peak||'No peak'} · ${tripDateLabel(trip.climbDate)} · start ${trip.plannedStart||'not set'} · turn ${trip.turnaround||'not set'}`
  :'Load or create a trip before starting field mode.';
 document.getElementById('commandTurnTarget').textContent=trip?.turnaround||'—';
 document.getElementById('commandTurnMargin').textContent=commandMarginLabel(trip);
 document.getElementById('commandElapsed').textContent=commandState.active?commandFormatDuration(commandElapsedMs()):'—';
 document.getElementById('commandClock').textContent=new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const stages=commandStages(trip);
 document.getElementById('commandCurrentStage').textContent=commandState.active?(stages[commandState.stageIndex]||stages.at(-1)):'Not started';
 const begin=document.getElementById('beginExpeditionBtn');
 const pause=document.getElementById('pauseExpeditionBtn');
 if(begin)begin.textContent=commandState.active?'Expedition active':'Begin expedition';
 if(pause)pause.textContent=commandState.paused?'Resume':'Pause';
}
function commandRenderStages(){
 const trip=commandTrip();
 const stages=commandStages(trip);
 const el=document.getElementById('commandStageList');if(!el)return;
 el.innerHTML=stages.map((stage,i)=>`
  <button class="command-stage-item ${i<commandState.stageIndex?'done':i===commandState.stageIndex&&commandState.active?'current':''}" data-command-stage="${i}" type="button">
   <span>${i+1}</span><b>${escapeHtml(stage)}</b>
  </button>`).join('');
 el.querySelectorAll('[data-command-stage]').forEach(btn=>btn.addEventListener('click',()=>{
  commandState.stageIndex=Number(btn.dataset.commandStage)||0;commandSaveState();commandRender();
 }));
}
function commandRenderWeather(){
 const trip=commandTrip();
 const el=document.getElementById('commandWeatherSnapshot');if(!el)return;
 const state=tripWeatherWindowState(trip||{});
 el.innerHTML=`<div class="command-weather-gate" data-tone="${escapeHtml(state.tone)}"><b>${escapeHtml(state.title)}</b><p>${escapeHtml(state.body)}</p></div>
  <ul class="generated-plan-list">${commandWeatherSummary(trip).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>
  <p class="command-small">${escapeHtml(typeof weatherReviewSummary==='function'?weatherReviewSummary(trip):'No cross-source comparison saved.')}</p>
  <p class="command-small">Forecast evidence is not permission. Actual sky, wind, terrain, access, pace, and group condition govern.</p>`;
}
function commandRenderDecisions(){
 const el=document.getElementById('commandDecisionQuestions');if(!el)return;
 el.innerHTML=commandDecisionDefinitions().map(([key,label])=>`
  <label class="command-decision-row">
   <span>${escapeHtml(label)}</span>
   <select data-command-decision="${escapeHtml(key)}">
    <option value="" ${!commandState.decisions?.[key]?'selected':''}>Not assessed</option>
    <option value="unchanged" ${commandState.decisions?.[key]==='unchanged'?'selected':''}>No meaningful change observed</option>
    <option value="watch" ${commandState.decisions?.[key]==='watch'?'selected':''}>Needs attention</option>
    <option value="concern" ${commandState.decisions?.[key]==='concern'?'selected':''}>Material concern</option>
   </select>
  </label>`).join('');
 el.querySelectorAll('[data-command-decision]').forEach(sel=>sel.addEventListener('change',()=>{
  commandState.decisions={...(commandState.decisions||{}),[sel.dataset.commandDecision]:sel.value};
  commandSaveState();
 }));
}
function commandRenderNavigation(){
 const trip=commandTrip();
 const route=tripRouteById(trip?.routeId);
 const prep=trip?.prep||{};
 const el=document.getElementById('commandNavigationReadiness');if(el)el.innerHTML=`
  <p>${prep.gpx?'✓':'○'} GPX/KML · ${prep.map?'✓':'○'} offline map · ${prep.photos?'✓':'○'} route photos · ${prep.screens?'✓':'○'} screenshots</p>
  <p class="command-small">Checked preparation confirms only what was recorded on this device.</p>`;
 const link=document.getElementById('commandOpenRouteLink');
 if(link){link.href=route?.url||'#';link.setAttribute('aria-disabled',route?.url?'false':'true')}
}
function commandRenderCommunication(){
 const el=document.getElementById('commandCommunicationChecks');if(!el)return;
 el.innerHTML=commandCommunicationDefinitions().map(([key,label])=>`
  <label><input type="checkbox" data-command-comm="${escapeHtml(key)}" ${commandState.communication?.[key]?'checked':''}><span>${escapeHtml(label)}</span></label>`).join('');
 el.querySelectorAll('[data-command-comm]').forEach(input=>input.addEventListener('change',()=>{
  commandState.communication={...(commandState.communication||{}),[input.dataset.commandComm]:input.checked};
  commandSaveState();commandRenderCheckin();
 }));
 const next=document.getElementById('commandNextCheckin');if(next)next.value=commandState.nextCheckin||'';
 commandRenderCheckin();
}
function commandRenderCheckin(){
 const el=document.getElementById('commandCheckinStatus');if(!el)return;
 const complete=Object.values(commandState.communication||{}).filter(Boolean).length;
 const next=commandState.nextCheckin?` Next check-in: ${commandState.nextCheckin}.`:' No next check-in time entered.';
 el.textContent=`${complete} of ${commandCommunicationDefinitions().length} communication checks confirmed.${next}`;
}
function commandRenderNutrition(){
 const set=(id,v)=>{const el=document.getElementById(id);if(el)el.value=v??''};
 set('commandWaterStarted',commandState.waterStarted);set('commandWaterRemaining',commandState.waterRemaining);
 set('commandCaloriesStarted',commandState.caloriesStarted);set('commandCaloriesRemaining',commandState.caloriesRemaining);
 const el=document.getElementById('commandNutritionStatus');if(!el)return;
 const logs=commandState.nutritionLog||[];
 el.textContent=logs.length?`${logs.length} nutrition event${logs.length===1?'':'s'} logged; latest ${new Date(logs.at(-1).time).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}.`:'No drink or food events logged.';
}
function commandRenderJournal(){
 const el=document.getElementById('commandJournalList');if(!el)return;
 const journal=commandState.journal||[];
 el.innerHTML=journal.length?journal.slice().reverse().map(entry=>`
  <article><time>${escapeHtml(new Date(entry.time).toLocaleString())}</time><p>${escapeHtml(entry.text)}</p></article>`).join(''):'<p class="command-small">No field notes yet.</p>';
}
function commandRenderNotes(){
 const el=document.getElementById('commandMountainNotes');if(el)el.value=commandState.mountainNotes||commandTrip()?.notes||'';
}
function commandRender(){
 commandRenderHeader();commandRenderStages();commandRenderWeather();commandRenderDecisions();
 commandRenderNavigation();commandRenderCommunication();commandRenderNutrition();commandRenderNotes();commandRenderJournal();
}
function commandBegin(){
 const trip=tripActive();if(!trip){toast('Load or create a trip first');return}
 if(!commandState.active){
  commandState={...commandDefaultState(),active:true,tripId:trip.id,startedAt:tripIsoNow(),mountainNotes:trip.notes||''};
 }else if(commandState.tripId!==trip.id){
  if(!confirm(`A field session is already tied to another trip. Start a new session for “${trip.name}”?`))return;
  commandState={...commandDefaultState(),active:true,tripId:trip.id,startedAt:tripIsoNow(),mountainNotes:trip.notes||''};
 }
 commandSaveState();commandStartTimer();commandRender();toast('Expedition session started on this device');
}
function commandPause(){
 if(!commandState.active){toast('No active expedition session');return}
 if(commandState.paused){
  commandState.pausedTotalMs=(commandState.pausedTotalMs||0)+(new Date()-new Date(commandState.pausedAt));
  commandState.paused=false;commandState.pausedAt='';
 }else{
  commandState.paused=true;commandState.pausedAt=tripIsoNow();
 }
 commandSaveState();commandRender();
}
function commandEnd(){
 if(!commandState.active){toast('No active expedition session');return}
 if(!confirm('End and archive this field session on this device? The journal and notes will remain in the saved command record.'))return;
 commandState.active=false;commandState.paused=false;commandState.endedAt=tripIsoNow();
 commandSaveState();commandStopTimer();commandRender();toast('Expedition session ended');
}
function commandAdvanceStage(){
 if(!commandState.active){toast('Begin the expedition session first');return}
 const max=commandStages(commandTrip()).length-1;
 commandState.stageIndex=Math.min(max,(commandState.stageIndex||0)+1);
 commandSaveState();commandRender();
}
function commandSaveNotes(){
 commandState.mountainNotes=document.getElementById('commandMountainNotes')?.value?.trim()||'';
 commandSaveState();
 const trip=commandTrip();
 if(trip){
  trip.notes=commandState.mountainNotes;trip.updatedAt=tripIsoNow();
  const i=tripLibrary.findIndex(t=>t.id===trip.id);if(i>=0)tripLibrary[i]=trip;
  tripSaveLibrary();
 }
 toast('Mountain notes saved to the trip');
}
function commandAddJournal(text,kind='note'){
 const value=(text??(document.getElementById('commandJournalInput')?.value||'')).trim();
 if(!value)return;
 commandState.journal=[...(commandState.journal||[]),{id:`journal-${Date.now()}`,time:tripIsoNow(),kind,text:value}];
 commandSaveState();
 const input=document.getElementById('commandJournalInput');if(input)input.value='';
 commandRenderJournal();
}
function commandLogNutrition(kind){
 const label=kind==='drink'?'Drink logged':'Food logged';
 commandState.nutritionLog=[...(commandState.nutritionLog||[]),{time:tripIsoNow(),kind}];
 commandSaveState();commandAddJournal(label,kind);commandRenderNutrition();
}
async function commandCopyJournal(){
 const trip=commandTrip();
 const text=[
  trip?.name||'Expedition journal',
  `Session started: ${commandState.startedAt||'not started'}`,
  `Elapsed: ${commandFormatDuration(commandElapsedMs())}`,
  `Stage: ${commandStages(trip)[commandState.stageIndex]||'not set'}`,
  '',
  ...(commandState.journal||[]).map(e=>`${new Date(e.time).toLocaleString()} — ${e.text}`),
  '',
  'Field notes are user-entered observations, not verified telemetry.'
 ].join('\n');
 try{await navigator.clipboard.writeText(text);toast('Field journal copied')}
 catch(e){toast('Copy was not available')}
}
function commandStartTimer(){
 commandStopTimer();
 commandTimer=setInterval(commandRenderHeader,1000);
}
function commandStopTimer(){
 if(commandTimer){clearInterval(commandTimer);commandTimer=null}
}
function commandSetup(){
 commandLoadState();commandRender();
 if(commandState.active)commandStartTimer();
 document.getElementById('beginExpeditionBtn')?.addEventListener('click',commandBegin);
 document.getElementById('pauseExpeditionBtn')?.addEventListener('click',commandPause);
 document.getElementById('endExpeditionBtn')?.addEventListener('click',commandEnd);
 document.getElementById('advanceStageBtn')?.addEventListener('click',commandAdvanceStage);
 document.getElementById('commandDecisionResetBtn')?.addEventListener('click',()=>{commandState.decisions={};commandSaveState();commandRenderDecisions()});
 document.getElementById('commandRefreshWeatherBtn')?.addEventListener('click',()=>document.getElementById('weather')?.scrollIntoView({behavior:'smooth',block:'start'}));
 document.getElementById('commandOpenFocusBtn')?.addEventListener('click',openFocus);
 document.getElementById('commandOpenTripBuilderBtn')?.addEventListener('click',()=>document.getElementById('trip-builder')?.scrollIntoView({behavior:'smooth',block:'start'}));
 document.getElementById('commandOpenGearBtn')?.addEventListener('click',()=>document.getElementById('gear')?.scrollIntoView({behavior:'smooth',block:'start'}));
 document.getElementById('commandOpenMountainBtn')?.addEventListener('click',()=>{
  const trip=commandTrip();if(!trip)return;
  mountainOpen(trip.peak,false);document.getElementById('mountain-intelligence')?.scrollIntoView({behavior:'smooth',block:'start'});
 });
 document.getElementById('commandNextCheckin')?.addEventListener('change',e=>{commandState.nextCheckin=e.target.value;commandSaveState();commandRenderCheckin()});
 ['commandWaterStarted','commandWaterRemaining','commandCaloriesStarted','commandCaloriesRemaining'].forEach(id=>{
  document.getElementById(id)?.addEventListener('input',e=>{
   const key=id.replace(/^command/,'');const normalized=key.charAt(0).toLowerCase()+key.slice(1);
   commandState[normalized]=e.target.value;commandSaveState();
  });
 });
 document.getElementById('commandLogDrinkBtn')?.addEventListener('click',()=>commandLogNutrition('drink'));
 document.getElementById('commandLogFoodBtn')?.addEventListener('click',()=>commandLogNutrition('food'));
 document.getElementById('commandSaveMountainNotesBtn')?.addEventListener('click',commandSaveNotes);
 document.getElementById('commandAddJournalBtn')?.addEventListener('click',()=>commandAddJournal());
 document.getElementById('commandCopyJournalBtn')?.addEventListener('click',commandCopyJournal);
}



