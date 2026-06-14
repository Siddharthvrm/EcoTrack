const TileManager = (() => {
  /** @type {HTMLElement|null} */
  let _open = null;

  /**
   * Opens a tile as a modal. Closes any previously open tile first.
   * @param {HTMLElement} tile
   */
  function open(tile) {
    if (_open && _open !== tile) close(_open);
    _open = tile;
    tile.classList.add("active");
    document.body.classList.add("modal-open");
    setTimeout(() => {
      const focusable = tile.querySelector(
        'input, select, button:not(.clear-btn), [tabindex="0"]'
      );
      if (focusable) focusable.focus();
    }, 150);
  }

  /**
   * Closes a tile and removes modal state.
   * @param {HTMLElement|null} tile
   */
  function close(tile) {
    if (!tile) return;
    tile.classList.remove("active");
    document.body.classList.remove("modal-open");
    _open = null;
  }

  /** @returns {HTMLElement|null} */
  function current() { return _open; }

  return Object.freeze({ open, close, current });
})();

const TransportManager = (() => {
  /** @type {Object.<string, {distance:number, efficiency:number}>} */
  let _data = {};
  /** @type {string|null} */
  let _fuel = null;

  /** @param {string} f */
  function setFuel(f) { _fuel = typeof f === "string" ? f : null; }
  /** @returns {string|null} */
  function getFuel() { return _fuel; }

  /**
   * Stores validated transport entry for the selected fuel type.
   * @param {*} dist
   * @param {*} eff
   * @returns {boolean}  false if no fuel selected
   */
  function save(dist, eff) {
    if (!_fuel) return false;
    _data[_fuel] = {
      distance:   safePositiveNumber(dist),
      efficiency: safePositiveNumber(eff) || 1  
    };
    return true;
  }

  function clear() { _data = {}; _fuel = null; }

  function getData() { return { ..._data }; }

  return Object.freeze({ setFuel, getFuel, save, clear, getData });
})();


/**
 * Reads all form inputs, computes category emissions,
 * persists to Store, and renders results.
 * @returns {Object}  full result payload
 */
function calculateFootprint() {
  const dietEl  = byId("dietType");
  const dietVal = dietEl ? dietEl.value : "";

  const recyclingRaw = inputVal("recyclingRate");
  const recycling    = validRecyclingRate(recyclingRaw);  

  const state = {
    transport:  calcTransportEmissions(TransportManager.getData(), EF),
    energy:     inputVal("electricityUsage") * EF.electricity
                + inputVal("naturalGasUsage") * EF.naturalGas,
    food:       (DIET_EMISSIONS[dietVal] || 0)
                + inputVal("foodWaste") * EF.foodWaste,
    waste:      inputVal("wasteGenerated") * EF.waste
                * (1 - recycling / 100),
    goods:      inputVal("clothingPurchases")    * EF.clothing
                + inputVal("electronicsPurchases") * EF.electronics,
    water:      inputVal("waterUsage")  * EF.water,
    technology: inputVal("laptopHours") * EF.laptop
                + inputVal("deviceCount") * EF.device,
    aviation:   inputVal("shortFlights") * EF.shortFlight
                + inputVal("longFlights")  * EF.longFlight
  };

  const total          = sumState(state);
  const yearly         = total * 12;
  const score          = calcScore(total);
  const grade          = calcGrade(score);
  const topContributor = getTopContributor(state);

  const result = { state, total, yearly, score, grade, topContributor };
  Store.save(result);
  _renderResults(result);
  return result;
}


/**
 * Injects the results card into the page.
 * Uses textContent / createElement — no raw innerHTML interpolation
 * of user-controlled data.
 * @param {Object} param0
 */
function _renderResults({ total, yearly, score, grade }) {
  const box = byId("results");
  if (!box) return;

  const gradeClass = `grade-${sanitizeText(grade).toLowerCase()}`;

  box.classList.remove("hidden");
  box.innerHTML = `
    <div class="result-dashboard" role="region" aria-label="Carbon footprint results">
      <h2 class="result-title">🌍 Your Carbon Intelligence Report</h2>
      <div class="result-hero">
        <div class="result-number" id="res-total"></div>
        <div class="result-unit">kg CO₂e / month</div>
      </div>
      <div class="result-grid" role="list">
        <div class="result-card" role="listitem">
          <span class="result-label">Monthly</span>
          <strong id="res-monthly"></strong>
        </div>
        <div class="result-card" role="listitem">
          <span class="result-label">Annual</span>
          <strong id="res-yearly"></strong>
        </div>
        <div class="result-card" role="listitem">
          <span class="result-label">Score</span>
          <strong id="res-score"></strong>
        </div>
        <div class="result-card" role="listitem">
          <span class="result-label">Grade</span>
          <strong id="res-grade" class="grade ${gradeClass}"></strong>
        </div>
      </div>
    </div>`;

  byId("res-total").textContent   = fmt(total);
  byId("res-monthly").textContent = fmt(total) + " kg";
  byId("res-yearly").textContent  = fmt(yearly, 0) + " kg";
  byId("res-score").textContent   = score + " / 100";
  byId("res-grade").textContent   = grade;
  byId("res-grade").setAttribute("aria-label", "Grade " + grade);

  box.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateProgress() {
  const allTiles  = document.querySelectorAll(".tile");
  const doneTiles = document.querySelectorAll(".tile.completed");
  const total     = allTiles.length;
  const done      = doneTiles.length;
  const percent   = total ? Math.round((done / total) * 100) : 0;

  const fill = byId("progressFill");
  const text = byId("progressText");
  if (fill) {
    fill.style.width = percent + "%";
    fill.setAttribute("aria-valuenow", String(percent));
  }
  if (text) text.textContent = `${done} / ${total} Categories Completed`;
}


/**
 * Appends a completion badge to a tile if one doesn't already exist.
 * @param {HTMLElement} tile
 */
function addBadge(tile) {
  if (tile.querySelector(".done-badge")) return;
  const badge = createElement("div", {
    className:   "done-badge",
    textContent: "✓",
    attrs:       { "aria-label": "Completed", "role": "img" }
  });
  tile.appendChild(badge);
}

function resetAll() {
  Store.reset();
  TransportManager.clear();

  document.querySelectorAll("input").forEach(i => { i.value = ""; });
  document.querySelectorAll("select").forEach(s => { s.selectedIndex = 0; });
  document.querySelectorAll(".fuel-pill").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tile").forEach(t => {
    t.classList.remove("completed", "active");
    t.querySelector(".done-badge")?.remove();
  });

  const res = byId("results");
  if (res) { res.classList.add("hidden"); res.innerHTML = ""; }

  byId("dashboardBtn")?.classList.add("hidden");
  document.body.classList.remove("modal-open");
  updateProgress();
}

document.addEventListener("DOMContentLoaded", () => {
  updateProgress();

  document.querySelectorAll(".tile").forEach(tile => {
    tile.addEventListener("click", e => {
      if (["INPUT","BUTTON","SELECT","LABEL"].includes(e.target.tagName)) return;
      TileManager.current() === tile
        ? TileManager.close(tile)
        : TileManager.open(tile);
    });
    tile.addEventListener("keydown", e => {
      if (!tile.classList.contains("active") &&
          (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        TileManager.open(tile);
      }
    });
  });

  document.addEventListener("click", e => {
    if (!e.target.closest(".tile") && TileManager.current()) {
      TileManager.close(TileManager.current());
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") TileManager.close(TileManager.current());
  });

  document.querySelectorAll(".fuel-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".fuel-pill")
              .forEach(p => {
                p.classList.remove("active");
                p.setAttribute("aria-pressed", "false");
              });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      TransportManager.setFuel(btn.dataset.fuel);
    });
  });

  const transportSaveBtn = document.querySelector(".transport-save");
  if (transportSaveBtn) {
    transportSaveBtn.addEventListener("click", () => {
      if (!TransportManager.getFuel()) {
        alert("Please select a vehicle type first.");
        return;
      }
      const distVal = byId("transportDistance")?.value;
      const effVal  = byId("transportEfficiency")?.value;
      if (!safePositiveNumber(distVal)) {
        alert("Please enter a valid distance greater than 0.");
        return;
      }
      TransportManager.save(distVal, effVal);
      _markTileComplete('[data-category="transport"]');
    });
  }

  const transportClearBtn = document.querySelector(".transport-clear");
  if (transportClearBtn) {
    transportClearBtn.addEventListener("click", () => {
      const dEl = byId("transportDistance");
      const eEl = byId("transportEfficiency");
      if (dEl) dEl.value = "";
      if (eEl) eEl.value = "";
      document.querySelectorAll(".fuel-pill").forEach(p => {
        p.classList.remove("active");
        p.setAttribute("aria-pressed", "false");
      });
      TransportManager.clear();
      _clearTile('[data-category="transport"]');
    });
  }

  document.querySelectorAll(".ok-btn:not(.transport-save)").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const tile = btn.closest(".tile");
      if (!tile) return;
      tile.classList.add("completed");
      addBadge(tile);
      TileManager.close(tile);
      updateProgress();
    });
  });

  document.querySelectorAll(".clear-btn:not(.transport-clear)").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const tile = btn.closest(".tile");
      if (!tile) return;
      tile.querySelectorAll("input").forEach(i => { i.value = ""; });
      tile.querySelectorAll("select").forEach(s => { s.selectedIndex = 0; });
      tile.classList.remove("completed");
      tile.querySelector(".done-badge")?.remove();
      TileManager.close(tile);
      updateProgress();
    });
  });

  byId("calculateBtn")?.addEventListener("click", () => {
    calculateFootprint();
    setTimeout(() => byId("dashboardBtn")?.classList.remove("hidden"), 400);
  });

  byId("dashboardBtn")?.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  byId("resetBtn")?.addEventListener("click", () => {
    if (confirm("Reset all data? This cannot be undone.")) resetAll();
  });
});


function _markTileComplete(selector) {
  const tile = document.querySelector(selector);
  if (!tile) return;
  tile.classList.add("completed");
  addBadge(tile);
  TileManager.close(tile);
  updateProgress();
}

function _clearTile(selector) {
  const tile = document.querySelector(selector);
  if (!tile) return;
  tile.classList.remove("completed");
  tile.querySelector(".done-badge")?.remove();
  TileManager.close(tile);
  updateProgress();
}