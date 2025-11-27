let skins = [];

async function loadData() {
  try {
    const res = await fetch("skins.json");
    if (res.ok) skins = await res.json();
  } catch {}
  if (skins.length === 0 && typeof embeddedSkins !== "undefined") skins = embeddedSkins;
  render();
}

const formatWorth = n => n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? Math.floor(n/1e3)+"K" : n.toString();

const tbody = document.querySelector("#skinsTable tbody");
const searchInput = document.getElementById("search");
const sortBy = document.getElementById("sortBy");

function render() {
  let list = skins.slice();
  const q = searchInput.value.trim().toLowerCase();
  if (q) list = list.filter(s => s.name.toLowerCase().includes(q));

  // Sorting
  switch (sortBy.value) {
    case "worth_desc":  list.sort((a,b) => (b.worth || 0) - (a.worth || 0)); break;
    case "worth_asc":   list.sort((a,b) => (a.worth || 0) - (b.worth || 0)); break;
    case "demand_desc": list.sort((a,b) => (parseFloat(b.demand) || 0) - (parseFloat(a.demand) || 0)); break;
    case "name_asc":    list.sort((a,b) => a.name.localeCompare(b.name)); break;
  }

  tbody.innerHTML = "";

  for (const s of list) {
    const isUnrated = s.worth === 0;
    const isUnknownDemand = s.demand === "?";

    const demandNum = isUnknownDemand ? 0 : parseFloat(s.demand) || 0;
    const demandClass = isUnknownDemand ? "unknown" :
                        demandNum >= 8 ? "high" :
                        demandNum >= 6 ? "med" :
                        demandNum >= 4 ? "low" : "low";

    const worthText = isUnrated ? "Unrated" : "$" + formatWorth(s.worth);
    const demandText = isUnknownDemand ? "Unknown" : s.demand + "/10";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Skin">${s.name}</td>
      <td data-label="Value" class="value ${isUnrated ? 'unrated' : ''}">${worthText}</td>
      <td data-label="Demand" class="demand ${demandClass}">${demandText}</td>
    `;
    tbody.appendChild(row);
  }
}

searchInput.addEventListener("input", render);
sortBy.addEventListener("change", render);

loadData();
