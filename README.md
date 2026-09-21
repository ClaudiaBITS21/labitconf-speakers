# LABITCONF 2026 — curaduría de speakers y grilla

Repositorio de trabajo de la curaduría de speakers y armado de la grilla de LABITCONF 2026 ("Edición HODL", 30 y 31 de octubre de 2026, BAFerial, Buenos Aires).

> **Repo privado.** `app/index.html` embebe la base completa de speakers, incluidos datos de contacto (WhatsApp, Telegram, Signal) y notas internas de evaluación. No hacerlo público ni copiar ese archivo a un sitio abierto.

## Estructura

```
docs/   Documentación de criterio y contexto (Markdown)
app/    HTML publicado del artefacto "Speakers LABITCONF 2026"
```

### `docs/`

| Archivo | Qué es |
|---|---|
| `contexto-general.md` | Dimensionamiento del evento, edición 2026, condicionantes |
| `escenarios-2026.md` | Los 6 escenarios ("4 + 2"), layout y capacidades |
| `criterios-y-flow.md` | Tiers, lógica de flow entre escenarios, grilla horaria |
| `temas-en-debate-2026.md` | Mapa de temas en debate en el ecosistema (research web) |
| `speakers-y-temas.md` | Tracker en bruto: speakers mencionados, temas sin speaker, pendientes, sincronizaciones con la app |
| `primera-pasada-relevancia.md` | Primera evaluación de las postulaciones (peso, alcance, alertas, clusters) |
| `criterio-alcance-vs-peso.md` | Método para separar alcance en redes de peso de cartel |
| `charlas-destacadas-y-temas-faltantes.md` | Ranking de charlas y huecos temáticos con referencias |
| `herramienta-speakers-app.md` | Cómo se lee la app de postulaciones (GitHub Pages + Apps Script) |
| `compromiso-y-escenarios.md` | Bitácora de sincronizaciones y cambios (solo secciones 12–13; las anteriores no sobrevivieron en el proyecto) |
| `estructura-de-autoridad-en-vivo.md` | Cadena de mando en vivo durante el evento |
| `grilla-funcionalidades.md` | Referencia técnica del artefacto (solapas, helpers, persistencia) |

### `app/`

`index.html` es el HTML tal como está publicado en el artefacto (https://claude.ai/artifact/6XaNDbYwq74JW3mNDxZ8Cb). Es una página de un solo archivo con la base de speakers embebida (`var D`) y persistencia en la base del artefacto vía `window.claude` (capacidades `db`, `mcp` para Google Drive y `sample`). Fuera del entorno de artefactos de Claude la página carga pero no persiste cambios.

El pipeline que generaba este HTML (`build.py`, `grilla.py`, `escenarios.py`, `contacto.py`, `grid_edit.js`, `data.txt`, etc.) vivía en un contenedor de sesión que ya no existe; los últimos cambios (v97–v101) se hicieron parcheando el HTML publicado directamente. Si aparece el zip del pipeline, va en `pipeline/`.

Los documentos de `docs/` son la copia del proyecto de Claude al 21/9/2026; el proyecto sigue siendo el master de la documentación.
