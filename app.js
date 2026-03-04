/* JuanPeco Prompt Studio — single-page app (no build) */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  prompts: [],
  filtered: [],
  categories: new Map(), // cat -> Set(subcats)
  page: 1,
  pageSize: 18,
  selected: null,
  charts: { sim: null },
};

const ICONS = {
  "Estrategia":"🧭",
  "Marketing":"📣",
  "Ventas":"🤝",
  "Finanzas":"📊",
  "Operaciones":"⚙️",
  "Producto":"🧩",
  "People":"🧑‍🤝‍🧑",
  "Legal & Compliance":"🛡️",
  "Datos & IA":"🧠",
  "STEAM & Robótica":"🤖",
};

function fmtEUR(n){
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("es-ES", { style:"currency", currency:"EUR", maximumFractionDigits:0 });
}
function fmtNum(n, digits=0){
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toLocaleString("es-ES", { maximumFractionDigits: digits });
}
function toast(msg="Copiado ✅"){
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-show");
  window.setTimeout(()=>t.classList.remove("is-show"), 1200);
}
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    toast();
  }catch{
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast();
  }
}

function buildCategoryIndex(){
  state.categories.clear();
  for (const p of state.prompts){
    if (!state.categories.has(p.category)) state.categories.set(p.category, new Set());
    state.categories.get(p.category).add(p.subcategory);
  }
}

function populateFilters(){
  const catSel = $("#filter-category");
  const aiSel = $("#filter-ai");
  const subSel = $("#filter-subcategory");

  const cats = Array.from(state.categories.keys()).sort((a,b)=>a.localeCompare(b, "es"));
  for (const c of cats){
    const opt = document.createElement("option");
    opt.value = c; opt.textContent = c;
    catSel.appendChild(opt);
  }

  const ai = Array.from(new Set(state.prompts.map(p=>p.ai))).sort();
  for (const a of ai){
    const opt = document.createElement("option");
    opt.value = a; opt.textContent = a;
    aiSel.appendChild(opt);
  }

  // subcategory filled on category change
  subSel.innerHTML = '<option value="">Todas</option>';
  subSel.disabled = true;
}

function renderCategoryCards(){
  const wrap = $("#category-cards");
  wrap.innerHTML = "";
  const cats = Array.from(state.categories.keys()).sort((a,b)=>a.localeCompare(b, "es"));
  for (const c of cats){
    const count = state.prompts.filter(p=>p.category===c).length;
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card__icon">${ICONS[c] ?? "📌"}</div>
      <div class="card__title">${c}</div>
      <div class="card__meta">${count} prompts • ${state.categories.get(c).size} subcategorías</div>
    `;
    card.addEventListener("click", ()=>{
      $("#filter-category").value = c;
      onCategoryChange();
      applyFilters(true);
      document.location.hash = "#prompts";
    });
    wrap.appendChild(card);
  }
}

function currentFilters(){
  return {
    category: $("#filter-category").value.trim(),
    subcategory: $("#filter-subcategory").value.trim(),
    ai: $("#filter-ai").value.trim(),
    stars: $("#filter-stars").value.trim(),
    text: $("#filter-text").value.trim().toLowerCase(),
  };
}

function applyFilters(resetPage=false){
  if (resetPage) state.page = 1;

  const f = currentFilters();
  const out = state.prompts.filter(p=>{
    if (f.category && p.category !== f.category) return false;
    if (f.subcategory && p.subcategory !== f.subcategory) return false;
    if (f.ai && p.ai !== f.ai) return false;
    if (f.stars && p.effectiveness !== f.stars) return false;
    if (f.text){
      const hay = (p.title + " " + p.text + " " + p.category + " " + p.subcategory + " " + (p.tags||[]).join(" ")).toLowerCase();
      if (!hay.includes(f.text)) return false;
    }
    return true;
  });

  state.filtered = out;
  $("#results-meta").textContent = `${fmtNum(out.length)} resultados • Página ${state.page}/${Math.max(1, Math.ceil(out.length/state.pageSize))}`;
  renderPromptList();
  renderPager();
}

function renderPromptList(){
  const list = $("#prompt-list");
  list.innerHTML = "";

  const start = (state.page-1)*state.pageSize;
  const pageItems = state.filtered.slice(start, start + state.pageSize);

  for (const p of pageItems){
    const el = document.createElement("div");
    el.className = "prompt";
    el.innerHTML = `
      <div class="prompt__top">
        <div>
          <div class="prompt__title">${escapeHtml(p.title)}</div>
          <div class="muted" style="margin-top:6px;font-size:12px;font-weight:800;">${escapeHtml(p.category)} • ${escapeHtml(p.subcategory)}</div>
        </div>
        <div class="badges">
          <div class="badge badge--ai">${escapeHtml(p.ai)}</div>
          <div class="badge badge--stars">${escapeHtml(p.effectiveness)}</div>
        </div>
      </div>
      <div class="prompt__text">${escapeHtml(truncate(p.text, 210))}</div>
      <div class="prompt__actions">
        <button class="btn btn--primary btn--sm" data-action="use">Usar</button>
        <button class="btn btn--ghost btn--sm" data-action="copy">Copiar</button>
        <button class="btn btn--ghost btn--sm" data-action="details">Ver completo</button>
      </div>
    `;

    el.addEventListener("click", (e)=>{
      const action = e.target?.dataset?.action;
      if (!action) return;
      e.preventDefault();
      e.stopPropagation();

      if (action === "use"){
        state.selected = p;
        $("#prompt-editor").value = p.text;
        toast("Cargado en editor ✍️");
        $("#prompt-editor").focus();
      } else if (action === "copy"){
        copyText(p.text);
      } else if (action === "details"){
        state.selected = p;
        $("#prompt-editor").value = p.text;
        openPalette(p.title);
        // palette will show prompt at top via search
      }
    });

    list.appendChild(el);
  }

  if (pageItems.length === 0){
    const empty = document.createElement("div");
    empty.className = "prompt";
    empty.innerHTML = `<div class="muted">No hay resultados con los filtros actuales.</div>`;
    list.appendChild(empty);
  }
}

function renderPager(){
  const wrap = $("#pager");
  wrap.innerHTML = "";

  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  const cur = state.page;

  const pages = [];
  const add = (x)=>{ if (!pages.includes(x) && x>=1 && x<=totalPages) pages.push(x); };
  add(1); add(totalPages);
  for (let i=cur-2;i<=cur+2;i++) add(i);
  pages.sort((a,b)=>a-b);

  const makeBtn = (label, page, active=false)=>{
    const b = document.createElement("button");
    b.className = "btn btn--ghost btn--sm" + (active ? " is-active" : "");
    b.textContent = label;
    b.addEventListener("click", ()=>{
      state.page = page;
      renderPromptList();
      renderPager();
      $("#results-meta").textContent = `${fmtNum(state.filtered.length)} resultados • Página ${state.page}/${Math.max(1, Math.ceil(state.filtered.length/state.pageSize))}`;
      window.scrollTo({ top: $("#prompts").offsetTop - 72, behavior: "smooth" });
    });
    return b;
  };

  if (totalPages > 1){
    wrap.appendChild(makeBtn("←", Math.max(1, cur-1)));
    for (let i=0;i<pages.length;i++){
      if (i>0 && pages[i]-pages[i-1] > 1){
        const dots = document.createElement("div");
        dots.className = "badge";
        dots.textContent = "…";
        wrap.appendChild(dots);
      }
      wrap.appendChild(makeBtn(String(pages[i]), pages[i], pages[i]===cur));
    }
    wrap.appendChild(makeBtn("→", Math.min(totalPages, cur+1)));
  }
}

function onCategoryChange(){
  const cat = $("#filter-category").value.trim();
  const sub = $("#filter-subcategory");

  sub.innerHTML = '<option value="">Todas</option>';
  if (!cat){
    sub.disabled = true;
    return;
  }
  const subs = Array.from(state.categories.get(cat) || []).sort((a,b)=>a.localeCompare(b,"es"));
  for (const s of subs){
    const opt = document.createElement("option");
    opt.value = s; opt.textContent = s;
    sub.appendChild(opt);
  }
  sub.disabled = false;
}

function truncate(s, n){ return s.length > n ? s.slice(0,n-1) + "…" : s; }
function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* --- Notion-like Command Palette --- */
function openPalette(prefill=""){
  const modal = $("#palette");
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  const input = $("#palette-input");
  input.value = prefill;
  input.focus();
  renderPaletteResults();
}
function closePalette(){
  const modal = $("#palette");
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function paletteQuery(){
  return $("#palette-input").value.trim().toLowerCase();
}
function renderPaletteResults(){
  const q = paletteQuery();
  const results = $("#palette-results");
  results.innerHTML = "";

  // search prompts + quick links to tools/categories
  const toolLinks = [
    {title:"Ir a Prompts", meta:"Sección", href:"#prompts"},
    {title:"Ir a Herramientas", meta:"Sección", href:"#tools"},
    {title:"Simulador de empresa", meta:"Herramienta", href:"#tools", tab:"simulator"},
    {title:"Generador de casos", meta:"Herramienta", href:"#tools", tab:"casegen"},
    {title:"Juego de decisiones", meta:"Herramienta", href:"#tools", tab:"decisiongame"},
    {title:"Laboratorio STEAM", meta:"Herramienta", href:"#tools", tab:"steam"},
  ];

  const linkMatches = toolLinks.filter(x=>{
    if (!q) return true;
    return (x.title + " " + x.meta).toLowerCase().includes(q);
  }).slice(0, 6);

  for (const l of linkMatches){
    const el = document.createElement("div");
    el.className = "presult";
    el.innerHTML = `
      <div class="presult__top">
        <div class="presult__title">🔎 ${escapeHtml(l.title)}</div>
        <div class="presult__meta">${escapeHtml(l.meta)}</div>
      </div>
      <div class="presult__text">Abrir</div>
    `;
    el.addEventListener("click", ()=>{
      closePalette();
      document.location.hash = l.href;
      if (l.tab) activateTab(l.tab);
    });
    results.appendChild(el);
  }

  const promptMatches = state.prompts
    .filter(p=>{
      if (!q) return true;
      const hay = (p.title + " " + p.text + " " + p.category + " " + p.subcategory + " " + (p.tags||[]).join(" ")).toLowerCase();
      return hay.includes(q);
    })
    .slice(0, 18);

  for (const p of promptMatches){
    const el = document.createElement("div");
    el.className = "presult";
    el.innerHTML = `
      <div class="presult__top">
        <div class="presult__title">${escapeHtml(p.title)}</div>
        <div class="presult__meta">${escapeHtml(p.ai)} • ${escapeHtml(p.effectiveness)}</div>
      </div>
      <div class="presult__text">${escapeHtml(truncate(p.text, 160))}</div>
    `;
    el.addEventListener("click", ()=>{
      $("#prompt-editor").value = p.text;
      closePalette();
      toast("Cargado en editor ✍️");
      document.location.hash = "#prompts";
    });
    results.appendChild(el);
  }

  $("#palette-meta").textContent = q ? `Mostrando resultados para “${q}”` : "Escribe para buscar…";
}

/* --- Mini results on hero search --- */
function renderMiniResults(q){
  const wrap = $("#mini-results");
  wrap.innerHTML = "";
  const query = (q||"").trim().toLowerCase();
  if (!query){
    wrap.innerHTML = `<div class="mini-card"><strong>Ejemplos</strong><span class="tag">pricing • CAC • SEO • tesorería</span></div>`;
    return;
  }
  const hits = state.prompts
    .filter(p => (p.title + " " + p.text).toLowerCase().includes(query))
    .slice(0, 3);

  for (const h of hits){
    const el = document.createElement("div");
    el.className = "mini-card";
    el.innerHTML = `<strong>${escapeHtml(truncate(h.title, 44))}</strong><span class="tag">${escapeHtml(h.category)}</span>`;
    el.addEventListener("click", ()=>{
      $("#filter-text").value = query;
      applyFilters(true);
      $("#prompt-editor").value = h.text;
      document.location.hash = "#prompts";
    });
    wrap.appendChild(el);
  }
  if (hits.length === 0){
    wrap.innerHTML = `<div class="mini-card"><strong>0 resultados</strong><span class="tag">Prueba otra palabra</span></div>`;
  }
}

/* --- Tools: Tabs --- */
function activateTab(tabName){
  $$(".tab").forEach(b=>{
    const active = b.dataset.tab === tabName;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-selected", active ? "true" : "false");
  });
  $$(".pane").forEach(p=>{
    p.classList.toggle("is-active", p.id === `pane-${tabName}`);
  });
}

/* --- Business Simulator --- */
function simCompute(inputs){
  const price = Number(inputs.price);
  let customers = Number(inputs.customers);
  const churn = Math.max(0, Number(inputs.churn)/100);
  const cac = Math.max(0, Number(inputs.cac));
  const gm = Math.max(0, Math.min(1, Number(inputs.gm)/100));
  const fixed = Math.max(0, Number(inputs.fixed));
  let cash = Math.max(0, Number(inputs.cash));
  const newCust = Math.max(0, Number(inputs.newCust));

  const months = [];
  const mrr = [];
  const cashArr = [];
  const profitArr = [];
  for (let m=1;m<=12;m++){
    const lost = customers * churn;
    customers = Math.max(0, customers - lost + newCust);

    const rev = customers * price;
    const gross = rev * gm;
    const marketing = newCust * cac;
    const profit = gross - fixed - marketing;

    cash += profit;

    months.push(`M${m}`);
    mrr.push(rev);
    cashArr.push(cash);
    profitArr.push(profit);
  }

  // KPIs snapshot at end
  const endMRR = mrr[mrr.length-1];
  const endARR = endMRR * 12;
  const arpa = price;
  const ltv = churn > 0 ? (arpa * gm) / churn : Infinity; // simple
  const ltvCac = cac>0 ? (ltv / cac) : Infinity;
  const avgProfit = profitArr.reduce((a,b)=>a+b,0) / profitArr.length;
  const runway = avgProfit < 0 ? (cashArr[cashArr.length-1] / Math.abs(avgProfit)) : Infinity;

  return { months, mrr, cashArr, profitArr, endMRR, endARR, ltv, ltvCac, runway, cashEnd: cashArr[cashArr.length-1] };
}

function simRender(){
  const inputs = {
    price: $("#sim-price").value,
    customers: $("#sim-customers").value,
    churn: $("#sim-churn").value,
    cac: $("#sim-cac").value,
    gm: $("#sim-gm").value,
    fixed: $("#sim-fixed").value,
    cash: $("#sim-cash").value,
    newCust: $("#sim-new").value,
  };
  const r = simCompute(inputs);

  const kpis = [
    {label:"MRR (mes 12)", value: fmtEUR(r.endMRR)},
    {label:"ARR (mes 12)", value: fmtEUR(r.endARR)},
    {label:"LTV (aprox.)", value: fmtEUR(r.ltv)},
    {label:"LTV/CAC", value: Number.isFinite(r.ltvCac) ? fmtNum(r.ltvCac, 2) : "∞"},
    {label:"Caja final", value: fmtEUR(r.cashEnd)},
    {label:"Runway (meses)", value: Number.isFinite(r.runway) ? fmtNum(r.runway, 1) : "∞"},
  ];
  const wrap = $("#sim-kpis");
  wrap.innerHTML = kpis.map(k=>`
    <div class="kpi">
      <div class="kpi__label">${escapeHtml(k.label)}</div>
      <div class="kpi__value">${escapeHtml(k.value)}</div>
    </div>
  `).join("");

  const ctx = $("#sim-chart");
  if (state.charts.sim) state.charts.sim.destroy();
  state.charts.sim = new Chart(ctx, {
    type:"line",
    data:{
      labels:r.months,
      datasets:[
        { label:"MRR", data:r.mrr, tension:.35 },
        { label:"Caja", data:r.cashArr, tension:.35 },
        { label:"Beneficio", data:r.profitArr, tension:.35 },
      ],
    },
    options:{
      responsive:true,
      plugins:{ legend:{ position:"bottom" } },
      scales:{
        y:{ ticks:{ callback:(v)=>Number(v).toLocaleString("es-ES") } }
      }
    }
  });
}

/* --- Case Generator (offline) --- */
function generateCase(industry, goal, constraints){
  const c = constraints?.trim();
  const constraintLine = c ? `Restricciones: ${c}.` : "Restricciones: presupuesto prudente, foco en impacto medible.";
  const seed = Math.floor(Math.random()*1000);

  return [
    `CASO (${industry}) — ${goal}`,
    `ID: ${seed}-${Date.now().toString().slice(-6)}`,
    "",
    "Contexto:",
    `- Empresa de ${industry} con crecimiento irregular en los últimos 2 trimestres.`,
    `- Objetivo principal: ${goal}.`,
    `- ${constraintLine}`,
    "",
    "Datos (ficticios, realistas):",
    "- Ingresos mensuales: 120k€",
    "- Margen bruto: 68%",
    "- CAC: 210€ | LTV: 1.250€ | Churn mensual: 3,8%",
    "- Canal principal: paid + email",
    "",
    "Tu reto (90 minutos):",
    "1) Diagnóstico: ¿qué está frenando el objetivo? (hipótesis + evidencias).",
    "2) Plan de acción en 14 días: 5 iniciativas priorizadas (impacto/esfuerzo).",
    "3) Experimentos: 3 tests con métrica de éxito y criterio de parada.",
    "4) Dashboard: KPIs mínimos (definición + periodicidad + owners).",
    "",
    "Entregables esperados:",
    "- 1 página tipo memo ejecutivo",
    "- Backlog priorizado",
    "- Risk log (top 5) y mitigaciones",
  ].join("\n");
}

/* --- Decision Game (simple KPI simulator) --- */
const GAME = {
  saas: {
    name: "SaaS en crecimiento (churn sube)",
    kpis: { MRR: 120, churn: 3.8, NPS: 34, CAC: 210 },
    turns: [
      {
        text: "El churn sube 1 punto y soporte está saturado.",
        choices: [
          { label:"Invertir en soporte + onboarding", delta:{ churn:-0.7, NPS:+8, CAC:+10 }, note:"Mejora activación y reduce fricción." },
          { label:"Subir precio 10% sin cambios", delta:{ MRR:+10, churn:+0.6, NPS:-4 }, note:"Aumenta caja, pero riesgo de churn." },
          { label:"Cortar marketing para ahorrar", delta:{ CAC:-30, MRR:-8, churn:+0.3 }, note:"Menos crecimiento, margen temporal." },
        ]
      },
      {
        text: "El equipo de producto propone 2 features grandes.",
        choices: [
          { label:"Priorizar 1 feature + deuda técnica", delta:{ NPS:+6, churn:-0.2, MRR:+4 }, note:"Entrega foco + estabilidad." },
          { label:"Hacer las 2 features a la vez", delta:{ NPS:+2, churn:+0.3 }, note:"Riesgo de retrasos y bugs." },
          { label:"No features: optimizar performance", delta:{ NPS:+5, churn:-0.4 }, note:"Menos brillo, más fiabilidad." },
        ]
      },
      {
        text: "Finanzas pide mejorar LTV/CAC.",
        choices: [
          { label:"Optimizar funnel (A/B + CRO)", delta:{ CAC:-25, MRR:+6 }, note:"Mejora eficiencia de adquisición." },
          { label:"Crear plan anual con descuento", delta:{ MRR:+8, churn:-0.3, NPS:+1 }, note:"Mejora retención y caja." },
          { label:"Expandir a nuevo mercado ya", delta:{ MRR:+12, CAC:+35, churn:+0.2 }, note:"Potencial alto, ejecución compleja." },
        ]
      }
    ]
  },
  ecom: {
    name: "e-commerce (ROAS cae)",
    kpis: { Ventas: 180, ROAS: 2.4, margen: 42, NPS: 28 },
    turns: [
      { text:"Sube el CPM y cae el ROAS en paid social.",
        choices:[
          { label:"Reequilibrar a search + remarketing", delta:{ ROAS:+0.3, Ventas:+8 }, note:"Canales más intent-driven." },
          { label:"Subir descuento agresivo", delta:{ Ventas:+12, margen:-6, NPS:+2 }, note:"Impulsa volumen pero erosiona margen." },
          { label:"Pausar campañas y optimizar creatividades", delta:{ ROAS:+0.2, Ventas:-10 }, note:"Caída temporal para mejorar eficiencia." },
        ]
      },
      { text:"Stock de top-seller en riesgo por proveedor.",
        choices:[
          { label:"Asegurar stock (coste extra)", delta:{ Ventas:+10, margen:-3 }, note:"Evita rotura de stock." },
          { label:"Empujar sustitutos con bundles", delta:{ Ventas:+6, margen:+1 }, note:"Mitiga sin sobrecoste." },
          { label:"Aceptar rotura y comunicar", delta:{ NPS:-5, Ventas:-12 }, note:"Impacto reputacional." },
        ]
      },
      { text:"Crecen devoluciones por talla/expectativas.",
        choices:[
          { label:"Mejorar fichas + guía tallas + fotos", delta:{ NPS:+6, margen:+2, Ventas:+4 }, note:"Reduce devoluciones." },
          { label:"Devoluciones gratis sin cambios", delta:{ NPS:+4, margen:-4 }, note:"Satisfacción sube, coste también." },
          { label:"Endurecer política devoluciones", delta:{ margen:+2, NPS:-6 }, note:"Ahorro, pero daña marca." },
        ]
      }
    ]
  },
  ops: {
    name: "Operaciones (SLA en riesgo)",
    kpis: { SLA: 92, coste: 100, calidad: 88, backlog: 120 },
    turns: [
      { text:"Backlog sube y SLA baja por picos de demanda.",
        choices:[
          { label:"Triage + priorización + WIP limits", delta:{ SLA:+3, backlog:-18, calidad:+1 }, note:"Control de flujo." },
          { label:"Horas extra 2 semanas", delta:{ SLA:+2, coste:+8, calidad:-2 }, note:"Rápido, pero insostenible." },
          { label:"Automatizar respuestas frecuentes", delta:{ backlog:-12, coste:+3, calidad:+2 }, note:"Inversión con retorno." },
        ]
      },
      { text:"Cliente enterprise pide custom urgente.",
        choices:[
          { label:"Aceptar con change request", delta:{ coste:+6, calidad:-1, SLA:-1 }, note:"Protege alcance." },
          { label:"Aceptar gratis", delta:{ backlog:+15, SLA:-3, calidad:-2 }, note:"Riesgo alto de deuda." },
          { label:"Negociar faseado", delta:{ SLA:+1, calidad:+2 }, note:"Reduce impacto." },
        ]
      },
      { text:"Aparecen incidencias repetidas (root cause).",
        choices:[
          { label:"RCA + prevención (5 why)", delta:{ calidad:+6, backlog:-10, coste:+2 }, note:"Ataca la causa." },
          { label:"Parche rápido", delta:{ SLA:+1, calidad:-2 }, note:"Deuda técnica crece." },
          { label:"Auditoría y checklist QA", delta:{ calidad:+4, coste:+1 }, note:"Mejora control." },
        ]
      }
    ]
  }
};

let gameState = null;
function gameStart(scenarioKey){
  const s = GAME[scenarioKey];
  gameState = {
    key: scenarioKey,
    turn: 0,
    kpis: { ...s.kpis },
    log: [],
  };
  renderGame();
}

function applyDelta(kpis, delta){
  for (const [k, v] of Object.entries(delta)){
    if (kpis[k] === undefined) continue;
    kpis[k] = Math.round((kpis[k] + v) * 10) / 10;
  }
}
function renderGame(){
  const s = GAME[gameState.key];
  const turnObj = s.turns[gameState.turn];

  const kpiWrap = $("#game-kpis");
  kpiWrap.innerHTML = Object.entries(gameState.kpis).map(([k,v])=>`
    <div class="kpi">
      <div class="kpi__label">${escapeHtml(k)}</div>
      <div class="kpi__value">${escapeHtml(String(v))}</div>
    </div>
  `).join("");

  const area = $("#game-area");
  if (!turnObj){
    area.innerHTML = `
      <div class="prompt">
        <div class="prompt__title">Fin del trimestre</div>
        <div class="prompt__text">Tu resultado final refleja trade-offs reales. Repite para explorar otra estrategia.</div>
      </div>
    `;
    return;
  }

  area.innerHTML = `
    <div class="prompt">
      <div class="prompt__title">Turno ${gameState.turn+1}/3</div>
      <div class="prompt__text">${escapeHtml(turnObj.text)}</div>
      <div class="prompt__actions" id="game-choices"></div>
    </div>
  `;
  const choicesWrap = $("#game-choices");
  turnObj.choices.forEach((c, idx)=>{
    const b = document.createElement("button");
    b.className = "btn btn--primary btn--sm";
    b.textContent = c.label;
    b.addEventListener("click", ()=>{
      applyDelta(gameState.kpis, c.delta);
      gameState.log.unshift(`• ${c.label} → ${c.note}`);
      $("#game-log").innerHTML = gameState.log.slice(0,10).map(x=>`<div class="log__item">${escapeHtml(x)}</div>`).join("");
      gameState.turn += 1;
      renderGame();
    });
    if (idx>0) b.className = "btn btn--ghost btn--sm";
    choicesWrap.appendChild(b);
  });

  $("#game-log").innerHTML = gameState.log.slice(0,10).map(x=>`<div class="log__item">${escapeHtml(x)}</div>`).join("") || `<div class="muted">Sin decisiones todavía.</div>`;
}

/* --- STEAM Robot Grid --- */
const bot = {
  x: 0, y: 0, dir: 0, // 0=N,1=E,2=S,3=W
  grid: 7,
};
function botReset(){
  bot.x = 3; bot.y = 5; bot.dir = 0;
  drawBot();
}
function drawBot(){
  const c = $("#bot-canvas");
  const ctx = c.getContext("2d");
  const n = bot.grid;
  const cell = c.width / n;

  ctx.clearRect(0,0,c.width,c.height);

  // grid
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(20,20,20,.10)";
  for (let i=0;i<=n;i++){
    ctx.beginPath(); ctx.moveTo(i*cell,0); ctx.lineTo(i*cell,c.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*cell); ctx.lineTo(c.width,i*cell); ctx.stroke();
  }

  // goal (top)
  ctx.fillStyle = "rgba(184,156,255,.28)";
  ctx.fillRect(3*cell, 1*cell, cell, cell);

  // robot
  const cx = (bot.x+0.5)*cell;
  const cy = (bot.y+0.5)*cell;
  ctx.fillStyle = "rgba(230,194,0,.65)";
  ctx.beginPath();
  ctx.arc(cx, cy, cell*0.28, 0, Math.PI*2);
  ctx.fill();

  // direction pointer
  ctx.strokeStyle = "rgba(20,20,20,.65)";
  ctx.lineWidth = 3;
  const ang = [-Math.PI/2, 0, Math.PI/2, Math.PI][bot.dir];
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(ang)*cell*0.30, cy + Math.sin(ang)*cell*0.30);
  ctx.stroke();

  // label
  ctx.fillStyle = "rgba(20,20,20,.8)";
  ctx.font = "14px Inter, system-ui";
  ctx.fillText("Objetivo", 3*cell + 8, 1*cell + 20);
}

function botStep(cmd){
  if (cmd==="L"){ bot.dir = (bot.dir+3)%4; return; }
  if (cmd==="R"){ bot.dir = (bot.dir+1)%4; return; }
  if (cmd!=="F") return;

  const dx = [0,1,0,-1][bot.dir];
  const dy = [-1,0,1,0][bot.dir];
  const nx = bot.x + dx;
  const ny = bot.y + dy;
  if (nx<0 || nx>=bot.grid || ny<0 || ny>=bot.grid) return;
  bot.x = nx; bot.y = ny;
}

async function botRun(program){
  const cmds = program.split(/[\s,]+/).map(x=>x.trim().toUpperCase()).filter(Boolean);
  for (const cmd of cmds){
    botStep(cmd);
    drawBot();
    await sleep(160);
  }
  if (bot.x===3 && bot.y===1){
    toast("¡Objetivo conseguido! 🎯");
  }else{
    toast("Programa ejecutado");
  }
}
function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

/* --- Ohm calculator --- */
function ohmCalc(){
  const v = Number($("#ohm-v").value);
  const r = Number($("#ohm-r").value);
  const iField = $("#ohm-i");
  const i = Number(iField.value);
  let out = "";
  if (Number.isFinite(v) && Number.isFinite(r) && r>0 && !Number.isFinite(i)){
    const cur = v / r;
    out = `I = V/R = ${fmtNum(cur, 4)} A`;
    iField.value = fmtNum(cur, 4);
  } else if (Number.isFinite(v) && Number.isFinite(i) && i>0 && !Number.isFinite(r)){
    const res = v / i;
    out = `R = V/I = ${fmtNum(res, 1)} Ω`;
    $("#ohm-r").value = fmtNum(res, 1);
  } else if (Number.isFinite(r) && Number.isFinite(i) && i>0 && !Number.isFinite(v)){
    const volt = r * i;
    out = `V = R·I = ${fmtNum(volt, 2)} V`;
    $("#ohm-v").value = fmtNum(volt, 2);
  } else if (Number.isFinite(v) && Number.isFinite(r) && r>0){
    const cur = v / r;
    out = `I = ${fmtNum(cur, 4)} A`;
    iField.value = fmtNum(cur, 4);
  } else {
    out = "Completa 2 variables para calcular la tercera.";
  }
  $("#ohm-out").textContent = out;
}

/* --- STEAM project generator --- */
function steamProject(level){
  const base = {
    "Inicial": [
      "Robot evita obstáculos con sensor ultrasónico",
      "Semáforo inteligente con LEDs + temporizador",
      "Coche controlado por Bluetooth (móvil)"
    ],
    "Intermedio":[
      "Seguidor de línea con PID simplificado",
      "Brazo robótico 2DOF con servo + calibración",
      "Estación meteo IoT (temperatura/humedad) con dashboard"
    ],
    "Avanzado":[
      "Robot autónomo con SLAM simplificado (simulación)",
      "Clasificador de objetos con cámara (TinyML)",
      "Sistema de riego inteligente con predicción de demanda"
    ]
  };
  const pick = base[level][Math.floor(Math.random()*base[level].length)];
  const mat = level==="Inicial" ? "Arduino UNO, 1 sensor, protoboard, cables" :
              level==="Intermedio" ? "Arduino/ESP32, 2-3 sensores, servos/motores, chasis" :
              "ESP32/raspberry pi (opcional), sensores múltiples, cámara (opcional), batería";
  return [
    `PROYECTO STEAM — ${level}`,
    `Título: ${pick}`,
    "",
    "Objetivo:",
    "- Construir un prototipo funcional y documentarlo (vídeo + diagrama + código).",
    "",
    "Materiales:",
    `- ${mat}`,
    "",
    "Actividades (4 sesiones):",
    "1) Diseño: problema, restricciones, boceto y lista de materiales.",
    "2) Montaje: cableado, pruebas unitarias, checklist de seguridad.",
    "3) Programación: control, lectura sensores, calibración y debug.",
    "4) Mejora: optimización, presentación y retroalimentación.",
    "",
    "Criterios de evaluación:",
    "- Funcionamiento (40%), documentación (30%), creatividad (20%), seguridad (10%).",
    "",
    "Extensiones:",
    "- Añadir telemetría, registro de datos, y una mejora de eficiencia energética."
  ].join("\n");
}

/* --- Export prompts --- */
function downloadJson(){
  const blob = new Blob([JSON.stringify({count: state.prompts.length, prompts: state.prompts}, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "juanpeco-prompts.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* --- Init --- */
async function init(){
  $("#year").textContent = new Date().getFullYear();

  const res = await fetch("data/prompts.json", { cache:"no-store" });
  const data = await res.json();
  state.prompts = data.prompts || [];
  $("#stat-prompts").textContent = fmtNum(state.prompts.length);

  buildCategoryIndex();
  populateFilters();
  renderCategoryCards();

  // initial filtered
  state.filtered = state.prompts.slice();
  applyFilters(true);

  // hero quick search
  $("#quick-search").addEventListener("input", (e)=>renderMiniResults(e.target.value));
  $("#quick-search-btn").addEventListener("click", ()=>renderMiniResults($("#quick-search").value));
  renderMiniResults("");

  // filters
  $("#filter-category").addEventListener("change", ()=>{
    onCategoryChange();
    applyFilters(true);
  });
  $("#filter-subcategory").addEventListener("change", ()=>applyFilters(true));
  $("#filter-ai").addEventListener("change", ()=>applyFilters(true));
  $("#filter-stars").addEventListener("change", ()=>applyFilters(true));
  $("#filter-text").addEventListener("input", ()=>applyFilters(true));
  $("#reset-filters").addEventListener("click", ()=>{
    $("#filter-category").value = "";
    $("#filter-subcategory").innerHTML = '<option value="">Todas</option>';
    $("#filter-subcategory").disabled = true;
    $("#filter-ai").value = "";
    $("#filter-stars").value = "";
    $("#filter-text").value = "";
    applyFilters(true);
  });
  $("#random-prompt").addEventListener("click", ()=>{
    const p = state.filtered[Math.floor(Math.random()*Math.max(1,state.filtered.length))] || state.prompts[0];
    $("#prompt-editor").value = p.text;
    toast("Random listo 🎲");
    $("#prompt-editor").focus();
  });

  // editor actions
  $("#copy-editor").addEventListener("click", ()=>copyText($("#prompt-editor").value));
  $("#clear-editor").addEventListener("click", ()=>{ $("#prompt-editor").value=""; toast("Limpio"); });

  // palette open/close
  $("#open-search").addEventListener("click", ()=>openPalette());
  $("#palette").addEventListener("click", (e)=>{
    if (e.target?.dataset?.close) closePalette();
  });
  document.addEventListener("keydown", (e)=>{
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const mod = isMac ? e.metaKey : e.ctrlKey;
    if (mod && e.key.toLowerCase()==="k"){
      e.preventDefault();
      openPalette();
    }
    if (e.key==="Escape"){
      closePalette();
    }
  });
  $("#palette-input").addEventListener("input", renderPaletteResults);

  // export
  $("#download-prompts").addEventListener("click", downloadJson);

  // tabs
  $$(".tab").forEach(b=>b.addEventListener("click", ()=>activateTab(b.dataset.tab)));

  // simulator
  $("#sim-run").addEventListener("click", simRender);
  $("#sim-reset").addEventListener("click", ()=>{
    $("#sim-price").value = 49;
    $("#sim-customers").value = 200;
    $("#sim-churn").value = 3;
    $("#sim-cac").value = 180;
    $("#sim-gm").value = 75;
    $("#sim-fixed").value = 12000;
    $("#sim-cash").value = 80000;
    $("#sim-new").value = 25;
    simRender();
  });
  // run once (after Chart.js loads)
  window.setTimeout(simRender, 350);

  // case generator
  $("#case-generate").addEventListener("click", ()=>{
    const out = generateCase($("#case-industry").value, $("#case-goal").value, $("#case-constraints").value);
    $("#case-output").value = out;
    toast("Caso generado ✅");
  });
  $("#case-copy").addEventListener("click", ()=>copyText($("#case-output").value || ""));

  // game
  $("#game-scenario").addEventListener("change", ()=>gameStart($("#game-scenario").value));
  $("#game-restart").addEventListener("click", ()=>gameStart($("#game-scenario").value));
  gameStart($("#game-scenario").value);

  // steam
  botReset();
  $("#bot-run").addEventListener("click", ()=>botRun($("#bot-program").value));
  $("#bot-reset").addEventListener("click", botReset);
  $$("#pane-steam [data-cmd]").forEach(b=>{
    b.addEventListener("click", ()=>{
      const i = $("#bot-program");
      i.value = (i.value.trim() + " " + b.dataset.cmd).trim();
      i.focus();
    });
  });

  $("#ohm-calc").addEventListener("click", ohmCalc);

  $("#steam-generate").addEventListener("click", ()=>{
    $("#steam-output").value = steamProject($("#steam-level").value);
    toast("Proyecto generado ✅");
  });
  $("#steam-copy").addEventListener("click", ()=>copyText($("#steam-output").value||""));

}
init().catch(err=>{
  console.error(err);
  alert("Error cargando la web. Revisa la consola.");
});
