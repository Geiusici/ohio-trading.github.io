let skins = [];

async function loadData() {
  try {
    const res = await fetch("skins.json");
    if (!res.ok) throw 0;
    skins = await res.json();
  } catch {
    console.warn("skins.json not found → using embedded fallback");
    skins = embeddedSkins;
  }
  render();
}

const formatWorth = n => n >= 1e6 ? (n/1e6).toFixed(1)+"M" : n >= 1e3 ? (n/1e3)+"K" : n;
const tbody = document.querySelector("#skinsTable tbody");
const searchInput = document.getElementById("search");
const sortBy = document.getElementById("sortBy");
const emptyText = document.getElementById("empty");

function render() {
  let list = skins.slice();
  const q = searchInput.value.trim().toLowerCase();
  if (q) list = list.filter(s => s.name.toLowerCase().includes(q));

  switch (sortBy.value) {
    case "worth_desc": list.sort((a,b)=>b.worth-a.worth); break;
    case "worth_asc":  list.sort((a,b)=>a.worth-b.worth); break;
    case "demand_desc":list.sort((a,b)=>parseFloat(b.demand)-parseFloat(a.demand)); break;
    case "name_asc":   list.sort((a,b)=>a.name.localeCompare(b.name)); break;
  }

  tbody.innerHTML = "";
  if (!list.length) return emptyText.style.display = "block";
  emptyText.style.display = "none";

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

searchInput.addEventListener("input", render);
sortBy.addEventListener("change", render);

// Editor
document.getElementById("openEditor").onclick = () => {
  document.getElementById("editorArea").value = JSON.stringify(skins,null,2);
  document.getElementById("editor").setAttribute("aria-hidden","false");
};
document.getElementById("closeEditor").onclick = () => document.getElementById("editor").setAttribute("aria-hidden","true");
document.getElementById("saveEditor").onclick = () => {
  try {
    skins = JSON.parse(document.getElementById("editorArea").value);
    document.getElementById("editor").setAttribute("aria-hidden","true");
    render();
  } catch { alert("Invalid JSON!"); }
};
document.getElementById("resetData").onclick = () => {
  document.getElementById("editorArea").value = JSON.stringify(skins,null,2);
};
document.getElementById("downloadJson").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([JSON.stringify(skins,null,2)], {type:"application/json"}));
  a.download = "skins.json";
  a.click();
};

loadData();
