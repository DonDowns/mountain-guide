import fs from 'node:fs';
import path from 'node:path';
import {failIf,lineNumber,read,root} from './lib.mjs';

const served=['index.html','climb.html','styles.css','sw.js',...fs.readdirSync(path.join(root,'js')).filter(file=>file.endsWith('.js')).map(file=>`js/${file}`)];
const reviewPatterns=[
  /\ball clear\b/gi,
  /\bsafe to go\b/gi,
  /\broute is safe\b/gi,
  /\bweather permits\b/gi,
  /\bgo\s*\/\s*no-go\b/gi,
  /\brescue requested\b/gi,
  /\bmessage sent\b/gi,
  /\bhelp is on the way\b/gi,
  /\bcurrent alerts?\b/gi
];
const matches=[];
const combined=served.map(file=>read(file)).join('\n');

for(const file of served){
  const source=read(file);
  for(const pattern of reviewPatterns){
    pattern.lastIndex=0;
    for(const match of source.matchAll(pattern))matches.push({file,line:lineNumber(source,match.index),phrase:match[0]});
  }
}

for(const match of matches)console.log(`HUMAN REVIEW REQUIRED ${match.file}:${match.line} — "${match.phrase}"`);
if(!matches.length)console.log('No listed safety-language phrases require human review.');

const required=[
  ['weather-is-evidence safeguard',/weather is evidence,\s*not permission/i],
  ['call-911-first instruction',/call 911 first/i],
  ['dispatcher-jurisdiction instruction',/dispatchers? determine(?:s)? the responding jurisdiction/i],
  ['draft review-before-sending instruction',/review (?:the draft )?before sending/i],
  ['cached-alert timestamp wording',/alerts? at last refresh/i],
  ['cached/stale warning',/may be stale/i],
  ['explicit failed-refresh wording',/latest refresh failed/i],
  ['current-conditions-not-confirmed wording',/(?:current conditions are not confirmed|not confirmed current)/i]
];
const missing=required.filter(([,pattern])=>!pattern.test(combined)).map(([name])=>`Required served-app safeguard is missing: ${name}`);
failIf(missing,'Safety-language safeguard check failed');
console.log(`Safety-language safeguards passed: ${required.length} required concepts present.`);
console.log(`Human-review matches: ${matches.length}. Matches are reported without automatic context inference.`);
