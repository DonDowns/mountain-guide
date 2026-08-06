import {test,expect} from '@playwright/test';
import {APP_VERSION,captureBrowserErrors,expectNoHorizontalOverflow,openClimbMode,seedApp,setServerMode} from './helpers.js';

test.beforeEach(async({request})=>setServerMode(request,'current'));

test('Climb Mode exposes the objective, timing, cached alert state, and emergency drafts without Road to 50',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openClimbMode(page);
  await expect(page.locator('#version')).toHaveText(APP_VERSION);
  await expect(page.locator('#objectiveTitle')).toContainText('Blanca Peak');
  await expect(page.locator('#startTime')).toHaveText('4:15 AM');
  await expect(page.locator('#turnTime')).toHaveText('11:30 AM');
  await expect(page.locator('#forecastCard')).toContainText('2 alerts at last refresh');
  await expect(page.locator('#forecastCard')).not.toContainText(/\b(?:active|current) alerts?\b/i);
  await expect(page.getByRole('button',{name:/My 50|Still to climb|All 58/})).toHaveCount(0);

  await expect(page.locator('#localEmergencyDetails')).toContainText('Call 911 first');
  await expect(page.locator('#localEmergencyDetails')).toContainText('Dispatchers determine the responding jurisdiction');
  await expect(page.locator('#callLocalDispatch')).toHaveAttribute('href',/^tel:\+1\d{10}$/);
  await expect(page.locator('#callSheriffOffice')).toHaveAttribute('href',/^tel:\+1\d{10}$/);
  const sms=await page.locator('#textVonda').getAttribute('href');
  const email=await page.locator('#emailVonda').getAttribute('href');
  expect(sms).toMatch(/^sms:/);
  expect(email).toMatch(/^mailto:/);
  const drafts=decodeURIComponent(`${sms}\n${email}`);
  expect(drafts).toContain('Call 911 first');
  expect(drafts).not.toMatch(/message sent|rescue (?:was )?(?:requested|activated)|help is on the way/i);
  if(test.info().project.name.includes('mobile'))await expectNoHorizontalOverflow(page);
  assertNoErrors();
});

test('Climb Mode Red display repeats and stays synchronized with the full guide',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openClimbMode(page);
  const red=page.locator('#night');
  await expect(red).toHaveText('Red display');
  await red.click();
  await expect(red).toHaveText('Normal display');
  await expect(red).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('body')).toHaveClass(/night/);

  await page.locator('a[href="index.html#focus"]').click();
  await expect(page).toHaveURL(/index\.html#focus$/);
  await expect(page.locator('html')).toHaveClass(/campfire-mode/);
  const fullControls=page.locator('#campfireHero,#toggleCampfireSection,#focusCampfire');
  for(let index=0;index<3;index++)await expect(fullControls.nth(index)).toHaveAttribute('aria-pressed','true');

  await page.goto('/climb.html');
  await page.locator('#night').click();
  await expect(page.locator('#night')).toHaveText('Red display');
  await page.locator('a[href="index.html#focus"]').click();
  await expect(page.locator('html')).not.toHaveClass(/campfire-mode/);
  for(let index=0;index<3;index++)await expect(fullControls.nth(index)).toHaveAttribute('aria-pressed','false');
  assertNoErrors();
});
