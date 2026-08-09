/* Public Companion distribution contract. Keep every public endpoint derived here. */
(()=>{
'use strict';
const ORIGIN='https://companion.vondadowns.com';
const paths=Object.freeze({
  COMPANION_HOME:'/',
  FIELD_GUIDE:'/generated/field-guide.pdf',
  POCKET_CARD:'/generated/pocket-card.pdf',
  RELEASE_METADATA:'/release.json'
});
const contract=Object.freeze(Object.fromEntries(Object.entries(paths).map(([key,pathname])=>[key,new URL(pathname,ORIGIN).href])));
for(const [key,value] of Object.entries(contract)){
  const url=new URL(value);
  if(url.origin!==ORIGIN||url.search||url.hash)throw new Error(`Invalid Companion public URL: ${key}`);
}
if(contract.COMPANION_HOME!==`${ORIGIN}/`)throw new Error('Companion home must be the origin root with a trailing slash.');
globalThis.DDMG_COMPANION=contract;
})();
