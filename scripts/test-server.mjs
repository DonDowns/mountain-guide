import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.TEST_PORT||4173);
let releaseMode='current';
const types={'.css':'text/css; charset=utf-8','.html':'text/html; charset=utf-8','.ico':'image/x-icon','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json; charset=utf-8'};

function currentVersion(){
  return fs.readFileSync(path.join(root,'js/version.js'),'utf8').match(/DDMG_VERSION\s*=\s*['"](\d+\.\d+\.\d+)['"]/)?.[1]||'unknown';
}

function oldServiceWorker(){
  const source=fs.readFileSync(path.join(root,'sw.js'),'utf8');
  const coreBlock=source.match(/const CORE=(\[[\s\S]*?\]);/)?.[1];
  const currentModule=`./js/v${currentVersion().replaceAll('.','_')}.js`;
  const core=Function(`return ${coreBlock}`)().map(item=>item===currentModule?'./tests/fixtures/v15_3_9.js':item);
  return `const CORE=${JSON.stringify(core)};
const CACHE='ddmg-v15-3-9-upgrade-fixture';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE.map(item=>new Request(new URL(item,self.location.href),{cache:'reload'}))))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;const url=new URL(event.request.url);if(url.origin!==self.location.origin)return;if(event.request.mode==='navigate'){const shell=url.pathname.endsWith('/climb.html')?'./climb.html':'./index.html';event.respondWith(caches.match(shell).then(cached=>fetch(event.request).then(response=>response.ok?response:cached).catch(()=>cached)));return}event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));});`;
}

function bodyFor(relativePath){
  const current=currentVersion();
  const fullPath=path.join(root,relativePath);
  if(releaseMode==='old'&&relativePath==='js/version.js')return Buffer.from("globalThis.DDMG_VERSION='15.3.9';\n");
  if(releaseMode==='old'&&relativePath==='sw.js')return Buffer.from(oldServiceWorker());
  if(releaseMode==='old'&&relativePath==='index.html'){
    const html=fs.readFileSync(fullPath,'utf8').replace(`js/v${current.replaceAll('.','_')}.js`,'tests/fixtures/v15_3_9.js');
    return Buffer.from(html);
  }
  return fs.readFileSync(fullPath);
}

const server=http.createServer((request,response)=>{
  const url=new URL(request.url,'http://127.0.0.1');
  if(url.pathname==='/__test__/health'){
    response.writeHead(200,{'content-type':'application/json','cache-control':'no-store'}).end(JSON.stringify({ok:true,releaseMode}));return;
  }
  if(url.pathname.startsWith('/__test__/mode/')&&request.method==='POST'){
    const next=url.pathname.split('/').at(-1);
    if(!['current','old'].includes(next)){response.writeHead(400).end('invalid mode');return}
    releaseMode=next;response.writeHead(204,{'cache-control':'no-store'}).end();return;
  }
  let relativePath=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
  if(relativePath.endsWith('/'))relativePath+='index.html';
  const resolved=path.resolve(root,relativePath);
  if(!resolved.startsWith(`${root}${path.sep}`)||!fs.existsSync(resolved)||!fs.statSync(resolved).isFile()){
    response.writeHead(404,{'content-type':'text/plain; charset=utf-8'}).end('Not found');return;
  }
  try{
    const body=bodyFor(relativePath),type=types[path.extname(relativePath).toLowerCase()]||'application/octet-stream';
    response.writeHead(200,{'content-type':type,'cache-control':'no-store','service-worker-allowed':'/'});
    if(request.method==='HEAD')response.end();else response.end(body);
  }catch(error){response.writeHead(500,{'content-type':'text/plain; charset=utf-8'}).end(String(error));}
});

server.listen(port,'127.0.0.1',()=>console.log(`Mountain Guide test server listening on http://127.0.0.1:${port}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));
