(() => {
  let toastRegion;
  let confirmBackdrop;
  let activeConfirm;

  const ensureToastRegion = () => {
    if (toastRegion?.isConnected) return toastRegion;
    toastRegion = document.createElement('div');
    toastRegion.className = 'boxzy-toast-region';
    toastRegion.setAttribute('aria-label', 'Notifications');
    document.body.append(toastRegion);
    positionToasts();
    return toastRegion;
  };

  const positionToasts = () => {
    if (!toastRegion?.isConnected) return;
    const livePulls = document.querySelector('.live-strip');
    const minimumTop = innerWidth <= 590 ? 58 : 66;
    if (!livePulls) {
      toastRegion.style.top = `${minimumTop}px`;
      return;
    }
    const rect = livePulls.getBoundingClientRect();
    toastRegion.style.top = `${Math.max(minimumTop, Math.round(rect.bottom + 16))}px`;
  };

  const removeToast = toast => {
    if (!toast?.isConnected || toast.classList.contains('is-leaving')) return;
    toast.classList.add('is-leaving');
    setTimeout(() => toast.remove(), 170);
  };

  function showToast(message, options = {}) {
    if (typeof message === 'object') {
      options = message;
      message = options.message;
    }
    if (!message || !document.body) return null;
    const region = ensureToastRegion();
    const type = options.type || 'info';
    const duration = Number(options.duration ?? (type === 'error' ? 6000 : 4000));
    const duplicate = [...region.querySelectorAll('.boxzy-toast:not(.is-leaving)')].find(toast =>
      toast.dataset.type === type && toast.querySelector('.boxzy-toast-message')?.textContent === String(message)
    );
    if (duplicate) {
      clearTimeout(duplicate._timer);
      if (duration > 0) duplicate._timer = setTimeout(() => removeToast(duplicate), duration);
      return duplicate;
    }
    while (region.children.length >= 3) region.firstElementChild?.remove();
    const toast = document.createElement('div');
    toast.className = 'boxzy-toast';
    toast.dataset.type = type;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = '<span class="boxzy-toast-dot" aria-hidden="true"></span><span class="boxzy-toast-message"></span><button class="boxzy-toast-close" type="button" aria-label="Dismiss notification">×</button>';
    toast.querySelector('.boxzy-toast-message').textContent = String(message);
    toast.querySelector('.boxzy-toast-close').addEventListener('click', () => removeToast(toast));
    region.append(toast);
    if (duration > 0) toast._timer = setTimeout(() => removeToast(toast), duration);
    return toast;
  }

  const ensureConfirm = () => {
    if (confirmBackdrop?.isConnected) return confirmBackdrop;
    confirmBackdrop = document.createElement('div');
    confirmBackdrop.className = 'boxzy-confirm-backdrop';
    confirmBackdrop.setAttribute('aria-hidden', 'true');
    confirmBackdrop.innerHTML = '<section class="boxzy-confirm-panel" role="dialog" aria-modal="true" aria-labelledby="boxzyConfirmTitle"><header class="boxzy-confirm-header"><h2 class="boxzy-confirm-title" id="boxzyConfirmTitle"></h2><button class="boxzy-confirm-close" type="button" aria-label="Close confirmation">×</button></header><div class="boxzy-confirm-body"><p class="boxzy-confirm-message"></p><p class="boxzy-confirm-note"></p></div><footer class="boxzy-confirm-footer"><button class="boxzy-confirm-button danger" type="button" data-confirm></button><button class="boxzy-confirm-button primary" type="button" data-cancel></button></footer></section>';
    document.body.append(confirmBackdrop);
    confirmBackdrop.querySelector('.boxzy-confirm-close').addEventListener('click', () => settleConfirm(false));
    confirmBackdrop.querySelector('[data-cancel]').addEventListener('click', () => settleConfirm(false));
    confirmBackdrop.querySelector('[data-confirm]').addEventListener('click', () => settleConfirm(true));
    confirmBackdrop.addEventListener('click', event => { if (event.target === confirmBackdrop) settleConfirm(false); });
    return confirmBackdrop;
  };

  const settleConfirm = value => {
    if (!activeConfirm) return;
    const { resolve, returnFocus } = activeConfirm;
    activeConfirm = null;
    confirmBackdrop.classList.remove('open');
    confirmBackdrop.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('boxzy-confirm-open');
    document.body.classList.remove('boxzy-confirm-open');
    resolve(value);
    if (returnFocus?.isConnected) returnFocus.focus();
  };

  function openConfirm(options = {}) {
    if (!document.body) return Promise.resolve(false);
    if (activeConfirm) settleConfirm(false);
    const backdrop = ensureConfirm();
    backdrop.querySelector('.boxzy-confirm-title').textContent = options.title || 'Are you sure?';
    backdrop.querySelector('.boxzy-confirm-message').textContent = options.message || '';
    const note = backdrop.querySelector('.boxzy-confirm-note');
    note.textContent = options.note || '';
    note.hidden = !options.note;
    backdrop.querySelector('[data-confirm]').textContent = options.confirmLabel || 'Leave';
    backdrop.querySelector('[data-cancel]').textContent = options.cancelLabel || 'Keep opening';
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('boxzy-confirm-open');
    document.body.classList.add('boxzy-confirm-open');
    return new Promise(resolve => {
      activeConfirm = { resolve, returnFocus: document.activeElement };
      requestAnimationFrame(() => backdrop.querySelector('.boxzy-confirm-close').focus());
    });
  }

  document.addEventListener('keydown', event => {
    if (!activeConfirm) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      settleConfirm(false);
      return;
    }
    if (event.key === 'Tab') {
      const controls = [...confirmBackdrop.querySelectorAll('button:not([disabled])')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  addEventListener('resize', positionToasts);
  addEventListener('scroll', positionToasts, true);
  window.boxzyToast = showToast;
  window.boxzyConfirm = { open: openConfirm, close: () => settleConfirm(false) };
  sessionStorage.removeItem('boxzyFlashToast');
})();
