(() => {
  const TAU = Math.PI * 2;
  const stages = [...document.querySelectorAll('.stage')];
  const options = [...document.querySelectorAll('.box-option')];
  const prizes = [...document.querySelectorAll('.prize')];
  const opening = document.querySelector('#openingStage');
  const reveal = document.querySelector('#revealNow');
  const leaveBackdrop = document.querySelector('#leaveBackdrop');
  const status = document.querySelector('#openingStatus');
  let selected = '07';
  let state = 'choose';
  let angle = -.5;
  let speed = 0;
  let lastTime = 0;
  let phaseStart = 0;
  let brakeDuration = 0;
  let brakeFrom = 0;
  let brakeTravel = 0;
  let frame = 0;
  let timers = [];
  let soundOn = true;
  let audioContext;

  const sounds = {
    open: new Audio('assets/boxzy/sfx/box-unfold.mp3'),
    finish: new Audio('assets/boxzy/sfx/final-reveal.mp3')
  };
  Object.values(sounds).forEach(audio => { audio.preload = 'auto'; audio.volume = .82; });

  function resize() {
    document.documentElement.style.setProperty('--scale', String(Math.min(innerWidth / 1280, innerHeight / 720)));
  }

  function show(id) {
    stages.forEach(stage => stage.classList.toggle('active', stage.id === id));
  }

  function later(callback, delay) {
    const timer = setTimeout(callback, delay);
    timers.push(timer);
    return timer;
  }

  function clearMotion() {
    timers.forEach(clearTimeout);
    timers = [];
    cancelAnimationFrame(frame);
    opening.classList.remove('charging', 'burst', 'running', 'braking');
    reveal.classList.remove('visible');
    prizes.forEach(prize => prize.removeAttribute('style'));
  }

  function play(name) {
    if (!soundOn) return;
    const sound = sounds[name];
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function tick(weight = 1) {
    if (!soundOn) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 660 - weight * 145;
      gain.gain.setValueAtTime(.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.035, audioContext.currentTime + .006);
      gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .065 + weight * .035);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + .16);
    } catch (_) {}
  }

  let lastFront = -1;
  let lastTick = 0;
  function drawOrbit(now) {
    let front = 0;
    let highestDepth = -1;
    prizes.forEach((prize, index) => {
      const itemAngle = angle + index * TAU / prizes.length;
      const sine = Math.sin(itemAngle);
      const depth = (sine + 1) / 2;
      const x = Math.cos(itemAngle) * 495;
      const y = 5 + sine * 125;
      const scale = .58 + depth * .75;
      const blur = state === 'spin' ? (1.5 + (1 - depth) * 4.5) : (1 - depth) * 2.7;
      prize.style.zIndex = String(18 + Math.round(depth * 20));
      prize.style.opacity = String(.27 + depth * .73);
      prize.style.filter = `blur(${blur.toFixed(2)}px) brightness(${(.66 + depth * .52).toFixed(2)})`;
      prize.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${(depth * 120).toFixed(1)}px) rotate(${(-Math.cos(itemAngle) * 8).toFixed(1)}deg) scale(${scale.toFixed(3)})`;
      if (depth > highestDepth) { highestDepth = depth; front = index; }
    });
    if (front !== lastFront && now - lastTick > 82) {
      tick(state === 'brake' ? 1.6 : .4);
      lastFront = front;
      lastTick = now;
    }
  }

  const easeOutQuint = value => 1 - Math.pow(1 - value, 5);
  function animate(now) {
    if (state !== 'spin' && state !== 'brake') return;
    if (!lastTime) lastTime = now;
    const delta = Math.min(32, now - lastTime);
    lastTime = now;
    if (state === 'spin') {
      const ramp = Math.min(1, (now - phaseStart) / 650);
      speed = .0025 + .0105 * easeOutQuint(ramp);
      angle += speed * delta;
    } else {
      const progress = Math.min(1, (now - phaseStart) / brakeDuration);
      angle = brakeFrom + brakeTravel * easeOutQuint(progress);
      if (progress >= 1) return finishReveal();
    }
    drawOrbit(now);
    frame = requestAnimationFrame(animate);
  }

  function choose(id) {
    selected = id;
    options.forEach(option => option.classList.toggle('selected', option.dataset.id === id));
    document.querySelector('#chosenId').textContent = id;
    document.querySelector('#selectBox').textContent = `SELECT BOX ${id}`;
  }

  function startOpening() {
    clearMotion();
    state = 'charge';
    document.querySelector('#openingLabel').textContent = `OPENING BOX ${selected}`;
    document.querySelector('#closedBoxId').textContent = selected;
    document.querySelector('#openBoxId').textContent = selected;
    status.textContent = 'The reveal is gaining power';
    show('openingStage');
    opening.classList.add('charging');
    play('open');
    later(() => opening.classList.add('burst'), 1420);
    later(() => {
      opening.classList.add('running');
      state = 'spin';
      phaseStart = performance.now();
      lastTime = 0;
      lastFront = -1;
      status.textContent = 'The reveal is in motion';
      frame = requestAnimationFrame(animate);
    }, 1840);
    later(() => reveal.classList.add('visible'), 2500);
    later(() => beginBrake(false), 6800);
  }

  function beginBrake(skipped) {
    if (state !== 'spin') return;
    state = 'brake';
    reveal.classList.remove('visible');
    opening.classList.add('braking');
    status.textContent = 'One prize is breaking away';
    phaseStart = performance.now();
    brakeDuration = skipped ? 1050 : 1850;
    brakeFrom = angle;
    const target = Math.PI / 2;
    const remainder = ((target - angle) % TAU + TAU) % TAU;
    brakeTravel = remainder + TAU * (skipped ? 1 : 2);
    lastTime = 0;
  }

  function finishReveal() {
    if (state !== 'brake') return;
    state = 'result';
    cancelAnimationFrame(frame);
    drawOrbit(performance.now());
    play('finish');
    later(() => show('resultStage'), 330);
  }

  function reset() {
    clearMotion();
    state = 'choose';
    document.querySelector('#sellPrize').textContent = '◇  SELL IT';
    document.querySelector('#sellPrize').disabled = false;
    show('chooseStage');
  }

  function openLeave() {
    leaveBackdrop.classList.add('open');
    leaveBackdrop.setAttribute('aria-hidden', 'false');
  }
  function closeLeave() {
    leaveBackdrop.classList.remove('open');
    leaveBackdrop.setAttribute('aria-hidden', 'true');
  }

  options.forEach(option => option.addEventListener('click', () => choose(option.dataset.id)));
  document.querySelector('#selectBox').addEventListener('click', startOpening);
  reveal.addEventListener('click', () => beginBrake(true));
  document.querySelector('#openAgain').addEventListener('click', reset);
  document.querySelector('#sellPrize').addEventListener('click', event => {
    event.currentTarget.textContent = '✓  SOLD · $69 ADDED';
    event.currentTarget.disabled = true;
  });
  document.querySelector('#keepCollection').addEventListener('click', () => { location.href = BoxzyCatalog.route('boxzy-collection.html'); });
  document.querySelector('#soundToggle').addEventListener('click', event => {
    soundOn = !soundOn;
    event.currentTarget.textContent = soundOn ? '♫' : '×';
  });
  document.querySelector('#closeExperience').addEventListener('click', () => {
    if (state === 'charge' || state === 'spin' || state === 'brake') openLeave();
    else location.href = BoxzyCatalog.route('boxzy-interactive.html#boxes');
  });
  document.querySelector('#keepOpening').addEventListener('click', closeLeave);
  document.querySelector('#modalClose').addEventListener('click', closeLeave);
  document.querySelector('#leaveOpening').addEventListener('click', () => { location.href = BoxzyCatalog.route('boxzy-interactive.html#boxes'); });
  leaveBackdrop.addEventListener('click', event => { if (event.target === leaveBackdrop) closeLeave(); });
  addEventListener('keydown', event => { if (event.key === 'Escape' && leaveBackdrop.classList.contains('open')) closeLeave(); });
  addEventListener('resize', resize);
  resize();
  choose('07');
})();
