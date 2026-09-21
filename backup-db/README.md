# Respaldo de la base viva del artefacto "Speakers LABITCONF 2026"

Exportado el 21/9/2026 con la herramienta de datos del artefacto (https://claude.ai/artifact/6XaNDbYwq74JW3mNDxZ8Cb). Un archivo JSON por documento, con la misma ruta que en la base:

- `grid/current.json` — **la grilla completa** (dos días, columnas por escenario, tarjetas con título, speakers, duración, tipo/moderador, alertas resueltas) y la zona para reordenar (`pool`).
- `agenda/<id>.json` — por speaker: tier, descartado, contactar/notas de llamada, charlas marcadas "ya en mi agenda", género, # WEB.
- `config/hidden.json` — ítems minimizados en Temas agrupados / Charlas destacadas / Temas faltantes.
- `appsync/last.json` — última bajada de la app de postulaciones usada para detectar novedades.
- `extras/<id>.json` — speakers creados a mano desde la grilla (ids desde 500).
- `base-speakers-embebida.json` — la base de speakers tal como está embebida en `app/index.html` (`var D`), para poder resolver ids → nombres sin abrir el HTML.
- `grilla-legible.md` — la grilla renderizada como tablas por día y escenario, generada a partir de `grid/current.json`. Es para leer; el archivo de verdad es el JSON.

Para restaurar: cada JSON se escribe de vuelta al documento del mismo nombre con la herramienta de datos del artefacto (`set`). Rehacer este respaldo cada vez que la grilla cambie de forma importante.
