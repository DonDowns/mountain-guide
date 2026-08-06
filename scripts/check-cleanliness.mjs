import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {failIf,root} from './lib.mjs';

const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).split(/\r?\n/).filter(Boolean);
const debris=/(^|\/)(?:\.DS_Store|node_modules|test-results|playwright-report|coverage|screenshots?|videos?|traces?|browser[-_ ]?profiles?)(?:\/|$)|\.(?:log|tmp|bak|old)$/i;
const duplicate=/(^|\/)(?:copy of |[^/]+ copy(?: \d+)?|[^/]+ duplicate|[^/]+ backup)(?:\.[^/]*)?$|~$/i;
const errors=[];

for(const file of tracked){
  if(debris.test(file))errors.push(`Tracked generated/system debris: ${file}`);
  if(duplicate.test(path.basename(file)))errors.push(`Possible duplicate/copy file: ${file}`);
}

failIf(errors,'Repository-cleanliness check failed');
console.log(`Repository cleanliness passed: ${tracked.length} tracked file(s), no prohibited debris or obvious copies.`);
