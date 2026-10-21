# N0 — Preregistro LC1 SHADOW-MATCH V1

Fecha: 2026-10-20 (Chile).
Autor de la propuesta: ChatGPT.
Estado inicial: **Exploratorio / test de desarrollo**.

Este preregistro se escribe **antes** de calcular SHADOW-MATCH exhaustivamente en m=2..5. Esos tamaños ya fueron inspeccionados por muchas otras estadísticas, por lo que un resultado positivo NO será prospectivo ni promoverá LC1. La función del cómputo es matar una regla de carga defectuosa antes de intentar probarla.

## 1. Dominio

Trabajar en la rama de puente largo ya auditada:

- m >= 2, L = 2m+1;
- 1 <= delta y 2 delta <= m+1;
- (u,v) es un par global min/max más cercano, normalizado con u < v;
- n = v-u, R = S_v-S_u, b = n-R;
- b >= 2m-1;
- s := b-(2m-1) >= 0.

El **core** son las ventanas t=u,...,v.

No se usa ninguna reparación a delta=0.

## 2. Balance firmado por revisitas

Recorrer el core de izquierda a derecha. Para cada tiempo t, sea h=S_t.

- Si h no apareció antes en el core: t no recibe signo.
- Si h apareció antes pero el color y_t todavía no apareció en h: t es un **evento positivo** (+), y t pertenece a P.
- Si la clase (S_t,y_t) ya apareció antes: t es un **evento negativo** (-), y t pertenece a N.

Para cada p en P definir canónicamente

q(p) := max { t < p : S_t = S_p }.

Como p es la primera aparición del segundo color de ese nivel, y_{q(p)} != y_p. Por tanto [q(p),p] es un retorno bicolor entre visitas consecutivas al nivel, sin ninguna elección post hoc.

Identidad-gate, que el programa debe comprobar en cada palabra:

    |P| - |N| = I_core - W_core.

Así LC1 es exactamente

    |P| - |N| <= s+3.

## 3. Intervalo admisible de carga J(p)

Sea Delta(p)=p-q(p).

### 3.1 Retorno largo

Si Delta(p) >= m+1, definir

    J(p) = {q(p)+1, ..., p-1}.

LONG-LOCAL-WASTE ya demostrado implica que J(p) contiene al menos un evento negativo. Esto se usa como gate: si N ∩ J(p) es vacío para un retorno largo, se detiene el experimento y se reporta error de implementación/definición antes de evaluar la hipótesis.

### 3.2 Retorno corto

Si Delta(p) <= m, definir las dos sombras de paso

    ell(p) = p-m-1,
    r(p)   = q(p)+m.

Entonces ell(p) < q(p) < p <= r(p).

El intervalo de sombra de ventanas es

    J(p) = [ell(p)+1, r(p)] ∩ [u,v].

Es decir,

    J(p) = { t in Z : max(u,ell(p)+1) <= t <= min(v,r(p)) }.

Los acoples exactos que motivan esta elección son, cuando los pasos existen,

    d_{p-m-1} = y_p - x_{p-m-1},
    d_{q(p)+m} = x_{q(p)+m+L} - y_{q(p)}.

No se afirma todavía ningún lema sobre colisiones de sombras; SHADOW-MATCH es precisamente el test de si esta localidad alcanza.

## 4. Grafo bipartito y predicción

Construir un grafo bipartito:

- lado izquierdo: eventos positivos P;
- lado derecho: eventos negativos N;
- arista p--t si y solo si t pertenece a N ∩ J(p).

Sea M_sh el tamaño de un matching máximo exacto de este grafo.

### SHADOW-MATCH-P1

Para toda palabra del dominio de puente largo,

    |P| - M_sh <= s+3.

**Falsador exacto:** una sola palabra válida del dominio con

    |P| - M_sh >= s+4.

Si aparece un falsador, SHADOW-MATCH-P1 queda **Refutado** y se abandona esta regla de carga. No se modifica el estado de LC1.

## 5. Por qué P1 implicaría LC1

Como M_sh <= |N|,

    |P|-|N| <= |P|-M_sh.

Por la identidad-gate,

    I_core-W_core <= |P|-M_sh.

Por P1,

    I_core-W_core <= s+3,

que es exactamente LC1.

No hay fortalecimiento algebraico escondido en el último paso; el posible fortalecimiento está únicamente en exigir que los pagos negativos sean locales a J(p). Eso es lo que el experimento intenta falsar.

## 6. Controles congelados

### C1 — balance firmado

En cada palabra verificar

    |P|-|N| = I_core-W_core.

Cualquier falla invalida la corrida.

### C2 — LLW

Para cada p con Delta(p)>=m+1 verificar

    N ∩ J(p) != empty.

Cualquier falla invalida la corrida antes de P1.

### C3 — matching

El matching debe calcularse de forma exacta (Kuhn/caminos aumentantes está bien). Incluir tests unitarios sintéticos con matching máximo conocido antes del censo.

### C4 — control positivo/tight ya conocido

Palabra, convención x_0 a la izquierda:

    m=3
    x=0000000101010111110

Datos ya inspeccionados antes de este preregistro (por tanto NO prospectivos):

    u=0, v=11, b=5, s=0,
    |P|=4, |N|=1,
    M_sh=1,
    |P|-M_sh=3=s+3.

El test debe reproducir este caso justo.

### C5 — base de comparación

Además de M_sh, calcular el matching sin restricción local, es decir

    M_all = min(|P|,|N|).

Reportar la diferencia entre la deficiencia local

    D_sh = |P|-M_sh

y la deficiencia sin restricción

    D_all = |P|-M_all.

Esto mide cuánto cuesta imponer la geometría de sombras, en vez de celebrar solamente un 0 de violaciones.

## 7. Dominio de la primera ejecución

Primera ejecución: **m=2,3,4,5 exhaustivo**, solo puentes largos del sector indicado.

Estos tamaños son desarrollo, no holdout. Reportar para cada m:

1. número total de palabras del dominio;
2. fallas C1, C2 y C3;
3. número de violaciones P1;
4. máximo de D_sh-(s+3);
5. mínimo margen (s+3)-D_sh;
6. histograma de D_sh-D_all;
7. primer falsador en orden de enumeración, si existe, con S, y, u,v,delta,b,s,P,N,J(p), matching máximo y testigo de Hall/matching;
8. número de casos justos D_sh=s+3.

No correr m=6 en esta V1. Si m<=5 pasa, se decide por separado si vale la pena un V2; m=6 no se describirá como holdout virgen.

## 8. Regla de decisión

- Una violación => **SHADOW-MATCH-P1 Refutado**. Congelar el contraejemplo mínimo y abandonar esta carga.
- Cero violaciones m<=5 => **Exploratorio, sobrevive desarrollo**. No promover a Demostrado ni a Observación prospectiva. Solo entonces intentar prueba en papel.
- LC1 permanece **Abierto** en ambos casos.

## 9. Riesgos del auditor incorporados

1. **Sombras fuera de rango:** J(p) se define por intersección con [u,v]; no se evalúan pasos inexistentes para construir el matching.
2. **Niveles con >=3 visitas:** no se elige un retorno arbitrario. El evento positivo p tiene q(p) definido como la visita inmediatamente anterior al mismo nivel.
3. **Doble cobro:** cada negativo es un vértice de capacidad 1 en un matching máximo; por construcción no puede pagar dos positivos.
