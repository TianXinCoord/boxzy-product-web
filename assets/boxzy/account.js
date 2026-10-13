(()=>{
  if(BoxzyStorage.getItem('boxzyAuthenticated')!=='true'){
    sessionStorage.setItem('boxzyAuthNext','boxzy-account.html');
    location.replace('boxzy-interactive.html?auth=login');
    return;
  }
  if(BoxzyStorage.getItem('boxzyBalance')===null)BoxzyStorage.setItem('boxzyBalance','450');
  if(!BoxzyStorage.getItem('boxzyUsername'))BoxzyStorage.setItem('boxzyUsername','user_2b4fae55');

  const demoAddresses=[
    {id:'demo-address-home',label:'Home',firstName:'Avery',lastName:'Carter',country:'United States',street:'350 Fifth Avenue',apartment:'Apt 41B',city:'New York',state:'NY',zip:'10118',phone:'(212) 555-0147',email:'avery.carter@example.com',isDefault:true},
    {id:'demo-address-office',label:'Office',firstName:'Morgan',lastName:'Lee',country:'United States',street:'1 Market Street',apartment:'Suite 1800',city:'San Francisco',state:'CA',zip:'94105',phone:'(415) 555-0182',email:'morgan.lee@example.com',isDefault:false},
    {id:'demo-address-family',label:'Family',firstName:'Jordan',lastName:'Brooks',country:'United States',street:'233 S Wacker Drive',apartment:'Apt 2704',city:'Chicago',state:'IL',zip:'60606',phone:'(312) 555-0164',email:'jordan.brooks@example.com',isDefault:false}
  ];
  if(BoxzyStorage.getItem('boxzyAddressDemoSeedV1')!=='true'){
    let saved=[];
    try{saved=JSON.parse(BoxzyStorage.getItem('boxzyAddresses')||'[]')}catch{}
    if(!Array.isArray(saved))saved=[];
    const savedIds=new Set(saved.map(item=>item?.id));
    const hasDefault=saved.some(item=>item?.isDefault);
    const additions=demoAddresses.filter(item=>!savedIds.has(item.id)).map((item,index)=>({...item,isDefault:hasDefault?false:!saved.length&&index===0}));
    const addresses=[...saved,...additions];
    BoxzyStorage.setItem('boxzyAddresses',JSON.stringify(addresses));
    const defaultAddress=addresses.find(item=>item.isDefault)||addresses[0];
    if(defaultAddress)BoxzyStorage.setItem('boxzyAddress',JSON.stringify(defaultAddress));
    BoxzyStorage.setItem('boxzyAddressDemoSeedV1','true');
  }

  const format=value=>`$${Number(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const currentBalance=()=>Number(BoxzyStorage.getItem('boxzyBalance')||0);
  const refreshBalance=value=>document.querySelectorAll('[data-balance]').forEach(el=>el.textContent=format(value));
  const refreshUsername=()=>document.querySelectorAll('[data-username]').forEach(el=>el.textContent=BoxzyStorage.getItem('boxzyUsername'));
  const refreshAddress=()=>{
    const address=JSON.parse(BoxzyStorage.getItem('boxzyAddress')||'null');
    let addresses=[];
    try{addresses=JSON.parse(BoxzyStorage.getItem('boxzyAddresses')||'[]')}catch{}
    document.querySelectorAll('[data-address-summary]').forEach(el=>el.textContent=address?`${address.city}, ${address.state} ${address.zip}`:'No address saved');
    document.querySelectorAll('.address-link').forEach(el=>el.innerHTML=`${Array.isArray(addresses)&&addresses.length?'Manage addresses':'Add address'} <span>›</span>`);
  };
  refreshBalance(currentBalance());refreshUsername();refreshAddress();

  const toast=document.getElementById('toast');let toastTimer;
  const notify=(message,type='success')=>{if(window.boxzyToast){window.boxzyToast(message,{type});return}clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('show');toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)};
  document.querySelectorAll('[data-deposit]').forEach(button=>button.addEventListener('click',()=>window.boxzyDeposit?.open()));
  document.querySelector('[data-withdraw]')?.addEventListener('click',()=>window.boxzyWithdraw?.open());
  document.querySelector('[data-copy-code]')?.addEventListener('click',async()=>{try{await navigator.clipboard.writeText('UTOCV5');notify('Referral code copied.')}catch{notify('Referral code: UTOCV5')}});

  let returnFocus=null;
  const openLayer=layer=>{returnFocus=document.activeElement;layer.classList.add('open');layer.setAttribute('aria-hidden','false');document.body.classList.add('history-open')};
  const closeLayer=layer=>{layer.classList.remove('open');layer.setAttribute('aria-hidden','true');if(!document.querySelector('.modal-backdrop.open,.history-backdrop.open'))document.body.classList.remove('history-open');returnFocus?.focus?.()};

  const usernameModal=document.querySelector('[data-username-modal]');
  const usernameInput=document.querySelector('#usernameInput');
  const usernameCount=document.querySelector('[data-username-count]');
  const usernameError=document.querySelector('[data-username-error]');
  const usernameWrapper=usernameInput.closest('.validated-input');
  const usernameSave=document.querySelector('[data-username-save]');
  let originalUsername=BoxzyStorage.getItem('boxzyUsername')||'';
  const reservedUsernames=['admin','administrator','boxzy','support','moderator','pikachase22','tcg_hunter','rarefinds90','cardking_usa'];
  const usernameValid=value=>/^[A-Za-z0-9_]{3,20}$/.test(value);
  const validateUsername=()=>{
    const value=usernameInput.value.trim();
    const syntaxValid=usernameValid(value);
    const changed=value!==originalUsername;
    const sameAccount=value.toLowerCase()===originalUsername.toLowerCase();
    const available=sameAccount||!reservedUsernames.includes(value.toLowerCase());
    const valid=syntaxValid&&available;
    usernameCount.textContent=`${value.length} / 20`;
    usernameWrapper.classList.toggle('invalid',value.length>0&&!valid);
    usernameWrapper.classList.toggle('valid',valid);
    usernameWrapper.querySelector('span').textContent=valid?'✓':'!';
    usernameError.textContent=value.length<3?'Enter at least 3 characters.':value.length>20?'Use no more than 20 characters.':syntaxValid?'Letters, numbers, and underscores only.':'Only letters, numbers, and underscores are allowed.';
    usernameError.classList.toggle('error',value.length>0&&!syntaxValid);
    const availability=document.querySelector('[data-username-availability]');
    availability.textContent=!value?'':!syntaxValid?'':!available?'This username is already taken.':!changed?'This is your current username.':'Username is available.';
    availability.className=`username-availability ${!available?'unavailable':valid&&changed?'available':''}`;
    usernameSave.disabled=!(valid&&changed);
    return valid&&changed;
  };
  document.querySelector('[data-edit-user]')?.addEventListener('click',()=>{originalUsername=BoxzyStorage.getItem('boxzyUsername')||'';usernameInput.value=originalUsername;validateUsername();openLayer(usernameModal);requestAnimationFrame(()=>usernameInput.select())});
  usernameInput.addEventListener('input',validateUsername);
  document.querySelectorAll('[data-username-close]').forEach(button=>button.addEventListener('click',()=>closeLayer(usernameModal)));
  usernameModal.addEventListener('click',event=>{if(event.target===usernameModal)closeLayer(usernameModal)});
  document.querySelector('[data-username-form]').addEventListener('submit',event=>{event.preventDefault();if(!validateUsername())return;BoxzyStorage.setItem('boxzyUsername',usernameInput.value.trim());refreshUsername();closeLayer(usernameModal);notify('Username updated.')});

  const deleteModal=document.querySelector('[data-delete-modal]');
  const deleteInput=document.querySelector('[data-delete-input]');
  const deleteConfirm=document.querySelector('[data-delete-confirm]');
  const deleteChecks=document.querySelector('[data-delete-checks]');
  const deleteBlocker=document.querySelector('[data-delete-blocker]');
  const deleteMain=document.querySelector('[data-delete-main]');
  const deleteReauth=document.querySelector('[data-delete-reauth]');
  const deletionBlockers=()=>{
    let transactions=[];
    let orders=[];
    let collectionState={};
    try{transactions=JSON.parse(BoxzyStorage.getItem('boxzyTransactions')||'[]')}catch{}
    try{orders=JSON.parse(BoxzyStorage.getItem('boxzyOrders')||'[]')}catch{}
    try{collectionState=JSON.parse(BoxzyStorage.getItem('boxzyCollectionState')||'{}')}catch{}
    const pendingWithdrawals=Array.isArray(transactions)?transactions.filter(item=>item.type==='withdrawal'&&['pending','processing'].includes(String(item.status).toLowerCase())).length:0;
    const pendingShipments=Object.values(collectionState||{}).filter(item=>item?.status==='shipped'&&item?.shipment&&!item.shipment.trackingNumber).length;
    const unfinishedOrders=Array.isArray(orders)?orders.filter(item=>!['opened','completed','abandoned','cancelled'].includes(String(item.status).toLowerCase())).length:0;
    return [
      {label:'Pending withdrawals',blocked:pendingWithdrawals>0,detail:pendingWithdrawals?`${pendingWithdrawals} still processing`:'None'},
      {label:'Items awaiting shipment',blocked:pendingShipments>0||BoxzyStorage.getItem('boxzyPendingShipment')==='true',detail:pendingShipments?`${pendingShipments} awaiting shipment`:BoxzyStorage.getItem('boxzyPendingShipment')==='true'?'Action required':'None'},
      {label:'Unfinished orders',blocked:unfinishedOrders>0||BoxzyStorage.getItem('boxzyUnfinishedOrder')==='true',detail:unfinishedOrders?`${unfinishedOrders} unfinished`:BoxzyStorage.getItem('boxzyUnfinishedOrder')==='true'?'Action required':'None'}
    ];
  };
  const validateDeletion=()=>{
    const blockers=deletionBlockers();
    const blocked=blockers.some(item=>item.blocked);
    deleteChecks.innerHTML=blockers.map(item=>`<div class="delete-check ${item.blocked?'blocked':'clear'}"><span>${item.blocked?'!':'✓'}</span><strong>${item.label}</strong><small>${item.detail}</small></div>`).join('');
    deleteBlocker.textContent=blocked?'Resolve the items above before deleting this account.':'';
    deleteConfirm.disabled=blocked||deleteInput.value!=='DELETE';
    return !blocked&&deleteInput.value==='DELETE';
  };
  document.querySelector('[data-delete]')?.addEventListener('click',()=>{document.querySelector('[data-delete-balance]').textContent=format(currentBalance());deleteInput.value='';deleteMain.hidden=false;deleteReauth.hidden=true;deleteConfirm.textContent='Delete account';validateDeletion();openLayer(deleteModal);requestAnimationFrame(()=>deleteInput.focus())});
  deleteInput.addEventListener('input',validateDeletion);
  document.querySelectorAll('[data-delete-close]').forEach(button=>button.addEventListener('click',()=>closeLayer(deleteModal)));
  deleteModal.addEventListener('click',event=>{if(event.target===deleteModal)closeLayer(deleteModal)});
  deleteConfirm.addEventListener('click',()=>{
    if(!validateDeletion())return;
    deleteMain.hidden=true;deleteReauth.hidden=false;requestAnimationFrame(()=>deleteReauth.querySelector('[data-delete-provider]').focus());
  });
  document.querySelector('[data-delete-back]').addEventListener('click',()=>{deleteReauth.hidden=true;deleteMain.hidden=false;requestAnimationFrame(()=>deleteInput.focus())});
  document.querySelectorAll('[data-delete-provider]').forEach(button=>button.addEventListener('click',()=>{
    button.disabled=true;button.textContent=`Verifying with ${button.dataset.deleteProvider}…`;
    setTimeout(()=>{
      Object.keys(localStorage).filter(key=>key.startsWith('boxzy')).forEach(key=>BoxzyStorage.removeItem(key));
      closeLayer(deleteModal);location.replace('boxzy-interactive.html?account=deleted');
    },700);
  }));

  const supportModal=document.querySelector('[data-support-modal]');
  document.querySelector('[data-support]')?.addEventListener('click',()=>openLayer(supportModal));
  document.querySelectorAll('[data-support-close]').forEach(button=>button.addEventListener('click',()=>closeLayer(supportModal)));
  supportModal.addEventListener('click',event=>{if(event.target===supportModal)closeLayer(supportModal)});
  document.querySelector('[data-copy-support]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText('support@boxzy.com');notify('Support email copied.')}catch{notify('support@boxzy.com')}});

  const signoutModal=document.querySelector('[data-signout-modal]');
  document.querySelector('[data-signout]')?.addEventListener('click',()=>{
    openLayer(signoutModal);
    requestAnimationFrame(()=>signoutModal.querySelector('.secondary-button')?.focus());
  });
  document.querySelectorAll('[data-signout-close]').forEach(button=>button.addEventListener('click',()=>closeLayer(signoutModal)));
  signoutModal.addEventListener('click',event=>{if(event.target===signoutModal)closeLayer(signoutModal)});
  document.querySelector('[data-signout-confirm]').addEventListener('click',()=>{
    BoxzyStorage.setItem('boxzyAuthenticated','false');
    sessionStorage.removeItem('boxzyAuthNext');
    closeLayer(signoutModal);
    location.replace('boxzy-interactive.html?signedout=1');
  });

  const historyBackdrop=document.querySelector('[data-history-backdrop]');
  const historyClose=document.querySelector('[data-history-close]');
  const historyList=document.querySelector('[data-history-list]');
  const historyEmpty=document.querySelector('[data-history-empty]');
  const defaultTransactions=[
    {id:'demo-deposit-1',type:'deposit',amount:120,date:'2026-09-02T09:18:00.000Z',status:'completed',method:'Coinflow'},
    {id:'demo-withdrawal-1',type:'withdrawal',amount:42.5,date:'2026-09-01T14:15:00.000Z',status:'completed',method:'Bank Account'},
    {id:'demo-withdrawal-2',type:'withdrawal',amount:75,date:'2026-08-30T11:42:00.000Z',status:'processing',method:'Venmo'},
    {id:'demo-deposit-2',type:'deposit',amount:200,date:'2026-08-28T08:44:00.000Z',status:'completed',method:'Coinflow'},
    {id:'demo-withdrawal-3',type:'withdrawal',amount:28,date:'2026-08-24T16:05:00.000Z',status:'completed',method:'Bank Account'},
    {id:'demo-deposit-3',type:'deposit',amount:150,date:'2026-08-21T10:26:00.000Z',status:'completed',method:'Coinflow'},
    {id:'demo-withdrawal-4',type:'withdrawal',amount:65,date:'2026-08-18T15:34:00.000Z',status:'failed',method:'Venmo'},
    {id:'demo-withdrawal-5',type:'withdrawal',amount:35,date:'2026-08-12T12:20:00.000Z',status:'completed',method:'Bank Account'}
  ];
  const readTransactions=()=>{
    try{
      const stored=JSON.parse(BoxzyStorage.getItem('boxzyTransactions')||'null');
      if(Array.isArray(stored)){
        if(BoxzyStorage.getItem('boxzyTransactionDemoSeedV2')!=='true'){
          const ids=new Set(stored.map(item=>item?.id));
          const merged=[...stored,...defaultTransactions.filter(item=>!ids.has(item.id))];
          BoxzyStorage.setItem('boxzyTransactions',JSON.stringify(merged));
          BoxzyStorage.setItem('boxzyTransactionDemoSeedV2','true');
          return merged;
        }
        return stored;
      }
      BoxzyStorage.setItem('boxzyTransactions',JSON.stringify(defaultTransactions));
      BoxzyStorage.setItem('boxzyTransactionDemoSeedV2','true');
    }catch{}
    return defaultTransactions;
  };
  const renderTransactions=(filter='all')=>{
    const transactions=readTransactions().filter(item=>filter==='all'||item.type===filter).sort((a,b)=>new Date(b.date)-new Date(a.date));
    historyList.innerHTML=transactions.map(item=>{
      const deposit=item.type==='deposit';
      const title=deposit?'Deposit':'Withdrawal';
      const icon=deposit?'i-down':'i-up';
      const date=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(new Date(item.date));
      const status=String(item.status||'completed').toLowerCase();
      return `<article class="history-item" data-transaction-type="${item.type}"><span class="history-icon ${item.type}"><svg class="icon"><use href="#${icon}"/></svg></span><div class="history-item-copy"><div class="history-item-title"><strong>${deposit?'+':'−'}${format(item.amount)}</strong><span>${title} · ${item.method||'BOXZY'}</span></div><time datetime="${item.date}">${date}</time></div><span class="status ${status}">${status[0].toUpperCase()+status.slice(1)}</span></article>`;
    }).join('');
    historyEmpty.hidden=transactions.length>0;
  };
  const setHistoryFilter=button=>{
    document.querySelectorAll('[data-history-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active))});
    renderTransactions(button.dataset.historyFilter);
  };
  document.querySelectorAll('[data-history-filter]').forEach(button=>button.addEventListener('click',()=>setHistoryFilter(button)));
  const openHistory=()=>{setHistoryFilter(document.querySelector('[data-history-filter="all"]'));openLayer(historyBackdrop);requestAnimationFrame(()=>historyClose.focus())};
  const closeHistory=()=>closeLayer(historyBackdrop);
  document.querySelector('[data-history]')?.addEventListener('click',openHistory);
  historyClose?.addEventListener('click',closeHistory);
  historyBackdrop?.addEventListener('click',event=>{if(event.target===historyBackdrop)closeHistory()});
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const open=document.querySelector('.modal-backdrop.open,.history-backdrop.open');if(open)closeLayer(open)});
  addEventListener('boxzy-balance-updated',event=>refreshBalance(event.detail.balance));
  addEventListener('boxzy-transaction-added',()=>renderTransactions(document.querySelector('[data-history-filter].active')?.dataset.historyFilter||'all'));
  addEventListener('storage',event=>{if(event.key==='boxzyAddress')refreshAddress();if(event.key==='boxzyUsername')refreshUsername()});
})();
