# N0 — Sello conjunto CE M9

Fecha: 2026-10-23

## Preregistros congelados

1. `N0_PREREG_CRITICAL_EXCURSION_V1_2026-10-23.md`
   - SHA-256 local: `e707ddabf8f51c3b20eb0319c1bb67f525176777aa1c2d895d562b294c392e82`
   - GitHub commit: `de46ee26452a5906dfa398ae19fa6ca0111165e4`

2. `N0_PREREG_CRITICAL_EXCURSION_V1_A1_2026-10-23.md`
   - SHA-256 local: `12ccdb636ada71c8ada81c2b4cc5d6332a2aab06d3a7bc61e0e9e140f6a6aa5a`
   - GitHub commit: `05a7dc783b88e77f0033953e2b4b57385f4bf558`

3. `N0_PREREG_CE_FUERTE_V1_M9_2026-10-23.md`
   - SHA-256 local: `a0fd82921194ccfd712c7593ec5400e4a032d66c3b1723f3bb5ad54a9dca5c59`
   - GitHub commit: `95d023db82b6a698a8178b855241669148f045a1`

## Regla de consumo de M9

Se ejecuta una sola campaña M9 y se evalúan simultáneamente:

- CE-V1: `alpha + beta <= 1`.
- CE-FUERTE: `alpha = beta = 0` y `d <= 1`.

M9 no podrá reutilizarse después como holdout nuevo para ninguna afirmación derivada de sus resultados.

## Gate de implementación antes de ejecutar

Antes de correr:

1. registrar `sha256sum crit.c`;
2. compilar una sola vez con compilador/versión/flags registrados;
3. registrar SHA-256 del binario;
4. no modificar ni recompilar source/binario durante la campaña;
5. guardar stdout y stderr completos.

Si el source o binario cambia después del sello y antes/durante la ejecución, la campaña no cuenta como la corrida prospectiva congelada.
