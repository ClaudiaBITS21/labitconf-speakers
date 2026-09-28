# LABITCONF 2026 — update 2026-09-28

Contenido:

- `app/index.html` — HTML publicado del artefacto "Speakers LABITCONF 2026" (v139).
- `backup-db/` — copia de la base viva del artefacto: `agenda/`, `grid/`, `config/`, `appsync/`, `extras/`,
  más `base-speakers-embebida.json` (el `var D` del HTML) y `grilla-legible.md` (regenerada con charlas, huecos, nivel y tags).
- `docs/exportar-pdf-escenarios.md` — doc nuevo.

Cambio de esta versión: botón **"⤓ Exportar PDF"** en la Vista expandida de la grilla. Se eligen escenarios
(por día) y genera un PDF horizontal con una página por escenario; la letra se achica sola para que cada
escenario entre en una hoja. Librerías jsPDF + autotable embebidas; descarga vía capacidad `downloads`.

Repo privado: lleva mails, teléfonos y notas internas de speakers.
