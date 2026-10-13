(()=>{
  const MIN=5,MAX=5000;
  const readBalance=()=>{const stored=BoxzyStorage.getItem('boxzyBalance');return Number(stored===null?100:stored)};
  const money=value=>`$${Number(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const updateBalanceUI=()=>{const value=money(readBalance());document.querySelectorAll('.balance-control>span,.balance>span').forEach(el=>el.textContent=value)};
  const saveDeposit=(value,method)=>{
    let transactions=[];
    try{const stored=JSON.parse(BoxzyStorage.getItem('boxzyTransactions')||'[]');if(Array.isArray(stored))transactions=stored}catch{}
    const record={id:`deposit-${Date.now()}`,type:'deposit',amount:value,date:new Date().toISOString(),status:'completed',method};
    transactions.unshift(record);BoxzyStorage.setItem('boxzyTransactions',JSON.stringify(transactions));
    dispatchEvent(new CustomEvent('boxzy-transaction-added',{detail:record}));
  };

  const root=document.createElement('div');
  root.className='boxzy-deposit-backdrop';
  root.id='boxzyDeposit';
  root.innerHTML=`
    <section class="boxzy-deposit-sheet" role="dialog" aria-modal="true" aria-labelledby="boxzyDepositTitle">
      <button class="boxzy-deposit-close" aria-label="Close">×</button>
      <div class="boxzy-deposit-form">
        <img class="ui-funds-brand" src="assets/boxzy/boxzy-logo-white.png" alt="BOXZY"><div class="funds-drag-handle" aria-hidden="true"></div>
        <h2 id="boxzyDepositTitle">Deposit funds</h2>
        <p class="boxzy-deposit-limit">Minimum deposit: $5</p>
        <div class="boxzy-current-balance"><span>Current balance</span><strong id="boxzyCurrentBalance">$0.00</strong></div>
        <label class="boxzy-amount-label" for="boxzyAmount">Amount</label>
        <div class="boxzy-amount-wrap">
          <span class="boxzy-currency">$</span>
          <input class="boxzy-amount" id="boxzyAmount" inputmode="numeric" autocomplete="off" placeholder="0" maxlength="7" aria-describedby="boxzyDepositError" aria-label="Deposit amount">
          
        </div>
        <div class="boxzy-deposit-error" id="boxzyDepositError" role="status" aria-live="polite"></div>
        <div class="boxzy-presets">
          <button class="boxzy-preset" data-amount="25">$25</button><button class="boxzy-preset" data-amount="50">$50</button><button class="boxzy-preset" data-amount="100">$100</button><button class="boxzy-preset" data-amount="250">$250</button><button class="boxzy-preset" data-amount="500">$500</button>
        </div>
        <div class="boxzy-keypad" role="group" aria-label="Amount keypad"><button type="button" data-money-key="1">1</button><button type="button" data-money-key="2">2</button><button type="button" data-money-key="3">3</button><button type="button" data-money-key="4">4</button><button type="button" data-money-key="5">5</button><button type="button" data-money-key="6">6</button><button type="button" data-money-key="7">7</button><button type="button" data-money-key="8">8</button><button type="button" data-money-key="9">9</button><button class="text-key" type="button" data-deposit-max aria-label="Use maximum amount">MAX</button><button type="button" data-money-key="0">0</button><button type="button" class="back-key" data-money-key="backspace" aria-label="Delete last digit"><svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4h12v16H9l-7-8Z"/><path d="m12 9 6 6m0-6-6 6"/></svg></button></div>
        <p class="boxzy-section-label">Choose payment method</p>
        <div class="boxzy-methods">
          <button class="boxzy-method selected" data-method="Coinflow"><span class="coinflow-icon" aria-hidden="true">CF</span><div><strong>Coinflow</strong><span class="method-detail">Secure checkout powered by Coinflow</span></div><i class="boxzy-radio"></i></button>
        </div>
        <button class="boxzy-deposit-submit" id="boxzyDepositSubmit">Deposit</button>
        <p class="boxzy-deposit-legal"><i class="boxzy-lock"></i>Secure checkout</p>
      </div>
      <div class="boxzy-success"><div class="boxzy-success-mark">✓</div><h2>Funds added</h2><p class="boxzy-success-copy" id="boxzySuccessCopy"></p><div class="boxzy-success-balance" id="boxzySuccessBalance"></div><div class="boxzy-success-actions"><button id="boxzyDepositDone">DONE</button><a class="primary" href="boxzy-interactive.html#boxes">OPEN A BOX</a></div></div>
    </section>`;
  document.body.appendChild(root);

  const form=root.querySelector('.boxzy-deposit-form');
  const success=root.querySelector('.boxzy-success');
  const input=root.querySelector('#boxzyAmount');
  const error=root.querySelector('#boxzyDepositError');
  const submit=root.querySelector('#boxzyDepositSubmit');
  const current=root.querySelector('#boxzyCurrentBalance');
  let method='Coinflow',processing=false,pendingOptions={},returnFocus=null,replaceAmount=true;
  const amount=()=>Number(input.value||0);

  function validate(){
    const value=amount();
    input.style.width=`${Math.max(1,input.value.length)}ch`;
    input.classList.remove('invalid');error.textContent='';
    if(!input.value) submit.disabled=true;
    else if(value<MIN){error.textContent='Minimum deposit is $5.';input.classList.add('invalid');submit.disabled=true}
    else if(value>MAX){error.textContent='Maximum deposit per transaction is $5,000.';input.classList.add('invalid');submit.disabled=true}
    else submit.disabled=false;
    submit.textContent=amount()>=MIN&&amount()<=MAX?`Deposit ${money(amount())}`:'Deposit';
    root.querySelectorAll('.boxzy-preset').forEach(button=>button.classList.toggle('active',Number(button.dataset.amount)===value));
    input.setAttribute('aria-invalid',String(submit.disabled));
  }
  function setAmount(value){if(processing)return;const digits=String(value??'').replace(/\D/g,'').slice(0,7);input.value=digits?String(Number(digits)):'';validate()}
  function open(options={}){
    returnFocus=document.activeElement;replaceAmount=true;
    pendingOptions=typeof options==='number'?{amount:options}:(options||{});
    if(BoxzyStorage.getItem('boxzyAuthenticated')!=='true'){
      sessionStorage.setItem('boxzyDepositAfterLogin','true');
      const login=document.querySelector('[data-auth-dialog],[data-auth],[data-login]');
      if(login) login.click();
      else location.href=BoxzyCatalog.route("boxzy-interactive.html?deposit=1");
      return;
    }
    form.classList.remove('hidden');success.classList.remove('show');input.value=String(Math.max(MIN,Math.ceil(Number(pendingOptions.amount)||100)));current.textContent=money(readBalance());validate();root.classList.add('open');document.documentElement.classList.add('boxzy-deposit-open');document.body.classList.add('boxzy-deposit-open');requestAnimationFrame(()=>root.querySelector('.boxzy-deposit-close').focus());
  }
  function close(){if(!processing){root.classList.remove('open');document.documentElement.classList.remove('boxzy-deposit-open');document.body.classList.remove('boxzy-deposit-open');returnFocus?.focus?.()}}

  input.addEventListener('input',()=>{replaceAmount=false;setAmount(input.value)});
  root.querySelectorAll('[data-money-key]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.moneyKey;setAmount(key==='backspace'?input.value.slice(0,-1):(replaceAmount?'':input.value)+key);replaceAmount=false;
  }));
  root.querySelectorAll('.boxzy-preset').forEach(button=>button.onclick=()=>{setAmount(button.dataset.amount);replaceAmount=true});
  root.querySelector('[data-deposit-max]').onclick=()=>{setAmount(MAX);replaceAmount=true};
  root.querySelectorAll('.boxzy-method').forEach(button=>button.onclick=()=>{method=button.dataset.method;root.querySelectorAll('.boxzy-method').forEach(item=>item.classList.toggle('selected',item===button))});
  submit.onclick=()=>{
    const value=amount();if(processing||value<MIN||value>MAX)return;
    processing=true;root.querySelectorAll('.boxzy-keypad button,.boxzy-preset').forEach(button=>button.disabled=true);input.readOnly=true;submit.disabled=true;submit.textContent='Processing…';
    setTimeout(()=>{
      try{
        const newBalance=readBalance()+value;
        BoxzyStorage.setItem('boxzyBalance',String(newBalance));
        saveDeposit(value,method);
        processing=false;root.querySelectorAll('.boxzy-keypad button,.boxzy-preset').forEach(button=>button.disabled=false);input.readOnly=false;form.classList.add('hidden');success.classList.add('show');
        root.querySelector('#boxzySuccessCopy').textContent=`${money(value)} was added with ${method}.`;
        root.querySelector('#boxzySuccessBalance').textContent=`New balance · ${money(newBalance)}`;
        updateBalanceUI();dispatchEvent(new CustomEvent('boxzy-balance-updated',{detail:{balance:newBalance}}));
        const callback=pendingOptions.onSuccess;
        // Deposit never silently spends the newly added funds. Return to the original confirmation.
        root.querySelector('#boxzyDepositDone').textContent='Done';
        if(callback)root.querySelector('#boxzySuccessCopy').textContent+=' Return to your box or shipping request to confirm it.';
        pendingOptions={};
      }catch(failure){
        processing=false;root.querySelectorAll('.boxzy-keypad button,.boxzy-preset').forEach(button=>button.disabled=false);input.readOnly=false;submit.disabled=false;submit.textContent=amount()>=MIN&&amount()<=MAX?`Deposit ${money(amount())}`:'Deposit';
        error.textContent='Payment failed. Please try again.';input.classList.add('invalid');
        window.boxzyToast?.('Payment failed. Please try again.',{type:'error'});
        pendingOptions.onError?.(failure);
      }
    },900);
  };
  root.querySelector('.boxzy-deposit-close').onclick=close;
  root.querySelector('#boxzyDepositDone').onclick=close;
  root.onclick=event=>{if(event.target===root)close()};
  document.addEventListener('keydown',event=>{if(!root.classList.contains('open'))return;if(event.key==='Escape')close();if(event.key==='Tab'){const items=[...root.querySelectorAll('button:not(:disabled),input,a[href]')].filter(el=>el.getClientRects().length);const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}});
  document.addEventListener('click',event=>{if(event.target.closest('.balance-add,.add,[data-deposit]')){event.preventDefault();open()}},true);
  addEventListener('boxzy-authenticated',()=>{updateBalanceUI();if(sessionStorage.getItem('boxzyDepositAfterLogin')==='true'){sessionStorage.removeItem('boxzyDepositAfterLogin');open(pendingOptions)}});
  window.boxzyDeposit={open,close};
  updateBalanceUI();
})();
