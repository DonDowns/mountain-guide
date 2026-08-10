import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import jsQR from 'jsqr';
import {PNG} from 'pngjs';
import {test,expect} from '@playwright/test';
import {captureBrowserErrors,expectNoHorizontalOverflow,openFullGuide,seedApp,setServerMode,waitForScroll} from './helpers.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HOME='https://companion.vondadowns.com/';
const FIELD_GUIDE='https://companion.vondadowns.com/generated/field-guide.pdf';
const POCKET_CARD='https://companion.vondadowns.com/generated/pocket-card.pdf';
const RELEASE_METADATA='https://companion.vondadowns.com/release.json';
const SHARE_TEXT='Open the public Companion for the shared expedition plan, decision prompts, emergency information, communication milestones, and offline field guide.';

test.beforeEach(async({request})=>setServerMode(request,'current'));

test('Crew tab reaches the complete Set Up a Friend flow with exact public contract links',async({page})=>{
  await seedApp(page);
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);

  const link=test.info().project.name.includes('mobile')?page.locator('.bottom-nav a[data-nav="crew"]'):page.locator('.nav a[href="#crew"]');
  await expect(link).toBeVisible();
  await link.click();
  await waitForScroll(page);
  await expect(page).toHaveURL(/#crew$/);
  await expect(page.locator('#crewTitle')).toHaveText('Crew');
  await expect(page.locator('#crew')).toContainText('Set Up a Friend');

  const contract=await page.evaluate(()=>globalThis.DDMG_COMPANION);
  expect(contract).toEqual({COMPANION_HOME:HOME,FIELD_GUIDE,POCKET_CARD,RELEASE_METADATA});
  for(const value of Object.values(contract)){
    const url=new URL(value);expect(url.origin).toBe('https://companion.vondadowns.com');expect(url.search).toBe('');expect(url.hash).toBe('');
  }
  expect(await page.evaluate(()=>Object.isFrozen(globalThis.DDMG_COMPANION))).toBe(true);
  await expect(page.locator('#openCompanion')).toHaveAttribute('href',HOME);
  await expect(page.locator('#openCompanion')).toHaveAttribute('rel',/\bnoreferrer\b/);
  await expect(page.locator('#companionUrlText')).toHaveAttribute('href',HOME);
  await expect(page.locator('#companionUrlText')).toHaveText(HOME);
  await expect(page.locator('#crewFieldGuide')).toHaveAttribute('href',FIELD_GUIDE);
  await expect(page.locator('#crewPocketCard')).toHaveAttribute('href',POCKET_CARD);
  await expect(page.locator('#companionReleaseStatus')).toHaveText('Companion 0.6.0-candidate.5');
  await page.locator('#showCompanionQr').click();
  await expect(page.locator('#crewActionStatus')).toHaveText('Companion QR code ready to scan.');
  await expect(page.locator('#companionQrPanel')).toBeFocused();

  await expect(page.locator('.crew-instruction-card').first()).toContainText('Add to Home Screen');
  await expect(page.locator('.crew-instruction-card').first()).toContainText('EACH PHONE');
  await expect(page.locator('.crew-instruction-card').last()).toContainText('Force quit Companion');
  await expect(page.locator('.crew-instruction-card').last()).toContainText('Timeline, Route, and Emergency');
  await expect(page.locator('.crew-instruction-card').last()).toContainText('Open both PDFs');
  await expect(page.locator('.crew-flow li')).toHaveCount(7);
  await expect(page.locator('.crew-flow')).toContainText('communication milestones');
  await expect(page.locator('.crew-flow')).toContainText('reopen it without coaching');
  await expect(page.locator('#companionQr')).toHaveAttribute('alt','QR code for the public Mountain Guide Companion at companion.vondadowns.com');

  const crewText=await page.locator('#crew').innerText();
  expect(crewText).not.toMatch(/\b(?:safe|all clear|good to go|green light|approved to climb|cleared to proceed|weather approval|offline approval|field-ready)\b/i);
  const targets=await page.locator('#openCompanion,#showCompanionQr,#shareCompanion:not([hidden]),#copyCompanionLink,#crewFieldGuide,#crewPocketCard').evaluateAll(elements=>elements.map(element=>{const rect=element.getBoundingClientRect();return {width:rect.width,height:rect.height}}));
  for(const target of targets){expect(target.width).toBeGreaterThanOrEqual(44);expect(target.height).toBeGreaterThanOrEqual(44)}
  if(test.info().project.name.includes('mobile'))await expectNoHorizontalOverflow(page);
  assertNoErrors();
});

test('Share Companion and Copy Link transmit only the exact public payload',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:async payload=>{globalThis.__crewSharePayload=JSON.parse(JSON.stringify(payload))}});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{globalThis.__crewClipboard=text}}});
  });
  await seedApp(page);
  await openFullGuide(page);
  await page.evaluate(()=>{
    localStorage.setItem('private-emergency-contact','Vonda 555-0100');
    localStorage.setItem('actual-start','PRIVATE-ACTUAL-START');
    localStorage.setItem('trip-journal','PRIVATE-JOURNAL');
    localStorage.setItem('gear','PRIVATE-GEAR');
    localStorage.setItem('selected-filter','PRIVATE-FILTER');
  });

  await page.locator('#shareCompanion').click();
  const payload=await page.evaluate(()=>globalThis.__crewSharePayload);
  expect(payload).toEqual({title:'Mountain Guide Companion',text:SHARE_TEXT,url:HOME});
  expect(Object.keys(payload).sort()).toEqual(['text','title','url']);
  expect(new URL(payload.url).search).toBe('');expect(new URL(payload.url).hash).toBe('');
  expect(JSON.stringify(payload)).not.toMatch(/Vonda 555|PRIVATE-|localStorage|actual-start|journal|gear|filter/i);

  await page.locator('#copyCompanionLink').click();
  await expect(page.locator('#crewActionStatus')).toHaveText('Companion link copied.');
  expect(await page.evaluate(()=>globalThis.__crewClipboard)).toBe(HOME);
});

test('Copy Link remains available when native sharing is unavailable',async({page})=>{
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{globalThis.__crewClipboard=text}}});
  });
  await seedApp(page);
  await openFullGuide(page);
  await expect(page.locator('#shareCompanion')).toBeHidden();
  await expect(page.locator('#crewShareFallback')).toBeVisible();
  await expect(page.locator('#copyCompanionLink')).toBeVisible();
  await page.locator('#copyCompanionLink').click();
  await expect(page.locator('#crewActionStatus')).toHaveText('Companion link copied.');
  expect(await page.evaluate(()=>globalThis.__crewClipboard)).toBe(HOME);
});

test('QR asset automatically decodes to the exact public Companion URL',async({page})=>{
  await seedApp(page);
  await openFullGuide(page);
  await expect(page.locator('#companionQr')).toBeVisible();
  const png=PNG.sync.read(fs.readFileSync(path.join(root,'companion-qr.png')));
  const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);
  expect(decoded,'QR image must be machine-decodable').not.toBeNull();
  expect(decoded.data).toBe(HOME);
  expect(new URL(decoded.data).search).toBe('');expect(new URL(decoded.data).hash).toBe('');
});

test('release metadata failure is neutral and nonblocking, with no state or cross-origin cache coupling',async({page})=>{
  await seedApp(page,{companionStatus:'failure'});
  const assertNoErrors=captureBrowserErrors(page);
  await openFullGuide(page);
  await expect(page.locator('#companionReleaseStatus')).toHaveText('Companion status unavailable right now.');
  await expect(page.locator('#crew')).toBeVisible();
  await expect(page.locator('#companionQr')).toBeVisible();
  await expect(page.locator('#crew')).not.toHaveClass(/danger|error|critical/);
  expect(await page.evaluate(()=>globalThis.__companionMetadataRequests)).toEqual([RELEASE_METADATA]);

  const source=fs.readFileSync(path.join(root,'js/crew.js'),'utf8');
  expect(source).not.toMatch(/\blocalStorage\b|\bsessionStorage\b|\bgeolocation\b|\bDDMG_CONFIG\b|\bCOLORADO_SUMMITS\b/);
  const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  expect(sw).not.toContain('companion.vondadowns.com');
  assertNoErrors();
});
