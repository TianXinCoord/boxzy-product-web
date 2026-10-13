(()=>{
  const MINIMUM=6,DAILY_LIMIT=2500;
  const money=value=>`$${Number(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  const root=document.createElement('div');
  root.className='boxzy-withdraw-backdrop';
  root.id='boxzyWithdraw';
  root.innerHTML=`<aside class="boxzy-withdraw-sheet" role="dialog" aria-modal="true" aria-labelledby="boxzyWithdrawTitle">
    <img class="ui-funds-brand" src="assets/boxzy/boxzy-logo-white.png" alt="BOXZY"><div class="funds-drag-handle" aria-hidden="true"></div><header class="boxzy-withdraw-header">
      <div><h2 id="boxzyWithdrawTitle">Withdraw funds</h2><p>Minimum withdrawal: ${money(MINIMUM)}</p></div>
      <button class="boxzy-withdraw-close" type="button" aria-label="Close">×</button>
    </header>
    <div class="boxzy-withdraw-body" data-withdraw-form-step>
      <div class="boxzy-withdraw-summary">
        <div><span>Available balance</span><strong data-withdraw-available>$0.00</strong></div>
        <div><span>Daily remaining</span><strong data-withdraw-daily>${money(DAILY_LIMIT)}</strong></div>
      </div>
      <label class="withdraw-amount-label" for="withdrawAmount">Amount</label>
      <div class="withdraw-amount"><span>$</span><input id="withdrawAmount" inputmode="decimal" autocomplete="off" placeholder="0.00" maxlength="10" aria-label="Withdrawal amount" aria-describedby="withdrawHelper withdrawStatus"></div>
      <p class="withdraw-helper" id="withdrawHelper">Enter at least ${money(MINIMUM)}.</p>
      <div class="boxzy-keypad" role="group" aria-label="Amount keypad"><button type="button" data-money-key="1">1</button><button type="button" data-money-key="2">2</button><button type="button" data-money-key="3">3</button><button type="button" data-money-key="4">4</button><button type="button" data-money-key="5">5</button><button type="button" data-money-key="6">6</button><button type="button" data-money-key="7">7</button><button type="button" data-money-key="8">8</button><button type="button" data-money-key="9">9</button><button class="text-key" type="button" data-withdraw-max aria-label="Use maximum amount">MAX</button><button type="button" data-money-key="0">0</button><button type="button" class="back-key" data-money-key="backspace" aria-label="Delete last digit"><svg viewBox="0 0 24 24" width="25" height="25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4h12v16H9l-7-8Z"/><path d="m12 9 6 6m0-6-6 6"/></svg></button></div>
      <h3>Payout method</h3>
      <div class="boxzy-payout-list">
        <button class="boxzy-payout-method selected" type="button" data-payout="coinflow"><span class="boxzy-payout-icon"><i class="boxzy-coinflow-glyph">CF</i></span><span class="boxzy-payout-copy"><strong>Coinflow</strong><span>Secure payout processing</span></span><span class="method-check">✓</span></button>
      </div>
      <p class="boxzy-withdraw-status" id="withdrawStatus" role="status" aria-live="polite"></p>
      <button class="withdraw-continue" type="button" data-withdraw-continue disabled>Review withdrawal</button>
    </div>
    <div class="boxzy-withdraw-body withdraw-review" data-withdraw-review-step hidden>
      <button class="review-back" type="button" data-withdraw-back>← Back</button>
      <h3>Review withdrawal</h3><p>Confirm the amount and payout method before submitting.</p>
      <dl><div><dt>Withdrawal amount</dt><dd data-review-amount></dd></div><div><dt>Estimated processing fee</dt><dd data-review-fee></dd></div><div class="review-total"><dt>Estimated payout</dt><dd data-review-payout></dd></div><div><dt>Payout method</dt><dd data-review-method></dd></div><div><dt>Estimated arrival</dt><dd data-review-eta></dd></div></dl>
      <p class="fee-disclosure">The final Coinflow quote is shown here before submission. Submitted withdrawals cannot be cancelled.</p>
      <button class="withdraw-continue" type="button" data-withdraw-confirm>Confirm withdrawal</button>
    </div>
  </aside>`;
  document.body.appendChild(root);

  const sheet=root.querySelector('.boxzy-withdraw-sheet');
  const closeButton=root.querySelector('.boxzy-withdraw-close');
  const amountInput=root.querySelector('#withdrawAmount');
  const status=root.querySelector('.boxzy-withdraw-status');
  const continueButton=root.querySelector('[data-withdraw-continue]');
  const formStep=root.querySelector('[data-withdraw-form-step]');
  const reviewStep=root.querySelector('[data-withdraw-review-step]');
  let selectedMethod='coinflow',returnFocus=null,replaceAmount=false;

  const readAvailable=()=>Number(BoxzyStorage.getItem('boxzyBalance')||0);
  const amount=()=>Math.round(Number(amountInput.value||0)*100)/100;
  const readTransactions=()=>{try{const value=JSON.parse(BoxzyStorage.getItem('boxzyTransactions')||'[]');return Array.isArray(value)?value:[]}catch{return[]}};
  const dailyRemaining=()=>{
    const now=new Date();
    const spent=readTransactions()
      .filter(item=>item.type==='withdrawal'&&['pending','processing','completed'].includes(String(item.status).toLowerCase()))
      .filter(item=>{const date=new Date(item.date);return date.getFullYear()===now.getFullYear()&&date.getMonth()===now.getMonth()&&date.getDate()===now.getDate()})
      .reduce((sum,item)=>sum+Number(item.amount||0),0);
    return Math.max(0,DAILY_LIMIT-spent);
  };
  const feeFor=()=>0;
  const methodMeta=()=>({name:'Coinflow',eta:'1–3 business days'});

  function refresh(){
    root.querySelector('[data-withdraw-available]').textContent=money(readAvailable());
    root.querySelector('[data-withdraw-daily]').textContent=money(dailyRemaining());
  }
  function validate(){
    const value=amount(),max=Math.min(readAvailable(),dailyRemaining());
    let message='';
    if(!Number.isFinite(value))message='Enter a valid amount.';
    else if(!value)message='';
    else if(value<MINIMUM)message=`Minimum withdrawal is ${money(MINIMUM)}.`;
    else if(value>max)message=max<MINIMUM?'Available balance is below the minimum withdrawal.':`Maximum available is ${money(max)}.`;
    status.textContent=message;
    continueButton.disabled=Boolean(message)||value<=0;
    amountInput.setAttribute('aria-invalid',String(Boolean(message)));
    amountInput.style.width=`${Math.max(4,amountInput.value.length)}ch`;
    return !continueButton.disabled;
  }
  function reset(){
    selectedMethod='coinflow';replaceAmount=false;amountInput.value='';status.textContent='';formStep.hidden=false;reviewStep.hidden=true;
    root.querySelectorAll('[data-payout]').forEach(item=>item.classList.toggle('selected',item.dataset.payout==='coinflow'));
    continueButton.disabled=true;validate();
  }
  function open(){
    returnFocus=document.activeElement;refresh();reset();root.classList.add('open');document.documentElement.classList.add('boxzy-withdraw-open');document.body.classList.add('boxzy-withdraw-open');requestAnimationFrame(()=>closeButton.focus());
  }
  function close(){
    root.classList.remove('open');document.documentElement.classList.remove('boxzy-withdraw-open');document.body.classList.remove('boxzy-withdraw-open');returnFocus?.focus?.();
  }
  function showReview(){
    if(!validate())return;
    const value=amount(),fee=feeFor(),meta=methodMeta();
    root.querySelector('[data-review-amount]').textContent=money(value);
    root.querySelector('[data-review-fee]').textContent=`−${money(fee)}`;
    root.querySelector('[data-review-payout]').textContent=money(Math.max(0,value-fee));
    root.querySelector('[data-review-method]').textContent=meta.name;
    root.querySelector('[data-review-eta]').textContent=meta.eta;
    formStep.hidden=true;reviewStep.hidden=false;root.querySelector('[data-withdraw-confirm]').focus();
  }
  function confirmWithdrawal(){
    const value=amount();
    if(!validate())return;
    const meta=methodMeta();
    BoxzyStorage.setItem('boxzyBalance',String(Math.max(0,readAvailable()-value)));
    let transactions=[];
    try{transactions=JSON.parse(BoxzyStorage.getItem('boxzyTransactions')||'[]')}catch{}
    if(!Array.isArray(transactions))transactions=[];
    transactions.unshift({id:`withdrawal-${Date.now()}`,type:'withdrawal',amount:value,date:new Date().toISOString(),status:'processing',method:meta.name});
    BoxzyStorage.setItem('boxzyTransactions',JSON.stringify(transactions));
    dispatchEvent(new CustomEvent('boxzy-balance-updated',{detail:{balance:readAvailable()}}));
    dispatchEvent(new Event('boxzy-transaction-added'));
    close();
    window.boxzyToast?.('Withdrawal submitted. Track it in Transaction history.',{type:'success'});
  }

  function setAmount(value){
    const cleaned=String(value).replace(/[^0-9.]/g,'');
    const [whole,...fraction]=cleaned.split('.');
    amountInput.value=(whole.replace(/^0+(?=\d)/,'')|| (fraction.length?'0':''))+(fraction.length?'.'+fraction.join('').slice(0,2):'');
    amountInput.value=amountInput.value.slice(0,10);validate();
  }
  root.querySelectorAll('[data-money-key]').forEach(button=>button.addEventListener('click',()=>{
    const key=button.dataset.moneyKey;setAmount(key==='backspace'?amountInput.value.slice(0,-1):(replaceAmount?'':amountInput.value)+key);replaceAmount=false;
  }));
  amountInput.addEventListener('input',()=>{replaceAmount=false;setAmount(amountInput.value)});
  root.querySelector('[data-withdraw-max]').addEventListener('click',()=>{amountInput.value=String(Math.min(readAvailable(),dailyRemaining()));replaceAmount=true;validate()});
  root.querySelectorAll('[data-payout]').forEach(button=>button.addEventListener('click',()=>{selectedMethod=button.dataset.payout;root.querySelectorAll('[data-payout]').forEach(item=>item.classList.toggle('selected',item===button));validate()}));
  continueButton.addEventListener('click',showReview);
  root.querySelector('[data-withdraw-back]').addEventListener('click',()=>{reviewStep.hidden=true;formStep.hidden=false;amountInput.focus()});
  root.querySelector('[data-withdraw-confirm]').addEventListener('click',confirmWithdrawal);
  closeButton.addEventListener('click',close);
  root.addEventListener('click',event=>{if(event.target===root)close()});
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&root.classList.contains('open'))close();
    if(event.key==='Tab'&&root.classList.contains('open')){
      const focusable=[...sheet.querySelectorAll('button:not([disabled]),input:not([disabled])')].filter(el=>!el.closest('[hidden]')),first=focusable[0],last=focusable.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
  });
  addEventListener('boxzy-balance-updated',refresh);
  window.boxzyWithdraw={open,close};
})();
