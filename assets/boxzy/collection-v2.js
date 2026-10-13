(() => {
  let initialItems = BoxzyCatalog.products.map((product,index)=>({...product,id:product.sku,status:'vault',date:'Oct 12, 2026',box:'Starter Box'}));
  // Screenshot comparison fixture only. Historical demo values are not current catalog prices.
  if (BoxzyCatalog.reference) initialItems = [
    ['Prismatic Evolutions Booster Bundle',69,'assets/pokemon-tcg-sealed/booster-bundle/prismatic-evolutions-bundle-alt.png'],
    ['Prismatic Evolutions Booster Bundle',69,'assets/pokemon-tcg-sealed/booster-bundle/prismatic-evolutions-bundle-alt.png'],
    ['Radiant Eevee Premium Collection',149,'assets/pokemon-tcg-sealed/premium-collection/radiant-eevee-premium.jpg'],
    ['Destined Rivals Booster Pack',6,'assets/pokemon-tcg-sealed/booster-pack/destined-rivals-booster.jpg'],
    ['30th Celebration Elite Trainer Box',150,'assets/boxzy/real-products/30th-celebration-etb-cutout.png'],
    ['Black Collector Box',109,'assets/boxzy/real-products/black-collector-box-cutout.png'],
    ['Legendary Treasures Display',84,'assets/boxzy/real-products/legendary-treasures-display-cutout.png'],
    ['Vintage Charizard Booster Pack',158,'assets/boxzy/real-products/vintage-charizard-pack-cutout.png'],
    ['Radiant Eevee Premium Collection',149,'assets/pokemon-tcg-sealed/premium-collection/radiant-eevee-premium.jpg']
  ].map(([name,value,image],i)=>({id:`reference-prize-${i}`,name,value,image,type:'Pokémon TCG',status:i===8?'shipped':'vault',date:'Oct 12, 2026',box:'Starter Box'}));


  const STATE_KEY = "boxzyCollectionState";
  const SOLD_KEY = "boxzySoldItems";
  const UNOPENED_KEY = "boxzyUnopenedBoxes";
  const PENDING_OPEN_KEY = "boxzyPendingOpen";
  let shippingQuote=null, shippingGeneration=0, shippingProcessing=false;
  const SELL_RATE = 0.9;
  const VAULT_AUTO_SELL_MS = 7 * 24 * 60 * 60 * 1000;
  const DEMO_AUTO_SELL_OFFSETS = [
    6 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000,
    3 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000,
    18 * 60 * 60 * 1000 + 27 * 60 * 1000,
  ];
  const emptyMode = new URLSearchParams(location.search).get("empty") === "1";
  const seededAt = Date.now();
  const initialUnopenedBoxes = [
    { id: "unopened-ultra-01", name: "Ultra Box", boxKey: "vault", price: 100, source: "purchase", acquiredAt: new Date(seededAt - 10 * 60 * 60 * 1000).toISOString(), image: "assets/boxzy/catalog/ultra.png" },
    { id: "unopened-super-01", name: "Super Box", boxKey: "collector", price: 10, source: "purchase", acquiredAt: new Date(seededAt - 28 * 60 * 60 * 1000).toISOString(), image: "assets/boxzy/catalog/super.png" },
    { id: "unopened-starter-reward-01", name: "Starter Box", boxKey: "discovery", price: 5, source: "reward", rewardRank: "Top 10", rewardPeriod: "Weekly leaderboard", acquiredAt: new Date(seededAt - 45 * 60 * 1000).toISOString(), image: "assets/boxzy/catalog/starter.png" },
  ];
  const storedUnopened = readJson(UNOPENED_KEY, null);
  const unopenedBoxes = emptyMode ? [] : Array.isArray(storedUnopened) ? storedUnopened : initialUnopenedBoxes;
  if (!emptyMode && !Array.isArray(storedUnopened)) BoxzyStorage.setItem(UNOPENED_KEY, JSON.stringify(unopenedBoxes));
  const savedState = readJson(STATE_KEY, {});
  const wonItems = readJson("boxzyWonItems", []).map((item, index) => ({
    id: item.id || `pull-${item.openedAt || index}`,
    name: item.name,
    type: item.type || "Pokémon TCG",
    value: Number(item.value) || 0,
    status: item.status || "vault",
    date: item.openedAt ? new Date(item.openedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently",
    openedAt: item.openedAt || null,
    autoSellAt: item.autoSellAt || (item.openedAt ? new Date(new Date(item.openedAt).getTime() + VAULT_AUTO_SELL_MS).toISOString() : null),
    box: item.box || "BOXZY Box",
    image: item.image,
  }));
  const sourceItems = [...wonItems, ...initialItems].filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index);
  const items = sourceItems.map((item, index) => {
    const merged = { ...item, ...(savedState[item.id] || {}) };
    if (merged.status === "vault" && !merged.autoSellAt) {
      merged.autoSellAt = new Date(Date.now() + DEMO_AUTO_SELL_OFFSETS[index % DEMO_AUTO_SELL_OFFSETS.length]).toISOString();
      savedState[merged.id] = { ...(savedState[merged.id] || {}), autoSellAt: merged.autoSellAt };
    }
    return merged;
  }).filter((item) => !item.sold);
  BoxzyStorage.setItem(STATE_KEY, JSON.stringify(savedState));

  const grid = document.querySelector("#collectionGrid");
  const emptyState = document.querySelector("#emptyState");
  const vaultPolicy = document.querySelector("#vaultPolicy");
  const unopenedPolicy = document.querySelector("#unopenedPolicy");
  const sort = document.querySelector("#sort");
  const toast = document.querySelector("#toast");
  const drawer = document.querySelector("#prizeDrawer");
  const shippingModal = document.querySelector("#shippingModal");
  const sellModal = document.querySelector("#sellModal");
  const drawerActions = document.querySelector("#drawerActions");
  const shipmentCard = document.querySelector("#shipmentCard");
  const defaultShippingAddress = document.querySelector("#defaultShippingAddress");
  const payShipping = document.querySelector("#payShipping");
  let filter = ["all","unopened","vault","shipped"].includes(new URLSearchParams(location.search).get("view")) ? new URLSearchParams(location.search).get("view") : "unopened";
  let activeItem = null;
  let returnFocus = null;
  let toastTimer;

  document.body.classList.toggle("empty-mode", emptyMode);

  function readJson(key, fallback) {
    try {
      return JSON.parse(BoxzyStorage.getItem(key) || "null") ?? fallback;
    } catch (_) {
      return fallback;
    }
  }

  function money(value) {
    return `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function autoSellState(item) {
    if (item.status !== "vault" || !item.autoSellAt) return null;
    const deadline = new Date(item.autoSellAt);
    if (Number.isNaN(deadline.getTime())) return null;
    const remaining = deadline.getTime() - Date.now();
    const deadlineLabel = deadline.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
    if (remaining <= 0) return { label: "Auto-sale is due", deadlineLabel, due: true };
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.max(1, Math.floor((remaining % 3600000) / 60000));
    return {
      label: days > 0 ? `Auto-sells in ${days}d ${hours}h` : `Auto-sells in ${hours}h ${minutes}m`,
      deadlineLabel,
      due: false,
    };
  }


  function acquiredDate(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Recently" : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function readBalance() {
    const stored = BoxzyStorage.getItem("boxzyBalance");
    return Number(stored === null ? 450 : stored);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function notify(message, type = "success") {
    if (window.boxzyToast) {
      window.boxzyToast(message, { type });
      return;
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  function persistItem(item) {
    savedState[item.id] = { status: item.status, shipment: item.shipment || null, sold: Boolean(item.sold), autoSellAt: item.autoSellAt || null };
    BoxzyStorage.setItem(STATE_KEY, JSON.stringify(savedState));
  }

  function readAddresses() {
    const multiple = readJson("boxzyAddresses", []);
    const legacy = readJson("boxzyAddress", null);
    const source = Array.isArray(multiple) && multiple.length ? multiple : legacy ? [legacy] : [];
    const explicitDefaultIndex = source.findIndex((address) => Boolean(address.isDefault));
    return source.map((address, index) => ({
      id: address.id || `address-${index + 1}`,
      label: address.label || (explicitDefaultIndex === index || (explicitDefaultIndex < 0 && index === 0) ? "Home" : `Address ${index + 1}`),
      isDefault: explicitDefaultIndex >= 0 ? explicitDefaultIndex === index : index === 0,
      lines: [address.street, address.apartment, [address.city, address.state, address.zip].filter(Boolean).join(" "), address.country].filter(Boolean),
      raw: address,
    }));
  }

  function readDefaultAddress() {
    return readAddresses().find((address) => address.isDefault) || null;
  }

  function unopenedCard(box) {
    const reward = box.source === "reward";
    let available = BoxzyCatalog.canUse(box.boxKey);
    let pendingResult=null;
    try {pendingResult=window.BoxzyOpeningResults?.lookup(BoxzyStorage,`entitlement-${box.id}`);}catch(_){}
    const updating=pendingResult?.status==='updating' && (!pendingResult.poolVersion || pendingResult.poolVersion===BoxzyCatalog.boxes[box.boxKey]?.poolVersion);
    if(updating)available=false;
    const pending=Boolean(pendingResult && ['pending','ready'].includes(pendingResult.status));
    const sourceLabel = pending ? "RESULT PENDING" : !available ? "UPDATING" : reward ? "WEEKLY REWARD" : "PURCHASED";
    const sourceIcon = reward ? "i-trophy" : "i-bag";
    const origin = reward
      ? `<span class="unopened-origin">${escapeHtml(box.rewardRank || "Weekly prize")} · ${escapeHtml(box.rewardPeriod || "Leaderboard")}</span><span class="reward-delivered"><svg aria-hidden="true"><use href="#i-check"/></svg>Reward delivered ${escapeHtml(acquiredDate(box.acquiredAt))}</span>`
      : `<span class="unopened-origin">Purchased ${escapeHtml(acquiredDate(box.acquiredAt))}</span>`;
    return `<article class="collection-card unopened-card${reward ? " is-reward" : ""}${available ? "" : " is-updating"}" data-unopened-id="${escapeHtml(box.id)}">
      <div class="product-visual"><span class="unopened-source"><svg aria-hidden="true"><use href="#${sourceIcon}"/></svg>${sourceLabel}</span><img src="${escapeHtml(BoxzyCatalog.boxImage(box))}" alt="${escapeHtml(box.name)}"></div>
      <div class="product-details"><h2>${escapeHtml(box.name)}</h2>${origin}<div class="unopened-price"><small>${reward ? "Reward value" : "Paid"}</small><strong>${money(box.price)}</strong></div><p class="unopened-note${available ? '' : ' unavailable-note'}"><svg aria-hidden="true"><use href="#${available ? 'i-check' : 'i-info'}"/></svg><span>${pending ? 'Your result is saved. Check again.' : available ? 'Ready to open' : 'New prizes on the way.<br>Open once the update is complete.'}</span></p><button class="open-entitlement" type="button" data-open-entitlement="${escapeHtml(box.id)}" ${available ? '' : 'disabled aria-disabled="true"'}>${pending ? 'Check result' : 'Open now'}</button></div>
    </article>`;
  }

  function itemCard(item) {
    const shipped = item.status === "shipped";
    const autoSell = autoSellState(item);
    return `<article class="collection-card ${shipped ? "is-shipped" : ""}" tabindex="0" role="button" data-item-id="${escapeHtml(item.id)}" aria-label="View ${escapeHtml(item.name)} details">
      <div class="product-visual"><img loading="lazy" decoding="async" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><span class="status">${item.status.toUpperCase()}</span></div>
      <div class="product-details"><small class="product-type">${escapeHtml(item.type)}</small><h2>${escapeHtml(item.name)}</h2><div class="product-meta"><span class="product-date">${escapeHtml(item.date)}</span><strong class="product-value">${money(item.value)}</strong></div>${autoSell ? `<div class="auto-sell-line${autoSell.due ? " is-due" : ""}"><svg aria-hidden="true"><use href="#i-clock"/></svg><span>${escapeHtml(autoSell.label)}</span><small>${escapeHtml(autoSell.deadlineLabel)}</small></div>` : ""}</div>
    </article>`;
  }


  function startOpening(box) {
    if (!box || !BoxzyCatalog.guard(box.boxKey)) return;
    const now = new Date().toISOString();
    const session = {
      id: `resume-${box.id}`,
      orderIds: box.orderId ? [box.orderId] : [],
      entitlementIds: [box.id],
      version: 5,
      purchaseQuantity: 1,
      queue: [box.boxKey],
      completed: [],
      amount: 0,
      status: "paid",
      createdAt: box.acquiredAt || now,
      updatedAt: now,
    };
    BoxzyStorage.setItem("boxzyOpeningSession", JSON.stringify(session));
    BoxzyStorage.setItem(PENDING_OPEN_KEY, JSON.stringify({ entitlementId: box.id, boxKey: box.boxKey, source: box.source, selectedAt: now }));
    window.location.href = BoxzyCatalog.route("boxzy-interactive.html?open=1#boxes");
  }

  function render() {
    document.querySelectorAll("[data-filter]").forEach(tab=>{tab.classList.toggle("active",tab.dataset.filter===filter);tab.setAttribute("aria-selected",String(tab.dataset.filter===filter));});
    const source = emptyMode ? [] : items.filter((item) => !item.sold);
    const availableBoxes = emptyMode ? [] : unopenedBoxes;
    let entries = filter === "unopened"
      ? availableBoxes.map((value) => ({ kind: "box", value, amount: Number(value.price) || 0 }))
      : filter === "all"
        ? [...availableBoxes.map((value) => ({ kind: "box", value, amount: Number(value.price) || 0 })), ...source.map((value) => ({ kind: "item", value, amount: Number(value.value) || 0 }))]
        : source.filter((item) => item.status === filter).map((value) => ({ kind: "item", value, amount: Number(value.value) || 0 }));
    if (sort.value === "new") entries = [...entries].sort((a,b)=>new Date(b.value.acquiredAt||b.value.openedAt||b.value.date)-new Date(a.value.acquiredAt||a.value.openedAt||a.value.date));
    if (sort.value === "high") entries = [...entries].sort((a, b) => b.amount - a.amount);
    if (sort.value === "low") entries = [...entries].sort((a, b) => a.amount - b.amount);
    const vaultCount = source.filter((item) => item.status === "vault").length;
    const shippedCount = source.filter((item) => item.status === "shipped").length;
    const unopenedCount = availableBoxes.length;
    document.querySelector("#unopenedItems").textContent = unopenedCount;
    document.querySelector("#totalItems").textContent = source.length;
    document.querySelector("#totalValue").textContent = money(source.reduce((sum, item) => sum + item.value, 0));
    document.querySelector("#shippedItems").textContent = shippedCount;
    document.querySelector('[data-filter="all"] .count').textContent = source.length + unopenedCount;
    document.querySelector('[data-filter="unopened"] .count').textContent = unopenedCount;
    document.querySelector('[data-filter="vault"] .count').textContent = vaultCount;
    document.querySelector('[data-filter="shipped"] .count').textContent = shippedCount;
    sort.disabled = !entries.length;
    grid.classList.toggle("unopened-grid", filter === "unopened");
    grid.innerHTML = entries.map((entry) => entry.kind === "box" ? unopenedCard(entry.value) : itemCard(entry.value)).join("");
    grid.hidden = !entries.length;
    emptyState.hidden = Boolean(entries.length);
    vaultPolicy.hidden = filter !== "vault" || !vaultCount;
    unopenedPolicy.hidden = filter !== "unopened" || !unopenedCount;
    grid.querySelectorAll("[data-open-entitlement]").forEach((button) => {
      button.addEventListener("click", () => startOpening(unopenedBoxes.find((box) => box.id === button.dataset.openEntitlement)));
    });
    grid.querySelectorAll("[data-item-id]").forEach((card) => {
      card.addEventListener("click", () => openDrawer(items.find((item) => item.id === card.dataset.itemId), card));
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        card.click();
      });
    });
  }

  function shipmentMarkup(item) {
    const shipment = item.shipment || {};
    const lines = shipment.addressLines?.length ? shipment.addressLines : ["Shipping address on file"];
    const address = [shipment.addressLabel, ...lines].filter(Boolean).map((line) => `<span>${escapeHtml(line)}</span>`).join("");
    if (shipment.trackingNumber) {
      return `<h3>Shipment requested</h3><div class="shipment-address">${address}</div><small>Tracking number</small><strong class="tracking-number">${escapeHtml(shipment.carrier || "Carrier")} · ${escapeHtml(shipment.trackingNumber)}</strong><a class="track-package" href="${escapeHtml(shipment.trackingUrl || "#")}">Track package</a>`;
    }
    return `<h3>Shipment requested</h3><div class="shipment-address">${address}</div><small>Tracking number</small><p>Tracking will be added within 7 days.</p><div class="tracking-pending"><svg><use href="#i-clock"/></svg>Tracking pending</div>`;
  }

  function renderDrawer(item) {
    document.querySelector("#drawerStatus").textContent = item.status.toUpperCase();
    document.querySelector("#drawerStatus").classList.toggle("shipped", item.status === "shipped");
    document.querySelector("#drawerProductImage").src = item.image;
    document.querySelector("#drawerProductImage").alt = item.name;
    document.querySelector("#drawerProductType").textContent = item.type;
    document.querySelector("#drawerProductName").textContent = item.name;
    document.querySelector("#drawerProductValue").textContent = money(item.value);
    document.querySelector("#drawerProductBox").textContent = item.box;
    document.querySelector("#drawerProductDate").textContent = item.date;
    const timer = document.querySelector('#drawerDeadline');
    const deadline = autoSellState(item);
    if(timer){timer.hidden=!deadline;timer.textContent=deadline?deadline.label:'';timer.classList.toggle('is-due',Boolean(deadline?.due));}
    const shipped = item.status === "shipped";
    drawerActions.hidden = shipped;
    shipmentCard.hidden = !shipped;
    if (shipped) shipmentCard.innerHTML = shipmentMarkup(item);
    document.querySelector("#sellItem").textContent = `Sell for ${money(item.value * SELL_RATE)}`;
  }

  function openDrawer(item, trigger) {
    if (!item) return;
    activeItem = item;
    returnFocus = trigger || document.activeElement;
    renderDrawer(item);
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("overlay-open");
    requestAnimationFrame(() => drawer.querySelector(".drawer-close").focus());
  }

  function closeDrawer() {
    closeModal(shippingModal, false);
    closeModal(sellModal, false);
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("overlay-open");
    returnFocus?.focus?.();
  }

  function openModal(modal) {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => modal.querySelector(".modal-close").focus());
  }

  function closeModal(modal, restoreFocus = true) {
    if(modal===shippingModal){shippingGeneration++;shippingQuote=null;}
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    if (restoreFocus) drawer.querySelector(".drawer-close")?.focus();
  }

  function renderDefaultAddress() {
    const address = readDefaultAddress();
    if (!address) {
      defaultShippingAddress.classList.add("is-empty");
      defaultShippingAddress.innerHTML = `<strong>No default shipping address</strong><span>Add an address or set one as default before continuing.</span>`;
      payShipping.disabled = true;
      return;
    }
    defaultShippingAddress.classList.remove("is-empty");
    defaultShippingAddress.innerHTML = `<span class="default-address-badge">DEFAULT</span><strong>${escapeHtml(address.label)}</strong>${address.lines.map((line) => `<small>${escapeHtml(line)}</small>`).join("")}`;
    payShipping.disabled = false;
  }

  async function refreshShippingQuote() {
    const generation=++shippingGeneration;
    shippingQuote=null;
    const address=readDefaultAddress();
    const error=document.querySelector('#shippingError');error.hidden=true;
    for(const id of ['shippingFee','handlingFee','shippingTax','shippingTotal']) document.getElementById(id).textContent='—';
    payShipping.disabled=true;payShipping.textContent=address?'Calculating…':'Add a shipping address';
    if(!address || !activeItem)return;
    const signature=JSON.stringify(address.raw),itemId=activeItem.id;
    try {
      const response=window.BoxzyShippingAPI?.quote
        ? await window.BoxzyShippingAPI.quote({itemId,address:address.raw})
        : await new Promise(resolve=>setTimeout(()=>resolve(BoxzyShippingQuote.example()),300));
      if(generation!==shippingGeneration)return;
      shippingQuote={...BoxzyShippingQuote.normalize(response),addressSignature:signature,itemId};
      for(const [id,key] of [['shippingFee','shippingCents'],['handlingFee','handlingCents'],['shippingTax','taxCents'],['shippingTotal','totalCents']])document.getElementById(id).textContent=money(shippingQuote[key]/100);
      document.querySelector('.fee-example').textContent=shippingQuote.example?'Example fees':'Fees';
      payShipping.textContent=`Pay ${money(shippingQuote.totalCents/100)} and ship`;payShipping.disabled=false;
    } catch(_){
      if(generation!==shippingGeneration)return;
      error.textContent='Unable to calculate fees. Please try again.';error.hidden=false;
      payShipping.textContent='Retry fee calculation';payShipping.disabled=false;
    }
  }
  function openShipping() {
    if(!activeItem)return;
    const product=document.querySelector('#shippingProduct');
    if(product){product.hidden=false;document.querySelector('#shippingProductImage').src=activeItem.image;document.querySelector('#shippingProductImage').alt=activeItem.name;document.querySelector('#shippingProductName').textContent=activeItem.name;}
    renderDefaultAddress();openModal(shippingModal);refreshShippingQuote();
  }
  function finishShippingPayment() {
    if(shippingProcessing || !activeItem || activeItem.status!=='vault' || activeItem.sold)return;
    if(!shippingQuote){refreshShippingQuote();return;}
    const address=readDefaultAddress();
    if(!address)return;
    if(shippingQuote.addressSignature!==JSON.stringify(address.raw) || shippingQuote.itemId!==activeItem.id){renderDefaultAddress();refreshShippingQuote();return;}
    const cents=Math.round(readBalance()*100),total=shippingQuote.totalCents;
    if(cents<total){window.boxzyDeposit?.open({amount:(total-cents)/100,onSuccess:finishShippingPayment});return;}
    shippingProcessing=true;payShipping.disabled=true;
    const previousState=BoxzyStorage.getItem(STATE_KEY),previousStatus=activeItem.status,previousShipment=activeItem.shipment,previousSavedItem=savedState[activeItem.id];
    try {
      activeItem.status='shipped';
      activeItem.shipment={requestedAt:new Date().toISOString(),addressLabel:address.label,addressLines:address.lines,trackingNumber:null,fees:{shippingCents:shippingQuote.shippingCents,handlingCents:shippingQuote.handlingCents,taxCents:shippingQuote.taxCents,totalCents:total}};
      persistItem(activeItem);
      BoxzyStorage.setItem('boxzyBalance',String((cents-total)/100));
      window.dispatchEvent(new CustomEvent('boxzy-balance-updated',{detail:{balance:(cents-total)/100}}));
      closeModal(shippingModal,false);filter='shipped';render();renderDrawer(activeItem);
    } catch(_) {
      activeItem.status=previousStatus;activeItem.shipment=previousShipment;
      if(previousSavedItem===undefined)delete savedState[activeItem.id];else savedState[activeItem.id]=previousSavedItem;
      if(previousState===null)BoxzyStorage.removeItem(STATE_KEY);else BoxzyStorage.setItem(STATE_KEY,previousState);
      BoxzyStorage.setItem('boxzyBalance',String(cents/100));
      const error=document.querySelector('#shippingError');error.textContent='Shipping failed. Please try again.';error.hidden=false;payShipping.disabled=false;
    } finally {shippingProcessing=false;}
  }
  window.addEventListener('focus',()=>{if(shippingModal.classList.contains('open')){renderDefaultAddress();refreshShippingQuote();}});

  function openSell() {
    if (!activeItem) return;
    const offer = activeItem.value * SELL_RATE;
    document.querySelector("#sellProductImage").src = activeItem.image;
    document.querySelector("#sellProductImage").alt = activeItem.name;
    document.querySelector("#sellProductName").textContent = activeItem.name;
    document.querySelector("#sellProductMeta").textContent = `MARKET VALUE ${money(activeItem.value)}`;
    document.querySelector("#sellOffer").textContent = money(offer);
    document.querySelector("#confirmSell").textContent = `Sell for ${money(offer)}`;
    openModal(sellModal);
  }

  function confirmSell() {
    if (!activeItem || activeItem.sold || activeItem.status!=="vault") return;
    const offer = Math.round(activeItem.value * SELL_RATE * 100) / 100;
    const sold = readJson(SOLD_KEY, []);
    sold.unshift({ ...activeItem, credit: offer, soldAt: new Date().toISOString() });
    BoxzyStorage.setItem(SOLD_KEY, JSON.stringify(sold.slice(0, 50)));
    const nextBalance = readBalance() + offer;
    BoxzyStorage.setItem("boxzyBalance", String(nextBalance));
    window.dispatchEvent(new CustomEvent("boxzy-balance-updated", { detail: { balance: nextBalance } }));
    activeItem.sold = true;
    persistItem(activeItem);
    closeModal(sellModal, false);
    closeDrawer();
    render();
    window.boxzyToast?.(`Sold for ${money(offer)}. Added to your balance.`,{type:'success'});
  }

  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
    filter = tab.dataset.filter;
    document.querySelectorAll(".tab").forEach((item) => item.classList.toggle("active", item === tab));
    render();
  }));
  sort.addEventListener("change", render);
  document.querySelector("[data-close-drawer]").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", () => closeModal(button.closest(".collection-modal-backdrop"))));
  document.querySelector("#shipItem").addEventListener("click", openShipping);
  document.querySelector("#sellItem").addEventListener("click", openSell);
  payShipping.addEventListener("click", finishShippingPayment);
  document.querySelector("#confirmSell").addEventListener("click", confirmSell);
  drawer.addEventListener("click", (event) => { if (event.target === drawer) closeDrawer(); });
  [shippingModal, sellModal].forEach((modal) => modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(modal); }));
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (sellModal.classList.contains("open")) closeModal(sellModal);
    else if (shippingModal.classList.contains("open")) closeModal(shippingModal);
    else if (drawer.classList.contains("open")) closeDrawer();
  });

  render();
  if (BoxzyCatalog.isolated) {
    const view=new URLSearchParams(location.search).get('panel');
    if(['drawer','shipping','sell'].includes(view)){
      openDrawer(items.find(i=>i.status==='vault'));
      if(view==='shipping')openShipping();
      if(view==='sell')openSell();
    }
  }
  window.setInterval(() => {
    render();
    if (activeItem && drawer.classList.contains("open")) renderDrawer(activeItem);
  }, 60000);
})();
