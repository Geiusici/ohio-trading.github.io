let skins = [];
const defaultSkins = [
  {"name":"Galaxy Reaper","worth":2500,"demand":"Very High","rarity":"legend"},
  {"name":"Crimson Fury","worth":1200,"demand":"High","rarity":"epic"},
  {"name":"Neon Viper","worth":850,"demand":"Medium","rarity":"rare"},
  {"name":"Ghost Iron","worth":300,"demand":"Low","rarity":"common"},
  {"name":"Urban Camo X","worth":150,"demand":"Low","rarity":"common"}
];

// DOM
const tbody = document.querySelector("#skinsTable tbody");
const searchInput = document.getElementById("search");
const filterDemand = document.getElementById("filterDemand");
const sortBy = document.getElementById("sortBy");
const emptyText = document.getElementById("empty");
const editor = document.getElementById("editor");
const editorArea = document.getElementById("editorArea");

// Load data
async function loadData(){
  try{
    const res = await fetch("skins.json");
    skins = await res.json();
  }catch{
    skins = [...defaultSkins];
  }
  render();
}

// Render
function render(){
  let list = skins.slice();

  // Search
  const q = searchInput.value.toLowerCase();
  if(q) list = list.filter(s => s.name.toLowerCase().includes(q));

  // Demand filter
  if(filterDemand.value)
    list = list.filter(s => s.demand === filterDemand.value);

  // Sort
  const key = sortBy.value;
  const order = {"Very High":4,"High":3,"Medium":2,"Low":1};

  if(key === "worth_desc") list.sort((a,b)=>b.worth - a.worth);
  if(key === "worth_asc") list.sort((a,b)=>a.worth - b.worth);
  if(key === "name_asc") list.sort((a,b)=>a.name.localeCompare(b.name));
  if(key === "demand_desc") list.sort((a,b)=>(order[b.demand]||0)-(order[a.demand]||0));

  tbody.innerHTML = "";

  if(list.length === 0){
    emptyText.style.display = "block";
    return;
  }
  emptyText.style.display = "none";

  for(const s of list){
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.worth.toLocaleString()}</td>
      <td>${s.demand}</td>
      <td class="rarity-${s.rarity}">${s.rarity.toUpperCase()}</td>
    `;

    tbody.appendChild(row);
  }
}

// UI Events
searchInput.addEventListener("input", render);
filterDemand.addEventListener("change", render);
sortBy.addEventListener("change", render);

// Editor
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
  } catch {
    alert("Invalid JSON");
  }
};

document.getElementById("resetData").onclick = () => {
  editorArea.value = JSON.stringify(defaultSkins, null, 2);
};

// Download
document.getElementById("downloadJson").onclick = () => {
  const blob = new Blob([JSON.stringify(skins, null, 2)], {type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "skins.json";
  a.click();
};

// Init
loadData();
