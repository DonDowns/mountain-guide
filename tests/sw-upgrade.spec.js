import {test,expect} from '@playwright/test';
import {APP_VERSION,RELEASE_MODULE,captureBrowserErrors,seedApp,setServerMode} from './helpers.js';

test('service-worker upgrade replaces the old fixture with one consistent current release',async({page,request})=>{
  await setServerMode(request,'old');
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  let navigationCount=0;
  page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigationCount+=1;});
  try{
    await page.goto('/index.html');
    await expect(page.locator('span[data-app-version]')).toHaveText('15.3.9');
    await expect(page.locator('script[src="tests/fixtures/v15_3_9.js"]')).toHaveCount(1);
    await page.evaluate(()=>navigator.serviceWorker.ready);
    if(!await page.evaluate(()=>Boolean(navigator.serviceWorker.controller)))await page.reload();
    await expect(page.locator('span[data-app-version]')).toHaveText('15.3.9');

    const preservedLocalData={
      'ddmg-test-imported-backup':'backup-state',
      'ddmg-test-lake-como-trip':'lake-como-trip-state',
      'ddmg-test-readiness':'readiness-state',
      'ddmg-test-gear':'gear-state',
      'ddmg-test-communication':'communication-state',
      'ddmg-test-journal-history':'journal-history-state'
    };
    await page.evaluate(data=>Object.entries(data).forEach(([key,value])=>localStorage.setItem(key,value)),preservedLocalData);

    await setServerMode(request,'current');
    await page.evaluate(async()=>{const registration=await navigator.serviceWorker.getRegistration();await registration.update();});
    await expect(page.locator('#update')).toHaveClass(/show/);
    const navigation=page.waitForEvent('framenavigated',frame=>frame===page.mainFrame());
    await page.locator('#applyUpdateBtn').click();
    await navigation;
    await expect(page.locator('span[data-app-version]')).toHaveText(APP_VERSION);
    await expect(page.locator(`script[src="${RELEASE_MODULE}"]`)).toHaveCount(1);
    await expect(page.locator('script[src="tests/fixtures/v15_3_9.js"]')).toHaveCount(0);
    expect(await page.evaluate(()=>globalThis.DDMG_UPGRADE_FIXTURE)).toBeUndefined();
    const state=await page.evaluate(async()=>({
      caches:await caches.keys(),
      version:document.querySelector('span[data-app-version]')?.textContent,
      modules:[...document.scripts].map(script=>script.getAttribute('src')).filter(src=>/v\d+_\d+_\d+\.js$/.test(src||''))
    }));
    expect(state.version).toBe(APP_VERSION);
    expect(state.modules).toEqual([RELEASE_MODULE]);
    expect(state.caches.some(name=>name.includes('v15-3-9'))).toBeFalsy();
    expect(state.caches.filter(name=>name.includes(`v${APP_VERSION.replaceAll('.','-')}`))).toHaveLength(1);
    expect(await page.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),Object.keys(preservedLocalData))).toEqual(preservedLocalData);
    await expect(page.locator('#update')).not.toHaveClass(/show/);
    expect(navigationCount,'upgrade must not enter a reload loop').toBeLessThanOrEqual(4);
  }finally{
    await setServerMode(request,'current');
  }
  assertNoErrors();
});
