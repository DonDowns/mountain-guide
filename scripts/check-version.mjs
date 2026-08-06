import {exists,failIf,parseCore,parseVersion,read,repoFiles} from './lib.mjs';

const errors=[];
const version=parseVersion();
const releaseModule=`js/v${version.replaceAll('.','_')}.js`;
const index=read('index.html');
const climb=read('climb.html');
const climbScript=read('js/climb.js');
const sharedScript=read('js/shared.js');
const sw=read('sw.js');
const readme=read('README.md');
const core=parseCore();
const indexReleaseRefs=[...index.matchAll(/\bsrc=["'](js\/v\d+_\d+_\d+\.js)["']/g)].map(match=>match[1]);
const climbReleaseRefs=[...climb.matchAll(/\bsrc=["'](js\/v\d+_\d+_\d+\.js)["']/g)].map(match=>match[1]);
const cachedReleaseRefs=core.filter(item=>/\/v\d+_\d+_\d+\.js$/.test(item));

if(!exists(releaseModule))errors.push(`Current release module is missing: ${releaseModule}`);
if(indexReleaseRefs.length!==1||indexReleaseRefs[0]!==releaseModule)errors.push(`index.html must reference only ${releaseModule}; found ${indexReleaseRefs.join(', ')||'none'}`);
if(!climb.includes('src="js/version.js"')&&!climb.includes("src='js/version.js'"))errors.push('climb.html does not load js/version.js.');
if(climbReleaseRefs.length)errors.push(`climb.html must use the shared version mechanism, not release modules: ${climbReleaseRefs.join(', ')}`);
if(!sharedScript.includes('version:globalThis.DDMG_VERSION')||!climbScript.includes("getElementById('version').textContent=cfg.version"))errors.push('Climb Mode does not render the version supplied by js/version.js through DDShared.config.');
if(cachedReleaseRefs.length!==1||cachedReleaseRefs[0]!==`./${releaseModule}`)errors.push(`sw.js must cache only ./${releaseModule}; found ${cachedReleaseRefs.join(', ')||'none'}`);
if(!/const\s+RELEASE_VERSION\s*=/.test(sw)||!/const\s+CACHE\s*=\s*`[^`]*\$\{RELEASE_VERSION\}[^`]*`/.test(sw))errors.push('sw.js cache naming is not derived from RELEASE_VERSION.');
if(!readme.startsWith(`# Don Downs Mountain Guide — Version ${version}`))errors.push('README.md heading does not match js/version.js.');
if(!readme.includes(`**Version ${version} —`))errors.push('README.md current-release heading does not match js/version.js.');

const obsoleteFiles=repoFiles().filter(file=>/^js\/v\d+_\d+_\d+\.js$/.test(file)&&file!==releaseModule);
if(obsoleteFiles.length)errors.push(`Obsolete versioned release modules remain in the working tree: ${obsoleteFiles.join(', ')}`);
const hardcodedCheckers=repoFiles().filter(file=>file.startsWith('scripts/')&&file.endsWith('.mjs')&&read(file).includes(version));
if(hardcodedCheckers.length)errors.push(`Checker scripts hardcode the current app version: ${hardcodedCheckers.join(', ')}`);

failIf(errors,'Version consistency check failed');
console.log(`Version consistency passed: ${version}`);
console.log(`Current release module: ${releaseModule}`);
console.log('Climb Mode uses js/version.js; service-worker cache naming is version-derived.');
