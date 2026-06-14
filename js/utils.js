/**
 * @param {*} value
 * @returns {string}
 */
function sanitizeText(value) {
  if (value === null || value === undefined) return "";
  const node = document.createElement("div");
  node.textContent = String(value);
  return node.innerHTML;
}

/**
 * @param {*} n
 * @param {number} dec
 * @returns {string}
 */
function fmt(n, dec = 1) {
  const parsed = typeof n === "number" ? n : parseFloat(n);
  return Number.isFinite(parsed) ? parsed.toFixed(dec) : "0";
}

/**
 * @param {*} val
 * @param {string} fallback
 * @returns {string}
 */
function safeDisplay(val, fallback = "—") {
  if (val === null || val === undefined || val === "") return fallback;
  return String(val);
}


/**
 * @param {*} val
 * @returns {number}
 */
function safePositiveNumber(val) {
  const n = parseFloat(val);
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(n, min, max) {
  if (!Number.isFinite(n)) return min;
  return Math.min(Math.max(n, min), max);
}

/**
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
function pct(part, total) {
  if (!total || !Number.isFinite(total) || total === 0) return 0;
  return clamp((part / total) * 100, 0, 100);
}


/**
 * @param {number} score  0–100
 * @returns {"A"|"B"|"C"|"D"|"E"}
 */
function calcGrade(score) {
  if (score >= 80) return "A";
  if (score >= 60) return "B";
  if (score >= 40) return "C";
  if (score >= 20) return "D";
  return "E";
}

/**
 * @param {number} total  
 * @returns {number}  
 */
function calcScore(total) {
  return Math.max(0, Math.round(100 - safePositiveNumber(total) / 50));
}

/**
 * @param {Object.<string, number>} state
 * @returns {string}
 */
function getTopContributor(state) {
  if (!state || typeof state !== "object") return "None";
  let topKey = "None";
  let max = 0;
  Object.entries(state).forEach(([k, v]) => {
    const n = safePositiveNumber(v);
    if (n > max) { max = n; topKey = k; }
  });
  return topKey;
}

/**
 * @param {Object.<string, number>} state
 * @returns {number}
 */
function sumState(state) {
  if (!state || typeof state !== "object") return 0;
  return Object.values(state).reduce((acc, v) => {
    const n = safePositiveNumber(v);
    return acc + n;
  }, 0);
}

/**
 * @param {Object} td  
 * @param {Object} EF  
 * @returns {number}  
 */
function calcTransportEmissions(td, EF) {
  if (!td || typeof td !== "object") return 0;
  let total = 0;
  if (td.petrol && safePositiveNumber(td.petrol.efficiency)) {
    total += (safePositiveNumber(td.petrol.distance) /
              safePositiveNumber(td.petrol.efficiency)) * EF.petrol;
  }
  if (td.diesel && safePositiveNumber(td.diesel.efficiency)) {
    total += (safePositiveNumber(td.diesel.distance) /
              safePositiveNumber(td.diesel.efficiency)) * EF.diesel;
  }
  if (td.electric) {
    total += safePositiveNumber(td.electric.distance) * EF.electric;
  }
  return total;
}

/**
 * @param {*} val
 * @returns {number}
 */
function validRecyclingRate(val) {
  return clamp(safePositiveNumber(val), 0, 100);
}


/**
 * @param {string} key
 * @param {*} value
 * @returns {boolean}  
 */
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn("[EcoTrack] localStorage write failed:", e.message);
    return false;
  }
}

/**
 * @param {string} key
 * @param {*} fallback
 * @returns {*}
 */
function lsGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[EcoTrack] localStorage read failed:", e.message);
    return fallback;
  }
}

/**
 * @param {string} key
 */
function lsRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("[EcoTrack] localStorage remove failed:", e.message);
  }
}


/**
 * @param {string} id
 * @returns {HTMLElement|null}
 */
function byId(id) {
  return document.getElementById(id);
}

/**
 * @param {string} id
 * @returns {number}
 */
function inputVal(id) {
  const el = byId(id);
  return el ? safePositiveNumber(el.value) : 0;
}

/**
 * @param {string} tag
 * @param {Object} opts 
 * @returns {HTMLElement}
 */
function createElement(tag, opts = {}) {
  const el = document.createElement(tag);
  if (opts.className)   el.className   = opts.className;
  if (opts.textContent !== undefined) el.textContent = opts.textContent;
  if (opts.attrs && typeof opts.attrs === "object") {
    Object.entries(opts.attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }
  return el;
}