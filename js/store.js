const Store = (() => {
  const STORAGE_KEY = "ecotrack_v2";

  const DEFAULT = Object.freeze({
    state: {
      transport: 0, energy: 0, food: 0, waste: 0,
      goods: 0, water: 0, technology: 0, aviation: 0
    },
    total: 0,
    yearly: 0,
    score: 0,
    grade: "~",
    topContributor: "None",
    time: null
  });

  /** @type {Set<function>} */
  const _listeners = new Set();

  /**
   * Returns a deep clone of DEFAULT merged with any valid stored data.
   * Guarantees every expected key exists and is the right type.
   * @returns {Object}
   */
  function load() {
    const stored = lsGet(STORAGE_KEY, null);
    if (!stored || typeof stored !== "object") return _defaults();

    return {
      state:          _mergeState(stored.state),
      total:          _safeNum(stored.total),
      yearly:         _safeNum(stored.yearly),
      score:          _safeNum(stored.score),
      grade:          _safeGrade(stored.grade),
      topContributor: typeof stored.topContributor === "string"
                        ? stored.topContributor : "None",
      time:           typeof stored.time === "number" ? stored.time : null
    };
  }

  /**
   * Persists data and notifies all subscribers.
   * @param {Object} data
   */
  function save(data) {
    if (!data || typeof data !== "object") {
      console.warn("[Store] save() called with invalid data");
      return;
    }
    const payload = { ...data, time: Date.now() };
    const ok = lsSet(STORAGE_KEY, payload);
    if (ok) _publish(payload);
  }

  function reset() {
    lsRemove(STORAGE_KEY);
    _publish(_defaults());
  }

  /**
   * Registers a subscriber function. Returns an unsubscribe callback.
   * @param {function} fn
   * @returns {function}
   */
  function subscribe(fn) {
    if (typeof fn !== "function") {
      console.warn("[Store] subscribe() requires a function");
      return () => {};
    }
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }


  function _publish(data) {
    _listeners.forEach(fn => {
      try { fn(data); }
      catch (e) { console.warn("[Store] Subscriber error:", e.message); }
    });
  }

  function _defaults() {
    return JSON.parse(JSON.stringify(DEFAULT)); 
  }

  function _safeNum(val) {
    const n = parseFloat(val);
    return Number.isFinite(n) ? n : 0;
  }

  function _safeGrade(val) {
    return ["A","B","C","D","E","~"].includes(val) ? val : "~";
  }

  function _mergeState(raw) {
    const base = { ...DEFAULT.state };
    if (!raw || typeof raw !== "object") return base;
    Object.keys(base).forEach(k => {
      if (typeof raw[k] === "number" && Number.isFinite(raw[k])) {
        base[k] = Math.max(0, raw[k]);
      }
    });
    return base;
  }

  window.addEventListener("storage", e => {
    if (e.key === STORAGE_KEY) _publish(load());
  });

  return Object.freeze({ load, save, reset, subscribe });
})();