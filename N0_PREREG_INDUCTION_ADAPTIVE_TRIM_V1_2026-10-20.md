# N0 — Preregistro INDUCTION-ADAPTIVE-TRIM V1

Fecha: 2026-10-20
Estado: Exploratorio preregistrado; no es prueba.
Autor: ChatGPT.
Motivación: el recorte fijo a=3 fue refutado en m=2 porque puede colapsar excesivamente rho_{m-1}. Esta versión permite exactamente los cinco recortes interiores que mantienen correspondencia completa de centros y no añade otros parámetros.

## Definición
Para m>=2 y a in {1,2,3,4,5}, sea

T_a(x)=x_a ... x_{a+6m-6},

de longitud 6(m-1)+1.

Para j=0,...,4m-4, la ventana de radio m-1 de T_a(x) tiene el mismo centro que la ventana de radio m de x con inicio i=a+j-1, y

S_m(x,i)=S_{m-1}(T_a(x),j)+x_i+x_{i+2m}.

## Predicción P1
Para toda palabra x y todo m>=2,

rho_m(x) <= max_{a=1..5} rho_{m-1}(T_a(x)) + 3.

## Implica para la cota maestra
P1 implica M_m <= M_{m-1}+3. Con M_1=5, M_m<=3m+2 para todo m. Con LB-V216, igualdad exacta.

## Falsador
Una sola palabra x con

rho_m(x) - max_a rho_{m-1}(T_a(x)) >= 4.

mata toda esta vía adaptativa V1. Si falla en m=2 o m=3, no se probarán más variantes de recorte en esta sesión.

## Gates
1. Exhaustivo m=2.
2. Solo si pasa, exhaustivo m=3.

## Controles
C1 longitudes de los cinco T_a.
C2 correspondencia exacta de centros.
C3 identidad de sumas para cada a,j.
C4 el falsador de TRIM fijo 0110100100000 debe tener rho_2=7 y max_a rho_1(T_a)=4, por lo que satisface 7<=4+3.

## Estatus si pasa finito
Observación exhaustiva preregistrada; no demostración universal.
