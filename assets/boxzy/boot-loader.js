(()=>{
  const loader=document.querySelector('[data-boxzy-boot]');
  if(!loader)return;
  const started=performance.now();
  const minimum=720;
  const finish=()=>{
    const remaining=Math.max(0,minimum-(performance.now()-started));
    setTimeout(()=>{
      loader.classList.add('is-leaving');
      document.documentElement.removeAttribute('aria-busy');
      setTimeout(()=>loader.remove(),320);
    },remaining);
  };
  document.documentElement.setAttribute('aria-busy','true');
  if(document.readyState==='complete')finish();
  else addEventListener('load',finish,{once:true});
})();
