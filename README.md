# JuanPeco Prompt Studio & Business Lab

Web estática (sin build): **HTML + CSS + JS** + **data/prompts.json (5000 prompts)**.

## Estructura
- `index.html`
- `assets/css/styles.css`
- `assets/js/app.js`
- `assets/img/logo-juanpeco.svg`
- `data/prompts.json`

## Cómo verlo en local
Opción rápida (recomendada para que `fetch()` funcione):
```bash
python -m http.server 8000
```
Luego abre: `http://localhost:8000`

## Subir a GitHub (pasos)
```bash
git init
git add .
git commit -m "Initial: JuanPeco Prompt Studio"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

## Publicar en GitHub Pages
1. En GitHub → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / folder: `/root`
4. Guardar y esperar a que te dé la URL.

## Cambiar colores/textos
- Colores: `assets/css/styles.css` (`--mustard`, `--lilac`, etc.)
- Textos principales: `index.html`
- Lógica: `assets/js/app.js`

