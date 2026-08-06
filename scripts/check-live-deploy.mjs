import {parseVersion} from './lib.mjs';

const base=new URL(process.env.LIVE_URL||'https://dondowns.github.io/mountain-guide/');
const expected=process.env.EXPECTED_VERSION||parseVersion();
const expectedModule=`js/v${expected.replaceAll('.','_')}.js`;

async function get(pathname){
  const url=new URL(pathname,base);
  const response=await fetch(url,{redirect:'follow',headers:{Accept:'text/html,application/javascript;q=0.9,*/*;q=0.8'}});
  if(response.status!==200)throw new Error(`${url} returned HTTP ${response.status}`);
  return {url,text:await response.text()};
}

const full=await get('./');
const climb=await get('./climb.html');
const version=await get('./js/version.js');
const liveVersion=version.text.match(/DDMG_VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/)?.[1];

if(liveVersion!==expected)throw new Error(`Live js/version.js is ${liveVersion||'unreadable'}; expected ${expected}.`);
if(!full.text.includes(`src="${expectedModule}"`))throw new Error(`Live full guide does not reference ${expectedModule}.`);
if(!climb.text.includes('src="js/version.js"'))throw new Error('Live Climb Mode does not reference js/version.js.');

console.log(`Post-deploy verification passed: ${base}`);
console.log(`Full guide, Climb Mode, and js/version.js returned HTTP 200 at Version ${expected}.`);
console.log(`Live full guide references ${expectedModule}.`);
