# N0 — CE-FUERTE V1 (preregistro prospectivo M9)

Fecha: 2026-10-23
Autor: ChatGPT
Estado inicial: **Preregistrado / CON RIESGO**
Dominio prospectivo: **m = 9 únicamente**
Programa previsto: `crit.c`, ya utilizado sin cambios en m=3..8.
M8 no se abre ni se usa.

## Motivación y procedencia

Después de inspeccionar los datos de desarrollo m=3..8 apareció post hoc el patrón:

\[
\alpha_i=\beta_i=0,\qquad d\le1
\]

en la capa crítica.

Por eso este enunciado NO cuenta como derivado ni como evidencia previa.
M9 será su primera prueba prospectiva.

## Dominio

Palabras binarias de longitud `6m+1`, con `m=9`, que satisfacen:

1. \(G_j\ge0\) para todo \(j=0,\ldots,2m-1\);
2. existe un índice \(i\) con \(G_i=m+3\);
3. \(n=m-1\), equivalentemente en esta campaña a la capa \(W=m\);
4. el corte `i` se evalúa con las mismas definiciones congeladas de CE-V1.

La unidad de análisis es el par exacto `(palabra, i)`.

No se usa complemento ni otra reducción por simetría.

## Predicción P-FUERTE — CON RIESGO

Para todo corte crítico de M9:

\[
\boxed{\alpha_i=0,\qquad \beta_i=0,\qquad d_i^{(-)}\le1.}
\]

Aquí \(d_i^{(-)}\) es el número de pasos \(-1\) en el tramo de \(L=2m+1\) pasos
asociado al corte `i`.

## Falsador exacto

Un único par `(x,i)` de M9 en el dominio tal que ocurra cualquiera de:

\[
\alpha_i>0,
\qquad
\beta_i>0,
\qquad
d_i^{(-)}\ge2.
\]

Cualquiera de las tres condiciones refuta CE-FUERTE V1.

## Relación con CE-V1

CE-V1 predice solo

\[
\alpha_i+\beta_i\le1.
\]

CE-FUERTE es estrictamente más fuerte y se evalúa en la misma corrida, pero sus
veredictos se registran por separado.

- CE-FUERTE PASS no demuestra CE-V1 universal.
- CE-FUERTE FAIL no refuta CE-V1 salvo que además \(\alpha_i+\beta_i\ge2\).
- Si CE-FUERTE falla con \(\alpha+\beta\le1\), se congela el testigo como negativo
  de la hipótesis fuerte y CE-V1 permanece vivo.

## Control de capacidad de fallo

Para m=9, el presupuesto
\[
2d+f=m-2=7
\]
permite aritméticamente \(d=2\) y \(d=3\).
Por tanto `d<=1` no es automático por el presupuesto local.

Asimismo, \(\alpha+\beta\le d\) no fuerza \(\alpha=\beta=0\).

La hipótesis fuerte puede fallar en el dominio.

## Experimento conjunto M9

Una sola ejecución de `crit.c` mide simultáneamente:

### P1 — CE-V1
\[
\alpha_i+\beta_i\le1.
\]

### P2 — CE-FUERTE
\[
\alpha_i=\beta_i=0,\qquad d\le1.
\]

No se ejecutará una segunda campaña M9 para reinterpretar el mismo dominio como
holdout nuevo.

## Salidas mínimas a conservar

- SHA-256 del source `crit.c`;
- SHA-256 del binario ejecutado;
- compilador, versión y flags;
- stdout/stderr completos;
- número total de palabras de la capa crítica;
- número total de cortes críticos;
- `fail_CE_V1`;
- `fail_CE_FUERTE`;
- distribución de `alpha+beta`;
- distribución de `d`;
- para cada falsador, palabra completa, índice `i`, `G`, `n`, `alpha`, `beta`, `d`, `f`;
- hash del archivo de resultados.

No se inspeccionan resultados intermedios para modificar predicciones.

## Regla de decisión

- `fail_CE_V1 = 0`: CE-V1 sobrevive prospectivamente en M9.
- `fail_CE_V1 > 0`: CE-V1 queda **Refutado** con el primer testigo verificado.
- `fail_CE_FUERTE = 0`: CE-FUERTE obtiene una **Observación prospectiva M9**, no prueba.
- `fail_CE_FUERTE > 0`: CE-FUERTE queda **Refutado**; CE-V1 se decide por su propio contador.

## Implicación para la cota maestra

Ningún PASS en M9 demuestra la cota universal.

CE-V1, si se demuestra universalmente, elimina la rama
\[
\alpha_i+\beta_i\ge2
\]
de la capa crítica de HIGH-ESCAPE.

CE-FUERTE es diagnóstica: busca una estructura más rígida que podría facilitar
la futura prueba, pero no es necesaria para el teorema.
