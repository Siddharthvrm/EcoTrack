const ACTIVITIES_DATA = Object.freeze({
  petrol: {
    title: "🚗 Petrol Vehicle",
    emission: "2.31 kg CO₂e per litre",
    description: "Petrol engines combust fossil fuel, releasing CO₂ directly. Efficiency varies by vehicle age and driving style.",
    sources: ["Direct combustion releases CO₂ into the atmosphere", "Lower efficiency than diesel or electric alternatives"],
    impact: "High emission transport source"
  },
  diesel: {
    title: "🚛 Diesel Vehicle",
    emission: "2.68 kg CO₂e per litre",
    description: "Diesel fuel has a higher carbon density than petrol. It produces more CO₂ and NOx per combustion event.",
    sources: ["Higher carbon density than petrol", "Common in heavy goods vehicles and long-haul transport"],
    impact: "Very high industrial transport impact"
  },
  electric: {
    title: "⚡ Electric Vehicle",
    emission: "~0.05 kg CO₂e per km (grid dependent)",
    description: "EVs produce zero tailpipe emissions. Their real-world carbon footprint depends on how the charging electricity was generated.",
    sources: ["Battery charged from electricity grid", "Emission intensity varies by energy mix (coal vs. renewable)"],
    impact: "Low emission transport — best with a renewable grid"
  },
  electricityUsage: {
    title: "⚡ Electricity Usage",
    emission: "0.35 kg CO₂e per kWh (grid average)",
    description: "Household electricity is one of the largest indirect emission sources. Coal-heavy grids amplify this significantly.",
    sources: ["Fossil-fuel power stations", "Grid electricity mix (coal, gas, nuclear, renewables)"],
    impact: "Medium–high household emission source"
  },
  naturalGasUsage: {
    title: "🔥 Natural Gas",
    emission: "3.0 kg CO₂e per m³",
    description: "Burning natural gas for heating and cooking emits significant CO₂. Cleaner than coal but still a major fossil fuel.",
    sources: ["Methane combustion in boilers and cookers", "Supply-chain leakage adds methane emissions"],
    impact: "High home heating emission"
  },
  renewableEnergy: {
    title: "🌿 Renewable Energy",
    emission: "0.0 – 0.05 kg CO₂e (lifecycle)",
    description: "Solar, wind, and hydro generate electricity with near-zero operational emissions, though manufacturing carries some embedded carbon.",
    sources: ["Solar photovoltaic panels", "Wind turbines", "Hydroelectric plants"],
    impact: "Best long-term energy solution"
  },
  vegan: {
    title: "🥗 Vegan Diet",
    emission: "~125 kg CO₂e / month",
    description: "A fully plant-based diet has the lowest dietary carbon footprint, avoiding methane emissions from livestock.",
    sources: ["No animal agriculture emissions", "Low land and water resource usage"],
    impact: "Very low food emissions"
  },
  vegetarian: {
    title: "🥛 Vegetarian Diet",
    emission: "~170 kg CO₂e / month",
    description: "Dairy production is surprisingly emission-intensive. Vegetarian diets sit well below meat-based but above vegan.",
    sources: ["Dairy cattle methane emissions", "Cheese and milk processing energy"],
    impact: "Moderate food emissions"
  },
  mixed: {
    title: "🍽 Mixed Diet",
    emission: "~250 kg CO₂e / month",
    description: "A balanced diet with moderate meat, fish, and plant foods. Emissions vary by how much and which meats are consumed.",
    sources: ["Animal and plant agriculture combined", "Processing, refrigeration, and transport"],
    impact: "Medium–high food emissions"
  },
  highMeat: {
    title: "🥩 High Meat Diet",
    emission: "~350 kg CO₂e / month",
    description: "Beef and lamb are the highest-emission foods. Livestock farming contributes ~14.5% of global greenhouse gas emissions.",
    sources: ["Methane from livestock digestion", "Deforestation for grazing land", "Feed crop production"],
    impact: "Very high food footprint"
  },
  foodWaste: {
    title: "🍲 Food Waste",
    emission: "2 kg CO₂e per kg wasted",
    description: "Food wasted in landfills releases methane — a gas 28× more potent than CO₂ over 100 years.",
    sources: ["Landfill anaerobic decomposition", "Wasted production, transport and refrigeration energy"],
    impact: "Hidden but significant emission source"
  },
  wasteGenerated: {
    title: "🗑 General Waste",
    emission: "~4 kg CO₂e per kg waste",
    description: "General household waste in landfills generates methane. Reducing, reusing, and recycling all lower this.",
    sources: ["Plastic and organic decomposition in landfill", "Methane release from waste sites"],
    impact: "Medium environmental impact"
  },
  recyclingRate: {
    title: "♻ Recycling Rate",
    emission: "Reduces emissions by 30–70%",
    description: "Recycling saves the energy of raw material extraction and diverts waste from methane-producing landfills.",
    sources: ["Reprocessing uses less energy than virgin production", "Diverts waste from landfill"],
    impact: "Positive — reduces footprint directly"
  },
  clothingPurchases: {
    title: "👕 Clothing Purchases",
    emission: "~20 kg CO₂e per item",
    description: "Fast fashion is one of the world's most polluting industries, requiring extensive water, chemicals, and energy.",
    sources: ["Textile manufacturing and dyeing processes", "Global shipping and logistics"],
    impact: "Moderate–high consumption impact"
  },
  electronicsPurchases: {
    title: "💻 Electronics Purchases",
    emission: "~80 kg CO₂e per device",
    description: "Electronic devices require energy-intensive chip fabrication and rare earth mining, generating high embedded carbon.",
    sources: ["Semiconductor fabrication energy", "Rare earth mining and global shipping"],
    impact: "High embedded (upstream) carbon"
  },
  waterUsage: {
    title: "💧 Water Usage",
    emission: "~0.01 kg CO₂e per litre",
    description: "Pumping, treating, and heating water all consume energy. At scale, municipal water systems are a meaningful source.",
    sources: ["Water treatment plant energy", "Distribution pumping infrastructure"],
    impact: "Low per litre, but constant"
  },
  laptopHours: {
    title: "💻 Laptop Usage",
    emission: "~3 kg CO₂e per hr/day (monthly)",
    description: "Device electricity use adds to grid demand. Data centres supporting cloud services carry a hidden energy cost.",
    sources: ["Direct electricity consumption", "Cloud server and data centre energy"],
    impact: "Growing digital footprint source"
  },
  deviceCount: {
    title: "📱 Connected Devices",
    emission: "~12 kg CO₂e per device / year",
    description: "Each connected device consumes standby and charging energy year-round, plus significant embedded carbon from manufacturing.",
    sources: ["Continuous charging and standby draw", "Background cloud synchronisation"],
    impact: "Moderate cumulative digital impact"
  },
  shortFlights: {
    title: "✈ Short-Haul Flights",
    emission: "~150 kg CO₂e per flight",
    description: "Short flights are highly inefficient per km — takeoff and landing burn disproportionate fuel. Rail is typically 10× cleaner.",
    sources: ["High fuel burn during takeoff and climb", "Short distance inefficiency vs. ground transport"],
    impact: "High emission travel"
  },
  longFlights: {
    title: "🌍 Long-Haul Flights",
    emission: "~700 kg CO₂e per flight",
    description: "Long-haul flights emit more per trip than almost any other personal action. High-altitude contrails multiply the warming effect.",
    sources: ["Jet fuel combustion at cruise altitude", "NOx and contrail warming (≈2× CO₂ equivalent)"],
    impact: "Very high travel footprint"
  }
});


const MODAL_ID = "activityModal";

/**
 * Opens a modal for the given activity key.
 * All dynamic values written via textContent — XSS-safe.
 * @param {string} key
 */
function openActivityModal(key) {
  const data = ACTIVITIES_DATA[key];
  if (!data) {
    console.warn("[Activities] Unknown activity key:", key);
    return;
  }

  _closeModal();

  const modal = createElement("div", {
    className: "activity-modal",
    attrs: {
      id:             MODAL_ID,
      role:           "dialog",
      "aria-modal":   "true",
      "aria-labelledby": "modalTitle"
    }
  });

  const content = createElement("div", { className: "activity-content" });

  const closeBtn = createElement("button", {
    className:   "activity-close",
    textContent: "✕",
    attrs: {
      "aria-label":       "Close modal",
      "type":             "button"
    }
  });
  closeBtn.addEventListener("click", _closeModal);
  content.appendChild(closeBtn);

  const title = createElement("div", {
    className:   "activity-title",
    textContent: data.title,
    attrs:       { id: "modalTitle" }
  });
  content.appendChild(title);

  const emBadge = createElement("div", {
    className:   "activity-emission",
    textContent: `📊 ${data.emission}`,
    attrs:       { "aria-label": `Emission rate: ${data.emission}` }
  });
  content.appendChild(emBadge);

  content.appendChild(_buildSection("Description", [data.description], false));

  content.appendChild(_buildSection("Why it emits CO₂", data.sources, true));

  content.appendChild(_buildSection("Impact Level", [data.impact], false));

  modal.appendChild(content);
  document.body.appendChild(modal);

  closeBtn.focus();

  modal.addEventListener("click", e => {
    if (e.target === modal) _closeModal();
  });

  const escHandler = e => {
    if (e.key === "Escape") {
      _closeModal();
      document.removeEventListener("keydown", escHandler);
    }
  };
  document.addEventListener("keydown", escHandler);
}

function _closeModal() {
  byId(MODAL_ID)?.remove();
}

/**
 * Builds a section block for the modal.
 * All text written via textContent — XSS-safe.
 * @param {string}   heading
 * @param {string[]} items
 * @param {boolean}  asList  
 * @returns {HTMLElement}
 */
function _buildSection(heading, items, asList) {
  const section = createElement("div", { className: "activity-section" });
  const h4      = createElement("h4", { textContent: heading });
  section.appendChild(h4);

  if (asList) {
    const ul = document.createElement("ul");
    ul.setAttribute("aria-label", heading);
    items.forEach(text => {
      const li = createElement("li", { textContent: text });
      ul.appendChild(li);
    });
    section.appendChild(ul);
  } else {
    items.forEach(text => {
      const p = createElement("p", { textContent: text });
      section.appendChild(p);
    });
  }
  return section;
}


document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".activity-tile").forEach(tile => {
    // Ensure keyboard accessibility
    if (!tile.getAttribute("tabindex")) tile.setAttribute("tabindex", "0");
    tile.setAttribute("role", "button");

    const label = tile.querySelector(".activity-front")?.textContent?.trim() || "Activity";
    tile.setAttribute("aria-label", `Learn about ${label}`);

    tile.addEventListener("click", () => {
      const key = tile.dataset.category;
      if (key) openActivityModal(key);
    });

    tile.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const key = tile.dataset.category;
        if (key) openActivityModal(key);
      }
    });
  });

  byId("navToggle")?.addEventListener("click", function () {
    const menu = byId("navMenu");
    if (!menu) return;
    const open = menu.classList.toggle("open");
    this.setAttribute("aria-expanded", String(open));
  });
});