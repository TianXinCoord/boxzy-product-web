(() => {
  const products = [
    {
      name: "Scarlet & Violet Booster Bundle",
      value: 20,
      tier: "common",
      label: "COMMON",
      image: "assets/pokemon-tcg-sealed/booster-pack/destined-rivals-booster.jpg",
    },
    {
      name: "Radiant Eevee Premium Collection",
      value: 30,
      tier: "common",
      label: "COMMON",
      image: "assets/pokemon-tcg-sealed/premium-collection/radiant-eevee-premium.jpg",
    },
    {
      name: "Prismatic Evolutions Booster Bundle",
      value: 45,
      tier: "common",
      label: "COMMON",
      image: "assets/pokemon-tcg-sealed/booster-bundle/prismatic-evolutions-bundle.jpg",
    },
    {
      name: "Black Collector Box",
      value: 55,
      tier: "uncommon",
      label: "UNCOMMON",
      image: "assets/boxzy/real-products/black-collector-box-cutout.png",
    },
    {
      name: "30th Celebration Elite Trainer Box",
      value: 65,
      tier: "uncommon",
      label: "UNCOMMON",
      image: "assets/boxzy/real-products/30th-celebration-etb-cutout.png",
    },
    {
      name: "Legendary Treasures Display",
      value: 100,
      tier: "rare",
      label: "RARE",
      image: "assets/boxzy/real-products/legendary-treasures-display-cutout.png",
    },
    {
      name: "Vintage Charizard Booster Pack",
      value: 100000,
      tier: "jackpot",
      label: "JACKPOT",
      image: "assets/boxzy/real-products/vintage-charizard-pack-cutout.png",
    },
  ];

  const grid = document.querySelector("#productGrid");
  const sort = document.querySelector("#sort");
  const productDialog = document.querySelector("#productDialog");
  const explainDialog = document.querySelector("#explainDialog");
  const toast = document.querySelector("#toast");
  const SESSION_KEY = "boxzyOpeningSession";
  const UNOPENED_KEY = "boxzyUnopenedBoxes";
  const requestParams = new URLSearchParams(location.search);
  const requestedBox = requestParams.get("box");
  const requestedEntitlement = requestParams.get("entitlement");
  const boxConfigs = Object.fromEntries(Object.entries(BoxzyCatalog.boxes).map(([key,box])=>[key,{...box,copy:{discovery:'Begin your collection journey.',collector:'Step up to a stronger sealed product pool.',elite:'Discover the Elite collection.',vault:'Open the highest tier BOXZY experience.'}[key]}]));
  const availabilityByTier = {
    common: [
      { box: "discovery", chance: "20.1%" },
      { box: "collector", chance: "8.4%" },
      { box: "vault", chance: "2.1%" },
    ],
    uncommon: [
      { box: "discovery", chance: "9.8%" },
      { box: "collector", chance: "12.6%" },
      { box: "vault", chance: "5.4%" },
    ],
    rare: [
      { box: "discovery", chance: "1.0%" },
      { box: "collector", chance: "4.6%" },
      { box: "vault", chance: "7.8%" },
    ],
    jackpot: [
      { box: "discovery", chance: "0.01%" },
      { box: "collector", chance: "0.03%" },
      { box: "vault", chance: "0.08%" },
    ],
  };
  const BOX_KEY = boxConfigs[requestedBox] ? requestedBox : "discovery";
  const boxConfig = boxConfigs[BOX_KEY];
  const BOX_PRICE = boxConfig.price;
  const PURCHASE_QUANTITY = 1;
  const boxCollectionImages = {
    discovery: "assets/boxzy/catalog/starter.png",
    collector: "assets/boxzy/catalog/super.png",
    elite: "assets/boxzy/catalog/elite.png",
    vault: "assets/boxzy/catalog/ultra.png",
  };
  const readUnopenedBoxes = () => {
    try {
      const value = JSON.parse(BoxzyStorage.getItem(UNOPENED_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  };
  const activeEntitlement = readUnopenedBoxes().find((box) => box.id === requestedEntitlement && box.boxKey === BOX_KEY) || null;

  document.title = `${boxConfig.name} — BOXZY`;
  document.querySelector("#boxName").textContent = boxConfig.name;
  document.querySelector(".box-copy").textContent = boxConfig.copy;
  document.querySelector(".box-price strong").textContent = `$${boxConfig.price}`;
  document.querySelector(".box-visual img").src = boxConfig.image;
  document.querySelector(".box-visual img").alt = boxConfig.name;
  document.querySelector(".crumbs span:last-child").textContent = boxConfig.name;
  if (activeEntitlement) {
    document.querySelector(".box-price strong").textContent = "Purchased";
    document.querySelector(".box-price span").textContent = "ready to open";
    document.querySelector("#openBox").textContent = "Open now";
  }

  if (!BoxzyCatalog.canUse(BOX_KEY)) {
    const button=document.querySelector('#openBox');button.disabled=true;button.textContent=activeEntitlement?'Open now':'Updating prizes';
    const note=document.createElement('p');note.className='unopened-note unavailable-note';note.textContent=BoxzyCatalog.message;button.after(note);
  }
  const money = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);

  const showDialog = (dialog) => {
    if (!dialog) return;
    dialog.classList.add("open");
    document.body.style.overflow = "hidden";
  };

  const closeDialog = (dialog) => {
    if (!dialog) return;
    dialog.classList.remove("open");
    if (!document.querySelector(".box-dialog-backdrop.open")) document.body.style.overflow = "";
  };

  const showToast = (message) => {
    if (window.boxzyToast) {
      window.boxzyToast(message, { type: /failed|error/i.test(message) ? "error" : "info" });
      return;
    }
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const readBalance = () => {
    const stored = BoxzyStorage.getItem("boxzyBalance");
    return Number(stored === null ? 100 : stored);
  };

  const continueToOpening = () => {
    window.location.href = BoxzyCatalog.route("boxzy-interactive.html?open=1#boxes");
  };

  const openStoredEntitlement = () => {
    if (!BoxzyCatalog.guard(BOX_KEY)) return;
    if (!activeEntitlement) return;
    const now = new Date().toISOString();
    const session = {
      id: `resume-${activeEntitlement.id}`,
      orderIds: activeEntitlement.orderId ? [activeEntitlement.orderId] : [],
      entitlementIds: [activeEntitlement.id],
      version: 5,
      purchaseQuantity: 1,
      queue: [activeEntitlement.boxKey],
      completed: [],
      amount: 0,
      status: "paid",
      createdAt: activeEntitlement.acquiredAt || now,
      updatedAt: now,
    };
    BoxzyStorage.setItem(SESSION_KEY, JSON.stringify(session));
    BoxzyStorage.setItem("boxzyPendingOpen", JSON.stringify({ entitlementId: activeEntitlement.id, boxKey: activeEntitlement.boxKey, source: activeEntitlement.source, selectedAt: now }));
    continueToOpening();
  };

  const purchaseBoxes = () => {
    if (!BoxzyCatalog.guard(BOX_KEY)) return;
    if (BoxzyStorage.getItem("boxzyAuthenticated") !== "true") {
      sessionStorage.setItem("boxzyPendingPurchase", JSON.stringify({ box: BOX_KEY, quantity: PURCHASE_QUANTITY }));
      window.location.href = BoxzyCatalog.route("boxzy-interactive.html?auth=login");
      return;
    }
    const total = BOX_PRICE;
    const balance = readBalance();
    if (balance < total) {
      window.boxzyDeposit?.open({
        amount: Math.max(5, Math.ceil(total - balance)),
        onSuccess: purchaseBoxes,
      });
      return;
    }

    const previousSession = BoxzyStorage.getItem(SESSION_KEY);
    const previousOrders = BoxzyStorage.getItem("boxzyOrders");
    const previousUnopened = BoxzyStorage.getItem(UNOPENED_KEY);
    const nextBalance = balance - total;
    const orderId = `order-${Date.now()}`;
    try {
      const createdAt = new Date().toISOString();
      const entitlementId = `entitlement-${Date.now()}`;
      const previousOpening = previousSession ? JSON.parse(previousSession) : null;
      const session = {
        id: orderId,
        orderIds: [orderId],
        entitlementIds: [entitlementId],
        version: 5,
        purchaseQuantity: PURCHASE_QUANTITY,
        queue: [BOX_KEY],
        completed: [],
        amount: total,
        status: "paid",
        createdAt,
        updatedAt: createdAt,
      };
      const orders = JSON.parse(previousOrders || "[]");
      if (previousOpening?.queue?.length) {
        const previousOrderIds = previousOpening.orderIds || [previousOpening.id];
        orders.filter((order) => previousOrderIds.includes(order.id)).forEach((order) => {
          order.status = "unopened";
          order.updatedAt = createdAt;
          order.savedAt = createdAt;
        });
      }
      orders.unshift({ id: orderId, boxKey: BOX_KEY, quantity: PURCHASE_QUANTITY, amount: total, status: "paid", createdAt });
      const unopened = readUnopenedBoxes();
      unopened.unshift({ id: entitlementId, orderId, name: boxConfig.name, boxKey: BOX_KEY, price: BOX_PRICE, source: "purchase", acquiredAt: createdAt, image: boxCollectionImages[BOX_KEY] });
      BoxzyStorage.setItem("boxzyBalance", String(nextBalance));
      BoxzyStorage.setItem(SESSION_KEY, JSON.stringify(session));
      BoxzyStorage.setItem("boxzyOrders", JSON.stringify(orders.slice(0, 100)));
      BoxzyStorage.setItem(UNOPENED_KEY, JSON.stringify(unopened));
      window.dispatchEvent(new CustomEvent("boxzy-balance-updated", { detail: { balance: nextBalance } }));
      continueToOpening();
    } catch (_) {
      BoxzyStorage.setItem("boxzyBalance", String(balance));
      if (previousSession === null) BoxzyStorage.removeItem(SESSION_KEY); else BoxzyStorage.setItem(SESSION_KEY, previousSession);
      if (previousOrders === null) BoxzyStorage.removeItem("boxzyOrders"); else BoxzyStorage.setItem("boxzyOrders", previousOrders);
      if (previousUnopened === null) BoxzyStorage.removeItem(UNOPENED_KEY); else BoxzyStorage.setItem(UNOPENED_KEY, previousUnopened);
      showToast("Payment failed. Please try again.");
    }
  };

  const openProduct = (product) => {
    const image = productDialog.querySelector("#dialogProductImage");
    const tier = productDialog.querySelector("#dialogTier");
    image.src = product.image;
    image.alt = product.name;
    tier.textContent = product.label;
    tier.className = `dialog-tier ${product.tier}`;
    productDialog.querySelector("#productDialogTitle").textContent = product.name;
    productDialog.querySelector("#dialogValue").textContent = money(product.value);
    productDialog.querySelector("#dialogAvailableBoxes").innerHTML = (availabilityByTier[product.tier] || []).map(({ box, chance }) => {
      const config = boxConfigs[box];
      return `<a class="available-box" href="boxzy-box.html?box=${box}"><img src="${config.image}" alt=""><span><strong>${config.name}</strong><small>${chance} DROP CHANCE</small></span><em>View</em><i aria-hidden="true">›</i></a>`;
    }).join("");
    showDialog(productDialog);
  };

  const renderProducts = () => {
    if (!grid) return;
    const direction = sort?.value === "low" ? 1 : -1;
    const ordered = [...products].sort((a, b) => (a.value - b.value) * direction);

    grid.innerHTML = "";
    ordered.forEach((product) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "prize-card";
      card.setAttribute("aria-label", `${product.name}, ${money(product.value)}`);
      card.innerHTML = `
        <span class="prize-image">
          <span class="tier ${product.tier}">${product.label}</span>
          <img src="${product.image}" alt="${product.name}" loading="lazy">
        </span>
        <span class="prize-body">
          <h3>${product.name}</h3>
          <strong class="prize-value">${money(product.value)}</strong>
        </span>
      `;
      card.addEventListener("click", () => openProduct(product));
      grid.appendChild(card);
    });
  };

  sort?.addEventListener("change", renderProducts);

  document.querySelectorAll("[data-explain]").forEach((button) => {
    button.addEventListener("click", () => showDialog(explainDialog));
  });

  document.querySelector("#openBox")?.addEventListener("click", () => {
    if (!BoxzyCatalog.guard(BOX_KEY)) return;
    if (activeEntitlement) {
      openStoredEntitlement();
      return;
    }
    if (BoxzyStorage.getItem("boxzyAuthenticated") !== "true") {
      sessionStorage.setItem("boxzyPendingPurchase", JSON.stringify({ box: BOX_KEY, quantity: 1 }));
      window.location.href = BoxzyCatalog.route("boxzy-interactive.html?auth=login");
      return;
    }
    purchaseBoxes();
  });

  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(button.closest(".box-dialog-backdrop")));
  });

  [productDialog, explainDialog].forEach((dialog) => {
    dialog?.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openDialog = document.querySelector(".box-dialog-backdrop.open");
    if (openDialog) closeDialog(openDialog);
  });

  renderProducts();
})();
