# Exportar escenarios a PDF (v139, 28/9/2026)

Pedido de Rodolfo: un botón que exporte a PDF horizontal, **una página de alto por escenario**, a partir de la **Vista expandida** de la grilla, eligiendo qué escenarios.

## Qué hace
- Botón **"⤓ Exportar PDF"** en la barra de arriba de la vista expandida (al lado de "🏷 Editar lista de tags").
- Abre un panel con los escenarios agrupados por día (checkbox por escenario, "todos"/"ninguno" por día, conteo de charlas y huecos). Opciones: incluir descripción, incluir huecos, papel A4/Carta. La selección y las opciones se recuerdan en el navegador (`localStorage` `labitconf.pdfsel` / `labitconf.pdfopt`).
- Genera **un PDF con una página por escenario×día elegido**, horizontal. Por página: nombre del escenario · día, resumen (N charlas · horario · N huecos), "LABITCONF 2026", y tabla Inicio · Fin · Dur. · Título · Descripción · Speakers (empresa) · Mod · Tipo · Nivel · Tags. Huecos en ámbar; las filas "(MAIN)" (charla a dos columnas repetida) en gris. Pie: fecha de generación y "página i de N".
- **Ajuste a una página:** prueba tamaños de letra de 9 pt hacia abajo (de a 0,25, mínimo 3,5) hasta que la tabla entra en una sola hoja. Si ni a 3,5 pt entra, lo exporta igual (ocupa más de una hoja) y lo avisa en el toast. Con la grilla del 28/9 los 14 escenarios (7 por día, incluida La Crypta) entraron todos en una hoja; los más cargados (Pastilla, 17–18 charlas con descripción) quedan en letra chica pero legible.
- Mismos datos que la vista expandida: descripción por `resolveDesc` (las "SIN DATOS SUFICIENTES" se omiten), empresa por `empresaOf`, nivel explícito o `autoNivel`, tags por nombre (sin emoji). **No** aplica el filtro de tags activo: exporta todo el escenario.
- Texto saneado a las fuentes estándar del PDF (sin emojis; comillas/rayas tipográficas a ASCII).

## Técnica
- Librerías embebidas en el HTML (no hay CDN): **jsPDF 2.5.2** y **jspdf-autotable 3.8.4** (MIT), ~400 KB → el HTML pasó de ~1,6 a ~2,1 MB.
- Funciones: `pdfxCollect(G)` (misma lógica de charlas+huecos que `renderExpanded`), `pdfxDraw`, `pdfxBuild`, `openPdfExport()`. `renderExpanded` guarda `window._XG=G`.
- La descarga pasa por la capacidad **`downloads`** del artefacto (declarada en v139 junto a db, mcp Google Drive y sample): el navegador pide confirmar antes de guardar `LABITCONF-2026-escenarios-AAAAMMDD.pdf`.
