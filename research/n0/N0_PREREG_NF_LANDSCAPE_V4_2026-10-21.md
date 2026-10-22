# N0 — Preregistro NF-LAND-V4 (Ruta 2: forma normal por movimientos locales)

Fecha: 2026-10-21
Autor: Claude. Revisión previa al sello: ChatGPT, `N0_NF_LAND_V1_REVIEW_CHATGPT_2026-10-21.md` (R1–R9).
Sustituye a V1 (`f010759c…4e6b`), V2 (`87611603…6455`) y V3 (`b79bb862…86ce`), ninguna sellada. V4 corrige los bloqueadores del ejecutor señalados por ChatGPT en `N0_PACKAGE_STATIC_REVIEW_CHATGPT_2026-10-21.md` (SHA `8dde4e49…df32`).
Estado: **Preregistro, sin datos vistos.** Ningún cálculo de este preregistro se ha corrido. Requiere sello de Mati antes de ejecutar.

## Cambios de V4 respecto de V3 (revisión estática del paquete, ChatGPT)

- **Memoria:** se eliminaron los arreglos `T` y `O` (hasta ~512 MiB sin verificar). Ahora las líneas TRAP se imprimen sin ordenar y `run_nf.sh` las ordena; las órbitas se cuentan con un arreglo de bits de N/8 bytes. Todas las reservas de memoria se verifican y una falla sale con código 3. Un aborto por señal (código ≥ 128) también se trata como aborto.
- **Manifiesto:** `nf/MANIFEST.sha256` lista los hashes de `nf_land.c`, `nf_ref.py` y `run_nf.sh`. `run_nf.sh` lo comprueba antes de todo y sale con código 2 si algo cambió. El hash del manifiesto queda en §10.
- **Monohilo:** el ejecutor usa un solo hilo. La estimación de tiempo se corrige en §9.
- **Robustez:** cabeceras en V4, registro de `python3 --version`, y fallas acumuladas en una función y un archivo (`FALLAS.txt`) en vez de variables dentro de pipes.

## Incidente previo al sello (2026-10-21, transparencia)

Al probar el guardia de manifiesto, una escritura de `run_nf.sh` falló sin que lo notara, y la prueba se ejecutó con el script V3, que no tenía manifiesto, con `NF_SEAL_CONFIRMED=YES` y en una carpeta temporal. Los controles fallaron, porque el ejecutor V4 imprime TRAP sin ordenar y el script V3 no ordenaba. No se imprimió ninguna medida primaria. La única línea vista fue `CONTROLES: FALLA — no se reporta ninguna medida primaria`. La carpeta temporal se borró sin inspeccionar. No se usó nada de esa ejecución para modificar el diseño. Desde V4 el guardia de manifiesto va antes del guardia de sello, y la prueba de guardias se hace sin la variable de sello.

## Cambios respecto de V1 (todos por la revisión de ChatGPT, R1–R9)

1. m = 5 ya fue inspeccionado en censos anteriores, así que **no es holdout virgen**. Se reetiqueta como reproducción prospectiva (§7).
2. Se especifican el algoritmo y la memoria del ejecutor (§9). La estimación de memoria de V1 (menos de 300 MiB) era baja; la correcta es unos 480 MiB.
3. Se agrega una falla plantada propia del ejecutor (§6, C5).
4. M2 conserva el número de unos: 0^{6m+1} y 1^{6m+1} no tienen movimientos y son trampas aisladas con ρ = 1. **M2 nunca puede ser VIABLE-FUERTE.** Pasa a ser control negativo derivado (§5, §6 C6), no candidato.
5. Si P1 = 0 trampas, P3 = 100 % es automático: en el grafo de mesetas condensado cada salida estricta sube ρ, y sin sumideros subóptimos todo camino termina en M_m. P3 pasa a ser control de consistencia en ese caso (§6 C7), no evidencia independiente.
6. (R4) El algoritmo de P1–P4 queda fijado en §9: DSU para mesetas, trampas y órbitas canonizadas bajo las 4 simetrías, y P3 por programación dinámica sobre el DAG de mesetas, nivel por nivel en orden decreciente de ρ.
7. (R7) Nuevo control C8 de monotonía entre conjuntos de movimientos (§6).
8. (R8) El umbral de 3 órbitas es una regla de gestión, no tiene significado estadístico (§5).
9. (R9) Nuevo campo "Implica para la cota maestra" (§8).
10. (R2) Se registra el entorno (compilador, flags, CPU, RAM, tiempo) y se fija una regla de aborto por memoria (§9).

## 0. Motivación y corrección previa

La Ruta 2 propone probar ρ ≤ 3m+2 así: (i) definir una familia simple 𝒩 de palabras ("formas normales") donde la cota sea fácil; (ii) mostrar que toda palabra fuera de 𝒩 tiene un movimiento local x → x′ con ρ(x′) ≥ ρ(x) que la acerca a 𝒩 según un potencial Φ.

**Corrección a lo dicho el 2026-10-20:** afirmé que "cada movimiento se verifica de forma local". Es falso: ρ es un conteo global de clases distintas, así que ρ(x′) ≥ ρ(x) es una afirmación global aunque el movimiento sea local. La ruta sigue siendo distinta de las refutadas (no es una regla de pago local lineal; RESULTADO_LP_DESCARGA_V1 descartó esa familia).

Pregunta previa y barata: **¿el paisaje de ρ bajo movimientos locales tiene trampas?**

## 1. Datos

- **Desarrollo:** m = 2, 3, 4, exhaustivo (2^13, 2^19 y 2^25 = 33.554.432 palabras).
- m = 5: en esta etapa **no se calcula nada** de este preregistro (ver §7).
- ρ según DEF-CORE congelado.

## 2. Movimientos

- **M1 (candidato):** cambiar un bit (6m+1 vecinos).
- **M3 (candidato):** M1 ∪ transposiciones adyacentes x_k ↔ x_{k+1} con x_k ≠ x_{k+1}.
- **M2 (control negativo):** solo transposiciones adyacentes.

No se agregan movimientos. Un conjunto nuevo exige un preregistro nuevo.

## 3. Definiciones

- Arista x → x′ si x′ es vecino según M y ρ(x′) ≥ ρ(x).
- **Meseta:** componente conexa del grafo no dirigido de vecinos con ρ(x′) = ρ(x).
- **Sumidero:** meseta sin vecino de ρ estrictamente mayor.
- **Trampa:** sumidero con ρ < M_m = 3m+2.
- **Simetrías:** reversión y complemento (grupo de orden 4). Preservan ρ y conmutan con M1, M2 y M3.

## 4. Medidas primarias (por m, para M1 y M3)

- **P1:** número de trampas (mesetas), palabras en trampas y órbitas de trampas.
- **P2:** distribución de la profundidad M_m − ρ de las trampas.
- **P4:** número de mesetas con ρ = M_m.
- **P3 (descriptiva):** fracción de palabras desde las que hay un camino con ρ no decreciente hasta ρ = M_m. Si P1 = 0, P3 es un control (C7), no un resultado.

## 5. Criterio de decisión (fijo, solo para M1 y M3)

- **VIABLE-FUERTE:** 0 trampas en m = 2, 3 y 4.
- **VIABLE-DÉBIL:** hay trampas, pero a lo más 3 órbitas de trampas en cada m = 2, 3, 4. Se fichan para buscar una familia común.
- **NO VIABLE:** más de 3 órbitas de trampas en m = 4. La Ruta 2 con ese M queda **Refutada** como ruta de paisaje sin trampas. No se reajusta el umbral ni se cambia M a posteriori.

Si ni M1 ni M3 resultan viables, la Ruta 2 queda estacionada y se registra en el ledger. M2 no entra en la decisión.

**Nota (R8):** el umbral de 3 órbitas no tiene significado matemático ni estadístico. Solo decide si vale la pena fichar las excepciones a mano.

## 6. Controles (si falla uno, no se reporta ninguna medida primaria)

- **C1:** M_m recalculado = 8, 11, 14 para m = 2, 3, 4 (coincide con CERT-M5).
- **C2:** ρ del programa en C contra una referencia en Python escrita aparte: todas las palabras de m = 2 y 10.000 palabras aleatorias (semilla 20261021) de m = 3 y m = 4. Cero discrepancias.
- **C3:** cierre por simetría. Cada imagen de una trampa es una trampa con el mismo ρ y el mismo tamaño de meseta.
- **C4:** en m = 2, P1 a P4 para M1, M2 y M3 calculados también por fuerza bruta en Python (BFS directo). Deben coincidir exactamente con el programa en C.
- **C5 (falla plantada del ejecutor):** en m = 2, una corrida con la tabla de ρ corrompida en una palabra fija (la palabra de menor índice entero con ρ = M_2, con la convención bit i = x_i, rebajada a ρ = 0) debe producir una discrepancia en C4. Si C4 no la detecta, el ejecutor no es confiable.
- **C6 (control negativo derivado):** con M2, 0^{6m+1} y 1^{6m+1} deben aparecer como trampas aisladas (meseta de tamaño 1, ρ = 1) en cada m.
- **C7 (consistencia):** para todo M con P1 = 0 en algún m, P3 debe ser exactamente 100 % en ese m.
- **C8 (monotonía, R7):** como M3 = M1 ∪ M2, para cada m: (i) si M1 tiene 0 trampas, M3 también; (ii) P3(M3) ≥ P3(M1) y P3(M3) ≥ P3(M2). Una violación indica un error del ejecutor.

## 7. Etapa B (no incluida aquí)

Si M1 o M3 resultan viables, se congelará con un nuevo preregistro una hipótesis concreta H-NF (familia 𝒩 y potencial Φ) usando solo m ≤ 4. Se probará en m = 5 como **reproducción prospectiva en un parámetro ya inspeccionado, no como holdout virgen**: m = 5 ya se recorrió en censos anteriores (CERT-M5 y otros). Un holdout virgen tendría que ser m ≥ 6 con un diseño factible, que se definirá en ese preregistro.

## 8. Etiquetas e implicancia

Todo resultado de esta etapa es **Exploratorio**.

**Implica para la cota maestra (R9): nada directamente.** Incluso VIABLE-FUERTE solo habilita diseñar H-NF. La cota universal requeriría después demostrar el lema de movimiento ρ(x′) ≥ ρ(x) para la regla elegida, que es global, y un potencial bien fundado que termine en una familia normal 𝒩 donde ρ ≤ 3m+2.

## 9. Algoritmo y memoria del ejecutor

Para cada m y cada M, con N = 2^{6m+1} palabras indexadas por su entero:

1. **Tabla de ρ:** `uint8_t rho[N]`, calculada una vez (m = 4: 32 MiB).
2. **Mesetas:** union-find `uint32_t par[N]` (m = 4: 128 MiB). Para cada x y cada vecino x′ > x según M, se une si ρ(x′) = ρ(x). Inspecciones de vecinos: N·|M|/2 por pasada (M3, m = 4: unas 8,2 × 10^8).
3. **Sumideros:** `uint8_t up[N]` por raíz de meseta. Se marca up[raíz(x)] = 1 si x tiene algún vecino con ρ(x′) > ρ(x). Segunda pasada sobre todos los vecinos (M3, m = 4: hasta 1,64 × 10^9 inspecciones, solo lecturas de tabla).
4. **P3:** `uint8_t reach[N]` por raíz de meseta, procesando los niveles de ρ en orden decreciente. Una raíz alcanza M_m si su nivel es M_m o si algún miembro tiene un vecino de nivel estrictamente mayor cuya raíz alcanza M_m (ya calculado, porque su nivel es mayor). Una pasada por nivel.
5. **Tamaños:** `uint32_t size[N]` y `uint32_t omin[N]` indexados por raíz (m = 4: 128 MiB cada uno).
6. **Órbitas:** cada trampa se identifica por el mínimo de g(w) sobre todas las palabras w de su meseta y las 4 simetrías g. Ese valor es el mismo para todas las mesetas de una órbita. Las órbitas distintas se cuentan con un arreglo de bits `seen` de N/8 bytes (m = 4: 4 MiB). Las líneas TRAP se imprimen sin ordenar.

Memoria total estimada para m = 4: unos 484 MiB (rho 32 + par 128 + up 32 + reach 32 + size 128 + omin 128 + seen 4). **Regla de aborto:** cada corrida se ejecuta con `ulimit -v` de 1 GiB. Si una reserva de memoria falla, el ejecutor sale con código 3 y se aborta todo sin reportar medidas. Tiempo estimado: el ejecutor es **monohilo**. Para m = 4, cada M hace del orden de 2 × 10^9 lecturas de tabla y 10^8 evaluaciones de simetría; la estimación es de decenas de minutos en total para las 9 corridas. No se midió con datos reales.

**Registro del entorno (R2):** `run_nf.sh` guarda en `ENTORNO.txt` la versión de gcc y de Python, los flags (`-O2`, monohilo), `uname -a`, el modelo de CPU, `nproc`, la RAM total y el tiempo de cada corrida.

El código se congela con su hash antes de la primera ejecución y se publica junto al resultado.

## 10. Código congelado (escrito antes de cualquier ejecución válida; ver Incidente)

| Archivo | SHA-256 |
|---|---|
| `nf/nf_land.c` (ejecutor, monohilo) | `cb5b99ec815958cb26b2f9c36c756ace9ef76bbd03bcc223f98697c06d5d5626` |
| `nf/nf_ref.py` (referencia independiente, C2 y C4) | `fb0c413a4e0d06f4f9ee30f2d160aa21ca1170bfd8227f14187ba01e1ad41baf` |
| `nf/run_nf.sh` (orquestador; manifiesto, sello, C1–C8, entorno, aborto) | `f429ec344a46be3c1d8ba87d9a1237301b1fe7da203d3bef6e6bafa7d501b9fa` |
| `nf/MANIFEST.sha256` (los tres anteriores) | `5bd17a471d1a67a365af9fa065f4eded57ddf6653c12387bbbb4c362d8f49e62` |

Guardias probados sin datos: sin `NF_SEAL_CONFIRMED`, salida 2; con un archivo alterado, salida 2 por manifiesto, antes de compilar.

Si un control falla por un error del código, la corrección se documenta como enmienda con el hash nuevo, antes de mirar ninguna medida primaria.
