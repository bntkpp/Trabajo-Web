# N0 — Preregistro LBENUM-V2: censo exacto de LC1 y LC2 en m = 7 y m = 8

Fecha: 2026-10-21
Autor: Claude
Estado: **Preregistro, sin datos vistos en m = 7 ni m = 8.** Requiere revisión de ChatGPT y sello de Mati antes de ejecutar.
Sustituye a LBENUM-V1 (`3b8ad96c…0842`, no sellado) y a `N0_PREREG_MILP_LC1_V1` (no sellado).

**Cambios V1 → V2** (revisión de ChatGPT `N0_LBENUM_V1_REVIEW_CHATGPT_2026-10-21.md`, SHA `df6f0e51…5460`). Solo hay dos:
- **B1:** el dominio de (δ, p, a, c) queda escrito en §1.
- **B2:** `run_lbenum.sh` aborta después del `merge` de m = 7 y m = 8 si `P4_fail ≠ 0`.

`lb_enum.c` y `lbtools.py` no cambian.

## 0. Por qué

- LC1 (W_core ≥ m−2) y LC2 (W_core = m−2 ⇒ W_ext ≥ 1) están verificados exhaustivamente solo con m ≤ 6 (censo LC12, sellado `9f581ec3`).
- Con MID se vio que lo que vale con m ≤ 5 puede caer con m = 7 (`N0_MID_INTENTO`, 4ea4c3ff).
- m = 7 y m = 8 no se han inspeccionado nunca para LC1 ni para LC2. La única excepción son dos palabras MID con m = 7, que no son de puente largo.

## 1. Método: enumeración estructurada

Toda palabra de puente largo, normalizada con el mínimo antes que el máximo, tiene la forma A U G V C:
- U es una ventana mínima con p unos;
- V es una ventana máxima con z = δ−p ceros;
- |A| = a, |C| = c, a + c ≤ δ (G4);
- |G| = g = 2m−1−a−c.

**Dominio (B1, explícito):**

```text
1 ≤ δ,  2δ ≤ m+1,  0 ≤ p ≤ δ,  z = δ−p,  a ≥ 0,  c ≥ 0,  a + c ≤ δ.
```

Con L = 2m+1, u = a, v = 4m−c, n = v−u, g = 2m−1−a−c y R = L−δ, esto da b = n−R = g+δ ≥ 2m−1: exactamente el puente largo del ensamblaje LC1/LC2. En el código es `for (d=1; 2*d<=m+1; d++)`, con p de 0 a d y a + c ≤ d.

`lb_enum.c` recorre, para cada (δ, p, a, c) de ese dominio:
- todas las U con p unos y todas las V con z ceros;
- todos los G, A y C.

Acepta la palabra solo si, recalculado desde los bits, todas las ventanas están en [p, L−z] y la distancia mínima entre ventanas mínimas y máximas es exactamente n = v−u. Para cada par (palabra, par) aceptado calcula W_core, W_ext y W desde las clases (DEF-CORE) y acumula la tabla `dist δ b W_core W_ext`.

**Convención:** se cuentan pares con el mínimo primero. El complemento es una biyección entre pares con el mínimo primero y pares con el máximo primero, así que el censo de todas las palabras (LC12) da exactamente el doble.

## 2. Desarrollo previo (solo m ≤ 6, ya inspeccionados)

| m | pares × 2 | censo LC12 | tabla `dist` | tiempo |
|---|---:|---:|---|---:|
| 3 | 4.124 | 4.124 | idéntica (29 claves) | < 1 s |
| 4 | 34.004 | 34.004 | idéntica (42) | < 1 s |
| 5 | 1.972.932 | 1.972.932 | idéntica (115) | 0,6 s |
| 6 | 15.101.264 | 15.101.264 | idéntica (141) | 4,3 s |

La falla plantada (`-DPLANT`, que suma 1 a W_core en una configuración) cambia la tabla de m = 5.

## 3. Medidas y decisión (fijas)

Para m = 7 y m = 8:
- **P1 (LC1):** número de pares con W_core < m−2. **LC1 verificado en m** si es 0. **Refutado** si es > 0, y se registra el testigo.
- **P2 (LC2):** número de pares con W_core = m−2 y W_ext = 0. **LC2 verificado en m** si es 0. **Refutado** si es > 0.
- **Descriptivas:** mín W_core, cantidad de casos justos (W_core = m−2), mín W_ext entre los justos, y la tabla completa `dist`.
- **P4 (identidad W = W_core + W_ext):** debe dar 0 fallas. Si no, la corrida no vale.

**Segunda implementación (ChatGPT, independiente y congelada antes del sello):** fuente SHA `2252e7202a0f243de577468e447b1aca01691e64b53fc861c454c2f1f6b41345`, paquete `N0_LBENUM_CHATGPT_INDEPENDENT_PRESEAL_2026-10-21.zip` SHA `359085e4ed434e8867843ab60ef89a3a6b5ec5b51a1a08beada9471d2253e273`. Se escribió antes de abrir `lb_enum.c` y recalcula ρ, W_core y W_ext por cardinalidad de clases, sin usar I ni W_core = b−I_core. En desarrollo reprodujo clave por clave las tablas de m = 3..6, con P1 = P2 = P4 = 0. No se corrió con m = 7 ni m = 8.

**Etiqueta:** si las dos implementaciones dan tablas `dist` idénticas clave por clave en m = 7 y m = 8, el resultado es **Certificado exacto**. Si solo corre una, queda como **Observación exhaustiva**. Si difieren, no se reporta ninguna conclusión hasta explicar la diferencia.

**Orden después del sello:** Claude corre `run_lbenum.sh` y ChatGPT corre su implementación congelada. Ninguno ve los resultados del otro antes de publicar su propia tabla con hash. Después se comparan.

Estimación de tamaño: m = 7, unos 3,7 × 10^9 candidatos (minutos); m = 8, unos 2,5 × 10^10 (decenas de minutos con 2 procesos). m = 9 no entra en este preregistro (más de un día).

## 4. Controles (antes de m = 7; si alguno falla, no se corre m = 7)

- **C1:** reproducir exactamente (× 2) las tablas certificadas de m = 3, 4, 5 y 6 (`ref/censo_m*.txt`). La de m = 6 es la salida agregada sellada `31fb2090…57a`.
- **C2:** la versión con falla plantada no debe coincidir con el censo de m = 5.
- **C3:** P4 = 0 en todos los controles **y en las corridas de m = 7 y m = 8**. Si `P4_fail ≠ 0` después del `merge`, el script aborta y la corrida no vale (B2).

## 5. Implica para la cota maestra

- **LC1 y LC2 verificados en m = 7 y 8:** es la primera evidencia fuera de lo ya inspeccionado, y exhaustiva en esos m. No demuestra LC1 para todo m.
- **Se refuta alguno:** el teorema maestro formalizado (BridgeSlackWeak ∧ LC1 ∧ LC2) no aplica tal cual. Habría que reemplazar LC1 ∧ LC2 por la cota combinada W ≥ m−1 en el puente largo, que se mide en la misma corrida (W = W_core + W_ext). M_m = 3m+2 no queda refutado por eso.
- **Refutación de la cota maestra:** solo si algún par tiene W < m−1, es decir ρ > 3m+2 en una palabra de puente largo. Eso refutaría el teorema y se reportaría de inmediato.

## 6. Código congelado

| Archivo | SHA-256 |
|---|---|
| `lb_enum.c` | `6bd318302847e891804cb6b629e0e4745f50232a2a32ce76178b230533bdd7c9` |
| `lbtools.py` | `9046cfeb4ffb324da459cb3e01adc21c632f082f30652f13fcdaa19b22fffd34` |
| `run_lbenum.sh` (manifiesto, sello, C1–C3, compuerta P4 en m = 7 y 8, 2 procesos por m) | `3bc8810e642c3ec6062d4069bc4769ffc98632f5f650686a36898bb77e9e3aca` |
| `ref/censo_m3.txt` | `71b4f9a77ae221f846b3228ecc9a5bfd0cca2028a0eb4a890084248056537997` |
| `ref/censo_m4.txt` | `63a6ee7da8173df4414286ced7cd3906fd4556d3c3a4735bc2b83db1c6fa9c70` |
| `ref/censo_m5.txt` | `6ad552b48e7f9e85d643600da3bf921bbac2348eeb95cfb7a2b34bf2edaac868` |
| `ref/censo_m6.txt` | `31fb2090fda53a268028ef427bf0c70ca5d3cc5531c1f3b2a83ed562fd93957a` |
| `MANIFEST.sha256` | `6e2446200a5404a2158a698f77d4c4713eb1103a30a5a1a40b6234b40e8b4b37` |
| Implementación ChatGPT (fuente) | `2252e7202a0f243de577468e447b1aca01691e64b53fc861c454c2f1f6b41345` |
| Implementación ChatGPT (paquete) | `359085e4ed434e8867843ab60ef89a3a6b5ec5b51a1a08beada9471d2253e273` |

Guardias probados sin datos y sin la variable de sello: sin sello, salida 2; con código alterado, salida 2 por manifiesto y sin carpeta de salida.
