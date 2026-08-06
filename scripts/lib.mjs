import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

export function read(relativePath){
  return fs.readFileSync(path.join(root,relativePath),'utf8');
}

export function exists(relativePath){
  return fs.existsSync(path.join(root,relativePath));
}

export function repoFiles(){
  return execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{cwd:root,encoding:'utf8'})
    .split(/\r?\n/).filter(Boolean).sort();
}

export function lineNumber(text,index){
  return text.slice(0,index).split('\n').length;
}

export function parseVersion(){
  const match=read('js/version.js').match(/DDMG_VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/);
  if(!match)throw new Error('js/version.js does not define a semantic DDMG_VERSION.');
  return match[1];
}

export function parseCore(){
  const source=read('sw.js');
  const block=source.match(/const\s+CORE\s*=\s*\[([\s\S]*?)\]\s*;/);
  if(!block)throw new Error('sw.js does not contain a readable CORE array.');
  return [...block[1].matchAll(/['"]([^'"]+)['"]/g)].map(match=>match[1]);
}

export function failIf(errors,heading='Static check failed'){
  if(!errors.length)return;
  console.error(`${heading}:`);
  errors.forEach(error=>console.error(`- ${error}`));
  process.exit(1);
}
