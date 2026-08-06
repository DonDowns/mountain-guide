import {test,expect} from '@playwright/test';
import {captureBrowserErrors,openFullGuide,seedApp,setServerMode} from './helpers.js';

test.beforeEach(async({request})=>setServerMode(request,'current'));

test('risk and turnaround functions never return affirmative safety authorization',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  const results=await page.evaluate(()=>{
    const objective=focusSpec('blanca');
    const noRiskPeriods=[{condition:'Clear',pop:0,windMph:5,startTime:'2026-08-23T15:00:00Z'}];
    const riskPeriods=[
      {condition:'Thunderstorms Likely',pop:60,windMph:35,startTime:'2026-08-23T16:00:00Z'},
      {condition:'Mostly Clear',pop:0,windMph:5,startTime:'2026-08-23T17:00:00Z'}
    ];
    const none=scanFirstRisk(noRiskPeriods);
    const risk=scanFirstRisk(riskPeriods);
    const checks=[
      turnaroundCheck(objective,null),
      turnaroundCheck(objective,{fetchedAt:new Date().toISOString(),trip:{available:false}}),
      turnaroundCheck(objective,{fetchedAt:new Date().toISOString(),trip:{available:true,firstRisk:null}}),
      turnaroundCheck(objective,{fetchedAt:new Date().toISOString(),trip:{available:true,firstRisk:risk}})
    ];
    return {none,risk,checks,countdownSource:renderCountdown.toString()};
  });
  expect(results.none).toBeNull();
  expect(results.risk.reason).toContain('thunderstorm wording');
  for(const result of results.checks){
    expect(result.text).not.toMatch(/^(?:all clear|safe to go|route is safe|conditions are safe)/i);
    expect(result.text).not.toMatch(/authoriz(?:e|es|ed|ation).*(?:climb|route)/i);
  }
  expect(results.checks.some(result=>/not an all-clear/i.test(result.text))).toBeTruthy();
  expect((results.countdownSource.match(/\?/g)||[]).length).toBeGreaterThanOrEqual(4);
  assertNoErrors();
});

test('emergency drafts remain drafts, call 911 first, and preserve location-aware jurisdiction',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  const drafts=await page.evaluate(()=>Object.values(DDMG_CONFIG.focusObjectives).map(objective=>({id:objective.id,text:DDMG_EMERGENCY.buildUpdate({objective,forecast:null,trip:null,note:''})})));
  for(const draft of drafts){
    expect(draft.text).toContain('Emergency: Call 911 first');
    expect(draft.text).toContain('Dispatchers determine the responding jurisdiction');
    expect(draft.text).toContain('Status / location note: Add current status or location before sending.');
    expect(draft.text).not.toMatch(/message sent|rescue (?:was )?(?:requested|activated)|help is on the way/i);
    expect(draft.text).not.toMatch(/(?:sole|definitive|entire route) jurisdiction|jurisdiction is [A-Z]/i);
  }
  expect(drafts.find(item=>item.id==='blanca').text).toMatch(/Alamosa[\s\S]*Costilla/);
  expect(drafts.find(item=>item.id==='lindsey').text).toMatch(/Huerfano[\s\S]*Costilla/);
  assertNoErrors();
});

test('failed and cached weather cannot present Fresh or Current without qualification',async({page})=>{
  await seedApp(page,{failed:true});
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  await expect(page.locator('#heroWeatherAge')).toContainText('Latest refresh failed');
  await expect(page.locator('#heroWeatherAge')).toContainText('current conditions not confirmed');
  await expect(page.locator('#wx-blanca .freshness')).toHaveText('Refresh failed');
  await expect(page.locator('#weatherFreshness')).toHaveText('Refresh failed');
  await expect(page.locator('#wx-blanca')).toContainText('Showing saved/cached weather');
  await expect(page.locator('#wx-blanca')).toContainText('Current conditions are not confirmed');
  await expect(page.locator('[data-weather-alert-location="blanca"]').first()).toContainText('at last refresh');
  assertNoErrors();
});
