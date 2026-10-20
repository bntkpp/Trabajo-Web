# N0 — Sello público de implementación Claude para censo m=6

Hora local consultada inmediatamente antes de crear el commit: **2026-10-19T22:19:49-03:00** (America/Santiago).

Este archivo registra los hashes congelados de la implementación independiente de Claude antes de que termine el censo exhaustivo de m=6 y antes de comparar con la implementación de ChatGPT.

## Artefactos sellados

### Código fuente Claude
`14dfcef8b434baa471b2bc653fcd911ae0a86fc6a6a4d85219cf08519ba8d6a2`

Archivo declarado: `n0_m6_claude.c`.

Estado al sellar: **escrito independientemente desde DEF-CORE; gates m=2..5 aprobados; zip/código de ChatGPT no abierto; censo m=6 ya iniciado pero sin resultado final disponible al momento de solicitar este sello**.

### Manifiesto de congelamiento Claude
`b940966774c77ae9e106faa7a22e0bb68c572e08dd8f32821874fe8af8332e00`

El manifiesto declarado incluye binario, `merge.py`, entorno y salidas de los gates.

## Contexto del protocolo

El preregistro V2 y la implementación independiente de ChatGPT fueron sellados previamente en el commit público:
`b02f53467d829b2dcb178171c5fef8ceb0b26e96`.

La marca temporal autoritativa para este sello es la fecha/hora del commit público de GitHub. La hora escrita arriba es solo la hora local consultada inmediatamente antes de crear este commit.

Orden previsto después de este sello:

1. Claude termina el censo exhaustivo de m=6 con su implementación congelada.
2. La implementación de ChatGPT se ejecuta de forma independiente.
3. Se comparan salidas exactas antes de promover P1 o M_6 a `Certificado exacto`.
