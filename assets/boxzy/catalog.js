/* BOXZY 2026-10-12. Demo catalog: replace with server data in production. */
(() => {
  const mode = new URLSearchParams(location.search).get('preview');
  const preview = ['delisted','updating','reference'].includes(mode);
  const isolated = ['clean','delisted','updating','reference','demo'].includes(mode);
  window.BoxzyStorage = isolated ? window.sessionStorage : window.localStorage;
  // Namespaced demo state survives navigation; real account/demo data stays untouched.
  if (isolated) {
    const guide = new URLSearchParams(location.search).get('guide') || '';
    const guideKey = /^doc-[a-z0-9-]+$/.test(guide) ? ':' + guide : '';
    const backing = window.sessionStorage, prefix = 'boxzy-preview-' + mode + guideKey + ':';
    window.BoxzyStorage = {getItem:k=>backing.getItem(prefix+k),setItem:(k,v)=>backing.setItem(prefix+k,String(v)),removeItem:k=>backing.removeItem(prefix+k)};
    if (mode !== 'clean') {
      if (!BoxzyStorage.getItem('boxzyAuthenticated')) BoxzyStorage.setItem('boxzyAuthenticated','true');
      if (!BoxzyStorage.getItem('boxzyBalance')) BoxzyStorage.setItem('boxzyBalance','498.40');
    }
  }
  if(mode === 'reference' && !BoxzyStorage.getItem('boxzyUnopenedBoxes')) {
    BoxzyStorage.setItem('boxzyAuthenticated','true');
    BoxzyStorage.setItem('boxzyBalance','498.40');
    BoxzyStorage.setItem('boxzyUnopenedBoxes',JSON.stringify([
      {id:'reference-starter',boxKey:'discovery',name:'Starter Box',source:'purchase',price:39,acquiredAt:'2026-10-12T08:00:00'},
      {id:'reference-super',boxKey:'collector',name:'Super Box',source:'purchase',price:10,acquiredAt:'2026-10-10T08:00:00'}
    ]));
  }
  if(isolated && mode!=='clean' && !BoxzyStorage.getItem('boxzyAddresses')) BoxzyStorage.setItem('boxzyAddresses',JSON.stringify([{id:'demo-home',label:'Home',street:'350 Fifth Avenue',apartment:'Apt 41B',city:'New York',state:'NY',zip:'10118',country:'United States',isDefault:true}]));
  const base = 'assets/boxzy/catalog/';
  const boxes = {
    discovery: {name:'Starter Box', price:5, image:base+'starter.png', status:'active'},
    collector: {name:'Super Box', price:10, image:base+'super.png', status:preview?'updating':'active'},
    elite: {name:'Elite Box', price:20, image:base+'elite.png', status:'active'},
    vault: {name:'Ultra Box', price:100, image:base+'ultra.png', status:'active'}
  };
  Object.values(boxes).forEach(box=>{box.poolVersion='demo-v1';});
  const products = [
    {sku:'demo-151-bundle',name:'151 Booster Bundle',type:'Pokémon TCG',value:69,rarity:'UNCOMMON',image:base+'151-bundle.png'},
    {sku:'demo-legendary-pack',name:'Legendary Treasures Booster Pack',type:'Pokémon TCG',value:89,rarity:'RARE',image:base+'legendary-pack.webp'},
    {sku:'demo-151-center-etb',name:'Pokémon Center 151 Elite Trainer Box',type:'Pokémon TCG',value:150,rarity:'EPIC',image:base+'151-etb.png'}
  ];
  const canUse = key => boxes[key]?.status === 'active';
  const message = 'New prizes on the way. Open once the update is complete.';
  const guard = key => {if(canUse(key))return true; if(window.boxzyToast)window.boxzyToast(message,{type:'info'});else window.alert(message);return false;};
  const boxImage = box => boxes[box.boxKey]?.image || box.image;
  const route = url => {
    if (!isolated) return url;
    const next = new URL(url,location.href); next.searchParams.set('preview',mode); return next.href;
  };
  window.BoxzyCatalog = {boxes,products,canUse,guard,boxImage,message,preview,isolated,route,reference:mode==='reference'};
  document.addEventListener('DOMContentLoaded',()=>{
    if(!isolated)return;
    document.querySelectorAll('a[href]').forEach(link=>{const href=link.getAttribute('href');if(/^boxzy-[^/]+\.html(?:[?#]|$)/.test(href))link.href=route(href);});
  });
})();
