import {test,expect} from '@playwright/test';
import {captureBrowserErrors,expectNoHorizontalOverflow,openFullGuide,seedApp,setServerMode,waitForScroll} from './helpers.js';

test.beforeEach(async({page,request})=>{
  await setServerMode(request,'current');
  await seedApp(page);
});

function openFindButton(page){
  return page.locator('.nav-find:visible,#openGlobalFind:visible').first();
}

async function searchFor(page,query){
  await openFindButton(page).click();
  const input=page.locator('#globalFindInput');
  await input.fill(query);
  return page.locator('#findResults .find-result');
}

test('global Find supports practical synonyms and reaches real controls without writing device state',async({page})=>{
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  const before=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])));
  const cases=[
    ['backup','Data Transfer'],['restore','Import backup file'],['import','Import backup file'],['export','Export this device’s data'],
    ['friend','Crew'],['share','Crew'],['companion','Crew'],['version','Version / About'],
    ['emergency','Emergency'],['911','Emergency'],['gear','Gear'],['readiness','Readiness'],['turnaround','Planning and turnaround']
  ];
  await openFindButton(page).click();
  const input=page.locator('#globalFindInput');
  for(const [query,title] of cases){
    await input.fill(query);
    const results=page.locator('#findResults .find-result');
    await expect(results.first(),`${query} ranks ${title} first`).toContainText(title);
  }
  await page.locator('#closeFind').click();

  const exportResults=await searchFor(page,'export');
  await exportResults.filter({hasText:'Export this device’s data'}).first().click();
  await waitForScroll(page);
  await expect(page.locator('#exportDataBtn')).toBeFocused();
  await expect(page).toHaveURL(/#exportDataBtn$/);

  const after=await page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(key=>[key,localStorage.getItem(key)])));
  expect(after,'opening Find and navigating must not write localStorage').toEqual(before);
  expect(new URL(page.url()).search,'Find navigation must not create query-string state').toBe('');
  assertNoErrors();
});

test('Evans aliases hand off to existing Mountain Intelligence behavior',async({page})=>{
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  for(const alias of ['Evans','Mt Evans','Mount Evans']){
    const results=await searchFor(page,alias);
    await results.filter({hasText:'Mount Blue Sky'}).first().click();
    await waitForScroll(page);
    await expect(page.locator('#mountainIntelSearch')).toHaveValue('Evans');
    await expect(page.locator('#mountainIntelList [data-mountain-name]').filter({hasText:'Mount Blue Sky'})).toHaveCount(1);
  }
  assertNoErrors();
});

test('Top, Bottom, Home, and global Find fit the 390x844 mobile viewport with accessible labels',async({page})=>{
  test.skip(!test.info().project.name.includes('mobile'),'mobile layout coverage');
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  const find=page.locator('#openGlobalFind');
  await expect(find).toBeVisible();
  await expect(find).toHaveAccessibleName('Find a Mountain Guide screen or action');
  const findBox=await find.boundingBox();
  expect(findBox.height).toBeGreaterThanOrEqual(44);
  const emergency=page.locator('.bottom-nav a[data-nav="emergency"]');
  await expect(emergency).toBeVisible();
  const emergencyBox=await emergency.boundingBox();
  expect(findBox.y+findBox.height).toBeLessThanOrEqual(emergencyBox.y);
  await page.locator('#update').evaluate(element=>element.classList.add('show'));
  await expect(page.locator('.global-find-fab-wrap')).toHaveClass(/update-clearance/);
  const shiftedFindBox=await find.boundingBox();
  const updateBox=await page.locator('#update').boundingBox();
  const overlapsUpdate=!(shiftedFindBox.x+shiftedFindBox.width<=updateBox.x||updateBox.x+updateBox.width<=shiftedFindBox.x||shiftedFindBox.y+shiftedFindBox.height<=updateBox.y||updateBox.y+updateBox.height<=shiftedFindBox.y);
  expect(overlapsUpdate,'Find stays reachable while an app update is ready').toBe(false);
  await page.locator('#update').evaluate(element=>element.classList.remove('show'));

  await page.locator('[data-page-jump="page-footer"]').click();
  await waitForScroll(page);
  await expect(page.locator('#page-footer')).toBeInViewport();
  await expect(page.locator('.footer-shortcuts').getByRole('link',{name:'Top'})).toBeVisible();
  await expect(page.locator('.footer-shortcuts').getByRole('link',{name:'Home',exact:true})).toBeVisible();
  await page.locator('.footer-shortcuts').getByRole('link',{name:'Top'}).click();
  await waitForScroll(page);
  await expect(page.locator('#home')).toBeInViewport();

  await page.evaluate(()=>{document.documentElement.style.fontSize='125%'});
  await expectNoHorizontalOverflow(page);
  await find.click();
  await expect(page.locator('#globalFindInput')).toBeFocused();
  await expect(page.locator('#closeFind')).toHaveAccessibleName('Close Find');
  await expectNoHorizontalOverflow(page);
  assertNoErrors();
});
