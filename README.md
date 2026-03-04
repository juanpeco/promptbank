# JuanPeco Business Lab (Top 1) — GitHub Pages

Web estática (HTML/CSS/JS) lista para subir a GitHub y publicar en GitHub Pages.

## Qué incluye
- Prompt Bank: **5000 prompts** (Empresa, Marketing, Economía, STEAM)
- Buscador tipo Notion (Ctrl/⌘ K): fuzzy search + filtros
- Filtros rápidos + vista lista/tarjetas + prompt aleatorio
- Simulador de empresa
- Generador de casos de negocio
- Generador de “prompt perfecto”
- Juegos: decisiones empresariales + sprint strategy
- STEAM Lab: robot grid, inventario (ROP), A/B test

## Estructura
- index.html
- styles.css
- app.js
- assets/
- data/prompts_5000.json

## Publicar en GitHub Pages (paso a paso)
1) Crea un repo en GitHub (ej: `promptbank`).
2) Sube TODO el contenido de este zip al repo (raíz del repo).
3) Ve a **Settings → Pages**.
4) En **Build and deployment**:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/(root)**
5) Guarda. Espera a que GitHub publique (1-3 min normalmente).
6) Tu web quedará en:
   - `https://TUUSUARIO.github.io/promptbank/`

## Editar
- Cambia textos en `index.html`.
- Cambia colores en `styles.css` (variables :root).
- Los prompts están en `data/prompts_5000.json`.

## Nota
Los prompts están generados con plantillas profesionales para crear 5000 entradas consistentes.
Si quieres “curación editorial” (menos repetición percibida), puedes:
- aumentar plantillas / roles / artefactos
- meter prompts manuales top por cada subcategoría
