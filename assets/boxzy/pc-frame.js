// One desktop artboard: the border, imagery and controls scale together.
(()=>{
 const frame=document.querySelector('.experience-shell');
 if(!frame)return;
 const fit=()=>{const scale=Math.max(.1,Math.min(1,(innerWidth-48)/1280,(innerHeight-48)/720));frame.style.setProperty('--stage-scale',String(scale));frame.style.setProperty('--stage-hit',`${44/scale}px`);};
 fit();addEventListener('resize',fit);
 const exp=document.querySelector('#boxExperience');
 const sync=()=>{const active=exp.classList.contains('open');exp.inert=!active;};
 sync();new MutationObserver(sync).observe(exp,{attributes:true,attributeFilter:['class']});
})();
