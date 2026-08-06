import path from 'node:path';
import {exists,failIf,parseCore,parseVersion,read} from './lib.mjs';

const errors=[];
const core=parseCore();
const version=parseVersion();
const expectedRelease=`./js/v${version.replaceAll('.','_')}.js`;
const duplicates=[...new Set(core.filter((item,index)=>core.indexOf(item)!==index))];
const missing=core.filter(item=>!exists(item==='./'?'.':item.replace(/^\.\//,'')));
const releaseEntries=core.filter(item=>/\/v\d+_\d+_\d+\.js$/.test(item));
const required=['./','./index.html','./climb.html','./styles.css','./manifest.webmanifest','./js/version.js','./js/climb.js','./icon-192.png','./icon-512.png','./apple-touch-icon.png',expectedRelease];

if(duplicates.length)errors.push(`Duplicate CORE entries: ${duplicates.join(', ')}`);
if(missing.length)errors.push(`Missing CORE files: ${missing.join(', ')}`);
if(releaseEntries.length!==1||releaseEntries[0]!==expectedRelease)errors.push(`Current cached release module must be ${expectedRelease}; found ${releaseEntries.join(', ')||'none'}`);
for(const item of required)if(!core.includes(item))errors.push(`Required precache entry is absent: ${item}`);
for(const item of core){
  if(/^(?:[a-z]+:)?\/\//i.test(item))errors.push(`CORE contains a non-local URL: ${item}`);
  if(item!=='./'&&path.isAbsolute(item))errors.push(`CORE entry must be repository-relative: ${item}`);
}
if(!read('sw.js').includes('${RELEASE_VERSION}'))errors.push('Cache name is not derived from RELEASE_VERSION.');

failIf(errors,'Service-worker precache check failed');
console.log(`Service-worker precache passed: ${core.length} unique local entries, all present.`);
console.log(`Cached release module: ${expectedRelease}`);
