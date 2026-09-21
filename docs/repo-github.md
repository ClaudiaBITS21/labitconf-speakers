# Repo de GitHub y carpeta local — dónde vive el código y los docs (actualizado 21/9/2026, tarde)

**Regla de Rodolfo (21/9/2026): todo lo que se produzca con Claude — de LABITCONF o de cualquier otro tema — se guarda en subcarpetas de `~/Desktop/AGENTES/` en su Mac.** Para este proyecto: `~/Desktop/AGENTES/LABITCONF/`. (Ahí ya conviven `Claud-IA/` y `juego-memoria/` de otros trabajos.) Al conectar carpeta en una sesión nueva, pedir acceso a `~/Desktop/AGENTES`.

**Regla de cierre (skill `labitconf-update`):** cada vez que se termina un cambio (versión nueva del artefacto, docs, datos) → ZIP con fecha en `~/Desktop/AGENTES/LABITCONF/zips/` + commit y push al repo. No esperar a que lo pida.

**Repo:** https://github.com/ClaudiaBITS21/labitconf-speakers (privado, cuenta ClaudiaBITS21, rama `main`).
**Clon local en la Mac de Rodolfo:** `~/Desktop/AGENTES/LABITCONF/labitconf-speakers`.
**Token:** `~/Desktop/AGENTES/LABITCONF/.github-token` (fine-grained, Contents R/W solo sobre ese repo). Nunca va al repo ni a `.git/config`.

Distinto de la app de postulaciones (`app-labitconf.github.io/LABITCONF-speakers`, ver herramienta-speakers-app.md) — ese es otro repo/organización.

## Estructura

- `docs/` — copia de los docs de este proyecto de Claude (el proyecto sigue siendo el master; el repo es respaldo/versionado).
- `app/index.html` — HTML publicado del artefacto "Speakers LABITCONF 2026" (**v105 al 21/9**; ~1,5 MB porque embebe las fotos). Embebe la base de speakers con teléfonos/handles y notas de evaluación: **el repo tiene que seguir privado**.
- `backup-db/` — **respaldo de la base viva del artefacto**: `grid/current.json` (la grilla: 117 tarjetas + pool), `agenda/<id>.json` (250 docs: tier, agenda, contactar, género, # WEB), `config/hidden.json`, `appsync/last.json` (bajada del 21/9), `extras/<id>.json` (10), `base-speakers-embebida.json` (el `var D` del HTML, 246 filas, con fotos) y `grilla-legible.md` (la grilla en tablas por día/escenario). Se exporta con `ArtifactData` (list por colección con `out_dir`); colecciones que usa la página: `agenda`, `grid`, `config` (`hidden`, `app`), `appsync` (`last`), `extras`. Rodolfo pidió este respaldo explícitamente ("no quiero perder la grilla") — **repetirlo cada vez que la grilla cambie de forma importante**.
- `README.md` explica todo esto. El pipeline (`build.py`, etc.) no está: vivía en un contenedor de sesión anterior que ya no existe; si aparece el zip, va en `pipeline/`.

## Artefacto "Speakers LABITCONF 2026" — links por solapa (v102, 21/9/2026)

URL: https://claude.ai/artifact/6XaNDbYwq74JW3mNDxZ8Cb. Cada solapa tiene deep link por hash: `#speakers`, `#temas`, `#destacadas`, `#faltantes`, `#grilla`, `#buscar`, `#marcados`, `#orden` (también acepta `?v=grilla`). Al clickear una solapa la página escribe el hash (replaceState) y hay un botón "🔗 Copiar link" al final de la fila de solapas que copia la URL completa de la solapa activa. Verificado en el navegador: claude.ai pasa el hash al iframe del artefacto (`…frame.claudeusercontent.com/…#grilla`), así que un link pegado en una pestaña nueva abre la solapa correcta. **Limitación:** si en una pestaña ya abierta solo se cambia el hash de la URL, el iframe no se recarga y no cambia de solapa — hay que recargar. Rodolfo aceptó explícitamente que el link abre el artefacto entero (no le importa que quien reciba el link vea el resto de las solapas); no se hizo vista pública separada.

Lo demás del 21/9 (sync con la app, fotos, redes, columna Peso eliminada, aviso de día en la grilla) está en `sync-21-9-2026.md`.

## Cómo se sube (aprendizajes)

- El push desde el contenedor de la nube está bloqueado por el proxy; desde la VM local de la Mac (`device_bash`) sí llega a github.com. El token se lee del archivo `.github-token` en AGENTES/LABITCONF; se pasa solo en la URL del clone/push y después se resetea el remote sin token.
- En la VM local, `git commit` dentro de una carpeta conectada (`~/mnt/...`) falla porque git no puede borrar `index.lock` (borrado deshabilitado). Solución que funcionó: clonar y commitear en `$HOME/work/labitconf-speakers` (fuera de `mnt/`), pushear, y después copiar los archivos y el `.git` al clon de AGENTES (`cp -R`, sin borrar nada).
- Para pasar archivos del contenedor a la Mac: zip → `SendUserFile`/`device_commit_files` a `AGENTES/LABITCONF/zips/` → `unzip` en la VM. Los zips sobrantes van a `_to_delete/` (no se puede borrar desde acá).
- Commits: `f3e5a63` (docs + app v101), `7121408` (backup-db), y el del update del 21/9 tarde (v105 + backup-db + docs).
- Quedaron carpetas `~/Documents/_to_delete/` y `~/Desktop/AGENTES/LABITCONF/_to_delete/` con restos; Rodolfo puede borrarlas.

## Pregunta abierta de Rodolfo (21/9): "¿tengo que hacer una API para que otros se conecten a mis datos, y eso va en GitHub?"
Respondido: GitHub no ejecuta APIs, solo guarda código y archivos. Opciones reales según quién consume: JSON estático servido desde el repo (GitHub Pages / raw) para lectura; la propia Google Sheet + Apps Script de la app (ya es una API de facto); o un backend chico si hace falta escritura/autenticación. Pendiente que Rodolfo diga quién necesita conectarse y para qué.
