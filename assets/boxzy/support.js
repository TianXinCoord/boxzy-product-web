(() => {
  const topics = [
    { id:'boxes', label:'BOXES', title:'Boxes & Unboxing', description:'How boxes work, odds, and opening.', icon:'box', articles:[
      { id:'box-work', title:'How Mystery Boxes Work', summary:'Learn how boxes, pull odds, and opening work.', body:'boxes' },
      { id:'box-odds', title:'Box Odds', summary:'See pull odds and item value ranges before buying.', body:'odds' }
    ]},
    { id:'items', label:'ITEMS', title:'Items & Collection', description:'Keep, sell, vault, or ship items from your collection.', icon:'tag', articles:[
      { id:'item-actions', title:'What You Can Do With Items', summary:'Learn how to keep, sell, or ship eligible items.', body:'actions' },
      { id:'vaulted-items', title:'Vaulted Items', summary:'Understand the 7-day vault window and automatic sale.', body:'vault' },
      { id:'undo-sale', title:'Can I Undo a Sale?', summary:'What happens after an item is sold.', body:'undo' }
    ]},
    { id:'payments', label:'PAYMENTS', title:'Payments & Balance', description:'Deposits, withdrawals, and payout timing.', icon:'card', articles:[
      { id:'balance-types', title:'Available balance', summary:'Understand how your available balance can be used.', body:'balances' },
      { id:'add-funds', title:'How to Add Funds', summary:'Add funds from the balance control.', body:'funds' },
      { id:'cash-out', title:'How to Cash Out', summary:'Withdraw your eligible balance.', body:'cashout' },
      { id:'payout-timing', title:'Payout Timing', summary:'When Venmo and bank transfer payouts usually arrive.', body:'payout' }
    ]},
    { id:'shipping', label:'SHIPPING', title:'Shipping', description:'Costs, delivery times, and addresses.', icon:'truck', articles:[
      { id:'shipping-cost', title:'Shipping Cost', summary:'How shipping costs are calculated.', body:'cost' },
      { id:'delivery-timing', title:'Delivery Timing', summary:'When shipped items usually arrive.', body:'delivery' },
      { id:'shipping-address', title:'Changing Your Shipping Address', summary:'Add, edit, or remove addresses.', body:'address' }
    ]},
    { id:'account', label:'ACCOUNT', title:'Account', description:'Your profile and customer support.', icon:'user', articles:[
      { id:'username', title:'Changing Your Username', summary:'Edit your username from Account.', body:'username' },
      { id:'contact-support', title:'Contacting Support', summary:'Where to get help in the app.', body:'support' },
    ]}
  ];

  const page = document.querySelector('#supportPage');
  const allArticles = topics.flatMap(topic => topic.articles.map(article => ({ topic, article })));
  const icon = type => {
    const paths = {
      box:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 9 8-4.5M12 12 4 7.5M12 12v9"/>',
      tag:'<path d="M4 5v6l9 9 7-7-9-9H5a1 1 0 0 0-1 1Z"/><circle cx="8" cy="8" r="1"/>',
      card:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
      truck:'<path d="M3 6h11v10H3zM14 10h4l3 4v2h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
      user:'<circle cx="12" cy="8" r="4"/><path d="M5 21c.8-4.2 3.1-6.2 7-6.2s6.2 2 7 6.2"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[type]}</svg>`;
  };
  const href = (topic, article) => `boxzy-support.html?topic=${topic}${article ? `&article=${article}` : ''}`;
  const search = () => `<div class="search-wrap">${document.querySelector('#searchTemplate').innerHTML}<div class="search-results" hidden></div></div>`;
  const emailCard = compact => `<aside class="email-card${compact ? ' article-email-card' : ''}"><h2>${compact ? 'Still have a question?' : 'Have another question?'}</h2><p>${compact ? 'Email us at <a class="support-email" href="mailto:support@boxzy.com">support@boxzy.com</a>' : 'Email our support team and we’ll reply within 1–2 business days.'}</p><div class="email-actions">${compact ? '' : '<a class="support-email" href="mailto:support@boxzy.com">support@boxzy.com</a>'}<a class="email-button" href="mailto:support@boxzy.com">Email Support</a></div></aside>`;
  const crumbs = entries => `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="boxzy-support.html">Support</a>${entries.map((entry,index)=>`<span class="crumb-separator">/</span>${entry.href?`<a href="${entry.href}">${entry.label}</a>`:`<span class="current">${entry.label}</span>`}`).join('')}</nav>`;

  const renderHome = () => {
    page.innerHTML = `<section class="support-home-hero"><div class="support-home-copy"><span class="support-eyebrow">SUPPORT</span><h1 class="support-title">How can we help?</h1><p class="support-subtitle">Find answers or get help from our team.</p>${search()}</div>${emailCard(false)}</section><section class="topics-section"><span class="section-label">BROWSE BY TOPIC</span><div class="topics-grid">${topics.map(topic=>`<a class="topic-card" href="${href(topic.id)}"><span class="topic-icon">${icon(topic.icon)}</span><span class="topic-copy"><strong>${topic.title}</strong><p>${topic.description}</p><span class="article-count">${topic.articles.length} articles</span></span><span class="chevron">›</span></a>`).join('')}</div></section>`;
  };

  const renderTopic = topic => {
    const related = topics.filter(item => item.id !== topic.id).slice(0,3);
    page.innerHTML = `${crumbs([{label:topic.title}])}<section class="topic-hero"><div class="topic-heading"><span class="topic-hero-icon">${icon(topic.icon)}</span><div><span class="support-eyebrow">${topic.label}</span><h1>${topic.title}</h1><p>${topic.description}</p></div></div>${search()}</section><section class="topic-layout"><div><span class="section-label">${topic.articles.length} ARTICLES</span><div class="article-list">${topic.articles.map((article,index)=>`<a class="article-row" href="${href(topic.id,article.id)}"><span class="article-index">${index+1}</span><span><strong>${article.title}</strong><p>${article.summary}</p></span><span class="chevron">›</span></a>`).join('')}</div><a class="back-link" href="boxzy-support.html">←&nbsp; Back to all topics</a></div><aside class="side-stack">${emailCard(false)}<section class="related-card"><span class="section-label">RELATED TOPICS</span><div class="related-links">${related.map(item=>`<a href="${href(item.id)}">${item.title}<span class="chevron">›</span></a>`).join('')}</div></section></aside></section>`;
  };

  const articleBody = article => {
    if(article.body==='funds') return `<ol class="ui-web-steps"><li>Open <strong>My Account → Deposit</strong>, or select the + next to your balance.</li><li>Choose a preset or enter an amount using the keypad or your keyboard. Select <strong>Coinflow</strong>.</li><li>Review the amount and select <strong>Deposit</strong>. Your balance updates after payment confirmation.</li></ol><p class="article-callout">If you were buying a box or requesting shipping, return to that confirmation to finish.</p>`;
    if(article.body==='actions') return `<p class="article-intro">You can choose one of three actions for eligible items.</p><section class="article-surface"><div class="action-row"><span class="action-number">01</span><span class="action-label">KEEP</span><span class="action-copy"><strong>Keep it in your collection</strong><p>The item remains safely stored in your collection.</p></span></div><div class="action-row"><span class="action-number">02</span><span class="action-label">SELL</span><span class="action-copy"><strong>Convert it to balance</strong><p>The item is sold instantly and its value is added to your available balance.</p></span></div><div class="action-row"><span class="action-number">03</span><span class="action-label">SHIP</span><span class="action-copy"><strong>Have the item delivered</strong><p>Choose a saved address and we’ll send the physical item to you.</p></span></div><p class="article-callout">Sales are instant and cannot be undone.</p></section>`;
    const bodies={
      boxes:'Every box purchase includes a prize. Open a box page to review its pull odds and item value range before buying. After purchase, swipe to open and reveal your item.',
      odds:'Yes. Open a box page before purchasing to review the pull odds and the value range for every prize tier.',
      vault:'Vaulted items are held for 7 days. If an item is not shipped during that window, it automatically sells at 90% of its listed value.',
      undo:'No. Sales are instant and final. The item value is immediately added to your available balance.',
      balances:'Available balance can be used to buy boxes or submitted for payout, subject to the minimum withdrawal and daily limit.',
      funds:'Open My Account → Deposit and continue with Coinflow.',
      cashout:'Go to Account → Withdraw. The minimum withdrawal is $6. Supported payout methods and fees are shown before confirmation.',
      payout:'Review the estimated arrival before confirming your Coinflow withdrawal. Track its status in My Account → Transaction history.',
      cost:'Shipping costs vary by item and destination. Items valued at $500 or more include mandatory insurance. Review the full cost before confirming shipment.',
      delivery:'Orders typically take 15–20 business days to ship from our fulfillment center. You’ll receive a tracking number when the item leaves our warehouse.',
      address:'Add, edit, or remove addresses during the shipping flow. You can also choose a default address.',
      username:'Select your username card on the Account screen to edit it.',
      support:'Go to Account → Customer Support to browse help articles. For anything else, email support@boxzy.com.',
    };
    return `<p class="article-intro">${bodies[article.body]}</p>`;
  };

  const renderArticle = (topic, article) => {
    const index = topic.articles.findIndex(item=>item.id===article.id);
    const prev = topic.articles[index-1];
    const next = topic.articles[index+1];
    page.innerHTML = `${crumbs([{label:topic.title,href:href(topic.id)},{label:article.title}])}<section class="article-layout"><article class="article-main"><span class="support-eyebrow">${topic.title.toUpperCase()}</span><h1>${article.title}</h1><p class="support-subtitle">${article.summary}</p>${articleBody(article)}<nav class="article-pagination" aria-label="Article navigation"><a href="${prev?href(topic.id,prev.id):href(topic.id)}">← ${prev?prev.title:topic.title}</a>${next?`<a href="${href(topic.id,next.id)}">Next: ${next.title} →</a>`:'<span></span>'}</nav></article><aside class="article-sidebar"><div>${search()}</div><section class="topic-nav-card"><span class="section-label">IN THIS TOPIC</span><div class="topic-nav-links">${topic.articles.map(item=>`<a class="${item.id===article.id?'active':''}" href="${href(topic.id,item.id)}">${item.title}<span class="chevron">›</span></a>`).join('')}</div></section>${emailCard(true)}</aside></section>`;
  };

  const bindSearch = () => {
    document.querySelectorAll('.search-wrap').forEach(wrap => {
      const input=wrap.querySelector('input');
      const results=wrap.querySelector('.search-results');
      input.addEventListener('input',()=>{
        const query=input.value.trim().toLowerCase();
        if(!query){results.hidden=true;results.innerHTML='';return;}
        const matches=allArticles.filter(({topic,article})=>`${topic.title} ${article.title} ${article.summary}`.toLowerCase().includes(query)).slice(0,7);
        results.innerHTML=matches.length?matches.map(({topic,article})=>`<a class="search-result" href="${href(topic.id,article.id)}"><strong>${article.title}</strong><small>${topic.title}</small></a>`).join(''):'<div class="search-empty">No matching articles.</div>';
        results.hidden=false;
      });
      input.addEventListener('keydown',event=>{if(event.key==='Escape'){input.value='';results.hidden=true;}});
    });
  };

  const params=new URLSearchParams(location.search);
  const topic=topics.find(item=>item.id===params.get('topic'));
  const article=topic?.articles.find(item=>item.id===params.get('article'));
  document.title=`${article?.title || topic?.title || 'Support'} — BOXZY`;
  if(article) renderArticle(topic,article); else if(topic) renderTopic(topic); else renderHome();
  bindSearch();
})();
