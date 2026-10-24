# N0 — CRITICAL-EXCURSION V1 (preregistro de prueba)

Fecha: 2026-10-23
Autor: ChatGPT
Estado inicial: **Exploratorio / objetivo de demostración preregistrado**
M8: no se abre ninguna lista de extremales.
M9: no se ejecuta en este preregistro.

## Enunciado objetivo

Sea `m >= 1`, `L = 2m+1`, y una palabra binaria de longitud `6m+1`.
Supóngase:

1. `G_j >= 0` para todo `j = 0,...,2m-1`;
2. existe un índice `i` con `G_i = m+3`;
3. `n = m-1`.

Para el tramo `T_i = (S_i,...,S_{i+L})`, definir

- `alpha_i = S_i - min(T_i)`,
- `beta_i  = max(T_i) - S_{i+L}`.

### CE-V1 — CON RIESGO

\[
\boxed{\alpha_i+\beta_i\le1.}
\]

### Falsador exacto

Una palabra binaria `x` de longitud `6m+1` y un índice `i` que satisfagan
las tres hipótesis anteriores y además

\[
\alpha_i+\beta_i\ge2.
\]

Un solo testigo exacto refuta CE-V1.

## Base ya conocida

Para `G_i=m+3`, si `d` es el número de pasos `-1` y `f` el número de pasos `0`
en el tramo de `L` pasos,

\[
2d+f=m-2.
\]

Además,

\[
\alpha_i+\beta_i\le d.
\]

La segunda desigualdad se justificará en la prueba: las `alpha_i` unidades de
descenso necesarias para bajar desde `S_i` hasta el mínimo ocurren antes de
alcanzar ese mínimo, y las `beta_i` unidades necesarias para bajar desde el
máximo hasta `S_{i+L}` ocurren después de alcanzar ese máximo; esos descensos
pueden cargarse a pasos `-1` disjuntos.

Por tanto, para `m<=5`, `d<=1` y CE-V1 es aritméticamente automático.
Los datos de `m<=5` no cuentan como evidencia sobre la parte no trivial.

## Evidencia de desarrollo ya observada antes de este preregistro

Según la auditoría de Claude comunicada el 2026-10-23, en la capa crítica:

- `m=6`: 30 cortes, 0 falsadores;
- `m=7`: 114 cortes, 0 falsadores;
- `m=8`: 46 cortes, 0 falsadores.

Total informativo observado: 190 cortes en `m=6..8`.

Estos datos son **desarrollo ya visto**, no un holdout para CE-V1.

## Patrón más fuerte — NO forma parte de CE-V1

En esos mismos datos se observó post hoc:

\[
\alpha_i=\beta_i=0,\qquad d\le1.
\]

Estado: **Exploratorio post hoc**.

No se usará como premisa de CE-V1 ni se promoverá por los datos `m<=8`.
Si se desea probar prospectivamente en `m=9`, deberá congelarse en un
preregistro separado antes de ejecutar ese dominio.

## Herramientas demostradas disponibles

- ISEG.
- CUT-BUDGET.
- PERFECT-CUT.
- Lema A/B de testigos de color:
  `G_i=m+3` fuerza al menos tres centros `0` en la mitad temprana del tramo
  y al menos tres centros `1` en la mitad tardía.
- STAIRCASE/BANK.
- Los lemas auditados de TRUE-CROSS pueden usarse solo cuando sus hipótesis
  exactas estén satisfechas.

## Plan de prueba preregistrado

La prueba debe explicar la parte no trivial `m>=6`.

Ruta prioritaria:

1. Suponer `alpha_i+beta_i >= 2`.
2. Usar `2d+f=m-2` para cargar las excursiones a pasos no positivos.
3. Combinar los tres centros `0` tempranos y los tres centros `1` tardíos
   con `G_j>=0` para restringir los testigos exteriores necesarios.
4. Derivar una contradicción con `n=m-1`.

No se considerará progreso una mera reescritura equivalente de CE-V1.

## Implicación para HIGH-ESCAPE / GD-BAND

En la capa `n=m-1`, la forma normal exacta es

\[
E_i=1+W_T+H_i+\alpha_i+\beta_i.
\]

CE-V1 elimina por completo la rama `alpha_i+beta_i>=2`.
No demuestra por sí sola ESC2 ni HIGH-ESCAPE.

Después de CE-V1 todavía quedan:

- `alpha_i+beta_i=1`: demostrar `W_T=H_i=0`;
- `alpha_i+beta_i=0`: demostrar `W_T+H_i<=1`.

Por tanto CE-V1 es un gate real, pero no la cota maestra completa.

## Regla de decisión

- Prueba universal válida y auditada -> **Demostrado**.
- Contraejemplo exacto -> **Refutado**, congelar el testigo mínimo y su mecanismo.
- Nuevo patrón encontrado durante la prueba -> **Exploratorio** hasta un nuevo
  preregistro o una demostración independiente.
