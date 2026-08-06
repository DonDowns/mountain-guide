import fs from 'node:fs';
import path from 'node:path';
import {failIf,lineNumber,repoFiles,root} from './lib.mjs';

const join=(...parts)=>parts.join('');
const publicPhones=new Map([
  [join('719','379','2880'),'The Lodge Motel — public business'],
  [join('719','589','5807'),'Alamosa County dispatch — official public agency'],
  [join('719','589','6608'),'Alamosa County Sheriff — official public agency'],
  [join('719','738','1044'),'Huerfano County dispatch — official public agency'],
  [join('719','738','1600'),'Huerfano County Sheriff — official public agency'],
  [join('970','920','5310'),'Pitkin County regional emergency dispatch — official public agency'],
  [join('970','920','5300'),'Pitkin County Sheriff — official public agency'],
  [join('970','944','2291'),'Hinsdale County Sheriff/non-emergency — official public agency'],
  [join('970','249','9110'),'Montrose County non-emergency dispatch — official public agency'],
  [join('970','325','7272'),'Ouray County Sheriff — official public agency'],
  [join('970','677','2257'),'Dolores County Sheriff/non-emergency — official public agency'],
  [join('970','385','2900'),'La Plata County non-emergency dispatch — official public agency'],
  [join('719','655','2544'),'Saguache County Sheriff/non-emergency — official public agency'],
  [join('719','276','5555'),'Fremont County non-emergency dispatch — official public agency'],
  [join('719','783','2270'),'Custer County Sheriff — official public agency'],
  [join('719','672','3302'),'Costilla County dispatch — official public agency'],
  [join('719','672','0673'),'Costilla County Sheriff — official public agency']
]);
const publicEmails=new Map();
const phonePattern=/(?<!\d)(?:(?:\+1[\s.-]?)|(?:1[\s.-]))?(?:\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}(?:\s*(?:x|ext\.?)\s*\d+)?(?!\d)/gi;
const emailPattern=/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const findings=[];
const errors=[];

for(const file of repoFiles()){
  const buffer=fs.readFileSync(path.join(root,file));
  if(buffer.includes(0))continue;
  const source=buffer.toString('utf8');
  for(const match of source.matchAll(phonePattern)){
    let digits=match[0].replace(/\D/g,'');
    if(digits.length>10&&digits.startsWith('1'))digits=digits.slice(1,11);
    const label=publicPhones.get(digits);
    findings.push({file,line:lineNumber(source,match.index),value:match[0],kind:'phone',label});
    if(!label)errors.push(`${file}:${lineNumber(source,match.index)} unapproved phone-like value: ${match[0]}`);
  }
  for(const match of source.matchAll(emailPattern)){
    const normalized=match[0].toLowerCase();
    const label=publicEmails.get(normalized);
    findings.push({file,line:lineNumber(source,match.index),value:match[0],kind:'email',label});
    if(!label)errors.push(`${file}:${lineNumber(source,match.index)} unapproved email address: ${match[0]}`);
  }
}

for(const item of findings)console.log(`${item.label?'PUBLIC ALLOWLIST':'UNAPPROVED'} ${item.kind} ${item.file}:${item.line} ${item.value}${item.label?` — ${item.label}`:''}`);
failIf(errors,'Privacy check failed');
console.log(`Privacy check passed: ${findings.length} contact occurrence(s), all verified public agency/business values.`);
console.log(`Public allowlist: ${publicPhones.size} phone number(s), ${publicEmails.size} email address(es).`);
