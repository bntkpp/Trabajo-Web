# N0 — GAP-FILL-INT: reducción de Hall a bloques consecutivos

Fecha: 2026-10-22  
Autor: ChatGPT  
Estado: **Exploratorio — reducción en papel + desarrollo exacto m=4.**  
No promover. No actualizar ledger.

## 1. Contexto

Sean los niveles bicolores ordenados `h_1<...<h_I`,
`p=min S`, `z=L-max S`, `delta=p+z`, y

`D = blk(p, I-z)`.

Entonces `|D|=I-delta`.

El objetivo `MID-HALL1` es

`max_{A subset D} (|A|-|N(A)|) <= 1`,

donde `N(A)` son las ventanas desperdiciadas vecinas G5 de algún nivel de `A`.
Cada desperdicio `w` tiene una vecindad `N_D(w)` que es un intervalo en el orden de D,
porque `S` cambia por pasos en `{-1,0,1}` dentro de la banda temporal
`|t-w|<=m+1`.

## 2. Hipótesis necesaria para rellenar huecos

La primera versión ensayada fue demasiado fuerte:

`GAP-FILL: # {w : nonempty N_D(w) subset G} <= |G|`

para todo bloque consecutivo `G subset D`.

Fue refutada en m=4: `250,857` palabras la violan. El primer mecanismo de falla es
un bloque que toca el borde de D (por ejemplo D singleton) y puede contener más de un
desperdicio localizado. Esa versión queda **Refutada (exploratoria)**.

La reducción de rellenado solo necesita bloques que sean huecos entre dos componentes
de un conjunto `A`, por lo que dichos bloques son estrictamente interiores a D.

Definimos entonces:

> **GAP-FILL-INT.** Para todo bloque consecutivo no vacío
> `G=[h_a,...,h_b]` con `a>1` y `b<|D|` (índices humanos),
>
> `# { w waste : nonempty N_D(w) subset G } <= |G|-1`.

La versión `<=|G|` bastaría para la reducción; el desarrollo m=4 satisface la cota
más fuerte `<=|G|-1`.

## 3. Demostración condicional: GAP-FILL-INT => INTERVAL-DEF

Sea `A subset D`, no vacío. Si A ya es consecutivo, no hay nada que hacer.
Supongamos que dos componentes consecutivas de A están separadas por un hueco

`G={h_{r+1},...,h_{s-1}}`.

Poner `A' = A union G`.

Por convexidad de G5 en el lado de los niveles, si un desperdicio `w` es vecino de
algún vértice de G pero no era vecino de A, su intervalo `N_D(w)` no puede atravesar
ninguno de los dos extremos seleccionados de A que flanquean G. Por tanto

`nonempty N_D(w) subset G`.

Luego, por GAP-FILL-INT,

`|N(A') \ N(A)| <= |G|-1 <= |G|`.

Así,

`def(A') = |A|+|G| - |N(A')|`

`>= |A|+|G| - (|N(A)|+|G|)`

`= def(A)`.

Rellenar un hueco no disminuye la deficiencia. Repitiendo sobre todos los huecos,
se obtiene el casco consecutivo `Hull(A)` con

`def(Hull(A)) >= def(A)`.

Por tanto la máxima deficiencia sobre todos los subconjuntos de D se alcanza en un
bloque consecutivo (o en el vacío): **INTERVAL-DEF**.

## 4. Consecuencia para MID-HALL1

Si además se demuestra

> **INT-HALL1:** para todo bloque consecutivo `J subset D`,
> `|N(J)| >= |J|-1`,

entonces por INTERVAL-DEF todo subconjunto `A subset D` satisface

`|A|-|N(A)| <= 1`.

Así:

`GAP-FILL-INT + INT-HALL1`
`=> INTERVAL-DEF + INT-HALL1`
`=> MID-HALL1`
`=> G5`
`=> W >= m-1`
`=> rho <= 3m+2`.

## 5. Desarrollo exacto m=4

Dominio: todas las palabras de largo 25 con `x_0=0`.
Total: `2^24 = 16,777,216` palabras.

Resultado para GAP-FILL-INT:

- falsadores: `0`;
- exceso máximo observado
  `#localized_waste(G)-|G| = -1`.

Es decir, en todo bloque interno no vacío del desarrollo:

`#localized_waste(G) <= |G|-1`.

Código final:

- `gapfill_int_m4.c`
  SHA-256 `d3e279bcb00cc2524db67834be27e0ed0062986462220cd21db4d822100b69a2`
- binario local
  SHA-256 `f6fd6cce61c09522a7fc18b7fd4db3c290db47968ea0f5addfa56a3173ef4d93`

## 6. Control de mecanismo por fronteras

Se testeó además la formulación equivalente sugerida por la cota `|G|-1`:
los desperdicios localizados en G se conectan a las `|G|-1` fronteras internas que
cruza su intervalo `N_D(w)`, y se pide un SDR que sature los desperdicios.

En m=4 tuvo `0` falsadores.

Hashes:

- `gapfill_boundary_m4.c`
  `f2e07bec00a46c59129d874669c7d06189ef531d1b148ad73b40bb706d7f742d`
- binario local
  `7a6ff398bdd71cd7399b4ee2e6624c65ce8d21ababaa3fe8c214f92af85f871c`

Sin embargo, este SDR **no se cuenta como reducción independiente**: Hall para una
familia de intervalos hacia las fronteras exige precisamente las desigualdades
GAP-FILL-INT en todos los subbloques. Es una reformulación, no una prueba nueva.

## 7. Negativos de esta sesión relacionados

No reutilizar como mecanismos:

- `SHORT-COL-SDR`: Refutado; 85,070 violaciones en m=4.
- `SHORT-COMPLEMENT`: Refutado; 8,442 violaciones en m=4.
- inyección por longitud del retorno corto: Refutada; dos niveles distintos pueden
  tener el mismo `d`.
- `GAP-FILL` sin restricción interior: Refutado; 250,857 violaciones en m=4.

La medición `#D_short<=m` en m<=4 no cuenta como evidencia porque `CERT-M5` ya implica
`|D|<=m` en esos tamaños; es solo control de consistencia.

## 8. Próximo objetivo

No abrir más inyecciones locales. El objetivo de papel es ahora exactamente:

1. demostrar GAP-FILL-INT desde la estructura temporal de `S_t` y el hecho de que
   un desperdicio localizado tiene una banda de radio `m+1` cuya intersección con D
   queda dentro de G;
2. demostrar INT-HALL1 para bloques consecutivos.

Ninguna de las dos afirmaciones se promueve por el censo m=4.
