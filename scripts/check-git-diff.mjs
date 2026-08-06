import {spawnSync} from 'node:child_process';
import {failIf,root} from './lib.mjs';

const errors=[];
for(const args of [['diff','--check'],['diff','--cached','--check']]){
  const result=spawnSync('git',args,{cwd:root,encoding:'utf8'});
  if(result.status!==0)errors.push((result.stderr||result.stdout||`git ${args.join(' ')} failed`).trim());
}

failIf(errors,'Git whitespace check failed');
console.log('Git diff whitespace checks passed for staged and unstaged changes.');
