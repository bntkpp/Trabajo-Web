# N0 — Preregistro V2 de censo exacto por poda para m=7 y m=8

Fecha: 2026-10-23  
Autor del preregistro: ChatGPT  
Ejecución primaria prevista: Claude  
Estado: **PREREGISTRADO V2 — NO EJECUTAR m>=6 HASTA SELLAR ESTE ARCHIVO Y EL PAQUETE**

Este documento sustituye a:

`N0_PREREG_CENSO_PODA_M7_M8_2026-10-23.md`  
SHA V1: `430e90cf680848319d3bc891b6b53d07ffd84c255ee93c5a72dc89ef6b92d519`

Motivo: V1 permitía podar en `W_lb >= m-1`, lo que era seguro para verificar el
teorema pero eliminaba precisamente las extremales `W=m-1`. Eso hacía imposible
comparar sus listas contra fuerza bruta y preservarlas como holdout de la futura
clasificación `R_m`.

La V2 corrige el corte a:

`W_lb >= m`.

---

## 0. Paquete congelable que implementa este preregistro

Paquete inspeccionado estáticamente antes de redactar V2:

- `censo.c`
  - SHA-256:
    `4a04b46b3bb253245357d41e120f516a2700352056d9d5551c3d52196c621982`
- `brute.c`
  - SHA-256:
    `9cf4a3654c13c5ef356caae6791fed60f8913fad566d40a5f1002f1f11fa41e6`
- `run_censo.sh`
  - SHA-256:
    `e698d41ada89177de5e39e7fcc9c7b6ef2373f18a07c26668c9435a6ddc89793`

El paquete contiene además su manifiesto y una auditoría de Claude.

No se ejecutó `pre`, `m7` ni `m8` durante la redacción de V2.

### Modos del script

- `pre`: regresión `m=2..5`, desarrollo `m=6` (poda contra fuerza bruta) y
  falla plantada en `m=5`.
- `m7`: censo exacto podado de `m=7`.
- `m8`: censo exacto podado de `m=8`; aborta si no existe `M7_AUDITADO.txt`.

El script aborta si la carpeta de salida solicitada ya existe.

---

## 1. Separación de objetivos

Este preregistro cubre **solo** la verificación finita exacta de la cota maestra
para `m=7` y `m=8`.

No preregistra una clasificación de extremales `R_m`.

Diseño congelado:

- desarrollo de `R_m`: `m=4,5,6`;
- `m=6` deja de ser holdout prospectivo de `R_m`;
- holdout prospectivo potencial de `R_m`: listas exactas de `m=7` y `m=8`,
  siempre que no se abran antes de congelar `R_m`;
- el teorema finito en `m=7` y `m=8` tiene su propio preregistro independiente.

`m=7` y `m=8` son dos experimentos secuenciales separados.
No se ejecuta `m=8` hasta que `m=7` esté terminado y exista `M7_AUDITADO.txt`.

---

## 2. Definiciones calculadas desde DEF-CORE

Para `m >= 1`:

- longitud de la palabra: `N=6m+1`;
- longitud de ventana: `L=2m+1`;
- tiempos de ventana: `i=0,...,4m`;
- `S_i = sum_{r=0}^{L-1} x_{i+r}`;
- `y_i = x_{i+m}`;
- clase `C_i=(S_i,y_i)`;
- `rho(x)=# {C_i : 0<=i<=4m}`;
- `W(x)=(4m+1)-rho(x)`.

La cota maestra finita a verificar es:

`rho(x) <= 3m+2`

equivalentemente:

`W(x) >= m-1`.

La implementación primaria `censo.c` calcula directamente desde bits, ventanas,
colores y clases; la poda solo usa un límite inferior monótono de desperdicios ya
certificados en el prefijo.

---

## 3. Predicciones prospectivas

### EXP-M7

Para toda palabra binaria de longitud `43` (`m=7`):

`W(x) >= 6`.

Equivalente:

`rho(x) <= 23`.

### EXP-M8

Solo después de cerrar y auditar EXP-M7:

para toda palabra binaria de longitud `49` (`m=8`):

`W(x) >= 7`.

Equivalente:

`rho(x) <= 26`.

---

## 4. Falsadores

Un solo testigo exacto refuta la predicción correspondiente.

- M7: una palabra de 43 bits con `W <= 5`.
- M8: una palabra de 49 bits con `W <= 6`.

Si aparece un falsador:

1. detener la promoción del resultado;
2. guardar palabra, `S_i`, `y_i`, todas las clases, `rho` y `W`;
3. verificarlo con implementación directa independiente;
4. verificarlo manualmente sobre el listado de clases;
5. no ejecutar el siguiente dominio hasta resolver la discrepancia.

No se cambia el umbral ni la definición después de observar un testigo.

---

## 5. Poda correcta y preservación de extremales

Para un prefijo de bits parcialmente fijado, `censo.c` mantiene:

`W_lb(prefix) = # ventanas ya completas cuya clase ya apareció en una ventana completa anterior`.

Este valor solo puede mantenerse o aumentar al extender el prefijo.

### Lema de seguridad de poda

Para toda extensión `x` del prefijo:

`W(x) >= W_lb(prefix)`.

### Umbral V2

La rama se poda únicamente cuando:

`W_lb(prefix) >= m`.

Este corte:

- es seguro para detectar cualquier falsador `W<m-1`;
- **preserva todas las palabras con `W=m-1`**;
- permite guardar la lista completa de extremales;
- permite comparar esa lista contra fuerza bruta;
- mantiene intacto el futuro holdout de clasificación `R_m`.

No se permite usar el corte `W_lb>=m-1` en estos censos.

El código inspeccionado implementa literalmente:

`if(W2>=m) ... poda ...`

---

## 6. Dominio y simetría

### Programa primario

`censo.c` recorre **todas** las `2^N` palabras.

No usa reducción por complemento ni por reversión.

### Fuerza bruta de referencia

`brute.c` puede usar la simetría de complemento para recorrer `x_0=0` y reconstruir
el dominio completo. La invariancia por complemento está demostrada en Lean.

La reducción usada por `brute.c` no forma parte de la lógica de exhaustividad del
programa primario.

---

## 7. Certificado exacto de cobertura del árbol

Cada rama podada a profundidad `k` representa exactamente:

`2^(N-k)`

extensiones.

La exhaustividad se comprueba mediante la identidad exacta:

`sum_{ramas podadas a profundidad k} 2^(N-k) + #hojas_evaluadas = 2^N`.

`censo.c` acumula esta cantidad con aritmética `unsigned __int128`.

La salida debe contener:

`cobertura_ok=1`.

Si `cobertura_ok=0`:

- la corrida no es exhaustiva;
- el proceso devuelve código de error;
- ningún resultado científico de esa corrida se acepta.

No basta con que `falsadores=0`.

---

## 8. Regresión congelada

Antes del holdout se exige reproducir exactamente fuerza bruta y poda en
`m=2,3,4,5`.

Valores sobre **todas** las palabras:

| m | extremales `W=m-1` | nodos del censo podado |
|---|---:|---:|
| 2 | 16 | 1.071 |
| 3 | 52 | 18.455 |
| 4 | 60 | 289.467 |
| 5 | 44 | 4.342.933 |

Para cada `m=2..5` debe cumplirse:

1. `cobertura_ok=1`;
2. `falsadores=0`;
3. `min W=m-1` en fuerza bruta;
4. la lista de extremales producida por poda coincide exactamente con la lista de
   fuerza bruta, comparada automáticamente.

Cualquier discrepancia invalida el paso a `m=6`.

---

## 9. Desarrollo m=6

`m=6` es desarrollo, no holdout de `R_m`.

El modo `pre` debe ejecutar:

- censo podado `m=6`;
- fuerza bruta de referencia `m=6`;
- comparación automática de las listas de extremales;
- comprobación `cobertura_ok=1`;
- comprobación de ausencia de falsadores;
- comprobación `min W=5` en fuerza bruta.

No se ejecuta M7 si `pre` no termina con todas las regresiones y comparaciones
satisfechas.

El tiempo esperado no es evidencia y no forma parte de la predicción científica.

---

## 10. Falla plantada

La falla plantada usa un **binario separado**, compilado desde el mismo `censo.c`
con:

`-DPLANT`.

No se modifica el binario primario.

En esa compilación, el criterio deliberadamente incorrecto es:

`W < m`

en lugar de:

`W < m-1`.

### Predicción exacta del control

En `m=5` debe reportar exactamente:

`falsadores=44`.

Esas 44 palabras son todas las extremales conocidas con `W=4`.

Si no reporta exactamente 44:

- falla el control;
- `pre` no es válido;
- no se ejecuta M7.

El script actual implementa esta comprobación mediante:

`grep -q "falsadores=44"`.

---

## 11. Integridad de fuentes y binarios

Antes de compilar, `run_censo.sh` verifica:

`sha256sum -c MANIFEST.sha256`.

El script genera:

`SHA_BINARIOS.txt`

para los binarios compilados.

En modo `pre`, después de la falla plantada, el script vuelve a verificar los hashes
de los binarios mediante `sha256sum -c`.

### Requisito normativo adicional para M7/M8

Para M7 y M8 también debe verificarse el hash del binario primario **después** de
la corrida contra el hash registrado antes del holdout.

La versión del script inspeccionada registra `SHA_BINARIOS.txt` pero no ejecuta
automáticamente ese `sha256sum -c` post-holdout.

Por tanto, antes de sellar el paquete definitivo debe hacerse una de estas dos cosas:

1. añadir al script la verificación post-holdout; o
2. registrar y ejecutar ese chequeo como paso externo obligatorio de auditoría.

No se declarará el paquete automatizado como plenamente autocontenido mientras
falte esa comprobación automática.

---

## 12. Guardas operativas

El script:

- aborta si el directorio de salida ya existe;
- `m8` aborta si no existe `M7_AUDITADO.txt`.

Además, el protocolo exige:

- ejecutar `pre` y cerrarlo como OK antes de M7;
- auditar M7 y crear `M7_AUDITADO.txt` antes de M8;
- no modificar el código primario entre M7 y M8.

Si el código cambia, M8 requiere nuevo hash, nueva auditoría y decisión explícita
sobre si hace falta un nuevo preregistro.

---

## 13. Reserva de las listas M7/M8 para R_m

Para cada holdout:

- `HOLDOUT_ext{m}.txt` contiene la lista exacta de extremales;
- `HOLDOUT_stats{m}.txt` contiene estadísticas asociadas;
- ambos archivos se hashean;
- **no se abren ni se inspeccionan** antes de congelar `R_m`.

El resumen visible de la corrida no debe mostrar el conteo de extremales.

Sí puede mostrar:

- número de nodos;
- número de ramas podadas;
- `cobertura_ok`;
- número de falsadores;
- código de retorno;
- distribución de profundidades de poda.

La ausencia de falsadores certifica para el censo:

`min W >= m-1`.

Pero no revela cuántas extremales existen.

### Regla de contaminación del holdout

Si `HOLDOUT_ext7.txt` o `HOLDOUT_stats7.txt` se abre antes de congelar `R_m`,
M7 sigue siendo válido para el teorema finito, pero deja de ser holdout prospectivo
para la clasificación.

Lo mismo para M8.

---

## 14. Secuencia congelada

1. Congelar V2 y su SHA.
2. Congelar paquete de código y manifiesto.
3. Verificar SHA de fuentes.
4. Ejecutar `pre`.
5. Confirmar regresión exacta m=2..5.
6. Confirmar desarrollo m=6 contra fuerza bruta.
7. Confirmar falla plantada exacta: 44 falsadores en m=5.
8. Confirmar hashes de binarios tras `pre`.
9. Congelar/auditar salida `pre`.
10. Ejecutar M7.
11. Comprobar `cobertura_ok=1` y `falsadores=0`.
12. Verificar hash post-corrida del binario primario.
13. Hashear sin abrir archivos reservados de extremales/estadísticas.
14. Auditar M7.
15. Crear `M7_AUDITADO.txt`.
16. Solo entonces ejecutar M8.
17. Repetir cobertura, falsadores e integridad de binario.
18. Crear segunda implementación independiente.
19. Comparar resultados exactos y testigos.
20. Solo entonces promover a **Certificado exacto**.

---

## 15. Segunda implementación y estatus

Una implementación exhaustiva exitosa no basta para la etiqueta
**Certificado exacto** bajo el protocolo N0.

Se exige:

- segunda implementación de autor distinto;
- al menos una implementación directa desde
  `bits -> ventanas -> clases -> rho/W`;
- comparación automática;
- controles plantados;
- hashes de fuentes, binarios y resultados.

Antes de reproducción independiente:

**Observación exhaustiva por una implementación — pendiente de reproducción independiente.**

Después de coincidencia independiente:

- **Certificado exacto para m=7**, si corresponde;
- **Certificado exacto para m=8**, si corresponde.

Estos resultados finitos no son una demostración universal en `m`.

---

## 16. Relación futura con R_m

`R_m` no se define en este preregistro.

Después de incorporar `m=6` al desarrollo:

1. ChatGPT propone una definición bit-a-bit general de `R_m`;
2. Claude la audita contra desarrollo;
3. se congelan cobertura esperada, tamaño y precisión;
4. solo después se abren los holdouts M7/M8.

Si no aparece una definición limpia antes de los censos, los holdouts pueden
mantenerse sellados indefinidamente.

No se fuerza una clasificación para justificar haber generado los datos.

---

## 17. Decisión

Las predicciones científicas exactas son:

- M7: `min W >= 6`;
- M8: `min W >= 7`.

Falsador:

- una palabra exacta con `W<6` en M7;
- una palabra exacta con `W<7` en M8.

La poda en `W_lb>=m` es una optimización exacta que conserva extremales y
falsadores.

La exhaustividad requiere `cobertura_ok=1`.

Las listas de extremales M7/M8 permanecen selladas como holdout de `R_m` hasta
que la clasificación quede congelada.
