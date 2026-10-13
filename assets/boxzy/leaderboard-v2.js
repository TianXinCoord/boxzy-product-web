(() => {
  const pointValues = { vault: 650, collector: 300, discovery: 50 };
  const currentWeek = [
    ["PikaChase22", 11450, 27], ["TrainerMia", 9860, 24], ["RareFinds90", 8320, 21],
    ["GottaPullEmAll", 7650, 18], ["CardKing_USA", 6100, 17], ["BoxHunter24", 5480, 15],
    ["EeveeVault", 4920, 14], ["KantoCollector", 4510, 13], ["MewtwoMaster", 4180, 13],
    ["JohtoHunter", 3860, 12], ["PullPilot", 3540, 11], ["SnorlaxStack", 3230, 10],
    ["PalletPro", 2960, 10], ["GengarRush", 2710, 9], ["MoonbreonClub", 2480, 9],
    ["TrainerKai", 2260, 8], ["PokeVault77", 2040, 8], ["RareCandyMax", 1830, 7],
    ["CharizardFan", 1640, 7], ["EeveeOrbit", 1460, 6], ["KantoKid", 1280, 6],
    ["CardNomad", 1110, 5], ["HoloChaser", 950, 4]
  ];
  const priorWeek = [
    ["GottaPullEmAll", 12800, 31], ["PikaChase22", 10950, 26], ["TrainerMia", 9410, 23],
    ["RareFinds90", 7980, 20], ["KantoCollector", 6920, 18], ["CardKing_USA", 6230, 17],
    ["BoxHunter24", 5710, 16], ["MewtwoMaster", 5190, 15], ["EeveeVault", 4760, 14],
    ["PullPilot", 4320, 13], ["JohtoHunter", 3970, 12], ["PalletPro", 3580, 11],
    ["SnorlaxStack", 3240, 10], ["GengarRush", 2910, 10], ["TrainerKai", 2630, 9],
    ["MoonbreonClub", 2370, 8], ["RareCandyMax", 2120, 8], ["PokeVault77", 1890, 7],
    ["CharizardFan", 1680, 7], ["EeveeOrbit", 1490, 6], ["KantoKid", 1310, 6],
    ["CardNomad", 1140, 5], ["HoloChaser", 980, 4]
  ];
  const personalSeed = { current: 128, prior: 96 };
  const dataCache = { current: [...currentWeek], prior: [...priorWeek] };
  const podium = document.getElementById("podium");
  const rankList = document.getElementById("rankList");
  const myRankSection = document.querySelector(".my-rank");
  const myRank = document.getElementById("myRank");
  const myPoints = document.getElementById("myPoints");
  const myBoxes = document.getElementById("myBoxes");
  const countdown = document.getElementById("countdown");
  const countdownLabel = document.getElementById("countdownLabel");
  const refreshIndicator = document.getElementById("refreshIndicator");
  const rulesDialog = document.getElementById("rulesDialog");
  let period = "current";
  let refreshing = false;
  let pullStart = null;
  let pullDistance = 0;
  let visibleCycle = cycleKey(new Date());

  const number = (value) => Number(value).toLocaleString("en-US");

  function readJson(key, fallback) {
    try { return JSON.parse(BoxzyStorage.getItem(key) || "null") ?? fallback; }
    catch (_) { return fallback; }
  }

  function weekBounds(now = new Date(), prior = false) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7) - (prior ? 7 : 0));
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  function cycleKey(now) {
    return weekBounds(now).start.toISOString().slice(0, 10);
  }

  function boxKeyFromName(name = "") {
    const normalized = String(name).toLowerCase();
    if (normalized.includes("ultra") || normalized.includes("vault")) return "vault";
    if (normalized.includes("super") || normalized.includes("collector")) return "collector";
    return "discovery";
  }

  function personalRanking() {
    if (BoxzyStorage.getItem("boxzyAuthenticated") !== "true") return null;
    const { start, end } = weekBounds(new Date(), period === "prior");
    const openedById = new Map();
    readJson("boxzyWonItems", []).forEach((item) => {
      const key = item.id ? `id:${item.id}` : `won:${item.openedAt}:${item.box}`;
      openedById.set(key, { at: item.openedAt, box: item.box });
    });
    readJson("boxzySoldItems", []).forEach((item) => {
      if (item.saleReason === "unopened-timeout") return;
      const key = item.id ? `id:${item.id}` : `sold:${item.soldAt}:${item.box}`;
      openedById.set(key, { at: item.openedAt || item.soldAt, box: item.box });
    });
    const opened = [...openedById.values()].filter((item) => {
      const date = new Date(item.at || 0);
      return date >= start && date < end;
    });
    if (!opened.length) return { unranked: true, boxes: 0, points: 0 };
    const points = opened.reduce((sum, item) => sum + pointValues[boxKeyFromName(item.box)], 0);
    return { rank: personalSeed[period], boxes: opened.length, points };
  }

  function podiumCard(item, rank) {
    return `<article class="podium-card rank-${rank}"><div class="medal-wrap"><img class="rank-medal-image" src="assets/boxzy/rank-medal-${rank}.png" alt="Rank ${rank} medal"></div><h2>${item[0]}</h2><div class="opened-count">${item[2]} BOXES OPENED</div><div class="podium-rule"></div><span class="value-label">POINTS</span><strong class="podium-value">${number(item[1])}</strong></article>`;
  }

  function renderPersonal() {
    const authenticated = BoxzyStorage.getItem("boxzyAuthenticated") === "true";
    myRankSection.hidden = !authenticated;
    if (!authenticated) return;
    const mine = personalRanking();
    myRank.textContent = mine.unranked ? "Unranked" : `#${mine.rank}`;
    myRank.classList.toggle("is-unranked", Boolean(mine.unranked));
    myBoxes.textContent = mine.boxes;
    myPoints.textContent = number(mine.points);
  }

  function render() {
    const data = dataCache[period];
    podium.innerHTML = podiumCard(data[1], 2) + podiumCard(data[0], 1) + podiumCard(data[2], 3);
    rankList.innerHTML = data.slice(3).map((item, offset) => `<article class="rank-row"><span class="rank-number">${offset + 4}</span><strong>${item[0]}</strong><span class="boxes-opened">${item[2]}</span><span class="pulled-value">${number(item[1])}</span></article>`).join("");
    renderPersonal();
  }

  async function requestData(kind) {
    await new Promise((resolve) => setTimeout(resolve, 420));
    if (BoxzyStorage.getItem("boxzyLeaderboardFailNext") === "true") {
      BoxzyStorage.removeItem("boxzyLeaderboardFailNext");
      throw new Error("Leaderboard refresh failed");
    }
    return kind === "current" ? [...currentWeek] : [...priorWeek];
  }

  async function refreshLeaderboard() {
    if (refreshing || period === "prior") return;
    refreshing = true;
    refreshIndicator.classList.add("is-refreshing");
    refreshIndicator.querySelector("strong").textContent = "Refreshing…";
    const previous = dataCache[period];
    try {
      dataCache[period] = await requestData(period);
      visibleCycle = cycleKey(new Date());
      render();
    } catch (_) {
      dataCache[period] = previous;
      render();
      window.boxzyToast?.("Unable to refresh leaderboard. Try again.", { type: "error" });
    } finally {
      refreshing = false;
      refreshIndicator.classList.remove("is-ready", "is-refreshing", "is-visible");
      refreshIndicator.querySelector("strong").textContent = "Pull to refresh";
    }
  }

  function switchPeriod(nextPeriod, selectedButton) {
    period = nextPeriod;
    document.querySelectorAll("[data-period]").forEach((button) => {
      const active = button === selectedButton;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    render();
    tick();
  }

  function tick() {
    const now = new Date();
    const currentCycle = cycleKey(now);
    if (period === "current" && currentCycle !== visibleCycle) {
      visibleCycle = currentCycle;
      refreshLeaderboard();
    }
    if (period === "prior") {
      countdownLabel.textContent = "Week ended";
      countdown.textContent = "Final results";
      return;
    }
    countdownLabel.textContent = "Resets in";
    const seconds = Math.max(0, Math.floor((weekBounds(now).end - now) / 1000));
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    countdown.textContent = `${days}d · ${String(hours).padStart(2, "0")}h · ${String(minutes).padStart(2, "0")}m · ${String(secs).padStart(2, "0")}s`;
  }

  function closeRules() { if (rulesDialog.open) rulesDialog.close(); }
  document.getElementById("rulesTrigger").addEventListener("click", () => rulesDialog.showModal());
  rulesDialog.querySelector(".rules-close").addEventListener("click", closeRules);
  rulesDialog.addEventListener("click", (event) => {
    const rect = rulesDialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeRules();
  });
  document.querySelectorAll("[data-period]").forEach((button) => button.addEventListener("click", () => switchPeriod(button.dataset.period, button)));
  window.addEventListener("boxzy-authenticated", renderPersonal);
  document.addEventListener("touchstart", (event) => {
    if (window.scrollY > 0 || refreshing || period === "prior") return;
    pullStart = event.touches[0]?.clientY ?? null;
    pullDistance = 0;
  }, { passive: true });
  document.addEventListener("touchmove", (event) => {
    if (pullStart === null) return;
    pullDistance = Math.max(0, Math.min(100, (event.touches[0]?.clientY ?? pullStart) - pullStart));
    if (pullDistance < 12) return;
    refreshIndicator.classList.add("is-visible");
    refreshIndicator.classList.toggle("is-ready", pullDistance >= 68);
    refreshIndicator.querySelector("strong").textContent = pullDistance >= 68 ? "Release to refresh" : "Pull to refresh";
  }, { passive: true });
  document.addEventListener("touchend", () => {
    const shouldRefresh = pullDistance >= 68;
    pullStart = null;
    pullDistance = 0;
    if (shouldRefresh) refreshLeaderboard();
    else refreshIndicator.classList.remove("is-ready", "is-visible");
  });

  render();
  tick();
  window.setInterval(tick, 1000);
})();
