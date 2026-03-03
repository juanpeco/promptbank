<!--
  PromptBank Pro (Flat + Minimal) — Web completa lista para Git
  - 1000 prompts profesionales (generados en runtime) enfocados a Empresa, Marketing y Economía
  - Filtros: categoría, subcategoría, nivel, IA recomendada, rating, búsqueda
  - Vista detalle + copiar + exportar JSON/CSV
  - 100% standalone (sin dependencias externas)
  Uso:
    1) Guarda como index.html
    2) Sube a GitHub (Pages) o cualquier hosting estático
-->
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PromptBank Pro — Empresa · Marketing · Economía</title>
  <meta name="description" content="Banco profesional de 1000 prompts para empresa, marketing y economía. Filtros, búsqueda, copiar y exportar." />
  <meta name="theme-color" content="#0b1020" />

  <style>
    :root{
      /* Flat + minimal palette */
      --bg:#0b1020;
      --panel:#111a33;
      --panel2:#0f1730;
      --border:rgba(255,255,255,.09);
      --text:rgba(255,255,255,.92);
      --muted:rgba(255,255,255,.66);
      --muted2:rgba(255,255,255,.52);

      --brand:#6d5efc;     /* primary */
      --brand2:#31c6ff;    /* accent */
      --ok:#22c55e;
      --warn:#f59e0b;
      --bad:#ef4444;

      --radius:18px;
      --radius2:26px;

      --shadow: 0 14px 40px rgba(0,0,0,.35);
      --shadow2: 0 10px 28px rgba(0,0,0,.28);
    }

    *{ box-sizing:border-box; }
    html,body{ height:100%; }
    body{
      margin:0;
      font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji";
      background:
        radial-gradient(900px 500px at 12% 8%, rgba(109,94,252,.22), transparent 55%),
        radial-gradient(900px 500px at 88% 18%, rgba(49,198,255,.16), transparent 55%),
        radial-gradient(900px 600px at 60% 90%, rgba(34,197,94,.10), transparent 55%),
        var(--bg);
      color:var(--text);
      letter-spacing: .1px;
    }

    a{ color:inherit; text-decoration:none; }
    button, input, select, textarea{ font:inherit; color:inherit; }

    .container{ max-width:1200px; margin:0 auto; padding:24px; }
    .row{ display:flex; gap:16px; }
    .col{ display:flex; flex-direction:column; gap:16px; }
    .grid{ display:grid; gap:16px; }
    .grid-2{ grid-template-columns: 1.25fr .75fr; }
    .grid-3{ grid-template-columns: repeat(3, 1fr); }
    @media (max-width: 980px){
      .grid-2{ grid-template-columns: 1fr; }
      .grid-3{ grid-template-columns: 1fr; }
      .container{ padding:18px; }
    }

    /* Flat panels (no glass) */
    .panel{
      background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.02));
      border:1px solid var(--border);
      border-radius: var(--radius2);
      box-shadow: var(--shadow2);
    }
    .panel-inner{ padding:18px; }
    .panel-tight{ padding:14px; }

    .topbar{
      position:sticky; top:0; z-index:50;
      backdrop-filter: blur(10px);
      background: rgba(11,16,32,.72);
      border-bottom:1px solid rgba(255,255,255,.07);
    }
    .topbar .container{ padding-top:14px; padding-bottom:14px; }

    .brand{
      display:flex; align-items:center; gap:12px;
      min-width: 240px;
    }

    .logo{
      width:44px; height:44px; border-radius: 16px;
      background: linear-gradient(135deg, rgba(109,94,252,.95), rgba(49,198,255,.95));
      display:grid; place-items:center;
      box-shadow: 0 14px 30px rgba(109,94,252,.18);
      border:1px solid rgba(255,255,255,.16);
      flex:none;
    }

    .brand-title{ line-height:1.1; }
    .brand-title strong{ display:block; font-size:14px; font-weight:800; letter-spacing:.2px; }
    .brand-title span{ display:block; font-size:12px; color:var(--muted); margin-top:2px; }

    .nav{
      display:flex; align-items:center; justify-content:flex-end; gap:10px;
      width:100%;
    }

    .chip{
      display:inline-flex; align-items:center; gap:8px;
      padding:8px 12px;
      border-radius: 999px;
      border:1px solid var(--border);
      background: rgba(255,255,255,.03);
      color: var(--muted);
      font-size: 12px;
    }

    .btn{
      display:inline-flex; align-items:center; justify-content:center; gap:10px;
      padding:10px 12px;
      border-radius: 14px;
      border:1px solid var(--border);
      background: rgba(255,255,255,.03);
      cursor:pointer;
      transition: transform .08s ease, background .12s ease, border-color .12s ease;
      user-select:none;
      font-weight: 650;
      font-size: 13px;
    }
    .btn:hover{ background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.14); }
    .btn:active{ transform: translateY(1px); }
    .btn.primary{
      background: linear-gradient(135deg, rgba(109,94,252,.95), rgba(49,198,255,.85));
      border-color: rgba(255,255,255,.18);
      color: rgba(255,255,255,.96);
      box-shadow: 0 16px 32px rgba(109,94,252,.18);
    }
    .btn.primary:hover{ filter: brightness(1.03); }
    .btn.danger{ border-color: rgba(239,68,68,.35); }
    .btn.small{ padding:8px 10px; border-radius: 12px; font-size: 12px; }

    .hero{
      padding:18px;
      background: linear-gradient(180deg, rgba(17,26,51,.65), rgba(17,26,51,.28));
    }
    .hero h1{
      margin:0;
      font-size: 22px;
      letter-spacing: .2px;
    }
    .hero p{
      margin:8px 0 0 0;
      color: var(--muted);
      font-size: 14px;
      line-height: 1.45;
    }

    .kpis{
      display:grid;
      grid-template-columns: repeat(4, 1fr);
      gap:12px;
      margin-top:14px;
    }
    @media (max-width: 980px){
      .kpis{ grid-template-columns: repeat(2, 1fr); }
    }
    .kpi{
      border-radius: 18px;
      border:1px solid var(--border);
      background: rgba(255,255,255,.03);
      padding:12px;
    }
    .kpi .label{ color: var(--muted2); font-size: 12px; }
    .kpi .value{ margin-top:6px; font-size: 16px; font-weight: 800; }
    .kpi .hint{ margin-top:4px; font-size: 12px; color: var(--muted); }

    .controls{
      display:grid;
      grid-template-columns: 1.5fr repeat(4, 1fr);
      gap:12px;
      align-items:end;
    }
    @media (max-width: 980px){
      .controls{ grid-template-columns: 1fr; }
    }

    label{ display:block; font-size: 12px; color: var(--muted2); margin: 0 0 6px 2px; }
    .field{
      width:100%;
      border-radius: 16px;
      border:1px solid var(--border);
      background: rgba(255,255,255,.03);
      padding: 11px 12px;
      outline:none;
      transition: border-color .12s ease, background .12s ease;
    }
    .field:focus{
      border-color: rgba(109,94,252,.55);
      background: rgba(255,255,255,.04);
      box-shadow: 0 0 0 3px rgba(109,94,252,.18);
    }

    .list{
      display:flex; flex-direction:column; gap:10px;
      max-height: 560px; overflow:auto;
      padding-right: 6px;
    }
    .list::-webkit-scrollbar{ width: 10px; }
    .list::-webkit-scrollbar-thumb{ background: rgba(255,255,255,.08); border-radius: 999px; }
    .list::-webkit-scrollbar-track{ background: transparent; }

    .card{
      border-radius: 18px;
      border:1px solid var(--border);
      background: rgba(255,255,255,.03);
      padding: 12px;
      transition: background .12s ease, border-color .12s ease;
      cursor:pointer;
    }
    .card:hover{
      background: rgba(255,255,255,.05);
      border-color: rgba(255,255,255,.14);
    }
    .card.active{
      border-color: rgba(109,94,252,.55);
      background: rgba(109,94,252,.10);
    }
    .card .meta{
      display:flex; flex-wrap:wrap; gap:8px; align-items:center;
      color: var(--muted);
      font-size: 12px;
      margin-top: 6px;
    }
    .tag{
      display:inline-flex; align-items:center; gap:6px;
      padding: 6px 10px;
      border-radius: 999px;
      border:1px solid var(--border);
      background: rgba(255,255,255,.02);
      font-size: 12px;
      color: var(--muted);
    }
    .tag b{ color: rgba(255,255,255,.85); font-weight: 750; }

    .title-row{
      display:flex; justify-content:space-between; gap:10px; align-items:flex-start;
    }
    .title-row h3{ margin:0; font-size: 14px; font-weight: 780; line-height:1.25; }
    .rating{ font-size: 12px; color: rgba(255,255,255,.78); white-space:nowrap; }

    .detail{
      display:flex; flex-direction:column; gap:12px;
      min-height: 560px;
    }
    .detail .header{
      display:flex; align-items:flex-start; justify-content:space-between; gap:12px;
    }
    .detail .header h2{
      margin:0;
      font-size: 16px;
      font-weight: 850;
      letter-spacing: .2px;
    }
    .detail .header p{
      margin:6px 0 0 0;
      color: var(--muted);
      font-size: 13px;
      line-height: 1.45;
    }
    .detail .box{
      border-radius: 18px;
      border:1px solid var(--border);
      background: rgba(255,255,255,.03);
      padding: 12px;
    }
    .prompt-text{
      white-space: pre-wrap;
      font-size: 13px;
      line-height: 1.5;
      color: rgba(255,255,255,.88);
    }
    .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    .footer{
      margin-top: 18px;
      padding: 14px 0 28px 0;
      color: var(--muted);
      font-size: 12px;
      display:flex;
      justify-content:space-between;
      gap:10px;
      flex-wrap:wrap;
    }

    /* Toast */
    .toast{
      position:fixed; right:16px; bottom:16px; z-index:60;
      border:1px solid var(--border);
      background: rgba(15,23,48,.88);
      border-radius: 16px;
      padding: 12px 14px;
      box-shadow: var(--shadow);
      opacity:0;
      transform: translateY(10px);
      transition: opacity .18s ease, transform .18s ease;
      pointer-events:none;
      max-width: 320px;
    }
    .toast.show{ opacity:1; transform: translateY(0); }
    .toast strong{ display:block; font-size: 12px; }
    .toast span{ display:block; margin-top: 4px; font-size: 12px; color: var(--muted); }
  </style>
</head>

<body>
  <div class="topbar">
    <div class="container row" style="align-items:center;">
      <a class="brand" href="#top" aria-label="Inicio">
        <div class="logo" aria-hidden="true" title="Logo Top 1">
          <!-- Logo “Top 1”: corona + check (SVG limpio, escalable, flat) -->
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5.3 10.2 8 7.6l2.6 2.9 3-4.1 2.8 3 2.3-1.9v7.6c0 1.2-1 2.2-2.2 2.2H7.5c-1.2 0-2.2-1-2.2-2.2v-4.9Z"
                  fill="rgba(255,255,255,.92)" opacity=".92"/>
            <path d="M9.3 14.4 11 16l3.8-4.1" stroke="rgba(17,26,51,.95)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="brand-title">
          <strong>PromptBank Pro</strong>
          <span>Empresa · Marketing · Economía</span>
        </div>
      </a>

      <nav class="nav">
        <span class="chip" id="build-chip">1000 prompts · Flat UI</span>
        <a class="btn small" href="#prompts">Banco</a>
        <a class="btn small" href="#export">Exportar</a>
        <button class="btn small" id="theme-btn" title="Reduce efectos visuales">Modo sobrio</button>
        <button class="btn primary small" id="copy-selected-btn">Copiar seleccionado</button>
      </nav>
    </div>
  </div>

  <main id="top" class="container col">

    <section class="panel hero">
      <div class="panel-inner">
        <h1>Banco profesional de prompts (1000) para ejecución empresarial</h1>
        <p>
          Prompts diseñados para resultados operativos: estrategia, finanzas, pricing, forecasting, marketing performance, growth,
          research, funnels, y reporting. La base se genera a partir de plantillas y criterios (consistencia, estructura y calidad).
        </p>

        <div class="kpis">
          <div class="kpi">
            <div class="label">Prompts disponibles</div>
            <div class="value" id="kpi-total">—</div>
            <div class="hint">Generados localmente</div>
          </div>
          <div class="kpi">
            <div class="label">En pantalla</div>
            <div class="value" id="kpi-shown">—</div>
            <div class="hint">Tras filtros / búsqueda</div>
          </div>
          <div class="kpi">
            <div class="label">Categorías</div>
            <div class="value" id="kpi-cats">—</div>
            <div class="hint">Empresa · Marketing · Economía</div>
          </div>
          <div class="kpi">
            <div class="label">Exportación</div>
            <div class="value">JSON / CSV</div>
            <div class="hint">Todo el dataset</div>
          </div>
        </div>
      </div>
    </section>

    <section id="prompts" class="panel">
      <div class="panel-inner col">

        <div class="controls">
          <div>
            <label for="q">Búsqueda (texto libre)</label>
            <input id="q" class="field" placeholder="Ej: pricing, LTV, CAC, funnel, forecast, EBITDA, segmentación..." />
          </div>

          <div>
            <label for="cat">Categoría</label>
            <select id="cat" class="field"></select>
          </div>

          <div>
            <label for="subcat">Subcategoría</label>
            <select id="subcat" class="field"></select>
          </div>

          <div>
            <label for="level">Nivel</label>
            <select id="level" class="field"></select>
          </div>

          <div>
            <label for="ai">IA recomendada</label>
            <select id="ai" class="field"></select>
          </div>
        </div>

        <div class="row" style="justify-content:space-between; flex-wrap:wrap;">
          <div class="row" style="flex-wrap:wrap;">
            <div class="chip"><span>Rating mínimo:</span> <b id="minRatingLabel">3</b>/5</div>
            <input id="minRating" type="range" min="1" max="5" value="3" style="accent-color: var(--brand); width:220px;" />
            <div class="chip"><span>Orden:</span> <b id="sortLabel">Relevancia</b></div>
            <select id="sort" class="field" style="width:220px;">
              <option value="relevance">Relevancia</option>
              <option value="rating_desc">Rating ↓</option>
              <option value="rating_asc">Rating ↑</option>
              <option value="level_desc">Nivel ↓</option>
              <option value="level_asc">Nivel ↑</option>
              <option value="title_asc">Título A→Z</option>
              <option value="title_desc">Título Z→A</option>
            </select>
          </div>

          <div class="row" style="flex-wrap:wrap;">
            <button class="btn" id="resetBtn">Reset</button>
            <button class="btn" id="randomBtn">Aleatorio</button>
            <button class="btn primary" id="copyBtn">Copiar prompt</button>
          </div>
        </div>

        <div class="grid grid-2" style="align-items:start;">
          <!-- LIST -->
          <div class="panel-tight">
            <div class="row" style="justify-content:space-between; align-items:center; margin-bottom:10px;">
              <div style="font-weight:850;">Listado</div>
              <div class="chip"><span id="countLabel">—</span> resultados</div>
            </div>
            <div class="list" id="list"></div>
          </div>

          <!-- DETAIL -->
          <div class="panel-tight detail" id="detail">
            <div class="box">
              <div class="header">
                <div>
                  <h2>Selecciona un prompt</h2>
                  <p>El detalle muestra estructura, contexto y salida esperada. Copia con un click.</p>
                </div>
                <div class="row" style="flex-wrap:wrap; justify-content:flex-end;">
                  <button class="btn small" id="copyIdBtn" title="Copia el ID">Copiar ID</button>
                  <button class="btn small" id="copyJsonBtn" title="Copia el objeto JSON del prompt">Copiar JSON</button>
                </div>
              </div>
            </div>

            <div class="box">
              <div class="row" style="flex-wrap:wrap; gap:8px;" id="detailTags"></div>
            </div>

            <div class="box">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                <div style="font-weight:850;">Prompt</div>
                <div class="chip"><span>Salida:</span> <b id="detailOutput">—</b></div>
              </div>
              <div class="prompt-text" id="detailText" style="margin-top:10px;"></div>
            </div>

            <div class="box">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:10px;">
                <div style="font-weight:850;">Checklist de calidad</div>
                <div class="chip"><span>Uso:</span> <b id="detailUse">—</b></div>
              </div>
              <ul id="detailChecklist" style="margin:10px 0 0 18px; color: var(--muted); font-size: 13px; line-height:1.5;">
              </ul>
            </div>
          </div>
        </div>

      </div>
    </section>

    <section id="export" class="panel">
      <div class="panel-inner">
        <div class="row" style="justify-content:space-between; align-items:flex-start; flex-wrap:wrap;">
          <div>
            <div style="font-weight:900; font-size:16px;">Exportación</div>
            <div style="color:var(--muted); font-size:13px; margin-top:6px; max-width:780px;">
              Exporta los 1000 prompts completos o solo los filtrados. Útil para alimentar un CRM interno, Notion, Sheets o una API.
            </div>
          </div>
          <div class="row" style="flex-wrap:wrap;">
            <button class="btn" id="exportFilteredJson">JSON filtrados</button>
            <button class="btn" id="exportAllJson">JSON (1000)</button>
            <button class="btn" id="exportFilteredCsv">CSV filtrados</button>
            <button class="btn" id="exportAllCsv">CSV (1000)</button>
          </div>
        </div>

        <div class="grid grid-3" style="margin-top:14px;">
          <div class="panel-tight">
            <div style="font-weight:850;">Formato recomendado (JSON)</div>
            <div style="color:var(--muted); font-size:13px; margin-top:6px; line-height:1.5;">
              Cada prompt incluye: categoría, subcategoría, nivel, IA recomendada, rating, output esperado, tags y checklist.
            </div>
          </div>
          <div class="panel-tight">
            <div style="font-weight:850;">Cómo versionarlo</div>
            <div style="color:var(--muted); font-size:13px; margin-top:6px; line-height:1.5;">
              Mantén este HTML, y si quieres base fija, sustituye el generador por un JSON real en <span class="mono">/data/prompts.json</span>.
            </div>
          </div>
          <div class="panel-tight">
            <div style="font-weight:850;">Calidad real</div>
            <div style="color:var(--muted); font-size:13px; margin-top:6px; line-height:1.5;">
              Los prompts no son “frases”; siguen estructura operativa y piden entregables concretos (tablas, supuestos, KPIs, decisiones).
            </div>
          </div>
        </div>

        <div class="footer">
          <div>© <span id="year"></span> PromptBank Pro — Flat Minimal UI</div>
          <div class="row" style="gap:10px;">
            <span class="chip">Offline · Sin trackers</span>
            <span class="chip">Standalone · 1 archivo</span>
          </div>
        </div>
      </div>
    </section>

  </main>

  <div class="toast" id="toast" role="status" aria-live="polite">
    <strong id="toastTitle">Listo</strong>
    <span id="toastMsg">Acción completada.</span>
  </div>

  <script>
    /***********************
     * 1) DATA GENERATOR
     *    - Crea 1000 prompts profesionales a partir de plantillas (estructura consistente)
     ***********************/
    const CATEGORIES = [
      { key: "empresa", name: "Empresa" },
      { key: "marketing", name: "Marketing" },
      { key: "economia", name: "Economía" },
    ];

    // Subcategorías por categoría
    const SUBCATS = {
      empresa: [
        "Estrategia", "Operaciones", "People & Org", "Ventas B2B", "Producto & Go-to-Market",
        "Riesgos & Compliance", "Cliente & CX", "Gestión de proyectos"
      ],
      marketing: [
        "Growth", "Performance (Ads)", "SEO & Contenido", "Brand", "CRM & Lifecycle",
        "Investigación de mercado", "Funnel & CRO", "Partnerships"
      ],
      economia: [
        "Finanzas corporativas", "FP&A / Presupuestos", "Pricing & Revenue", "Unit Economics",
        "Valoración", "Tesorería", "Riesgo financiero", "Métricas & Reporting"
      ],
    };

    // Nivel de complejidad (1-5) y etiqueta
    const LEVELS = [
      { v: 1, name: "Básico" },
      { v: 2, name: "Intermedio" },
      { v: 3, name: "Avanzado" },
      { v: 4, name: "Experto" },
      { v: 5, name: "Director/C-Level" },
    ];

    const AIS = ["GPT-5", "Claude", "Gemini", "Llama"];

    // Salidas esperadas (output types)
    const OUTPUTS = [
      "Tabla + conclusiones",
      "Plan paso a paso",
      "Documento ejecutivo (1-2 páginas)",
      "Modelo en supuestos + cálculo",
      "Checklist + criterios de aceptación",
      "Brief + roadmap",
      "Informe con KPIs y recomendaciones",
      "Plantilla reutilizable",
    ];

    // Checklist común de calidad (se mezcla según caso)
    const QUALITY_CHECKS = [
      "Define supuestos explícitos (si faltan datos).",
      "Incluye 3 escenarios (base / optimista / conservador).",
      "Prioriza acciones por impacto-esfuerzo.",
      "Devuelve métricas, no solo texto.",
      "Aclara riesgos y mitigaciones.",
      "Propón próximos pasos medibles (dueño + fecha).",
      "Evita jerga: define términos cuando aparezcan.",
      "Incluye fuentes/datos necesarios para validar (si aplica)."
    ];

    // Bloques profesionales reutilizables por dominio
    const ROLE_BY_SUBCAT = {
      // Empresa
      "Estrategia": "Actúa como consultor de estrategia y operaciones.",
      "Operaciones": "Actúa como director de operaciones (COO) con enfoque en eficiencia.",
      "People & Org": "Actúa como HRBP senior y especialista en diseño organizativo.",
      "Ventas B2B": "Actúa como director comercial B2B orientado a pipeline y cierres.",
      "Producto & Go-to-Market": "Actúa como product lead con foco en GTM y posicionamiento.",
      "Riesgos & Compliance": "Actúa como responsable de compliance y gestión de riesgos.",
      "Cliente & CX": "Actúa como responsable de experiencia de cliente (CX) con enfoque en NPS y churn.",
      "Gestión de proyectos": "Actúa como project manager senior (PMO) orientado a entregables.",

      // Marketing
      "Growth": "Actúa como growth lead con foco en experimentación y escalado.",
      "Performance (Ads)": "Actúa como performance marketer senior (paid media).",
      "SEO & Contenido": "Actúa como estratega SEO + content lead.",
      "Brand": "Actúa como brand strategist orientado a diferenciación y consistencia.",
      "CRM & Lifecycle": "Actúa como CRM manager con foco en retención y LTV.",
      "Investigación de mercado": "Actúa como research lead (market & customer insights).",
      "Funnel & CRO": "Actúa como especialista en CRO (optimización de conversión).",
      "Partnerships": "Actúa como partnerships manager orientado a co-marketing y revenue.",

      // Economía
      "Finanzas corporativas": "Actúa como CFO con foco en estructura financiera.",
      "FP&A / Presupuestos": "Actúa como FP&A lead (presupuestos, forecast, control).",
      "Pricing & Revenue": "Actúa como revenue strategist con foco en pricing y monetización.",
      "Unit Economics": "Actúa como analista de unit economics (LTV/CAC, cohorts).",
      "Valoración": "Actúa como analista de valoración (DCF, múltiplos, escenarios).",
      "Tesorería": "Actúa como tesorero corporativo con foco en caja y liquidez.",
      "Riesgo financiero": "Actúa como risk manager financiero (sensibilidades, coberturas).",
      "Métricas & Reporting": "Actúa como analista de BI financiero y reporting ejecutivo."
    };

    // Objetivos por subcategoría (para generar variedad sin perder profesionalidad)
    const OBJECTIVES = {
      "Estrategia": [
        "definir una estrategia 12 meses con iniciativas priorizadas",
        "evaluar opciones estratégicas y recomendar una decisión",
        "crear un Balanced Scorecard con objetivos y KPIs",
        "diseñar un plan de expansión a un nuevo segmento"
      ],
      "Operaciones": [
        "reducir coste operativo sin degradar SLA",
        "identificar cuellos de botella y plan de mejora",
        "diseñar un sistema de KPIs operativos",
        "crear un plan de continuidad de negocio"
      ],
      "People & Org": [
        "diseñar una matriz de competencias y plan de desarrollo",
        "definir una política de desempeño y PIP",
        "crear un plan de onboarding y ramp-up",
        "estructurar bandas salariales y criterios"
      ],
      "Ventas B2B": [
        "optimizar el pipeline y forecast del trimestre",
        "diseñar un playbook de ventas consultivas",
        "crear un modelo de scoring de leads",
        "definir un plan de cuentas clave (ABM comercial)"
      ],
      "Producto & Go-to-Market": [
        "definir propuesta de valor y posicionamiento",
        "crear un roadmap por impacto/esfuerzo",
        "diseñar un plan de lanzamiento (pre/durante/post)",
        "estructurar un PRD con criterios de éxito"
      ],
      "Riesgos & Compliance": [
        "crear un marco de riesgos y controles",
        "definir un protocolo de incidentes",
        "redactar política de uso de datos y accesos",
        "diseñar un plan de auditoría interna"
      ],
      "Cliente & CX": [
        "reducir churn con plan basado en datos",
        "mejorar NPS con iniciativas por etapa del journey",
        "diseñar un sistema de VoC (Voice of Customer)",
        "crear guías de atención y escalados"
      ],
      "Gestión de proyectos": [
        "crear un plan de proyecto con cronograma y riesgos",
        "definir governance, RACI y cadencias",
        "diseñar una plantilla de status report ejecutivo",
        "establecer un marco de priorización del portfolio"
      ],

      "Growth": [
        "crear un backlog de experimentos con hipótesis y métricas",
        "definir un North Star Metric y árbol de métricas",
        "diseñar una estrategia de adquisición por canal",
        "optimizar activación con cohorts"
      ],
      "Performance (Ads)": [
        "estructurar campañas por objetivo y audiencias",
        "crear un plan de medición (UTM, eventos, atribución)",
        "optimizar ROAS con test de creatividades",
        "diseñar un framework de presupuesto y pacing"
      ],
      "SEO & Contenido": [
        "crear un plan editorial con clusters y keywords",
        "auditar SEO técnico y priorizar fixes",
        "diseñar estrategia de link building",
        "optimizar contenidos para intención de búsqueda"
      ],
      "Brand": [
        "definir arquitectura de marca y mensajes clave",
        "crear un brand brief y guía de tono",
        "diseñar narrativa y diferenciadores",
        "crear un plan de reputación y PR"
      ],
      "CRM & Lifecycle": [
        "diseñar journeys de email por segmento",
        "optimizar retención y reactivación",
        "crear un modelo de segmentación RFM",
        "definir un programa de loyalty"
      ],
      "Investigación de mercado": [
        "diseñar un estudio de mercado con metodología",
        "definir ICP y buyer personas basadas en evidencia",
        "crear un análisis competitivo accionable",
        "identificar oportunidades con TAM/SAM/SOM"
      ],
      "Funnel & CRO": [
        "auditar el funnel y detectar fricciones",
        "diseñar tests A/B con criterios estadísticos",
        "optimizar landings con mapa de mensajes",
        "crear un plan de instrumentación (events)"
      ],
      "Partnerships": [
        "definir una estrategia de partners y comisiones",
        "crear un plan de co-marketing con KPIs",
        "diseñar un modelo de evaluación de partners",
        "crear un playbook de negociación"
      ],

      "Finanzas corporativas": [
        "recomendar estructura de capital y financiación",
        "evaluar impacto financiero de una iniciativa",
        "definir política de gastos y controles",
        "crear un informe ejecutivo mensual para dirección"
      ],
      "FP&A / Presupuestos": [
        "crear un presupuesto anual con drivers",
        "diseñar un forecast mensual con escenarios",
        "analizar desviaciones (budget vs actual)",
        "definir un calendario y proceso de cierre"
      ],
      "Pricing & Revenue": [
        "definir estrategia de pricing por segmentos",
        "evaluar elasticidad y disposición a pagar",
        "diseñar paquetes y bundling",
        "crear un plan de subida de precios con riesgos"
      ],
      "Unit Economics": [
        "calcular LTV/CAC y payback por cohort",
        "identificar palancas para mejorar margen",
        "diseñar un modelo de unit economics por canal",
        "evaluar rentabilidad por cliente/segmento"
      ],
      "Valoración": [
        "crear un DCF con supuestos y sensibilidad",
        "valorar por múltiplos y comparables",
        "evaluar un M&A con sinergias y riesgos",
        "crear un equity story con escenarios"
      ],
      "Tesorería": [
        "diseñar un plan de tesorería 13 semanas",
        "optimizar cobros/pagos y working capital",
        "definir políticas de liquidez",
        "crear un plan ante estrés de caja"
      ],
      "Riesgo financiero": [
        "crear un análisis de riesgos y sensibilidades",
        "diseñar una política de coberturas (hedging)",
        "evaluar exposición a tipo de cambio",
        "definir límites y alertas de riesgo"
      ],
      "Métricas & Reporting": [
        "definir KPIs financieros y operativos",
        "crear un dashboard ejecutivo con alertas",
        "diseñar un data model para reporting",
        "establecer métricas de calidad del dato"
      ],
    };

    // Variables típicas empresariales para “rellenar” y hacer prompts útiles
    const CONTEXT_SNIPPETS = [
      "Contexto: empresa B2B SaaS con 25-150 empleados.",
      "Contexto: e-commerce con mix de adquisición paid + orgánico.",
      "Contexto: servicios profesionales con proyectos de 3-6 meses.",
      "Contexto: marketplace con dos lados (oferta/demanda).",
      "Contexto: empresa industrial con supply chain y SLAs.",
      "Contexto: startup en fase de crecimiento con presión de burn y runway."
    ];

    const CONSTRAINT_SNIPPETS = [
      "Restricciones: presupuesto limitado, prioriza quick wins en 30 días.",
      "Restricciones: mantener SLA y NPS, sin degradar calidad.",
      "Restricciones: compliance RGPD y control de accesos obligatorio.",
      "Restricciones: no contratar personal adicional este trimestre.",
      "Restricciones: todo debe ser medible con KPIs y owner.",
      "Restricciones: utiliza supuestos explícitos si faltan datos."
    ];

    // Genera un rating plausible (3-5 predominante)
    function weightedRating(i){
      const r = (i % 10);
      if (r < 1) return 2;
      if (r < 3) return 3;
      if (r < 7) return 4;
      return 5;
    }

    // IA recomendada por tipo (simple heurística)
    function pickAI(subcat, level){
      if (level >= 4) return "GPT-5";
      if (subcat.includes("SEO") || subcat.includes("Contenido")) return "Claude";
      if (subcat.includes("Ads") || subcat.includes("CRO")) return "Gemini";
      return "GPT-5";
    }

    function levelName(v){ return LEVELS.find(x => x.v === v)?.name ?? "—"; }

    function makeTitle(catName, subcat, obj){
      // Título corto y concreto
      const base = obj
        .replace("definir ", "Definir ")
        .replace("crear ", "Crear ")
        .replace("diseñar ", "Diseñar ")
        .replace("evaluar ", "Evaluar ")
        .replace("optimizar ", "Optimizar ")
        .replace("analizar ", "Analizar ")
        .replace("identificar ", "Identificar ")
        .replace("calcular ", "Calcular ")
        .replace("recomendar ", "Recomendar ");
      return `${base} · ${catName} / ${subcat}`;
    }

    function buildPromptText(role, objective, output, level, ctx, constraints){
      // Estructura fija (profesional y consistente)
      return [
        `${role}`,
        ``,
        `Objetivo: ${objective}.`,
        `${ctx}`,
        `${constraints}`,
        ``,
        `Requisitos del entregable:`,
        `1) Resumen ejecutivo (máx. 12 líneas).`,
        `2) Supuestos y datos necesarios (si no hay, propón supuestos razonables y explícitos).`,
        `3) Análisis (drivers, riesgos, palancas, trade-offs).`,
        `4) Recomendación y plan de acción (priorizado por impacto-esfuerzo).`,
        `5) Métricas/KPIs para seguimiento + umbrales de alerta.`,
        `6) Próximos pasos con responsables y plazos.`,
        ``,
        `Formato de salida: ${output}.`,
        `Nivel: ${levelName(level)}.`
      ].join("\n");
    }

    function generate1000Prompts(){
      const prompts = [];
      let idCounter = 1;

      // Estrategia: generamos combinando (cat × subcat × objective × variaciones) hasta 1000
      const variations = [
        "Incluye tabla impacto-esfuerzo y dependencia.",
        "Incluye 3 escenarios y sensibilidad de 2 variables clave.",
        "Incluye plan 30/60/90 días.",
        "Incluye riesgos + mitigaciones + señales tempranas.",
        "Incluye checklist de validación y criterios de aceptación."
      ];

      // Recorremos y vamos llenando hasta 1000
      while (prompts.length < 1000){
        for (const cat of CATEGORIES){
          for (const subcat of SUBCATS[cat.key]){
            const role = ROLE_BY_SUBCAT[subcat] || "Actúa como consultor senior.";
            const objList = OBJECTIVES[subcat] || ["crear un plan accionable con métricas"];
            for (let oi = 0; oi < objList.length; oi++){
              // Variaciones por nivel/contexto/constraint/output
              const baseObjective = objList[oi];

              for (let v = 0; v < variations.length; v++){
                if (prompts.length >= 1000) break;

                const level = ((idCounter + v) % 5) + 1;
                const ctx = CONTEXT_SNIPPETS[(idCounter + oi) % CONTEXT_SNIPPETS.length];
                const constraints = CONSTRAINT_SNIPPETS[(idCounter + v + oi) % CONSTRAINT_SNIPPETS.length];
                const output = OUTPUTS[(idCounter + v) % OUTPUTS.length];

                const objective = `${baseObjective} (${variations[v]})`;
                const title = makeTitle(cat.name, subcat, baseObjective);

                const rating = weightedRating(idCounter);
                const ai = pickAI(subcat, level);

                const tags = [
                  cat.name, subcat,
                  `Nivel:${levelName(level)}`,
                  `Salida:${output.split(" ")[0]}`,
                  rating >= 5 ? "Top" : (rating >= 4 ? "Recomendado" : "Útil"),
                ];

                const checklist = shuffle([...QUALITY_CHECKS]).slice(0, 6);

                prompts.push({
                  id: `PB-${String(idCounter).padStart(4,"0")}`,
                  title,
                  category: cat.key,
                  categoryName: cat.name,
                  subcategory: subcat,
                  level,
                  levelName: levelName(level),
                  ai,
                  rating,
                  output,
                  useCase: subcat,
                  tags,
                  checklist,
                  text: buildPromptText(role, objective, output, level, ctx, constraints),
                });

                idCounter++;
              }
              if (prompts.length >= 1000) break;
            }
            if (prompts.length >= 1000) break;
          }
          if (prompts.length >= 1000) break;
        }
      }

      return prompts.slice(0, 1000);
    }

    function shuffle(arr){
      for (let i = arr.length - 1; i > 0; i--){
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    /***********************
     * 2) STATE
     ***********************/
    const DB = generate1000Prompts();
    let filtered = [...DB];
    let selectedId = null;

    /***********************
     * 3) DOM HELPERS
     ***********************/
    const $ = (id) => document.getElementById(id);

    function toast(title, msg){
      $("toastTitle").textContent = title;
      $("toastMsg").textContent = msg;
      const t = $("toast");
      t.classList.add("show");
      setTimeout(() => t.classList.remove("show"), 1700);
    }

    function starText(r){
      // No emojis ruidosos: lo dejamos minimal con "★"
      const full = "★★★★★".slice(0, r);
      const empty = "☆☆☆☆☆".slice(0, 5 - r);
      return full + empty;
    }

    function normalize(s){
      return (s || "").toString().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function levelToSortValue(l){ return Number(l) || 0; }

    function downloadFile(filename, content, mime){
      const blob = new Blob([content], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    /***********************
     * 4) FILTERS + UI POPULATION
     ***********************/
    function unique(arr){ return Array.from(new Set(arr)); }

    function populateSelect(el, items, {allLabel="Todas", valueKey=null, labelKey=null} = {}){
      el.innerHTML = "";
      const optAll = document.createElement("option");
      optAll.value = "";
      optAll.textContent = allLabel;
      el.appendChild(optAll);

      for (const it of items){
        const opt = document.createElement("option");
        if (valueKey) opt.value = it[valueKey];
        else opt.value = it;
        opt.textContent = labelKey ? it[labelKey] : it;
        el.appendChild(opt);
      }
    }

    function initFilters(){
      populateSelect($("cat"), CATEGORIES, { allLabel: "Todas", valueKey:"key", labelKey:"name" });

      // Subcat depende de category
      populateSelect($("subcat"), unique(DB.map(x => x.subcategory)).sort(), { allLabel:"Todas" });

      populateSelect($("level"), LEVELS.map(x => x.v), { allLabel:"Todos" });
      // Etiquetas visibles en option text
      Array.from($("level").options).forEach(opt => {
        if (!opt.value) return;
        const v = Number(opt.value);
        opt.textContent = `${v} — ${levelName(v)}`;
      });

      populateSelect($("ai"), unique(DB.map(x => x.ai)).sort(), { allLabel:"Todas" });

      $("kpi-total").textContent = DB.length.toString();
      $("kpi-shown").textContent = DB.length.toString();
      $("kpi-cats").textContent = CATEGORIES.length.toString();
      $("year").textContent = new Date().getFullYear().toString();
    }

    function updateSubcatsByCategory(){
      const cat = $("cat").value;
      if (!cat){
        populateSelect($("subcat"), unique(DB.map(x => x.subcategory)).sort(), { allLabel:"Todas" });
        return;
      }
      populateSelect($("subcat"), SUBCATS[cat].slice().sort(), { allLabel:"Todas" });
    }

    function applyFilters(){
      const q = normalize($("q").value.trim());
      const cat = $("cat").value;
      const subcat = $("subcat").value;
      const level = $("level").value ? Number($("level").value) : null;
      const ai = $("ai").value;
      const minRating = Number($("minRating").value);

      filtered = DB.filter(p => {
        if (cat && p.category !== cat) return false;
        if (subcat && p.subcategory !== subcat) return false;
        if (level && p.level !== level) return false;
        if (ai && p.ai !== ai) return false;
        if (p.rating < minRating) return false;

        if (q){
          const hay = normalize(
            `${p.title} ${p.categoryName} ${p.subcategory} ${p.ai} ${p.output} ${p.text} ${p.tags.join(" ")}`
          );
          if (!hay.includes(q)) return false;
        }
        return true;
      });

      sortFiltered();
      renderList();
      updateKPIs();
      ensureSelection();
    }

    function sortFiltered(){
      const mode = $("sort").value;
      $("sortLabel").textContent = ({
        relevance:"Relevancia",
        rating_desc:"Rating ↓",
        rating_asc:"Rating ↑",
        level_desc:"Nivel ↓",
        level_asc:"Nivel ↑",
        title_asc:"Título A→Z",
        title_desc:"Título Z→A"
      })[mode] || "Relevancia";

      // relevancia: si hay query, prioriza coincidencias en título/subcat + rating
      const q = normalize($("q").value.trim());

      const score = (p) => {
        let s = 0;
        if (!q) return p.rating * 10 + p.level; // fallback
        const title = normalize(p.title);
        const sub = normalize(p.subcategory);
        const txt = normalize(p.text);
        if (title.includes(q)) s += 50;
        if (sub.includes(q)) s += 20;
        if (txt.includes(q)) s += 10;
        s += p.rating * 5;
        s += p.level;
        return s;
      };

      const byTitle = (a,b) => a.title.localeCompare(b.title, "es", { sensitivity:"base" });
      const byTitleDesc = (a,b) => -byTitle(a,b);

      if (mode === "relevance"){
        filtered.sort((a,b) => score(b) - score(a));
      } else if (mode === "rating_desc"){
        filtered.sort((a,b) => (b.rating - a.rating) || byTitle(a,b));
      } else if (mode === "rating_asc"){
        filtered.sort((a,b) => (a.rating - b.rating) || byTitle(a,b));
      } else if (mode === "level_desc"){
        filtered.sort((a,b) => (levelToSortValue(b.level) - levelToSortValue(a.level)) || (b.rating - a.rating));
      } else if (mode === "level_asc"){
        filtered.sort((a,b) => (levelToSortValue(a.level) - levelToSortValue(b.level)) || (b.rating - a.rating));
      } else if (mode === "title_asc"){
        filtered.sort(byTitle);
      } else if (mode === "title_desc"){
        filtered.sort(byTitleDesc);
      }
    }

    function updateKPIs(){
      $("countLabel").textContent = filtered.length.toString();
      $("kpi-shown").textContent = filtered.length.toString();
    }

    /***********************
     * 5) RENDER LIST + DETAIL
     ***********************/
    function renderList(){
      const list = $("list");
      list.innerHTML = "";

      if (!filtered.length){
        const empty = document.createElement("div");
        empty.className = "card";
        empty.style.cursor = "default";
        empty.innerHTML = `
          <div class="title-row">
            <h3>Sin resultados</h3>
            <div class="rating">Ajusta filtros o búsqueda</div>
          </div>
          <div class="meta">
            <span class="tag"><b>Tip</b> Baja rating mínimo o elimina subcategoría</span>
          </div>
        `;
        list.appendChild(empty);
        return;
      }

      for (const p of filtered){
        const card = document.createElement("div");
        card.className = "card" + (p.id === selectedId ? " active" : "");
        card.dataset.id = p.id;

        const rating = starText(p.rating);
        const shortTitle = p.title.length > 92 ? (p.title.slice(0, 92) + "…") : p.title;

        card.innerHTML = `
          <div class="title-row">
            <h3>${escapeHtml(shortTitle)}</h3>
            <div class="rating">${rating}</div>
          </div>
          <div class="meta">
            <span class="tag"><b>${escapeHtml(p.categoryName)}</b></span>
            <span class="tag">${escapeHtml(p.subcategory)}</span>
            <span class="tag">Nivel <b>${p.level}</b></span>
            <span class="tag"><b>${escapeHtml(p.ai)}</b></span>
          </div>
        `;

        card.addEventListener("click", () => selectPrompt(p.id));
        list.appendChild(card);
      }
    }

    function selectPrompt(id){
      selectedId = id;
      renderList();
      const p = DB.find(x => x.id === id);
      if (!p) return;
      renderDetail(p);
    }

    function renderDetail(p){
      $("detailOutput").textContent = p.output;
      $("detailUse").textContent = p.useCase;
      $("detailText").textContent = p.text;

      const tagsWrap = $("detailTags");
      tagsWrap.innerHTML = "";
      const tags = [
        ["ID", p.id],
        ["Categoría", p.categoryName],
        ["Subcat", p.subcategory],
        ["Nivel", `${p.level} — ${p.levelName}`],
        ["IA", p.ai],
        ["Rating", `${p.rating}/5`],
      ];

      for (const [k,v] of tags){
        const t = document.createElement("span");
        t.className = "tag";
        t.innerHTML = `<span>${escapeHtml(k)}:</span> <b>${escapeHtml(v)}</b>`;
        tagsWrap.appendChild(t);
      }

      // Checklist
      const ul = $("detailChecklist");
      ul.innerHTML = "";
      for (const item of p.checklist){
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      }
    }

    function ensureSelection(){
      if (selectedId && filtered.some(x => x.id === selectedId)) return;
      if (filtered.length){
        selectPrompt(filtered[0].id);
      } else {
        selectedId = null;
        $("detailOutput").textContent = "—";
        $("detailUse").textContent = "—";
        $("detailText").textContent = "";
        $("detailTags").innerHTML = "";
        $("detailChecklist").innerHTML = "";
      }
    }

    function escapeHtml(str){
      return (str ?? "").toString()
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
    }

    /***********************
     * 6) ACTIONS: COPY / RANDOM / RESET / EXPORT
     ***********************/
    async function copyText(text){
      try{
        await navigator.clipboard.writeText(text);
        toast("Copiado", "Contenido enviado al portapapeles.");
      } catch (e){
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        toast("Copiado", "Contenido copiado (fallback).");
      }
    }

    function getSelected(){
      if (!selectedId) return null;
      return DB.find(x => x.id === selectedId) || null;
    }

    function resetUI(){
      $("q").value = "";
      $("cat").value = "";
      updateSubcatsByCategory();
      $("subcat").value = "";
      $("level").value = "";
      $("ai").value = "";
      $("minRating").value = "3";
      $("minRatingLabel").textContent = "3";
      $("sort").value = "relevance";
      applyFilters();
      toast("Reset", "Filtros restaurados.");
    }

    function pickRandom(){
      if (!filtered.length) return;
      const p = filtered[Math.floor(Math.random() * filtered.length)];
      selectPrompt(p.id);
      toast("Aleatorio", `Seleccionado ${p.id}.`);
    }

    function toCSV(rows){
      const headers = ["id","title","category","subcategory","level","ai","rating","output","tags","text"];
      const lines = [headers.join(",")];
      for (const r of rows){
        const vals = [
          r.id,
          r.title,
          r.categoryName,
          r.subcategory,
          r.level,
          r.ai,
          r.rating,
          r.output,
          (r.tags || []).join(" | "),
          r.text
        ].map(v => `"${String(v).replaceAll('"','""')}"`);
        lines.push(vals.join(","));
      }
      return lines.join("\n");
    }

    /***********************
     * 7) THEME TOGGLE (reduce effects)
     ***********************/
    let sober = false;
    function setSoberMode(on){
      sober = on;
      // reduce background gradients and shadows a bit
      document.body.style.background = on ? "var(--bg)" : "";
      const panels = document.querySelectorAll(".panel");
      panels.forEach(p => p.style.boxShadow = on ? "none" : "");
      $("theme-btn").textContent = on ? "Modo normal" : "Modo sobrio";
      toast("Tema", on ? "Modo sobrio activado." : "Modo normal activado.");
    }

    /***********************
     * 8) INIT + EVENTS
     ***********************/
    function wireEvents(){
      $("cat").addEventListener("change", () => {
        updateSubcatsByCategory();
        $("subcat").value = "";
        applyFilters();
      });
      $("subcat").addEventListener("change", applyFilters);
      $("level").addEventListener("change", applyFilters);
      $("ai").addEventListener("change", applyFilters);
      $("sort").addEventListener("change", applyFilters);

      $("minRating").addEventListener("input", (e) => {
        $("minRatingLabel").textContent = String(e.target.value);
        applyFilters();
      });

      let qTimer = null;
      $("q").addEventListener("input", () => {
        clearTimeout(qTimer);
        qTimer = setTimeout(applyFilters, 120);
      });

      $("resetBtn").addEventListener("click", resetUI);
      $("randomBtn").addEventListener("click", pickRandom);

      $("copyBtn").addEventListener("click", () => {
        const p = getSelected();
        if (!p) return toast("Aviso", "No hay prompt seleccionado.");
        copyText(p.text);
      });

      $("copy-selected-btn").addEventListener("click", () => {
        const p = getSelected();
        if (!p) return toast("Aviso", "No hay prompt seleccionado.");
        copyText(p.text);
      });

      $("copyIdBtn").addEventListener("click", () => {
        const p = getSelected();
        if (!p) return toast("Aviso", "No hay prompt seleccionado.");
        copyText(p.id);
      });

      $("copyJsonBtn").addEventListener("click", () => {
        const p = getSelected();
        if (!p) return toast("Aviso", "No hay prompt seleccionado.");
        copyText(JSON.stringify(p, null, 2));
      });

      $("theme-btn").addEventListener("click", () => setSoberMode(!sober));

      $("exportFilteredJson").addEventListener("click", () => {
        downloadFile("promptbank_filtered.json", JSON.stringify(filtered, null, 2), "application/json");
        toast("Exportación", "JSON filtrados descargado.");
      });
      $("exportAllJson").addEventListener("click", () => {
        downloadFile("promptbank_1000.json", JSON.stringify(DB, null, 2), "application/json");
        toast("Exportación", "JSON completo descargado.");
      });
      $("exportFilteredCsv").addEventListener("click", () => {
        downloadFile("promptbank_filtered.csv", toCSV(filtered), "text/csv;charset=utf-8");
        toast("Exportación", "CSV filtrados descargado.");
      });
      $("exportAllCsv").addEventListener("click", () => {
        downloadFile("promptbank_1000.csv", toCSV(DB), "text/csv;charset=utf-8");
        toast("Exportación", "CSV completo descargado.");
      });
    }

    // Boot
    initFilters();
    wireEvents();
    applyFilters();
    ensureSelection();
  </script>
</body>
</html>