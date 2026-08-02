const PEAKS=[{"name": "Grays Peak", "range": "Front", "status": "Completed"}, {"name": "Torreys Peak", "range": "Front", "status": "Completed"}, {"name": "Mount Blue Sky", "range": "Front", "status": "Completed"}, {"name": "Longs Peak", "range": "Front", "status": "Completed"}, {"name": "Pikes Peak", "range": "Front", "status": "Completed"}, {"name": "Mount Bierstadt", "range": "Front", "status": "Completed"}, {"name": "Quandary Peak", "range": "Tenmile", "status": "Completed"}, {"name": "Mount Lincoln", "range": "Mosquito", "status": "Completed"}, {"name": "Mount Cameron", "range": "Mosquito", "status": "Completed"}, {"name": "Mount Bross", "range": "Mosquito", "status": "Completed"}, {"name": "Mount Democrat", "range": "Mosquito", "status": "Completed"}, {"name": "Mount Sherman", "range": "Mosquito", "status": "Completed"}, {"name": "Mount Elbert", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Massive", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Harvard", "range": "Sawatch", "status": "Completed"}, {"name": "La Plata Peak", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Antero", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Shavano", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Belford", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Princeton", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Yale", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Oxford", "range": "Sawatch", "status": "Completed"}, {"name": "Tabeguache Peak", "range": "Sawatch", "status": "Completed"}, {"name": "Mount Columbia", "range": "Sawatch", "status": "Completed"}, {"name": "Missouri Mountain", "range": "Sawatch", "status": "Completed"}, {"name": "Mount of the Holy Cross", "range": "Sawatch", "status": "Completed"}, {"name": "Huron Peak", "range": "Sawatch", "status": "Completed"}, {"name": "El Diente Peak", "range": "San Juan", "status": "Completed"}, {"name": "Windom Peak", "range": "San Juan", "status": "Completed"}, {"name": "Sunlight Peak", "range": "San Juan", "status": "Completed"}, {"name": "Handies Peak", "range": "San Juan", "status": "Completed"}, {"name": "North Eolus", "range": "San Juan", "status": "Completed"}, {"name": "Wilson Peak", "range": "San Juan", "status": "Completed"}, {"name": "Kit Carson Peak", "range": "Sangre de Cristo", "status": "Completed"}, {"name": "Challenger Point", "range": "Sangre de Cristo", "status": "Completed"}, {"name": "San Luis Peak", "range": "San Juan", "status": "Goal"}, {"name": "Uncompahgre Peak", "range": "San Juan", "status": "Goal"}, {"name": "Redcloud Peak", "range": "San Juan", "status": "Goal"}, {"name": "Sunshine Peak", "range": "San Juan", "status": "Goal"}, {"name": "Mount Sneffels", "range": "San Juan", "status": "Goal"}, {"name": "Wetterhorn Peak", "range": "San Juan", "status": "Goal"}, {"name": "Mount Wilson", "range": "San Juan", "status": "Goal"}, {"name": "Mount Eolus", "range": "San Juan", "status": "Goal"}, {"name": "Castle Peak", "range": "Elk", "status": "Goal"}, {"name": "Conundrum Peak", "range": "Elk", "status": "Goal"}, {"name": "Humboldt Peak", "range": "Sangre de Cristo", "status": "Goal"}, {"name": "Culebra Peak", "range": "Sangre de Cristo", "status": "Goal"}, {"name": "Blanca Peak", "range": "Sangre de Cristo", "status": "Goal"}, {"name": "Ellingwood Point", "range": "Sangre de Cristo", "status": "Goal"}, {"name": "Mount Lindsey", "range": "Sangre de Cristo", "status": "Goal"}];

const TRIP_START = new Date('2026-08-19T12:00:00-06:00');
const TRIP_END = new Date('2026-08-25T23:59:00-06:00');
const CHECK_KEY='ddmg-v3-checks', JOURNAL_KEY='ddmg-v3-journal';
const WEATHER_KEY='ddmg-v4-weather', REVIEW_KEY='ddmg-v4-reviews', INTEL_CHECK_KEY='ddmg-v4-intel-checks';
const WEATHER_SELECTED_KEY='ddmg-v5-weather-location', WEATHER_MODE_KEY='ddmg-v5-weather-mode';
const INSTALL_DISMISSED_KEY='ddmg-v5-install-dismissed';
const AUTO_WEATHER_MS=30*60*1000;

const WEATHER_LOCATIONS=[
 {id:'lake',name:'Lake Como area',lat:37.56960,lon:-105.51406,elevationFt:11750,targetDate:'2026-08-22',startHour:8,endHour:17,tripLabel:'Saturday approach'},
 {id:'blanca',name:'Blanca Peak',lat:37.57753,lon:-105.48569,elevationFt:14350,targetDate:'2026-08-23',startHour:3,endHour:13,tripLabel:'Sunday summit'},
 {id:'ellingwood',name:'Ellingwood Point',lat:37.58257,lon:-105.49248,elevationFt:14057,targetDate:'2026-08-23',startHour:3,endHour:13,tripLabel:'Sunday summit'},
 {id:'lindsey',name:'Mount Lindsey',lat:37.58389,lon:-105.44490,elevationFt:14055,targetDate:'2026-08-24',startHour:3,endHour:13,tripLabel:'Monday summit'},
 {id:'dunes',name:'Great Sand Dunes',lat:37.73290,lon:-105.51280,elevationFt:8200,targetDate:'2026-08-20',startHour:8,endHour:16,tripLabel:'Thursday visit'}
];
const TRIP_WEATHER_IDS=['lake','blanca','ellingwood','lindsey'];
const REVIEW_CONFIG={
 blanca:{label:'Blanca peak conditions',maxHours:12},
 ellingwood:{label:'Ellingwood peak conditions',maxHours:12},
 lindsey:{label:'Lindsey peak conditions',maxHours:12},
 lakeComo:{label:'Lake Como trailhead',maxHours:24},
 huerfano:{label:'Huerfano / Lily Lake trailhead',maxHours:24}
};

let weatherStore=safeParse(storageGet(WEATHER_KEY),{});
let reviewStore=safeParse(storageGet(REVIEW_KEY),{});
let intelCheckStore=safeParse(storageGet(INTEL_CHECK_KEY),{});
let selectedWeatherId=storageGet(WEATHER_SELECTED_KEY)||'blanca';
let weatherMode=storageGet(WEATHER_MODE_KEY)||'now';
let newWorker=null;
const weatherInflight=new Map();

function safeParse(value,fallback){try{return value?JSON.parse(value):fallback}catch{return fallback}}
function storageGet(key){try{return localStorage.getItem(key)}catch(error){console.warn('Storage read failed',key,error);return null}}
function storageSet(key,value){try{localStorage.setItem(key,value);return true}catch(error){console.warn('Storage write failed',key,error);return false}}
function storageRemove(key){try{localStorage.removeItem(key);return true}catch(error){console.warn('Storage removal failed',key,error);return false}}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function locationById(id){return WEATHER_LOCATIONS.find(x=>x.id===id)||WEATHER_LOCATIONS[1]}
function ageHours(iso){return iso?(Date.now()-new Date(iso).getTime())/3600000:Infinity}
function daysTo(dateStr){const target=new Date(dateStr+'T00:00:00-06:00');return (target-Date.now())/86400000}
function parseWind(text=''){const nums=(String(text).match(/\d+/g)||[]).map(Number);return nums.length?Math.max(...nums):0}
function feet(meters){return Number.isFinite(meters)?Math.round(meters*3.28084):null}
function formatStamp(iso,includeDate=true){
 if(!iso)return 'Never';
 return new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',...(includeDate?{month:'short',day:'numeric'}:{}),hour:'numeric',minute:'2-digit'}).format(new Date(iso))
}
function denverParts(iso){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Denver',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(iso));
 const o=Object.fromEntries(parts.map(p=>[p.type,p.value]));
 return {date:`${o.year}-${o.month}-${o.day}`,hour:Number(o.hour),minute:Number(o.minute)}
}
function hourLabel(iso){
 const d=new Date(iso);
 return new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',hour:'numeric'}).format(d).replace(' ','').toLowerCase()
}
function toast(message){
 const el=document.getElementById('toast'); if(!el)return;
 el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)
}

function countdown(){
 const now=new Date(),el=document.getElementById('countdown'),ms=TRIP_START-now;
 if(ms>0){const d=Math.floor(ms/86400000),h=Math.floor(ms%86400000/3600000),m=Math.floor(ms%3600000/60000);el.textContent=`${d}d ${h}h ${m}m`}
 else if(now<=TRIP_END)el.textContent='Expedition underway';
 else el.textContent='Expedition complete';
}
setInterval(countdown,30000);countdown();

const boxes=[...document.querySelectorAll('input[type=checkbox][data-save]')];
const saved=safeParse(storageGet(CHECK_KEY),{});
boxes.forEach((b,i)=>{const k=b.dataset.save||i;b.checked=!!saved[k];b.addEventListener('change',()=>{saved[k]=b.checked;storageSet(CHECK_KEY,JSON.stringify(saved));readiness();renderNextAction()})});
function readiness(){
 const pct=boxes.length?Math.round(boxes.filter(b=>b.checked).length/boxes.length*100):0;
 document.getElementById('readyPct').textContent=pct+'%';document.getElementById('readyBar').style.width=pct+'%';
 return pct
}
readiness();
function resetChecks(){if(confirm('Clear all saved packing and communication checkmarks?')){boxes.forEach(b=>b.checked=false);storageRemove(CHECK_KEY);readiness();renderNextAction()}}

function renderPeaks(filter=''){
 const q=filter.toLowerCase(),wrap=document.getElementById('peakList');
 wrap.innerHTML=PEAKS.filter(p=>(p.name+' '+p.range+' '+p.status).toLowerCase().includes(q)).map(p=>`<div class="peak ${p.status==='Completed'?'done':'goal'}"><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.range)} · ${escapeHtml(p.status)}</small></div>`).join('')
}
renderPeaks();document.getElementById('peakSearch').addEventListener('input',e=>renderPeaks(e.target.value));

const journal=document.getElementById('journalText');
journal.value=storageGet(JOURNAL_KEY)||'';
journal.addEventListener('input',()=>storageSet(JOURNAL_KEY,journal.value));
function exportData(){
 const data={exported:new Date().toISOString(),checks:safeParse(storageGet(CHECK_KEY),{}),intelligenceChecks:safeParse(storageGet(INTEL_CHECK_KEY),{}),reportReviews:safeParse(storageGet(REVIEW_KEY),{}),savedWeather:safeParse(storageGet(WEATHER_KEY),{}),selectedWeather:selectedWeatherId,weatherMode,journal:storageGet(JOURNAL_KEY)||''};
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download='mountain-guide-backup.json';a.click();URL.revokeObjectURL(a.href)
}
function clearJournal(){if(confirm('Clear the saved journal on this device?')){journal.value='';storageRemove(JOURNAL_KEY)}}

function openToday(){
 const today=denverParts(new Date().toISOString()).date;
 const ids={'2026-08-19':'wed','2026-08-20':'thu','2026-08-21':'fri','2026-08-22':'sat','2026-08-23':'sun','2026-08-24':'mon','2026-08-25':'tue'};
 document.querySelectorAll('details.day').forEach(x=>x.open=false);
 const targetId=ids[today]||'wed',el=document.getElementById(targetId);
 if(el){el.open=true;el.scrollIntoView({behavior:'smooth',block:'start'})}
 if(!ids[today])toast('Outside the Aug 19–25 trip window — showing Day 1')
}

function onlineStatus(){
 const text=navigator.onLine?'Online · offline cache active':'Offline · cached guide active';
 const net=document.getElementById('net');if(net)net.textContent=text
}
addEventListener('online',()=>{onlineStatus();maybeAutoRefreshSelected(true)});addEventListener('offline',onlineStatus);onlineStatus();

function normalizePeriod(p){
 return {startTime:p.startTime,endTime:p.endTime,temp:Number(p.temperature),unit:p.temperatureUnit||'F',condition:p.shortForecast||'Forecast unavailable',windText:p.windSpeed||'',windMph:parseWind(p.windSpeed),windDirection:p.windDirection||'',pop:Number.isFinite(p.probabilityOfPrecipitation?.value)?p.probabilityOfPrecipitation.value:null,isDaytime:!!p.isDaytime}
}
function buildTripSummary(spec,periods,alerts,sourceUpdatedAt){
 const target=periods.filter(p=>{const x=denverParts(p.startTime);return x.date===spec.targetDate&&x.hour>=spec.startHour&&x.hour<=spec.endHour});
 const availableDates=[...new Set(periods.map(p=>denverParts(p.startTime).date))].sort();
 const alertNames=alerts.map(a=>a.event).filter(Boolean);
 if(!target.length)return {available:false,horizonEnd:availableDates.at(-1)||null,alerts:alertNames,sourceUpdatedAt};
 const temps=target.map(p=>p.temp).filter(Number.isFinite),pops=target.map(p=>p.pop).filter(Number.isFinite),winds=target.map(p=>p.windMph).filter(Number.isFinite);
 if(!temps.length)return {available:false,horizonEnd:availableDates.at(-1)||null,alerts:alertNames,sourceUpdatedAt,reason:'temperature-data-unavailable'};
 const conditions=[...new Set(target.map(p=>p.condition).filter(Boolean))].slice(0,3);
 const step=Math.max(1,Math.floor(target.length/4));
 return {available:true,minTemp:Math.min(...temps),maxTemp:Math.max(...temps),maxPop:pops.length?Math.max(...pops):null,maxWind:winds.length?Math.max(...winds):0,conditions,samples:target.filter((_,i)=>i%step===0).slice(0,4),alerts:alertNames,sourceUpdatedAt}
}
async function fetchJson(url){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
 let response;
 try{response=await fetch(url,{headers:{Accept:'application/geo+json'},signal:controller.signal,cache:'no-store'})}
 catch(error){if(error?.name==='AbortError')throw new Error('Weather request timed out after 15 seconds');throw error}
 finally{clearTimeout(timer)}
 if(!response.ok)throw new Error(`Weather service returned HTTP ${response.status}`);
 return response.json()
}
async function fetchWeatherPoint(spec){
 if(weatherInflight.has(spec.id))return weatherInflight.get(spec.id);
 const work=(async()=>{
  const point=await fetchJson(`https://api.weather.gov/points/${spec.lat},${spec.lon}`);
  const hourlyUrl=point.properties?.forecastHourly;if(!hourlyUrl)throw new Error('No hourly forecast endpoint was returned');
  const [hourly,alertsRaw]=await Promise.all([fetchJson(hourlyUrl),fetchJson(`https://api.weather.gov/alerts/active?point=${spec.lat},${spec.lon}`).catch(()=>({features:[]}))]);
  const periods=(hourly?.properties?.periods||[]).map(normalizePeriod);
  const now=Date.now(),currentIndex=Math.max(0,periods.findIndex(p=>new Date(p.endTime).getTime()>now));
  const current=periods[currentIndex]||periods[0]||null,upcoming=periods.slice(currentIndex,currentIndex+8);
  const alerts=(alertsRaw.features||[]).map(x=>({event:x.properties?.event||'Weather alert',severity:x.properties?.severity||'',headline:x.properties?.headline||'',ends:x.properties?.ends||null}));
  const gridElevationFt=feet(hourly?.properties?.elevation?.value);
  const sourceUpdatedAt=hourly?.properties?.updateTime||hourly?.properties?.generatedAt||null;
  return {fetchedAt:new Date().toISOString(),sourceUpdatedAt,gridElevationFt,current,upcoming,alerts,trip:buildTripSummary(spec,periods,alerts,sourceUpdatedAt)}
 })();
 weatherInflight.set(spec.id,work);
 try{return await work}finally{weatherInflight.delete(spec.id)}
}
async function refreshLocation(id,{force=false,quiet=false}={}){
 const spec=locationById(id),stored=weatherStore[id];
 if(!force&&stored?.fetchedAt&&ageHours(stored.fetchedAt)<.5)return stored;
 if(!navigator.onLine){if(!quiet)toast('Offline — showing the last saved forecast');return stored}
 const refreshBtn=document.getElementById('heroWeatherRefresh');if(id===selectedWeatherId)refreshBtn?.classList.add('loading');
 try{
  const result=await fetchWeatherPoint(spec);weatherStore[id]=result;storageSet(WEATHER_KEY,JSON.stringify(weatherStore));
  renderHeroWeather();if(TRIP_WEATHER_IDS.includes(id))renderWeatherCard(spec);renderWeatherFreshness();updateIntelOverall();if(document.getElementById('focusOverlay'))renderFocus();return result
 }catch(e){
  weatherStore[id]={...(stored||{}),lastError:String(e),failedAt:new Date().toISOString()};storageSet(WEATHER_KEY,JSON.stringify(weatherStore));
  renderHeroWeather();if(!quiet)toast('Forecast refresh failed; saved data retained');throw e
 }finally{if(id===selectedWeatherId)refreshBtn?.classList.remove('loading')}
}
function forecastKind(condition='',isDaytime=true){
 const s=condition.toLowerCase();
 if(/thunder|storm/.test(s))return 'storm';if(/snow|sleet|ice|blizzard/.test(s))return 'snow';if(/rain|shower|drizzle/.test(s))return 'rain';if(/cloud|overcast|fog/.test(s))return 'cloud';return isDaytime?'sun':'moon'
}
function weatherIcon(kind){
 const common='viewBox="0 0 64 64" aria-hidden="true"';
 if(kind==='storm')return `<svg ${common}><path d="M17 39h30a11 11 0 0 0 1-22 17 17 0 0 0-32-1A12 12 0 0 0 17 39Z"/><path d="m31 38-6 11h8l-4 10 12-15h-8l5-6"/></svg>`;
 if(kind==='snow')return `<svg ${common}><path d="M17 37h30a11 11 0 0 0 1-22 17 17 0 0 0-32-1A12 12 0 0 0 17 37Z"/><path d="M22 46v12m-5-9 10 6m0-6-10 6M42 46v12m-5-9 10 6m0-6-10 6"/></svg>`;
 if(kind==='rain')return `<svg ${common}><path d="M17 37h30a11 11 0 0 0 1-22 17 17 0 0 0-32-1A12 12 0 0 0 17 37Z"/><path d="m22 45-4 9m16-9-4 9m16-9-4 9"/></svg>`;
 if(kind==='cloud')return `<svg ${common}><path d="M13 43h38a12 12 0 0 0 1-24 18 18 0 0 0-34-2A13 13 0 0 0 13 43Z"/><path d="M18 50h30"/></svg>`;
 if(kind==='moon')return `<svg ${common}><path d="M43 45A21 21 0 0 1 28 9a22 22 0 1 0 15 36Z"/><path d="m47 12 2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Z"/></svg>`;
 return `<svg ${common}><circle cx="32" cy="31" r="12"/><path d="M32 5v9m0 34v10M6 31h10m32 0h10M13 12l7 7m24 24 7 7m0-38-7 7M20 43l-7 7"/></svg>`
}
function planningFlags(item){
 const periods=(item?.upcoming||[]).slice(0,6),flags=[];
 const winds=periods.map(p=>p.windMph).filter(Number.isFinite),pops=periods.map(p=>p.pop).filter(Number.isFinite),temps=periods.map(p=>p.temp).filter(Number.isFinite);
 const maxWind=winds.length?Math.max(...winds):0,maxPop=pops.length?Math.max(...pops):null,minTemp=temps.length?Math.min(...temps):null;
 const text=periods.map(p=>p.condition).join(' ').toLowerCase();
 if(item?.alerts?.length)flags.push({label:`${item.alerts.length} active alert${item.alerts.length>1?'s':''}`,type:'alert'});
 if(/thunder|storm|lightning/.test(text))flags.push({label:'Thunderstorm wording',type:'alert'});
 if(maxWind>=25)flags.push({label:`Wind to ${maxWind} mph`,type:'warn'});
 if(Number.isFinite(maxPop)&&maxPop>=30)flags.push({label:`Precipitation to ${maxPop}%`,type:'warn'});
 if(Number.isFinite(minTemp)&&minTemp<=35)flags.push({label:`Near freezing: ${minTemp}°F`,type:'warn'});
 if(item?.fetchedAt&&ageHours(item.fetchedAt)>2)flags.push({label:'Forecast older than 2h',type:'warn'});
 if(!flags.length)flags.push({label:'No listed planning flags in next 6h',type:''});
 return flags
}
function renderHeroWeather(){
 const spec=locationById(selectedWeatherId),item=weatherStore[spec.id],body=document.getElementById('heroWeatherBody'),age=document.getElementById('heroWeatherAge'),link=document.getElementById('heroWeatherLink'),select=document.getElementById('heroWeatherLocation');
 if(select&&select.value!==spec.id)select.value=spec.id;
 link.href=`https://forecast.weather.gov/MapClick.php?lat=${spec.lat}&lon=${spec.lon}`;
 document.querySelectorAll('[data-weather-mode]').forEach(b=>{const on=b.dataset.weatherMode===weatherMode;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
 if(!item?.fetchedAt){
  body.innerHTML=`<div class="weather-loading"><span class="weather-pulse"></span><div><b>Forecast not loaded</b><small>${navigator.onLine?'Refreshing automatically…':'Connect once to save an offline forecast.'}</small></div></div>`;
  age.textContent='Not loaded on this device';return
 }
 const sourceStamp=item.sourceUpdatedAt?` · NWS issued ${formatStamp(item.sourceUpdatedAt,false)}`:'';
 age.textContent=`Fetched ${formatStamp(item.fetchedAt,false)}${sourceStamp}${navigator.onLine?'':' · saved offline'}`;
 if(weatherMode==='trip'){
  const t=item.trip;
  if(!t?.available){
   const d=daysTo(spec.targetDate),h=t?.horizonEnd;
   body.innerHTML=`<div class="trip-window-message"><div class="widget-label">${escapeHtml(spec.tripLabel)}</div><strong>${d>7?'Trip forecast not open yet':'Target hours not available yet'}</strong><p>${d>7?`The NWS hourly horizon currently ends ${escapeHtml(h||'before the trip')}. Current weather remains available under “Now + 6 hours.”`:'Refresh again later; the target window has not populated.'}</p></div>`;
   return
  }
  body.innerHTML=`<div class="trip-window-message"><div class="widget-label">${escapeHtml(spec.tripLabel)}</div><strong>${t.minTemp}–${t.maxTemp}°F · ${escapeHtml(t.conditions.join(' · '))}</strong><div class="trip-window-metrics"><div><b>${t.maxWind} mph</b><small>highest listed wind</small></div><div><b>${Number.isFinite(t.maxPop)?t.maxPop:'—'}%</b><small>highest precipitation</small></div><div><b>${t.alerts.length}</b><small>active point alerts</small></div></div><div class="hero-hours">${t.samples.map(p=>`<div class="hero-hour"><b>${hourLabel(p.startTime)}</b><span>${p.temp}°</span><small>${p.windMph||0} mph</small></div>`).join('')}</div></div>`;
  return
 }
 const c=item.current;
 if(!c){
  body.innerHTML=`<div class="trip-window-message"><strong>Saved forecast unavailable</strong><p>Refresh when online. ${escapeHtml(item.lastError||'')}</p></div>`;return
 }
 const grid=item.gridElevationFt?`${item.gridElevationFt.toLocaleString()} ft grid`:'NWS forecast grid';
 const flags=planningFlags(item);
 body.innerHTML=`<div class="hero-weather-main"><div class="weather-art">${weatherIcon(forecastKind(c.condition,c.isDaytime))}</div><div><div class="hero-temp">${c.temp}°</div><div class="hero-condition">${escapeHtml(c.condition)}</div></div></div>
 <div class="weather-stats"><div class="weather-mini"><b>${escapeHtml(c.windDirection)} ${c.windMph||0} mph</b><small>listed wind</small></div><div class="weather-mini"><b>${Number.isFinite(c.pop)?c.pop:'—'}%</b><small>precipitation</small></div><div class="weather-mini"><b>${grid}</b><small>${spec.elevationFt.toLocaleString()} ft location</small></div></div>
 <div class="weather-flags">${flags.map(f=>`<span class="weather-flag ${f.type}">${escapeHtml(f.label)}</span>`).join('')}</div>
 <div class="hero-hours">${(item.upcoming||[]).slice(0,6).map(p=>`<div class="hero-hour"><b>${hourLabel(p.startTime)}</b><span>${p.temp}°</span><small>${Number.isFinite(p.pop)?p.pop:'—'}% · ${p.windMph||0}</small></div>`).join('')}</div>`
}
async function maybeAutoRefreshSelected(immediate=false){
 const item=weatherStore[selectedWeatherId];
 if(!navigator.onLine){renderHeroWeather();return}
 if(immediate||!item?.fetchedAt||ageHours(item.fetchedAt)>=.5){
  try{await refreshLocation(selectedWeatherId,{force:true,quiet:true})}catch{}
 }else renderHeroWeather()
}

function renderWeatherCard(spec){
 const el=document.getElementById(`wx-${spec.id}`);if(!el)return;
 const item=weatherStore[spec.id],badge=el.querySelector('.freshness'),msg=el.querySelector('.weather-message'),strip=el.querySelector('.hour-strip');
 if(!item?.fetchedAt){badge.className='freshness neutral';badge.textContent='Not loaded';msg.textContent='Tap Refresh Trip Intelligence.';strip.innerHTML='';return}
 const age=ageHours(item.fetchedAt),state=age<=6?'current':age<=12?'warning':'danger';badge.className=`freshness ${state}`;badge.textContent=age<=1?'Fresh':`${Math.round(age)}h old`;
 const s=item.trip;
 if(!s){msg.textContent=`Refresh failed. ${item.lastError||''}`;strip.innerHTML='';return}
 if(!s.available){
  const d=daysTo(spec.targetDate);msg.innerHTML=d>7?`Trip date is outside the NWS seven-day hourly horizon. Current horizon ends <b>${escapeHtml(s.horizonEnd||'unknown')}</b>.`:`No hourly periods are available for the target window yet.`;
  strip.innerHTML=item.alerts?.length?`<div class="alert-line alert">Active alert: ${escapeHtml(item.alerts.map(a=>a.event).join(', '))}</div>`:`<div class="alert-line">No active point alerts returned.</div>`;return
 }
 msg.innerHTML=`<div class="wx-summary"><div class="wx-stat"><b>${s.minTemp}–${s.maxTemp}°F</b><small>temperature</small></div><div class="wx-stat"><b>${s.maxWind} mph</b><small>peak listed wind</small></div><div class="wx-stat"><b>${Number.isFinite(s.maxPop)?s.maxPop:'—'}%</b><small>max precip.</small></div></div><div>${escapeHtml(s.conditions.join(' · '))}</div><div class="alert-line ${s.alerts.length?'alert':''}">${s.alerts.length?`Active alert: ${escapeHtml(s.alerts.join(', '))}`:'No active point alerts returned.'}</div>`;
 strip.innerHTML=s.samples.map(x=>`<div class="hour"><b>${hourLabel(x.startTime)}</b><span>${x.temp}°</span><small>${escapeHtml(x.windText||'')}</small><small>${x.pop??0}%</small></div>`).join('')
}
function renderWeatherFreshness(){
 const loaded=TRIP_WEATHER_IDS.map(id=>weatherStore[id]).filter(x=>x?.fetchedAt);
 if(!loaded.length){document.getElementById('weatherFreshness').textContent='Not loaded';document.getElementById('weatherFreshnessNote').textContent='NWS data will be saved for offline use.';return}
 const newest=loaded.sort((a,b)=>new Date(b.fetchedAt)-new Date(a.fetchedAt))[0],age=ageHours(newest.fetchedAt);
 document.getElementById('weatherFreshness').textContent=age<=1?'Current':`${Math.round(age)}h old`;document.getElementById('weatherFreshnessNote').textContent=`Last successful data: ${formatStamp(newest.fetchedAt)}`
}
function renderAllWeather(){TRIP_WEATHER_IDS.forEach(id=>renderWeatherCard(locationById(id)));renderWeatherFreshness();renderHeroWeather()}

async function refreshTripIntelligence(){
 if(!navigator.onLine){document.getElementById('refreshProgress').textContent='Offline: showing saved forecasts.';renderAllWeather();toast('Offline — saved trip intelligence remains available');return}
 const btn=document.getElementById('refreshIntelBtn');btn.disabled=true;btn.textContent='Refreshing…';let ok=0,fail=0;
 for(let i=0;i<TRIP_WEATHER_IDS.length;i++){
  const spec=locationById(TRIP_WEATHER_IDS[i]);document.getElementById('refreshProgress').textContent=`Refreshing ${i+1} of ${TRIP_WEATHER_IDS.length}: ${spec.name}`;
  try{await refreshLocation(spec.id,{force:true,quiet:true});ok++}catch{fail++}
 }
 btn.disabled=false;btn.textContent='Refresh Trip Intelligence';document.getElementById('refreshProgress').textContent=`Last attempt ${formatStamp(new Date().toISOString())}: ${ok} updated${fail?`, ${fail} failed`:''}.`;
 renderAllWeather();updateIntelOverall();toast(fail?'Refresh completed with one or more errors':'Trip intelligence refreshed')
}

const intelBoxes=[...document.querySelectorAll('input[type=checkbox][data-intel-check]')];
intelBoxes.forEach(b=>{const k=b.dataset.intelCheck;b.checked=!!intelCheckStore[k];b.addEventListener('change',()=>{intelCheckStore[k]=b.checked;storageSet(INTEL_CHECK_KEY,JSON.stringify(intelCheckStore));updateIntelCheckProgress();updateIntelOverall();renderNextAction()})});
function markReviewed(id){reviewStore[id]=new Date().toISOString();storageSet(REVIEW_KEY,JSON.stringify(reviewStore));renderReviews();updateIntelOverall();renderNextAction();toast('Review timestamp saved')}
function clearReviews(){if(confirm('Clear all 14ers.com review timestamps?')){reviewStore={};storageRemove(REVIEW_KEY);renderReviews();updateIntelOverall();renderNextAction()}}
function renderReviews(){
 let current=0;
 Object.entries(REVIEW_CONFIG).forEach(([id,cfg])=>{
  const t=reviewStore[id],age=ageHours(t),state=!t?'danger':age<=cfg.maxHours?'current':age<=cfg.maxHours*2?'warning':'danger';
  const card=document.querySelector(`[data-review-card="${id}"]`),status=document.getElementById(`review-${id}-status`);if(!card||!status)return;
  card.dataset.state=state;if(!t)status.textContent='Not reviewed on this device.';else if(state==='current'){status.textContent=`Reviewed ${formatStamp(t)} · current for ${cfg.maxHours}h`;current++}else status.textContent=`Reviewed ${formatStamp(t)} · now stale; reopen the current page.`
 });
 document.getElementById('reviewCount').textContent=`${current} / 5`;document.getElementById('reviewBar').style.width=`${current/5*100}%`
}
function updateIntelCheckProgress(){const pct=intelBoxes.length?Math.round(intelBoxes.filter(b=>b.checked).length/intelBoxes.length*100):0;document.getElementById('intelCheckPct').textContent=pct+'%';document.getElementById('intelCheckBar').style.width=pct+'%';return pct}
function resetIntelWorkflow(){if(confirm('Clear night-before and morning-of intelligence checks? Report timestamps and gear checks will remain.')){intelBoxes.forEach(b=>b.checked=false);intelCheckStore={};storageRemove(INTEL_CHECK_KEY);updateIntelCheckProgress();updateIntelOverall();renderNextAction()}}
function currentReviewCount(){return Object.entries(REVIEW_CONFIG).filter(([id,c])=>reviewStore[id]&&ageHours(reviewStore[id])<=c.maxHours).length}
function updateIntelOverall(){
 const banner=document.getElementById('intelBanner'),headline=document.getElementById('intelHeadline'),summary=document.getElementById('intelSummary');
 const tripDays=daysTo('2026-08-22'),freshWeather=TRIP_WEATHER_IDS.map(id=>weatherStore[id]).filter(x=>x?.fetchedAt&&ageHours(x.fetchedAt)<=6).length,currentReviews=currentReviewCount(),checks=intelBoxes.filter(b=>b.checked).length;
 if(tripDays>7){banner.dataset.state='neutral';headline.textContent='Planning phase';summary.textContent='The trip is outside the NWS hourly forecast horizon. Route links and review workflow are ready.'}
 else if(freshWeather===4&&currentReviews===5&&checks>=7){banner.dataset.state='current';headline.textContent='Trip intelligence current';summary.textContent='Weather is fresh, all condition pages were recently reviewed and the review workflow is substantially complete.'}
 else if(freshWeather>=2||currentReviews>=3){banner.dataset.state='warning';headline.textContent='Review incomplete';summary.textContent=`Fresh weather: ${freshWeather}/4 · current 14ers.com reviews: ${currentReviews}/5 · workflow tasks: ${checks}/${intelBoxes.length}.`}
 else{banner.dataset.state='danger';headline.textContent='Current information required';summary.textContent='Refresh NWS weather and review the authoritative peak and trailhead pages before relying on the trip plan.'}
}

function renderNextAction(){
 const days=daysTo('2026-08-22'),pct=readiness(),reviews=currentReviewCount(),btn=document.getElementById('nextActionPrimary'),title=document.getElementById('nextActionTitle'),text=document.getElementById('nextActionText');
 let action='gear';
 if(new Date()>TRIP_END){title.textContent='Preserve the expedition record';text.textContent='Finish the field journal, export the app backup and add summit outcomes to the 14er record.';btn.textContent='Open field journal';action='journal'}
 else if(days>7){title.textContent=pct<80?'Build expedition readiness':'Keep the plan clean';text.textContent=pct<80?`Packing and communication readiness is ${pct}%. Complete the highest-value missing checks without adding unnecessary gear.`:'Core readiness is strong. Keep personal details offline and wait for the live forecast horizon.';btn.textContent=pct<80?'Open gear checklist':'Review route center';action=pct<80?'gear':'routes'}
 else if(days>1){title.textContent='Refresh and review current intelligence';text.textContent=`Current condition reviews: ${reviews}/5. Refresh forecast data and deliberately read each 14ers.com report.`;btn.textContent='Open Trip Intelligence';action='intelligence'}
 else{title.textContent='Open today’s field plan';text.textContent='Refresh the selected summit forecast, verify the agreed turnaround and use the day timeline rather than the full planning view.';btn.textContent='Open today';action='today'}
 btn.dataset.action=action
}
function runNextAction(){
 const action=document.getElementById('nextActionPrimary').dataset.action;
 if(action==='today')return openToday();
 const map={gear:'#gear',routes:'#routes',intelligence:'#intelligence',journal:'#journal'};
 document.querySelector(map[action]||'#expedition')?.scrollIntoView({behavior:'smooth',block:'start'})
}
function statusText(){
 const loaded=TRIP_WEATHER_IDS.map(id=>weatherStore[id]).filter(x=>x?.fetchedAt).sort((a,b)=>new Date(b.fetchedAt)-new Date(a.fetchedAt));
 const latest=loaded[0]?.fetchedAt,weather=latest?`Weather last refreshed ${formatStamp(latest)}`:'Weather not yet refreshed';
 return `Lake Como expedition status — ${weather}; ${currentReviewCount()}/5 current 14ers.com condition/trailhead reviews; gear and communication readiness ${readiness()}%. Planning aid only—not a safety clearance.`
}
async function shareStatus(){
 const text=statusText();
 try{
  if(navigator.share){await navigator.share({title:'Lake Como expedition status',text,url:location.href});return}
  if(navigator.clipboard){await navigator.clipboard.writeText(`${text}\n${location.href}`);toast('Status copied to clipboard');return}
  window.prompt('Copy this status:',`${text}\n${location.href}`)
 }catch(e){if(e?.name!=='AbortError')toast('Status sharing was not completed')}
}

function setupWeatherWidget(){
 const select=document.getElementById('heroWeatherLocation');select.value=selectedWeatherId;
 select.addEventListener('change',()=>{selectedWeatherId=select.value;storageSet(WEATHER_SELECTED_KEY,selectedWeatherId);renderHeroWeather();maybeAutoRefreshSelected(true)});
 document.querySelectorAll('[data-weather-mode]').forEach(btn=>btn.addEventListener('click',()=>{weatherMode=btn.dataset.weatherMode;storageSet(WEATHER_MODE_KEY,weatherMode);renderHeroWeather()}));
 document.getElementById('heroWeatherRefresh').addEventListener('click',async()=>{
 if(!navigator.onLine){renderHeroWeather();toast('Offline — showing the last saved forecast');return}
 try{await refreshLocation(selectedWeatherId,{force:true});toast('Selected forecast refreshed')}catch{}
});
 renderHeroWeather();setTimeout(()=>maybeAutoRefreshSelected(false),700);
 setInterval(()=>maybeAutoRefreshSelected(false),AUTO_WEATHER_MS);
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')maybeAutoRefreshSelected(false)})
}
function setupInstallNudge(){
 const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent),standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true,nudge=document.getElementById('installNudge');
 if(isIOS&&!standalone&&storageGet(INSTALL_DISMISSED_KEY)!=='1')nudge.hidden=false;
 document.getElementById('dismissInstall').addEventListener('click',()=>{nudge.hidden=true;storageSet(INSTALL_DISMISSED_KEY,'1')})
}
function setupBottomNav(){
 const links=[...document.querySelectorAll('.bottom-nav a')],targets=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
 if(!('IntersectionObserver'in window))return;
 const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;links.forEach(a=>{const on=a.getAttribute('href')==='#'+visible.target.id;a.classList.toggle('active',on);if(on)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')})},{rootMargin:'-25% 0px -60% 0px',threshold:[0,.15,.4]});
 targets.forEach(t=>observer.observe(t))
}

if('serviceWorker'in navigator){
 navigator.serviceWorker.register('./sw.js').then(reg=>{reg.addEventListener('updatefound',()=>{newWorker=reg.installing;newWorker.addEventListener('statechange',()=>{if(newWorker.state==='installed'&&navigator.serviceWorker.controller)document.getElementById('update').classList.add('show')})})});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(window.__updateApplied)location.reload()})
}
function applyUpdate(){if(newWorker){window.__updateApplied=true;newWorker.postMessage({type:'SKIP_WAITING'})}}



// Version 6: sunlight intelligence, Summit Focus and night-vision display
const CAMPFIRE_KEY='ddmg-v6-campfire',FOCUS_OBJECTIVE_KEY='ddmg-v6-focus-objective';
const FOCUS_OBJECTIVES={
 blanca:{id:'blanca',label:'Blanca + Ellingwood',date:'2026-08-23',weatherId:'blanca',start:'4:15 AM',turn:'11:30 AM',intent:'Below exposed high terrain by late morning.',route:'The traverse is optional. Weather, rock, time and every climber’s comfort decide the sequence.',dayId:'sun',links:[['Combination route','https://www.14ers.com/route.php?route=elli3'],['Peak conditions','https://www.14ers.com/php14ers/peakstatus_peak.php?peakparm=10004']]},
 lake:{id:'lake',label:'Lake Como approach',date:'2026-08-22',weatherId:'lake',start:'10:00 AM',turn:'3:30 PM',intent:'Reach camp with enough margin to recover, filter water and prepare.',route:'Road clearance determines the starting point. Do not force the vehicle higher than conditions support.',dayId:'sat',links:[['Trailhead status','https://www.14ers.com/php14ers/trailheadsview.php?thparm=sc01'],['NWS point forecast','https://forecast.weather.gov/MapClick.php?lat=37.56960&lon=-105.51406']]},
 lindsey:{id:'lindsey',label:'Mount Lindsey',date:'2026-08-24',weatherId:'lindsey',start:'5:15 AM',turn:'12:00 PM',intent:'Summit early and return to the trailhead by early afternoon.',route:'Confirm access and waiver before departure. Route conditions and group judgment govern the climb.',dayId:'mon',links:[['Standard route','https://www.14ers.com/route.php?route=lind1'],['Required waiver','https://www.mountlindseywaiver.com/']]}
};
let focusObjectiveId=storageGet(FOCUS_OBJECTIVE_KEY)||'blanca';

const RAD=Math.PI/180,DAY_MS=86400000,J1970=2440588,J2000=2451545;
function toJulian(date){return date.valueOf()/DAY_MS-.5+J1970}function fromJulian(j){return new Date((j+.5-J1970)*DAY_MS)}function toDays(date){return toJulian(date)-J2000}
function solarMeanAnomaly(d){return RAD*(357.5291+.98560028*d)}
function eclipticLongitude(M){const C=RAD*(1.9148*Math.sin(M)+.02*Math.sin(2*M)+.0003*Math.sin(3*M)),P=RAD*102.9372;return M+C+P+Math.PI}
function declination(L){return Math.asin(Math.sin(L)*Math.sin(RAD*23.4397))}
function julianCycle(d,lw){return Math.round(d-.0009-lw/(2*Math.PI))}function approxTransit(Ht,lw,n){return .0009+(Ht+lw)/(2*Math.PI)+n}
function solarTransitJ(ds,M,L){return J2000+ds+.0053*Math.sin(M)-.0069*Math.sin(2*L)}
function hourAngle(h,phi,dec){return Math.acos((Math.sin(h)-Math.sin(phi)*Math.sin(dec))/(Math.cos(phi)*Math.cos(dec)))}
function getSetJ(h,lw,phi,dec,n,M,L){const w=hourAngle(h,phi,dec),a=approxTransit(w,lw,n);return solarTransitJ(a,M,L)}
function sunTimes(dateStr,lat,lon){const date=new Date(dateStr+'T12:00:00Z'),lw=RAD*-lon,phi=RAD*lat,d=toDays(date),n=julianCycle(d,lw),ds=approxTransit(0,lw,n),M=solarMeanAnomaly(ds),L=eclipticLongitude(M),dec=declination(L),Jnoon=solarTransitJ(ds,M,L);function pair(angle){const Jset=getSetJ(angle*RAD,lw,phi,dec,n,M,L),Jrise=Jnoon-(Jset-Jnoon);return [fromJulian(Jrise),fromJulian(Jset)]}const dawn=pair(-6),sun=pair(-.833);return {dawn:dawn[0],sunrise:sun[0],sunset:sun[1]}}
function mtTime(date){return new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',hour:'numeric',minute:'2-digit'}).format(date)}
function focusSpec(id=focusObjectiveId){return FOCUS_OBJECTIVES[id]||FOCUS_OBJECTIVES.blanca}
function lightData(id=focusObjectiveId){const obj=focusSpec(id),loc=locationById(obj.weatherId),t=sunTimes(obj.date,loc.lat,loc.lon);return {...t,obj,loc}}
function renderLightBoard(id=focusObjectiveId){const x=lightData(id);document.getElementById('lightObjective').value=id;document.getElementById('lightBoardTitle').textContent=`${x.obj.label} · ${new Intl.DateTimeFormat('en-US',{weekday:'long',timeZone:'America/Denver'}).format(new Date(x.obj.date+'T12:00:00-06:00'))}`;document.getElementById('lightDawn').textContent=mtTime(x.dawn);document.getElementById('lightSunrise').textContent=mtTime(x.sunrise);document.getElementById('lightSunset').textContent=mtTime(x.sunset);document.getElementById('lightContext').textContent=`${x.loc.name} · ${x.loc.elevationFt.toLocaleString()} ft · Mountain Time. Astronomical flat-horizon times, not terrain-adjusted usable light.`;if(id==='blanca'){document.getElementById('sunMetric').textContent=mtTime(x.dawn);document.getElementById('sunMetricNote').textContent='Astronomical civil dawn · flat horizon · Aug 23'}}
function renderFocus(){const obj=focusSpec(),x=lightData(),item=weatherStore[obj.weatherId],weather=document.getElementById('focusWeather');document.getElementById('focusObjective').value=obj.id;document.getElementById('focusStart').textContent=obj.start;document.getElementById('focusTurn').textContent=obj.turn;document.getElementById('focusLight').textContent=mtTime(x.dawn);document.getElementById('focusLightNote').textContent=`Astronomical flat-horizon time for ${x.loc.name}; surrounding ridges can delay direct light and summit elevation can shift observed sunrise.`;document.getElementById('focusIntent').textContent=obj.intent;document.getElementById('focusRouteText').textContent=obj.route;document.getElementById('focusLinks').innerHTML=obj.links.map(([label,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} ↗</a>`).join('');if(item?.current){const c=item.current,flags=planningFlags(item).slice(0,2);weather.innerHTML=`<div class="focus-weather-grid"><div class="focus-weather-temp">${c.temp}°</div><div><b>${escapeHtml(c.condition)}</b><small>${escapeHtml(c.windDirection)} ${c.windMph||0} mph · ${Number.isFinite(c.pop)?c.pop+'% precip.':'precip. unknown'} · saved ${formatStamp(item.fetchedAt,false)}</small><div class="weather-flags">${flags.map(f=>`<span class="weather-flag ${f.type}">${escapeHtml(f.label)}</span>`).join('')}</div></div></div>`}else weather.innerHTML='<span class="weather-pulse"></span><div><b>No saved forecast yet</b><small>Refresh while online to carry it offline.</small></div>'}
function openFocus(id){if(id&&FOCUS_OBJECTIVES[id])focusObjectiveId=id;storageSet(FOCUS_OBJECTIVE_KEY,focusObjectiveId);renderFocus();const overlay=document.getElementById('focusOverlay');overlay.hidden=false;document.body.style.overflow='hidden';setTimeout(()=>document.getElementById('focusObjective').focus(),0)}
function closeFocus(){document.getElementById('focusOverlay').hidden=true;document.body.style.overflow=''}
function toggleCampfire(){document.documentElement.classList.toggle('campfire-mode');const on=document.documentElement.classList.contains('campfire-mode');storageSet(CAMPFIRE_KEY,on?'1':'0');document.querySelectorAll('#campfireHero,#toggleCampfireSection,#focusCampfire').forEach(b=>{if(b)b.textContent=on?'Return to color':'Night vision'});toast(on?'Night-vision display enabled':'Standard display restored')}
function setupV6(){if(storageGet(CAMPFIRE_KEY)==='1')document.documentElement.classList.add('campfire-mode');toggleCampfireStateText();renderLightBoard();renderFocus();document.getElementById('lightObjective').addEventListener('change',e=>{focusObjectiveId=e.target.value;storageSet(FOCUS_OBJECTIVE_KEY,focusObjectiveId);renderLightBoard();renderFocus()});document.getElementById('focusObjective').addEventListener('change',e=>{focusObjectiveId=e.target.value;storageSet(FOCUS_OBJECTIVE_KEY,focusObjectiveId);renderLightBoard();renderFocus()});['openFocusHero','openFocusSection','focusFab'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>openFocus()));document.getElementById('closeFocus').addEventListener('click',closeFocus);document.getElementById('focusOverlay').addEventListener('click',e=>{if(e.target.id==='focusOverlay')closeFocus()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('focusOverlay').hidden)closeFocus()});['campfireHero','toggleCampfireSection','focusCampfire'].forEach(id=>document.getElementById(id)?.addEventListener('click',toggleCampfire));document.getElementById('focusToday').addEventListener('click',()=>{closeFocus();document.getElementById(focusSpec().dayId)?.scrollIntoView({behavior:'smooth',block:'start'})});document.getElementById('focusRefresh').addEventListener('click',async()=>{const id=focusSpec().weatherId;if(!navigator.onLine){toast('Offline — showing saved forecast');return}try{await refreshLocation(id,{force:true});renderFocus();toast('Focus forecast refreshed')}catch{}});const revealObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.08}):null;document.querySelectorAll('main>section').forEach((s,i)=>{if(i>0){s.classList.add('reveal');if(revealObserver)revealObserver.observe(s);else s.classList.add('visible')}})}
function toggleCampfireStateText(){const on=document.documentElement.classList.contains('campfire-mode');document.querySelectorAll('#campfireHero,#toggleCampfireSection,#focusCampfire').forEach(b=>{if(b)b.textContent=on?'Return to color':'Night vision'})}

document.documentElement.classList.remove('field-mode');storageRemove('ddmg-v3-field');
document.getElementById('nextActionPrimary').addEventListener('click',runNextAction);
document.getElementById('shareStatusBtn').addEventListener('click',shareStatus);
document.getElementById('shareIntelBtn').addEventListener('click',shareStatus);
const initialNav=document.querySelector('.bottom-nav a.active');if(initialNav)initialNav.setAttribute('aria-current','page');
setupWeatherWidget();setupInstallNudge();setupBottomNav();
renderAllWeather();renderReviews();updateIntelCheckProgress();updateIntelOverall();renderNextAction();setupV6();
