# N0 — Preregistro XDELX-V1: G5-EXTREME-DELETE exhaustivo sobre todas las palabras de m = 6

Fecha: 2026-10-22
Autor: Claude
Estado: **Preregistro sin datos de EXTREME-DELETE sobre palabras de m = 6 fuera del puente largo.** Requiere revisión de ChatGPT y sello de Mati antes de ejecutar.

## 0. Contexto y transparencia

- La conjetura es de ChatGPT: `N0_G5_EXTREME_DELETE_EXPLORATORIO_CHATGPT_2026-10-22.md`, SHA `aa400b63…53ed`, sellada en `e42a948d`.
- Auditoría exploratoria de Claude: `N0_G5_EXTREME_DELETE_AUDIT_CLAUDE_2026-10-22.md`, SHA `465d064e…cff8`.
- **Ya visto de m = 6:**
  - todas las palabras de puente largo del sector, en forma exhaustiva: 0 falsadores; el control sin +1 falla 169 veces;
  - recocido adversarial: 0 falsadores.
- **Nunca visto:** el resto de las palabras de m = 6.
- Sigue las correcciones de la auditoría de ChatGPT del 2026-10-22:
  - compilación estricta `-std=c17 -O2 -Wall -Wextra -Werror`;
  - `match.h` reusado y declarado como tal;
  - recuento independiente en Python (§4, C1b).

## 1. Enunciado que se prueba

Definiciones según DEF-CORE: ventanas i = 0..4m, sumas S_i, centro y_i = x_{i+m}, clase (S_i, y_i). Además:
- p = min S y z = L − max S, con δ = p + z y L = 2m+1.
- **Niveles bicolores** ordenados de menor a mayor: h₁ < … < h_I.
- **Ventanas desperdiciadas** (convención fo): ventanas cuya clase ya apareció en una ventana anterior.
- **Grafo G5:** une el nivel bicolor h con la ventana desperdiciada w si existe t con S_t = h y |t − w| ≤ m+1.
- **B_A** = h_{p+1} … h_{I−z−1}, es decir, se quitan los p niveles más bajos y los z+1 más altos.
- **B_B** = h_{p+2} … h_{I−z}, es decir, se quitan los p+1 más bajos y los z más altos.

Un bloque vacío cuenta como cubierto.

**EXTREME-DELETE vale en x** si B_A o B_B admite un emparejamiento en el grafo G5 que cubre todos sus niveles.

**Falsador:** una palabra en la que ninguno de los dos bloques se cubre.

**Implicación (aritmética):** EXTREME-DELETE ⇒ G5 ⇒ W ≥ m−1 ⇒ ρ ≤ 3m+2.

## 2. Dominio

- Todas las x ∈ {0,1}^37 con x₀ = 0: **2^36 = 68.719.476.736 palabras**, repartidas en 64 shards.
- **Reducción por complemento:** el complemento intercambia p con z, invierte el orden de los niveles bicolores e intercambia B_A con B_B. Conserva las ventanas desperdiciadas y las distancias en tiempo. Como la condición es "B_A o B_B", es invariante. Por eso el resultado vale para las 2^37 palabras.

## 3. Medidas y decisión (fijas)

- **P1 = xdel_fail**, el número de palabras falsadoras.
  - **P1 = 0** ⇒ "EXTREME-DELETE sin fallas en todas las palabras de m = 6", con la etiqueta **Observación exhaustiva** (hay un solo implementador).
  - **P1 > 0** ⇒ **EXTREME-DELETE refutado en m = 6**, solo si el primer xdel_witness se confirma con `vxdel.py --gate xdel`, que es Python independiente, sin `match.h`, y debe terminar con exit 0. Si no se confirma, la corrida es **INVALIDA** y no hay decisión.
- **Validez (C3).** Si falla cualquiera de estas condiciones, la corrida no vale:
  - words = 2^36 y 64/64 shards;
  - partición exacta: xdel_fail + only_A + only_B + both = words;
  - thm_viol = 0;
  - ctl_fail ≥ 1, con un ctl_witness confirmado por `vxdel.py --gate ctl`. El control sin +1 tiene que fallar en alguna palabra.
- **Descriptivas:** only_A, only_B y both, es decir, qué orientación sirve.
- **Certificado exacto:** requiere una segunda implementación de una instancia que reciba solo este preregistro y DEF-CORE.

## 4. Controles (si alguno falla, no se corre m = 6)

- **C1 (referencias de desarrollo):** salen de `xdel.c`, que usa el mismo `match.h`, así que este control es de consistencia y no de independencia.

  | m | words | xdel_fail | ctl_fail | thm_viol | only_A | only_B | both |
  |---|---:|---:|---:|---:|---:|---:|---:|
  | 3 | 262.144 | 0 | 69 | 0 | 3 | 31 | 262.110 |
  | 4 | 16.777.216 | 0 | 352 | 0 | 10 | 221 | 16.776.985 |
  | 5 | 1.073.741.824 | 0 | 2.266 | 0 | 68 | 1.711 | 1.073.740.045 |

- **C1b (independencia):** `vxdel.py --census m` recuenta en Python puro, sin `match.h` y con su propio emparejamiento, todas las palabras de m = 3 y m = 4. Tiene que coincidir **exactamente** con el C en words, xdel_fail, ctl_fail, only_A, only_B y both. En desarrollo ya coincidió para m = 2 (ctl 11) y m = 3 (0, 69, 3, 31).
- **C2 (falla plantada):** con `-DPLANT` las dos orientaciones usan el bloque sin +1, y m = 4 tiene que dar xdel_fail > 0.
- **C3:** validez y gates (§3).
- **Salida limpia:** si `salida_xdelx/` ya existe, el script termina con exit 2 sin tocarla.

## 5. Código congelado

| Archivo | SHA-256 |
|---|---|
| `xdelx.c` | `989ad89b0b8b2350120a6509d78010ea7d902cf031eafd8c51276e1763200979` |
| `match.h` (el mismo de G5X) | `0b64bca41969e12f6b8b25fa2fc6e01e378b0bcc0e327714d63e01c2cf80a6a1` |
| `xtools.py` (check, pycmp, planted, merge y regla de decisión) | `8e6cc92d01485b72e0a7320552d0cd3f776a5b4f7dcd6b37279afce00be6c485` |
| `vxdel.py` (verificador y recuento independientes en Python) | `802740f24cf19495e9184e841a8a44e7025cc0399d0f7cd32c1c7c3a42730d89` |
| `run_xdelx.sh` | `ce54726a8c551bf94a2a7ae0fd8a4dd4eb8f7f977d7bb2ea3e0d2d349e057335` |
| `MANIFEST.sha256` | `8c7135c5212bda9e0ce179004113e2c28c3bc19a32c901f21bfe4222dcc5edc2` |

Las pruebas en seco se describen en §6.

**Costo estimado:** parecido a G5X, unas 2 h con 2 núcleos, más unos 7 min del recuento Python de m = 4. Con más núcleos tarda menos. Hay que ejecutarlo desacoplado del límite de 2 h de los procesos en segundo plano.

## 6. Pruebas en seco (copias descartables, con la corrida principal cambiada a m = 4)

- **A, normal:** exit 0.
  - C1 OK en m = 3 y 4; C1b OK, porque el recuento Python independiente **coincide exactamente** con el C en m = 3 y m = 4: [16.777.216, 0, 352, 10, 221, 16.776.985].
  - C2 detectada (352).
  - Merge con partición exacta, gate del control confirmado, DECISION "sin fallas".
- **A2, reejecución sobre la misma carpeta:** exit 2 por SALIDA PREEXISTENTE.
- **B, corrida principal con el binario plantado:** produce 352 fallas XDEL falsas. El gate Python no confirma el testigo: CORRIDA INVALIDA, exit 1, sin decisión.
- **C, sin sello:** exit 2 y no se crea `salida_xdelx`.
- **D, fuente alterada con sello presente:** exit 2 por manifiesto y no se crea `salida_xdelx`.

Las copias no se usarán. No se ejecutó m = 6.

## 7. Qué implica

- **P1 = 0:** EXTREME-DELETE queda verificado en todo el dominio finito m = 6, que se suma a todas las palabras con m ≤ 5, al puente largo con m ≤ 8 y al recocido hasta m = 10. Con eso se deja de buscar conjeturas y el esfuerzo pasa a la prueba de Hall en el bloque central. **No es una demostración.**
- **P1 > 0:** EXTREME-DELETE cae y G5 sigue en pie. El testigo indica qué hay que corregir en la elección de las excepciones.
