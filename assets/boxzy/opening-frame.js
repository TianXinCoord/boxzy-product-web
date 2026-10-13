// Shared desktop theatre: preserve the approved 1280 × 720 composition.
(()=>{
 const body=document.body;
 let frame=document.querySelector('.artboard');
 if(!frame){
  frame=document.createElement('div');
  body.prepend(frame);
  frame.append(document.querySelector('.prototype-header'),document.querySelector('main'));
 }
 frame.classList.add('concept-frame');
 const fit=()=>frame.style.setProperty('--theatre-scale',Math.min(1,(innerWidth-48)/1280,(innerHeight-48)/720));
 fit();addEventListener('resize',fit);
 // One selection layout, with the box specification supplied by the page.
 const boxSpecs={
  'concept-a':{name:'Starter',image:'box-discovery-boxzy-cutout-v2.png'},
  'concept-b':{name:'Super',image:'box-collector.png'},
  'concept-c':{name:'Ultra',image:'box-vault.png'}
 };
 const boxSpec=boxSpecs[body.dataset.openingConcept];
 if(boxSpec){
  body.dataset.boxSpec=boxSpec.name.toLowerCase();
  document.querySelectorAll('#chooseStage .box-pick,#chooseStage .box-option').forEach(pick=>{
   const id=pick.dataset.boxId||pick.dataset.id;
   const img=pick.querySelector('img');
   img.src='assets/boxzy/'+boxSpec.image;
   img.alt=boxSpec.name+' Box '+id;
  });
  const caption=document.querySelector('#chooseStage .eyebrow,#chooseStage .copy>span');
  caption.textContent='1 '+boxSpec.name.toUpperCase()+' BOX READY';
  // Carry the selected closed box into the immediate locked/opening state.
  document.querySelectorAll('.locked-box,.opening-box,.closed-box-wrap>img').forEach(img=>{
   img.src='assets/boxzy/'+boxSpec.image;img.alt=boxSpec.name+' Box';
  });
 }
 const choices=[...document.querySelectorAll('#chooseStage .box-pick,#chooseStage .box-option')];
 const syncSelection=()=>choices.forEach(choice=>choice.setAttribute('aria-pressed',String(choice.classList.contains('selected'))));
 syncSelection();
 const selectionObserver=new MutationObserver(syncSelection);
 choices.forEach(choice=>selectionObserver.observe(choice,{attributes:true,attributeFilter:['class']}));
 document.querySelector('.box-position,.choose-controls>p')?.setAttribute('aria-live','polite');
 const heading=document.querySelector('#chooseStage h1');
 if(heading)heading.textContent='CHOOSE YOUR BOX';
 document.querySelector('.prototype-header img,.topbar>img')?.setAttribute('alt','BOXZY');
 const result=document.querySelector('#resultStage');
 const video=document.createElement('video');
 video.className='unified-result-video';video.src='assets/boxzy/video/starter-result-loop-0909.m4v';
 video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.setAttribute('aria-hidden','true');
 result.prepend(video);
 const syncVideo=()=>{if(result.classList.contains('active')){video.play().catch(()=>{});label(document.querySelector('#sellPrize'),'SELL IT','sell');}else video.pause();};
 new MutationObserver(syncVideo).observe(result,{attributes:true,attributeFilter:['class']});
 const icons={sell:'<path d="M3.8 12.2V6.9a3.1 3.1 0 0 1 3.1-3.1h5.3l8 8-8.4 8.4-8-8Z"/><circle cx="8.1" cy="8.1" r="1.15"/>',open:'<path d="m4.5 9 6.5-3.5L17.5 9 11 12.5 4.5 9ZM4.5 9v7l6.5 3.5 6.5-3.5V9M11 12.5v7M7.4 3.9A8.5 8.5 0 0 1 19 6.4M15.7 6.4H19V3.1"/>'};
 const label=(el,text,icon)=>{if(el)el.innerHTML='<svg class="decision-icon" viewBox="0 0 24 24" aria-hidden="true">'+icons[icon]+'</svg><span>'+text+'</span>';};
 label(document.querySelector('#sellPrize'),'SELL IT','sell');
 label(document.querySelector('[data-open-again],#openAgain'),'OPEN AGAIN','open');
 document.querySelector('#keepCollection').textContent='Keep in my collection';
 const sound=document.querySelector('#soundToggle');sound.textContent='♪';
})();
