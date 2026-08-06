/* Version 15.3.10 field-readiness compatibility and emergency-section bindings. */
(()=>{
'use strict';
const V=window.DDMG_CONFIG?.version||window.DDMG_VERSION||'unknown';
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
 const cfg=window.DDMG_CONFIG,helper=window.DDMG_EMERGENCY,obj=emergencyObjectiveData(id),areas=helper.emergencyAreasFor(obj),area=areas[0]||null;
 const details=document.getElementById('emergencyLocalDetails'),dispatch=document.getElementById('emergencyCallDispatch'),sheriff=document.getElementById('emergencyCallSheriff'),verified=document.getElementById('emergencyLocalVerified');
 emergencyWrite(cfg.storageKeys.focusObjective,obj.id);
 const focus=document.getElementById('focusObjective');if(focus&&focus.value!==obj.id)focus.value=obj.id;
 if(area){
  const guidance=helper.emergencyGuidanceFor(obj);
  const areaMarkup=areas.map(entry=>`<section class="emergency-area-detail"><h4>${emergencyEscape(entry.county)} public contacts</h4><p><b>${emergencyEscape(entry.dispatchLabel||'County dispatch')}:</b> <a href="tel:${emergencyEscape(entry.dispatchPhone)}">${emergencyEscape(entry.dispatchDisplay)}</a>${entry.officePhone&&entry.officeDisplay?` · <b>${emergencyEscape(entry.officeLabel||'Sheriff’s office')}:</b> <a href="tel:${emergencyEscape(entry.officePhone)}">${emergencyEscape(entry.officeDisplay)}</a>`:''}</p><p><a target="_blank" rel="noopener" href="${emergencyEscape(entry.sourceUrl)}">Official county source</a> · <a target="_blank" rel="noopener" href="${emergencyEscape(entry.sarSourceUrl)}">SAR source</a></p></section>`).join('');
  details.innerHTML=`<p class="emergency-call-first"><strong>Call 911 first.</strong> Give the exact location, mountain, route, elevation, and coordinates if available. Dispatchers determine the responding jurisdiction; you do not need to choose a county before calling.</p><p>${emergencyEscape(guidance)}</p>${areaMarkup}`;
  dispatch.href=`tel:${area.dispatchPhone}`;dispatch.textContent=`Call ${area.county.replace(' County','')} dispatch`;dispatch.removeAttribute('aria-disabled');
  if(area.officePhone){sheriff.href=`tel:${area.officePhone}`;sheriff.textContent=`Call ${area.county.replace(' County','')} sheriff`;sheriff.removeAttribute('aria-disabled');sheriff.hidden=false}else{sheriff.removeAttribute('href');sheriff.setAttribute('aria-disabled','true');sheriff.hidden=true}
  verified.textContent=`Public contacts verified ${[...new Set(areas.map(entry=>helper.dateLabel(entry.verifiedOn)))].join(' / ')}. Recheck before departure because numbers and responding jurisdiction can change.`;
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
 bindPersistentDisclosures();bindEmergencySection();
 window.DDMG_ROAD50?.refresh();document.documentElement.dataset.appVersion=V;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
