const D = {
  monthly:     byId("monthly"),
  yearly:      byId("yearly"),
  score:       byId("score"),
  grade:       byId("grade"),
  insight:     byId("insightText"),
  barCanvas:   byId("barChart"),
  pieCanvas:   byId("pieChart"),
  downloadBtn: byId("downloadReportBtn"),
  noDataMsg:   byId("noDataMsg")
};

let _bar = null;
let _pie = null;


/**
 * Updates the four KPI cards.
 * All values written via textContent — XSS-safe.
 * @param {Object} data  Store payload
 */
function renderKPIs(data) {
  const hasData = data.time !== null;

  if (D.monthly) D.monthly.textContent = fmt(data.total);
  if (D.yearly)  D.yearly.textContent  = fmt(data.yearly, 0);
  // Show 0 / ~ before first calculation, real values after
  if (D.score)   D.score.textContent   = hasData ? safeDisplay(data.score) : "0";
  if (D.grade)   D.grade.textContent   = hasData ? safeDisplay(data.grade) : "~";
}

/**
 * Destroys existing Chart.js instances and re-draws with new data.
 * @param {Object} data  Store payload
 */
function renderCharts(data) {
  const state  = (data && data.state) ? data.state : {};
  const keys   = Object.keys(state);
  const labels = keys.map(k => {
    const bench = CARBON_BENCHMARKS[k];
    return bench ? bench.name : sanitizeText(k);
  });
  const values = keys.map(k => safePositiveNumber(state[k]));
  const colors = keys.map(k => {
    const bench = CARBON_BENCHMARKS[k];
    return bench ? bench.color : "#94a3b8";
  });

  if (_bar) { _bar.destroy(); _bar = null; }
  if (_pie) { _pie.destroy(); _pie = null; }

  if (D.barCanvas) {
    _bar = new Chart(D.barCanvas, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: "kg CO₂e / month",
          data: values,
          backgroundColor: colors,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 600 },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${safePositiveNumber(ctx.parsed.y).toFixed(1)} kg CO₂e`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: "#94a3b8", font: { size: 11 } },
            grid:  { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { color: "#94a3b8" },
            grid:  { color: "rgba(255,255,255,0.05)" }
          }
        }
      }
    });
  }

  if (D.pieCanvas) {
    _pie = new Chart(D.pieCanvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          hoverOffset: 10,
          borderWidth: 2,
          borderColor: "#111827"
        }]
      },
      options: {
        responsive: true,
        animation: { duration: 600 },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#94a3b8",
              padding: 16,
              boxWidth: 14,
              font: { size: 11 }
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${sanitizeText(ctx.label)}: ${safePositiveNumber(ctx.parsed).toFixed(1)} kg`
            }
          }
        },
        cutout: "65%"
      }
    });
  }
}

/**
 * Updates the top-insight paragraph.
 * Uses textContent to avoid XSS.
 * @param {Object} data  Store payload
 */
function renderInsight(data) {
  if (!D.insight) return;
  const top  = data.topContributor;
  const bench = top ? CARBON_BENCHMARKS[top] : null;
  const name  = bench ? bench.name : sanitizeText(top || "None");

  D.insight.textContent =
    (!top || top === "None")
      ? "Complete the calculator to see your personalised insights."
      : `Your highest emission source is ${name}. ` +
        `Targeting this category offers your biggest reduction opportunity.`;
}


function _updateNoDataMsg(data) {
  if (!D.noDataMsg) return;
  D.noDataMsg.style.display = (data.total > 0) ? "none" : "block";
}


/**
 * Refreshes all dashboard sections from a Store payload.
 * @param {Object} data
 */
function refresh(data) {
  renderKPIs(data);
  renderCharts(data);
  renderInsight(data);
  _updateNoDataMsg(data);
}


/**
 * Generates and downloads a PDF report using jsPDF.
 * All dynamic values are passed through fmt() / sanitizeText()
 * before insertion into the PDF document.
 */
function downloadReport() {
  const data = Store.load();
  if (!data || data.total === 0) {
    alert("Please calculate your footprint first in the Calculator.");
    return;
  }

  if (!window.jspdf) {
    alert("PDF library not loaded. Please check your internet connection.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W   = doc.internal.pageSize.getWidth();
  const H   = doc.internal.pageSize.getHeight();

  const C = {
    dark:       [15, 23, 42],
    green:      [22, 163, 74],
    lightGreen: [240, 253, 244],
    muted:      [100, 116, 139],
    white:      [255, 255, 255]
  };

  doc.setFillColor(...C.dark);
  doc.rect(0, 0, W, 44, "F");
  doc.setFillColor(...C.green);
  doc.rect(0, 44, W, 2, "F");

  doc.setTextColor(...C.green);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("EcoTrack — Carbon Footprint Report", 18, 20);

  doc.setTextColor(...C.white);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`,
    18, 32
  );
  doc.text(
    `Score: ${safeDisplay(data.score, "0")} / 100   |   Grade: ${safeDisplay(data.grade, "~")}`,
    W - 80, 32
  );

  doc.setFillColor(...C.lightGreen);
  doc.roundedRect(15, 52, W - 30, 36, 4, 4, "F");
  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Footprint Summary", 22, 63);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...C.muted);
  doc.text(`Monthly Total:   ${fmt(data.total)} kg CO₂e`, 22, 73);
  doc.text(`Annual Total:    ${fmt(data.yearly, 0)} kg CO₂e`, 22, 81);

  const topName    = CARBON_BENCHMARKS[data.topContributor]?.name
                     || sanitizeText(data.topContributor) || "None";
  const avgDiff    = data.total - AVERAGE_MONTHLY_FOOTPRINT;
  const avgDiffAbs = Math.abs(avgDiff).toFixed(0);
  const avgText    = avgDiff > 0
    ? `${avgDiffAbs} kg above average`
    : `${avgDiffAbs} kg below average`;

  doc.text(`Top Contributor: ${topName}`, W / 2 + 5, 73);
  doc.text(`vs. Average:     ${avgText}`, W / 2 + 5, 81);

  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Emission Breakdown by Category", 18, 101);

  doc.setFillColor(...C.dark);
  doc.rect(15, 106, W - 30, 9, "F");
  doc.setTextColor(...C.white);
  doc.setFontSize(10);
  doc.text("Category",        22,       112);
  doc.text("kg CO₂e / month", W - 65,   112);
  doc.text("% of Total",      W - 32,   112);

  let y = 121;
  Object.entries(data.state || {}).forEach(([key, value], i) => {
    const label = CARBON_BENCHMARKS[key]?.name || key;
    const val   = safePositiveNumber(value);
    const share = pct(val, data.total).toFixed(1);
    const rowBg = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255];

    doc.setFillColor(...rowBg);
    doc.rect(15, y - 5, W - 30, 9, "F");
    doc.setTextColor(...C.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(label,        22,      y + 1);
    doc.text(fmt(val),     W - 58,  y + 1);
    doc.text(`${share}%`,  W - 28,  y + 1);
    y += 10;
  });

  y += 8;
  if (y > H - 60) { doc.addPage(); y = 20; }

  doc.setTextColor(...C.dark);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("AI Personalised Recommendations", 18, y);
  y += 10;

  const tips = _buildPDFTips(data);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...C.muted);

  tips.forEach(tip => {
    if (y > H - 20) { doc.addPage(); y = 20; }
    const lines = doc.splitTextToSize(`• ${tip}`, W - 40);
    doc.text(lines, 20, y);
    y += lines.length * 6 + 3;
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFillColor(...C.dark);
    doc.rect(0, H - 12, W, 12, "F");
    doc.setFontSize(8);
    doc.setTextColor(...C.muted);
    doc.text(
      "EcoTrack · AI-Powered Carbon Intelligence · Sustainable Future Hackathon",
      18, H - 4
    );
    doc.text(`Page ${p} of ${pageCount}`, W - 28, H - 4);
  }

  doc.save("EcoTrack_Report.pdf");
}

/**
 * Builds recommendation strings for the PDF.
 * All content is static (not user-supplied), so no escaping needed here.
 * @param {Object} data  Store payload
 * @returns {string[]}
 */
function _buildPDFTips(data) {
  const tips  = [];
  const state = data.state || {};
  const top   = data.topContributor;

  const ruleMap = {
    transport:  "Switch to public transport, cycling, or EV. Even 2 car-free days per week makes a measurable difference.",
    food:       "Reducing meat to 3 days a week can cut food emissions by up to 30%.",
    energy:     "Renewable electricity tariffs and smart thermostats are the fastest home energy wins.",
    waste:      "Composting food scraps and switching to reusables can halve your waste footprint.",
    goods:      "Buy second-hand, repair before replacing. Fast fashion accounts for ~10% of global emissions.",
    aviation:   "Train travel under 600 km emits up to 90% less CO₂ than a short-haul flight.",
    water:      "Low-flow shower heads and fixing dripping taps reduce indirect energy use significantly.",
    technology: "Enable power-saving modes and unplug idle chargers to cut phantom power draw."
  };

  if (top && ruleMap[top]) tips.push(ruleMap[top]);

  const topVal  = safePositiveNumber(state[top]);
  const savings = Math.round(topVal * 0.4);
  if (top && top !== "None" && savings > 0) {
    const name = CARBON_BENCHMARKS[top]?.name || top;
    tips.push(
      `Reducing your ${name.toLowerCase()} footprint by 40% saves ~${savings} kg CO₂e/month.`
    );
  }

  if (data.total >= AVERAGE_MONTHLY_FOOTPRINT) {
    tips.push(
      "Your footprint is above the global average of 550 kg/month. " +
      "Targeting your top 2 categories could bring you below average within 3 months."
    );
  } else {
    tips.push(
      "Your footprint is at or below average. " +
      "Continuing small habits like reducing food waste will drive continuous improvement."
    );
  }

  tips.push(
    "Consider verified carbon offset programmes for unavoidable emissions — " +
    "look for Gold Standard or VCS-certified projects."
  );

  return tips;
}


refresh(Store.load());

Store.subscribe(refresh);

D.downloadBtn?.addEventListener("click", downloadReport);

byId("resetBtn")?.addEventListener("click", () => {
  if (confirm("Reset all EcoTrack data? This cannot be undone.")) {
    Store.reset();
    window.location.href = "calculator.html";
  }
});

byId("navToggle")?.addEventListener("click", function () {
  const menu = byId("navMenu");
  if (!menu) return;
  const open = menu.classList.toggle("open");
  this.setAttribute("aria-expanded", String(open));
});