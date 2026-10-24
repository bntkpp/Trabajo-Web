# N0: auditoría de 𝓡_m V1 y de las reglas de descarga G ≥ 0 V1 (ChatGPT), antes de abrir M7

Auditor: Claude
Fecha: 2026-10-23

Objeto: `N0_RM_G_V1_2026-10-23.zip`, SHA `3c739d28db548c3e4c17a01a03be08f7947ffeb806bc9aad89f8026cdd47756c` (verificado).

El manifiesto interno trae rutas absolutas `/mnt/data/...`, así que `sha256sum -c` falla. Comparé los SHA por nombre de archivo y coinciden los 4.

**Veredicto: PASS de implementación y diseño.** Pero antes de abrir M7 dejo registrada una **predicción en contra**: V1 probablemente falla en m = 7 u 8.

## 1. Reproducción

- **Checker de ChatGPT recompilado** (gcc 13.3, 2 hilos): `DEV_RESULTS.txt` reproducido **idéntico** para m = 2..6.
- **Implementación independiente en Python** (`mine/params.py` y `mine/bcheck.py`): cuenta B, E, R1, R2 y R3 sobre todas las palabras de m = 2 y 3, con una distancia a rampa escrita desde cero (programación dinámica sobre a ≤ b con fase explícita). Coincide con ChatGPT:
  - m = 2: 160 / 8 / 160 / 132 / 132;
  - m = 3: 582 / 26 / 582 / 426 / 426.
- **Revisión del código de `rampdist_one`:** el patrón usa la fase i mod p en lugar de (i−a) mod p. Es equivalente, porque se recorren todos los patrones u no constantes, que incluyen todas las rotaciones. El costo pre1[a] + (mm[b] − mm[a]) + suf0[b] es correcto.
- **Controles negativos, con mis distribuciones independientes en m = 6:**
  - δ ≤ 2 pierde 8 extremales;
  - una banda de ±1 pierde muchas (32 de 52 tienen banda 2);
  - d₅ ≤ 3 pierde 8.

  Los tres controles detectan, así que el gate pasa.
- **GD-DELTA y GD-BAND en desarrollo:** 0 violaciones en las 224 palabras extremales de m = 2..6. El control δ ≥ 3 ⇒ W ≥ m falla en m = 6 (8 extremales con δ = 3), como debía.

## 2. Hallazgo principal: los umbrales están en el máximo de desarrollo, y ese máximo crece con m

Máximo de cada parámetro sobre las extremales (todas las palabras, cálculo independiente):

| m | δ máximo | banda máxima |σG − m| | d₅ máximo |
|---|---|---|---|
| 2 | 2 | 2 | 1 |
| 3 | 2 | 2 | 2 |
| 4 | 2 | 2 | 3 |
| 5 | 2 | 2 | 3 |
| 6 | **3** | 2 | **4** |
| umbral V1 | 3 | 2 | 4 |

Lectura:
- **R2 (banda ±2):** el máximo es estable (2 en todos los m). Es el parámetro más creíble.
- **R1 (δ ≤ 3) y GD-DELTA:** el umbral está exactamente en el valor que aparece por primera vez en m = 6. **Ya pasó una vez:** la fila del ledger EXT-DELTA ("extremales solo con δ ∈ {0, 1, 2}") quedó **refutada** cuando apareció δ = 3 en m = 6. V1 repite el mismo tipo de hipótesis con el umbral corrido en 1.
- **R3 (d₅ ≤ 4):** el máximo crece 1, 2, 3, 3, 4. El umbral es exactamente el máximo de m = 6. Si la tendencia sigue, es probable que en m = 7 u 8 aparezca una extremal con d₅ = 5.

Esto no invalida el preregistro: es una predicción con riesgo genuino, y fallar también es información. Pero hay que leer bien un posible fallo. "Rampa con un número **constante** de defectos" probablemente no es la estructura correcta, y una V2 tendría que tener umbrales que crezcan con m, derivados de algún argumento y no ajustados a cinco puntos.

## 3. Predicción de Claude, registrada antes de abrir M7

- **P-C1:** RM7-COVER o RM8-COVER falla. Hay al menos una extremal de m = 7 u 8 fuera de 𝓡_m, más probablemente por R3 (d₅ ≥ 5) o por R1 (δ ≥ 4).
- **P-C2:** si falla por R1, el mismo testigo refuta también GD-DELTA en m = 7 u 8.
- **P-C3:** R2, la banda ±2, se mantiene en m = 7 y 8.

Si V1 pasa M7 y M8 completos, P-C1 queda refutada, y eso sería evidencia fuerte a favor de 𝓡_m.

**Nota de multiplicidad:** P-C1..P-C3 se evalúan sobre los mismos datos que RM7 y RM8. Son predicciones rivales declaradas, no pruebas adicionales independientes.

## 4. Recomendaciones

1. **No cambiar V1.** Abrir M7 tal como está preregistrado, una vez que este documento quede con hash.
2. **GD-DELTA no debería ser la primera regla en la que se invierta tiempo de prueba.** Su análogo directo (EXT-DELTA) ya cayó una vez por el mismo mecanismo. GD-BAND tiene mejor base empírica.
3. Si V1 falla en M7, M8 queda reservado para una V2 cuyos parámetros escalen con m y cuya forma venga de un argumento, por ejemplo del lema de presupuesto o de RC/SS, que ya acotan δ y la longitud de las corridas.

Archivos: `n0_rm_audit/mine/` (`params.py`, `bcheck.py`, `rmchk`, `mine_DEV.txt`) y `n0_rm_audit/untrusted/`, el original sin tocar.
