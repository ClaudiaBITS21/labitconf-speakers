# Marca ✉ "mail de confirmación enviado" (28/9/2026, artefacto v140–v141)

Rodolfo pasó la lista (nombre | mail) de los speakers a los que ya les mandó el mail de confirmado y pidió un ✉ al lado del nombre en el listado de Speakers y en la grilla expandida (v140). Después pidió dos filtros (v141).

- Implementación: `var MAILSENT={"<si>":"mail"}` embebido justo después de `var GAUTO`, helper `mailSentMark(i)` (span `.mailsent`, verde, tooltip "Mail de confirmación enviado · <mail>"). Se inserta en la fila de la tabla de Speakers (después de `esc(r.n)`) y en `.xsp` de `renderExpanded`. No toca la base (`agenda/`).
- **Filtros (v141):** en `FL`, después de `GEN_AUTO`: `MAILSI` = "✉ SPKR con Mail Enviado", `MAILNO` = "SPKR sin Mail Enviado"; lógica en la función de filtros (`!!MAILSENT[String(r.i)]`).
- **Ojo al publicar:** el CSS agregado en el primer `<style>` del archivo (el del esqueleto, antes de `</head>`) se pierde al publicar — en v140 pasó eso. El CSS va en el segundo bloque `<style>` (el de la página).
- 106 personas en la lista → 105 ids marcados (Niko Seguro = ids 48 y 212, duplicado en la base), 2 sin identificar.
- Matches no obvios: Christopher Shei → 8 Chris Shei; Jorge Luis Osorio Contreras → 62 Luis Satoshi (mail luis21.satoshi); Gonzalo Zaccardi → 69 Gonzaccardi; Sebastian Chuffer → 102 SebaChuffer; Juan Manuel Caceres → 161 Juanma Cáceres; Facundo Poveda → 40 El Bull (Somos Bulls, mail @bulls.com.ar); Alessandro Cecere → 157 elsultanbitcoin (Luxor); Jaqui Aguilera → 75; Ricardo Espinosa → 95; Jeremías Souto → 108; Jonathan Chagerben → 143; Gabriela Battiato → 165; Leonardo Germán Klug → 43.
- **Sin identificar (no marcados, preguntado a Rodolfo):** Jan Marvan (labitcoinf.contact962@aleeas.com — candidato débil: 64 Stallion, República Checa) y Jhon Martinez (jhonontheblocks@gmail.com — candidato débil: 103 Jhon/undercript0).
- En la lista pero con estado raro en la base: Jeremy Almond (21) y Alexandra Navarro (36) figuran `rechazado`; Sebastián Schanz (7) `respaldo`.

## Antecedente: filtro de MAIL probado y revertido (23/9/2026)
Se implementó en v133 (✉ en la tabla + cuatro filtros MAIL_OK/MAIL_NO/MAIL_LISTA/MAIL_FUERA a partir de la planilla LABITCONF-speakers de Matías Mathey, `mail_ok`) y Rodolfo lo dio de baja el mismo día. Commit `6aa18e8` del repo `labitconf-speakers` (revertido por `f9635ef`). Cosas raras de esa planilla que siguen abiertas: fila de Gonzalo Zaccardi corrida una columna; Jeremy Almond y Alexandra Navarro con `mail_ok = si` pero `rechazado`; 12 sin mail cargado (casi todos internacionales en `revision`); Camilo Jorajuria de León duplicado (ids 70/71); la planilla tiene tiers 1/2/3 que se podrían importar.
