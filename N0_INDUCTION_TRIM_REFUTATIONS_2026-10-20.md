# N0 — Refutación de INDUCTION-TRIM V1 y ADAPTIVE-TRIM V1

Fecha: 2026-10-20
Ejecutor: ChatGPT
Estado: REFUTADO (ambas predicciones), por censo exhaustivo m=2 y testigos exactos desde DEF-CORE.

## 1. INDUCTION-TRIM V1
Preregistro SHA-256:
`b5719f60761ce92393a5a6bd25103ae29863a57ac1e14c039d1fbc9ffed01797`
Sello GitHub:
`7da41b892b42c33c036d5b04dddd6131cc768263`

Predicción:
`rho_m(x) <= rho_{m-1}(x[3:-3]) + 3`.

Censo exhaustivo m=2: 8192 palabras.
- violaciones (salto >=4): 372
- salto máximo: 5
- testigo: `0110100100000`
- rho_2 = 7
- trim central `0100100`: rho_1 = 2
- diferencia = 5

Clases rho_2 del testigo:
`(0,0),(1,0),(1,1),(2,0),(2,1),(3,0),(3,1)`.
Clases rho_1 del trim:
`(1,0),(1,1)`.

Conclusión: REFUTADO. No afecta M_m <= 3m+2 ni los lemas BridgeSlack/LC1/LC2.

## 2. INDUCTION-ADAPTIVE-TRIM V1
Preregistro SHA-256:
`cdf917624aba79cb4faa773587c237ef444c81c3edab49256135015da1dd41b0`
Sello GitHub:
`c9b28b5893c8d1c72fa233e4cbdd3e15deec8407`

Predicción:
`rho_m(x) <= max_{a=1..5} rho_{m-1}(T_a(x)) + 3`,
donde cada T_a es uno de los cinco subbloques interiores de longitud `6(m-1)+1` con alineación completa de centros.

Censo exhaustivo m=2: 8192 palabras.
- violaciones (salto >=4): 64
- salto máximo: 5
- testigo: `1101100100000`
- rho_2 = 8
- mejor rho_1 entre los cinco trims = 3
- diferencia = 5

Rhos de los cinco trims del testigo:
- a=1: `1011001`, rho_1=3
- a=2: `0110010`, rho_1=3
- a=3: `1100100`, rho_1=3
- a=4: `1001000`, rho_1=3
- a=5: `0010000`, rho_1=3

Conclusión: REFUTADO. Según el preregistro, no se prueban más variantes de recorte en esta sesión.

## 3. Lectura metodológica
La diversidad marcada a escala m no se controla por la diversidad de una sola (ni de la mejor entre estas cinco) subpalabra natural a escala m-1 con una pérdida aditiva 3. El mecanismo del teorema no parece ser una monotonía inductiva local por recorte.
