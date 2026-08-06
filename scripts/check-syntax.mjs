import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {failIf,repoFiles,root} from './lib.mjs';

const files=repoFiles().filter(file=>/\.(?:js|mjs)$/.test(file));
const errors=[];

for(const file of files){
  const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8'});
  if(result.status!==0)errors.push(`${file}: ${(result.stderr||result.stdout||'syntax check failed').trim()}`);
}

failIf(errors,'JavaScript syntax check failed');
console.log(`JavaScript syntax passed: ${files.length} file(s).`);
