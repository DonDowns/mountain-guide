import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {expect} from '@playwright/test';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const APP_VERSION=fs.readFileSync(path.join(root,'js/version.js'),'utf8').match(/DDMG_VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/)?.[1];
export const RELEASE_MODULE=`js/v${APP_VERSION.replaceAll('.','_')}.js`;

export function captureBrowserErrors(page,{allow=[]}={}){
  const errors=[];
  page.on('pageerror',error=>errors.push(`pageerror: ${error.message}`));
  page.on('console',message=>{
    if(message.type()!=='error')return;
    const text=`console: ${message.text()}`;
    if(!allow.some(pattern=>pattern.test(text)))errors.push(text);
  });
  return ()=>expect(errors,'unexpected browser console and page errors').toEqual([]);
}

export function weatherStore({details=true,failed=false,count=2}={}){
  const fetchedAt=new Date(Date.now()-2*60_000).toISOString();
  const failedAt=new Date(Date.now()-30_000).toISOString();
  const starts=[0,1,2,3,4,5].map(hours=>new Date(Date.now()+hours*3_600_000).toISOString());
  const upcoming=starts.map((startTime,index)=>({startTime,endTime:new Date(new Date(startTime).getTime()+3_600_000).toISOString(),temp:46+index,unit:'F',condition:'Mostly Clear',windText:'10 mph',windMph:10,windDirection:'NNW',pop:1,isDaytime:index>1}));
  const alerts=details
    ? Array.from({length:count},(_,index)=>({event:index?'Wind Advisory':'Air Quality Alert',severity:index?'Moderate':'Minor',headline:index?'Gusty ridge winds possible':'Smoke may reduce visibility',area:'Sangre de Cristo Mountains',ends:new Date(Date.now()+6*3_600_000).toISOString()}))
    : Array.from({length:count},(_,index)=>index?'Wind Advisory':'Air Quality Alert');
  const base={
    fetchedAt,
    sourceUpdatedAt:fetchedAt,
    gridElevationFt:12_400,
    current:upcoming[0],
    upcoming,
    alerts,
    trip:{available:true,minTemp:42,maxTemp:51,maxPop:10,maxWind:15,conditions:['Mostly Clear'],samples:upcoming.slice(0,4),alerts:alerts.map(alert=>typeof alert==='string'?alert:alert.event),sourceUpdatedAt:fetchedAt,firstRisk:null}
  };
  if(failed){base.lastError='TypeError: Failed to fetch';base.failedAt=failedAt;}
  return Object.fromEntries(['lake','blanca','ellingwood','lindsey'].map(id=>[id,structuredClone(base)]));
}

export async function seedApp(page,options={}){
  const payload={weather:weatherStore(options),red:Boolean(options.red),companionStatus:options.companionStatus||'success',companionVersion:options.companionVersion||'0.6.0-candidate.5'};
  await page.addInitScript(data=>{
    const metadataUrl='https://companion.vondadowns.com/release.json';
    const nativeFetch=window.fetch.bind(window);
    globalThis.__companionMetadataRequests=[];
    window.fetch=(input,init)=>{
      const href=typeof input==='string'?new URL(input,location.href).href:input?.url;
      if(href===metadataUrl){
        globalThis.__companionMetadataRequests.push(href);
        if(data.companionStatus==='failure')return Promise.reject(new TypeError('Companion metadata unavailable'));
        return Promise.resolve(new Response(JSON.stringify({companion_version:data.companionVersion}),{status:200,headers:{'content-type':'application/json'}}));
      }
      return nativeFetch(input,init);
    };
    if(sessionStorage.getItem('__mountainGuideE2ESeeded'))return;
    localStorage.clear();
    localStorage.setItem('ddmg-v4-weather',JSON.stringify(data.weather));
    localStorage.setItem('ddmg-v4-weather-selected','blanca');
    localStorage.setItem('ddmg-v6-campfire',data.red?'1':'0');
    localStorage.setItem('ddmg-road50-scope','my50');
    sessionStorage.setItem('__mountainGuideE2ESeeded','1');
  },payload);
}

export async function setServerMode(request,mode='current'){
  const response=await request.post(`/__test__/mode/${mode}`);
  expect(response.ok(),`test server accepted ${mode} mode`).toBeTruthy();
}

export async function openFullGuide(page){
  await page.goto('/index.html');
  await expect(page.locator('html')).toHaveAttribute('data-app-version',APP_VERSION);
  await expect(page.locator('span[data-app-version]')).toHaveText(APP_VERSION);
}

export async function openClimbMode(page){
  await page.goto('/climb.html');
  await expect(page.locator('#version')).toHaveText(APP_VERSION);
  await expect(page.locator('#objectiveTitle')).not.toBeEmpty();
}

export async function waitForScroll(page){
  await page.waitForTimeout(450);
}

export async function expectNoHorizontalOverflow(page){
  const dimensions=await page.evaluate(()=>({viewport:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  expect(dimensions.scroll,'document width must fit viewport').toBeLessThanOrEqual(dimensions.viewport+1);
}

export async function waitForServiceWorker(page){
  await page.evaluate(async()=>{
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  });
}
