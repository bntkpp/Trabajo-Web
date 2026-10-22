# N0 — INTERVAL-DEF para el bloque central D

Fecha: 2026-10-22  
Autor: ChatGPT  
Estado: **Exploratorio**. No promover; no actualizar ledger.

## 1. Contexto

Usamos DEF-CORE y la reducción `N0_MID_HALL1_REDUCTION_CHATGPT_2026-10-22.md`.
Sean los niveles bicolores ordenados `h_1<...<h_I`,
`p=min S`, `z=L-max S`, `delta=p+z`, y

`D = blk(p, I-z)`.

Entonces `|D|=I-delta`. El objetivo `MID-HALL1` es

`max_{A subset D} (|A|-|N(A)|) <= 1`.

El grafo G5 usa como vértices derechos las ventanas desperdiciadas y une un nivel
bicolor `h` con un desperdicio `w` cuando alguna visita `t` a `h` satisface
`|t-w|<=m+1`.

## 2. Hipótesis exploratoria INTERVAL-DEF

Predicción fijada antes del censo m=4:

> La máxima deficiencia de G5 restringido a D se alcanza en un bloque consecutivo
> de D (o en el conjunto vacío).

Equivalente:

`max_{A subset D} def(A) = max(0, max_{a<=b} def({h_a,...,h_b}))`.

Falsador: una palabra para la cual un subconjunto no consecutivo de D tenga
deficiencia estrictamente mayor que todo bloque consecutivo.

Si se demostrara, MID-HALL1 se reduciría a la familia O(|D|^2) de desigualdades

`|N({h_a,...,h_b})| >= b-a`.

## 3. Censo exacto de desarrollo m=4

Dominio: todas las palabras de largo 25 con `x_0=0`. Por complemento esto toma una
mitad exacta del espacio; no se usa como certificación, solo como desarrollo.

Total recorrido: `2^24 = 16,777,216` palabras.

Resultado con la implementación final de Kuhn recursivo:

- palabras con `D` no vacío: `252,966`;
- falsadores de INTERVAL-DEF: `0`;
- máximo déficit global observado: `1`;
- máximo déficit de intervalo observado: `1`;
- palabras con déficit 0: `16,776,864`;
- palabras con déficit 1: `352`;
- palabras con déficit >=2: `0`.

El primer ejecutor de matching escrito durante la sesión fue descartado antes de
aceptar el resultado porque su reconstrucción de caminos aumentantes podía leer una
asignación recién modificada. Se reescribió con Kuhn recursivo estándar y se repitió
todo el dominio. Los conteos coincidieron, pero solo el segundo ejecutor se considera
válido para este artefacto.

SHA-256:

- `interdef_m4.c`: `4fa68a8bc9aef9617da10fdd19a441eb4e973b0a4025a379e0c43008dc74cc3a`
- binario local `interdef_m4`: `a05752d25c0258e315503af9251cd54c623e40fe8ad575837162b425c92dbff7`

## 4. m=5

Se intentó repetir exactamente la misma estadística sobre `x_0=0`, dominio de
`2^30` palabras. La ejecución no terminó dentro del presupuesto del turno.

**Estado m=5: NO EVALUADO.** No se usa ningún parcial y no se reemplaza por muestreo.

## 5. Control adversarial: convexidad sola NO implica INTERVAL-DEF

INTERVAL-DEF no es un teorema gratuito de grafos bipartitos convexos.

Contraejemplo convexo conectado con lado izquierdo ordenado `{0,1,2,3,4}` y cuatro
vértices derechos cuyas vecindades son los intervalos

`[0,4], [1,1], [1,2], [2,2]`.

Para `A={0,3,4}`, solo `[0,4]` toca A, de modo que

`def(A)=3-1=2`.

En cambio cualquier intervalo consecutivo del lado izquierdo tiene deficiencia a lo
más 1 (el intervalo completo tiene `5-4=1`). Por tanto la reducción observada en N0
necesita estructura adicional de la caminata `S_t`/desperdicios; no sigue de la sola
convexidad de G5.

## 6. Casos justos m=4

La inspección post hoc de ejemplos con déficit 1 muestra dos mecanismos:

1. singleton central sin vecino G5;
2. bloque de `k` niveles centrales con exactamente `k-1` desperdicios vecinos.

En los primeros ejemplos inspeccionados, los niveles del bloque crítico tienen
retornos temporales cortos (spans <= m), pero esto es **descriptivo** y no se eleva a
hipótesis ni a lema.

## 7. Siguiente objetivo de prueba

No abrir otra familia local. Atacar directamente estas dos piezas:

1. **INT-HALL1:** para cada bloque consecutivo `J` de D,
   `|N(J)| >= |J|-1`.
2. **INTERVAL-DEF (papel):** demostrar usando la estructura temporal N0 que toda
   obstrucción Hall de mayor deficiencia puede reemplazarse por un bloque consecutivo
   sin disminuir la deficiencia.

Juntas implican MID-HALL1, y por la reducción ya escrita:

`MID-HALL1 -> G5 -> W>=m-1 -> rho<=3m+2`.

No se modifica el ledger hasta que exista prueba auditada o certificación conforme al
protocolo.
