# N0 — Auditoría ChatGPT del censo M7

Fecha: 2026-10-23

## Veredicto

**PASS — M7 queda auditado para habilitar M8.**

Estatus científico: **Observación exhaustiva por una implementación — pendiente de reproducción independiente.** No promover todavía a **Certificado exacto**.

## Fuentes congeladas

- commit preregistro/código: `74cf2e26549902ffb1ea33767e21d033f8fbab30`
- V2 SHA: `9067a955523403aa92f3c6f09e7afe23e941953c2ca68517237e7dd6d43b0f03`
- A1R1 SHA: `9e15cbbcfcb7ca7e43476f7ec27621e9689b0d2ef973766a4a765b5308de420d`
- ZIP resultados M7+pre SHA: `372952e4c8c0f7e96b2d610777bab965961c3a8a6d600d082834a88cef2768f0`

El manifiesto vuelve a dar OK para `censo.c`, `brute.c` y `run_censo.sh`.

## PRE

`REGRESION.txt` termina en `PRE OK`.

Conteos poda/fuerza bruta registrados:

- m=2: 16 extremales, minW=1
- m=3: 52 extremales, minW=2
- m=4: 60 extremales, minW=3
- m=5: 44 extremales, minW=4
- m=6: 52 extremales, minW=5

En todos: `cobertura_ok=1`, `falsadores=0`. El script congelado compara las listas de poda y fuerza bruta antes de emitir `PRE OK`.

Control plantado m=5: `falsadores=44`, exactamente la predicción congelada.

## M7

`RESULT_m7.txt`:

```text
BUILD=PRIMARIO m=7 N=43 nodos=895483891 podadas=895483756 cobertura_ok=1 falsadores=0
rc=0
```

`fal7.txt` está vacío.

### Cobertura recalculada

Número de hojas:

```text
(895483891 + 1 - 895483756)/2 = 68.
```

Usando toda la distribución de podas por profundidad:

```text
sum_k podadas_k * 2^(43-k) + 68
= 8796093022208
= 2^43.
```

Así, el árbol cubre exactamente todas las palabras de longitud 43.

Como las ramas podadas tienen `W>=7`, las hojas restantes tienen `W<7`, y `falsadores=0` significa que ninguna tiene `W<6`, resulta `W>=6` para todas las palabras de m=7. Por DEF-CORE, `rho<=23`.

Junto con la cota inferior demostrada `LB-V216`, `M_m>=3m+2` para todo m, se obtiene `M_7=23`.

La igualdad sigue etiquetada como observación exhaustiva por una implementación + cota inferior demostrada, no como certificado exacto.

## Integridad post-corrida

`POST_BINARIOS.txt` da OK para los tres binarios.

SHA `POST_BINARIOS.txt`:
`c2e52154ca3b4197917f3fb9794945927a930e7a879e6819910f5ab69f9f3ba4`.

Hashes rechecados:

- `RESULT_m7.txt`: `bd12d9bda627e3514cddfd2d520138e26e9a3c98af4facc62302e54411dfeb48`
- `fal7.txt`: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
- `SHA_HOLDOUT.txt`: `8ffdaaf6a8feea6cc6eaa6d574a05c8fdbcd05d6c08462b849cfa713ffe56c91`
- `SHA_BINARIOS.txt`: `3ae04a9c0b10ffa58034baa51061d1d2083ac711ec07269b177b2f5d402c7516`

Los cuatro coinciden con `SHA_SALIDAS.txt`.

## Holdout R_m

No se abrieron ni inspeccionaron `HOLDOUT_ext7.txt` ni `HOLDOUT_stats7.txt`; solo se vio `SHA_HOLDOUT.txt`. Su identidad sigue sellada. El conteo 68 sí es conocido, conforme A1R1.

## Decisión

Se crea `M7_AUDITADO.txt` y se autoriza M8 con el mismo código sellado. Si cambia cualquier fuente o binario, este gate deja de aplicar.

Esta auditoría no sustituye la segunda implementación independiente exigida para **Certificado exacto**.
