(()=>{
'use strict';
const V=window.DDMG_CONFIG?.version||window.DDMG_VERSION||'unknown';
const ROAD50_BUTTONS={road50My50:'my50',road50Remaining:'remaining',road50All:'all'};
let scope='my50';
function ledger(){return Array.isArray(window.COLORADO_SUMMITS)?window.COLORADO_SUMMITS:[]}
function goalNames(){return new Set(ledger().filter(p=>p.road50).map(p=>p.name))}
function peakName(node){return (node?.dataset?.summitName||node?.querySelector?.('h3,b,strong')?.textContent||node?.textContent||'').trim()}
function updateScope(){
 const data=ledger(),goals=goalNames(),completed=new Set(data.filter(p=>p.status==='completed').map(p=>p.name));
 document.querySelectorAll('[data-summit-name]').forEach(el=>{
   const n=el.dataset.summitName||peakName(el),selected=goals.has(n),done=completed.has(n);
   const show=scope==='all'||(scope==='remaining'?selected&&!done:(selected||done));
   const card=el.closest('.summit-card,.summit-row,li,article')||el;card.hidden=!show;
   if(selected&&!card.querySelector('.my50-badge')){const label=card.querySelector('h3,h4,b,strong')||card;label.insertAdjacentHTML('beforeend','<span class="my50-badge">MY 50</span>')}
 });
 const goalCount=goals.size,allCount=data.length||58,completedCount=completed.size,still=[...goals].filter(n=>!completed.has(n)).length;
 const my50Count=new Set([...completed,...goals]).size;
 const status=document.getElementById('summitGroupStatus');
 if(status)status.textContent=scope==='all'?`Showing all ${allCount} named summits.`:scope==='remaining'?`Showing ${still} Road to 50 summits still to climb.`:`Showing ${my50Count} summits in your Road to 50 plan.`;
 const summary=document.getElementById('road50Summary');if(summary)summary.textContent=`${completedCount} completed · ${still} still to climb · ${my50Count}-summit goal.`;
 const progress=document.getElementById('road50Progress');if(progress)progress.textContent=`${completedCount} / ${my50Count}`;
 const remainSummary=document.getElementById('road50RemainingSummary');if(remainSummary)remainSummary.textContent=`${still} selected summit${still===1?'':'s'} remaining`;
 const ledgerCopy=document.getElementById('road50LedgerCopy');if(ledgerCopy)ledgerCopy.textContent=`The complete ${allCount}-summit ledger remains available; this view highlights the mountains intentionally retained in your personal plan.`;
 const remaining=document.getElementById('road50Remaining');if(remaining)remaining.textContent='Still to climb';
 const all=document.getElementById('road50All');if(all)all.textContent=`All ${allCount}`;
 ['road50My50','road50Remaining','road50All'].forEach(id=>{const b=document.getElementById(id);if(!b)return;const active=(id==='road50My50'&&scope==='my50')||(id==='road50Remaining'&&scope==='remaining')||(id==='road50All'&&scope==='all');b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
function setScope(next){
 if(!['my50','remaining','all'].includes(next))next='my50';
 scope=next;
 document.documentElement.dataset.road50Scope=scope;
 try{localStorage.setItem('ddmg-road50-scope',scope)}catch{}
 const search=document.getElementById('summitSearch');if(search)search.value='';
 updateScope();
 setTimeout(updateScope,40);
 setTimeout(updateScope,180);
}
function bindRoad50Controls(){
 const apply=event=>{
  const button=event.target.closest?.('#road50My50,#road50Remaining,#road50All');
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  setScope(ROAD50_BUTTONS[button.id]||'my50');
 };
 document.addEventListener('click',apply,true);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const button=event.target.closest?.('#road50My50,#road50Remaining,#road50All');
  if(!button)return;
  event.preventDefault();
  setScope(ROAD50_BUTTONS[button.id]||'my50');
 },true);
}
function robustRedDisplay(){
 const root=document.documentElement;root.classList.toggle('campfire-mode');const on=root.classList.contains('campfire-mode');
 try{localStorage.setItem('ddmg-v6-campfire',on?'1':'0')}catch{}
 document.querySelectorAll('#campfireHero,#toggleCampfireSection,#focusCampfire').forEach(b=>{b.textContent=on?'Normal display':'Red display';b.setAttribute('aria-pressed',String(on))});
}
function bindDisplay(){
 ['campfireHero','toggleCampfireSection','focusCampfire'].forEach(id=>{const old=document.getElementById(id);if(!old)return;const fresh=old.cloneNode(true);old.replaceWith(fresh);fresh.addEventListener('click',robustRedDisplay)});
}
function bindPersistentDisclosures(){
 document.querySelectorAll('details.persistent-disclosure[id]').forEach(d=>{
  const key='ddmg-v15-3-disclosure-'+d.id;
  try{const saved=localStorage.getItem(key);if(saved!==null)d.open=saved==='1'}catch{}
  d.addEventListener('toggle',()=>{try{localStorage.setItem(key,d.open?'1':'0')}catch{}});
 });
}
function emergencyRead(key,fallback=''){try{const value=localStorage.getItem(key);return value===null?fallback:value}catch{return fallback}}
function emergencyReadJson(key,fallback){try{const raw=emergencyRead(key);return raw?JSON.parse(raw):fallback}catch{return fallback}}
function emergencyWrite(key,value){try{localStorage.setItem(key,value);return true}catch{return false}}
function emergencyEscape(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
function emergencyClock(value){
 if(!value)return 'Not set';if(/\b(?:AM|PM)\b/i.test(value))return value;
 const m=String(value).match(/^(\d{1,2}):(\d{2})$/);if(!m)return value;const h=Number(m[1]);return `${h%12||12}:${m[2]} ${h>=12?'PM':'AM'}`;
}
function emergencyActiveTrip(){
 const key=window.DDMG_CONFIG.storageKeys.tripLibrary,activeKey=window.DDMG_CONFIG.storageKeys.activeTrip;
 const list=emergencyReadJson(key,[]),id=emergencyRead(activeKey,'');return Array.isArray(list)?list.find(t=>t?.id===id)||null:null;
}
function emergencyObjectiveData(id){
 const cfg=window.DDMG_CONFIG,obj=cfg.focusObjectives[id]||cfg.focusObjectives.blanca,trip=emergencyActiveTrip();
 const matches=trip&&trip.summitWeatherId===obj.weatherId;
 return {...obj,date:matches&&trip.climbDate?trip.climbDate:obj.date,start:matches&&trip.plannedStart?emergencyClock(trip.plannedStart):obj.start,turn:matches&&trip.turnaround?emergencyClock(trip.turnaround):obj.turn,partners:matches&&trip.partners?trip.partners:'',tripName:matches&&trip.name?trip.name:''};
}
function emergencyNoteScope(obj){return `${obj.id}:${obj.date}`}
function emergencyCopy(text){
 if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
 return new Promise((resolve,reject)=>{try{const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.append(ta);ta.select();document.execCommand('copy');ta.remove();resolve()}catch(err){reject(err)}});
}
function renderEmergencySection(id){
 const cfg=window.DDMG_CONFIG,helper=window.DDMG_EMERGENCY,obj=emergencyObjectiveData(id),area=helper.emergencyAreaFor(obj);
 const details=document.getElementById('emergencyLocalDetails'),dispatch=document.getElementById('emergencyCallDispatch'),sheriff=document.getElementById('emergencyCallSheriff'),verified=document.getElementById('emergencyLocalVerified');
 emergencyWrite(cfg.storageKeys.focusObjective,obj.id);
 const focus=document.getElementById('focusObjective');if(focus&&focus.value!==obj.id)focus.value=obj.id;
 if(area){
  const officeLine=area.officePhone&&area.officeDisplay?` · <b>${emergencyEscape(area.officeLabel||'Sheriff’s office')}:</b> ${emergencyEscape(area.officeDisplay)}`:'';
  details.innerHTML=`<p><strong>${emergencyEscape(area.county)}</strong> · ${emergencyEscape(area.sarTeam)}</p><p>${emergencyEscape(area.activation)}</p><p><b>${emergencyEscape(area.dispatchLabel||'County dispatch')}:</b> ${emergencyEscape(area.dispatchDisplay)}${officeLine}</p><p><a target="_blank" rel="noopener" href="${emergencyEscape(area.sourceUrl)}">Official county source</a> · <a target="_blank" rel="noopener" href="${emergencyEscape(area.sarSourceUrl)}">SAR source</a></p>`;
  dispatch.href=`tel:${area.dispatchPhone}`;dispatch.textContent=`Call ${area.county} contact`;dispatch.removeAttribute('aria-disabled');
  if(area.officePhone){sheriff.href=`tel:${area.officePhone}`;sheriff.textContent='Call sheriff’s office';sheriff.removeAttribute('aria-disabled');sheriff.hidden=false}else{sheriff.removeAttribute('href');sheriff.setAttribute('aria-disabled','true');sheriff.hidden=true}
  verified.textContent=`Verified ${helper.dateLabel(area.verifiedOn)}. Recheck before departure because jurisdiction and numbers can change.`;
 }else{
  details.innerHTML='<p><strong>Jurisdiction not verified.</strong></p><p>Use 911 for an emergency. Confirm the county sheriff for this route before leaving service; the app will not guess.</p>';
  dispatch.removeAttribute('href');sheriff.removeAttribute('href');dispatch.setAttribute('aria-disabled','true');sheriff.setAttribute('aria-disabled','true');verified.textContent='No local number is displayed rather than presenting an unverified contact.';
 }
 const weather=emergencyReadJson(cfg.storageKeys.weather,{})?.[obj.weatherId]||null,trip=emergencyActiveTrip(),note=document.getElementById('emergencyVondaNote'),notes=emergencyReadJson(cfg.storageKeys.fieldUpdateNote,{});
 const phone=document.getElementById('emergencyContactPhone'),email=document.getElementById('emergencyContactEmail'),contactStatus=document.getElementById('emergencyContactStatus'),sendStatus=document.getElementById('emergencyVondaStatus');
 note.value=String(notes?.[emergencyNoteScope(obj)]||'');
 const loadContactFields=()=>{const contact=helper.readLocalContact();phone.value=contact.phone||'';email.value=contact.email||'';return contact};
 const refresh=()=>{
  const all=emergencyReadJson(cfg.storageKeys.fieldUpdateNote,{});all[emergencyNoteScope(obj)]=note.value;emergencyWrite(cfg.storageKeys.fieldUpdateNote,JSON.stringify(all));
  const contact=helper.readLocalContact(),body=helper.buildUpdate({objective:obj,area,forecast:weather,trip,note:note.value}),subject=`Mountain Guide update — ${obj.label}`;
  document.getElementById('emergencyTextVonda').href=helper.smsHref(contact.phone,body);
  document.getElementById('emergencyEmailVonda').href=helper.emailHref(contact.email,subject,body);
  if(contact.phone&&contact.email)sendStatus.textContent='Text and email drafts will be addressed to the contact saved on this device. Review before sending.';
  else if(contact.phone)sendStatus.textContent='The text draft will be addressed. The email draft opens without a recipient.';
  else if(contact.email)sendStatus.textContent='The email draft will be addressed. The text draft opens without a recipient.';
  else sendStatus.textContent='No recipient is saved on this device. Drafts open with the message prepared but without a recipient.';
  document.getElementById('emergencyCopyVonda').onclick=async()=>{try{await emergencyCopy(body);sendStatus.textContent='Update copied. Paste it into the communication method you choose.'}catch{sendStatus.textContent='The browser could not copy automatically. Open a text or email draft instead.'}};
 };
 document.getElementById('emergencySaveContact').onclick=()=>{
  if(email.value&&!email.checkValidity()){contactStatus.textContent='Enter a valid email address or leave the email field blank.';return}
  helper.saveLocalContact({phone:phone.value,email:email.value});const saved=loadContactFields();
  contactStatus.textContent=(saved.phone||saved.email)?'Contact saved only on this device. It is not part of the public app files.':'The browser could not retain the contact, or both fields were blank.';refresh();
 };
 document.getElementById('emergencyClearContact').onclick=()=>{helper.clearLocalContact();loadContactFields();contactStatus.textContent='Saved phone and email cleared from this device.';refresh();};
 note.oninput=refresh;loadContactFields();refresh();
}
function bindEmergencySection(){
 const select=document.getElementById('emergencyObjectiveSelect');if(!select||!window.DDMG_CONFIG)return;
 select.innerHTML='';Object.values(window.DDMG_CONFIG.focusObjectives).forEach(obj=>{const option=document.createElement('option');option.value=obj.id;option.textContent=obj.label;select.append(option)});
 let selected=emergencyRead(window.DDMG_CONFIG.storageKeys.focusObjective,'blanca');if(!window.DDMG_CONFIG.focusObjectives[selected])selected='blanca';select.value=selected;
 select.addEventListener('change',()=>renderEmergencySection(select.value));
 document.getElementById('focusObjective')?.addEventListener('change',e=>{if(window.DDMG_CONFIG.focusObjectives[e.target.value]){select.value=e.target.value;renderEmergencySection(e.target.value)}});
 renderEmergencySection(selected);
}
function init(){
 try{scope=localStorage.getItem('ddmg-road50-scope')||'my50'}catch{}
 bindPersistentDisclosures();bindDisplay();bindEmergencySection();bindRoad50Controls();
 document.getElementById('road50My50')?.addEventListener('click',()=>setScope('my50'));
 document.getElementById('road50Remaining')?.addEventListener('click',()=>setScope('remaining'));
 document.getElementById('road50All')?.addEventListener('click',()=>setScope('all'));
 document.getElementById('summitSearch')?.addEventListener('input',()=>setTimeout(updateScope,80));
 document.getElementById('summitRangeFilter')?.addEventListener('change',()=>setTimeout(updateScope,30));
 const grid=document.getElementById('summitGrid');if(grid)new MutationObserver(()=>updateScope()).observe(grid,{childList:true,subtree:true});
 setTimeout(updateScope,250);document.documentElement.dataset.appVersion=V;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
