# Filtro de MAIL en el artefacto (23/9/2026)

Pedido de Rodolfo: sumar al listado de speakers el estado de mail y un filtro de MAIL, tomando de la planilla **LABITCONF-speakers** (Google Sheets, dueño Matías Mathey, hoja de speakers con gid 1070281154) los que tienen `si` en la columna `mail_ok`.

## Qué trae la planilla
- La hoja de speakers tiene **60 filas** con esquema `postulacion_num, nombre, apellido, confname, tipo, cargo, pais, idioma, mail, website, foto, whatsapp, telegram, signal, linkedin, x, instagram, github, nostr, empresa, notas, bio, eventos_anteriores, primera_vez, disponible_podcast, trae_empresa, dias_asiste, disponible_desde, disponible_hasta, temas, temas_estado, estado, oct29, oct30, oct31, nov1, landing, mail_ok, landing_ok, tier`.
- Esa numeración **no es la de la app** (la app va por `postulacion_num` con 238 registros). Es una lista curada aparte, más corta.
- **Los 60 ya estaban en la base del artefacto** (246 registros): no hubo altas de personas. El cruce se hizo por nombre/apellido/confname con Jaccard >= 0.5 y revisión manual de los casos de un solo token.
- Casos que había que desempatar a mano: Christopher Shei (`@Chris`) -> Chris Shei (id 8), no Chris Guida; Camilo JdL -> Camilo Jorajuria de León (id 70).

## Cómo quedó implementado (v133 del artefacto)
- Tres mapas embebidos junto a `var GAUTO`: `MAILLISTA` (los 60 ids de la planilla), `MAILOK` (los 41 con OK) y `MAILADDR` (mail declarado, 49 ids).
- Helpers `mailState(r)` -> `"si"` | `"no"` | `null` (null = no está en la lista), `mailIsAuto(r)`, `mailAddr(r)`, `saveMailOk(si,val)`, `mailMark(r)`, `mailSelHtml(r)`/`wireMail(el,r)`, `mailCounts(rows)`, `mailCountHtml(c)`.
- **Override manual** en `agenda/<si>.mailok` (`"si"` / `"no"`), preservado por `baseBody()`, igual que género/tier/# WEB. Se cambia desde el selector "Mail" en la cabecera de la ficha, que además muestra el mail como link `mailto:`.
- **Marca ✉** al lado del nombre en la tabla (verde = OK, ámbar punteado = en la lista sin OK, nada = fuera de la lista).
- **Filtros nuevos** en `FL`: `MAIL_OK`, `MAIL_NO`, `MAIL_LISTA`, `MAIL_FUERA`. Los conteos del desplegable salen solos.
- **Conteo** en el bloque grande de totales de Speakers: "N con mail OK · N en la lista sin OK · N fuera de la lista".
- Hecho parcheando el HTML publicado, como los cambios anteriores. Si se regenera desde `build.py` hay que portarlo.

## Cosas raras encontradas en la planilla (avisadas a Rodolfo)
1. **Fila de Gonzalo Zaccardi (num 55) está corrida una columna a la derecha** desde `cargo`: el valor de `cargo` termina con una barra invertida y rompe el parseo. Su `mail_ok` real es `si` (aparece en la columna `landing_ok`) y su mail real es `gonzalo@gonzaccardi.com`. Se corrigió a mano al armar los mapas; **hay que arreglarlo en la planilla**, no en el artefacto.
2. **Dos speakers con `mail_ok = si` pero `estado = rechazado`**: Jeremy Almond (num 22) y Alexandra Navarro (num 38).
3. **19 de los 60 no tienen OK**, y 12 de esos tampoco tienen mail cargado en la planilla (Niko Jilch, Giovanni Santostasi, Alex von Frankenberg, Javier Bastardo, Julian Liniger, Chris Guida, Tomás Ocampo, Richard Byworth, Fran Strajnar, David Zell, Giacomo Zucco, Filippo Farenga) — casi todos internacionales en estado `revision`.
4. **Huecos y desorden en `postulacion_num`**: faltan 2, 14, 28, 57; el 49 aparece después del 56.
5. **Camilo Jorajuria de León está duplicado en la base del artefacto** (ids 70 y 71, el segundo marcado "(duplicado)") — anterior a este cambio, pero conviene resolverlo.
6. La planilla tiene **tiers cargados** (1/2/3) para casi todos; el artefacto maneja los suyos propios (N1/N2/N3) en `agenda/<si>.tier`. No se tocaron. Si Rodolfo quiere, se pueden importar.
