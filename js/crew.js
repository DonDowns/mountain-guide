/* Crew distributes only the validated public Companion contract. */
(()=>{
'use strict';
const SHARE_PAYLOAD=Object.freeze({
  title:'Mountain Guide Companion',
  text:'Open the public Companion for the shared expedition plan, decision prompts, emergency information, communication milestones, and offline field guide.',
  url:''
});

function byId(id){return document.getElementById(id)}
function announce(message){
  const status=byId('crewActionStatus');
  if(!status)return;
  status.textContent=message;
  clearTimeout(announce.timer);
  announce.timer=setTimeout(()=>{if(status.textContent===message)status.textContent=''},3200);
}
async function copyPublicLink(url){
  if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(url);
  const field=document.createElement('textarea');
  field.value=url;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';
  document.body.append(field);field.select();
  const copied=document.execCommand('copy');field.remove();
  if(!copied)throw new Error('Copy unavailable');
}
function releaseVersion(data){
  const value=data?.companion_version??data?.version??data?.appVersion??data?.release?.version;
  return typeof value==='string'&&/^[0-9A-Za-z][0-9A-Za-z.+_-]{0,63}$/.test(value)?value:null;
}
async function refreshCompanionStatus(contract){
  const status=byId('companionReleaseStatus');
  if(!status)return;
  if(!navigator.onLine){status.textContent='Companion status unavailable while offline.';return}
  status.textContent='Checking Companion status…';
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),5000);
    let response;
    try{response=await fetch(contract.RELEASE_METADATA,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal})}
    finally{clearTimeout(timeout)}
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const version=releaseVersion(await response.json());
    status.textContent=version?`Companion ${version}`:'Companion metadata available.';
  }catch{status.textContent=navigator.onLine?'Companion status unavailable right now.':'Companion status unavailable while offline.'}
}
function setupCrew(){
  const contract=globalThis.DDMG_COMPANION;
  if(!contract)return;
  const links={
    openCompanion:contract.COMPANION_HOME,
    companionUrlText:contract.COMPANION_HOME,
    crewFieldGuide:contract.FIELD_GUIDE,
    crewPocketCard:contract.POCKET_CARD
  };
  for(const [id,href] of Object.entries(links)){const link=byId(id);if(link)link.href=href}
  const urlText=byId('companionUrlText');if(urlText)urlText.textContent=contract.COMPANION_HOME;

  byId('showCompanionQr')?.addEventListener('click',()=>{
    const panel=byId('companionQrPanel');
    panel?.scrollIntoView({behavior:'smooth',block:'center'});panel?.focus({preventScroll:true});
    announce('Companion QR code ready to scan.');
  });
  byId('copyCompanionLink')?.addEventListener('click',async()=>{
    try{await copyPublicLink(contract.COMPANION_HOME);announce('Companion link copied.')}
    catch{announce('Copy was unavailable. Select the public link below the QR code.')}
  });

  const shareButton=byId('shareCompanion');
  const shareFallback=byId('crewShareFallback');
  if(shareButton&&typeof navigator.share==='function'){
    shareButton.addEventListener('click',async()=>{
      const payload={...SHARE_PAYLOAD,url:contract.COMPANION_HOME};
      try{await navigator.share(payload)}catch(error){
        if(error?.name==='AbortError')announce('Sharing canceled.');
        else announce('Native sharing was unavailable. Use Copy Link.');
      }
    });
  }else{
    if(shareButton)shareButton.hidden=true;
    if(shareFallback)shareFallback.hidden=false;
  }

  window.addEventListener('offline',()=>{const status=byId('companionReleaseStatus');if(status)status.textContent='Companion status unavailable while offline.'});
  window.addEventListener('online',()=>void refreshCompanionStatus(contract));
  void refreshCompanionStatus(contract);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setupCrew);else setupCrew();
})();
