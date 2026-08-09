import fs from 'node:fs';
import path from 'node:path';
import {failIf,read,root} from './lib.mjs';
import {loadCompanionContract} from './companion-contract.mjs';
import {renderCompanionQr} from './generate-crew-qr.mjs';

const errors=[];
const expected=Object.freeze({
  COMPANION_HOME:'https://companion.vondadowns.com/',
  FIELD_GUIDE:'https://companion.vondadowns.com/generated/field-guide.pdf',
  POCKET_CARD:'https://companion.vondadowns.com/generated/pocket-card.pdf',
  RELEASE_METADATA:'https://companion.vondadowns.com/release.json'
});
const contract=loadCompanionContract();
if(JSON.stringify(contract)!==JSON.stringify(expected))errors.push(`Companion contract differs from the approved public endpoints: ${JSON.stringify(contract)}`);
for(const [key,value] of Object.entries(contract)){
  const url=new URL(value);
  if(url.origin!=='https://companion.vondadowns.com'||url.search||url.hash)errors.push(`${key} is not a clean Companion-origin URL: ${value}`);
}

const served=['index.html','styles.css','js/companion-contract.js','js/crew.js','sw.js'];
const productionOccurrences=served.flatMap(file=>[...read(file).matchAll(/https:\/\/companion\.vondadowns\.com/g)].map(match=>`${file}:${read(file).slice(0,match.index).split('\n').length}`));
if(JSON.stringify(productionOccurrences)!==JSON.stringify(['js/companion-contract.js:4']))errors.push(`Companion origin must appear only in the public contract; found ${productionOccurrences.join(', ')||'none'}`);

const crew=read('js/crew.js');
for(const pattern of [/\blocalStorage\b/,/\bsessionStorage\b/,/\bgeolocation\b/,/\bDDMG_CONFIG\b/,/\bCOLORADO_SUMMITS\b/])if(pattern.test(crew))errors.push(`Crew runtime may not access Mountain Guide state: ${pattern}`);
if(!crew.includes('contract.COMPANION_HOME')||!crew.includes('contract.RELEASE_METADATA'))errors.push('Crew runtime must derive share/navigation/status URLs from the contract.');

const sw=read('sw.js');
if(/companion\.vondadowns\.com/i.test(sw))errors.push('Mountain Guide service worker may not reference the Companion origin.');
for(const local of ['./js/companion-contract.js','./js/crew.js','./companion-qr.png'])if(!sw.includes(`'${local}'`))errors.push(`Mountain Guide service worker is missing local Crew resource ${local}.`);

const html=read('index.html');
for(const phrase of ['Set Up a Friend','Open Companion','Show QR Code','Share Companion','Copy Link','3-Page Field Guide','Emergency Pocket Card','EACH PHONE'])if(!html.includes(phrase))errors.push(`Crew UI is missing required text: ${phrase}`);
if(!html.includes('alt="QR code for the public Mountain Guide Companion at companion.vondadowns.com"'))errors.push('Crew QR requires descriptive alternative text.');

const generated=await renderCompanionQr();
const committed=fs.readFileSync(path.join(root,'companion-qr.png'));
if(!committed.equals(generated))errors.push('companion-qr.png is not the deterministic output of the approved public contract. Run npm run crew:qr.');

failIf(errors,'Companion distribution check failed');
console.log(`Companion contract passed: ${Object.keys(contract).length} clean public endpoints.`);
console.log('Crew runtime has no Mountain Guide storage/state access and the service worker contains only local Crew assets.');
console.log('Static QR is deterministic and generated from the exact Companion home URL.');
