# Importación de postulantes nuevos — 29/9/2026 (artefacto v143 → v146)

**⚠ Pisada por otra sesión (29/9, tarde):** otra sesión de Rodolfo publicó la v145, que agregaba en Orden web el botón "✕ Sacar los que no están en la grilla" (`wonogrid`, `.nogrid`), pero la armó sobre la v142 y se borraron los datos de v143/v144 (Rodolfo vio a Kassis sin charlas). En la v146 se volvieron a aplicar los cambios de datos (scripts `build3.py` + `build4.py` sobre la versión viva) y quedó el código de la v145. **Regla: antes de publicar, leer siempre la versión viva y fusionar; no publicar desde una copia local vieja.**

## v143: desde el Excel
**Contexto:** a la mañana la app de postulaciones (app-labitconf.github.io) no cargaba desde el backend: el Apps Script (`GAS_URL` …AKfycbwe2LgP…/exec) contestaba 404 "No se encontró la página". A la tarde volvió a andar (misma URL). Rodolfo exportó un Excel (`speakers_labitconf2026_temas.xlsx`, hoja Speakers, 309 filas, una por tema; columnas Nombre, Apellido, Apodo, Estado, País, Tier, Tema, Descripción, Estado Tema — sin mail, redes, cargo, bio ni nº de postulación). Las filas sin nombre son temas adicionales del speaker de arriba.

- **Nuevos (ids 241–247):** Gaucho (241), Sergio Omar Aguilera (242), Marcelo De Vincenzi (243), Raúl Marino (244), Rodolfo Giro (245), Mariquena Otermin (246), Vincent Pinto (247). Todos `disponible`, sin tier, flag NUEVO.
- **Fusionados con fichas manuales de la grilla (mismo id de extras):** Tomi Cristal (513), Andrés Galvis (519), Gilberto León Santamaría (510), Álvaro Echazú → "Paisanos x 2" (518).
- **Agustín Kassis (502):** + 2 charlas (LaWallet NWC; "Bitcoiner o Inversor de BTC?").
- Resto del Excel: todas las personas y charlas ya estaban en la base.
- **Nombres reales** agregados al nombre en la base: Carmen = Carmen Rodríguez (61); Stallion = Jan Marvan (64); Capitán del Escabio = Santiago Nehuen Andrade Messali (78); AndyCreeed = Andy Chapo (85); Achachilabtc = Alfredo Carrillo Mendoza (89); Serch Jacobo = Sergio Jacobo (101); Jhon (undercript0) = Jhon Martínez (103); Joaco (Elbi) = Joaquín Giorgis (133); Tendencia Crypto = Germán Welchli (148); elsultanbitcoin = Alessandro Cecere (157); El Bull = Facundo Poveda (40); Gonzaccardi = Gonzalo Zaccardi (69); SebaChuffer = Sebastián Chuffer (102); Luis Satoshi = Jorge Luis Osorio Contreras (62). Jan Marvan (64) y Jhon Martínez (103) pasaron a `MAILSENT`.

## v144: completados con los datos de la app
Con la app de vuelta, se bajó la hoja Speakers entera (`fetchSpeakersRaw()`, 246 registros, columnas nuevas `tier` y `web_order`) y se completaron los 12 de arriba (ids 241–247, 510, 513, 518, 519 y Kassis 502): cargo, empresa, handle X, web, WhatsApp, Telegram, Signal, idioma, días (`dias` solo cuando es un único día), nº de app (`an`), foto (thumbnail 112px), y cada charla con abstract, descripción completa y formato (nivel, formatos, duración, panel). Mail, LinkedIn, Instagram, bio, eventos anteriores, podcast, etc. quedaron en la nota de la ficha.

- **OJO, números de postulación reutilizados:** la app les dio a los nuevos los números 219–230, que ya tenían otros postulantes. No usar `postulacion_num` como clave.
- **Kassis tiene dos registros en la app** (nº 231 y 228). El 228 trae las 2 charlas nuevas + Telegram/Signal/nostr; todo va a la ficha 502.
- **Gaucho (241) es un robot** (Omnibot de 1984 con Raspberry Pi y un LLM), DevRel de **Paisanos**, la misma empresa de Álvaro Echazú. Es una charla aparte, no el segundo de "Paisanos x 2". El CTO de la charla de Álvaro sigue sin identificar.
- Solo viernes 30: Aguilera, Tomi Cristal, De Vincenzi.
- La charla de Santamaría es un panel con Matías Mathey y Gabriela Battiato.
- Raúl Marino (244, ITBA) ≠ Herman Mariño (521).
- Los primeros 234 registros de la app no se re-sincronizaron (el pedido era solo sobre los nuevos).
