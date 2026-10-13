/* Result lookup only. This module never purchases, draws, refunds or credits money. */
(function (root) {
  const KEY = 'boxzyOpeningResults.v1';
  function lookup(storage, id) {
    const records = JSON.parse(storage.getItem(KEY) || '{}');
    return records[id] || null;
  }
  function validProduct(p) {
    return Boolean(p && typeof p.name === 'string' && p.name.trim() &&
      typeof p.rarity === 'string' && p.rarity.trim() &&
      typeof p.value === 'number' && Number.isFinite(p.value) && p.value >= 0);
  }
  function create({storage, fetchResult, onState, timeoutMs = 15000, slowMs = 5000, pollMs = 1500}) {
    let generation = 0, activeId = null, controller = null, timers = [];
    const write = record => {
      const records = JSON.parse(storage.getItem(KEY) || '{}');
      records[record.id] = record;
      storage.setItem(KEY, JSON.stringify(records));
      return record;
    };
    const stop = () => {
      generation++; activeId = null;
      controller?.abort(); controller = null;
      timers.forEach(clearTimeout); timers = [];
    };
    const read = id => lookup(storage, id);
    const ensure = (id, meta) => read(id) || write({
      ...meta, id, status: 'pending', createdAt: new Date().toISOString(), videoEnded: false
    });
    const update = (id, fields) => {
      const existing = read(id);
      if (!existing) throw new Error('Opening reference missing');
      return write({...existing, ...fields, id});
    };
    function check(id) {
      if (activeId === id) return; // ended + skip + repeated clicks share one lookup.
      stop();
      const token = generation;
      activeId = id;
      controller = new AbortController();
      const signal = controller.signal;
      const emit = (state, record) => onState({state, record, openingId:id});
      const finish = (state, record) => {
        if (generation !== token) return;
        stop(); emit(state, record);
      };
      let record;
      try { record = read(id); } catch (_) { finish('storage-error', null); return; }
      if (!record) { finish('unavailable', null); return; }
      if (record.status === 'resolved') { finish('resolved', record); return; }
      if (record.status === 'ready' && validProduct(record.product)) { finish('ready',record); return; }
      emit('loading', record);
      timers.push(setTimeout(() => { if (generation === token) emit('slow',record); },slowMs));
      timers.push(setTimeout(() => finish('timeout',record),timeoutMs));
      async function poll() {
        let response;
        try { response = await fetchResult({openingId:id, record, signal}); }
        catch (_) { if (generation === token) finish('network',record); return; }
        if (generation !== token) return; // Ignore late replies after close/retry/timeout.
        if (response?.openingId && response.openingId !== id) { finish('unavailable',record); return; }
        if (response?.status === 'ready') {
          if (!validProduct(response.product)) { finish('unavailable',record); return; }
          try { record = update(id,{status:'ready',product:response.product}); }
          catch (_) { finish('storage-error',record); return; }
          finish('ready',record);
        } else if (['failed','updating'].includes(response?.status)) {
          try { record = update(id,{status:response.status}); }
          catch (_) { finish('storage-error',record); return; }
          finish(response.status,record);
        } else if (response?.status === 'pending') {
          timers.push(setTimeout(poll,pollMs));
        } else {
          // Empty / malformed / 404 is not proof of 'no prize' or of a refund.
          finish('unavailable',record);
        }
      }
      poll();
    }
    return {ensure,read,update,check,stop,
      resolve(id,decision) { stop(); return update(id,{status:'resolved',decision}); }};
  }
  root.BoxzyOpeningResults = {KEY,lookup,validProduct,create};
})(typeof window === 'object' ? window : globalThis);
