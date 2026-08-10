/* Global, offline destination finder and state-free long-page navigation. */
(function(){
 const destinations=[
  {title:'Data Transfer',description:'Back up or restore this device',target:'data-transfer-panel',aliases:['backup'],terms:'restore local data device transfer'},
  {title:'Export this device\u2019s data',description:'Open the Data Transfer export control',target:'exportDataBtn',aliases:['export','export backup'],terms:'backup download save'},
  {title:'Import backup file',description:'Open the Data Transfer import control',target:'data-transfer-panel',focus:'label[for="importDataFile"]',aliases:['restore','import','restore backup','import backup'],terms:'upload backup'},
  {title:'Crew',description:'Public Companion setup',target:'crew',aliases:['friend','share','companion'],terms:'set up a friend teammate'},
  {title:'Set Up a Friend',description:'Open the Crew setup workflow',target:'crew',terms:'friend share companion crew invite'},
  {title:'Emergency',description:'911, public contacts, and draft updates',target:'emergency',aliases:['911'],terms:'sos help rescue sheriff dispatch emergency'},
  {title:'Readiness',description:'Saved gear and communication checks',target:'readiness-checks',aliases:['readiness'],terms:'ready preparation checklist status'},
  {title:'Gear',description:'Gear Locker and Smart Pack Builder',target:'gear',aliases:['gear'],terms:'equipment pack packing locker'},
  {title:'Communication',description:'Saved communication checks',target:'communicationChecksCard',terms:'inreach check ins contact messages readiness'},
  {title:'Weather',description:'Saved NOAA/NWS forecasts and reviews',target:'weather',terms:'forecast nws noaa conditions alerts'},
  {title:'Road to 50',description:'Personal summit goal filters',target:'roadTo50',terms:'summits my 50 remaining fourteeners 14ers'},
  {title:'Mountain Intelligence',description:'Search the 58-mountain database',target:'mountain-intelligence',focus:'#mountainIntelSearch',terms:'mountains peaks routes 14ers database'},
  {title:'Mount Blue Sky',description:'Open the existing Mountain Intelligence alias search',target:'mountain-intelligence',focus:'#mountainIntelSearch',mountainQuery:'Evans',aliases:['evans','mt evans','mount evans'],terms:'blue sky'},
  {title:'Summit Focus',description:'Open the field summary sheet',target:'focus',focus:'#openFocusSection',terms:'focus field sheet start time objective'},
  {title:'Climb Mode',description:'Open the climb-only field page',href:'climb.html',terms:'field mode climb only'},
  {title:'Red Display',description:'Open the display control at the top of Home',target:'campfireHero',terms:'night red campfire dark display'},
  {title:'Trip setup',description:'Build or edit an expedition',target:'trip-builder',terms:'trip builder setup plan planning expedition'},
  {title:'Planning and turnaround',description:'Open Trip Intelligence planning checks',target:'intelligence',aliases:['turnaround','turn around'],terms:'planning start overdue decision'},
  {title:'Version / About',description:'Open the Mountain Guide footer',target:'page-footer',aliases:['version','about'],terms:'release build'},
  {title:'Home',description:'Return to Mountain Guide Home',target:'home',terms:'top start dashboard'}
 ];
 const byId=id=>document.getElementById(id);
 const overlay=()=>byId('findOverlay');
 const normalize=value=>String(value||'').toLowerCase().replace(/[\u2018\u2019]/g,"'").replace(/[^a-z0-9]+/g,' ').trim();
 function score(entry,query){
  const words=normalize(query).split(' ').filter(Boolean);
  if(!words.length)return 1;
  const normalizedQuery=words.join(' '),title=normalize(entry.title),aliases=(entry.aliases||[]).map(normalize),haystack=normalize(`${entry.title} ${entry.description} ${(entry.aliases||[]).join(' ')} ${entry.terms||''}`);
  if(words.some(word=>!haystack.includes(word)))return 0;
  if(title===normalizedQuery)return 100;
  if(aliases.includes(normalizedQuery))return 95;
  if(title.startsWith(normalizedQuery))return 80;
  return words.reduce((total,word)=>total+(title.includes(word)?10:3),0);
 }
 function results(query){
  return destinations.map((entry,index)=>({entry,index,score:score(entry,query)})).filter(item=>item.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).slice(0,12).map(item=>item.entry);
 }
 function render(){
  const list=byId('findResults'),query=byId('globalFindInput')?.value||'',matches=results(query);
  if(!list)return;
  list.innerHTML=matches.map((entry,index)=>`<button class="find-result" data-find-index="${destinations.indexOf(entry)}" type="button"><span><strong>${entry.title}</strong><small>${entry.description}</small></span><span aria-hidden="true">\u203a</span></button>`).join('');
  const status=byId('findStatus');
  if(status)status.textContent=matches.length?`${matches.length} destination${matches.length===1?'':'s'}`:'No destinations found. Try backup, friend, emergency, gear, or version.';
 }
 function openFind(trigger){
  const panel=overlay();if(!panel)return;
  panel.hidden=false;panel.dataset.returnFocus=trigger?.id||'';document.body.style.overflow='hidden';
  const input=byId('globalFindInput');if(input){input.value='';render();setTimeout(()=>input.focus(),0)}
 }
 function closeFind({restoreFocus=true}={}){
  const panel=overlay();if(!panel||panel.hidden)return;
  const returnId=panel.dataset.returnFocus;panel.hidden=true;document.body.style.overflow='';
  if(restoreFocus&&returnId)byId(returnId)?.focus();
 }
 function revealTarget(entry){
  if(entry.href){location.assign(entry.href);return}
  const target=byId(entry.target);if(!target)return;
  let ancestor=target.parentElement;
  while(ancestor){if(ancestor.tagName==='DETAILS')ancestor.open=true;ancestor=ancestor.parentElement}
  closeFind({restoreFocus:false});
  if(entry.mountainQuery){
   const input=byId('mountainIntelSearch');
   if(input){input.value=entry.mountainQuery;input.dispatchEvent(new Event('input',{bubbles:true}))}
  }
  history.replaceState(null,'',`#${entry.target}`);
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  const focusTarget=(entry.focus?document.querySelector(entry.focus):null)||target;
  if(!focusTarget.hasAttribute('tabindex')&&!/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(focusTarget.tagName))focusTarget.setAttribute('tabindex','-1');
  setTimeout(()=>focusTarget.focus({preventScroll:true}),350);
 }
 function pageJump(targetId){
  const target=byId(targetId);if(!target)return;
  target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:targetId==='page-footer'?'end':'start'});
 }
 function setup(){
  document.querySelectorAll('[data-open-find]').forEach((button,index)=>{
   if(!button.id)button.id=`openGlobalFind${index+1}`;
   button.addEventListener('click',()=>openFind(button));
  });
  byId('globalFindInput')?.addEventListener('input',render);
  byId('findResults')?.addEventListener('click',event=>{
   const button=event.target.closest('[data-find-index]');if(button)revealTarget(destinations[Number(button.dataset.findIndex)]);
  });
  byId('closeFind')?.addEventListener('click',()=>closeFind());
  overlay()?.addEventListener('click',event=>{if(event.target===overlay())closeFind()});
  document.addEventListener('keydown',event=>{
   if(overlay()?.hidden!==false)return;
   if(event.key==='Escape'){closeFind();return}
   if(event.key!=='Tab')return;
   const controls=[...overlay().querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')].filter(item=>item.offsetParent!==null);
   if(!controls.length)return;
   const first=controls[0],last=controls[controls.length-1];
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  });
  document.querySelectorAll('[data-page-jump]').forEach(control=>control.addEventListener('click',event=>{event.preventDefault();pageJump(control.dataset.pageJump)}));
  render();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
 window.DDMG_NAVIGATION={destinations:destinations.map(({title,target,href,terms})=>({title,target,href,terms})),openFind};
})();
