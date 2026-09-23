# LABITCONF 2026 — update 2026-09-23 (b)

Contenido:

- `app/index.html` — HTML publicado del artefacto "Speakers LABITCONF 2026" (v134).
- `backup-db/` — copia de la base viva del artefacto: `agenda/`, `grid/`, `config/`, `appsync/`, `extras/`,
  más `base-speakers-embebida.json` (el `var D` del HTML) y `grilla-legible.md`.

Cambio de esta versión: se **revirtió** el filtro de MAIL agregado más temprano el mismo día (v133).
El artefacto vuelve al estado previo, sin marca ✉, sin filtros de mail y sin los mapas
`MAILLISTA` / `MAILOK` / `MAILADDR`. La base (`agenda/`) nunca llegó a guardar overrides `mailok`.
Los hallazgos sobre la planilla LABITCONF-speakers quedan en el doc del proyecto
`claude/filtro-mail-speakers.md`.

Repo privado: lleva mails, teléfonos y notas internas de speakers.
