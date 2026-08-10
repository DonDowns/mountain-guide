import {test,expect} from '@playwright/test';
import {APP_VERSION,captureBrowserErrors,expectNoHorizontalOverflow,seedApp,setServerMode} from './helpers.js';

async function useFakeServiceWorker(page,options={}){
 await page.addInitScript(config=>{
  let now=1_000_000;
  let online=config.online!==false;
  let visibility='visible';
  let rejectUpdates=Boolean(config.rejectUpdates);
  const count=key=>Number(sessionStorage.getItem(key)||0);
  const increment=key=>sessionStorage.setItem(key,String(count(key)+1));
  Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>online});
  Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>visibility});

  class FakeWorker extends EventTarget{
   constructor(state='installed'){super();this.state=state;this.scriptURL=`${location.origin}/sw.js`}
   setState(next){this.state=next;this.dispatchEvent(new Event('statechange'))}
   postMessage(message){
    if(message?.type!=='SKIP_WAITING')return;
    increment('__updateApplyMessages');
    if(config.activationFailure)throw new DOMException('Activation blocked','InvalidStateError');
    if(config.autoActivate){
     registration.waiting=null;this.setState('activating');
     setTimeout(()=>{this.setState('activated');adapter.controller=this;adapter.dispatchEvent(new Event('controllerchange'))},0);
    }
   }
  }

  const active=new FakeWorker('activated');
  const initialWaiting=config.waiting&&count('__updateApplyMessages')===0?new FakeWorker('installed'):null;
  const registration=new EventTarget();
  registration.scope=`${location.origin}/`;
  registration.active=config.controlled===false?null:active;
  registration.waiting=initialWaiting;
  registration.installing=null;
  registration.update=async()=>{
   increment('__updateCalls');
   if(rejectUpdates)throw new TypeError('Synthetic update rejection');
  };

  const adapter=new EventTarget();
  adapter.controller=config.controlled===false?null:active;
  adapter.register=async()=>registration;
  adapter.ready=Promise.resolve(registration);
  adapter.getRegistration=async()=>registration;
  globalThis.__DDMG_SERVICE_WORKER_ADAPTER=adapter;
  globalThis.__DDMG_UPDATE_CLOCK={now:()=>now};
  globalThis.__DDMG_UPDATE_ENV=config.environment||{};

  const beginUpdate=()=>{
   const worker=new FakeWorker('installing');
   registration.installing=worker;
   registration.dispatchEvent(new Event('updatefound'));
   return worker;
  };
  let installing=null;
  globalThis.__swTest={
   advance:milliseconds=>{now+=milliseconds},
   applyMessages:()=>count('__updateApplyMessages'),
   beginUpdate:()=>{installing=beginUpdate()},
   finishUpdate:()=>{
    if(!installing)installing=beginUpdate();
    registration.waiting=installing;registration.installing=null;installing.setState('installed');
   },
   makeWaitingSilently:()=>{registration.installing=null;registration.waiting=new FakeWorker('installed')},
   setOnline:value=>{online=Boolean(value)},
   setRejectUpdates:value=>{rejectUpdates=Boolean(value)},
   setVisibility:value=>{visibility=value;document.dispatchEvent(new Event('visibilitychange'))},
   updateCalls:()=>count('__updateCalls')
  };
 },options);
}

async function openWithHarness(page,options={}){
 await useFakeServiceWorker(page,options);
 await seedApp(page);
 await page.goto('/index.html');
 await expect(page.locator('html')).toHaveAttribute('data-app-version',APP_VERSION);
 await expect(page.locator('#installedVersion')).toHaveText(APP_VERSION);
}

test.beforeEach(async({request})=>setServerMode(request,'current'));

test('no waiting worker hides Apply Update and performs the initial online check',async({page})=>{
 const assertNoErrors=captureBrowserErrors(page);
 await openWithHarness(page);
 await expect.poll(()=>page.evaluate(()=>__swTest.updateCalls())).toBe(1);
 await expect(page.locator('#update')).not.toHaveClass(/show/);
 await expect(page.locator('#applyUpdateBtn')).toBeHidden();
 await expect(page.locator('#updateStatus')).toHaveText('Up to date');
 assertNoErrors();
});

test('a registration already waiting at startup exposes the verified update action',async({page})=>{
 await openWithHarness(page,{waiting:true});
 await expect(page.locator('#update')).toHaveClass(/show/);
 await expect(page.locator('#update')).toContainText('Update downloaded');
 await expect(page.locator('#applyUpdateBtn')).toBeVisible();
 await expect(page.locator('#updateStatus')).toHaveText('Update downloaded');
 expect(await page.evaluate(()=>__swTest.updateCalls()),'a ready waiting update does not need another check').toBe(0);
});

test('updatefound reports downloading and exposes Apply Update only after installation is waiting',async({page})=>{
 await openWithHarness(page);
 await page.evaluate(()=>__swTest.beginUpdate());
 await expect(page.locator('#updateStatus')).toHaveText('Downloading update…');
 await expect(page.locator('#update')).not.toHaveClass(/show/);
 await page.evaluate(()=>__swTest.finishUpdate());
 await expect(page.locator('#updateStatus')).toHaveText('Update downloaded');
 await expect(page.locator('#applyUpdateBtn')).toBeVisible();
});

test('Apply Update sends one activation request and a failed activation leaves the current app usable',async({page})=>{
 const assertNoErrors=captureBrowserErrors(page);
 await openWithHarness(page,{waiting:true,activationFailure:true});
 await page.locator('#applyUpdateBtn').click();
 expect(await page.evaluate(()=>__swTest.applyMessages())).toBe(1);
 await expect(page.locator('#updateStatusDetail')).toContainText('current version remains available');
 await expect(page.locator('#home')).toBeVisible();
 await expect(page.locator('#applyUpdateBtn')).toBeEnabled();
 assertNoErrors();
});

test('successful activation reloads once, exactly after controllerchange',async({page})=>{
 await openWithHarness(page,{waiting:true,autoActivate:true});
 let navigations=0;
 page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations+=1});
 const navigation=page.waitForEvent('framenavigated',frame=>frame===page.mainFrame());
 await page.locator('#applyUpdateBtn').click();
 await navigation;
 await expect.poll(()=>page.evaluate(()=>Number(sessionStorage.getItem('__updateApplyMessages')||0))).toBe(1);
 await expect(page.locator('#updateStatus')).toHaveText('Up to date');
 await page.waitForTimeout(150);
 expect(navigations,'controllerchange causes one coherent reload').toBe(1);
});

test('foreground checks require meaningful time away and obey the automatic throttle',async({page})=>{
 await openWithHarness(page);
 await expect.poll(()=>page.evaluate(()=>__swTest.updateCalls())).toBe(1);
 await page.evaluate(()=>{__swTest.setVisibility('hidden');__swTest.advance(16*60*1000);__swTest.setVisibility('visible')});
 await expect.poll(()=>page.evaluate(()=>__swTest.updateCalls())).toBe(2);
 await page.evaluate(()=>{__swTest.setVisibility('hidden');__swTest.advance(2*60*1000);__swTest.setVisibility('visible')});
 await page.waitForTimeout(50);
 expect(await page.evaluate(()=>__swTest.updateCalls())).toBe(2);
});

test('foreground resume detects a worker that became waiting while the page was backgrounded',async({page})=>{
 await openWithHarness(page);
 await page.evaluate(()=>{__swTest.setVisibility('hidden');__swTest.makeWaitingSilently();__swTest.advance(2*60*1000);__swTest.setVisibility('visible')});
 await expect(page.locator('#updateStatus')).toHaveText('Update downloaded');
 await expect(page.locator('#applyUpdateBtn')).toBeVisible();
 expect(await page.evaluate(()=>__swTest.updateCalls()),'waiting inspection avoids unnecessary resume update work').toBe(1);
});

test('manual checks bypass the throttle, report offline neutrally, and allow retry after rejection',async({page})=>{
 const assertNoErrors=captureBrowserErrors(page);
 await openWithHarness(page,{rejectUpdates:true});
 await expect(page.locator('#updateStatus')).toHaveText('Unable to check for updates.');
 await page.evaluate(()=>__swTest.setRejectUpdates(false));
 await page.locator('#checkUpdatesBtn').click();
 await expect(page.locator('#updateStatus')).toHaveText('Up to date');
 expect(await page.evaluate(()=>__swTest.updateCalls())).toBe(2);
 await page.evaluate(()=>__swTest.setOnline(false));
 await page.locator('#checkUpdatesBtn').click();
 await expect(page.locator('#updateStatus')).toHaveText('Connect to the internet to check for updates.');
 expect(await page.evaluate(()=>__swTest.updateCalls()),'offline manual check performs no network work').toBe(2);
 assertNoErrors();
});

test('obsolete standalone origin warns while development origins do not',async({page})=>{
 await openWithHarness(page,{environment:{origin:'https://dondowns.github.io',hostname:'dondowns.github.io',standalone:true,diagnostics:true}});
 await expect(page.locator('#legacyOriginWarning')).toBeVisible();
 await expect(page.locator('#legacyOriginWarning')).toContainText('older Mountain Guide address');
 await expect(page.locator('#updateStatus')).toHaveText('Reinstallation recommended');
 expect(await page.evaluate(()=>DDMG_UPDATE_MANAGER.isUnexpectedStandaloneOrigin({origin:'http://127.0.0.1:4173',hostname:'127.0.0.1',standalone:true}))).toBe(false);
});

test('standalone local development keeps normal update status without an origin warning',async({page})=>{
 await openWithHarness(page,{environment:{origin:'http://127.0.0.1:4173',hostname:'127.0.0.1',standalone:true,diagnostics:true}});
 await expect(page.locator('#legacyOriginWarning')).toBeHidden();
 await expect(page.locator('#updateStatus')).toHaveText('Up to date');
 await expect(page.locator('#updateDiagnostics')).toBeVisible();
});

test('Version / About is reachable for all update-related global Find terms',async({page})=>{
 await openWithHarness(page);
 for(const term of ['version','about','update','check update','latest version']){
  await page.locator('#openGlobalFind').click();
  await page.locator('#globalFindInput').fill(term);
  const result=page.locator('#findResults .find-result').filter({hasText:'Version / About'}).first();
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.locator('#checkUpdatesBtn')).toBeFocused();
 }
});

test('ready banner fits 390×844 and 200% text without colliding with fixed field controls',async({page})=>{
 test.skip(!test.info().project.name.includes('mobile'),'mobile layout coverage');
 await openWithHarness(page,{waiting:true});
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%'});
 await expectNoHorizontalOverflow(page);
 const boxes=await page.evaluate(()=>{
  const box=selector=>{const rect=document.querySelector(selector)?.getBoundingClientRect();return rect&&{left:rect.left,right:rect.right,top:rect.top,bottom:rect.bottom,width:rect.width,height:rect.height}};
  return {banner:box('#update'),apply:box('#applyUpdateBtn'),find:box('#openGlobalFind'),focus:box('#focusFab'),ask:box('#aiFab'),navigation:box('.bottom-nav')};
 });
 const overlaps=(a,b)=>a&&b&&!(a.right<=b.left||b.right<=a.left||a.bottom<=b.top||b.bottom<=a.top);
 expect(boxes.banner.left).toBeGreaterThanOrEqual(0);
 expect(boxes.banner.right).toBeLessThanOrEqual(390);
 expect(boxes.apply.height).toBeGreaterThanOrEqual(44);
 for(const name of ['find','focus','ask','navigation'])expect(overlaps(boxes.banner,boxes[name]),`update banner does not overlap ${name}`).toBe(false);
});
