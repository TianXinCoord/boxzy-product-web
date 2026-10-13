(() => {
  const concept = document.body.dataset.concept;
  const stages = [...document.querySelectorAll('.stage')];
  const picks = [...document.querySelectorAll('.box-pick')];
  const revealNow = document.querySelector('#revealNow');
  const openingStage = document.querySelector('#openingStage');
  const leaveBackdrop = document.querySelector('#leaveBackdrop');
  const soundButton = document.querySelector('#soundToggle');
  const timers = [];
  let selectedId = '07';
  let soundEnabled = true;
  let openingStartedAt = 0;
  let resultShown = false;

  const products = {
    '05': { name: 'Vintage Charizard Booster Pack', value: '$158', rarity: 'RARE', image: 'assets/boxzy/real-products/vintage-charizard-pack-cutout.png' },
    '06': { name: 'Legendary Treasures Display', value: '$84', rarity: 'UNCOMMON', image: 'assets/boxzy/real-products/legendary-treasures-display-cutout.png' },
    '07': { name: 'Prismatic Evolutions Booster Bundle', value: '$69', rarity: 'UNCOMMON', image: 'assets/pokemon-tcg-sealed/booster-bundle/prismatic-evolutions-bundle-alt.png' },
    '08': { name: '30th Celebration Elite Trainer Box', value: '$150', rarity: 'RARE', image: 'assets/boxzy/real-products/30th-celebration-etb-cutout.png' },
    '09': { name: 'Black Collector Box', value: '$109', rarity: 'RARE', image: 'assets/boxzy/real-products/black-collector-box-cutout.png' }
  };

  const sounds = {
    lock: new Audio('assets/boxzy/sfx/box-lock.mp3'),
    unfold: new Audio('assets/boxzy/sfx/box-unfold.mp3'),
    reveal: new Audio('assets/boxzy/sfx/final-reveal.mp3')
  };
  Object.values(sounds).forEach(audio => { audio.preload = 'auto'; audio.volume = .72; });
  const play = name => { if (!soundEnabled) return; const audio = sounds[name]; audio.currentTime = 0; audio.play().catch(() => {}); };

  function clearTimers() { while (timers.length) clearTimeout(timers.pop()); }
  function later(fn, delay) { const id = setTimeout(fn, delay); timers.push(id); return id; }
  function showStage(id) { stages.forEach(stage => stage.classList.toggle('active', stage.id === id)); }

  function selectBox(id) {
    selectedId = id;
    picks.forEach(pick => pick.classList.toggle('selected', pick.dataset.boxId === id));
    document.querySelector('#boxPosition').innerHTML = `BOX <strong>${id}</strong> OF 24`;
    document.querySelector('#selectBox').textContent = `SELECT BOX ${id}`;
  }

  function lockSelection() {
    document.querySelector('#lockedId').textContent = selectedId;
    document.querySelector('#lockedHeadingId').textContent = selectedId;
    document.querySelector('#openLockedBox').textContent = `OPEN BOX ${selectedId}`;
    showStage('lockedStage');
    play('lock');
  }

  function openingCopy(step) {
    const copy = {
      energy: [
        ['ENERGY 01 / 05', 'THE SEAL IS ACTIVE', 'Initializing the energy core…'],
        ['ENERGY 03 / 05', 'ENERGY BUILDING', 'The seal is reacting…'],
        ['ENERGY 05 / 05', 'READY TO REVEAL', 'Energy threshold reached.']
      ],
      pulse: [
        ['SIGNAL 01 / 05', 'SEARCHING FOR A SIGNAL', 'Scanning the sealed product…'],
        ['SIGNAL 04 / 05', 'SOMETHING IS INSIDE', 'Rarity signal detected.'],
        ['SIGNAL 05 / 05', 'SIGNAL LOCKED', 'Preparing your reveal.']
      ],
      orbit: [
        ['PHASE 01 / 05', 'ONE OF THEM IS YOURS', 'Finalizing your pull…'],
        ['PHASE 04 / 05', 'POSSIBILITIES IN MOTION', 'The orbit is accelerating…'],
        ['PHASE 05 / 05', 'YOUR PULL IS LOCKED', 'Preparing your reveal.']
      ]
    }[concept][step];
    document.querySelector('#openingEyebrow').textContent = copy[0];
    document.querySelector('#openingTitle').textContent = copy[1];
    document.querySelector('#openingDescription').textContent = copy[2];
    document.querySelectorAll('.phase-dots span').forEach((dot, index) => dot.classList.toggle('on', index <= (step === 0 ? 1 : step === 1 ? 3 : 4)));
    document.querySelectorAll('.energy-progress i').forEach((dot, index) => dot.classList.toggle('active', index <= (step === 0 ? 1 : step === 1 ? 3 : 4)));
    openingStage.classList.toggle('phase-4', step >= 1);
  }

  function startOpening() {
    clearTimers();
    resultShown = false;
    openingStartedAt = performance.now();
    revealNow.classList.remove('visible');
    openingStage.classList.remove('finishing', 'phase-4');
    openingCopy(0);
    showStage('openingStage');
    play('unfold');
    later(() => openingCopy(1), 1350);
    later(() => revealNow.classList.add('visible'), 2500);
    later(() => openingCopy(2), 3600);
    later(() => finishOpening(false), concept === 'pulse' ? 5550 : concept === 'energy' ? 5200 : 5000);
  }

  function finishOpening(skipped) {
    if (resultShown) return;
    resultShown = true;
    clearTimers();
    revealNow.classList.remove('visible');
    openingStage.classList.add('finishing');
    play('reveal');
    later(showResult, skipped ? 620 : 720);
  }

  function showResult() {
    const product = products[selectedId];
    document.querySelector('#resultProduct').src = product.image;
    document.querySelector('#resultProduct').alt = product.name;
    document.querySelector('#resultTitle').textContent = product.name;
    document.querySelector('#resultRarity').textContent = product.rarity;
    document.querySelector('#resultRarity').dataset.rarity = product.rarity.toLowerCase();
    document.querySelector('#resultValue').textContent = product.value;
    document.querySelector('#sellPrize').textContent = 'SELL IT';
    showStage('resultStage');
    openingStage.classList.remove('finishing');
  }

  function reset() {
    clearTimers();
    resultShown = false;
    revealNow.classList.remove('visible');
    openingStage.classList.remove('finishing', 'phase-4');
    showStage('chooseStage');
  }

  picks.forEach(pick => pick.addEventListener('click', () => selectBox(pick.dataset.boxId)));
  document.querySelector('#selectBox').addEventListener('click', lockSelection);
  document.querySelector('#chooseAnother').addEventListener('click', () => showStage('chooseStage'));
  document.querySelector('#openLockedBox').addEventListener('click', startOpening);
  revealNow.addEventListener('click', () => {
    if (performance.now() - openingStartedAt < 2450) return;
    finishOpening(true);
  });
  document.querySelectorAll('[data-open-again]').forEach(button => button.addEventListener('click', reset));
  document.querySelector('#keepCollection').addEventListener('click', () => { window.location.href = BoxzyCatalog.route('boxzy-collection.html'); });
  document.querySelector('#sellPrize').addEventListener('click', () => { document.querySelector('#sellPrize').textContent = 'SOLD — CREDIT ADDED'; });
  soundButton.addEventListener('click', () => { soundEnabled = !soundEnabled; soundButton.classList.toggle('is-muted', !soundEnabled); soundButton.textContent = soundEnabled ? '♪' : '×'; soundButton.setAttribute('aria-label', soundEnabled ? 'Mute sound' : 'Enable sound'); });
  document.querySelector('#closeExperience').addEventListener('click', () => {
    const paidStage = document.querySelector('#lockedStage').classList.contains('active') || openingStage.classList.contains('active');
    if (paidStage) { leaveBackdrop.classList.add('open'); leaveBackdrop.setAttribute('aria-hidden', 'false'); }
    else window.location.href = BoxzyCatalog.route('boxzy-interactive.html#boxes');
  });
  document.querySelector('#keepOpening').addEventListener('click', () => { leaveBackdrop.classList.remove('open'); leaveBackdrop.setAttribute('aria-hidden', 'true'); });
  document.querySelector('#leaveOpening').addEventListener('click', () => { window.location.href = BoxzyCatalog.route('boxzy-interactive.html#boxes'); });
  leaveBackdrop.addEventListener('click', event => { if (event.target === leaveBackdrop) document.querySelector('#keepOpening').click(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && leaveBackdrop.classList.contains('open')) document.querySelector('#keepOpening').click(); });

  selectBox('07');
})();
