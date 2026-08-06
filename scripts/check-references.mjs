import fs from 'node:fs';
import path from 'node:path';
import {failIf,lineNumber,read,root} from './lib.mjs';

const errors=[];
const checked=[];
const htmlFiles=['index.html','climb.html'];
const idsByFile=new Map();

for(const file of htmlFiles){
  const source=read(file);
  const ids=[...source.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)].map(match=>match[2]);
  const duplicates=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
  if(duplicates.length)errors.push(`${file}: duplicate IDs: ${duplicates.join(', ')}`);
  idsByFile.set(file,new Set(ids));
}

function localTarget(sourceFile,value){
  const decoded=value.replaceAll('&amp;','&').trim();
  if(!decoded||decoded==='#'||/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(decoded))return null;
  const [withoutHash,fragment='']=decoded.split('#',2);
  const pathname=withoutHash.split('?',1)[0];
  let targetFile;
  if(!pathname)targetFile=sourceFile;
  else if(pathname==='.'||pathname==='./'||pathname==='/')targetFile='index.html';
  else{
    const base=sourceFile.startsWith('js/')?'':path.dirname(sourceFile);
    targetFile=path.normalize(path.join(base,pathname.replace(/^\.\//,'').replace(/^\//,'')));
    if(targetFile.endsWith(path.sep)||!path.extname(targetFile))targetFile=path.join(targetFile,'index.html');
  }
  return {targetFile:targetFile.replaceAll('\\','/'),fragment};
}

function checkReference(sourceFile,value,index,kind){
  if(kind==='href'&&!value.trim()){
    errors.push(`${sourceFile}:${lineNumber(read(sourceFile),index)} empty href value`);
    return;
  }
  if(/^\s*javascript:/i.test(value)){
    errors.push(`${sourceFile}:${lineNumber(read(sourceFile),index)} javascript: link is not allowed`);
    return;
  }
  const target=localTarget(sourceFile,value);
  if(!target)return;
  if(target.targetFile.includes('${'))return;
  const absolute=path.join(root,target.targetFile);
  if(!fs.existsSync(absolute)){
    errors.push(`${sourceFile}:${lineNumber(read(sourceFile),index)} missing local ${kind}: ${value}`);
    return;
  }
  checked.push(`${sourceFile} -> ${target.targetFile}`);
  if(target.fragment){
    const htmlTarget=target.targetFile==='.'?'index.html':target.targetFile;
    const targetIds=idsByFile.get(htmlTarget);
    if(targetIds&&!targetIds.has(decodeURIComponent(target.fragment)))errors.push(`${sourceFile}:${lineNumber(read(sourceFile),index)} missing anchor target: ${value}`);
  }
}

for(const file of htmlFiles){
  const source=read(file);
  for(const match of source.matchAll(/\b(href|src|poster)\s*=\s*(["'])(.*?)\2/gi))checkReference(file,match[3],match.index,match[1].toLowerCase());
  for(const match of source.matchAll(/\bsrcset\s*=\s*(["'])(.*?)\1/gi))for(const item of match[2].split(',').map(part=>part.trim().split(/\s+/)[0]).filter(Boolean))checkReference(file,item,match.index,'srcset');
  const ids=idsByFile.get(file);
  for(const match of source.matchAll(/\bfor\s*=\s*(["'])(.*?)\1/gi))if(!ids.has(match[2]))errors.push(`${file}:${lineNumber(source,match.index)} label target does not exist: ${match[2]}`);
  for(const match of source.matchAll(/\baria-controls\s*=\s*(["'])(.*?)\1/gi))for(const id of match[2].split(/\s+/))if(id&&!ids.has(id))errors.push(`${file}:${lineNumber(source,match.index)} aria-controls target does not exist: ${id}`);
}

const css=read('styles.css');
for(const match of css.matchAll(/url\(\s*(["']?)([^)'"\s]+)\1\s*\)/gi))checkReference('styles.css',match[2],match.index,'CSS URL');

const manifest=JSON.parse(read('manifest.webmanifest'));
function walkManifest(value,key=''){
  if(Array.isArray(value))return value.forEach(item=>walkManifest(item,key));
  if(value&&typeof value==='object')return Object.entries(value).forEach(([childKey,child])=>walkManifest(child,childKey));
  if(typeof value==='string'&&['id','src','url','start_url','scope'].includes(key))checkReference('manifest.webmanifest',value,read('manifest.webmanifest').indexOf(value),'manifest reference');
}
walkManifest(manifest);

const jsFiles=fs.readdirSync(path.join(root,'js')).filter(file=>file.endsWith('.js')).map(file=>`js/${file}`).concat('sw.js');
for(const file of jsFiles){
  const source=read(file);
  for(const match of source.matchAll(/(["'`])([^"'`\r\n]+)\1/g)){
    const value=match[2];
    if(/\$\{/.test(value)||!/\.(?:html|css|js|webmanifest|png|jpe?g|svg|ico)(?:[?#].*)?$/i.test(value))continue;
    checkReference(file,value,match.index,'script reference');
  }
  for(const match of source.matchAll(/aria-controls=["']([^"']+)["']/g)){
    const target=match[1];
    const matchingId=new RegExp(`id=["']${target.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["']`).test(source);
    if(!matchingId)errors.push(`${file}:${lineNumber(source,match.index)} generated aria-controls target has no matching generated ID: ${target}`);
  }
}

failIf(errors,'Local-reference and structural check failed');
console.log(`Reference check passed: ${checked.length} local references resolved.`);
console.log(`Structure passed: ${[...idsByFile.values()].reduce((sum,set)=>sum+set.size,0)} IDs, no duplicates or broken targets.`);
