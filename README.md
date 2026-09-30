# labitconf-speakers — respaldo privado de LABITCONF 2026

**Repo privado:** `app/index.html` y `backup-db/` contienen teléfonos, handles y notas internas de speakers.

- `app/index.html`: HTML publicado del artefacto "Speakers LABITCONF 2026" (https://claude.ai/artifact/6XaNDbYwq74JW3mNDxZ8Cb). Embebe fotos y base.
- `backup-db/`: base viva del artefacto exportada colección por colección.
  - `grid/current.json`: la grilla.
  - `agenda/<id>.json`
  - `config/` (`hidden`, `tags`)
  - `appsync/last.json`
  - `extras/<id>.json`
  - `base-speakers-embebida.json`: el `var D` del HTML.
  - `grilla-legible.md`: la grilla en tablas por día y escenario.
- `docs/`: copia de los docs del proyecto de Claude. El proyecto es el master; esto es respaldo.

Último update: 30/9/2026. Incluye los cambios del 29/9 (import Excel/app) y posteriores.
