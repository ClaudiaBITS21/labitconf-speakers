# labitconf-speakers — respaldo del trabajo de curaduría de speakers LABITCONF 2026

Repo **privado**: `app/index.html` y `backup-db/` contienen teléfonos, handles y notas internas de evaluación de speakers.

## Qué hay

- `docs/` — copia de los documentos del proyecto "LABITCONF" de Claude (el proyecto es el master; esto es respaldo versionado). Empezar por `contexto-general.md`, `escenarios-2026.md`, `criterios-y-flow.md`; lo operativo del artefacto está en `grilla-funcionalidades.md`; el último update en `sync-21-9-2026.md`.
- `app/index.html` — el artefacto "Speakers LABITCONF 2026" tal como está publicado (https://claude.ai/artifact/6XaNDbYwq74JW3mNDxZ8Cb). Es una página autocontenida: embebe la base de speakers (`var D`) y las fotos como data URI. Abrirlo en local funciona en modo lectura; la base viva (agenda, grilla, tiers, # WEB) vive en la base de datos del artefacto y solo carga dentro de claude.ai.
- `backup-db/` — export de esa base viva: `agenda/<id>.json` (por speaker: tier, charlas en agenda, descartado, contactar, género, # WEB), `grid/current.json` (la grilla completa + pool), `config/hidden.json` (ítems minimizados), `appsync/last.json` (última bajada de la app de postulaciones), `extras/<id>.json` (speakers creados a mano desde la grilla, ids 500+), `base-speakers-embebida.json` (el `var D` en JSON) y `grilla-legible.md` (la grilla en tablas por día y escenario, para leer sin abrir nada).

## Cómo se actualiza

Skill `labitconf-update` (Claude): exporta la base con `ArtifactData`, arma `labitconf-update-AAAA-MM-DD.zip`, lo deja en `~/Desktop/AGENTES/LABITCONF/zips/` en la Mac de Rodolfo y hace commit + push desde la VM local de la Mac (el contenedor en la nube no llega a GitHub). Procedimiento y aprendizajes en `docs/repo-github.md`.

## Fuentes de datos

- App de postulaciones (otro repo): https://app-labitconf.github.io/LABITCONF-speakers/ — se baja desde el navegador (`localStorage.labitconf_state_cache`), ver `docs/herramienta-speakers-app.md`.
- Grilla: el artefacto es el master desde el 11/9 (antes, un Google Sheet).
