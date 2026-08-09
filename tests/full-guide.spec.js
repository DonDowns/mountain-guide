import {test,expect} from '@playwright/test';
import {APP_VERSION,RELEASE_MODULE,captureBrowserErrors,expectNoHorizontalOverflow,openFullGuide,seedApp,setServerMode,waitForScroll} from './helpers.js';

test.beforeEach(async({page,request})=>{
  await setServerMode(request,'current');
});

test('full guide loads, matches the release, and primary navigation reaches unobscured targets',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  await expect(page.locator(`script[src="${RELEASE_MODULE}"]`)).toHaveCount(1);

  const destinations={Home:{id:'home',nav:'home'},Plan:{id:'expedition',nav:'expedition'},Crew:{id:'crew',nav:'crew'},Weather:{id:'intelligence',nav:'intelligence'},Summits:{id:'summits',nav:'summits'},Gear:{id:'gear',nav:'gear'},Emergency:{id:'emergency',nav:'emergency'}};
  for(const [label,{id,nav}] of Object.entries(destinations)){
    const link=page.locator(`.bottom-nav a[data-nav="${nav}"]`);
    await expect(link).toHaveAttribute('href',`#${id}`);
    if(!test.info().project.name.includes('mobile')){
      await expect(link).toBeHidden();
      await expect(page.locator(`#${id}`)).toHaveCount(1);
      continue;
    }
    await link.click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect.poll(async()=>page.evaluate(targetId=>{
      const target=document.getElementById(targetId),heading=target?.querySelector('h1,h2')||target,nav=document.querySelector('.bottom-nav');
      const rect=heading.getBoundingClientRect(),navRect=nav.getBoundingClientRect();
      const lowerBound=navRect.height?navRect.top:window.innerHeight;
      return rect.top>=-1&&rect.bottom<lowerBound;
    },id),{message:`${label} target is visible and not covered by fixed navigation`}).toBe(true);
  }
  if(test.info().project.name.includes('mobile'))await expectNoHorizontalOverflow(page);
  assertNoErrors();
});

test('Trip Intelligence, Summit Focus, Red display, and accordions remain repeatable',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);

  const intelligenceLink=page.locator('.bottom-nav a[data-nav="intelligence"]');
  if(test.info().project.name.includes('mobile'))await intelligenceLink.click();
  else await intelligenceLink.evaluate(element=>element.click());
  await expect(page).toHaveURL(/#intelligence$/);
  await page.locator('#openIntelDetailsBtn').click();
  await expect(page.locator('#intelDetails')).toHaveAttribute('open','');
  await page.locator('.intel-return-control').click();
  await expect(page).toHaveURL(/#home$/);

  const disclosure=page.locator('#tripBuildDisclosure');
  const summary=disclosure.locator('summary');
  await expect(disclosure).toHaveAttribute('open','');
  await summary.click();
  await expect(disclosure).not.toHaveAttribute('open','');
  await summary.click();
  await expect(disclosure).toHaveAttribute('open','');

  const firstGroup=page.locator('.summit-group-head').first();
  const initialAction=await firstGroup.locator('.summit-group-action').textContent();
  await firstGroup.click();
  await expect(firstGroup.locator('.summit-group-action')).not.toHaveText(initialAction);
  await firstGroup.click();
  await expect(firstGroup.locator('.summit-group-action')).toHaveText(initialAction);

  const redControls=page.locator('#campfireHero,#toggleCampfireSection,#focusCampfire');
  for(const id of ['campfireHero','toggleCampfireSection']){
    await page.locator(`#${id}`).click();
    await expect(redControls).toHaveText(['Normal display','Normal display','Normal display']);
    for(let index=0;index<3;index++)await expect(redControls.nth(index)).toHaveAttribute('aria-pressed','true');
    await page.locator(`#${id}`).click();
    await expect(redControls).toHaveText(['Red display','Red display','Red display']);
  }

  await page.locator('#openFocusHero').click();
  await expect(page.locator('#focusOverlay')).toBeVisible();
  await page.locator('#focusCampfire').click();
  await expect(redControls).toHaveText(['Normal display','Normal display','Normal display']);
  for(let index=0;index<3;index++)await expect(redControls.nth(index)).toHaveAttribute('aria-pressed','true');
  await page.locator('#focusCampfire').click();
  await expect(redControls).toHaveText(['Red display','Red display','Red display']);
  await page.locator('#closeFocus').click();
  await expect(page.locator('#focusOverlay')).toBeHidden();
  assertNoErrors();
});

test('Road to 50 derives all scope counts from app data and returns to its filters',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  const expected=await page.evaluate(()=>({
    my50:window.COLORADO_SUMMITS.filter(peak=>peak.status==='completed'||peak.road50).length,
    remaining:window.COLORADO_SUMMITS.filter(peak=>peak.road50&&peak.status!=='completed').length,
    all:window.COLORADO_SUMMITS.length
  }));
  const protectedLedger=await page.evaluate(()=>ledgerFacts());
  expect({total:protectedLedger.total,completed:protectedLedger.completed,remaining:protectedLedger.remaining,planned:protectedLedger.planned}).toEqual({total:58,completed:35,remaining:20,planned:3});
  const cases=[
    {id:'road50My50',scope:'my50',count:expected.my50,label:'My 50'},
    {id:'road50Remaining',scope:'remaining',count:expected.remaining,label:'Still to climb'},
    {id:'road50All',scope:'all',count:expected.all,label:'All 58'}
  ];
  const names=[];
  for(const item of cases){
    await page.locator(`#${item.id}`).click();
    const cards=page.locator('#summitGrid [data-summit-name]');
    await expect(cards).toHaveCount(item.count);
    await expect(page.locator('#summitGrid')).toHaveAttribute('data-road50-scope',item.scope);
    await expect(page.locator('#summitGrid')).toHaveAttribute('data-rendered-count',String(item.count));
    await expect(page.locator('#summitGroupStatus')).toContainText(`${item.count} summits`);
    await expect(page.locator('#summitGroupStatus')).toContainText(item.label);
    await expect(page.locator('#summitGrid .summit-group-body[hidden]')).toHaveCount(0);
    names.push(await cards.evaluateAll(nodes=>nodes.map(node=>node.dataset.summitName)));
    await page.locator('#road50BackToFilters').click();
    await waitForScroll(page);
    const top=await page.locator('#roadTo50').evaluate(element=>element.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(-1);
    expect(top).toBeLessThan(180);
  }
  expect(names[0]).not.toEqual(names[1]);
  expect(names[1]).not.toEqual(names[2]);
  assertNoErrors();
});

test('Mountain Intelligence search, emergency drafts, weather alerts, and failed refresh are explicit',async({page,browserName})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page,{allow:[/Failed to load resource/i]});
  await openFullGuide(page);

  const search=page.locator('#mountainIntelSearch');
  for(const alias of ['Mount Blue Sky','Evans','Mt Evans','Mount Evans']){
    await search.fill(alias);
    const blueSkyResult=page.locator('#mountainIntelList [data-mountain-name]').filter({hasText:'Mount Blue Sky'});
    await expect(blueSkyResult,`${alias} resolves to the current mountain name`).toHaveCount(1);
    await blueSkyResult.click();
    await expect(page.locator('#mountainIntelProfile h3')).toHaveText('Mount Blue Sky');
  }
  await search.fill('');
  await expect(page.locator('#mountainIntelList [data-mountain-name]').first()).toBeVisible();

  await expect(page.locator('#emergency .emergency-primary')).toHaveAttribute('href','tel:911');
  await expect(page.locator('#emergencyCallDispatch')).toHaveAttribute('href',/^tel:\+1\d{10}$/);
  await expect(page.locator('#emergencyCallSheriff')).toHaveAttribute('href',/^tel:\+1\d{10}$/);
  const sms=await page.locator('#emergencyTextVonda').getAttribute('href');
  const email=await page.locator('#emergencyEmailVonda').getAttribute('href');
  expect(sms).toMatch(/^sms:/);
  expect(email).toMatch(/^mailto:/);
  const drafts=decodeURIComponent(`${sms}\n${email}`);
  expect(drafts).toContain('Call 911 first');
  expect(drafts).toContain('Dispatchers determine the responding jurisdiction');
  expect(drafts).not.toMatch(/message sent|rescue (?:was )?(?:requested|activated)|help is on the way/i);

  const alertTrigger=page.locator('[data-weather-alert-location="blanca"]').first();
  await expect(alertTrigger).toContainText('at last refresh');
  await alertTrigger.click();
  await expect(page.locator('#weatherAlertOverlay')).toBeVisible();
  await expect(page.locator('#weatherAlertList article')).toHaveCount(2);
  await expect(page.locator('#weatherAlertList')).toContainText('Severity');
  await expect(page.locator('#weatherAlertList')).toContainText('Affected area');
  await expect(page.locator('#weatherAlertList')).toContainText('Expiration');
  await page.locator('#closeWeatherAlerts').click();

  if(browserName==='chromium'){
    await page.route('https://api.weather.gov/**',route=>route.abort('failed'));
    await page.locator('#heroWeatherRefresh').click();
  }else{
    await page.evaluate(()=>{
      const key='ddmg-v4-weather',weather=JSON.parse(localStorage.getItem(key));
      Object.values(weather).forEach(item=>{item.lastError='TypeError: Failed to fetch';item.failedAt=new Date().toISOString()});
      localStorage.setItem(key,JSON.stringify(weather));
    });
    await page.reload();
  }
  await expect(page.locator('#heroWeatherAge')).toContainText('Latest refresh failed');
  await expect(page.locator('#heroWeatherAge')).toContainText('current conditions not confirmed');
  await expect(page.locator('#wx-blanca .freshness')).toHaveText('Refresh failed');
  await expect(page.locator('#weatherFreshness')).toHaveText('Refresh failed');
  await page.locator('#openFocusHero').click();
  await expect(page.locator('#focusWeather')).toContainText('Latest refresh failed');
  await expect(page.locator('#focusWeather')).toContainText('Current conditions are not confirmed');
  await page.locator('#closeFocus').click();
  assertNoErrors();
});

test('Lake Como protected objective data and turnaround targets remain unchanged',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  const protectedObjectives=await page.evaluate(()=>Object.fromEntries(Object.entries(DDMG_CONFIG.focusObjectives).map(([id,item])=>[id,{date:item.date,start:item.start,turn:item.turn,weatherId:item.weatherId,emergencyAreaIds:item.emergencyAreaIds}])));
  expect(protectedObjectives).toEqual({
    blanca:{date:'2026-08-23',start:'4:15 AM',turn:'11:30 AM',weatherId:'blanca',emergencyAreaIds:['alamosa','costilla']},
    lake:{date:'2026-08-22',start:'10:00 AM',turn:'3:30 PM',weatherId:'lake',emergencyAreaIds:['alamosa','costilla']},
    lindsey:{date:'2026-08-24',start:'5:15 AM',turn:'12:00 PM',weatherId:'lindsey',emergencyAreaIds:['huerfano','costilla']}
  });
  assertNoErrors();
});

test('count-only cached alerts are visibly non-actionable',async({page,request})=>{
  await setServerMode(request,'current');
  await seedApp(page,{details:false});
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  await expect(page.locator('[data-weather-alert-location="blanca"]')).toHaveCount(0);
  const fallback=page.locator('.weather-alert-fallback').first();
  await expect(fallback).toContainText('at the last refresh');
  await expect(fallback).toContainText('Details unavailable');
  assertNoErrors();
});
