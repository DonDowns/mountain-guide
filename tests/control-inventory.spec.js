import {test,expect} from '@playwright/test';
import {captureBrowserErrors,openFullGuide,seedApp,setServerMode} from './helpers.js';

async function inventory(page,state){
  return page.evaluate(stateName=>{
    const selector='button,a[href],summary,input,select,textarea,[role="button"]';
    const nodes=[...document.querySelectorAll(selector)];
    const labelFor=element=>{
      const labelledBy=element.getAttribute('aria-labelledby');
      if(labelledBy){const text=labelledBy.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' ').trim();if(text)return text;}
      const explicit=element.getAttribute('aria-label')||element.getAttribute('title');if(explicit?.trim())return explicit.trim();
      if(element.id){const label=document.querySelector(`label[for="${CSS.escape(element.id)}"]`);if(label?.textContent.trim())return label.textContent.trim();}
      const wrapping=element.closest('label');if(wrapping?.textContent.trim())return wrapping.textContent.trim();
      return (element.textContent||element.getAttribute('placeholder')||element.getAttribute('name')||'').replace(/\s+/g,' ').trim();
    };
    return nodes.filter(element=>{
      const style=getComputedStyle(element),rect=element.getBoundingClientRect();
      return !element.hidden&&style.display!=='none'&&style.visibility!=='hidden'&&rect.width>0&&rect.height>0&&!element.disabled;
    }).map((element,index)=>{
      const rect=element.getBoundingClientRect();
      const type=element.matches('[role="button"]')&&!element.matches('button')?'role-button':element.tagName.toLowerCase();
      const segments=[];let current=element;
      while(current&&current!==document.documentElement){
        const siblings=[...current.parentElement.children],position=siblings.indexOf(current)+1;
        segments.unshift(`${current.tagName.toLowerCase()}:nth-child(${position})`);current=current.parentElement;
      }
      return {state:stateName,type,id:element.id||'',path:segments.join('>'),index,label:labelFor(element),width:Math.round(rect.width*10)/10,height:Math.round(rect.height*10)/10,clipped:rect.left<-1||rect.right>document.documentElement.clientWidth+1};
    });
  },state);
}

test.beforeEach(async({request})=>setServerMode(request,'current'));

test('dynamic control inventory has labels, usable critical targets, repeat responses, and no state corruption',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  await page.locator('details').evaluateAll(details=>details.forEach(item=>{item.open=true;}));
  const snapshots=[...(await inventory(page,'all-disclosures-open'))];

  await page.locator('#openFocusHero').click();
  snapshots.push(...await inventory(page,'summit-focus-open'));
  await page.locator('#closeFocus').click();
  await page.locator('[data-weather-alert-location="blanca"]').first().click();
  snapshots.push(...await inventory(page,'alert-details-open'));
  await page.locator('#closeWeatherAlerts').click();

  const unique=new Map();
  for(const item of snapshots){
    const key=item.id?`${item.type}#${item.id}`:`${item.type}:${item.path}`;
    if(!unique.has(key))unique.set(key,item);
  }
  const controls=[...unique.values()];
  const unlabeled=controls.filter(item=>!item.label);
  expect(unlabeled,'all reachable controls need a visible or accessible label').toEqual([]);

  const criticalIds=['campfireHero','road50My50','road50Remaining','road50All','road50BackToFilters','openFocusHero','focusCampfire','closeFocus','heroWeatherRefresh','closeWeatherAlerts'];
  for(const id of criticalIds){
    const item=controls.find(control=>control.id===id);
    expect(item,`critical control #${id} is inventoried`).toBeTruthy();
    expect(item.height,`critical control #${id} has an approximately 44px touch target`).toBeGreaterThanOrEqual(42);
    expect(item.clipped,`critical control #${id} is not horizontally clipped`).toBeFalsy();
  }

  const roadScope=await page.locator('#summitGrid').getAttribute('data-road50-scope');
  await page.locator('#campfireHero').click();
  await page.locator('#campfireHero').click();
  await expect(page.locator('#summitGrid')).toHaveAttribute('data-road50-scope',roadScope);
  const redState=await page.locator('#campfireHero').getAttribute('aria-pressed');
  await page.locator('#road50Remaining').click();
  await page.locator('#road50My50').click();
  await expect(page.locator('#campfireHero')).toHaveAttribute('aria-pressed',redState);

  const counts=Object.fromEntries(['button','a','summary','input','select','textarea','role-button'].map(type=>[type,controls.filter(item=>item.type===type).length]));
  const small=controls.filter(item=>item.width<42||item.height<42).length;
  const clipped=controls.filter(item=>item.clipped).length;
  console.log(`[control-inventory] ${test.info().project.name} total=${controls.length} ${JSON.stringify(counts)} small=${small} clipped=${clipped}`);
  expect(controls.length,'inventory must contain the live controls without hardcoding a historical total').toBeGreaterThan(100);
  assertNoErrors();
});
