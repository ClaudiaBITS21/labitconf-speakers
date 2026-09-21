# Herramienta de speakers — app propia de Rodolfo

**URL:** https://app-labitconf.github.io/LABITCONF-speakers/
**Título en la app:** "LABITCONF 2026 — Speakers v82"

## Acceso: CONFIRMADO y funcionando (9/9/2026)

Claude **sí puede** ver y explorar la app igual que Rodolfo, usando el navegador integrado del escritorio (no WebFetch).

- WebFetch estático **no sirve**: devuelve la app vacía ("No hay speakers aún") porque no ejecuta el JavaScript que trae los datos.
- El navegador integrado sí ejecuta el JS y carga los datos reales.
- **Detalle importante:** hay que darle un momento a la página. La primera lectura después de abrirla muestra "Cargando…" y todo en cero; una segunda lectura, segundos después, ya trae los datos.
- Hubo que pedir permiso de sitio una vez (`request_access` para `app-labitconf.github.io`), que fue concedido.
- **Ojo con llamadas de JS superpuestas:** si se dispara `refreshAll()`/`loadSpeakers()` y enseguida otra llamada antes de que la primera termine, el propio `AbortController` de la app cancela el fetch en curso (`AbortError`) y el cache queda vacío/stale. Lo que funciona: `navigate()` (recarga limpia) y después UNA sola llamada de JS que solo espera (~8s) antes de leer el cache — nada intercalado en el medio.
- **11/9:** cuando no está disponible el navegador integrado (`mcp__remote-devices__Claude_Browser__*`), la extensión Claude en Chrome (`mcp__claude-in-chrome__*`) sirve exactamente igual — mismo método, misma clave de localStorage.

### Cómo bajar los datos rápido (método preferido)

La app guarda todo el estado en `localStorage`, clave **`labitconf_state_cache`**. Ejecutando JS en la página se obtiene un objeto con:

- `speakers` — array de registros (172 al 10/9/2026; 181 al 11/9/2026)
- `agenda` — objeto con claves `s1`…`s9` (los nueve escenarios de la app)
- `speakersManual` — vacío
- `ideas` — 19 registros
- `ts` — timestamp

Esto evita tener que leer la tabla visualmente y permite proyectar solo los campos necesarios. **Ojo con el tamaño:** pedir el array completo de 172+ speakers vía `javascript_tool` excede el límite de tokens de la respuesta y se guarda en un archivo de resultados aparte, que además viene **doble-encodeado como JSON** (un string JSON dentro de otro) y con una nota final tipo `(captured at origin ...)` pegada fuera de las comillas — hay que separar esa nota antes de decodificar dos veces.

**Backend:** Google Apps Script (`gasGet`/`gasPost` contra un `GAS_URL` que apunta a `script.google.com/macros/s/.../exec?sheet=<hoja>`). O sea, los datos viven en una Google Sheet. **El contenedor de Claude en la nube no puede llegar a ese endpoint** (bloqueado por política de egress), así que la vía es siempre el navegador (integrado o Chrome).

## Esquema real de cada speaker

`postulacion_num, nombre, apellido, confname, tipo, cargo, pais, idioma, mail, website, foto, whatsapp, telegram, signal, linkedin, x, instagram, github, nostr, empresa, notas, bio, eventos_anteriores, primera_vez, disponible_podcast, trae_empresa, dias_asiste, disponible_desde, disponible_hasta, _temas, temas_estado, estado, oct29, oct30, oct31, nov1, landing, mail_ok, landing_ok, temasArr, detallesArr, abstractsArr, tagsArr, temas, displayName, temasEstadoArr`

Estados observados (9/9): `disponible` (139), `revision` (19), `confirmado` (13), `rechazado` (2), `respaldo` (1). `tipo` es `speaker` en todos.

**`postulacion_num` NO es una clave confiable** (confirmado 10/9 y reconfirmado 11/9): tiene huecos y además se repite — dos postulantes distintos pueden compartir el mismo número (ej. num 25 = Jeremy Almond Y Bruno Vaccotti; num 197 = Iván Cristini Y Alfredo Perotti; num 198 = Francisco Coronel Calvet Y Rodolfo Hornus). El emparejamiento entre la app y la base local se hace por nombre/apellido/handle con matching tolerante a variantes (nickname, orden, mayúsculas), no por ese número.

**Matching por nombre — cuidado con el umbral (11/9):** la primera versión del matcher (intersección simple de tokens sobre el mínimo de tamaño de los dos conjuntos) daba falsos positivos fuertes con nombres de un solo token en común — "Axel Camargo" matcheaba con "Axel Arellano" solo por compartir "Axel", con score 1.0. Se corrigió pasando a **similitud de Jaccard** (intersección sobre unión) con piso 0.5, que resuelve ese caso (score baja a ~0.33) pero a cambio no reconoce automáticamente apodos/abreviaturas legítimas (Niko = Nicolás, Richi = Ricardo, Lea = Leandro, JdL = Jorajuria de León) — esos hay que revisarlos a mano igual, mirando tema propuesto + empresa + país como corroboración, no solo el nombre.

## Qué NO hay que usar de la app (indicado por Rodolfo, 9/9/2026)

- **Los nombres de escenarios de la app están viejos** (Main, Pastilla, Workshops, Hackathon, Stage, Visión, ABC, B2B, BitcoinOnly). Se armaron antes del setup nuevo de seis escenarios. Ignorarlos.
- **Las asignaciones de gente y charlas a escenarios/horarios no son reales.** Nunca las informó.
- **Los tiers se borraron.** Rodolfo los había cargado pero desaparecieron; lo va a revisar él. (11/9: mientras tanto, el artefacto ahora deja asignar tier directo desde ahí a quien no lo tenga, sin depender del excel.)
- Lo único que sí vale como dato real: **los nombres, los datos de contacto/perfil, y los temas propuestos**. Y que "algunas personas irán en tier 1", pero eso no está reflejado en la app.

## Regla fija de sincronización (pedido explícito de Rodolfo, 10/9/2026)

Cuando se vuelve a bajar la data de la app para actualizar la base local:

- **Nunca borrar automáticamente a alguien que ya estaba cargado**, aunque haya desaparecido de la app en la nueva bajada (baja real, rechazo, limpieza de spam del lado de la app, o error de la propia sincronización — no se puede saber con certeza desde acá). En vez de eso: dejarlo en la base tal cual estaba, agregarle un flag/badge visible de alerta (en el artefacto: "Ya no aparece en la app"), y avisarle a Rodolfo en el resumen de novedades para que decida él.
- Los postulantes genuinamente nuevos sí se agregan (sin tier, marcados como recién llegados).
- Esta regla ya se aplicó en dos sincronizaciones (10/9: 4 altas, 5 "ausentes"; 11/9: 9 altas, 1 "ausente" nuevo) y Rodolfo confirmó que es el comportamiento que quiere de acá en adelante — no es solo lo que pasó esa vez.

## Backups (pedido explícito de Rodolfo, 10/9/2026)

Preocupación: que un error mío tocando el código (build.py, escenarios.py, etc.) borre o corrompa datos ya definidos. Por eso, además del backup general del pipeline (código + datos + artefacto generado), se mantiene un **backup separado que es solo datos** — `labitconf-datos.zip` (data.txt, xdata.txt, tiers.json, escenarios_sugeridos.json, similar.json, excel.json, excel_full.json, live_speakers.json, y los dos docs narrativos en markdown) — para que lo ya decidido esté protegido incluso si algo sale mal editando código. Se reenvía por chat cada vez que cambian los datos. El pipeline en `/home/claude/labitconf` también tiene un repo git local (desde el 10/9) con commits después de cada cambio importante, como red adicional para poder revertir.

## Pendiente de confirmar con Rodolfo

- Si la app es propia del equipo o de terceros.
- Si "Importar Form" trae solo las postulaciones del CFP cuando cierre (15/9/2026).
- Si conviene alinear el vocabulario de estados de los docs al de la app.
