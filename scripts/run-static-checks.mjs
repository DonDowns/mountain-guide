import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const directory=path.dirname(fileURLToPath(import.meta.url));
const checks=[
  'check-version.mjs',
  'check-sw-cache.mjs',
  'check-references.mjs',
  'check-privacy.mjs',
  'check-safety-language.mjs',
  'check-cleanliness.mjs'
];

for(const check of checks){
  console.log(`\n== ${check} ==`);
  const result=spawnSync(process.execPath,[path.join(directory,check)],{stdio:'inherit'});
  if(result.error)throw result.error;
  if(result.status!==0)process.exit(result.status??1);
}

console.log('\nAll static release-safety checks passed.');
