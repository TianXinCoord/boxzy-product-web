// Approved desktop layout. Assets and navigation stay local to this package.
(()=>{
 const art={'starter-box.png':'catalog/starter.png','super-box.png':'catalog/super.png','ultra-box.png':'catalog/ultra.png'};
 function repairArt(){document.querySelectorAll('img[src^="mobile-app/assets/"]').forEach(img=>{const name=img.getAttribute('src').split('/').pop();if(art[name])img.src='assets/boxzy/'+art[name];});}
 const hero=document.querySelector('.support-home-hero');
 if(hero){
  const contact=hero.querySelector('.email-card');const grid=document.querySelector('.topics-grid');if(contact&&grid)grid.append(contact);
  const shortcuts=document.createElement('nav');shortcuts.className='support-shortcuts';shortcuts.setAttribute('aria-label','Help shortcuts');shortcuts.innerHTML='<span>Quick answers</span><a href="boxzy-support.html?topic=boxes&article=box-odds">Box odds ↗</a><a href="boxzy-support.html?topic=shipping&article=shipping-cost">Shipping cost ↗</a><a href="boxzy-support.html?topic=payments&article=add-funds">Add funds ↗</a>';hero.querySelector('.support-home-copy').append(shortcuts);
 }
 repairArt();
 new MutationObserver(()=>{repairArt();}).observe(document.body,{childList:true,subtree:true});
})();

// Keep keyboard focus within the active modal; existing Escape/close behavior remains.
(()=>{
 const visible=element=>{
  if(!element.getClientRects().length)return false;
  for(let node=element;node;node=node.parentElement){
   const style=getComputedStyle(node);
   if(node.hidden||node.getAttribute('aria-hidden')==='true'||style.display==='none'||style.visibility==='hidden'||style.opacity==='0')return false;
  }
  return true;
 };
 document.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;
  const modal=[...document.querySelectorAll('[role="dialog"][aria-modal="true"],[role="alertdialog"][aria-modal="true"]')].filter(visible).at(-1);
  if(!modal)return;
  const items=[...modal.querySelectorAll('button,a[href],input,select,textarea,[tabindex]')].filter(element=>!element.disabled&&element.tabIndex>=0&&visible(element));
  if(!items.length)return;
  const first=items[0],last=items.at(-1),active=document.activeElement;
  if(!modal.contains(active)||(event.shiftKey&&active===first)||(!event.shiftKey&&active===last)){
   event.preventDefault();event.stopImmediatePropagation();
   (event.shiftKey?last:first).focus();
  }
 },true);
})();

(()=>{const map={'box-discovery.png':'starter.png','box-discovery-boxzy-cutout-v2.png':'starter.png','box-collector.png':'super.png','box-vault.png':'ultra.png'};const sync=()=>document.querySelectorAll('img').forEach(img=>{const source=img.getAttribute('src')||'';const key=source.split('/').pop().split('?')[0];if(map[key])img.src='assets/boxzy/catalog/'+map[key];});sync();new MutationObserver(sync).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});})();
