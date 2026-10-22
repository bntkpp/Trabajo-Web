# N0 — G5-EXTREME-DELETE

Fecha: 2026-10-22  
Autor: ChatGPT  
Estado: **Exploratorio**. No es preregistro sellado, no es demostración y no entra como resultado promovido.

## Contexto

G5 usa el grafo bipartito entre niveles bicolores y ventanas desperdiciadas, con arista h--w si alguna visita t del nivel h satisface |t-w| <= m+1.

Sea

- p = min_i S_i;
- z = L - max_i S_i;
- delta = p+z;
- B = (h_1 < ... < h_I), la lista ordenada de niveles bicolores.

G5 requiere un matching de tamaño al menos I-delta-1.

## Predicción escrita antes del cómputo de desarrollo

Definir dos subconjuntos centrales:

- B_A: eliminar los p niveles bicolores más bajos y los z+1 más altos;
- B_B: eliminar los p+1 niveles bicolores más bajos y los z más altos.

**G5-EXTREME-DELETE:** al menos uno de los grafos inducidos por B_A o B_B admite un matching que cubre todos sus niveles.

### Falsador

Una palabra en la que ambos subconjuntos centrales sean no vacíos cuando corresponda y ninguno admita un SDR completo.

## Implicación exacta para G5

En cualquiera de las dos orientaciones se eliminan a lo más

p+z+1 = delta+1

niveles bicolores. Si el resto se empareja completamente, el grafo G5 tiene un matching de tamaño

I-(delta+1) = I-delta-1 = need.

Por tanto

G5-EXTREME-DELETE => G5 => W >= m-1 => rho <= 3m+2.

Esta implicación es puramente aritmética; la afirmación G5-EXTREME-DELETE sigue sin prueba.

## Desarrollo realizado después de escribir la predicción

- m=1: exhaustivo, 0 falsadores.
- m=2: exhaustivo, 0 falsadores.
- m=3: exhaustivo, 0 falsadores.
- m=4: exhaustivo sobre 2^25 = 33,554,432 palabras, 0 falsadores.

El verificador m=4 fue un programa C nuevo y mínimo que calculó DEF-CORE, desperdicios, niveles bicolores y dos matchings. No usó g5x.c.

### m=5

Se inició un control de desarrollo sobre la mitad x_0=0 con dos procesos, pero no terminó dentro del límite de la sesión. **No hay resultado de m=5 y no se interpreta nada de esa ejecución incompleta.**

## Negativos que llevaron a esta formulación

Todos Exploratorios/Refutados como candidatos de prueba, no afectan G5:

- G5-ENDPOINT: falso desde m=2.
- G5-CANON: falso desde m=3.
- G5-EFFSPAN: falso desde m=3.
- G5-EFF-RED (D_all=D_eff): falso desde m=1.
- G5-POS-SDR: falso desde m=1.
- G5-COMP1: falso desde m=2.
- G5-CONVEX: falso desde m=2; incluso restringido a centrales, falso desde m=3.

La lección es que G5 no se prueba asignando un representante fijo a cada nivel ni convirtiendo las vecindades en intervalos. La holgura delta+1 parece concentrarse en **niveles extremos en altura**, no en una separación por tipo de retorno.

## Conexión con resultados demostrados

- Un nivel bicolor no eficiente (>=3 visitas) tiene por palomar una repetición de clase en su propio nivel, por tanto un vecino G5 a distancia 0.
- GAP, ya en el ledger como Demostrado, excluye Delta_h=m+1 para niveles eficientes.
- LLW, ya en el ledger como Demostrado, produce repetición interna para retornos bicolores consecutivos con Delta_h>=m+1.

Estos hechos sugieren que la prueba de EXTREME-DELETE debe usar los defectos extremales p y z como excepciones y tratar el centro por una inyección/matching global, no por cotas independientes de colas.

## Próximo objetivo de papel

Probar una de las dos orientaciones por Hall. Para cada A contenido en B_A (o B_B), demostrar

|N(A)| >= |A|.

El punto que falta es una desigualdad de Hall para subconjuntos arbitrarios del bloque central. No se ha demostrado convexidad de vecindades y no debe asumirse.
