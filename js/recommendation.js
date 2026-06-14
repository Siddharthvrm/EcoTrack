const _RULES = Object.freeze({
  transport:   "🚗 Transport is your top source. Switch to public transport, cycling, or an EV — even 2 car-free days a week makes a measurable difference.",
  food:        "🍽 Diet drives your biggest impact. Cutting meat to 3 days a week can reduce food emissions by up to 30%.",
  energy:      "⚡ Home energy is your priority. Renewable tariffs and smart thermostats are the fastest wins.",
  waste:       "♻ Waste is a hidden emitter. Composting + reusable packaging can halve your waste footprint quickly.",
  goods:       "🛍 Consumer goods carry embedded carbon. Buy second-hand and repair before replacing.",
  aviation:    "✈ Flights dominate your travel impact. Train travel under 600 km emits 90% less CO₂.",
  water:       "💧 Water treatment uses energy. Low-flow fixtures and fixing leaks reduce indirect emissions.",
  technology:  "💻 Digital footprint matters. Unplug idle chargers and enable power-saving modes."
});

const _EXTRA_TIPS = Object.freeze({
  transport: "🚲 Replacing one weekly car trip with cycling or walking adds health benefits too.",
  food:      "🥗 Even one or two plant-based days a week produces a noticeable long-term difference.",
  energy:    "💡 Draught-proofing windows and switching to LED lighting are low-cost, high-impact upgrades."
});

const _box = byId("ai-output");


function _renderEmpty() {
  if (!_box) return;
  _box.innerHTML = `
    <div class="ai-card" role="alert" aria-live="polite">
      <h2>🤖 AI Carbon Advisor</h2>
      <p>No footprint data found. Please
        <a href="calculator.html" class="link-inline">complete the calculator</a>
        first, then return here for your personalised recommendations.
      </p>
    </div>`;
}

function _renderLoading() {
  if (!_box) return;
  _box.innerHTML = `
    <div class="ai-card loading-card" aria-busy="true" aria-label="Loading AI recommendations">
      <div class="loader-ring" aria-hidden="true"></div>
      <p class="loading-text">Generating your personalised carbon advice…</p>
    </div>`;
}

/**
 * Renders the full recommendations card.
 * Dynamic data is written via textContent nodes to avoid XSS.
 * @param {Object} data     Store payload
 * @param {string|null} aiText   Optional Claude API response text
 */
function _renderRecommendations(data, aiText = null) {
  if (!_box) return;

  const state   = data.state || {};
  const total   = safePositiveNumber(data.total);
  const top     = data.topContributor || "None";
  const bench   = CARBON_BENCHMARKS[top];
  const topName = bench ? bench.name : sanitizeText(top);
  const topVal  = safePositiveNumber(state[top]);
  const savings = Math.round(topVal * 0.4);

  const insights = [];
  if (_RULES[top])   insights.push(_RULES[top]);
  if (savings > 0 && top !== "None")
    insights.push(
      `💡 Cutting ${topName} by 40% saves ~${savings} kg CO₂e/month.`
    );
  if (total >= AVERAGE_MONTHLY_FOOTPRINT)
    insights.push(
      "⚠ Your footprint exceeds the 550 kg/month average. Your top 2 categories are the priority."
    );
  else if (total > 0)
    insights.push(
      "✅ You're below average — keep going with small consistent habits."
    );
  if (safePositiveNumber(state[top]) > 100 && _EXTRA_TIPS[top])
    insights.push(_EXTRA_TIPS[top]);

  _box.innerHTML = `
    <div class="ai-card" role="region" aria-label="AI Recommendations">
      <h2>🤖 AI Analysis Result</h2>
      <p class="top-area-label">
        <strong>Top Impact Area:</strong>
        <span id="ai-top-name"></span>
      </p>
      <div class="ai-list" aria-label="Personalised recommendations" id="ai-list-items"></div>
      <div id="ai-claude-block"></div>
      <div class="ai-summary" aria-label="Footprint summary">
        <h3>Your Footprint Summary</h3>
        <p id="ai-summary-line1"></p>
        <p id="ai-summary-line2"></p>
      </div>
      <div class="ai-actions">
        <button id="getAIBtn" class="btn" aria-label="Get Claude AI personalised advice">
          ✨ Get Claude AI Advice
        </button>
        <a href="calculator.html" class="btn btn-outline" aria-label="Return to calculator">
          🔄 Recalculate
        </a>
      </div>
    </div>`;

  byId("ai-top-name").textContent = topName;

  byId("ai-summary-line1").textContent =
    `${fmt(total)} kg CO₂e / month  ·  ${fmt(data.yearly || total * 12, 0)} kg CO₂e / year`;
  byId("ai-summary-line2").textContent =
    `Score: ${safeDisplay(data.score, "—")}  ·  Grade: ${safeDisplay(data.grade, "—")}`;

  const listEl = byId("ai-list-items");
  insights.forEach(text => {
    const p = createElement("p", { className: "ai-list-item" });
    p.textContent = text;  
    listEl.appendChild(p);
  });

  const claudeBlock = byId("ai-claude-block");
  if (aiText) {
    const section = createElement("div", { className: "ai-claude-section" });
    section.setAttribute("aria-label", "Claude AI deep dive");
    const h3 = createElement("h3", { textContent: "🤖 Claude AI Deep Dive" });
    const content = createElement("div", { className: "ai-claude-content" });
    content.textContent = aiText; 
    section.appendChild(h3);
    section.appendChild(content);
    claudeBlock.appendChild(section);
  }

  byId("getAIBtn")?.addEventListener("click", () => _fetchClaudeAdvice(data));
}


/**
 * Calls the Anthropic Messages API with a structured prompt.
 * Falls back to rule-based rendering on any error.
 * @param {Object} data  Store payload
 */
async function _fetchClaudeAdvice(data) {
  const state   = data.state || {};
  const top     = data.topContributor || "None";
  const topName = CARBON_BENCHMARKS[top]?.name || top;

  const breakdownLines = Object.entries(state)
    .filter(([, v]) => safePositiveNumber(v) > 0)
    .map(([k, v]) => {
      const label = CARBON_BENCHMARKS[k]?.name || k;
      return `- ${label}: ${fmt(safePositiveNumber(v))} kg CO₂e`;
    })
    .join("\n");

  const prompt =
    `You are a friendly, evidence-based sustainability advisor.\n\n` +
    `A user's monthly carbon footprint:\n${breakdownLines}\n\n` +
    `Total: ${fmt(data.total)} kg CO₂e/month\n` +
    `Top contributor: ${topName}\n` +
    `Grade: ${safeDisplay(data.grade, "~")} (Score: ${safeDisplay(data.score, 0)}/100)\n\n` +
    `Give exactly 3 specific, practical, actionable recommendations. ` +
    `Number each point. Be direct, encouraging, and data-driven. Under 220 words total.`;

  _renderLoading();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:      "claude-sonnet-4-6",
        max_tokens: 500,
        messages:   [{ role: "user", content: prompt }]
      })
    });

    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }

    const json = await res.json();
    const aiText = Array.isArray(json?.content)
      ? (json.content.find(b => b.type === "text")?.text || "")
      : "";

    _renderRecommendations(data, aiText || null);

  } catch (err) {
    console.warn("[EcoTrack] Claude API fallback:", err.message);
    _renderRecommendations(data); 
  }
}


/**
 * Main render dispatcher. Called on load and on Store updates.
 * @param {Object} data  Store payload
 */
function loadPage(data) {
  if (!_box) return;
  const hasData = data &&
                  data.state &&
                  Object.keys(data.state).length > 0 &&
                  safePositiveNumber(data.total) > 0;
  hasData ? _renderRecommendations(data) : _renderEmpty();
}

loadPage(Store.load());

Store.subscribe(loadPage);

byId("navToggle")?.addEventListener("click", function () {
  const menu = byId("navMenu");
  if (!menu) return;
  const open = menu.classList.toggle("open");
  this.setAttribute("aria-expanded", String(open));
});