import {test,expect} from '@playwright/test';
import {APP_VERSION,RELEASE_MODULE,captureBrowserErrors,expectNoHorizontalOverflow,seedApp,setServerMode,waitForServiceWorker} from './helpers.js';

test('installed full guide and Climb Mode reload offline without mixed-version state',async({page,context,request,browserName})=>{
  test.skip(browserName==='webkit','Playwright WebKit currently fails offline service-worker navigations internally; WebKit online coverage and physical-iPhone Airplane Mode verification remain required.');
  await setServerMode(request,'current');
  await seedApp(page);
  const errorChecks=[captureBrowserErrors(page,{allow:[/Failed to load resource/i]})];
  let navigationCount=0;
  const countNavigations=target=>target.on('framenavigated',frame=>{if(frame===target.mainFrame())navigationCount+=1;});
  countNavigations(page);
  await page.goto('/index.html');
  const supported=await page.evaluate(()=>Boolean('serviceWorker'in navigator&&'caches'in window));
  test.skip(!supported,`${test.info().project.name} does not expose service workers and Cache Storage.`);
  await waitForServiceWorker(page);
  if(!await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)))await page.reload();

  try{
    await page.addInitScript(()=>Object.defineProperty(Navigator.prototype,'onLine',{configurable:true,get:()=>false}));
    await context.setOffline(true);
    await page.reload({waitUntil:'domcontentloaded'});
    await expect(page.locator('span[data-app-version]')).toHaveText(APP_VERSION);
    await expect(page.locator(`script[src="${RELEASE_MODULE}"]`)).toHaveCount(1);
    await expect.poll(()=>page.evaluate(()=>navigator.onLine)).toBe(false);
    await page.locator('#heroWeatherRefresh').click();
    await expect(page.locator('#heroWeatherAge')).toContainText(/Saved offline|not confirmed current|current conditions not confirmed/i);
    await expect(page.locator('#emergency')).toContainText('Call 911 first');
    await expect(page.locator('#crew')).toContainText('Set Up a Friend');
    await expect(page.locator('#crew')).toContainText('EACH PHONE');
    await expect(page.locator('#crew')).toContainText('Offline Check on each phone');
    await expect(page.locator('#companionQr')).toBeVisible();
    await expect(page.locator('#companionUrlText')).toHaveText('https://companion.vondadowns.com/');
    await expect(page.locator('#openCompanion')).toHaveAttribute('href','https://companion.vondadowns.com/');
    await expect(page.locator('#crewFieldGuide')).toHaveAttribute('href','https://companion.vondadowns.com/generated/field-guide.pdf');
    await expect(page.locator('#crewPocketCard')).toHaveAttribute('href','https://companion.vondadowns.com/generated/pocket-card.pdf');
    await expect(page.locator('#companionReleaseStatus')).toHaveText('Companion status unavailable while offline.');
    const findButton=page.locator('.nav-find:visible,#openGlobalFind:visible').first();
    await findButton.click();
    await page.locator('#globalFindInput').fill('backup');
    await expect(page.locator('#findResults .find-result').filter({hasText:'Data Transfer'}).first()).toBeVisible();
    await page.locator('#closeFind').click();
    const cachedRequests=await page.evaluate(async()=>{const entries=[];for(const name of await caches.keys()){const cache=await caches.open(name);entries.push(...(await cache.keys()).map(request=>request.url))}return entries});
    expect(cachedRequests.some(url=>url.includes('companion.vondadowns.com'))).toBe(false);
    expect(cachedRequests.some(url=>url.endsWith('/companion-qr.png'))).toBe(true);

    await page.goto('/climb.html',{waitUntil:'domcontentloaded'});
    await expect(page.locator('#version')).toHaveText(APP_VERSION);
    await expect(page.locator('#objectiveTitle')).toContainText('Blanca Peak');
    await expect(page.locator('#startTime')).toHaveText('4:15 AM');
    await expect(page.locator('#turnTime')).toHaveText('11:30 AM');
    await expect(page.locator('#forecastCard')).toContainText(/saved\/cached forecast/i);
    await expect(page.locator('#forecastCard')).toContainText('not confirmed current');
    await expect(page.locator('#forecastCard')).toContainText('alerts at last refresh');
    await expect(page.locator('#localEmergencyDetails')).toContainText('Call 911 first');
    await expect(page.getByRole('button',{name:/My 50|Still to climb|All 58/})).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    expect(navigationCount,'offline navigation must not enter a reload loop').toBeLessThanOrEqual(5);
  }finally{
    await context.setOffline(false);
  }
  errorChecks.forEach(check=>check());
});
