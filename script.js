let skins = [];

// Load from skins.json (or fallback to embedded data if file missing)
async function loadData() {
  try {
    const res = await fetch("skins.json");
    if (!res.ok) throw new Error();
    skins = await res.json();
  } catch (e) {
    console.warn("skins.json not found – using embedded data");
    skins = embeddedSkins; // defined in skins.js
  }
  render();
}

// Formatting helpers
const formatWorth = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
  return num.toLocaleString();
};

// Main render
const tbody = document.querySelector("#skinsTable tbody");
const searchInput = document.getElementById("search");
const sortBy = document.getElementById("sortBy");
const emptyText = document.getElementById("empty");

function render() {
  let list = skins.slice();

  // Search
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    list = list.filter(s => s.name.toLowerCase().includes(query));
  }

  // Sorting
  switch (sortBy.value) {
    case "worth_desc":
      list.sort((a, b) => b.worth - a.worth);
      break;
    case "worth_asc":
      list.sort((a, b) => a.worth - b.worth);
      break;
    case "demand_desc":
      list.sort((a, b) => parseFloat(b.demand) - parseFloat(a.demand));
      break;
    case "name_asc":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
  }

  tbody.innerHTML = "";
  if (list.length === 0) {
    emptyText.style.display = "block";
    return;
  }
  emptyText.style.display = "none";

  for (const s of list) {
    const row = document.createElement("tr");
    const demandNum = parseFloat(s.demand);
    const demandClass = demandNum >= 8 ? "high" : demandNum >= 6 ? "med" : demandNum >= 4 ? "low" : "very-low";

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

// Editor Modal
const editor = document.getElementById("editor");
const editorArea = document.getElementById("editorArea");

document.getElementById("openEditor").onclick = () => {
  editorArea.value = JSON.stringify(skins, null, 2);
  editor.setAttribute("aria-hidden", "false");
};
document.getElementById("closeEditor").onclick = () => {
  editor.setAttribute("aria-hidden", "true");
};
document.getElementById("saveEditor").onclick = () => {
  try {
    skins = JSON.parse(editorArea.value);
    editor.setAttribute("aria-hidden", "true");
    render();
  } catch (err) {
    alert("Invalid JSON! Check your syntax.");
  }
};
document.getElementById("resetData").onclick = () => {
  editorArea.value = JSON.stringify(skins, null, 2);
};

// Download current data
document.getElementById("downloadJson").onclick = () => {
  const data = JSON.stringify(skins, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "skins.json";
  a.click();
  URL.revokeObjectURL(url);
};

// Start
loadData();
