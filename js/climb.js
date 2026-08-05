(()=>{
  'use strict';
  const cfg=window.DDMG_CONFIG;
  if(!cfg)throw new Error('Shared Mountain Guide configuration did not load.');
  const keys=cfg.storageKeys;
  const objectives=cfg.focusObjectives;
  const body=document.body;

  function read(key,fallback=null){
    try{const raw=localStorage.getItem(key);return raw===null?fallback:raw}catch{return fallback}
  }
  function readJson(key,fallback){
    try{const raw=read(key);return raw?JSON.parse(raw):fallback}catch{return fallback}
  }
  function write(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
  function clock(value){
    if(!value)return 'Not set';
    if(/\b(?:AM|PM)\b/i.test(value))return value;
    const m=String(value).match(/^(\d{1,2}):(\d{2})$/);if(!m)return value;
    const h=Number(m[1]),suffix=h>=12?'PM':'AM';return `${h%12||12}:${m[2]} ${suffix}`;
  }
  function formatStamp(iso){
    const d=new Date(iso);if(Number.isNaN(d.getTime()))return 'timestamp unavailable';
    return new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(d);
  }
  function ageLabel(iso){
    const ms=Date.now()-new Date(iso).getTime();if(!Number.isFinite(ms))return 'age unknown';
    const hours=Math.max(0,ms/36e5);
    if(hours<1)return `${Math.max(1,Math.round(hours*60))} min old`;
    if(hours<24)return `${Math.round(hours)} hr old`;
    const days=Math.round(hours/24);return `${days} day${days===1?'':'s'} old`;
  }
  function selectedObjectiveId(){
    const q=new URLSearchParams(location.search).get('objective');
    if(q&&objectives[q])return q;
    const saved=read(keys.focusObjective,'');
    return objectives[saved]?saved:'blanca';
  }
  function activeTrip(){
    const list=readJson(keys.tripLibrary,[]);if(!Array.isArray(list))return null;
    const id=read(keys.activeTrip,'');return list.find(t=>t?.id===id)||null;
  }
  function objectiveData(id){
    const base=objectives[id]||objectives.blanca;
    const trip=activeTrip();
    const matches=trip&&trip.summitWeatherId===base.weatherId;
    return {
      ...base,
      date:matches&&trip.climbDate?trip.climbDate:base.date,
      start:matches&&trip.plannedStart?clock(trip.plannedStart):base.start,
      turn:matches&&trip.turnaround?clock(trip.turnaround):base.turn,
      tripName:matches&&trip.name?trip.name:'',
      partners:matches&&trip.partners?trip.partners:'',
      lodging:matches&&trip.lodging?trip.lodging:''
    };
  }
  function planningFlags(item){
    const periods=(item?.upcoming||[]).slice(0,6),flags=[];
    const winds=periods.map(p=>Number(p.windMph)).filter(Number.isFinite);
    const pops=periods.map(p=>Number(p.pop)).filter(Number.isFinite);
    const temps=periods.map(p=>Number(p.temp)).filter(Number.isFinite);
    const text=periods.map(p=>p.condition||'').join(' ').toLowerCase();
    if(item?.alerts?.length)flags.push(`${item.alerts.length} active alert${item.alerts.length===1?'':'s'}`);
    if(/thunder|storm|lightning/.test(text))flags.push('Thunderstorm wording in next 6 hours');
    if(winds.length&&Math.max(...winds)>=25)flags.push(`Wind listed to ${Math.max(...winds)} mph`);
    if(pops.length&&Math.max(...pops)>=30)flags.push(`Precipitation listed to ${Math.max(...pops)}%`);
    if(temps.length&&Math.min(...temps)<=35)flags.push(`Temperature listed near freezing: ${Math.min(...temps)}°F`);
    return flags;
  }
  function renderForecast(obj){
    const store=readJson(keys.weather,{}),item=store?.[obj.weatherId],card=document.getElementById('forecastCard');
    if(!item?.current||!item?.fetchedAt){
      card.dataset.state='missing';
      card.innerHTML='<b>Forecast at last refresh</b><p class="forecast-unavailable">No saved forecast is available for this objective on this device.</p><small>Open the full guide while online, refresh the selected objective, and verify the timestamp before relying on the saved display.</small>';
      return;
    }
    const c=item.current,ageH=(Date.now()-new Date(item.fetchedAt).getTime())/36e5;
    card.dataset.state=ageH>6?'stale':ageH>2?'aging':'current';
    const pop=Number.isFinite(Number(c.pop))?`${Number(c.pop)}% precipitation probability`:'precipitation probability unavailable';
    const wind=[c.windDirection,Number.isFinite(Number(c.windMph))?`${Number(c.windMph)} mph`:null].filter(Boolean).join(' ');
    const flags=planningFlags(item);
    card.innerHTML=`<b>Forecast at last refresh</b>
      <p class="forecast-reading"><strong>${escapeHtml(obj.label)}</strong> · ${escapeHtml(c.temp)}°F · ${escapeHtml(c.condition||'condition unavailable')} · ${escapeHtml(wind||'wind unavailable')} · ${escapeHtml(pop)}</p>
      <p class="forecast-age"><strong>Saved ${escapeHtml(formatStamp(item.fetchedAt))}</strong> · ${escapeHtml(ageLabel(item.fetchedAt))}</p>
      ${flags.length?`<ul class="forecast-flags">${flags.map(f=>`<li>${escapeHtml(f)}</li>`).join('')}</ul>`:'<p class="forecast-flags-none">No listed threshold flags were found in the next six saved hours. This is not an all-clear.</p>'}
      <small>Forecast age matters. Compare this saved information with the actual sky, wind, terrain, access, pace, and condition of the group.</small>`;
  }
  function renderLinks(obj){
    const links=obj.fieldLinks||obj.links||[];
    document.getElementById('routeLinks').innerHTML=links.map(([label,url])=>`<a class="btn" target="_blank" rel="noopener" href="${escapeHtml(url)}">${escapeHtml(label)}</a>`).join('');
  }
  function forecastFor(obj){
    const store=readJson(keys.weather,{});
    return store?.[obj.weatherId]||null;
  }
  function renderEmergency(obj){
    const area=window.DDMG_EMERGENCY?.emergencyAreaFor(obj);
    const details=document.getElementById('localEmergencyDetails');
    const dispatch=document.getElementById('callLocalDispatch');
    const office=document.getElementById('callSheriffOffice');
    const verified=document.getElementById('emergencyVerified');
    const card=document.getElementById('localEmergencyCard');
    if(!area){
      card.dataset.state='missing';
      details.innerHTML='<p class="forecast-unavailable">Local emergency jurisdiction has not been verified for this objective.</p><p>Use 911 for an emergency and confirm the appropriate county sheriff before leaving service.</p>';
      dispatch.removeAttribute('href');office.removeAttribute('href');dispatch.setAttribute('aria-disabled','true');office.setAttribute('aria-disabled','true');
      verified.textContent='No local number is displayed rather than guessing.';
      return null;
    }
    card.dataset.state='current';
    const officeLine=area.officePhone&&area.officeDisplay?`<br><b>${escapeHtml(area.officeLabel||'Sheriff’s office')}:</b> ${escapeHtml(area.officeDisplay)}`:'';
    details.innerHTML=`<p><strong>${escapeHtml(area.county)}</strong> · ${escapeHtml(area.sarTeam)}</p><p>${escapeHtml(area.activation)}</p><p><b>${escapeHtml(area.dispatchLabel||'County dispatch')}:</b> ${escapeHtml(area.dispatchDisplay)}${officeLine}</p><p><a target="_blank" rel="noopener" href="${escapeHtml(area.sourceUrl)}">Official county source</a> · <a target="_blank" rel="noopener" href="${escapeHtml(area.sarSourceUrl)}">SAR source</a></p>`;
    dispatch.href=`tel:${area.dispatchPhone}`;dispatch.removeAttribute('aria-disabled');dispatch.textContent=`Call ${area.county} contact`;
    if(area.officePhone){office.href=`tel:${area.officePhone}`;office.removeAttribute('aria-disabled');office.hidden=false;office.textContent='Call sheriff’s office'}else{office.removeAttribute('href');office.setAttribute('aria-disabled','true');office.hidden=true}
    verified.textContent=`Contact information verified ${window.DDMG_EMERGENCY.dateLabel(area.verifiedOn)}. Recheck before departure because numbers and jurisdiction can change.`;
    return area;
  }
  function updateNoteScope(obj){return `${obj.id}:${obj.date}`}
  function loadUpdateNote(obj){
    const notes=readJson(keys.fieldUpdateNote,{});
    return String(notes?.[updateNoteScope(obj)]||'');
  }
  function saveUpdateNote(obj,value){
    const notes=readJson(keys.fieldUpdateNote,{});notes[updateNoteScope(obj)]=value;write(keys.fieldUpdateNote,JSON.stringify(notes));
  }
  function copyText(text){
    if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
    return new Promise((resolve,reject)=>{
      try{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();resolve()}catch(err){reject(err)}
    });
  }
  function renderVondaUpdate(obj,area){
    const helper=window.DDMG_EMERGENCY,trip=activeTrip(),forecast=forecastFor(obj),note=document.getElementById('vondaNote');
    const phone=document.getElementById('fieldContactPhone'),email=document.getElementById('fieldContactEmail'),contactStatus=document.getElementById('fieldContactStatus'),sendStatus=document.getElementById('vondaSendStatus');
    note.value=loadUpdateNote(obj);
    const loadContactFields=()=>{const contact=helper.readLocalContact();phone.value=contact.phone||'';email.value=contact.email||'';return contact};
    const refresh=()=>{
      saveUpdateNote(obj,note.value);
      const contact=helper.readLocalContact();
      const body=helper.buildUpdate({objective:obj,area,forecast,trip,note:note.value});
      const subject=`Mountain Guide update — ${obj.label}`;
      document.getElementById('textVonda').href=helper.smsHref(contact.phone,body);
      document.getElementById('emailVonda').href=helper.emailHref(contact.email,subject,body);
      if(contact.phone&&contact.email)sendStatus.textContent='Text and email drafts will be addressed to the contact saved on this device. Review before sending.';
      else if(contact.phone)sendStatus.textContent='The text draft will be addressed. No email is saved, so the email draft opens without a recipient.';
      else if(contact.email)sendStatus.textContent='The email draft will be addressed. No mobile number is saved, so the text draft opens without a recipient.';
      else sendStatus.textContent='No recipient is saved on this device. Drafts open with the message prepared but without a recipient.';
      document.getElementById('copyVondaUpdate').onclick=async()=>{
        try{await copyText(body);sendStatus.textContent='Update copied. Paste it into the communication method you choose.'}
        catch{sendStatus.textContent='The browser could not copy automatically. Open a text or email draft instead.'}
      };
    };
    document.getElementById('fieldSaveContact').onclick=()=>{
      if(email.value&&!email.checkValidity()){contactStatus.textContent='Enter a valid email address or leave the email field blank.';return}
      helper.saveLocalContact({phone:phone.value,email:email.value});
      const saved=loadContactFields();
      contactStatus.textContent=(saved.phone||saved.email)?'Contact saved only on this device. It is not part of the public app files.':'The browser could not retain the contact, or both fields were blank.';
      refresh();
    };
    document.getElementById('fieldClearContact').onclick=()=>{
      helper.clearLocalContact();loadContactFields();contactStatus.textContent='Saved phone and email cleared from this device.';refresh();
    };
    note.oninput=refresh;loadContactFields();refresh();
  }
  function checkScope(obj){return `${obj.id}:${obj.date}`}
  function loadChecks(obj){
    const all=readJson(keys.fieldChecks,{}),saved=all?.[checkScope(obj)]||{};
    document.querySelectorAll('[data-field-check]').forEach(box=>{box.checked=Boolean(saved[box.dataset.fieldCheck])});
    document.getElementById('checkStatus').textContent='Saved on this device by objective and date.';
  }
  function saveChecks(obj){
    const all=readJson(keys.fieldChecks,{}),scope=checkScope(obj),next={};
    document.querySelectorAll('[data-field-check]').forEach(box=>{next[box.dataset.fieldCheck]=box.checked});
    all[scope]=next;
    document.getElementById('checkStatus').textContent=write(keys.fieldChecks,JSON.stringify(all))?'Checks saved on this device.':'Checks could not be saved in this browser.';
  }
  function resetChecks(obj){
    const all=readJson(keys.fieldChecks,{});delete all[checkScope(obj)];write(keys.fieldChecks,JSON.stringify(all));
    document.querySelectorAll('[data-field-check]').forEach(box=>{box.checked=false});
    document.getElementById('checkStatus').textContent='Checks cleared for this objective and date.';
  }
  function applyDisplayState(){
    const state=readJson(keys.fieldDisplay,{});
    body.classList.toggle('night',Boolean(state.red));body.classList.toggle('large',Boolean(state.large));
    document.getElementById('night').textContent=body.classList.contains('night')?'Normal display':'Red display';
    document.getElementById('font').textContent=body.classList.contains('large')?'Standard text':'Bigger text';
  }
  function saveDisplayState(){write(keys.fieldDisplay,JSON.stringify({red:body.classList.contains('night'),large:body.classList.contains('large')}))}
  function render(id){
    const obj=objectiveData(id);write(keys.focusObjective,obj.id);
    document.getElementById('objectiveSelect').value=obj.id;
    document.getElementById('pageTitle').textContent=`Climb Mode · ${obj.label}`;
    document.getElementById('version').textContent=cfg.version;
    document.getElementById('startTime').textContent=obj.start;
    document.getElementById('turnTime').textContent=obj.turn;
    document.getElementById('standingIntent').textContent=obj.intent;
    document.getElementById('objectiveTitle').textContent=obj.fieldTitle||obj.label;
    document.getElementById('objectiveDetail').textContent=obj.detail||obj.route;
    const context=[obj.tripName,obj.partners&&`Partners: ${obj.partners}`,obj.lodging&&`Camp/lodging: ${obj.lodging}`].filter(Boolean);
    const contextEl=document.getElementById('tripContext');contextEl.textContent=context.join(' · ');contextEl.hidden=!context.length;
    renderForecast(obj);renderLinks(obj);const area=renderEmergency(obj);renderVondaUpdate(obj,area);loadChecks(obj);
    document.querySelectorAll('[data-field-check]').forEach(box=>{box.onchange=()=>saveChecks(obj)});
    document.getElementById('resetChecks').onclick=()=>resetChecks(obj);
  }
  function init(){
    Object.values(objectives).forEach(obj=>{const option=document.createElement('option');option.value=obj.id;option.textContent=obj.label;document.getElementById('objectiveSelect').append(option)});
    applyDisplayState();render(selectedObjectiveId());
    document.getElementById('objectiveSelect').addEventListener('change',e=>render(e.target.value));
    document.getElementById('night').addEventListener('click',()=>{body.classList.toggle('night');saveDisplayState();applyDisplayState()});
    document.getElementById('font').addEventListener('click',()=>{body.classList.toggle('large');saveDisplayState();applyDisplayState()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
