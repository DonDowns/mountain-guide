/* Version 15.3.14 — reliable, explicit installed-PWA update lifecycle. */
(()=>{
'use strict';

const EXPECTED_PRODUCTION_ORIGIN='https://mountainguide.vondadowns.com';
const AUTOMATIC_CHECK_INTERVAL_MS=15*60*1000;
const MEANINGFUL_AWAY_MS=60*1000;
const ACTIVATION_TIMEOUT_MS=15*1000;
const serviceWorkers=globalThis.__DDMG_SERVICE_WORKER_ADAPTER||navigator.serviceWorker;
const clock=globalThis.__DDMG_UPDATE_CLOCK||{now:()=>Date.now()};
const environment=globalThis.__DDMG_UPDATE_ENV||{};
const observedRegistrations=new WeakSet();
const observedWorkers=new WeakSet();

let registration=null;
let waitingWorker=null;
let status='up-to-date';
let statusDetail='';
const UPDATE_CONFIRMATION_KEY='__ddmg_update_installed';
let updateInstalledNotice=false;
try{
 if(sessionStorage.getItem(UPDATE_CONFIRMATION_KEY)==='1'){
  sessionStorage.removeItem(UPDATE_CONFIRMATION_KEY);
  updateInstalledNotice=true;
  statusDetail='Update successfully installed.';
 }
}catch(_){}
let lastError=null;
let lastCheckAt=0;
let hiddenAt=0;
let checkInFlight=null;
let applying=false;
let applyRequested=false;
let controllerReloadIssued=false;
let activationTimer=0;
let initialization=null;

const byId=id=>document.getElementById(id);
const online=()=>navigator.onLine!==false;
const stateOf=worker=>worker?.state||'none';
const isDevelopmentHost=hostname=>hostname==='localhost'||hostname==='127.0.0.1'||hostname==='::1'||hostname.endsWith('.localhost')||hostname.endsWith('.test');
const isStandalone=()=>environment.standalone??(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true);

function originContext(overrides={}){
 const origin=overrides.origin||environment.origin||location.origin;
 let hostname=overrides.hostname||environment.hostname;
 if(!hostname){try{hostname=new URL(origin).hostname}catch{hostname=location.hostname}}
 const standalone=overrides.standalone??isStandalone();
 return {origin,hostname,standalone};
}

function isUnexpectedStandaloneOrigin(overrides={}){
 const context=originContext(overrides);
 return context.standalone&&!isDevelopmentHost(context.hostname)&&context.origin!==EXPECTED_PRODUCTION_ORIGIN;
}

function diagnosticSnapshot(error=lastError){
 const worker=registration?.waiting||registration?.installing||registration?.active;
 return {
  scriptURL:worker?.scriptURL||'unavailable',
  scope:registration?.scope||'unavailable',
  active:stateOf(registration?.active),
  waiting:stateOf(registration?.waiting),
  installing:stateOf(registration?.installing),
  errorClass:error?.name||error?.constructor?.name||'none'
 };
}

function userStatus(){
 if(isUnexpectedStandaloneOrigin()&&status==='up-to-date')return 'Reinstallation recommended';
 return ({
  'up-to-date':'Up to date',
  checking:'Checking for updates…',
  downloading:'Downloading update…',
  ready:'Update downloaded',
  applying:'Applying update…',
  failed:'Unable to check for updates.',
  offline:'Connect to the internet to check for updates.',
  unsupported:'Update checks are not available in this browser.'
 })[status]||'Up to date';
}

function renderDiagnostics(){
 const details=byId('updateDiagnostics');
 if(!details)return;
 const context=originContext();
 const visible=environment.diagnostics===true||isDevelopmentHost(context.hostname);
 details.hidden=!visible;
 const snapshot=diagnosticSnapshot();
 for(const [name,value] of Object.entries(snapshot)){
  const target=byId(`updateDiagnostic${name[0].toUpperCase()}${name.slice(1)}`);
  if(target)target.textContent=value;
 }
}

function render(){
 const installed=byId('installedVersion');
 const statusText=byId('updateStatus');
 const detail=byId('updateStatusDetail');
 const warning=byId('legacyOriginWarning');
 const banner=byId('update');
 const applyButton=byId('applyUpdateBtn');
 if(installed)installed.textContent=globalThis.DDMG_VERSION||'unknown';
 if(statusText)statusText.textContent=userStatus();
 if(detail){detail.textContent=statusDetail;detail.hidden=!statusDetail}
 if(warning)warning.hidden=!isUnexpectedStandaloneOrigin();
 const showBanner=Boolean(waitingWorker)&&(status==='ready'||status==='applying');
 if(banner){
  banner.classList.toggle('show',showBanner);
  banner.setAttribute('aria-hidden',showBanner?'false':'true');
 }
 document.body?.classList.toggle('update-ready',showBanner);
 if(applyButton){
  applyButton.disabled=applying;
  applyButton.textContent=applying?'Applying update…':'Apply update';
 }
 renderDiagnostics();
}

function setStatus(next,{detail='',error=null}={}){
 status=next;statusDetail=detail;lastError=error;render();
}

function exposeWaitingWorker(worker){
 if(!worker||registration?.waiting!==worker||worker.state!=='installed')return false;
 waitingWorker=worker;
 setStatus('ready');
 return true;
}

function inspectRegistration(){
 if(!registration)return false;
 if(exposeWaitingWorker(registration.waiting))return true;
 if(!applying&&waitingWorker&&registration.waiting!==waitingWorker){
  waitingWorker=null;
  if(status==='ready')setStatus('up-to-date');
 }
 renderDiagnostics();
 return false;
}

function observeWorker(worker){
 if(!worker||observedWorkers.has(worker))return;
 observedWorkers.add(worker);
 if(worker.state==='installing'&&(registration?.active||serviceWorkers?.controller))setStatus('downloading');
 worker.addEventListener('statechange',()=>{
  renderDiagnostics();
  if(worker.state==='installing'&&(registration?.active||serviceWorkers?.controller))setStatus('downloading');
  if(worker.state==='installed'){
   queueMicrotask(inspectRegistration);
   setTimeout(inspectRegistration,0);
  }
  if(worker.state==='redundant'&&registration?.waiting!==worker&&!waitingWorker){
   setStatus('failed',{detail:'The update did not finish installing. The current version remains available.'});
  }
 });
}

function observeRegistration(nextRegistration){
 if(!nextRegistration)return;
 registration=nextRegistration;
 if(!observedRegistrations.has(nextRegistration)){
  observedRegistrations.add(nextRegistration);
  nextRegistration.addEventListener('updatefound',()=>{
   observeWorker(nextRegistration.installing);
   if(nextRegistration.installing&&(nextRegistration.active||serviceWorkers?.controller))setStatus('downloading');
  });
 }
 observeWorker(nextRegistration.installing);
 inspectRegistration();
}

function logUpdateFailure(error,phase){
 const snapshot=diagnosticSnapshot(error);
 console.warn(`[Mountain Guide ${phase}]`,snapshot);
}

async function refreshRegistration(){
 if(!serviceWorkers?.getRegistration)return registration;
 try{
  const current=await serviceWorkers.getRegistration();
  if(current)observeRegistration(current);
 }catch(error){logUpdateFailure(error,'registration inspection failed')}
 return registration;
}

async function checkForUpdates({manual=false,reason=manual?'manual':'automatic'}={}){
 if(initialization&&!registration)await initialization;
 await refreshRegistration();
 if(inspectRegistration())return true;
 if(!online()){
  if(manual)setStatus('offline');
  return false;
 }
 if(!registration?.update){
  setStatus('unsupported');
  return false;
 }
 const now=clock.now();
 if(!manual&&lastCheckAt&&now-lastCheckAt<AUTOMATIC_CHECK_INTERVAL_MS)return false;
 if(checkInFlight)return checkInFlight;
 lastCheckAt=now;
 setStatus('checking');
 checkInFlight=Promise.resolve().then(()=>registration.update()).then(()=>{
  if(inspectRegistration())return true;
  if(registration.installing){
   observeWorker(registration.installing);
   if(registration.active||serviceWorkers?.controller)setStatus('downloading');
  }else{
   const detail=updateInstalledNotice?'Update successfully installed.':'';
   updateInstalledNotice=false;
   setStatus('up-to-date',{detail});
  }
  return true;
 }).catch(error=>{
  logUpdateFailure(error,`${reason} update check failed`);
  setStatus('failed',{error});
  return false;
 }).finally(()=>{checkInFlight=null;renderDiagnostics()});
 return checkInFlight;
}

function activationFailed(error,detail='Unable to apply the update. The current version remains available.'){
 clearTimeout(activationTimer);activationTimer=0;applying=false;applyRequested=false;
 logUpdateFailure(error,'update activation failed');
 if(registration?.waiting&&registration.waiting.state==='installed'){
  waitingWorker=registration.waiting;
  setStatus('ready',{detail,error});
 }else{
  waitingWorker=null;
  setStatus('failed',{detail,error});
 }
}

function applyUpdate(){
 inspectRegistration();
 const worker=registration?.waiting;
 if(applying||!worker||worker!==waitingWorker||worker.state!=='installed')return false;
 applying=true;applyRequested=true;setStatus('applying');
 try{
  worker.postMessage({type:'SKIP_WAITING'});
  activationTimer=setTimeout(()=>activationFailed(new Error('ActivationTimeout')),ACTIVATION_TIMEOUT_MS);
  return true;
 }catch(error){
  activationFailed(error);
  return false;
 }
}

function handleControllerChange(){
 if(!applyRequested||controllerReloadIssued)return;
 controllerReloadIssued=true;clearTimeout(activationTimer);activationTimer=0;
 applying=false;waitingWorker=null;setStatus('up-to-date');
 try{sessionStorage.setItem(UPDATE_CONFIRMATION_KEY,'1')}catch(_){}
 location.reload();
}

async function handleVisibilityChange(){
 if(document.visibilityState==='hidden'){
  hiddenAt=clock.now();
  return;
 }
 await refreshRegistration();
 if(inspectRegistration())return;
 const timeAway=hiddenAt?clock.now()-hiddenAt:0;
 hiddenAt=0;
 if(timeAway>=MEANINGFUL_AWAY_MS)checkForUpdates({reason:'foreground resume'});
}

function bindControls(){
 byId('applyUpdateBtn')?.addEventListener('click',applyUpdate);
 byId('checkUpdatesBtn')?.addEventListener('click',()=>checkForUpdates({manual:true}));
 if(updateInstalledNotice&&typeof globalThis.toast==='function'){
  globalThis.toast('Update successfully installed.');
 }
 render();
}

function initialize(){
 if(!serviceWorkers?.register){setStatus('unsupported');return Promise.resolve(null)}
 serviceWorkers.addEventListener?.('controllerchange',handleControllerChange);
 document.addEventListener('visibilitychange',handleVisibilityChange);
 addEventListener('online',()=>checkForUpdates({reason:'connection restored'}));
 initialization=Promise.resolve(serviceWorkers.register('./sw.js',{updateViaCache:'none'})).then(firstRegistration=>{
  observeRegistration(firstRegistration);
  return Promise.resolve(serviceWorkers.ready||firstRegistration);
 }).then(readyRegistration=>{
  observeRegistration(readyRegistration);
  return checkForUpdates({reason:'initialization'});
 }).catch(error=>{
  logUpdateFailure(error,'service-worker registration failed');
  setStatus('failed',{error});
  return null;
 });
 return initialization;
}

window.DDMG_UPDATE_MANAGER=Object.freeze({
 applyUpdate,
 checkForUpdates,
 diagnosticSnapshot,
 getState:()=>({status,detail:statusDetail,lastCheckAt,waiting:Boolean(waitingWorker),applying}),
 isUnexpectedStandaloneOrigin,
 policy:Object.freeze({automaticCheckIntervalMs:AUTOMATIC_CHECK_INTERVAL_MS,meaningfulAwayMs:MEANINGFUL_AWAY_MS}),
 expectedProductionOrigin:EXPECTED_PRODUCTION_ORIGIN
});

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bindControls();initialize()},{once:true});
else{bindControls();initialize()}
})();
