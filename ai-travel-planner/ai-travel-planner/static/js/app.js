function setQ(q) {
  document.getElementById("queryInput").value = q;
}

// Simple pipeline animation
const stages = ["s-parse", "s-flights", "s-hotels", "s-itinerary", "s-budget"];
const delay = ms => new Promise(res => setTimeout(res, ms));

async function animatePipeline() {
  const pl = document.getElementById("pipeline");
  pl.classList.add("visible");

  for (let s of stages) {
    document.getElementById(s).classList.remove("done");
    document.getElementById(s).classList.add("active");
    await delay(800);
    document.getElementById(s).classList.remove("active");
    document.getElementById(s).classList.add("done");
  }
}

function hidePipeline() {
  document.getElementById("pipeline").classList.remove("visible");
  stages.forEach(s => {
    document.getElementById(s).classList.remove("active", "done");
  });
}

function renderFlights(flights) {
  const html = flights.map(f => {
    const dateStr = f.date || f.departure_date || "";
    const arrCity = f.arrival_city || "Destination";
    const depCity = f.departure_city || "Origin";
    const priceStr = f.price ? `₹${f.price}` : "";

    const clean = (c) => c ? c.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-') : "";
    const cDep = f.origin_iata ? f.origin_iata.toLowerCase() : clean(depCity);
    const cArr = f.destination_iata ? f.destination_iata.toLowerCase() : clean(arrCity);

    let urlDate = dateStr;
    if (dateStr && dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        urlDate = parts[0].slice(2) + parts[1] + parts[2];
      }
    }

    const skyscannerUrl = (cDep && cArr && urlDate)
      ? `https://www.skyscanner.co.in/transport/flights/${encodeURIComponent(cDep)}/${encodeURIComponent(cArr)}/${encodeURIComponent(urlDate)}/`
      : `https://www.google.com/travel/flights?q=Flights%20from%20${encodeURIComponent(depCity)}%20to%20${encodeURIComponent(arrCity)}%20on%20${encodeURIComponent(dateStr)}`;

    return `
      <div class="flight-card">
        <div class="flight-row">
          <div class="flight-col">
            <div class="flight-time">${dateStr}</div>
            <div class="flight-city">${depCity}</div>
          </div>
          <div class="flight-mid">
            <div class="flight-line"></div>
            <div class="flight-dur">✈️ ${f.airline || ""}</div>
            <div class="flight-line"></div>
          </div>
          <div class="flight-col flight-price-col">
            <div class="flight-price-val">${priceStr}</div>
            <div class="flight-city">${arrCity}</div>
          </div>
          <button class="book-btn" onclick="window.open('${skyscannerUrl}', '_blank')">Select</button>
        </div>
      </div>
    `;
  }).join("");
  document.getElementById("flightsArea").innerHTML = html || "<p>No flights found.</p>";
}

function renderHotels(hotels) {
  const html = hotels.map(h => {
    const hotelName = h.name || h.hotel_name || h.title || "Unknown Hotel";
    const hotelType = h.type || h.hotel_type || h.tier || "Hotel";
    const hotelCost = h.estimated_nightly_cost || h.price_per_night || h.cost || h.price || 0;
    const hotelDesc = h.description || h.desc || h.area || "";

    return `
      <div class="hotel-card">
        <div class="hotel-tier tier-${(hotelType).toLowerCase().replace(" ", "-")}">${hotelType}</div>
        <div class="hotel-name">${hotelName}</div>
        <div class="hotel-desc">${hotelDesc}</div>
        <div class="hotel-price">Estimated: ₹${hotelCost} <span>/ night</span></div>
      </div>
    `;
  }).join("");
  document.getElementById("hotelsArea").innerHTML = html || "<p>No hotels found.</p>";
}

function renderItinerary(itinerary) {
  const html = itinerary.map(day => {
    const acts = (day.activities || []).map(a => {
      if (typeof a === "string") {
        return `
          <div class="activity">
            <div class="act-time">•</div>
            <div class="act-body">
              <div class="act-name">${a}</div>
            </div>
          </div>
        `;
      }
      return `
        <div class="activity">
          <div class="act-time">${a.time || a.time_of_day || "•"}</div>
          <div class="act-body">
            <div class="act-name">${a.activity || a.name || ""}</div>
            <div class="act-desc">${a.description || ""}</div>
          </div>
          <div class="act-cost">${a.cost || a.estimated_cost ? '₹' + (a.cost || a.estimated_cost) : ''}</div>
        </div>
      `;
    }).join("");

    return `
      <div class="day-card">
        <div class="day-header">
          <div class="day-num">D${day.day || ''}</div>
          <div>
            <div class="day-title">${day.theme || day.title || `Day ${day.day || ''}`}</div>
          </div>
        </div>
        <div class="activities">${acts}</div>
      </div>
    `;
  }).join("");
  document.getElementById("itineraryArea").innerHTML = html || "<p>No itinerary found.</p>";
}

function renderBudget(budget, totalCost) {
  if (!Array.isArray(budget)) {
    if (budget && typeof budget === 'object') {
      budget = Object.keys(budget).map(k => ({ category: k, cost: budget[k] }));
    } else {
      budget = [];
    }
  }

  const html = budget.map(b => {
    if (typeof b === "string") {
      return `
        <div class="budget-card">
          <div class="bc-label">Expense</div>
          <div class="bc-amount">${b}</div>
        </div>
      `;
    }
    const category = b.category || b.name || b.item || "Other";
    const cost = b.cost || b.amount || b.price || b.estimated_cost || 0;

    return `
      <div class="budget-card">
        <div class="bc-label">${category}</div>
        <div class="bc-amount">₹${cost}</div>
      </div>
    `;
  }).join("");
  document.getElementById("budgetGrid").innerHTML = html || "<p>No budget breakdown found.</p>";
  document.getElementById("budgetTotal").innerHTML = `
    <div>
      <div class="bt-label">Estimated Total</div>
      <div class="bt-amount">₹${totalCost || 0}</div>
    </div>
  `;
}

function renderTips(tips) {
  const html = tips.map(t => {
    const text = typeof t === "string" ? t : (t.tip || t.description || "");
    return `
      <div class="tip-card">
        <div class="tip-icon">💡</div>
        <div class="tip-text">${text}</div>
      </div>
    `;
  }).join("");
  document.getElementById("tipsArea").innerHTML = html || "<p>No tips found.</p>";
}

let tripMap = null;
let currentPlanData = null;

function renderWeather(weather) {
  if (!weather) return;
  document.getElementById("weatherBar").innerHTML = `
    <div class="wx-item">
      <div class="wx-icon">🌡️</div>
      <div>
        <div class="wx-label">Temp</div>
        <div class="wx-val">${weather.temp || "N/A"}</div>
      </div>
    </div>
    <div class="wx-item">
      <div class="wx-icon">☁️</div>
      <div>
        <div class="wx-label">Condition</div>
        <div class="wx-val">${weather.condition || "N/A"}</div>
      </div>
    </div>
    <div class="wx-item">
      <div class="wx-icon">💧</div>
      <div>
        <div class="wx-label">Humidity</div>
        <div class="wx-val">${weather.humidity || "N/A"}</div>
      </div>
    </div>
    <div class="wx-item">
      <div class="wx-icon">💨</div>
      <div>
        <div class="wx-label">Wind</div>
        <div class="wx-val">${weather.wind || "N/A"}</div>
      </div>
    </div>
  `;
}

function renderPackingList(list) {
  const html = (list || []).map(item => `
    <div class="packing-item" style="display:flex; align-items:center; gap:10px; padding:8px; background:#fff; border-radius:8px; margin-bottom:5px; border:1px solid #eee;">
      <input type="checkbox">
      <span style="font-size:14px;">${item}</span>
    </div>
  `).join("");
  document.getElementById("packingArea").innerHTML = html || "<p>No packing items suggested.</p>";
}

let budgetChartInstance = null;
function renderBudgetChart(budget) {
  const canvas = document.getElementById('budgetChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  if (budgetChartInstance) {
    budgetChartInstance.destroy();
  }

  const labels = budget.map(b => b.category || "Other");
  const values = budget.map(b => b.cost || 0);

  budgetChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
        ],
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: { display: true, text: 'Budget Distribution' }
      }
    }
  });
}

async function renderMap(destination, cities = [], mapSpots = []) {
  document.getElementById("mapBadge").innerText = `📍 Loading map for ${destination}...`;

  if (tripMap) {
    tripMap.remove();
    tripMap = null;
  }

  const wrap = document.querySelector(".map-svg-wrap");
  wrap.innerHTML = '<div id="leafletMap" style="width:100%; height:100%;"></div>';

  try {
    tripMap = L.map('leafletMap').setView([20.5937, 78.9629], 4);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(tripMap);

    const bounds = [];

    if (mapSpots && mapSpots.length > 0) {
      for (let spot of mapSpots) {
        if (spot.lat && spot.lon) {
          L.marker([spot.lat, spot.lon]).addTo(tripMap)
            .bindPopup(`<b>${spot.name}</b><br>${spot.description || ""}`);
          bounds.push([spot.lat, spot.lon]);
        }
      }
    } else {
      const locationsToMap = (cities && cities.length > 0) ? cities : [destination];
      for (let loc of locationsToMap) {
        if (typeof loc !== "string") continue;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          L.marker([lat, lon]).addTo(tripMap).bindPopup(`<b>${loc}</b>`);
          bounds.push([lat, lon]);
        }
      }
    }

    if (bounds.length > 0) {
      tripMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }

    document.getElementById("mapBadge").innerText = `📍 ${destination}`;
    setTimeout(() => { tripMap.invalidateSize(); }, 500);

  } catch (e) {
    console.error("Map error:", e);
    document.getElementById("mapBadge").innerText = `📍 Map error`;
  }
}

async function startPlanning() {
  const query = document.getElementById("queryInput").value;
  const diet = document.getElementById("dietInput") ? document.getElementById("dietInput").value : "";
  const vibe = document.getElementById("vibeInput") ? document.getElementById("vibeInput").value : "";
  const btn = document.getElementById("planBtn");

  if (!query) {
    alert("Enter a trip!");
    return;
  }

  btn.disabled = true;
  btn.innerHTML = "Planning...";
  document.getElementById("errorBox").classList.remove("visible");
  document.getElementById("result").classList.remove("visible");

  const animPromise = animatePipeline();

  try {
    const res = await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query, diet: diet, vibe: vibe })
    });

    const data = await res.json();
    currentPlanData = data;
    console.log("API RESPONSE:", data);

    await animPromise;

    if (data.error) {
      document.getElementById("errorBox").innerText = "Backend Error: " + data.error;
      document.getElementById("errorBox").classList.add("visible");
      hidePipeline();
      btn.disabled = false;
      btn.innerHTML = "Plan it";
      return;
    }

    displayResults(data);

  } catch (err) {
    console.error("FRONTEND ERROR:", err);
    document.getElementById("errorBox").innerText = "Frontend crashed: " + err.message;
    document.getElementById("errorBox").classList.add("visible");
    hidePipeline();
  } finally {
    btn.disabled = false;
    btn.innerHTML = "Plan it";
  }
}

function displayResults(data) {
  const dest = data.destination || "Demo Trip";
  document.getElementById("sbDest").innerText = dest;
  document.getElementById("sbMeta").innerText = `${data.days || 3} days · From ${data.from_city || "Unknown"}`;

  const safeArr = (arr) => {
    if (Array.isArray(arr)) return arr;
    if (arr && typeof arr === 'object') return Object.values(arr);
    return [];
  };

  renderWeather(data.weather);
  renderPackingList(data.packing_list);
  
  let finalBudget = safeArr(data.budget);
  if (finalBudget.length === 0 && data.total_cost > 0) {
    const tc = data.total_cost;
    finalBudget = [
      { category: "Flights & Travel", cost: Math.round(tc * 0.45) },
      { category: "Hotels & Stays", cost: Math.round(tc * 0.35) },
      { category: "Food & Activities", cost: Math.round(tc * 0.20) }
    ];
  }

  let finalTips = safeArr(data.tips);
  if (finalTips.length === 0) {
    finalTips = ["Pack according to weather.", "Keep digital docs.", "Ask locals."];
  }

  renderMap(dest, safeArr(data.cities), safeArr(data.map_spots));
  renderFlights(safeArr(data.flights));
  renderHotels(safeArr(data.hotels));
  renderItinerary(safeArr(data.itinerary));
  renderBudget(finalBudget, data.total_cost || 0);
  renderBudgetChart(finalBudget);
  renderTips(finalTips);

  hidePipeline();
  document.getElementById("result").classList.add("visible");
  document.getElementById("resultAnchor").scrollIntoView({ behavior: 'smooth' });
}

async function runReplan() {
  const instruction = document.getElementById("replanInput").value;
  if (!instruction) return;

  const btn = document.getElementById("replanBtn");
  btn.disabled = true;
  btn.innerText = "Adjusting...";

  try {
    const res = await fetch("/api/replan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_plan: currentPlanData, instruction: instruction })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    
    currentPlanData = data;
    displayResults(data);
    document.getElementById("replanInput").value = "";
  } catch (err) {
    alert("Replan failed: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerText = "Adjust Trip";
  }
}

async function optimizeBudget() {
  document.getElementById("replanInput").value = "optimize cost";
  runReplan();
}

function copyPlan() {
  if (!currentPlanData) return;
  const text = JSON.stringify(currentPlanData, null, 2);
  navigator.clipboard.writeText(text).then(() => {
    alert("JSON Plan copied to clipboard!");
  });
}

function resetPlanner() {
  document.getElementById("result").classList.remove("visible");
  document.getElementById("queryInput").value = "";
  window.scrollTo({ top: 0, behavior: 'smooth' });
}