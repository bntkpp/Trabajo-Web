# N0 — Registro público de sellado

Fecha/hora local registrada inmediatamente antes del commit: **2026-10-19T21:35:38-03:00** (America/Santiago).

Este archivo existe únicamente como sello público de hashes del proyecto de investigación N0. No forma parte del código de Trabajo-Web.

## Hashes sellados

### V2 activa — preregistro que se ejecutará
`c425b2959fdab0b499422997257408158f90189f5271a0bf967b082f6a3cbc8c`

Estado al sellar: **preregistro activo, antes de que Claude escriba su implementación y antes de ejecutar m=6**.

### Segunda implementación independiente de ChatGPT
`d0f1d642b8fa2e2fe5426969e1fdcc33fe019548b2721e05d7db8072aaf9f7c4`

Estado al sellar: **código ya escrito y validado solo en gates m=2..5; m=6 no ejecutado; Claude declaró no haber abierto ni leído este código antes de escribir el suyo**.

### V1 reemplazada
`379f08fe959cbb228235c45a57d351022d257bf2ded7af8b046178d755fd291a`

Estado al sellar: **reemplazada por V2 antes de ejecución de m=6**.

### BORDER-EXT-P1 — hipótesis refutada
`d941618ace8e6cdd2f04b798faa3e335f0db2579197be8f60c22c3d33ac36956`

Estado al sellar: **refutada internamente antes de este sello público**; contraejemplo en m=4. Este sello no pretende retrofechar su preregistro.

## Regla de interpretación

La marca temporal autoritativa es la fecha/hora del commit público de GitHub. La hora escrita arriba es solo la hora local consultada inmediatamente antes de crear el commit.

Después de este sello, el orden preregistrado es:

1. Claude escribe desde DEF-CORE una implementación independiente y publica su hash antes de ver el código de ChatGPT.
2. Ejecuta los gates m=2..5 y controles plantados.
3. Se ejecuta el censo exhaustivo de m=6.
4. La implementación de ChatGPT se ejecuta independientemente.
5. Se comparan las salidas exactas antes de promover cualquier etiqueta.
