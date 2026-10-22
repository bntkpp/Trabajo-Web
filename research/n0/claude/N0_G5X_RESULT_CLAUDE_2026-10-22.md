# N0 — Resultado G5X-V2: G5 sin fallas en todas las palabras de m = 6

Fecha: 2026-10-22
Autor: Claude (una implementación)
Preregistro: `N0_PREREG_G5X_M6_V2_2026-10-22.md`, SHA `a56d1b7cd703375d9393d928e29e2e6526b2b3d0244762df4ff9f3ffa5780a1a`. Sellado en `bntkpp/trabajo-web`, commit `8fac7a799b94f13f929ea5555652a3652d776e24` (2026-10-22 01:59:53 −03:00), hijo directo de `fa85f291`. PASS para sellar de ChatGPT sobre el ZIP `77f6ec43…aabe`.
Etiqueta: **Observación exhaustiva**. No es "Demostrado" ni "Certificado exacto".

## Verificación del sello antes de ejecutar

Clon de solo lectura del repositorio:
- el commit `8fac7a79` existe y su padre es `fa85f291`;
- preregistro `a56d1b7c…` y manifiesto `a5ccb41c…` correctos; `sha256sum -c` dio OK en los 5 archivos;
- los 7 archivos sellados son idénticos byte a byte a la copia congelada local.

Se ejecutó una copia de esos archivos sin modificar.

## Incidente (transparencia)

Hubo un primer intento, lanzado desde otra copia limpia del commit sellado. **Lo aborté durante C1 (m = 5), antes de llegar a m = 6.** La razón: el modo en segundo plano de la sesión corta los procesos a las 2 h, y el cómputo estimado era de 1,6 a 2 h.
- Ese intento no produjo ningún shard de m = 6.
- La carpeta quedó archivada como `ABORTADA_controles_limite2h_n0_g5x_v2/` (CONTROLES.txt, ctl_m3, ctl_m4) y no se borró.
- La corrida válida se lanzó desacoplada desde una tercera copia limpia del mismo commit. La guarda B2 (salida preexistente) no intervino porque cada copia era nueva.

## Ejecución

- Entorno: gcc 13.3.0, Python 3.13.16, Xeon 2,10 GHz, 2 procesos.
- Inicio 02:01:13 y fin 03:54:38 (−03:00). m = 6 tomó 6.615 s.
- **Controles:**
  - **C1 OK**, con m = 3, 4 y 5 idénticos a las referencias;
  - **C2 OK**, la falla plantada se detectó (51);
  - **C3 OK**: words = 2^36, 64/64 shards, thm_viol = 0, ctl_fail = 102 ≥ 1, y el gate del control confirmó un testigo desde DEF-CORE;
  - no existe `FALLAS.txt`.

## Resultado

| Medida | Valor |
|---|---:|
| words (x₀ = 0) | 68.719.476.736 = 2^36 |
| need_pos (need > 0) | 32.646.636 |
| **g5_fail** | **0** |
| ctl_fail (radio m) | 102 |
| thm_viol | 0 |
| g5_exact (emparejamiento máximo = need) | 351 |
| histograma de need | 1: 29.732.318 · 2: 2.745.178 · 3: 164.626 · 4: 4.488 · 5: 26 |

Testigo del control, confirmado por `verify.py --gate 6`: `0000000010100101101011111111111110100` (need 3, emparejamiento 2 con radio 6).

**Decisión (§3, fija): G5 sin fallas en todas las palabras de m = 6.** Por el complemento, vale para las 2^37 palabras.

Hashes:
- `RESULT_m6.txt` `fc55c683ff26c46072bd384849f6f8327dce7f49a35f92cfb98bd14b72cc5531`
- `DECISION.txt` `e349c93b…e118`
- `SHA_SALIDAS.txt` `4cf68bc6286d898830d65403dc982545e338f15c1d82a2b5127ec02c934acf04`
- `SHA_BINARIOS.txt` `2e07258b…87fe`

## Lectura

1. **G5 queda verificado en todo el dominio finito de m = 6**, incluido el puente corto, que antes no se había mirado con G5. Junto con la evidencia anterior:
   - todas las palabras con m ≤ 5;
   - todo el puente largo con m ≤ 8;
   - recocido adversarial hasta m = 10.

   G5 no tiene ni una falla conocida.
2. **El borde se mantiene:** con radio m hay 102 palabras que fallan en m = 6; con radio m+1, ninguna.
3. **G5 deja poco margen en algunos casos:** en 351 palabras el emparejamiento alcanza exactamente lo necesario. Es una fuente natural de casos extremos para guiar una prueba.
4. **No es una demostración.** LC1 también se cumplía en todo lo que se miró hasta m = 7 y cayó en m = 8. G5 sigue siendo una conjetura, ahora con evidencia exhaustiva en un dominio completo.

## Pendiente

- **Certificado exacto:** una segunda implementación independiente, de una instancia que reciba solo el preregistro y DEF-CORE, que reproduzca words, need_pos, g5_fail, ctl_fail y el histograma.
- **Ruta teórica:** demostrar G5 en su forma de Hall. Las 351 palabras con g5_exact = 1 son los casos de prueba naturales.
