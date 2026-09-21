---
title: LABITCONF 2026 — Mapa de grandes temas en debate
---

# Qué es esto

Primer barrido (vía research web, septiembre 2026) de los grandes temas que están en debate real en el ecosistema hoy, independiente de qué charlas ya estén propuestas. La idea es cruzar esto contra el pool de postulaciones a medida que entren, para detectar qué está cubierto y qué es un hueco real. Es un primer corte — Rodolfo conoce el ecosistema mucho mejor que cualquier búsqueda, así que esto es material para corregir, no un diagnóstico cerrado.

**Pendiente:** Rodolfo tiene su propio listado (desordenado, chico) de temas que le resultan interesantes, y lo va a pasar antes de mandar los nombres de speakers. Cruzar ese listado contra este documento apenas llegue.

## Sobre las fuentes

Rodolfo marcó que Twitter/X es clave para lo que está "caliente" en el ecosistema en tiempo real, y prefiere fuentes como Bitcoin Magazine, Criptonoticias, Diario Bitcoin y Cointelegraph. **Limitación real:** no tengo un conector de Twitter/X habilitado en esta sesión (no apareció ninguno relevante en el registro de conectores) — mi research hoy vino de búsqueda web general, no de X. Si hace falta lectura real de X, la alternativa es que use el navegador (Claude in Chrome o el navegador integrado) para entrar directo a twitter.com/x.com, aunque con las limitaciones propias de leer X sin API (login, scroll, contenido dinámico). Para las próximas rondas de research puedo priorizar explícitamente Bitcoin Magazine, Criptonoticias, Diario Bitcoin y Cointelegraph como fuentes preferidas.

# Temas técnicos/filosóficos del protocolo (Orange Pill ↔ Workshop+Coders)

Cuatro frentes de debate activos en 2026, todos con el mismo patrón de fondo: **conservadurismo descentralista vs. expansión de capacidades.**

- **BIP-110 y datos on-chain:** si Bitcoin debería restringir datos arbitrarios embebidos en transacciones. Bando restriccionista (Adam Back, Jameson Lopp, Michael Saylor) lo ve como spam que aleja a Bitcoin de su propósito; el bando contrario lo ve como censura. Señalización de mineros muy baja (~2% a julio 2026) — adopción incierta.
- **Covenants — OP_CTV vs OP_CAT:** cuánta programabilidad debería ganar Bitcoin. OP_CTV es expansión acotada (bóvedas simples, con cliente de activación y timeline 2027); OP_CAT habilita covenants recursivos pero con superficie de seguridad mayor y sin parámetros de activación definidos aún.
- **eCash hard fork (Paul Sztorc):** reclama la continuidad con el whitepaper original de Satoshi, pero reasigna ~500.000 monedas dormidas — genera fricción con instituciones (Fidelity lo objetó). Tensión entre fairness del snapshot 1:1 y habilitar infraestructura tipo Drivechain.
- **Resistencia cuántica (BIP-360):** pasó de amenaza abstracta a urgente tras investigación de Google (marzo 2026) que bajó la estimación de qubits físicos necesarios. Implica migrar ~32% del supply (6.9M BTC) de direcciones expuestas — la rotación de claves coordinada más grande de la historia de Bitcoin, todavía sin arrancar.

Estos cuatro dan para Orange Pill (el debate filosófico de fondo: ¿cuánto cambio tolera Bitcoin sin dejar de ser Bitcoin?) con contraparte técnica natural en Workshop+Coders (qué significa cada propuesta en términos prácticos/de implementación).

# Soberanía individual en la era institucional (Orange Pill)

Con bancos, tesorerías corporativas y reservas estatales entrando al espacio, el debate de fondo es si Bitcoin sigue siendo una herramienta de soberanía personal o si esa promesa se diluye con la institucionalización. Es un tema que ya se está tratando en el circuito (panel "Is Bitcoin Still A Sovereign Tool?" en Bitcoin 2026, Las Vegas) — con voces enfrentadas entre la vertiente libertaria/privacidad (Matt Odell, Luke Rudkowski) y la institucional (Bruce Fenton).

# IA — temas generales, no atados obligatoriamente a Bitcoin/cripto (Visión)

Rodolfo marcó algo importante: en Visión, la IA no tiene que estar siempre atada a Bitcoin/cripto. Temas de IA como tal, independientes de cualquier ángulo cripto, en debate para 2026:

- **Modelos chinos open-source ganando terreno** (DeepSeek R1, familia Qwen de Alibaba) frente a los propietarios de EE.UU. — la brecha de capacidad se achicó de meses a semanas.
- **Batalla regulatoria EE.UU.:** conflicto entre gobierno federal y estados por quién regula IA; la ley de IA de frontera de California probablemente enfrente desafíos legales.
- **Comercio agéntico:** chatbots y agentes autónomos rediseñando el shopping — proyecciones de USD 3-5 billones anuales en comercio agéntico para 2030 (Google, OpenAI ya integrando compras).
- **Descubrimiento científico con IA:** sistemas que combinan LLMs con algoritmos evolutivos (ej. AlphaEvolve de Google DeepMind) mostrando avances en resolver problemas no resueltos.
- **Responsabilidad legal emergente:** cortes empezando a lidiar con responsabilidad de empresas de IA por outputs dañinos de chatbots, difamación por información falsa, cómo responden las aseguradoras al riesgo de litigios.

Este ángulo (IA general, sin filtro cripto) también da para Visión y probablemente sea más rico que limitarse solo a la intersección Bitcoin+IA.

# Bitcoin + IA / "economía de máquinas" (Visión — ángulo específico de cruce)

Tesis en auge: los agentes de IA van a necesitar una capa de pago propia — Bitcoin/Lightning como riel para transacciones máquina-a-máquina, 24/7, sin fricciones de onboarding humano (un agente no necesita tutorial ni le asusta guardar una seed phrase). Pero hay escepticismo real y documentado: la mayoría de las empresas todavía usan APIs centralizadas, y los intentos de infraestructura de pagos agénticos generaron "poca actividad comercial concreta" — la narrativa va más rápido que la demanda real. Esto da para un panel con tensión genuina (hype vs. escepticismo), no solo entusiasmo unánime.

# Perfil del usuario y adopción LATAM (ABC / posible cruce con Orange Pill)

Tres perfiles de usuario cripto identificados en la región para 2026: el ahorrista digital (protección contra inflación, cobra sueldo en Bitcoin/stablecoins), el gestor de tesorería corporativa (pymes usando cripto para pagos internacionales sin depender de la banca tradicional), y el innovador institucional (bancos/tokenización, reduciendo costos de emisión). LATAM superó USD 730 mil millones en transacciones cripto en 2025, creciendo más rápido que EE.UU.; El Salvador como referencia regulatoria.

**Nota de cautela:** el ángulo de tokenización/tesorería institucional se solapa con lo que Rodolfo ya dijo que NO quiere competir de lleno en el escenario Business (por el evento de fintech de 5.000 personas el día antes — ver contexto-general.md). Si se usa este tema, probablemente rinda mejor en ABC (perfil ahorrista/adopción de a pie) o Orange Pill (la pregunta de fondo sobre soberanía) que en Business.

# Cómo usar este documento

A medida que entren postulaciones (formulario + las que Rodolfo vaya tirando de memoria), cruzar cada una contra esta lista: si varias charlas caen en el mismo tema, hay sobrecobertura; si un tema de esta lista no tiene ninguna charla asociada, es un hueco a salir a buscar activamente (sourcing dirigido, no solo esperar a que llegue por el formulario).

Sources:
- [Bitcoin Fork August 2026: BIP-110, eCash, Covenants and the Quantum Clock](https://aminagroup.com/research/bitcoin-fork-august-2026-bip-110-ecash-covenants-and-the-quantum-clock/)
- [Is Bitcoin Still A Sovereign Tool? — Bitcoin 2026](https://bitcoinmagazine.com/conference/is-bitcoin-still-a-sovereign-tool)
- [AI Agents and Crypto: The Machine Economy Thesis — CoinDesk](https://www.coindesk.com/markets/2026/05/08/ai-agents-could-solve-crypto-s-user-problem)
- [Nuevas tendencias cripto: quién es el usuario digital en El Salvador y Latinoamérica en 2026 — Infobae](https://www.infobae.com/el-salvador/2026/07/09/nuevas-tendencias-cripto-quien-es-el-usuario-digital-en-el-salvador-y-latinoamerica-en-2026/)
- [What's next for AI in 2026 — MIT Technology Review](https://www.technologyreview.com/2026/01/05/1130662/whats-next-for-ai-in-2026/)
