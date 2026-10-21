# N0 — Preregistro LC1 TWO-TAILS V1

Fecha: 2026-10-20.
Autor de la hipótesis: ChatGPT.
Estado: preregistro de desarrollo; NO es prueba. Se escribe antes de medir TWO-TAILS exhaustivamente.

## Contexto congelado

Trabajamos en la rama de puente largo de `N0LongBridge`:

- m >= 2;
- 1 <= delta;
- 2 delta <= m+1;
- LB m x u v: u<v es un par global minimo/maximo de distancia minima;
- R = S_v-S_u = L-delta, L=2m+1;
- n=v-u;
- b=n-R >= 2m-1;
- s=b-(2m-1), por lo que 0 <= s <= delta;
- core = ventanas u,...,v.

Por `Closest`, dentro del core el minimo S_u no vuelve a aparecer y el maximo S_v no aparece antes de v.

LC1 es exactamente

    W_core >= m-2,

o equivalentemente

    I_core <= b-m+2.

Como el core visita los R+1 niveles, si M_core es el numero de niveles monocromos en el core,

    M_core = (R+1)-I_core,

y LC1 equivale exactamente a

    M_core >= m+1-delta-s.                 (LC1-MONO-CORE)

Esta equivalencia no es una hipótesis.

## Lema de colas — candidato a prueba en papel, sin cómputo

Reindexar el core como T_t=S_{u+t}, Y_t=x_{u+t+m}, t=0,...,n.
Definir

    lambda = min_{m+1 <= t <= n} (T_t-T_0),
    mu     = min_{0 <= t <= n-m-1} (T_n-T_t).

Definir las colas de niveles

    LOW  = {h : T_0 <= h < T_0+lambda},
    HIGH = {h : T_n-mu < h <= T_n}.

Por definición, todo LOW solo aparece en tiempos t<=m y todo HIGH solo aparece en tiempos t>=n-m.

Definir

    p_low = #{ t in [0,m] : Y_t=1 and T_t in LOW },
    z_high= #{ t in [n-m,n] : Y_t=0 and T_t in HIGH }.

Entonces:

1. a lo más p_low niveles LOW pueden ser bicolores, luego LOW contiene al menos lambda-p_low niveles monocromos;
2. a lo más z_high niveles HIGH pueden ser bicolores, luego HIGH contiene al menos mu-z_high niveles monocromos;
3. LOW y HIGH son disjuntas (en puente largo n>=2m+2; los intervalos temporales usados para lambda y mu se solapan, dando lambda+mu<=R).

Por tanto

    M_core >= lambda + mu - p_low - z_high.      (TAIL-LEMMA)

Esta parte se intentará demostrar sin mirar resultados TWO-TAILS.

## Predicción con riesgo: TWO-TAILS-P1

En todo puente largo del sector:

    lambda + mu - p_low - z_high >= m+1-delta-s.    (TT)

Por TAIL-LEMMA, TT implica LC1 exactamente en la forma de `N0Master.lean`.

### Falsador

Un solo par LB de puente largo del sector con

    lambda + mu - p_low - z_high < m+1-delta-s.

Si aparece, TWO-TAILS queda REFUTADO. LC1 NO queda refutado.
Se debe informar la palabra minima encontrada y todos los valores
(m,delta,n,b,s,lambda,mu,p_low,z_high,W_core,I_core,M_core), además de qué niveles monocromos quedan fuera de LOW union HIGH.

## Controles

C1. Recalcular directo desde DEF-CORE: S, centros, rho_core, I_core, W_core.
C2. Verificar para cada par que M_core=(R+1)-I_core y que LC1-MONO-CORE es equivalente a W_core>=m-2.
C3. Verificar literalmente que ningún nivel LOW aparece después de m y ningún HIGH antes de n-m.
C4. Verificar LOW∩HIGH=∅.
C5. Reproducir el falsador de SHADOW-MATCH m=5

    1100100000000101010101011111111

con delta=3,b=9,s=0,W_core=3 y comprobar TT sin usar ninguna salida previa de SHADOW.

## Dominio de desarrollo

Ejecutar exhaustivamente m=2,3,4,5, solo sobre todos los pares LB de puente largo del sector, con la misma convención de `N0LongBridge`.
No usar m=6 en V1.

Esto es desarrollo, no holdout virgen: m<=5 ya fue inspeccionado muchas veces con otras estadísticas.

## Interpretación preespecificada

- Si TT falla: registrar el contraejemplo y abandonar la afirmación de que las dos colas por sí solas pagan LC1. Examinar dónde están los niveles monocromos faltantes, pero cualquier reparación será una hipótesis nueva.
- Si TT pasa: no promover a prueba. Primero auditar TAIL-LEMMA en papel y después buscar una derivación de TT desde la geometría U-G-V; la corrida solo autoriza invertir en esa derivación.

## Implica para la cota maestra

TWO-TAILS-P1 + TAIL-LEMMA => M_core >= m+1-delta-s => I_core <= b-m+2 => W_core >= m-2 => LC1.
No aporta por sí solo LC2 ni BridgeSlack.
