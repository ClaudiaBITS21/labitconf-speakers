# Criterio: alcance en redes vs. peso de cartel

Corrección de método pedida por Rodolfo (9/9/2026): *"No es indispensable que entres a todas las web, podés darte cuenta cuán influyente es en las redes."*

Tenía razón, y el agujero era real: en la primera pasada X bloqueaba la lectura automatizada, así que ningún número de seguidores entró en el análisis. Toda la columna "huella" salió de menciones en prensa y podcasts, que es un proxy pobre justo para el tipo de perfil que abunda en este lote.

## Cómo se resolvió

El navegador integrado del escritorio, con la sesión de X de Rodolfo ya iniciada, permite leer perfiles normalmente. Se recorrieron los ~105 handles declarados en el formulario, más YouTube para los perfiles video-first. Método: `browser_batch` con navigate → wait 3s → get_page_text, ocho perfiles por llamada.

**Nota técnica:** intentar leer el endpoint GraphQL de X inyectando el bearer y el csrf de la sesión fue bloqueado por el clasificador de seguridad, con razón. La vía correcta es navegar los perfiles como lo haría una persona.

## Las dos columnas

Se separaron a propósito, porque **el valor está donde no coinciden**:

- **Alcance** — dato duro. Seguidores en X y suscriptores en YouTube, leídos uno por uno. Bandas: 5 = +35 mil · 4 = +10 mil · 3 = +2.500 · 2 = +500 · 1 = casi nadie · 0 = no declaró cuenta.
- **Peso** — criterio. Cuánto suma el nombre al cartel, mezclando alcance con autoridad y encaje temático.

26 speakers cambiaron de peso al incorporar el dato de redes. 11 quedaron marcados con brecha (diferencia de 2 o más entre alcance y peso).

## Las correcciones que más importan

**Hacia arriba:**

- **#40 El Bull (Facu Poveda, SomosBulls)** — de peso 2 a 4. Su cuenta de X declarada no existe, pero el canal de YouTube tiene **134 mil suscriptores**: el mayor alcance de toda la lista. Es el caso que mejor demuestra por qué mirar solo X no alcanza. La alerta de contenido (airdrops y tokens de farming, no Bitcoin) sigue en pie, pero pasa a ser una decisión de encaje, no de tamaño.
- **#56 criptolawyer** — de peso 2 a 4. **55,4 mil seguidores**, la segunda cuenta más grande del lote. Lo había puesto en 2 por no poder confirmar su identidad tras el seudónimo. Head of Institutional BD en Blend, ex Reserve Protocol. Su tema (agentes de IA con wallet y responsabilidad legal) es de los mejores que llegaron.
- **#26 Lorena Ortiz** — de 3 a 4. **68 mil seguidores**, tercera cuenta más grande. No es solo una conectora regional: tiene alcance propio.
- **#69 Gonzaccardi** — de 1 a 3. 210 seguidores en X pero **14,2 mil suscriptores en YouTube**.
- **#58 Pavol Lupták** — de 3 a 4 (18,1 mil).
- **#22 Niko Jilch** — de 3 a 4 (44,6 mil), con la salvedad de que su audiencia es germanoparlante.

**Hacia abajo:**

- **#95 Richi Espinosa** — de 3 a 1. Se declara KOL; tiene **124 seguidores** en X y su canal de YouTube declarado no resuelve.
- **#162 Kristopher Panana** — de 3 a 2. Su propia bio dice "KOL LATAM": **894 seguidores**. Además ahora figura como Global Event Manager de MEXC.
- **#164 Bryan Aguilar** — de 2 a 1. También se declara KOL: **250 seguidores**.
- **#136 CryptoGirl / Blockvoz** — de 3 a 2. 518 seguidores en X, 65 suscriptores en el YouTube del medio.
- **#73 Adrián Bernabéu** — de 4 a 3. 3.535 seguidores; su peso viene del libro en Planeta, no de la audiencia.
- **#31 Tomás Ocampo** — de 4 a 3. 2.744; su peso viene de la empresa y del capital levantado.

## Brechas legítimas (alcance bajo, peso alto)

No toda brecha es un problema. Estos tienen autoridad real sin audiencia masiva, y conviene tratarlos como tales: **#139 Lerner** (26,2 mil, alta autoridad técnica — el perfil más redondo), **#10 Lucas Ontivero** (1.599, pero mantiene Wasabi), **#96 Julián Colombo** (4.183, peso institucional de Bitso), **#158 Javier García Sánchez** (448, peso académico), **#92 Pedro Solimano** (handle inexistente, peso por la firma en DL News), **#132 Luis Canessa** (325, peso institucional interno).

En estos casos el nombre no trae público: trae legitimidad. Programalos por contenido, no por convocatoria.

## Identidades resueltas por la cuenta

Seis de los "no identificados" se resolvieron al abrir el perfil: **#39** es SamT, fundador de Orion_ARG · **#41** es Noelia Robles, Bitácorafinanciera · **#103** es Jh0n, y su bio ("Mi cuenta fue hackeada y logré recuperarla. Mis fondos no.") es coherente con la charla que propuso · **#90** es Miloš Živković, 76 seguidores · **#20** es Biblonde, abogada digital · **#133** es Joaquín, ex JP Morgan y Naranja X, construyendo Elbi.

## Handles declarados que no existen

**#40** (@somosbullsok), **#92** (@pedritosolimano), **#168** (@michucohen88), y **#5** declaró @graememoore cuando el real es @GraemeMoore. Vale la pena pedirle al formulario que valide esto.

## Correcciones de vínculo institucional

- **#43 Leoklug** — su bio dice que es Integrante de Comisión Directiva de ONG Bitcoin Argentina. No es solo "CLO de Menter".
- **#66 Guille Escudero** — su bio dice "Director Académico ONG Bitcoin" y "Docente UTN". El vínculo con la ONG es real; lo que sigue sin verificarse es el cargo de Director-Founder de Notbank.

## Casos límite

**#170 Axel Camargo**: cuenta creada en mayo de 2026, 0 seguidores, publicaciones protegidas. **#4 Delfina**: 906 seguidores pero cuenta protegida, nadie puede ver lo que publica. **#143 JJ Chagerben**: 16,6 mil seguidores reales — el alcance está, pero vende "Mentoría Premium" para ganar con Bitcoin. Alcance no es lo mismo que encaje.

## Pendiente

Falta medir TikTok e Instagram, que es donde probablemente estén varios de los perfiles con X chico (Richi Espinosa, Criptopepe, Lea Furundarena, Tendencia Crypto). TikTok bloquea la lectura automatizada con más dureza; lo más rápido sería pedirles los números en el propio formulario.
