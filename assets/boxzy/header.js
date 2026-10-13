(() => {
  const money = value => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const storedBalance = fallback => {
    try {
      const value = BoxzyStorage.getItem('boxzyBalance');
      return value === null ? fallback : value;
    } catch {
      return fallback;
    }
  };
  const renderHeader = root => {
    const active = root.dataset.active || '';
    const authenticated = BoxzyStorage.getItem('boxzyAuthenticated') === 'true';
    if (!authenticated && (active === 'account' || active === 'collection')) {
      const next = location.pathname.split('/').pop() || 'boxzy-account.html';
      sessionStorage.setItem('boxzyAuthNext', next);
      location.replace(BoxzyCatalog.route('boxzy-interactive.html?auth=login'));
      return;
    }
    const balance = Number(storedBalance(root.dataset.initialBalance || 0));
    const item = (key, href, label) => `<a class="nav-link${active === key ? ' active' : ''}" href="${href}"${key === 'collection' ? ' data-collection' : ''}${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
    root.innerHTML = `
      <a class="logo" href="boxzy-interactive.html" aria-label="BOXZY home"><img src="assets/boxzy/boxzy-logo-white.png" alt="BOXZY"></a>
      <nav class="nav-links" aria-label="Primary navigation">
        ${item('box', 'boxzy-interactive.html#boxes', 'BOX')}
        ${item('collection', 'boxzy-collection.html', 'COLLECTION')}
        ${item('leaderboard', 'boxzy-leaderboard.html', 'LEADERBOARD')}
      </nav>
      <div class="account-actions actions">${authenticated ? `
        <div class="balance-control balance" aria-label="Account balance"><span data-balance>${money(balance)}</span><button class="balance-add add" type="button" data-deposit aria-label="Add funds">+</button></div>
        <a class="account-button account${active === 'account' ? ' active-account' : ''}" href="boxzy-account.html"${active === 'account' ? ' aria-current="page"' : ''}><svg class="account-avatar-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.5" r="3.25"></circle><path d="M5.5 19.25c.7-4.05 3-6.15 6.5-6.15s5.8 2.1 6.5 6.15"></path></svg>My Account</a>` : `
        <a class="guest-button guest-login" href="boxzy-interactive.html?auth=login">Log in</a>`}
      </div>`;
    if(BoxzyCatalog.isolated)root.querySelectorAll('a[href]').forEach(a=>{a.href=BoxzyCatalog.route(a.getAttribute('href'));});
  };
  const refresh = () => document.querySelectorAll('[data-boxzy-header]').forEach(renderHeader);
  window.boxzyHeader = { refresh };
  refresh();
  addEventListener('boxzy-authenticated', refresh);
  addEventListener('storage', event => { if (event.key === 'boxzyAuthenticated') refresh(); });
})();
