# N0 — Preregistro INDUCTION-TRIM V1

Fecha: 2026-10-20
Estado: Exploratorio preregistrado; no es prueba.
Autor: ChatGPT.

## Definición
Para m>=2 y x in {0,1}^{6m+1}, sea T(x) la subpalabra obtenida eliminando los tres primeros y los tres últimos bits:

T(x) = x_3 ... x_{6m-3},

de longitud 6(m-1)+1.

Para j=0,...,4m-4, la ventana de radio m-1 de T(x) tiene el mismo centro que la ventana de radio m de x con inicio i=j+2, y

S_m(x,i) = S_{m-1}(T(x),j) + x_i + x_{i+2m}.

## Predicción P1
Para toda palabra x y todo m>=2,

rho_m(x) <= rho_{m-1}(T(x)) + 3.

## Implica para la cota maestra
Con M_1=5, P1 implicaría por inducción

M_m <= 5 + 3(m-1) = 3m+2.

Junto con LB-V216, daría M_m=3m+2 para todo m.

## Falsador
Una sola palabra x con

rho_m(x) - rho_{m-1}(T(x)) >= 4.

mata P1. No afecta al teorema maestro ni a BridgeSlack/LC1/LC2.

## Primer test
Exhaustivo m=2; si pasa, exhaustivo m=3. No mirar m>=4 antes de resolver esos gates.

## Controles
C1. Longitud de T(x) = 6(m-1)+1.
C2. Correspondencia de centros: centro_m(i=j+2) = centro_{m-1}(j) en T(x).
C3. Identidad exacta de sumas anterior para todo j.
C4. Reproducir M_1=5, M_2=8, M_3=11 en los dominios exhaustivos ya conocidos.

## Estatus si pasa finito
Observación exhaustiva preregistrada en esos m, no demostración universal.
