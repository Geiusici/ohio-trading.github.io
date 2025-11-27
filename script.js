let skins = [];

// Load data — will always work thanks to embeddedSkins in skins.js
async function loadData() {
  try {
    const res = await fetch("skins.json");
    if (res.ok) skins = await res.json();
  } catch (e) {
    // Silently fall back to embedded data
  } finally {
    if (skins.length === 0 && typeof embeddedSkins !== "undefined") {
      skins = embeddedSkins;
    }
    render();
  }
}

const formatWorth = n => n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? Math.floor(n/1e3)+"K" : n;

const tbody       = document.querySelector("#skinsTable tbody");
const searchInput = document.getElementById("search");
const sortBy      = document.getElementById("sortBy");

function render() {
  let list = skins.slice();

  // Search
  const q = searchInput.value.trim().toLowerCase();
  if (q) list = list.filter(s => s.name.toLowerCase().includes(q));

  // Sort
  switch (sortBy.value) {
    case "worth_desc":  list.sort((a,b) => b.worth - a.worth); break;
    case "worth_asc":   list.sort((a,b) => a.worth - b.worth); break;
    case "demand_desc": list.sort((a,b) => parseFloat(b.demand) - parseFloat(a.demand)); break;
    case "name_asc":    list.sort((a,b) => a.name.localeCompare(b.name)); break;
  }

  tbody.innerHTML = "";
  for (const s of list) {
    const demandNum = parseFloat(s.demand);
    const demandClass = demandNum >= 8 ? "high" : demandNum >= 6 ? "med" : demandNum >= 4 ? "low" : "very-low";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="skin-name">${s.name}</td>
      <td class="worth">$${formatWorth(s.worth)}</td>
      <td class="demand ${demandClass}">${s.demand}/10</td>
    `;
    tbody.appendChild(row);
  }
}

// Live search & sort
searchInput.addEventListener("input", render);
sortBy.addEventListener("change", render);

// Start
loadData();
