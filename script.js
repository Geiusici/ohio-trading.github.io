let skins = [];

async function loadData() {
  try {
    const res = await fetch("skins.json");
    if (res.ok) skins = await res.json();
  } catch {}
  if (skins.length === 0 && typeof embeddedSkins !== "undefined") {
    skins = embeddedSkins;
  }
  render();
}

const formatWorth = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return Math.floor(n / 1000) + "K";
  return n.toString();
};

const tbody = document.querySelector("#skinsTable tbody");
const searchInput = document.getElementById("search");
const sortBy = document.getElementById("sortBy");

function render() {
  let list = [...skins];
  const q = searchInput.value.toLowerCase().trim();
  if (q) list = list.filter(s => s.name.toLowerCase().includes(q));

  switch (sortBy.value) {
    case "worth_desc": list.sort((a, b) => (b.worth || 0) - (a.worth || 0)); break;
    case "worth_asc": list.sort((a, b) => (a.worth || 0) - (b.worth || 0)); break;
    case "demand_desc": list.sort((a, b) => (parseFloat(b.demand) || 0) - (parseFloat(a.demand) || 0)); break;
    case "name_asc": list.sort((a, b) => a.name.localeCompare(b.name)); break;
  }

  tbody.innerHTML = "";

  list.forEach((s) => {
    const worthText = s.worth === 0 ? "Unrated" : "$" + formatWorth(s.worth);
    const demandText = s.demand === "?" ? "Unknown" : s.demand + "/10";

    const demandNum = s.demand === "?" ? 0 : parseFloat(s.demand);
    const demandClass = s.demand === "?" ? "unknown" : demandNum >= 8 ? "high" : demandNum >= 6 ? "med" : demandNum >= 4 ? "low" : "low";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td data-label="Skin">${s.name}</td>
      <td data-label="Value" class="${s.worth === 0 ? 'unrated' : 'value'}">${worthText}</td>
      <td data-label="Demand" class="demand ${demandClass}">${demandText}</td>
    `;
    tbody.appendChild(row);
  });
}

searchInput.addEventListener("input", render);
sortBy.addEventListener("change", render);

loadData();
