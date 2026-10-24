# N0 — CE-V1 Adenda A1: orden mínimo/máximo

Fecha: 2026-10-23
Autor: ChatGPT

Se refiere a:
`N0_PREREG_CRITICAL_EXCURSION_V1_2026-10-23.md`
SHA-256:
`e707ddabf8f51c3b20eb0319c1bb67f525176777aa1c2d895d562b294c392e82`

Esta adenda NO modifica el enunciado CE-V1, el dominio, el falsador ni la regla de decisión.
Solo corrige/completa la justificación de la desigualdad auxiliar `alpha_i + beta_i <= d`.

## Lema de orden

En un corte con

\[
G_i=m+3,
\]

el mínimo del tramo \(T_i=(S_i,\ldots,S_{i+L})\) ocurre antes que el máximo.

### Prueba

Supóngase que el máximo ocurre antes que el mínimo.

Sea
\[
M=\max T_i,\qquad m_T=\min T_i.
\]

Recordando
\[
\alpha_i=S_i-m_T,\qquad
\beta_i=M-S_{i+L},
\qquad
S_{i+L}-S_i=G_i=m+3,
\]
se obtiene
\[
M-m_T
=
\alpha_i+G_i+\beta_i
\ge m+3.
\]

Para ir desde el máximo al mínimo el camino necesita al menos \(M-m_T\) pasos de bajada, luego
\[
d\ge M-m_T\ge m+3.
\]

Pero en un corte \(G_i=m+3\),
\[
2d+f=m-2,
\]
de modo que
\[
d\le\frac{m-2}{2}<m+3,
\]
contradicción.

Por tanto el mínimo ocurre antes que el máximo.

## Consecuencia

Las `alpha_i` unidades de descenso necesarias antes de alcanzar el mínimo y las
`beta_i` unidades de descenso necesarias después de alcanzar el máximo se cargan
a pasos `-1` disjuntos. Por tanto

\[
\boxed{\alpha_i+\beta_i\le d.}
\]

Estado: **demostración propuesta en papel**, pendiente de auditoría cruzada.
