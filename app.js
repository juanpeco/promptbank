
/* JuanPeco Business Lab — Top 1 static SaaS-like (no frameworks)
   - PromptBank: 5000 prompts JSON
   - Notion-like CMDK search (Ctrl/⌘ K)
   - Filters (category, model, level)
   - Prompt drawer + copy
   - Tools + games + STEAM mini-labs
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const state = {
  prompts: [],
  filtered: [],
  view: "list",
  activeCmdkIndex: 0,
  cmdkItems: [],
  lastCopied: "",
};

function toast(msg="Copiado ✅") {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 1400);
}

async function loadPrompts() {
  const res = await fetch("data/prompts_5000.json");
  const data = await res.json();
  state.prompts = data.prompts;

  initCategoryGrid();
  initFilters();
  applyFilters();
  seedGames();
  initRobotGrid();
}

function groupCounts() {
  const map = new Map();
  state.prompts.forEach(p => {
    map.set(p.category, (map.get(p.category) || 0) + 1);
  });
  return map;
}

function initCategoryGrid() {
  const icons = {
    "Empresa": "📊",
    "Marketing": "📈",
    "Economía": "💰",
    "STEAM": "🤖",
  };
  const desc = {
    "Empresa": "Estrategia, operaciones, RRHH, ventas, producto, legal.",
    "Marketing": "SEO/SEM, growth, contenido, branding, investigación.",
    "Economía": "Macro, micro, mercados, política económica, datos.",
    "STEAM": "Robótica, IA aplicada, programación, data, proyectos.",
  };

  const counts = groupCounts();
  const grid = $("#categoryGrid");
  grid.innerHTML = "";

  Object.keys(icons).forEach(cat => {
    const el = document.createElement("div");
    el.className = "cat-card";
    el.innerHTML = `
      <div class="cat-icon">${icons[cat]}</div>
      <div class="cat-name">${cat}</div>
      <div class="cat-desc">${desc[cat]}</div>
      <div class="cat-count"><span>●</span> ${counts.get(cat) || 0} prompts</div>
    `;
    el.addEventListener("click", () => {
      $("#filterCategory").value = cat;
      $("#quickSearch").value = "";
      applyFilters();
      document.getElementById("promptbank").scrollIntoView({behavior:"smooth"});
    });
    grid.appendChild(el);
  });
}

function initFilters() {
  const cats = [...new Set(state.prompts.map(p => p.category))].sort();
  const catSelects = [$("#filterCategory"), $("#cmdkCategory")];
  catSelects.forEach(sel => {
    cats.forEach(c => {
      const o = document.createElement("option");
      o.value = c; o.textContent = c;
      sel.appendChild(o);
    });
  });

  $("#quickSearch").addEventListener("input", applyFilters);
  $("#filterCategory").addEventListener("change", applyFilters);
  $("#filterModel").addEventListener("change", applyFilters);
  $("#filterLevel").addEventListener("change", applyFilters);

  $("#clearFiltersBtn").addEventListener("click", () => {
    $("#quickSearch").value = "";
    $("#filterCategory").value = "";
    $("#filterModel").value = "";
    $("#filterLevel").value = "";
    applyFilters();
  });

  $("#viewListBtn").addEventListener("click", () => setView("list"));
  $("#viewCardsBtn").addEventListener("click", () => setView("cards"));

  $("#randomPromptBtn").addEventListener("click", () => {
    const p = state.filtered[Math.floor(Math.random() * state.filtered.length)] || state.prompts[Math.floor(Math.random() * state.prompts.length)];
    openPrompt(p);
  });
}

function setView(view) {
  state.view = view;
  $("#viewListBtn").classList.toggle("active", view === "list");
  $("#viewCardsBtn").classList.toggle("active", view === "cards");
  $("#results").classList.toggle("list", view === "list");
  $("#results").classList.toggle("cards", view === "cards");
  renderResults();
}

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Lightweight scoring for "Notion-like" feel
function scoreMatch(query, target) {
  if (!query) return 1;
  const q = normalize(query);
  const t = normalize(target);

  if (t.includes(q)) return 100;

  // fuzzy: all chars in order
  let qi = 0, hits = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) { qi++; hits++; }
  }
  if (hits === 0) return 0;
  return hits * 2;
}

function applyFilters() {
  const q = $("#quickSearch").value;
  const cat = $("#filterCategory").value;
  const model = $("#filterModel").value;
  const level = $("#filterLevel").value;

  let list = state.prompts;

  if (cat) list = list.filter(p => p.category === cat);
  if (model) list = list.filter(p => p.model === model);
  if (level) list = list.filter(p => p.level === level);

  if (q) {
    const nq = normalize(q);
    list = list
      .map(p => {
        const hay = `${p.title} ${p.category} ${p.subcategory} ${p.level} ${p.model} ${p.type} ${p.tags?.join(" ")} ${p.text}`;
        const s = scoreMatch(nq, hay);
        return { p, s };
      })
      .filter(x => x.s > 0)
      .sort((a,b) => b.s - a.s)
      .map(x => x.p);
  }

  state.filtered = list.slice(0, 80); // UI: fast preview list (CMDK gives full power)
  renderResults();
  $("#resultsMeta").textContent = `Mostrando ${state.filtered.length} de ${list.length} resultados (preview rápido). Usa Ctrl/⌘ K para búsqueda completa.`;
}

function renderResults() {
  const wrap = $("#results");
  wrap.innerHTML = "";

  state.filtered.forEach(p => {
    const el = document.createElement("div");
    el.className = "prompt-item";
    el.innerHTML = `
      <div>
        <div class="prompt-title">${escapeHtml(p.title)}</div>
        <div class="prompt-sub">${escapeHtml(p.category)} • ${escapeHtml(p.subcategory)} • ${escapeHtml(p.model)} • ${escapeHtml(p.level)}</div>
        <div class="prompt-tags">
          <span class="pill-mini">${escapeHtml(p.type)}</span>
          ${(p.tags || []).slice(0,4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      </div>
      <div style="display:flex;align-items:flex-start;justify-content:flex-end;gap:8px;">
        <button class="btn soft small" data-copy="1">Copiar</button>
      </div>
    `;

    el.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button[data-copy]");
      if (btn) {
        e.stopPropagation();
        navigator.clipboard.writeText(p.text).then(() => toast("Prompt copiado ✅"));
        return;
      }
      openPrompt(p);
    });

    wrap.appendChild(el);
  });
}

function escapeHtml(str="") {
  return str.replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

// Drawer
function openPrompt(p) {
  $("#drawerTitle").textContent = p.title;
  $("#drawerSub").textContent = `${p.category} • ${p.subcategory} • ${p.model} • ${p.level} • id: ${p.id}`;
  $("#drawerBody").textContent = p.text;

  const drawer = $("#promptDrawer");
  drawer.classList.remove("hidden");
  drawer.setAttribute("aria-hidden", "false");

  $("#copyPromptBtn").onclick = async () => {
    await navigator.clipboard.writeText(p.text);
    toast("Prompt copiado ✅");
  };
}

function closeDrawer() {
  const drawer = $("#promptDrawer");
  drawer.classList.add("hidden");
  drawer.setAttribute("aria-hidden", "true");
}

$("#drawerBackdrop").addEventListener("click", closeDrawer);
$("#closeDrawerBtn").addEventListener("click", closeDrawer);

// CMDK
function openCmdk() {
  $("#cmdkModal").classList.remove("hidden");
  $("#cmdkInput").focus();
  state.activeCmdkIndex = 0;
  cmdkSearch();
}
function closeCmdk() {
  $("#cmdkModal").classList.add("hidden");
}
$("#cmdkBackdrop").addEventListener("click", closeCmdk);
$("#closeCmdkBtn").addEventListener("click", closeCmdk);
$("#cmdkBtn").addEventListener("click", openCmdk);
$("#openSearchBtn").addEventListener("click", openCmdk);

document.addEventListener("keydown", (e) => {
  const isMac = navigator.platform.toLowerCase().includes("mac");
  const mod = isMac ? e.metaKey : e.ctrlKey;

  if (mod && e.key.toLowerCase() === "k") {
    e.preventDefault();
    const open = !$("#cmdkModal").classList.contains("hidden");
    open ? closeCmdk() : openCmdk();
  }
  if (e.key === "Escape") {
    if (!$("#promptDrawer").classList.contains("hidden")) closeDrawer();
    if (!$("#cmdkModal").classList.contains("hidden")) closeCmdk();
  }

  if (!$("#cmdkModal").classList.contains("hidden")) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveCmdk(1); }
    if (e.key === "ArrowUp") { e.preventDefault(); moveCmdk(-1); }
    if (e.key === "Enter") { e.preventDefault(); openActiveCmdk(); }
  }
});

$("#cmdkInput").addEventListener("input", () => { state.activeCmdkIndex = 0; cmdkSearch(); });
$("#cmdkCategory").addEventListener("change", () => { state.activeCmdkIndex = 0; cmdkSearch(); });
$("#cmdkModel").addEventListener("change", () => { state.activeCmdkIndex = 0; cmdkSearch(); });
$("#cmdkLevel").addEventListener("change", () => { state.activeCmdkIndex = 0; cmdkSearch(); });
$("#cmdkClearBtn").addEventListener("click", () => {
  $("#cmdkInput").value = "";
  $("#cmdkCategory").value = "";
  $("#cmdkModel").value = "";
  $("#cmdkLevel").value = "";
  state.activeCmdkIndex = 0;
  cmdkSearch();
});

function cmdkSearch() {
  const q = $("#cmdkInput").value;
  const cat = $("#cmdkCategory").value;
  const model = $("#cmdkModel").value;
  const level = $("#cmdkLevel").value;

  let list = state.prompts;
  if (cat) list = list.filter(p => p.category === cat);
  if (model) list = list.filter(p => p.model === model);
  if (level) list = list.filter(p => p.level === level);

  // Score + top results
  const nq = normalize(q);
  const scored = list.map(p => {
    const hay = `${p.title} ${p.category} ${p.subcategory} ${p.level} ${p.model} ${p.type} ${p.tags?.join(" ")} ${p.text}`;
    return { p, s: scoreMatch(nq, hay) };
  }).filter(x => nq ? x.s > 0 : true)
    .sort((a,b) => b.s - a.s)
    .slice(0, 40);

  state.cmdkItems = scored.map(x => x.p);
  renderCmdkResults();
}

function renderCmdkResults() {
  const wrap = $("#cmdkResults");
  wrap.innerHTML = "";

  if (!state.cmdkItems.length) {
    wrap.innerHTML = `<div class="meta">Sin resultados. Prueba otra palabra o quita filtros.</div>`;
    return;
  }

  state.cmdkItems.forEach((p, idx) => {
    const el = document.createElement("div");
    el.className = "cmdk-item" + (idx === state.activeCmdkIndex ? " active" : "");
    el.innerHTML = `
      <div class="prompt-title">${escapeHtml(p.title)}</div>
      <div class="prompt-sub">${escapeHtml(p.category)} • ${escapeHtml(p.subcategory)} • ${escapeHtml(p.model)} • ${escapeHtml(p.level)}</div>
      <div class="prompt-tags">
        <span class="pill-mini">${escapeHtml(p.type)}</span>
        ${(p.tags || []).slice(0,4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
      </div>
    `;
    el.addEventListener("click", () => {
      closeCmdk();
      openPrompt(p);
    });
    wrap.appendChild(el);
  });
}

function moveCmdk(delta) {
  const n = state.cmdkItems.length;
  if (!n) return;
  state.activeCmdkIndex = (state.activeCmdkIndex + delta + n) % n;
  renderCmdkResults();

  const active = $("#cmdkResults .cmdk-item.active");
  active?.scrollIntoView({block:"nearest"});
}

function openActiveCmdk() {
  const p = state.cmdkItems[state.activeCmdkIndex];
  if (!p) return;
  closeCmdk();
  openPrompt(p);
}

// Tools
$("#runSimBtn").addEventListener("click", () => {
  const rev = Number($("#simRevenue").value || 0);
  const cost = Number($("#simCosts").value || 0);
  const inv = Number($("#simInvestment").value || 0);
  const months = Math.max(1, Number($("#simMonths").value || 12));

  const profit = rev - cost;
  const cum = profit * months - inv;
  const breakeven = profit > 0 ? Math.ceil(inv / profit) : Infinity;

  const out = [
    `Beneficio mensual estimado: €${fmt(profit)}`,
    `Resultado a ${months} meses (beneficio*meses - inversión): €${fmt(cum)}`,
    `Punto de equilibrio: ${breakeven === Infinity ? "No alcanza (beneficio mensual ≤ 0)" : breakeven + " meses"}`,
    ``,
    `Notas:`,
    `- Esto es un modelo simple; añade estacionalidad, impuestos, churn, cobros/pagos y CAPEX si aplica.`,
    `- Úsalo para comparar escenarios, no para “adivinar” el futuro.`
  ].join("\n");

  $("#simOutput").textContent = out;
});

let lastCase = "";
$("#genCaseBtn").addEventListener("click", () => {
  const idea = $("#caseIdea").value.trim() || "Proyecto sin nombre";
  const market = $("#caseMarket").value.trim() || "Mercado no especificado";
  const budget = Number($("#caseBudget").value || 0);
  const weeks = Math.max(1, Number($("#caseWeeks").value || 8));

  const assumptions = [
    "Conversión inicial 1.8% → objetivo 2.2%",
    "Ticket medio +8% con bundles",
    "Coste de adquisición estable (controlado por ROAS mínimo)",
    "Riesgo operativo moderado (dependencias técnicas)"
  ];
  const kpis = ["Ingresos incrementales", "Margen bruto", "CAC", "LTV", "Payback", "Retención"];
  const risks = ["Sobrecoste por alcance", "Cambios regulatorios", "Baja adopción inicial", "Capacidad del equipo"];

  const caseText = [
    `# Caso de negocio — ${idea}`,
    ``,
    `## 1) Contexto`,
    `- Mercado: ${market}`,
    `- Presupuesto: €${fmt(budget)}`,
    `- Plazo: ${weeks} semanas`,
    ``,
    `## 2) Hipótesis`,
    assumptions.map(a => `- ${a}`).join("\n"),
    ``,
    `## 3) Plan (alto nivel)`,
    `- Semana 1-2: discovery + definición de métricas`,
    `- Semana 3-5: implementación + QA + instrumentación`,
    `- Semana 6-7: piloto + A/B test`,
    `- Semana 8: rollout + documentación + handover`,
    ``,
    `## 4) KPIs`,
    kpis.map(k => `- ${k}`).join("\n"),
    ``,
    `## 5) Riesgos y mitigación`,
    risks.map(r => `- ${r} → Mitigación: plan de contingencia + checkpoints semanales`).join("\n"),
    ``,
    `## 6) Decisión recomendada`,
    `Aprobar si: (a) ROI esperado > 1.5x en 6-9 meses, (b) owner asignado, (c) tracking completo desde el día 1.`,
  ].join("\n");

  lastCase = caseText;
  $("#caseOutput").textContent = caseText;
  $("#copyCaseBtn").disabled = false;
});

$("#copyCaseBtn").addEventListener("click", async () => {
  if (!lastCase) return;
  await navigator.clipboard.writeText(lastCase);
  toast("Caso copiado ✅");
});

let lastPP = "";
$("#genPerfectPromptBtn").addEventListener("click", () => {
  const role = $("#ppRole").value.trim() || "consultor senior";
  const goal = $("#ppGoal").value.trim() || "definir una estrategia";
  const cons = $("#ppConstraints").value.trim() || "sin suposiciones ocultas; declarar incertidumbre";
  const fmtOut = $("#ppFormat").value.trim() || "tabla + bullets";

  const p = [
    `Actúa como ${role}.`,
    `Objetivo: ${goal}.`,
    `Restricciones: ${cons}.`,
    `Entrega:`,
    `1) Resumen ejecutivo (5 bullets).`,
    `2) Método paso a paso.`,
    `3) Supuestos explícitos.`,
    `4) Riesgos + mitigación.`,
    `5) KPIs.`,
    `Formato: ${fmtOut}.`,
    `Pregunta final: “¿Qué dato faltante cambiaría más la recomendación?”`
  ].join("\n");

  lastPP = p;
  $("#ppOutput").textContent = p;
  $("#copyPPBtn").disabled = false;
});

$("#copyPPBtn").addEventListener("click", async () => {
  if (!lastPP) return;
  await navigator.clipboard.writeText(lastPP);
  toast("Prompt copiado ✅");
});

// Games
const scenarios = [
  {
    text: "Tu ROAS cae un 25% en dos semanas. ¿Qué haces primero?",
    options: [
      { t: "Auditar tracking + atribución y revisar cambios de campaña", d: { profit:+6, risk:-4, brand:+1 } },
      { t: "Subir presupuesto para compensar volumen", d: { profit:+2, risk:+6, brand:-1 } },
      { t: "Pausar campañas y reconfigurar creatividades", d: { profit:+4, risk:+1, brand:+2 } },
    ]
  },
  {
    text: "Aumenta la rotación del equipo comercial. ¿Decisión?",
    options: [
      { t: "Revisar variable + enablement + manager coaching", d: { profit:+4, risk:-2, brand:+3 } },
      { t: "Contratar rápido y asumir curva de ramp-up", d: { profit:+2, risk:+4, brand:-1 } },
      { t: "Reducir objetivos para aliviar presión", d: { profit:-2, risk:-1, brand:+2 } },
    ]
  },
  {
    text: "Competidor lanza una oferta más barata. ¿Respuesta?",
    options: [
      { t: "Reforzar valor: paquetes + garantías + caso de ROI", d: { profit:+3, risk:+1, brand:+4 } },
      { t: "Igualar precio de inmediato", d: { profit:+1, risk:+4, brand:-2 } },
      { t: "Segmentar: descuento solo a cuentas sensibles", d: { profit:+4, risk:+2, brand:+1 } },
    ]
  },
  {
    text: "Tu inventario se agota por picos de demanda. ¿Qué haces?",
    options: [
      { t: "Ajustar reorder point + stock de seguridad con datos", d: { profit:+4, risk:-2, brand:+2 } },
      { t: "Acelerar compras sin análisis", d: { profit:+1, risk:+5, brand:-1 } },
      { t: "Subir precio temporalmente", d: { profit:+3, risk:+2, brand:-2 } },
    ]
  },
];

let metrics = { profit:0, risk:0, brand:0 };

function seedGames() {
  newScenario();
  $("#newScenarioBtn").addEventListener("click", newScenario);

  // Sprint strategy
  const items = [
    { name:"Landing nueva (CRO)", cost:25, impact:28 },
    { name:"SEO técnico (Core Web Vitals)", cost:20, impact:20 },
    { name:"Email lifecycle (retención)", cost:18, impact:22 },
    { name:"Pricing test por segmentos", cost:22, impact:26 },
    { name:"Programa partners", cost:30, impact:24 },
    { name:"Dashboard ejecutivo", cost:15, impact:14 },
    { name:"Soporte: base de conocimiento", cost:10, impact:12 },
    { name:"Creatividades + UGC", cost:16, impact:18 },
  ];

  let budget = 100, impact = 0;
  const list = $("#sprintList");
  list.innerHTML = "";

  function render() {
    $("#budgetLeft").textContent = budget;
    $("#impactScore").textContent = impact;
  }

  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "sprint-item";
    row.innerHTML = `
      <div>
        <div class="prompt-title">${it.name}</div>
        <small>Coste: ${it.cost} · Impacto: ${it.impact}</small>
      </div>
      <button class="btn soft small">Añadir</button>
    `;
    const btn = row.querySelector("button");
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      if (budget - it.cost < 0) { toast("No hay presupuesto"); return; }
      budget -= it.cost;
      impact += it.impact;
      btn.disabled = true;
      btn.textContent = "OK";
      render();
    });
    list.appendChild(row);
  });

  $("#resetSprintBtn").addEventListener("click", () => {
    budget = 100;
    impact = 0;
    $$("#sprintList button").forEach((b) => { b.disabled = false; b.textContent = "Añadir"; });
    render();
  });

  render();
}

function newScenario() {
  const s = scenarios[Math.floor(Math.random() * scenarios.length)];
  $("#gameScenario").textContent = s.text;

  const wrap = $("#gameActions");
  wrap.innerHTML = "";

  s.options.forEach((opt) => {
    const b = document.createElement("button");
    b.className = "btn soft";
    b.textContent = opt.t;
    b.addEventListener("click", () => {
      metrics.profit += opt.d.profit;
      metrics.risk += opt.d.risk;
      metrics.brand += opt.d.brand;

      $("#mProfit").textContent = metrics.profit;
      $("#mRisk").textContent = metrics.risk;
      $("#mBrand").textContent = metrics.brand;

      toast(`Impacto: ${fmtSigned(opt.d.profit)} beneficio, ${fmtSigned(opt.d.risk)} riesgo, ${fmtSigned(opt.d.brand)} reputación`);
      newScenario();
    });
    wrap.appendChild(b);
  });
}

function fmtSigned(n) {
  return (n >= 0 ? "+" : "") + n;
}

function fmt(n) {
  return (Math.round(n * 100) / 100).toLocaleString("es-ES");
}

// STEAM — Robot grid + BFS
const gridSize = 10;
let grid = []; // 0 empty, 1 block
let start = { r:0, c:0 };
let end = { r:9, c:9 };

function initRobotGrid() {
  grid = Array.from({length:gridSize}, () => Array.from({length:gridSize}, () => 0));

  const wrap = $("#robotGrid");
  wrap.innerHTML = "";

  for (let r=0; r<gridSize; r++) {
    for (let c=0; c<gridSize; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.r = r;
      cell.dataset.c = c;
      cell.addEventListener("click", () => toggleCell(r,c,cell));
      wrap.appendChild(cell);
    }
  }

  markSpecial();

  $("#solveGridBtn").addEventListener("click", solveGrid);
  $("#clearGridBtn").addEventListener("click", () => {
    grid = Array.from({length:gridSize}, () => Array.from({length:gridSize}, () => 0));
    $$("#robotGrid .cell").forEach(c => c.className = "cell");
    markSpecial();
    $("#gridMeta").textContent = "";
  });
}

function markSpecial() {
  const startCell = getCell(start.r, start.c);
  const endCell = getCell(end.r, end.c);
  startCell.classList.add("start");
  endCell.classList.add("end");
}

function getCell(r,c) {
  return $(`#robotGrid .cell[data-r="${r}"][data-c="${c}"]`);
}

function toggleCell(r,c,el) {
  if ((r === start.r && c === start.c) || (r === end.r && c === end.c)) return;
  grid[r][c] = grid[r][c] ? 0 : 1;
  el.classList.toggle("block", grid[r][c] === 1);
}

function solveGrid() {
  // clear old paths
  $$("#robotGrid .cell").forEach(c => c.classList.remove("path"));

  const prev = Array.from({length:gridSize}, () => Array.from({length:gridSize}, () => null));
  const q = [];
  q.push(start);
  prev[start.r][start.c] = { r:-1, c:-1 };

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  while (q.length) {
    const cur = q.shift();
    if (cur.r === end.r && cur.c === end.c) break;
    for (const [dr,dc] of dirs) {
      const nr = cur.r + dr, nc = cur.c + dc;
      if (nr<0||nc<0||nr>=gridSize||nc>=gridSize) continue;
      if (grid[nr][nc] === 1) continue;
      if (prev[nr][nc]) continue;
      prev[nr][nc] = cur;
      q.push({r:nr,c:nc});
    }
  }

  if (!prev[end.r][end.c]) {
    $("#gridMeta").textContent = "Sin ruta. Quita obstáculos.";
    return;
  }

  // backtrack
  let steps = 0;
  let cur = end;
  while (!(cur.r === start.r && cur.c === start.c)) {
    const p = prev[cur.r][cur.c];
    if (!p) break;
    if (!((cur.r === end.r && cur.c === end.c) || (cur.r === start.r && cur.c === start.c))) {
      getCell(cur.r,cur.c).classList.add("path");
    }
    cur = p;
    steps++;
    if (steps > 500) break;
  }
  $("#gridMeta").textContent = `Ruta encontrada. Pasos: ${steps}`;
}

// Inventory
$("#calcInvBtn").addEventListener("click", () => {
  const d = Number($("#invDemand").value || 0);
  const L = Number($("#invLead").value || 0);
  const std = Number($("#invStd").value || 0);
  const service = Math.min(0.99, Math.max(0.9, Number($("#invService").value || 0.95)));

  // Approx z for service level (quick)
  const z = approxZ(service);
  const safety = z * std * Math.sqrt(L);
  const rop = d * L + safety;

  $("#invOutput").textContent = [
    `Nivel servicio: ${service}`,
    `z aprox: ${z.toFixed(2)}`,
    `Stock de seguridad: ${Math.round(safety)} u`,
    `Punto de pedido (ROP): ${Math.round(rop)} u`,
    ``,
    `Nota: modelo simplificado (demanda ~ normal).`
  ].join("\n");
});

// A/B
$("#calcAbBtn").addEventListener("click", () => {
  const base = Number($("#abBase").value || 0) / 100;
  const lift = Number($("#abLift").value || 0) / 100;
  const traffic = Math.max(1, Number($("#abTraffic").value || 1));

  const p1 = base;
  const p2 = base * (1 + lift);

  // rough sample size per variant for 95% conf, 80% power (approx)
  const zA = 1.96, zB = 0.84;
  const pbar = (p1 + p2) / 2;
  const num = (zA * Math.sqrt(2 * pbar * (1 - pbar)) + zB * Math.sqrt(p1*(1-p1) + p2*(1-p2))) ** 2;
  const den = (p2 - p1) ** 2;
  const n = Math.ceil(num / den);

  const days = Math.ceil((2 * n) / traffic);

  $("#abOutput").textContent = [
    `Conv. base: ${(p1*100).toFixed(2)}%`,
    `Conv. objetivo: ${(p2*100).toFixed(2)}%`,
    `Muestra aprox: ${n.toLocaleString("es-ES")} por variante`,
    `Duración aprox: ${days} días (con ${traffic}/día total)`,
    ``,
    `Nota: aproximación. Ajusta por estacionalidad y múltiples tests.`
  ].join("\n");
});

// z approximation (inverse normal) — simple approximation for 0.90..0.99
function approxZ(p) {
  const table = [
    [0.90, 1.28],
    [0.91, 1.34],
    [0.92, 1.41],
    [0.93, 1.48],
    [0.94, 1.55],
    [0.95, 1.65],
    [0.96, 1.75],
    [0.97, 1.88],
    [0.98, 2.05],
    [0.99, 2.33],
  ];
  for (let i=0;i<table.length;i++){
    if (p <= table[i][0]) return table[i][1];
  }
  return 2.33;
}

loadPrompts().catch(err => {
  console.error(err);
  $("#resultsMeta").textContent = "Error cargando prompts. Revisa la ruta data/prompts_5000.json";
});
