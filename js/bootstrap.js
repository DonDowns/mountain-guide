function tripSetup(){
 tripLoadLibrary();
 tripRenderLibrary();
 tripApplyForm(tripActive()||tripBlank());
 document.getElementById('newTripBtn')?.addEventListener('click',tripNew);
 document.getElementById('saveTripBtn')?.addEventListener('click',tripSave);
 document.getElementById('loadTripBtn')?.addEventListener('click',()=>tripLoad(document.getElementById('tripLibrarySelect')?.value));
 document.getElementById('duplicateTripBtn')?.addEventListener('click',tripDuplicate);
 document.getElementById('deleteTripBtn')?.addEventListener('click',tripDelete);
 document.getElementById('resetTripFormBtn')?.addEventListener('click',()=>tripApplyForm(tripActive()||tripBlank()));
 document.getElementById('tripPeak')?.addEventListener('change',event=>{
  if(tripBuilderApplying)return;
  tripPopulateRoutes(event.target.value,'');
  const route=tripRouteById(document.getElementById('tripRoute')?.value);
  tripPopulateStarts(route,'');tripPopulateWeather(event.target.value,route,'','');tripRenderContext();
 });
 document.getElementById('tripRoute')?.addEventListener('change',event=>{
  if(tripBuilderApplying)return;
  const route=tripRouteById(event.target.value);
  tripPopulateStarts(route,'');tripPopulateWeather(document.getElementById('tripPeak')?.value,route,'','');tripRenderContext();
 });
 document.getElementById('tripStartPoint')?.addEventListener('change',tripRenderContext);
 document.querySelectorAll('#trip-builder input,#trip-builder textarea,#trip-builder select').forEach(el=>{
  if(['tripPeak','tripRoute','tripStartPoint','tripLibrarySelect'].includes(el.id))return;
  el.addEventListener(el.type==='checkbox'?'change':'input',()=>{tripRenderContext();tripRenderGeneratedPlan()});
 });
}
document.addEventListener('DOMContentLoaded',tripSetup);

