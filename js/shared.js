/* Shared release configuration — single source of truth for full guide and field mode. */
(()=>{
  'use strict';
  const config={
    version:globalThis.DDMG_VERSION||'unknown',
    storageKeys:{
      weather:'ddmg-v4-weather',
      focusObjective:'ddmg-v6-focus-objective',
      tripLibrary:'ddmg-v9-trip-library',
      activeTrip:'ddmg-v9-active-trip',
      fieldChecks:'ddmg-v15-3-field-checks',
      fieldDisplay:'ddmg-v15-3-field-display',
      fieldUpdateNote:'ddmg-v15-3-field-update-note',
      personalEmergencyContact:'ddmg-personal-emergency-contact'
    },
    personalContactLabel:'Vonda',
    emergencyAreas:{
      alamosa:{
        id:'alamosa',county:'Alamosa County',sheriff:'Alamosa County Sheriff’s Office',
        dispatchPhone:'+17195895807',dispatchDisplay:'719-589-5807',dispatchLabel:'County dispatch',
        officePhone:'+17195896608',officeDisplay:'719-589-6608',officeLabel:'Sheriff’s office',
        sarTeam:'Alamosa Volunteer Search and Rescue',
        activation:'Call 911 for an emergency. Alamosa County Dispatch activates the county SAR response.',
        verifiedOn:'2026-08-05',sourceUrl:'https://www.alamosacounty.org/185/Sheriff',sarSourceUrl:'https://www.avsar.us/'
      },
      huerfano:{
        id:'huerfano',county:'Huerfano County',sheriff:'Huerfano County Sheriff’s Office',
        dispatchPhone:'+17197381044',dispatchDisplay:'719-738-1044',dispatchLabel:'County dispatch',
        officePhone:'+17197381600',officeDisplay:'719-738-1600',officeLabel:'Sheriff’s office',
        sarTeam:'Huerfano County backcountry search and rescue response',
        activation:'Call 911 for an emergency. Huerfano County Dispatch coordinates the county response.',
        verifiedOn:'2026-08-05',sourceUrl:'https://huerfano.us/sheriff/',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      },
      pitkin:{
        id:'pitkin',county:'Pitkin County',sheriff:'Pitkin County Sheriff’s Office',
        dispatchPhone:'+19709205310',dispatchDisplay:'970-920-5310',dispatchLabel:'Regional emergency dispatch',
        officePhone:'+19709205300',officeDisplay:'970-920-5300',officeLabel:'Sheriff’s office',
        sarTeam:'Mountain Rescue Aspen / Pitkin County backcountry response',
        activation:'Call 911 for an emergency. Pitkin County Regional Emergency Dispatch coordinates the response.',
        verifiedOn:'2026-08-04',sourceUrl:'https://www.pitkincounty.com/337/Emergency-Dispatch',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      },
      hinsdale:{
        id:'hinsdale',county:'Hinsdale County',sheriff:'Hinsdale County Sheriff’s Office',
        dispatchPhone:'+19709442291',dispatchDisplay:'970-944-2291',dispatchLabel:'Sheriff / non-emergency',
        officePhone:'',officeDisplay:'',officeLabel:'',
        sarTeam:'Hinsdale County Search and Rescue',
        activation:'Call 911 for an emergency. The Hinsdale County Sheriff coordinates search and rescue.',
        verifiedOn:'2026-08-04',sourceUrl:'https://hinsdalecounty.colorado.gov/sheriff-6',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      },
      ouray:{
        id:'ouray',county:'Ouray County',sheriff:'Ouray County Sheriff’s Office',
        dispatchPhone:'+19702499110',dispatchDisplay:'970-249-9110',dispatchLabel:'Non-emergency dispatch',
        officePhone:'+19703257272',officeDisplay:'970-325-7272',officeLabel:'Sheriff’s office',
        sarTeam:'Ouray Mountain Rescue',
        activation:'Call 911 for an emergency. Ouray County dispatch coordinates sheriff and search-and-rescue response.',
        verifiedOn:'2026-08-04',sourceUrl:'https://www.ouraycountyco.gov/152/Sheriff',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      },
      dolores:{
        id:'dolores',county:'Dolores County',sheriff:'Dolores County Sheriff’s Office',
        dispatchPhone:'+19706772257',dispatchDisplay:'970-677-2257',dispatchLabel:'Sheriff / non-emergency',
        officePhone:'',officeDisplay:'',officeLabel:'',
        sarTeam:'Dolores County Search and Rescue response',
        activation:'Call 911 for an emergency. Dolores County Sheriff’s Office activates the county response.',
        verifiedOn:'2026-08-04',sourceUrl:'https://www.cortezco.gov/212/Victim-Services',sarSourceUrl:'https://www.cortezco.gov/358/Cortez-Communications-Center'
      },
      laplata:{
        id:'laplata',county:'La Plata County',sheriff:'La Plata County Sheriff’s Office',
        dispatchPhone:'+19703852900',dispatchDisplay:'970-385-2900',dispatchLabel:'Non-emergency dispatch',
        officePhone:'',officeDisplay:'',officeLabel:'',
        sarTeam:'La Plata County Search and Rescue',
        activation:'Call 911 for an emergency. Durango Emergency Communications dispatches La Plata County Sheriff and Search and Rescue.',
        verifiedOn:'2026-08-04',sourceUrl:'https://www.durangoco.gov/217/911-Communications',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      },
      saguache:{
        id:'saguache',county:'Saguache County',sheriff:'Saguache County Sheriff’s Office',
        dispatchPhone:'+17196552544',dispatchDisplay:'719-655-2544',dispatchLabel:'Sheriff / non-emergency',
        officePhone:'',officeDisplay:'',officeLabel:'',
        sarTeam:'Saguache County backcountry search and rescue response',
        activation:'Call 911 for an emergency. The Saguache County Sheriff coordinates the county response.',
        verifiedOn:'2026-08-04',sourceUrl:'https://saguachecounty.colorado.gov/departments/sheriff',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      },
      custer:{
        id:'custer',county:'Custer County',sheriff:'Custer County Sheriff’s Office',
        dispatchPhone:'+17192765555',dispatchDisplay:'719-276-5555, ext. 8',dispatchLabel:'Non-emergency dispatch',
        officePhone:'+17197832270',officeDisplay:'719-783-2270',officeLabel:'Sheriff’s office',
        sarTeam:'Custer County Search and Rescue',
        activation:'Call 911 for an emergency. Non-emergency dispatch and the sheriff coordinate the county response.',
        verifiedOn:'2026-08-04',sourceUrl:'https://custercounty-co.gov/government/elected-officials/sheriffs-office/',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      },
      costilla:{
        id:'costilla',county:'Costilla County',sheriff:'Costilla County Sheriff’s Office',
        dispatchPhone:'+17196723302',dispatchDisplay:'719-672-3302',dispatchLabel:'County dispatch',
        officePhone:'+17196720673',officeDisplay:'719-672-0673',officeLabel:'Sheriff’s office',
        sarTeam:'Costilla County backcountry search and rescue response',
        activation:'Call 911 for an emergency. Costilla County Dispatch coordinates the county response.',
        verifiedOn:'2026-08-05',sourceUrl:'https://www.costillacounty.gov/sheriff',sarSourceUrl:'https://coloradosar.org/sar-county-map/'
      }
    },
    peakEmergencyAreas:{
      'Castle Peak':'pitkin','Conundrum Peak':'pitkin',
      'Uncompahgre Peak':'hinsdale','Wetterhorn Peak':'hinsdale','Redcloud Peak':'hinsdale','Sunshine Peak':'hinsdale',
      'Mount Sneffels':'ouray','Mount Wilson':'dolores','Mount Eolus':'laplata','San Luis Peak':'saguache',
      'Blanca Peak':'alamosa','Ellingwood Point':'alamosa','Little Bear Peak':'alamosa',
      'Humboldt Peak':'custer','Culebra Peak':'costilla','Mount Lindsey':'huerfano'
    },
    focusObjectives:{
      blanca:{
        id:'blanca',
        label:'Blanca + Ellingwood',
        fieldTitle:'Blanca Peak + Ellingwood Point',
        date:'2026-08-23',
        weatherId:'blanca',
        start:'4:15 AM',
        turn:'11:30 AM',
        intent:'Below exposed high terrain by late morning.',
        route:'The traverse is optional. Weather, rock, time, and every climber’s comfort decide the sequence.',
        detail:'Primary peak: Blanca Peak. Lake Como camp. Use the saved route plan and downloaded navigation; do not depend on cell service.',
        dayId:'sun',
        emergencyAreaId:'alamosa',
        emergencyAreaIds:['alamosa','costilla'],
        emergencyGuidance:'Lake Como and the Alamosa-side approach may involve Alamosa County; summit-area incidents may involve Costilla County.',
        links:[
          ['Combination route','https://www.14ers.com/route.php?route=elli3'],
          ['Peak conditions','https://www.14ers.com/php14ers/peakstatus_peak.php?peakparm=10004']
        ],
        fieldLinks:[
          ['Blanca route (14ers.com)','https://www.14ers.com/route.php?route=blan1'],
          ['Ellingwood route (14ers.com)','https://www.14ers.com/route.php?route=elli2'],
          ['Combination route (14ers.com)','https://www.14ers.com/route.php?route=elli3']
        ]
      },
      lake:{
        id:'lake',
        label:'Lake Como approach',
        fieldTitle:'Lake Como approach and camp',
        date:'2026-08-22',
        weatherId:'lake',
        start:'10:00 AM',
        turn:'3:30 PM',
        intent:'Reach camp with enough margin to recover, filter water, and prepare.',
        route:'Road clearance determines the starting point. Do not force the vehicle higher than conditions support.',
        detail:'Use the saved access plan and downloaded navigation. Vehicle clearance, road condition, weather, and driver judgment determine the actual starting point.',
        dayId:'sat',
        emergencyAreaId:'alamosa',
        emergencyAreaIds:['alamosa','costilla'],
        emergencyGuidance:'Lake Como and the Alamosa-side approach may involve Alamosa County; summit-area incidents on Blanca or Ellingwood may involve Costilla County.',
        links:[
          ['Trailhead status','https://www.14ers.com/php14ers/trailheadsview.php?thparm=sc01'],
          ['NWS point forecast','https://forecast.weather.gov/MapClick.php?lat=37.56960&lon=-105.51406']
        ],
        fieldLinks:[
          ['Lake Como trailhead status','https://www.14ers.com/php14ers/trailheadsview.php?thparm=sc01'],
          ['Lake Como forecast (NWS)','https://forecast.weather.gov/MapClick.php?lat=37.56960&lon=-105.51406']
        ]
      },
      lindsey:{
        id:'lindsey',
        label:'Mount Lindsey',
        fieldTitle:'Mount Lindsey',
        date:'2026-08-24',
        weatherId:'lindsey',
        start:'5:15 AM',
        turn:'12:00 PM',
        intent:'Summit early and return to the trailhead by early afternoon.',
        route:'Confirm access and waiver before departure. Route conditions and group judgment govern the climb.',
        detail:'Use the saved route plan and downloaded navigation. Confirm current access requirements before leaving service.',
        dayId:'mon',
        emergencyAreaId:'huerfano',
        emergencyAreaIds:['huerfano','costilla'],
        emergencyGuidance:'Lily Lake and trailhead-side incidents may involve Huerfano County; summit-area incidents may involve Costilla County.',
        links:[
          ['Standard route','https://www.14ers.com/route.php?route=lind1'],
          ['Required waiver','https://www.mountlindseywaiver.com/']
        ],
        fieldLinks:[
          ['Mount Lindsey route (14ers.com)','https://www.14ers.com/route.php?route=lind1'],
          ['Access waiver','https://www.mountlindseywaiver.com/']
        ]
      }
    }
  };
  window.DDMG_CONFIG=Object.freeze(config);
  const readLocalContact=()=>{
    try{
      const raw=localStorage.getItem(config.storageKeys.personalEmergencyContact);
      if(!raw)return {phone:'',email:''};
      const parsed=JSON.parse(raw)||{};
      return {phone:String(parsed.phone||'').trim(),email:String(parsed.email||'').trim()};
    }catch{return {phone:'',email:''}}
  };
  const normalizePhone=(value)=>{
    const raw=String(value||'').trim();
    if(!raw)return '';
    const digits=raw.replace(/\D/g,'');
    if(digits.length===10)return `+1${digits}`;
    if(digits.length===11&&digits.startsWith('1'))return `+${digits}`;
    return raw.startsWith('+')?`+${digits}`:digits;
  };
  const saveLocalContact=(value={})=>{
    const contact={phone:normalizePhone(value.phone),email:String(value.email||'').trim()};
    try{localStorage.setItem(config.storageKeys.personalEmergencyContact,JSON.stringify(contact));return contact}catch{return contact}
  };
  const clearLocalContact=()=>{
    try{localStorage.removeItem(config.storageKeys.personalEmergencyContact)}catch{}
    return {phone:'',email:''};
  };
  const emergencyAreaFor=(value)=>{
    const objective=typeof value==='string'?config.focusObjectives[value]:value;
    const areaId=objective?.emergencyAreaId||config.peakEmergencyAreas[objective?.peak||objective?.fieldTitle||value];
    return config.emergencyAreas[areaId]||null;
  };
  const emergencyAreasFor=(value)=>{
    const objective=typeof value==='string'?config.focusObjectives[value]:value;
    const areaIds=Array.isArray(objective?.emergencyAreaIds)&&objective.emergencyAreaIds.length
      ? objective.emergencyAreaIds
      : [objective?.emergencyAreaId||config.peakEmergencyAreas[objective?.peak||objective?.fieldTitle||value]].filter(Boolean);
    return [...new Set(areaIds)].map(id=>config.emergencyAreas[id]).filter(Boolean);
  };
  const emergencyGuidanceFor=(value)=>{
    const objective=typeof value==='string'?config.focusObjectives[value]:value;
    return objective?.emergencyGuidance||'Call 911 first and provide the exact incident location. Dispatchers determine the responding jurisdiction.';
  };
  const dateLabel=(value)=>{
    if(!value)return 'Not set';
    const d=new Date(`${value}T12:00:00`);
    return Number.isNaN(d.getTime())?value:new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(d);
  };
  const stampLabel=(value)=>{
    if(!value)return 'No saved forecast timestamp';
    const d=new Date(value);
    return Number.isNaN(d.getTime())?'Saved forecast timestamp unavailable':new Intl.DateTimeFormat('en-US',{timeZone:'America/Denver',month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'}).format(d);
  };
  const buildUpdate=({objective,forecast,trip,note=''})=>{
    const obj=objective||{};
    const areas=emergencyAreasFor(obj);
    const lines=[
      `Mountain Guide update — ${obj.label||obj.fieldTitle||trip?.peak||'mountain trip'}`,
      `Date: ${dateLabel(obj.date||trip?.climbDate)}`,
      `Planned start: ${obj.start||trip?.plannedStart||'Not set'}`,
      `Turnaround / exit: ${obj.turn||trip?.turnaround||'Not set'}`
    ];
    if(trip?.name)lines.push(`Trip: ${trip.name}`);
    if(trip?.partners||obj.partners)lines.push(`Partners: ${trip?.partners||obj.partners}`);
    if(obj.detail||obj.route)lines.push(`Objective: ${obj.detail||obj.route}`);
    if(areas.length){
      lines.push('Emergency: Call 911 first. Provide the exact location, mountain, route, elevation, and coordinates if available. Dispatchers determine the responding jurisdiction; you do not need to choose a county before calling.');
      lines.push(`Location context: ${emergencyGuidanceFor(obj)}`);
      areas.forEach(area=>{
        lines.push(`${area.county.replace(/ County$/,'')} ${area.dispatchLabel||'dispatch'}: ${area.dispatchDisplay}`);
        if(area.officeDisplay)lines.push(`${area.county} ${area.officeLabel||'sheriff’s office'}: ${area.officeDisplay}`);
      });
    }
    lines.push(`Forecast at last refresh: ${stampLabel(forecast?.fetchedAt)}`);
    if(note.trim())lines.push(`Status / location note: ${note.trim()}`);
    else lines.push('Status / location note: Add current status or location before sending.');
    lines.push('Saved planning information only—not a live safety confirmation.');
    return lines.join('\n');
  };
  const smsHref=(phone,body)=>{
    const separator=/iPhone|iPad|iPod/i.test(navigator.userAgent)?'&':'?';
    return `sms:${phone||''}${separator}body=${encodeURIComponent(body)}`;
  };
  const emailHref=(email,subject,body)=>`mailto:${email||''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.DDMG_EMERGENCY=Object.freeze({emergencyAreaFor,emergencyAreasFor,emergencyGuidanceFor,buildUpdate,smsHref,emailHref,dateLabel,stampLabel,readLocalContact,saveLocalContact,clearLocalContact});
  const applyVersion=()=>document.querySelectorAll('[data-app-version]').forEach(el=>{el.textContent=config.version});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyVersion,{once:true});else applyVersion();
})();
