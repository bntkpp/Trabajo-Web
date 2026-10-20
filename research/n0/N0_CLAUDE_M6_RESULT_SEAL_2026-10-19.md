# N0 — Sello público del resultado exhaustivo m=6 de Claude

Hora local consultada inmediatamente antes de crear el commit: **2026-10-19T22:51:37-03:00** (America/Santiago).

Este archivo registra el resultado exhaustivo de m=6 producido por la implementación independiente de Claude, después del sello previo del preregistro V2 y de ambas implementaciones.

## Artefactos

### Informe principal del censo Claude
`fad4133a9058cf5372cf0b42a6f2235e2ae00e9a9578bacecbe80c835c04061e`

Archivo: `N0_M6_CENSO_CLAUDE_RESULT_2026-10-19.md`.

### Salida agregada del censo
`5715bb3c7dbc03a7728c2188bd421772a0756e501075278220721da66f290c86`

Archivo: `RESULT_m6_claude.txt`.

### Lista de las 52 palabras con rho = 20
`5458b8a1bcee93b7b2581512242c94ffad3d566b15797ef179714ed31347b623`

Archivo: `rho20_words_claude.txt`.

### Paquete recibido de Claude
`68ecec4e08eca763dbf122f70851c2a1e595f31a1ded619c7247f838a8b02e03`

Archivo recibido: `N0_PAQUETE_M6_CLAUDE_2026-10-19.zip`.

## Resultado declarado

- Cobertura: `137438953472 = 2^37` palabras.
- BRIDGE-SLACK-P1 en m=6: `sec_cnt = 173814248`, `sec_max = 19`, `sec_viol = 0`.
- Máximo global: `rho_max = 20`.
- Palabras con `rho = 20`: `52`.
- Estado en este punto: **Observación exhaustiva preregistrada**, todavía no `Certificado exacto` hasta reproducir el censo con la implementación independiente de ChatGPT y comparar las salidas.

## Trazabilidad previa

Preregistro V2 + código ChatGPT sellados en commit:
`b02f53467d829b2dcb178171c5fef8ceb0b26e96`.

Código y manifiesto Claude sellados en commit:
`0340e11d27fb904db88a72d80b80de13cfe42236`.

La marca temporal autoritativa de este resultado es la fecha/hora del commit público de GitHub.