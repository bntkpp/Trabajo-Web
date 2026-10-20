# N0 — Seal de resultado LC1/LC2 m=6

Preregistro: `N0_PREREG_LC1_LC2_M6_2026-10-20.md`

- SHA preregistro: `9efd8711b4b9dee1c654aa7103f9fb1d6ff76dce43b8580a32462a760fe5355a`
- Commit de sello previo: `ef2423c7932648ac2ff54d78da40db842aedd8f0`

Resultado de Claude:

- Informe: `N0_LC12_M6_RESULT_CLAUDE_2026-10-20.md`
- SHA-256 informe: `8de94a6a0984a3e02e995ab301a43435632c9c5022d527af649209210b36d575`
- Paquete recibido por ChatGPT: `N0_PAQUETE_LC12_M6_2026-10-20.zip`
- SHA-256 paquete: `4ca360a0fa5501280bd8376966e891867c9155a1ea145c43b30d44da98251d58`
- Fuente `lc12_claude.c`: `973d6f3f0d8df6f1fb38a8adbe9406ab0be4979a67d7e9bebce0882e274b463c`
- Freeze: `5bed3b63796d330cce61e5d4771a959b6773af72500895876e48a97f52abed11`
- Salida agregada: `31fb2090fda53a268028ef427bf0c70ca5d3cc5531c1f3b2a83ed562fd93957a`

Resumen verificado contra la distribución incluida:

- Palabras procesadas: `137438953472 = 2^37`
- Puentes largos del sector: `15101264`
- `min W_core = 4`
- Violaciones LC1: `0`
- Casos `W_core = 4`: `1312`
- `min W_ext | W_core=4 = 1`
- Violaciones LC2: `0`
- P4 `W = W_core + W_ext`: `0` fallas
- Casos justos: `(delta,b,W_ext,count) = (2,11,2,700), (2,12,1,8), (3,11,3,604)`

Etiqueta: **Observación exhaustiva preregistrada, no holdout virgen**. LC1 y LC2 universales siguen abiertos.
