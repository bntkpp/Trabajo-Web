# N0 — Auditoría ChatGPT del resultado G5X-V2 m=6

Fecha: 2026-10-22  
Auditor: ChatGPT  
Resultado auditado: `N0_RESULTADO_G5X_M6_2026-10-22.zip`  
SHA-256 del ZIP: `a7e3a6f2cc3d91b46f5109c6b1233ac778e9b3afe982f35e48e11e224165cdea`

## Veredicto

**PASS — etiqueta: Observación exhaustiva.**

La corrida válida certifica, con una sola implementación, que G5 tiene 0 fallas en el dominio exhaustivo m=6 cubierto por x_0=0; por complemento, cubre las 2^37 palabras. No es Demostrado ni Certificado exacto.

## Integridad y recomposición

Se extrajeron y verificaron los 64 shards `m6_s0.txt` ... `m6_s63.txt`.

- cada shard contiene exactamente `2^30 = 1,073,741,824` palabras;
- total reconstruido: `68,719,476,736 = 2^36`;
- índices presentes: 0..63, sin huecos;
- la recomposición independiente de los shards da exactamente:

```
words      68719476736
need_pos      32646636
g5_fail               0
ctl_fail             102
thm_viol               0
g5_exact             351
```

Histograma de `need` reconstruido:

```
1  29,732,318
2   2,745,178
3     164,626
4       4,488
5          26
```

La suma del histograma es exactamente `32,646,636 = need_pos`.

## Hashes de salida

`SHA_SALIDAS.txt` contiene 74 entradas. Se recalcularon sobre los archivos incluidos en el ZIP: **74/74 coinciden**.

Hashes principales:

- `RESULT_m6.txt`: `fc55c683ff26c46072bd384849f6f8327dce7f49a35f92cfb98bd14b72cc5531`
- `DECISION.txt`: `e349c93b642548f6b6ac13d813d1060af9badc545843fadff481fb1fd880e118`
- `SHA_SALIDAS.txt`: `4cf68bc6286d898830d65403dc982545e338f15c1d82a2b5127ec02c934acf04`
- `SHA_BINARIOS.txt`: `2e07258b66ff95594915f05074941fd0f4c2ed00b53828b4d0a2f578cb1787fe`
- `TESTIGOS.txt`: `8aeccff64c4f9017bda7903ff8883dbcfc0fb07d9cefc39163f04b583a4b276b`
- informe Claude: `519f09cb0c2e9a14d6435dcc36963af8f5d33a290f3efce4e04da9919d33af8d`

## Controles

C1 reproduce exactamente las referencias declaradas:

- m=3: words=262144, need_pos=582, g5_fail=0, ctl_fail=3, thm_viol=0;
- m=4: words=16777216, need_pos=26746, g5_fail=0, ctl_fail=6, thm_viol=0;
- m=5: words=1073741824, need_pos=994316, g5_fail=0, ctl_fail=27, thm_viol=0.

C2 detecta la falla plantada: 51.

C3 pasa:

- 64/64 shards;
- words=2^36;
- thm_viol=0;
- ctl_fail=102 >= 1;
- testigo de control confirmado.

## Verificación independiente del testigo de control

Para

`0000000010100101101011111111111110100`

se recalculó desde DEF-CORE, sin usar el ejecutor G5X:

```
rho   = 18
W     = 7
R     = 11
delta = 2
I     = 6
need  = 3
matching radio 6 = 2
matching radio 7 = 3
```

Por tanto el control radio m falla y el radio m+1 alcanza exactamente `need`, como declara `TESTIGOS.txt`.

## Incidente del primer intento

El paquete contiene evidencia de un intento abortado antes de m=6. `run_stdout.txt` y `CONTROLES.txt` de esa carpeta solo muestran C1 completo para m=3 y m=4; no hay ningún `m6_s*.txt` en la carpeta abortada. Esto es compatible con el informe: el proceso se detuvo durante C1(m=5), antes del dominio científico m=6.

**N1 editorial, no bloqueante:** el informe dice que la carpeta abortada incluida contiene `CONTROLES.txt, ctl_m3, ctl_m4`; en el ZIP auditado solo se incluyeron `CONTROLES.txt` y `run_stdout.txt` para esa carpeta. Los textos contienen los resultados de m=3 y m=4, por lo que la evidencia necesaria está presente, pero la lista de archivos debe corregirse si se publica una V2 del informe.

## Proveniencia del ejecutor

La salida principal comienza con los cinco checks de manifiesto `OK`, y el orquestador V2 ya había sido auditado antes del sello. `SHA_BINARIOS.txt` registra los dos binarios ejecutados y el entorno registra gcc 13.3.0, Python 3.13.16, CPU y tiempos.

Los binarios ejecutables no vienen incluidos como bytes en este ZIP; solo sus hashes. Esto no invalida el preregistro, pero para archivo reproducible de largo plazo conviene conservarlos junto al resultado o documentar que se recompilan desde el commit sellado.

## Estado

**Observación exhaustiva:**

> G5 no presenta fallas en ninguna palabra de m=6; el censo exhaustivo de x_0=0 cubre 2^36 palabras y el complemento extiende el resultado a las 2^37 palabras.

No promover a Certificado exacto sin una segunda implementación independiente que reciba solo el preregistro y DEF-CORE.

## Implica para la cota maestra

G5 sigue siendo una conjetura universal, pero ahora tiene 0 fallas en un dominio completo m=6 y preserva un borde no trivial: el radio m falla en 102 palabras mientras radio m+1 no falla en ninguna. La ruta teórica prioritaria es demostrar G5 por Hall, no resucitar LC1.
