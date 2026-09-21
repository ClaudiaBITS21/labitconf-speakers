## 12. Alcance (X/YouTube) de los EXTERNO de peso alto + mejoras a la vista compacta de la grilla (16/9/2026)

**Alcance faltante — Maslatón y compañía.** Rodolfo preguntó por qué tantos speakers no tienen "alcance" calculado, usando a Carlos Maslatón como ejemplo puntual (¿no se los pudo encontrar? ¿fue por no tener @ cargado?). La causa real no era de búsqueda: `xdata.txt` (el archivo que trae los seguidores de X/YouTube para calcular el alcance) históricamente solo se completó para los 106 speakers originales que vinieron del CFP — cualquiera sumado después como invitado directo a la grilla (EXTERNO) o en una sincronización posterior nunca pasó por esa etapa, sin importar si tenía @ cargado o no. Se investigó y cargó el alcance real de los 7 EXTERNO/NUEVO de **peso alto** que estaban en ese hueco: Maslatón (406.3k), Saifedean Ammous (423.5k), Santi Siri (148.4k), Lunaticoin (66.5k — de paso se corrigió un handle viejo mal cargado, `lunaticoin_` con guión bajo estaba suspendido, el real es `lunaticoin`), Alberto Mera (23.6k), Maximiliano Firtman (29.1k), Daniel Rabinovich (25.8k). Seba Cordero (739 seguidores) también se completó, pero queda marcado como BRECHA esperable: su peso es institucional/curatorial, no de alcance de audiencia. `xdata.txt` pasó de 106 a 114 líneas.

**Pendiente, todavía sin resolver:** quedan 124 speakers sin alcance calculado (64 peso "ni", 30 "baja", 29 "media" — el peso "alta" restante es Rodolfo mismo, excluido a propósito). Se le preguntó a Rodolfo si conviene completarlos también y no contestó todavía porque pasó directo al pedido de la grilla — sigue abierto.

**Mejoras a la vista compacta de la grilla** (pedido explícito de Rodolfo, cinco puntos + dos ajustes que pidió sobre la marcha viendo el resultado):

- Colorcito suave en cada celda de la vista compacta: gris cálido si está vacía, verde suave si tiene algo — de un vistazo se ve cuánto queda libre.
- Cuando una tarjeta tiene varios speakers, sus nombres van uno al lado del otro separados por coma (ya no como chips independientes que ocupan mucho lugar).
- El título de la tarjeta ahora entra hasta en 2 líneas en vez de cortarse con "...".
- Ajuste que pidió después de ver la primera versión: en vista compacta **no** se muestra el texto de detalle de las alertas (duración pedida distinta, choque de idioma, falta definir tipo/moderador) para que la celda no crezca — en cambio la tarjeta se pinta de rojo con un ⚠ chiquito, y el detalle completo aparece en el popup al pasar el mouse.
- Nuevo popup al pasar el mouse sobre cualquier tarjeta (compacta o no): título, día/hora/escenario, cargo/empresa/país de cada speaker, tipo de charla, moderador y el aviso de duración si corresponde.
- Nuevo botón "Elegir columnas": tapa/muestra escenarios para ver más anchos los que se están trabajando en el momento.
- Nuevo: cada tarjeta tiene un ⏱ con la duración actual (franjas de 30 min); tocándolo se puede cambiar directamente sin pasar por el sheet, validando que las franjas nuevas estén libres.
- Reordenamiento pedido sobre la marcha: los totales de charlas/franjas libres por escenario (que antes eran dos tablas grandes arriba, una por día) ahora van al lado del nombre de cada escenario en el encabezado de la grilla de ese día mismo (formato "Escenario (charlas/libres)"); arriba de todo solo queda una barra horizontal angosta con el total combinado de los dos días, para liberar espacio.

Publicado como Versión 52 (y ajuste de color, Versión 53) del artefacto. Pipeline actualizado y reenviado (zip).

## 13. Sync 16/9: se confirma resuelto el bug "Sin temas" de la app — charlas restauradas e importadas

**Confirmado: el bug de la sección 11 (todos los speakers aparecían con temas vacíos en la app) fue del lado de la app y ya se resolvió.** Rodolfo avisó "Volvieron las charlas al listado base. Podés importarlas". Se volvió a bajar la base completa desde el navegador (`labitconf_speakers_cache_v2`, la cache nueva de la app — la vieja `labitconf_state_cache` había quedado desactualizada y conviene preferir la v2 de acá en más) y se reconciliaron las 214 postulaciones frescas contra los 238 speakers existentes en `data.txt`.

Resultado del sync:

- **36 charlas** con título/abstract actualizado o completado por primera vez (16 de ellas eran altas de la sección 11 que todavía no tenían charla cargada).
- **13 identidades reveladas** (la app mostró el nombre real donde antes solo había apodo o estaba marcado DUDOSO): Guille Schettino (GuiSchet), Richard Bitzhan, Luis Rodriguez, Juan Soria, Benjamin Barlow, Cinthya Franca, Veronica Alegre, Agostina Macagno, Tracy Loza Maldonado, Paola Eguía Calderón, Claudia Ramirez D'Auria, Nahuel Maeso, Karina Nuñez (Integra).
- **1 speaker nuevo**: Juan José Lizarraga, tallerista de ONG Bitcoin Argentina — "Educación financiera para decidir mejor".
- **4 speakers con charlas que su autor sacó de la app** (además de Fierillo #72 y Cáceres #161, ya conocidos de antes, se detectaron dos casos nuevos): Diego Gurpegui (2 charlas que ya no están) y Ramiro Carnicer Souble (1 charla que ya no está). En los cuatro casos se preservó el listado histórico completo en `data.txt`/`excel_full.json` — nunca se borra a mano — y el chip automático "ya no está en la app ✕" los marca solo.
- **Ajuste a `contacto.py`**: el diccionario `ALIAS` (apodos que el matcher automático no resuelve) se actualizó con los `postulacion_num` frescos del 16/9 — se reconfirma que ese número se renumera por completo en cada sincronización de la app, no es una clave estable, y hay que refrescar `ALIAS` en cada sync o esos matches caen silenciosamente a "ausentes". Además se encontró y corrigió un caso de **postulación duplicada** (Lorena Ortiz apareció dos veces en la bajada: una entrada vieja vacía y una nueva con la charla real, `@LoreBitcoin`) — el matcher por nombre elegía la vacía por ser un match exacto de nombre; ahora `find()` prefiere la postulación con charlas cargadas cuando hay empate/casi-empate con una duplicada vacía.
- `escenarios.py`: 8 `MANUAL` nuevos para las charlas nuevas/reveladas, se mantiene 0 sin clasificar.

Publicado como **Versión 54** del artefacto. Commit en git (push bloqueado por el proxy de la sesión, como siempre — no es la primera vez, es una limitación conocida del entorno).

## Pendiente

- El tier es por speaker; cuando alguien postuló varias charlas con perfiles de escenario distintos entre sí, el tier no dice nada sobre cuál de sus charlas es la que se comprometió — eso lo tiene Rodolfo, no el excel.
- Falta confirmar con Rodolfo si los 13 speakers con identidad recién revelada (sección 13) necesitan revisión de tier/peso ahora que se sabe quiénes son realmente (antes estaban cargados como anónimos/apodo).
- Investigar y tierear a los postulantes nuevos de las secciones 7, 8, 10 y 11 (por ahora solo tienen lo que trae la app; ya se puede asignar tier desde el artefacto).
- Revisar a mano si la charla #194 (PI: ¿Vestigio arcaico...) es en realidad un cuarto integrante del cluster de Propiedad Intelectual.
- Decidir qué hacer con las charlas que sus autores sacaron de la app (Fierillo #72, Cáceres #161 ×2, Diego Gurpegui ×2, Ramiro Carnicer Souble): quedan en la base con chip "ya no está en la app".
- Confirmar interés de Ojeda para el panel de la sección 6 (Rocha ya descartada) y conseguir su abstract completo.
- Los 3 clusters nuevos de la sección 9 y la ubicación de los 13 de la sección 10 son mi lectura, no la de Rodolfo — conviene que los repase, sobre todo "Exchanges, neobanks y DeFi" (agrupa gente con perfiles bastante distintos entre sí) y el caso de Lucia Barreto (#211, sin cluster).
- **Aprendizaje operativo:** antes de reportar "sin cambios" en un re-sync, forzar `location.reload()` y esperar al menos 15 segundos antes de leer `localStorage`, preferir `labitconf_speakers_cache_v2` sobre la cache vieja, y cruzar el resultado contra algo verificable (ej. el máximo `postulacion_num` visible en la propia tabla de la app) en vez de confiar en un solo pull.
- **De la sección 12: decidir si se investiga alcance real (seguidores X/YouTube) para los 124 speakers de peso "ni"/"baja"/"media" que todavía no lo tienen** — se le preguntó a Rodolfo y no respondió todavía.
