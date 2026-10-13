(() => {
  const format = (value) => `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const refreshBalance = () => { const stored = BoxzyStorage.getItem("boxzyBalance"); document.querySelectorAll("[data-balance]").forEach((element) => { element.textContent = format(stored === null ? 450 : stored); }); };
  const modal = document.querySelector("[data-address-modal]");
  const form = document.querySelector("[data-address-form]");
  const error = document.querySelector("[data-address-error]");
  const title = document.querySelector("#addressModalTitle");
  const submit = form.querySelector('[type="submit"]');
  const empty = document.querySelector("[data-address-empty]");
  const list = document.querySelector("[data-address-list]");
  const headingAdd = document.querySelector("[data-heading-add]");
  const deleteModal = document.querySelector("[data-address-delete-modal]");
  const suggestions = document.querySelector("[data-address-suggestions]");
  const toast = document.querySelector("#toast");
  let editingId = null;
  let removingId = null;
  let returnFocus = null;
  let timer;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const notify = (message, type = "success") => { if (window.boxzyToast) { window.boxzyToast(message, { type }); return; } clearTimeout(timer); toast.textContent = message; toast.classList.add("show"); timer = setTimeout(() => toast.classList.remove("show"), 2200); };

  function write(addresses) {
    const hasDefault = addresses.some((address) => address.isDefault);
    const normalized = addresses.map((address, index) => ({ ...address, isDefault: hasDefault ? Boolean(address.isDefault) : index === 0 }));
    BoxzyStorage.setItem("boxzyAddresses", JSON.stringify(normalized));
    const defaultAddress = normalized.find((address) => address.isDefault) || normalized[0] || null;
    if (defaultAddress) BoxzyStorage.setItem("boxzyAddress", JSON.stringify(defaultAddress));
    else BoxzyStorage.removeItem("boxzyAddress");
  }

  function read() {
    try {
      const multiple = JSON.parse(BoxzyStorage.getItem("boxzyAddresses") || "[]");
      if (Array.isArray(multiple) && multiple.length) return multiple;
      const legacy = JSON.parse(BoxzyStorage.getItem("boxzyAddress") || "null");
      if (!legacy) return [];
      const migrated = [{ id: legacy.id || `address-${Date.now()}`, label: legacy.label || "Home", ...legacy, isDefault: true }];
      write(migrated);
      return migrated;
    } catch (_) {
      return [];
    }
  }

  const demoAddresses = [
    { id: "demo-address-home", label: "Home", firstName: "Avery", lastName: "Carter", country: "United States", street: "350 Fifth Avenue", apartment: "Apt 41B", city: "New York", state: "NY", zip: "10118", phone: "(212) 555-0147", email: "avery.carter@example.com", isDefault: true },
    { id: "demo-address-office", label: "Office", firstName: "Morgan", lastName: "Lee", country: "United States", street: "1 Market Street", apartment: "Suite 1800", city: "San Francisco", state: "CA", zip: "94105", phone: "(415) 555-0182", email: "morgan.lee@example.com", isDefault: false },
    { id: "demo-address-family", label: "Family", firstName: "Jordan", lastName: "Brooks", country: "United States", street: "233 S Wacker Drive", apartment: "Apt 2704", city: "Chicago", state: "IL", zip: "60606", phone: "(312) 555-0164", email: "jordan.brooks@example.com", isDefault: false }
  ];
  function seedDemoAddresses() {
    if (BoxzyStorage.getItem("boxzyAddressDemoSeedV1") === "true") return;
    const saved = read();
    const savedIds = new Set(saved.map((address) => address.id));
    const hasDefault = saved.some((address) => address.isDefault);
    const additions = demoAddresses.filter((address) => !savedIds.has(address.id)).map((address, index) => ({ ...address, isDefault: hasDefault ? false : saved.length === 0 && index === 0 }));
    write([...saved, ...additions]);
    BoxzyStorage.setItem("boxzyAddressDemoSeedV1", "true");
  }

  function render() {
    const addresses = read().sort((a,b)=>Number(Boolean(b.isDefault))-Number(Boolean(a.isDefault)));
    empty.hidden = Boolean(addresses.length);
    list.hidden = !addresses.length;
    headingAdd.hidden = !addresses.length;
    list.innerHTML = addresses.map((address) => `<article class="address-card">
      <div class="pin-badge small"><svg class="icon"><use href="#i-pin"/></svg></div>
      <div class="saved-address"><span class="address-label">${escapeHtml(address.label || "Address")}</span><div><strong>${escapeHtml(`${address.firstName} ${address.lastName}`)}</strong><span class="default-badge" ${address.isDefault ? "" : "hidden"}>Default</span></div><p>${escapeHtml([address.street, address.apartment, `${address.city}, ${address.state} ${address.zip}`, address.country].filter(Boolean).join(" · "))}</p><span>${escapeHtml(`${address.phone} · ${address.email}`)}</span></div>
      <div class="address-actions"><button type="button" data-address-edit="${escapeHtml(address.id)}"><svg class="icon"><use href="#i-pencil"/></svg>Edit</button>${address.isDefault?'':`<button type="button" data-address-default="${escapeHtml(address.id)}">Set as default</button>`}<button class="danger" type="button" data-address-remove="${escapeHtml(address.id)}"><svg class="icon"><use href="#i-trash"/></svg>Remove</button></div>
    </article>`).join("");
    list.querySelectorAll("[data-address-edit]").forEach((button) => button.addEventListener("click", () => open(button.dataset.addressEdit)));
    list.querySelectorAll("[data-address-default]").forEach((button) => button.addEventListener("click", () => setDefault(button.dataset.addressDefault)));
    list.querySelectorAll("[data-address-remove]").forEach((button) => button.addEventListener("click", () => openRemove(button.dataset.addressRemove)));
  }

  function fill(address) {
    form.reset();
    if (!address) {
      form.elements.country.value = "United States";
      form.elements.isDefault.checked = read().length === 0;
      return;
    }
    Object.entries(address).forEach(([key, value]) => {
      if (!form.elements[key]) return;
      if (form.elements[key].type === "checkbox") form.elements[key].checked = Boolean(value);
      else form.elements[key].value = value;
    });
  }

  function open(id = null) {
    editingId = id;
    returnFocus = document.activeElement;
    const address = id ? read().find((item) => item.id === id) : null;
    fill(address);
    error.textContent = "";
    title.textContent = address ? "Edit address" : "Add address";
    submit.textContent = address ? "Save changes" : "Add address";
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    requestAnimationFrame(() => form.elements.label.focus());
  }

  function close() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    returnFocus?.focus?.();
  }

  function remove(id) {
    const addresses = read().filter((address) => address.id !== id);
    if (addresses.length && !addresses.some((address) => address.isDefault)) addresses[0].isDefault = true;
    write(addresses);
    render();
    notify("Address removed.");
  }

  function setDefault(id) {
    write(read().map((address) => ({ ...address, isDefault: address.id === id })));
    render();
    notify("Default address updated.");
  }

  function openRemove(id){removingId=id;deleteModal.classList.add("open");deleteModal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open");requestAnimationFrame(()=>deleteModal.querySelector("[data-address-delete-confirm]").focus())}
  function closeRemove(){deleteModal.classList.remove("open");deleteModal.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");removingId=null}

  document.querySelectorAll("[data-address-open]").forEach((button) => button.addEventListener("click", () => open()));
  document.querySelectorAll("[data-address-close]").forEach((button) => button.addEventListener("click", close));
  modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
  document.querySelectorAll("[data-address-delete-close]").forEach(button=>button.addEventListener("click",closeRemove));
  deleteModal.addEventListener("click",event=>{if(event.target===deleteModal)closeRemove()});
  deleteModal.querySelector("[data-address-delete-confirm]").addEventListener("click",()=>{const id=removingId;closeRemove();if(id)remove(id)});
  const streetInput=form.elements.street;
  const suggestionData=[
    {street:"350 Fifth Avenue",city:"New York",state:"NY",zip:"10118"},
    {street:"11 Wall Street",city:"New York",state:"NY",zip:"10005"},
    {street:"1 Market Street",city:"San Francisco",state:"CA",zip:"94105"}
  ];
  streetInput.addEventListener("input",()=>{const query=streetInput.value.trim().toLowerCase();if(query.length<2){suggestions.hidden=true;return}const matches=suggestionData.filter(item=>item.street.toLowerCase().includes(query));suggestions.innerHTML=matches.map((item,index)=>`<button type="button" data-suggestion="${index}"><strong>${escapeHtml(item.street)}</strong><span>${escapeHtml(`${item.city}, ${item.state} ${item.zip}`)}</span></button>`).join("");suggestions.hidden=!matches.length;suggestions.querySelectorAll("button").forEach((button,index)=>button.addEventListener("click",()=>{const item=matches[index];streetInput.value=item.street;form.elements.city.value=item.city;form.elements.state.value=item.state;form.elements.zip.value=item.zip;suggestions.hidden=true;form.elements.apartment.focus()}))});
  document.addEventListener("click",event=>{if(!event.target.closest(".street-field"))suggestions.hidden=true});
  document.addEventListener("keydown", (event) => { if (event.key !== "Escape") return;if(deleteModal.classList.contains("open"))closeRemove();else if (modal.classList.contains("open")) close(); });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      error.textContent = "Complete all required fields with valid information.";
      form.querySelector(":invalid")?.focus();
      return;
    }
    const addresses = read();
    const data = Object.fromEntries(new FormData(form));
    data.id = editingId || `address-${Date.now()}`;
    data.isDefault = form.elements.isDefault.checked || addresses.length === 0;
    let next = editingId ? addresses.map((address) => address.id === editingId ? data : address) : [...addresses, data];
    if (data.isDefault) next = next.map((address) => ({ ...address, isDefault: address.id === data.id }));
    write(next);
    render();
    close();
    notify(editingId ? "Address updated." : "Address saved.");
  });

  document.querySelectorAll("[data-deposit]").forEach((button) => button.addEventListener("click", () => window.boxzyDeposit?.open()));
  addEventListener("boxzy-balance-updated", refreshBalance);
  seedDemoAddresses();
  refreshBalance();
  render();
})();
