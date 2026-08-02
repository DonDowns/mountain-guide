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


// Version 6.6 — reusable Personal Gear Locker and Smart Pack Builder.
const GEAR_LOCKER_KEY='ddmg-v6-6-gear-locker';
const PACK_STATE_KEY='ddmg-v6-6-pack-state';
const PACK_PROFILE_KEY='ddmg-v6-6-pack-profile';
const CUSTOM_PACK_KEY='ddmg-v6-6-custom-pack';

const GEAR_CATEGORIES=[
 ['packs','Packs'],['shelter','Shelter'],['sleep','Sleep'],['clothing','Clothing'],
 ['navigation','Navigation & electronics'],['water','Water'],['food','Food & kitchen'],
 ['safety','Safety'],['vehicle','Vehicle & lodging'],['personal','Personal']
];
const GEAR_STATUSES=[
 ['owned','Owned'],['rent','Rent'],['borrow','Borrow'],['shared','Shared / assigned'],
 ['conditional','Conditions-dependent'],['verify','Verify before trip']
];
const LOCATION_LABELS={
 worn:'Wear / immediate access',main:'Main pack',summit:'Summit or day pack',
 vehicle:'Vehicle / lodging',shared:'Shared group gear',conditional:'Conditional'
};

const BASE_GEAR=[
 {id:'paragon60',name:'Gregory Paragon 60',category:'packs',status:'owned',location:'main',weightOz:null,note:'Primary overnight backpack.'},
 {id:'flash18',name:'REI Flash 18',category:'packs',status:'owned',location:'summit',weightOz:null,note:'Packs flat inside the main backpack; used for summit day.'},
 {id:'ospreyManta',name:'Osprey Manta day pack',category:'packs',status:'owned',location:'summit',weightOz:null,note:'Reusable day-hike and hydration-pack option.'},

 {id:'sweetSuite2',name:'Sierra Designs Sweet Suite 2 tent',category:'shelter',status:'owned',location:'main',weightOz:null,note:'Primary backpacking shelter for Lake Como.'},
 {id:'tepui2',name:'Tepui two-person rooftop tent',category:'shelter',status:'owned',location:'vehicle',weightOz:null,note:'Exact model not recorded. Optional vehicle-camp shelter carried on the Audi Q5.'},
 {id:'tepuiHardware',name:'Tepui ladder and mounting hardware',category:'shelter',status:'verify',location:'vehicle',weightOz:null,note:'Confirm all mounting components before a rooftop-camping trip.'},
 {id:'roofSystemCheck',name:'Audi Q5 roof system and rated-load verification',category:'vehicle',status:'verify',location:'vehicle',weightOz:null,note:'Confirm vehicle, crossbar, mounting, and tent limits for the exact setup.'},

 {id:'sleepingBag20',name:'20°F down sleeping bag',category:'sleep',status:'rent',location:'main',weightOz:null,note:'Rent for Lake Como; pack inside a waterproof liner.'},
 {id:'insulatedPad',name:'Insulated sleeping pad, approximately R-4+',category:'sleep',status:'rent',location:'main',weightOz:null,note:'Rent for Lake Como.'},
 {id:'pillow',name:'Compact camp pillow or clothing-stuff sack',category:'sleep',status:'conditional',location:'main',weightOz:null,note:'Comfort item; not required if clothing serves as a pillow.'},

 {id:'hikingFootwear',name:'Hiking footwear',category:'clothing',status:'owned',location:'worn',weightOz:null,note:'Broken in and appropriate for the route.'},
 {id:'hikingClothes',name:'Hiking base layer and pants or shorts',category:'clothing',status:'owned',location:'worn',weightOz:null,note:'Primary moving layer.'},
 {id:'rainShell',name:'Rain shell',category:'clothing',status:'owned',location:'main',weightOz:null,note:'Accessible without unpacking the entire backpack.'},
 {id:'puffy',name:'Insulated puffy jacket',category:'clothing',status:'owned',location:'main',weightOz:null,note:'Summit and camp insulation.'},
 {id:'fleece',name:'Fleece or active midlayer',category:'clothing',status:'owned',location:'main',weightOz:null,note:'Moving and camp layer.'},
 {id:'beanie',name:'Warm beanie',category:'clothing',status:'owned',location:'main',weightOz:null,note:''},
 {id:'gloves',name:'Warm gloves',category:'clothing',status:'owned',location:'main',weightOz:null,note:''},
 {id:'drySocks',name:'Dry camp socks and spare hiking socks',category:'clothing',status:'owned',location:'main',weightOz:null,note:'Keep one pair dry for camp and sleep.'},
 {id:'sunHat',name:'Sun hat',category:'clothing',status:'owned',location:'worn',weightOz:null,note:''},
 {id:'sunglasses',name:'Sunglasses',category:'clothing',status:'owned',location:'worn',weightOz:null,note:'High-altitude eye protection.'},
 {id:'campShoes',name:'Camp or lodging footwear',category:'clothing',status:'conditional',location:'vehicle',weightOz:null,note:'Comfort item; vehicle or lodging bag.'},

 {id:'phoneOffline',name:'Phone with offline maps and route pages',category:'navigation',status:'owned',location:'worn',weightOz:null,note:'Download before leaving service.'},
 {id:'routeScreens',name:'Route screenshots, GPX, and key route photographs',category:'navigation',status:'owned',location:'summit',weightOz:0,note:'Stored offline on the phone; print critical pages when useful.'},
 {id:'garmin965',name:'Garmin Forerunner 965',category:'navigation',status:'owned',location:'worn',weightOz:null,note:'Course loaded; Hiking activity for standard Class 1–3 routes.'},
 {id:'inreach',name:'Garmin inReach',category:'navigation',status:'owned',location:'main',weightOz:null,note:'Charged, active plan confirmed, attached high on a shoulder strap.'},
 {id:'headlamp',name:'Primary headlamp',category:'navigation',status:'owned',location:'main',weightOz:null,note:'Required for alpine starts.'},
 {id:'headlampBackup',name:'Backup headlamp or tested spare battery',category:'navigation',status:'owned',location:'main',weightOz:null,note:'Independent backup for pre-dawn travel.'},
 {id:'powerBank',name:'Power bank',category:'navigation',status:'owned',location:'main',weightOz:null,note:'Charged before departure.'},
 {id:'chargingCables',name:'Phone, Garmin, and inReach charging cables',category:'navigation',status:'owned',location:'vehicle',weightOz:null,note:'Keep travel and camp charging needs distinct.'},
 {id:'paperEmergency',name:'Printed emergency and communication card',category:'navigation',status:'owned',location:'main',weightOz:null,note:'Offline redundancy.'},

 {id:'hydrationReservoir',name:'Hydration reservoir and bottles',category:'water',status:'owned',location:'main',weightOz:null,note:'Total capacity 2–3 L for summit use.'},
 {id:'waterFilter',name:'Water filter',category:'water',status:'owned',location:'main',weightOz:null,note:'Do not split critical water-treatment capability.'},
 {id:'vehicleWater',name:'Vehicle reserve water',category:'water',status:'owned',location:'vehicle',weightOz:null,note:'Travel, trailhead, and post-hike reserve.'},
 {id:'electrolytes',name:'Electrolyte mix',category:'water',status:'owned',location:'main',weightOz:null,note:'Use in one bottle or reservoir according to the trip plan.'},

 {id:'trailFuel',name:'Trail food: granola bars and trail mix',category:'food',status:'owned',location:'main',weightOz:null,note:'Trail mix preference: nuts, M&Ms, and raisins. Target 150–250 kcal per hour on summit days.'},
 {id:'dehydratedMeals',name:'Dehydrated camp dinners',category:'food',status:'owned',location:'main',weightOz:null,note:'One per planned camp dinner plus only the margin the itinerary warrants.'},
 {id:'breakfastFood',name:'Backpacking breakfast',category:'food',status:'owned',location:'main',weightOz:null,note:'Target approximately 300–500 kcal before moving.'},
 {id:'spoonMug',name:'Long spoon and insulated mug',category:'food',status:'owned',location:'main',weightOz:null,note:''},
 {id:'sharedStove',name:"Friend's stove",category:'food',status:'shared',location:'shared',weightOz:null,note:'Confirm the assigned carrier and fuel compatibility.'},
 {id:'sharedFuel',name:'Stove fuel',category:'food',status:'shared',location:'shared',weightOz:null,note:'Confirm quantity and carrier with the stove owner.'},
 {id:'cooler',name:'Vehicle cooler and post-hike food',category:'food',status:'conditional',location:'vehicle',weightOz:null,note:'Vehicle and lodging support, not carried to camp.'},

 {id:'firstAid',name:'Compact first-aid and blister kit',category:'safety',status:'owned',location:'main',weightOz:null,note:'Personal kit; group plan should not depend on one inaccessible kit.'},
 {id:'emergencyBivy',name:'Emergency bivy or blanket',category:'safety',status:'owned',location:'summit',weightOz:null,note:''},
 {id:'helmet',name:'Climbing helmet',category:'safety',status:'owned',location:'main',weightOz:null,note:'Carry for Class 3 terrain and rockfall exposure.'},
 {id:'poles',name:'Trekking poles',category:'safety',status:'borrow',location:'main',weightOz:null,note:'Borrow or rent for the loaded Lake Como approach.'},
 {id:'microspikes',name:'Microspikes',category:'safety',status:'conditional',location:'conditional',weightOz:null,note:'Add only when current route conditions warrant traction.'},
 {id:'iceAxe',name:'Ice axe',category:'safety',status:'conditional',location:'conditional',weightOz:null,note:'Add only when snow conditions, route, and competence warrant it.'},
 {id:'repairKit',name:'Small repair kit and tape',category:'safety',status:'owned',location:'main',weightOz:null,note:'Shelter, pad, and pack field repair.'},
 {id:'sunscreenLip',name:'Sunscreen and SPF lip protection',category:'safety',status:'owned',location:'worn',weightOz:null,note:'High-altitude sun exposure.'},

 {id:'audiQ5',name:'Audi Q5',category:'vehicle',status:'owned',location:'vehicle',weightOz:0,note:'Default travel vehicle. Do not assume it is the correct vehicle for the roughest portion of Lake Como Road.'},
 {id:'vehicleKeys',name:'Audi keys and deliberate spare-key plan',category:'vehicle',status:'owned',location:'vehicle',weightOz:null,note:'Keep the spare with a different responsible adult when practical.'},
 {id:'fuelTopOff',name:'Fuel topped off before remote travel',category:'vehicle',status:'verify',location:'vehicle',weightOz:0,note:''},
 {id:'lodgingBag',name:'Separate lodging and travel bag',category:'vehicle',status:'owned',location:'vehicle',weightOz:null,note:'Keep it separate from the intact backpacking system.'},
 {id:'cleanClothes',name:'Clean return clothes',category:'vehicle',status:'owned',location:'vehicle',weightOz:null,note:''},
 {id:'toiletriesMeds',name:'Toiletries and personal medications',category:'personal',status:'owned',location:'vehicle',weightOz:null,note:'Keep essential medication accessible and protected.'},
 {id:'walletId',name:'Wallet, identification, and permits or waiver copy',category:'personal',status:'owned',location:'worn',weightOz:null,note:'Keep sensitive confirmation details outside the public app.'},
 {id:'lindseyWaiver',name:'Mount Lindsey waiver confirmation saved offline',category:'personal',status:'verify',location:'vehicle',weightOz:0,note:'Reconfirm current access requirements before departure.'},
 {id:'groupShelterPlan',name:'Group shelter and critical-gear assignment confirmed',category:'safety',status:'shared',location:'shared',weightOz:0,note:'Do not split critical shelter, water treatment, or emergency capability without an explicit plan.'}
];

const PACK_PRESETS={
 'lake-como-2026':{
  title:'Lake Como 2026',
  description:'Complete travel, backpacking, camp, Blanca–Ellingwood, and Mount Lindsey packing plan for August 19–25.',
  note:'<b>Current expedition:</b> the Audi Q5 is the default travel vehicle, but the actual Lake Como Road approach vehicle and parking point remain governed by clearance and the group plan. The Sierra Designs tent is the carried shelter. The Tepui rooftop tent remains an optional vehicle-camp item.',
  sections:[
   {id:'worn',title:'Wear & immediate access',subtitle:'Start the trip with these usable, not buried.',items:[
    'hikingFootwear','hikingClothes','sunHat','sunglasses','sunscreenLip','phoneOffline','garmin965','walletId'
   ]},
   {id:'main',title:'Gregory Paragon 60 — approach to camp',subtitle:'Backpacking shelter, sleep system, layers, water, food, and emergency redundancy.',items:[
    'paragon60','sweetSuite2','sleepingBag20','insulatedPad','flash18','rainShell','puffy','fleece','beanie','gloves','drySocks',
    'headlamp','headlampBackup','inreach','powerBank','waterFilter','hydrationReservoir','electrolytes','poles','firstAid',
    'emergencyBivy','helmet','routeScreens','paperEmergency','repairKit','dehydratedMeals','breakfastFood','trailFuel','spoonMug'
   ]},
   {id:'summit',title:'REI Flash 18 — summit repack',subtitle:'Confirm again after camp is established; these checks represent the actual summit loadout.',items:[
    'flash18','hydrationReservoir','trailFuel','electrolytes','rainShell','puffy','beanie','gloves','headlamp','inreach',
    'phoneOffline','garmin965','firstAid','emergencyBivy','routeScreens','helmet','sunscreenLip','sunglasses'
   ]},
   {id:'vehicle',title:'Audi Q5, lodging & return',subtitle:'Travel and recovery gear that does not belong in the backpacking load.',items:[
    'audiQ5','vehicleKeys','fuelTopOff','vehicleWater','chargingCables','lodgingBag','cleanClothes','campShoes',
    'toiletriesMeds','cooler','lindseyWaiver'
   ]},
   {id:'shared',title:'Shared / assigned — confirm the carrier',subtitle:'An assignment is not complete until the person and item are explicit.',items:[
    'sharedStove','sharedFuel','groupShelterPlan'
   ]},
   {id:'conditional',title:'Conditional — decide from actual trip needs',subtitle:'Visible for deliberate decisions but excluded from required completion.',items:[
    {id:'tepui2',required:false,note:'Optional vehicle-camp shelter; not the Lake Como backpacking shelter.'},
    {id:'tepuiHardware',required:false},
    {id:'roofSystemCheck',required:false},
    {id:'microspikes',required:false},
    {id:'iceAxe',required:false},
    {id:'pillow',required:false}
   ]}
  ]
 },
 'fourteener-day':{
  title:'Colorado 14er Summit Day',
  description:'Reusable early-start day-hike template for standard summer routes.',
  note:'<b>Template:</b> starts with the Osprey Manta, personal navigation, water, weather layers, food, and emergency redundancy. Add traction only from current route conditions.',
  sections:[
   {id:'worn',title:'Wear & immediate access',subtitle:'On body or reachable without unpacking.',items:['hikingFootwear','hikingClothes','sunHat','sunglasses','sunscreenLip','phoneOffline','garmin965','walletId']},
   {id:'summit',title:'Osprey Manta — summit day',subtitle:'Standard high-country day loadout.',items:['ospreyManta','hydrationReservoir','trailFuel','electrolytes','rainShell','puffy','beanie','gloves','headlamp','headlampBackup','inreach','firstAid','emergencyBivy','routeScreens','helmet']},
   {id:'vehicle',title:'Vehicle & return',subtitle:'Trailhead and post-hike support.',items:['audiQ5','vehicleKeys','fuelTopOff','vehicleWater','cleanClothes','campShoes','chargingCables']},
   {id:'conditional',title:'Conditions-dependent',subtitle:'Do not add automatically.',items:[{id:'microspikes',required:false},{id:'iceAxe',required:false},{id:'poles',required:false}]}
  ]
 },
 'overnight-summit':{
  title:'Overnight Backpack + Summit',
  description:'Reusable one- or two-night backpacking template with a separate summit pack.',
  note:'<b>Template:</b> mirrors the Lake Como carry system without the destination-specific travel and waiver items.',
  sections:[
   {id:'worn',title:'Wear & immediate access',subtitle:'Moving layer and navigation.',items:['hikingFootwear','hikingClothes','sunHat','sunglasses','sunscreenLip','phoneOffline','garmin965','walletId']},
   {id:'main',title:'Main backpack',subtitle:'Shelter, sleep, food, layers, water, and redundancy.',items:['paragon60','sweetSuite2','sleepingBag20','insulatedPad','flash18','rainShell','puffy','fleece','beanie','gloves','drySocks','headlamp','headlampBackup','inreach','powerBank','waterFilter','hydrationReservoir','electrolytes','poles','firstAid','emergencyBivy','helmet','routeScreens','paperEmergency','repairKit','dehydratedMeals','breakfastFood','trailFuel','spoonMug']},
   {id:'summit',title:'Summit pack',subtitle:'Repack after camp is established.',items:['flash18','hydrationReservoir','trailFuel','electrolytes','rainShell','puffy','beanie','gloves','headlamp','inreach','phoneOffline','garmin965','firstAid','emergencyBivy','routeScreens','helmet','sunscreenLip','sunglasses']},
   {id:'shared',title:'Shared / assigned',subtitle:'Confirm the carrier.',items:['sharedStove','sharedFuel','groupShelterPlan']},
   {id:'conditional',title:'Conditions-dependent',subtitle:'Decide from current route and weather information.',items:[{id:'microspikes',required:false},{id:'iceAxe',required:false},{id:'pillow',required:false}]}
  ]
 },
 'rooftop-camp':{
  title:'Audi Q5 + Tepui Rooftop Camp',
  description:'Reusable vehicle-camping preset centered on the Audi Q5 and two-person Tepui rooftop tent.',
  note:'<b>Vehicle-camp template:</b> verify the exact Tepui model, Audi roof configuration, crossbars, mounting hardware, and all applicable load limits before use.',
  sections:[
   {id:'vehicle',title:'Audi Q5 & rooftop system',subtitle:'Vehicle and tent system.',items:['audiQ5','vehicleKeys','fuelTopOff','roofSystemCheck','tepui2','tepuiHardware','vehicleWater','chargingCables']},
   {id:'sleep',title:'Sleep & camp comfort',subtitle:'Vehicle-camping sleep system.',items:['sleepingBag20','insulatedPad','pillow','beanie','drySocks','headlamp']},
   {id:'food',title:'Food & water',subtitle:'Vehicle-camp meals and cleanup.',items:['cooler','vehicleWater','sharedStove','sharedFuel','spoonMug','electrolytes']},
   {id:'personal',title:'Personal & day use',subtitle:'Travel, hygiene, and day-hike support.',items:['lodgingBag','cleanClothes','campShoes','toiletriesMeds','walletId','ospreyManta','phoneOffline','garmin965','inreach','firstAid']}
  ]
 },
 'travel-lodging':{
  title:'Mountain Travel + Lodging',
  description:'Simple road-trip and lodging template when no overnight backpack is required.',
  note:'<b>Travel template:</b> preserves the Audi Q5, navigation, hydration, clean return gear, and personal essentials without loading backpacking equipment.',
  sections:[
   {id:'vehicle',title:'Audi Q5',subtitle:'Vehicle readiness and travel support.',items:['audiQ5','vehicleKeys','fuelTopOff','vehicleWater','chargingCables','cooler']},
   {id:'personal',title:'Lodging & personal',subtitle:'Separate from hiking equipment.',items:['lodgingBag','cleanClothes','campShoes','toiletriesMeds','walletId']},
   {id:'day',title:'Optional day-hike kit',subtitle:'Use when the itinerary includes a hike.',items:[{id:'ospreyManta',required:false},{id:'hydrationReservoir',required:false},{id:'rainShell',required:false},{id:'puffy',required:false},{id:'headlamp',required:false},{id:'phoneOffline',required:false},{id:'garmin965',required:false},{id:'firstAid',required:false}]}
  ]
 }
};

function categoryLabel(id){return GEAR_CATEGORIES.find(x=>x[0]===id)?.[1]||id}
function statusLabel(id){return GEAR_STATUSES.find(x=>x[0]===id)?.[1]||id}
function normalizePackEntry(entry){return typeof entry==='string'?{id:entry,required:true}:{required:true,...entry}}
function buildGearLocker(){
 const saved=safeParse(storageGet(GEAR_LOCKER_KEY),{});
 const locker={};
 BASE_GEAR.forEach(item=>locker[item.id]={...item,...(saved[item.id]||{})});
 Object.entries(saved).forEach(([id,item])=>{if(!locker[id])locker[id]=item});
 return locker
}
let gearLocker=buildGearLocker();
let packState=safeParse(storageGet(PACK_STATE_KEY),{});
let packProfileId=PACK_PRESETS[storageGet(PACK_PROFILE_KEY)]?storageGet(PACK_PROFILE_KEY):'lake-como-2026';
let customPack=safeParse(storageGet(CUSTOM_PACK_KEY),{});

function saveGearLocker(){storageSet(GEAR_LOCKER_KEY,JSON.stringify(gearLocker))}
function savePackState(){storageSet(PACK_STATE_KEY,JSON.stringify(packState))}
function saveCustomPack(){storageSet(CUSTOM_PACK_KEY,JSON.stringify(customPack))}
function packKey(profileId,sectionId,itemId){return `${profileId}:${sectionId}:${itemId}`}
function profileSections(profileId=packProfileId){
 const base=PACK_PRESETS[profileId]?.sections||[];
 const additions=customPack[profileId]||[];
 return base.map(section=>({
  ...section,
  items:[
   ...section.items,
   ...additions.filter(x=>x.sectionId===section.id).map(x=>({id:x.itemId,required:x.required!==false,custom:true}))
  ]
 }))
}
function packCounts(){
 let total=0,checked=0,knownWeightOz=0,unknown=0,sourceActions=new Set();
 profileSections().forEach(section=>section.items.map(normalizePackEntry).forEach(entry=>{
  const item=gearLocker[entry.id];if(!item)return;
  if(entry.required){
   total++;
   if(packState[packKey(packProfileId,section.id,entry.id)])checked++;
  }
  if(Number.isFinite(Number(item.weightOz))&&Number(item.weightOz)>0)knownWeightOz+=Number(item.weightOz);
  else if(entry.required&&item.weightOz!==0)unknown++;
  if(['rent','borrow','shared','verify'].includes(item.status))sourceActions.add(entry.id);
 }));
 return {total,checked,knownWeightOz,unknown,sourceActions:sourceActions.size}
}
function ouncesLabel(oz){
 if(!oz)return '—';
 const lb=Math.floor(oz/16),rem=Math.round((oz-lb*16)*10)/10;
 return lb?`${lb} lb${rem?` ${rem} oz`:''}`:`${rem} oz`
}
function migrateLegacyPacking(){
 if(storageGet('ddmg-v6-6-migrated')==='1')return;
 const legacy=safeParse(storageGet(CHECK_KEY),{});
 const map={
  paragon:'paragon60',tent:'sweetSuite2',bag:'sleepingBag20',pad:'insulatedPad',
  flash:'flash18',layers:'rainShell',warm:'beanie',headlamp:'headlamp',
  inreach:'inreach',water:'hydrationReservoir',poles:'poles',
  summitwater:'hydrationReservoir',food:'trailFuel',shell:'rainShell',
  hatgloves:'gloves',summitlamp:'headlamp',summitinreach:'inreach',
  offline:'phoneOffline',garmin:'garmin965',firstaid:'firstAid',
  bivy:'emergencyBivy',screens:'routeScreens'
 };
 Object.entries(map).forEach(([oldKey,itemId])=>{
  if(!legacy[oldKey])return;
  profileSections('lake-como-2026').forEach(section=>{
   if(section.items.map(normalizePackEntry).some(x=>x.id===itemId)){
    packState[packKey('lake-como-2026',section.id,itemId)]=true;
   }
  });
 });
 savePackState();storageSet('ddmg-v6-6-migrated','1')
}

function renderPackBuilder(){
 const profile=PACK_PRESETS[packProfileId];
 const select=document.getElementById('packProfile');
 if(!select)return;
 select.innerHTML=Object.entries(PACK_PRESETS).map(([id,p])=>`<option value="${escapeHtml(id)}">${escapeHtml(p.title)}</option>`).join('');
 select.value=packProfileId;
 document.getElementById('packProfileTitle').textContent=profile.title;
 document.getElementById('packProfileDescription').textContent=profile.description;
 document.getElementById('packContextNote').innerHTML=profile.note;
 const sections=document.getElementById('packSections');
 sections.innerHTML=profileSections().map(section=>{
  let known=0,unknown=0;
  const rows=section.items.map(normalizePackEntry).map(entry=>{
   const item=gearLocker[entry.id];if(!item)return '';
   if(Number(item.weightOz)>0)known+=Number(item.weightOz);else if(entry.required&&item.weightOz!==0)unknown++;
   const key=packKey(packProfileId,section.id,entry.id),checked=!!packState[key];
   const note=entry.note||item.note||'';
   const weight=Number(item.weightOz)>0?ouncesLabel(Number(item.weightOz)):'';
   return `<label class="pack-item">
    <input type="checkbox" data-pack-check="${escapeHtml(key)}" ${checked?'checked':''}>
    <span class="pack-item-main"><b>${escapeHtml(item.name)}</b>${note?`<small>${escapeHtml(note)}</small>`:''}</span>
    <span class="pack-item-meta">
      <span class="gear-badge ${entry.required?'required':'conditional'}">${entry.required?'Required':'Optional'}</span>
      <span class="gear-badge ${escapeHtml(item.status)}">${escapeHtml(statusLabel(item.status))}</span>
      ${weight?`<span class="gear-badge">${escapeHtml(weight)}</span>`:''}
    </span>
   </label>`
  }).join('');
  const weightText=known?`${ouncesLabel(known)} known${unknown?` · ${unknown} unknown`:''}`:(unknown?`${unknown} weights unknown`:'No carried weight');
  return `<article class="pack-section">
   <div class="pack-section-head"><div><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.subtitle||'')}</p></div><span class="pack-section-weight">${escapeHtml(weightText)}</span></div>
   <div class="pack-list">${rows}</div>
  </article>`
 }).join('');
 renderPackSummary();
 renderCustomSectionOptions()
}
function renderPackSummary(){
 const c=packCounts(),pct=c.total?Math.round(c.checked/c.total*100):0;
 const packed=document.getElementById('packPackedSummary');if(!packed)return;
 packed.textContent=`${c.checked} / ${c.total}`;
 document.getElementById('packPackedLabel').textContent=`${pct}% packed or confirmed`;
 document.getElementById('packProgressBar').style.width=`${pct}%`;
 document.getElementById('packWeightSummary').textContent=ouncesLabel(c.knownWeightOz);
 document.getElementById('packWeightLabel').textContent=c.unknown?`${c.unknown} required weight${c.unknown===1?'':'s'} not recorded`:'all listed weights recorded';
 document.getElementById('packSourceSummary').textContent=String(c.sourceActions);
}
function renderGearLocker(){
 const wrap=document.getElementById('gearLocker');if(!wrap)return;
 const q=(document.getElementById('gearSearch')?.value||'').trim().toLowerCase();
 const category=document.getElementById('gearCategoryFilter')?.value||'';
 const items=Object.values(gearLocker).filter(item=>{
  const hay=`${item.name} ${categoryLabel(item.category)} ${item.note||''}`.toLowerCase();
  return (!q||hay.includes(q))&&(!category||item.category===category)
 }).sort((a,b)=>categoryLabel(a.category).localeCompare(categoryLabel(b.category))||a.name.localeCompare(b.name));
 if(!items.length){wrap.innerHTML='<div class="gear-empty">No gear matches this filter.</div>';return}
 wrap.innerHTML=items.map(item=>`<article class="gear-row" data-gear-id="${escapeHtml(item.id)}">
  <div class="gear-row-title"><b>${escapeHtml(item.name)}</b><small>${escapeHtml(categoryLabel(item.category))}${item.note?` · ${escapeHtml(item.note)}`:''}</small></div>
  <label><span>Availability</span><select data-gear-status>${GEAR_STATUSES.map(([id,label])=>`<option value="${id}" ${item.status===id?'selected':''}>${escapeHtml(label)}</option>`).join('')}</select></label>
  <label class="gear-default-location"><span>Default place</span><select data-gear-location>${Object.entries(LOCATION_LABELS).map(([id,label])=>`<option value="${id}" ${item.location===id?'selected':''}>${escapeHtml(label)}</option>`).join('')}</select></label>
  <label><span>Weight oz</span><input data-gear-weight min="0" step="0.1" type="number" value="${Number.isFinite(Number(item.weightOz))&&item.weightOz!==null?escapeHtml(item.weightOz):''}" placeholder="—"></label>
  ${item.custom?'<button class="gear-delete" data-delete-gear type="button">Delete</button>':'<span></span>'}
 </article>`).join('')
}
function renderGearSelects(){
 const catFilter=document.getElementById('gearCategoryFilter');
 catFilter.innerHTML='<option value="">All categories</option>'+GEAR_CATEGORIES.map(([id,label])=>`<option value="${id}">${escapeHtml(label)}</option>`).join('');
 document.getElementById('customGearCategory').innerHTML=GEAR_CATEGORIES.map(([id,label])=>`<option value="${id}">${escapeHtml(label)}</option>`).join('');
 document.getElementById('customGearStatus').innerHTML=GEAR_STATUSES.map(([id,label])=>`<option value="${id}">${escapeHtml(label)}</option>`).join('')
}
function renderCustomSectionOptions(){
 const select=document.getElementById('customGearSection');if(!select)return;
 select.innerHTML=profileSections().map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml(s.title)}</option>`).join('')
}
function addCustomGear(event){
 event.preventDefault();
 const name=document.getElementById('customGearName').value.trim();
 if(!name){toast('Enter a gear name');return}
 const id=`custom-${Date.now()}`;
 const weightRaw=document.getElementById('customGearWeight').value;
 gearLocker[id]={
  id,name,custom:true,
  category:document.getElementById('customGearCategory').value,
  status:document.getElementById('customGearStatus').value,
  location:document.getElementById('customGearSection').value||'main',
  weightOz:weightRaw===''?null:Number(weightRaw),
  note:document.getElementById('customGearNote').value.trim()
 };
 if(!customPack[packProfileId])customPack[packProfileId]=[];
 customPack[packProfileId].push({sectionId:document.getElementById('customGearSection').value,itemId:id,required:true});
 saveGearLocker();saveCustomPack();event.target.reset();renderGearLocker();renderPackBuilder();readiness();renderNextAction();toast('Gear item saved')
}
function deleteCustomGear(id){
 const item=gearLocker[id];if(!item?.custom)return;
 if(!confirm(`Delete "${item.name}" from the Gear Locker and all presets?`))return;
 delete gearLocker[id];
 Object.keys(customPack).forEach(profile=>customPack[profile]=customPack[profile].filter(x=>x.itemId!==id));
 Object.keys(packState).forEach(key=>{if(key.endsWith(`:${id}`))delete packState[key]});
 saveGearLocker();saveCustomPack();savePackState();renderGearLocker();renderPackBuilder();readiness();renderNextAction()
}
function resetActivePack(){
 if(!confirm(`Clear packed/confirmed checks for ${PACK_PRESETS[packProfileId].title}?`))return;
 Object.keys(packState).forEach(key=>{if(key.startsWith(`${packProfileId}:`))delete packState[key]});
 savePackState();renderPackBuilder();readiness();renderNextAction()
}
function setupGearBuilder(){
 migrateLegacyPacking();renderGearSelects();renderPackBuilder();renderGearLocker();
 document.getElementById('packProfile').addEventListener('change',event=>{
  packProfileId=event.target.value;storageSet(PACK_PROFILE_KEY,packProfileId);
  renderPackBuilder();readiness();renderNextAction()
 });
 document.getElementById('packSections').addEventListener('change',event=>{
  const key=event.target.dataset.packCheck;if(!key)return;
  packState[key]=event.target.checked;savePackState();renderPackSummary();readiness();renderNextAction()
 });
 document.getElementById('gearSearch').addEventListener('input',renderGearLocker);
 document.getElementById('gearCategoryFilter').addEventListener('change',renderGearLocker);
 document.getElementById('gearLocker').addEventListener('change',event=>{
  const row=event.target.closest('[data-gear-id]');if(!row)return;
  const item=gearLocker[row.dataset.gearId];if(!item)return;
  if(event.target.matches('[data-gear-status]'))item.status=event.target.value;
  if(event.target.matches('[data-gear-location]'))item.location=event.target.value;
  if(event.target.matches('[data-gear-weight]'))item.weightOz=event.target.value===''?null:Number(event.target.value);
  saveGearLocker();renderPackBuilder();readiness()
 });
 document.getElementById('gearLocker').addEventListener('click',event=>{
  const button=event.target.closest('[data-delete-gear]');if(!button)return;
  deleteCustomGear(button.closest('[data-gear-id]').dataset.gearId)
 });
 document.getElementById('customGearForm').addEventListener('submit',addCustomGear);
 document.getElementById('resetActivePack').addEventListener('click',resetActivePack);
 document.getElementById('exportGearBackup').addEventListener('click',exportData);
 document.getElementById('importGearBackup').addEventListener('click',()=>document.getElementById('importBackupFile').click());
 document.getElementById('importBackupFile').addEventListener('change',event=>importBackupFile(event.target.files?.[0]))
}


const staticBoxes=[...document.querySelectorAll('input[type=checkbox][data-save]')];
const saved=safeParse(storageGet(CHECK_KEY),{});
staticBoxes.forEach((b,i)=>{const k=b.dataset.save||i;b.checked=!!saved[k];b.addEventListener('change',()=>{saved[k]=b.checked;storageSet(CHECK_KEY,JSON.stringify(saved));readiness();renderNextAction()})});
function readiness(){
 const pack=packCounts();
 const checked=pack.checked+staticBoxes.filter(b=>b.checked).length;
 const total=pack.total+staticBoxes.length;
 const pct=total?Math.round(checked/total*100):0;
 const pctEl=document.getElementById('readyPct'),bar=document.getElementById('readyBar');
 if(pctEl)pctEl.textContent=pct+'%';if(bar)bar.style.width=pct+'%';
 return pct
}
readiness();
function resetChecks(){
 if(confirm('Clear the active packing preset and communication checkmarks?')){
  staticBoxes.forEach(b=>b.checked=false);
  Object.keys(saved).forEach(k=>delete saved[k]);storageRemove(CHECK_KEY);
  Object.keys(packState).forEach(key=>{if(key.startsWith(`${packProfileId}:`))delete packState[key]});
  savePackState();renderPackBuilder();readiness();renderNextAction()
 }
}

function renderPeaks(filter=''){
 const q=filter.toLowerCase(),wrap=document.getElementById('peakList');
 wrap.innerHTML=PEAKS.filter(p=>(p.name+' '+p.range+' '+p.status).toLowerCase().includes(q)).map(p=>`<div class="peak ${p.status==='Completed'?'done':'goal'}"><b>${escapeHtml(p.name)}</b><small>${escapeHtml(p.range)} · ${escapeHtml(p.status)}</small></div>`).join('')
}
renderPeaks();document.getElementById('peakSearch').addEventListener('input',e=>renderPeaks(e.target.value));

const journal=document.getElementById('journalText');
journal.value=storageGet(JOURNAL_KEY)||'';
journal.addEventListener('input',()=>storageSet(JOURNAL_KEY,journal.value));
function exportData(){
 const data={
  schema:'don-downs-mountain-guide-backup-v6-6',
  exported:new Date().toISOString(),
  checks:safeParse(storageGet(CHECK_KEY),{}),
  intelligenceChecks:safeParse(storageGet(INTEL_CHECK_KEY),{}),
  reportReviews:safeParse(storageGet(REVIEW_KEY),{}),
  savedWeather:safeParse(storageGet(WEATHER_KEY),{}),
  selectedWeather:selectedWeatherId,
  weatherMode,
  journal:storageGet(JOURNAL_KEY)||'',
  gearLocker,
  packState,
  packProfile:packProfileId,
  customPack
 };
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),a=document.createElement('a');
 a.href=URL.createObjectURL(blob);a.download=`mountain-guide-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(a.href)
}
async function importBackupFile(file){
 if(!file)return;
 try{
  const data=JSON.parse(await file.text());
  if(!data||typeof data!=='object')throw new Error('Invalid backup');
  if(!confirm('Import this backup and replace saved app data on this device?'))return;
  if(data.checks)storageSet(CHECK_KEY,JSON.stringify(data.checks));
  if(data.intelligenceChecks)storageSet(INTEL_CHECK_KEY,JSON.stringify(data.intelligenceChecks));
  if(data.reportReviews)storageSet(REVIEW_KEY,JSON.stringify(data.reportReviews));
  if(data.savedWeather)storageSet(WEATHER_KEY,JSON.stringify(data.savedWeather));
  if(data.selectedWeather)storageSet(WEATHER_SELECTED_KEY,data.selectedWeather);
  if(data.weatherMode)storageSet(WEATHER_MODE_KEY,data.weatherMode);
  if(typeof data.journal==='string')storageSet(JOURNAL_KEY,data.journal);
  if(data.gearLocker)storageSet(GEAR_LOCKER_KEY,JSON.stringify(data.gearLocker));
  if(data.packState)storageSet(PACK_STATE_KEY,JSON.stringify(data.packState));
  if(data.packProfile&&PACK_PRESETS[data.packProfile])storageSet(PACK_PROFILE_KEY,data.packProfile);
  if(data.customPack)storageSet(CUSTOM_PACK_KEY,JSON.stringify(data.customPack));
  toast('Backup imported — reloading');
  setTimeout(()=>location.reload(),500)
 }catch(error){
  console.error(error);toast('That file is not a valid Mountain Guide backup')
 }finally{
  const input=document.getElementById('importBackupFile');if(input)input.value=''
 }
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
 const firstRisk=scanFirstRisk(target);
 return {available:true,minTemp:Math.min(...temps),maxTemp:Math.max(...temps),maxPop:pops.length?Math.max(...pops):null,maxWind:winds.length?Math.max(...winds):0,conditions,samples:target.filter((_,i)=>i%step===0).slice(0,4),alerts:alertNames,sourceUpdatedAt,firstRisk}
}
// First hour in the summit window whose listed weather crosses a hard-decision threshold.
// Computed while online and stored, so the turnaround check works offline at camp.
function scanFirstRisk(periods){
 const hit=periods.find(p=>{
  const s=(p.condition||'').toLowerCase();
  return /thunder|storm|lightning/.test(s)||(Number.isFinite(p.pop)&&p.pop>=40)||(Number.isFinite(p.windMph)&&p.windMph>=30)
 });
 if(!hit)return null;
 const reasons=[];const s=(hit.condition||'').toLowerCase();
 if(/thunder|storm|lightning/.test(s))reasons.push('thunderstorm wording');
 if(Number.isFinite(hit.pop)&&hit.pop>=40)reasons.push(hit.pop+'% precip');
 if(Number.isFinite(hit.windMph)&&hit.windMph>=30)reasons.push(hit.windMph+' mph wind');
 return {startTime:hit.startTime,reason:reasons.join(', ')}
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
 const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
 const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const nudge=document.getElementById('installNudge');
 const dismiss=document.getElementById('dismissInstall');
 if(!nudge||!dismiss)return;
 nudge.hidden=standalone||!isIOS||storageGet(INSTALL_DISMISSED_KEY)==='1';
 dismiss.addEventListener('click',event=>{
  event.preventDefault();event.stopPropagation();
  storageSet(INSTALL_DISMISSED_KEY,'1');
  nudge.hidden=true
 })
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
// Parse an objective turnaround label ('11:30 AM') to a decimal Mountain-Time hour.
function turnHour(label){const m=String(label).match(/(\d+):(\d+)\s*(AM|PM)/i);if(!m)return null;let h=+m[1]%12;if(/pm/i.test(m[3]))h+=12;return h+(+m[2])/60}
// Compare the stored first-risk hour against the planned turnaround. Never returns "safe".
function turnaroundCheck(obj,item){
 const trip=item?.trip;
 if(!item?.fetchedAt||!trip)return {level:'none',text:'No saved forecast yet. Refresh while online to carry the turnaround check offline.'};
 if(!trip.available)return {level:'none',text:'Summit day is outside the NWS hourly horizon. The turnaround still governs — this check activates once the forecast reaches the trip.'};
 const risk=trip.firstRisk;
 if(!risk)return {level:'none',text:`The saved forecast does not list a thunderstorm, ≥40% precipitation, or ≥30 mph wind threshold before or around the ${obj.turn} turnaround. That is not an all-clear — actual sky, cloud growth, wind, terrain, pace, and the group still govern the decision.`};
 const rp=denverParts(risk.startTime),riskH=rp.hour+rp.minute/60,turn=turnHour(obj.turn);
 const ap=rp.hour>=12?'PM':'AM',h12=rp.hour%12||12,clock=`${h12}:${String(rp.minute).padStart(2,'0')} ${ap}`;
 if(turn==null)return {level:'watch',text:`Forecast risk (${risk.reason}) is listed around ${clock}. Compare it against your turnaround and favor the earlier time.`};
 const diff=riskH-turn,mag=Math.abs(diff),hh=Math.floor(mag),mm=Math.round((mag-hh)*60),span=`${hh?hh+'h ':''}${mm?mm+'m':''}`.trim()||'under an hour';
 if(diff>=1)return {level:'watch',text:`Forecast risk (${risk.reason}) first appears ${clock}, about ${span} after your ${obj.turn} turnaround. Margin is thin — consider turning earlier.`};
 if(diff>=0)return {level:'warn',text:`Forecast risk (${risk.reason}) appears ${clock}, right at your ${obj.turn} turnaround. Little or no margin — plan to be descending before this.`};
 return {level:'danger',text:`Forecast risk (${risk.reason}) appears ${clock}, BEFORE your ${obj.turn} turnaround. The listed weather turns before your planned turnaround — reconsider the start time or the objective.`};
}
function renderFocus(){const obj=focusSpec(),x=lightData(),item=weatherStore[obj.weatherId],weather=document.getElementById('focusWeather');document.getElementById('focusObjective').value=obj.id;document.getElementById('focusStart').textContent=obj.start;document.getElementById('focusTurn').textContent=obj.turn;document.getElementById('focusLight').textContent=mtTime(x.dawn);document.getElementById('focusLightNote').textContent=`Astronomical flat-horizon time for ${x.loc.name}; in the basin, plan on headlamps well past sunrise — direct light over the east ridge comes considerably later.`;document.getElementById('focusIntent').textContent=obj.intent;document.getElementById('focusRouteText').textContent=obj.route;const tc=turnaroundCheck(obj,item),tcEl=document.getElementById('focusTurnCheck');if(tcEl){tcEl.dataset.level=tc.level;tcEl.textContent=tc.text}document.getElementById('focusLinks').innerHTML=obj.links.map(([label,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(label)} ↗</a>`).join('');if(item?.current){const c=item.current,flags=planningFlags(item).slice(0,2);weather.innerHTML=`<div class="focus-weather-grid"><div class="focus-weather-temp">${c.temp}°</div><div><b>${escapeHtml(c.condition)}</b><small>${escapeHtml(c.windDirection)} ${c.windMph||0} mph · ${Number.isFinite(c.pop)?c.pop+'% precip.':'precip. unknown'} · saved ${formatStamp(item.fetchedAt,false)}</small><div class="weather-flags">${flags.map(f=>`<span class="weather-flag ${f.type}">${escapeHtml(f.label)}</span>`).join('')}</div></div></div>`}else weather.innerHTML='<span class="weather-pulse"></span><div><b>No saved forecast yet</b><small>Refresh while online to carry it offline.</small></div>'}
function openFocus(id){if(id&&FOCUS_OBJECTIVES[id])focusObjectiveId=id;storageSet(FOCUS_OBJECTIVE_KEY,focusObjectiveId);renderFocus();startFocusCountdown();const overlay=document.getElementById('focusOverlay');overlay.hidden=false;document.body.style.overflow='hidden';setTimeout(()=>document.getElementById('focusObjective').focus(),0)}
function closeFocus(){document.getElementById('focusOverlay').hidden=true;document.body.style.overflow='';stopFocusCountdown()}

// Turnaround countdown — a discipline timer against your OWN fixed turnaround
// clock, not a weather trigger. Runs only while the Focus panel is open; no
// background code and no notifications. Every prompt hands the decision back.
let focusCountdownTimer=null;
function turnInstant(obj){
 // Build the objective's turnaround as a Mountain-Time instant. MDT is -06:00 in August.
 const t=turnHour(obj.turn);if(t==null)return null;
 const h=Math.floor(t),m=Math.round((t-h)*60);
 return new Date(`${obj.date}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00-06:00`);
}
function renderCountdown(){
 const el=document.getElementById('focusCountdown');if(!el)return;
 const obj=focusSpec(),turn=turnInstant(obj);
 if(!turn){el.hidden=true;return}
 const mins=(turn.getTime()-Date.now())/60000;
 // Only show inside a sensible same-day window (from 6h before to 3h after the turnaround).
 if(mins>360||mins<-180){el.hidden=true;return}
 el.hidden=false;
 const past=mins<0,am=Math.abs(mins),hh=Math.floor(am/60),mm=Math.floor(am%60);
 const span=`${hh?hh+'h ':''}${mm}m`;
 let level,text;
 if(past){level='past';text=`You are ${span} PAST your ${obj.turn} agreed turnaround. Are you descending? If not, why not?`}
 else if(mins<=15){level='now';text=`${span} to your ${obj.turn} turnaround. What do cloud growth, your pace, and the group tell you to do now?`}
 else if(mins<=30){level='warn';text=`${span} to your ${obj.turn} turnaround. What do the weather, your pace, and the group say about turning before the deadline?`}
 else if(mins<=60){level='watch';text=`${span} to your ${obj.turn} turnaround. Where are you now, and how much margin do you truly have?`}
 else{level='idle';text=`${span} to your ${obj.turn} agreed turnaround. What do the sky and your actual progress say about the margin?`}
 el.dataset.level=level;el.textContent=text;
}
function startFocusCountdown(){stopFocusCountdown();renderCountdown();focusCountdownTimer=setInterval(renderCountdown,30000)}
function stopFocusCountdown(){if(focusCountdownTimer){clearInterval(focusCountdownTimer);focusCountdownTimer=null}}
function toggleCampfire(){document.documentElement.classList.toggle('campfire-mode');const on=document.documentElement.classList.contains('campfire-mode');storageSet(CAMPFIRE_KEY,on?'1':'0');document.querySelectorAll('#campfireHero,#toggleCampfireSection,#focusCampfire').forEach(b=>{if(b)b.textContent=on?'Return to color':'Night vision'});toast(on?'Night-vision display enabled':'Standard display restored')}
function setupV6(){if(storageGet(CAMPFIRE_KEY)==='1')document.documentElement.classList.add('campfire-mode');toggleCampfireStateText();renderLightBoard();renderFocus();document.getElementById('lightObjective').addEventListener('change',e=>{focusObjectiveId=e.target.value;storageSet(FOCUS_OBJECTIVE_KEY,focusObjectiveId);renderLightBoard();renderFocus()});document.getElementById('focusObjective').addEventListener('change',e=>{focusObjectiveId=e.target.value;storageSet(FOCUS_OBJECTIVE_KEY,focusObjectiveId);renderLightBoard();renderFocus();renderCountdown()});['openFocusHero','openFocusSection','focusFab'].forEach(id=>document.getElementById(id)?.addEventListener('click',()=>openFocus()));document.getElementById('closeFocus').addEventListener('click',closeFocus);document.getElementById('focusOverlay').addEventListener('click',e=>{if(e.target.id==='focusOverlay')closeFocus()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('focusOverlay').hidden)closeFocus()});['campfireHero','toggleCampfireSection','focusCampfire'].forEach(id=>document.getElementById(id)?.addEventListener('click',toggleCampfire));document.getElementById('focusToday').addEventListener('click',()=>{closeFocus();document.getElementById(focusSpec().dayId)?.scrollIntoView({behavior:'smooth',block:'start'})});document.getElementById('focusRefresh').addEventListener('click',async()=>{const id=focusSpec().weatherId;if(!navigator.onLine){toast('Offline — showing saved forecast');return}try{await refreshLocation(id,{force:true});renderFocus();toast('Focus forecast refreshed')}catch{}});const revealObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.08}):null;document.querySelectorAll('main>section').forEach((s,i)=>{if(i>0){s.classList.add('reveal');if(revealObserver)revealObserver.observe(s);else s.classList.add('visible')}})}
function toggleCampfireStateText(){const on=document.documentElement.classList.contains('campfire-mode');document.querySelectorAll('#campfireHero,#toggleCampfireSection,#focusCampfire').forEach(b=>{if(b)b.textContent=on?'Return to color':'Night vision'})}



// Version 6.3 — safe AI companion.
// This public GitHub Pages app never contains an API key. It prepares a
// context-aware prompt, copies it locally, and opens ChatGPT for the user.
const AI_DRAFT_KEY='ddmg-v6-ai-draft';

function aiSelectedObjective(){
 const obj=focusSpec();
 return `${obj.label}; planned start ${obj.start}; turnaround/exit ${obj.turn}; ${obj.intent}`;
}
function aiWeatherSummary(){
 const spec=locationById(selectedWeatherId),item=weatherStore[selectedWeatherId];
 if(!item?.current)return `${spec.name}: no saved forecast is available on this device.`;
 const c=item.current,flags=planningFlags(item).map(x=>x.label).join('; ');
 return [
  `${spec.name} (${spec.elevationFt.toLocaleString()} ft)`,
  `${c.temp}°F, ${c.condition}`,
  `wind ${c.windDirection||'—'} ${c.windMph||0} mph`,
  `${Number.isFinite(c.pop)?c.pop+'% precipitation probability':'precipitation probability unknown'}`,
  `forecast fetched ${formatStamp(item.fetchedAt,true)}`,
  `planning flags: ${flags}`
 ].join(' · ');
}
function aiContextText(){
 const includeContext=document.getElementById('aiIncludeContext')?.checked;
 const includeWeather=document.getElementById('aiIncludeWeather')?.checked;
 if(!includeContext)return 'No Mountain Guide context selected. Treat this as a general question.';
 const nextTitle=document.getElementById('nextActionTitle')?.textContent?.trim()||'Not available';
 const nextText=document.getElementById('nextActionText')?.textContent?.trim()||'';
 const lines=[
  'MOUNTAIN GUIDE CONTEXT',
  'App: Don Downs Mountain Guide, Version 6.7',
  'Trip: Lake Como / Blanca / Ellingwood / Mount Lindsey, August 19–25, 2026',
  `Selected objective: ${aiSelectedObjective()}`,
  `Readiness: ${readiness()}% of saved gear and communication checks`,
  `Next app action: ${nextTitle}${nextText?' — '+nextText:''}`,
  'Standing rule: weather is evidence, not permission; actual sky, wind, terrain, access, and group condition govern decisions.'
 ];
 if(includeWeather)lines.push(`Saved weather: ${aiWeatherSummary()}`);
 else lines.push('Saved weather: not included.');
 return lines.join('\n');
}
function aiPreparedPrompt(){
 const question=document.getElementById('aiQuestion')?.value?.trim()||'';
 const context=aiContextText();
 return `${context}

USER QUESTION
${question}

RESPONSE STANDARD
Be concise but complete. Separate observed app data from inference. State uncertainty. Do not present AI output as rescue guidance, medical clearance, route authorization, or a go/no-go mountain decision.`;
}
function renderAiPreview(){
 const preview=document.getElementById('aiContextPreview');
 const status=document.getElementById('aiContextStatus');
 const includeContext=document.getElementById('aiIncludeContext')?.checked;
 const includeWeather=document.getElementById('aiIncludeWeather');
 if(includeWeather)includeWeather.disabled=!includeContext;
 if(preview)preview.textContent=aiContextText();
 if(status)status.textContent=includeContext
  ?`Selected objective, ${readiness()}% readiness, next action${includeWeather?.checked?', and saved weather':''}.`
  :'General-question mode; Mountain Guide context will not be included.';
}
function openAi(){
 const overlay=document.getElementById('aiOverlay');
 overlay.hidden=false;
 document.body.style.overflow='hidden';
 const off=document.getElementById('aiOfflineNote');if(off)off.hidden=navigator.onLine;
 renderAiPreview();
 setTimeout(()=>document.getElementById('aiQuestion')?.focus(),0);
}
function closeAi(){
 document.getElementById('aiOverlay').hidden=true;
 document.body.style.overflow='';
}
async function copyAiPrompt(){
 const prompt=aiPreparedPrompt();
 const question=document.getElementById('aiQuestion')?.value?.trim();
 if(!question){toast('Enter a question first');document.getElementById('aiQuestion')?.focus();return false}
 try{
  await navigator.clipboard.writeText(prompt);
 }catch{
  const area=document.createElement('textarea');
  area.value=prompt;area.setAttribute('readonly','');area.style.position='fixed';area.style.opacity='0';
  document.body.appendChild(area);area.select();
  const ok=document.execCommand('copy');area.remove();
  if(!ok){toast('Could not copy the question');return false}
 }
 toast('Question and context copied');
 return true
}
function setupAi(){
 const question=document.getElementById('aiQuestion');
 question.value=storageGet(AI_DRAFT_KEY)||'';
 document.getElementById('aiFab').addEventListener('click',openAi);
 document.getElementById('closeAi').addEventListener('click',closeAi);
 document.getElementById('aiOverlay').addEventListener('click',e=>{if(e.target.id==='aiOverlay')closeAi()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.getElementById('aiOverlay').hidden)closeAi()});
 question.addEventListener('input',()=>storageSet(AI_DRAFT_KEY,question.value));
 document.querySelectorAll('[data-ai-prompt]').forEach(button=>button.addEventListener('click',()=>{
  const general=button.dataset.aiGeneral==='true';
  document.getElementById('aiIncludeContext').checked=!general;
  question.value=button.dataset.aiPrompt||'';
  storageSet(AI_DRAFT_KEY,question.value);
  renderAiPreview();
  question.focus();
 }));
 ['aiIncludeContext','aiIncludeWeather'].forEach(id=>document.getElementById(id).addEventListener('change',renderAiPreview));
 document.getElementById('aiCopyOnly').addEventListener('click',copyAiPrompt);
 document.getElementById('aiOpenChat').addEventListener('click',async()=>{
  if(!await copyAiPrompt())return;
  const opened=window.open('https://chatgpt.com/','_blank','noopener,noreferrer');
  if(!opened)toast('Question copied — open ChatGPT and paste it');
  else{closeAi();toast('Paste the copied question into ChatGPT')}
 });
 renderAiPreview();
}



// Version 6.7 — chronological personal Mountain Stories.
const MOUNTAIN_STORIES={
 massive:{
  title:'Mount Massive',
  kicker:'A sunrise summit with Caleb',
  photos:[
   {src:'massive-01-trailhead.jpg',alt:'Don and Caleb together at the trailhead before beginning Mount Massive',caption:'At the trailhead—Caleb and me before the climb began.'},
   {src:'massive-02-sunrise-silhouette.jpg',alt:'A silhouetted climber watching the sun rise above a sea of clouds on Mount Massive',caption:'First light breaking over a sea of clouds.'},
   {src:'massive-03-caleb-camera.jpg',alt:'Caleb standing in the distance using his camera high on Mount Massive',caption:'Caleb pausing high on the route to make one of his photographs.'},
   {src:'massive-04-outcrop.jpg',alt:'Don standing on a sunlit rocky outcropping high on Mount Massive',caption:'The mountain turning gold around the rocky outcropping.'},
   {src:'massive-05-summit-together.jpg',alt:'Don and Caleb together in jackets near the summit of Mount Massive',caption:'Together at the summit—our first and only sunrise summit.'}
  ]
 },
 'holy-cross':{
  title:'Mount of the Holy Cross',
  kicker:'High above the Holy Cross basin',
  photos:[
   {src:'holy-cross-01-approach-landscape.jpg',alt:'A wide alpine landscape on the approach to Mount of the Holy Cross',caption:'The long approach opening toward the high country.'},
   {src:'holy-cross-02-peak-ahead.jpg',alt:'Mount of the Holy Cross framed by evergreen trees from the trail',caption:'The mountain coming into view through the trees.'},
   {src:'holy-cross-03-steep-basin-view.jpg',alt:'A steep rocky view down into the Holy Cross basin and lake',caption:'Looking down through the steep rock into the basin below.'},
   {src:'holy-cross-04-summit-portrait.jpg',alt:'Don standing on Mount of the Holy Cross with the basin and lake far below',caption:'On the summit above the basin—steep, beautiful, and unforgettable.'},
   {src:'holy-cross-05-forest-descent.jpg',alt:'A forest trail on the descent from Mount of the Holy Cross',caption:'Back into the forest on the way down.'}
  ]
 },
 princeton:{
  title:'Mount Princeton',
  kicker:'A family summit and unforgettable news',
  photos:[
   {src:'princeton-01-trailhead-family.jpg',alt:'Don, Vonda, Caleb, Shelby, Marin, and LinZhi together at the Mount Princeton trailhead',caption:'All together at the trailhead before the climb.'},
   {src:'princeton-02-don-vonda-ascent.jpg',alt:'Don and Vonda together on the ascent of Mount Princeton',caption:'Vonda and me together on the ascent.'},
   {src:'princeton-03-caleb-shelby-trail.jpg',alt:'Caleb and Shelby together on the Mount Princeton trail',caption:'Caleb and Shelby higher on the route.'},
   {src:'princeton-04-family-high-route.jpg',alt:'Caleb, Shelby, Marin, and LinZhi together high on Mount Princeton',caption:'The kids together high on the mountain.'},
   {src:'princeton-05-family-summit-announcement.jpg',alt:'The family together on the summit of Mount Princeton holding a Mount Princeton sign',caption:'At the summit, we flipped the sign and read: “Welcome Baby Downs — April 2020!”'},
   {src:'princeton-06-don-vonda-summit.jpg',alt:'Don and Vonda together on the summit of Mount Princeton',caption:'Vonda and me together at the summit.'}
  ]
 }
};
let activeStoryId=null,activeStoryIndex=0,storyTouchStartX=0;

function renderStory(){
 const story=MOUNTAIN_STORIES[activeStoryId];
 if(!story)return;
 const photo=story.photos[activeStoryIndex];
 document.getElementById('storyTitle').textContent=story.title;
 document.getElementById('storyKicker').textContent=story.kicker;
 const image=document.getElementById('storyImage');
 image.src=photo.src;
 image.alt=photo.alt;
 document.getElementById('storyCounter').textContent=`${activeStoryIndex+1} / ${story.photos.length}`;
 document.getElementById('storyCaption').textContent=photo.caption;
 const dots=document.getElementById('storyDots');
 dots.innerHTML=story.photos.map((_,index)=>`<button type="button" data-story-index="${index}" class="${index===activeStoryIndex?'active':''}" aria-label="Open photograph ${index+1}" ${index===activeStoryIndex?'aria-current="true"':''}></button>`).join('');
}
function openStory(id){
 if(!MOUNTAIN_STORIES[id])return;
 activeStoryId=id;activeStoryIndex=0;
 document.getElementById('storyOverlay').hidden=false;
 document.body.style.overflow='hidden';
 renderStory();
 document.getElementById('storyClose').focus()
}
function closeStory(){
 document.getElementById('storyOverlay').hidden=true;
 document.body.style.overflow='';
 const trigger=document.querySelector(`[data-story="${activeStoryId}"]`);
 activeStoryId=null;
 trigger?.focus()
}
function stepStory(delta){
 const story=MOUNTAIN_STORIES[activeStoryId];if(!story)return;
 activeStoryIndex=(activeStoryIndex+delta+story.photos.length)%story.photos.length;
 renderStory()
}
function setupStories(){
 document.querySelectorAll('[data-story]').forEach(button=>button.addEventListener('click',()=>openStory(button.dataset.story)));
 document.getElementById('storyClose').addEventListener('click',closeStory);
 document.getElementById('storyPrev').addEventListener('click',()=>stepStory(-1));
 document.getElementById('storyNext').addEventListener('click',()=>stepStory(1));
 document.getElementById('storyDots').addEventListener('click',event=>{
  const button=event.target.closest('[data-story-index]');if(!button)return;
  activeStoryIndex=Number(button.dataset.storyIndex);renderStory()
 });
 document.getElementById('storyOverlay').addEventListener('click',event=>{if(event.target.id==='storyOverlay')closeStory()});
 document.addEventListener('keydown',event=>{
  if(document.getElementById('storyOverlay').hidden)return;
  if(event.key==='Escape')closeStory();
  if(event.key==='ArrowLeft')stepStory(-1);
  if(event.key==='ArrowRight')stepStory(1)
 });
 const image=document.getElementById('storyImage');
 image.addEventListener('touchstart',event=>{storyTouchStartX=event.changedTouches[0].clientX},{passive:true});
 image.addEventListener('touchend',event=>{
  const delta=event.changedTouches[0].clientX-storyTouchStartX;
  if(Math.abs(delta)>45)stepStory(delta<0?1:-1)
 },{passive:true})
}

document.documentElement.classList.remove('field-mode');storageRemove('ddmg-v3-field');
document.getElementById('nextActionPrimary').addEventListener('click',runNextAction);
document.getElementById('shareStatusBtn').addEventListener('click',shareStatus);
document.getElementById('shareIntelBtn').addEventListener('click',shareStatus);
const initialNav=document.querySelector('.bottom-nav a.active');if(initialNav)initialNav.setAttribute('aria-current','page');
setupGearBuilder();setupWeatherWidget();setupInstallNudge();setupBottomNav();setupStories();
renderAllWeather();renderReviews();updateIntelCheckProgress();updateIntelOverall();renderNextAction();setupV6();setupAi();
