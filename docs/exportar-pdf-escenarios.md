# Exportar escenarios a PDF (v139, 28/9/2026)

Pedido de Rodolfo: un botón que exporte a PDF horizontal, **una página de alto por escenario**, a partir de la **Vista expandida** de la grilla, eligiendo qué escenarios.

## Qué hace
- Botón **"⤓ Exportar PDF"** en la barra de arriba de la vista expandida (al lado de "🏷 Editar lista de tags").
- Panel con los escenarios agrupados por día (checkbox por escenario, "todos"/"ninguno" por día, conteo de charlas y huecos). Opciones: incluir descripción, incluir huecos, papel A4/Carta. Selección y opciones recordadas en el navegador (`labitconf.pdfsel` / `labitconf.pdfopt`).
- Un PDF con una página por escenario×día elegido, horizontal: escenario · día, resumen, "LABITCONF 2026", tabla Inicio · Fin · Dur. · Título · Descripción · Speakers (empresa) · Mod · Tipo · Nivel · Tags. Huecos en ámbar, filas "(MAIN)" en gris, pie con fecha y "página i de N".
- Ajuste a una página: letra de 9 pt hacia abajo (de a 0,25, mínimo 3,5) hasta que entra en una hoja; si no entra ni a 3,5 pt, exporta igual y avisa. Con la grilla del 28/9 los 14 escenarios entraron en una hoja cada uno.
- Mismos datos que la vista expandida (`resolveDesc` sin las "SIN DATOS SUFICIENTES", `empresaOf`, nivel/`autoNivel`, tags por nombre). No aplica el filtro de tags activo.
- Texto saneado a las fuentes estándar del PDF (sin emojis).

## Técnica
- jsPDF 2.5.2 + jspdf-autotable 3.8.4 (MIT) embebidas en el HTML (~400 KB).
- Funciones: `pdfxCollect(G)`, `pdfxDraw`, `pdfxBuild`, `openPdfExport()`; `renderExpanded` guarda `window._XG=G`.
- Descarga vía capacidad `downloads` (declarada en v139 junto a db, mcp Google Drive y sample).
