# Adenda A1 al preregistro V2 CENSO-PODA M7/M8 (Claude, 2026-10-23)

Se refiere a: `N0_PREREG_CENSO_PODA_M7_M8_V2_2026-10-23.md`, SHA `9067a955523403aa92f3c6f09e7afe23e941953c2ca68517237e7dd6d43b0f03`.

No modifica código, predicciones ni falsadores. El paquete sigue igual:
- `censo.c` 4a04b46b…
- `brute.c` 9cf4a365…
- `run_censo.sh` e698d41a…

## A1.1 Verificación del binario después de cada censo (V2 §11, opción 2)

Se adopta la opción 2 de V2 §11: un paso externo obligatorio, sin tocar el script. Después de cada corrida M7 y M8:

    sha256sum -c DIR_SALIDA/SHA_BINARIOS.txt  > DIR_SALIDA/POST_BINARIOS.txt

El resultado tiene que ser OK para los 3 binarios. Se guarda en `POST_BINARIOS.txt` y su hash se registra en el informe. Si algún binario falla, el censo no se cierra.

## A1.2 Corrección de alcance del holdout (V2 §13)

V2 §13 permite mostrar nodos y ramas podadas, pero ocultar el conteo de extremales. **Esas dos cosas no son compatibles.**

En el árbol binario de `censo.c`, cada nodo interno tiene 2 hijos, y cada hijo o se poda o se visita. Por lo tanto:

    hojas = (nodos + 1 − podadas) / 2

Comprobado en m = 5: (4.342.933 + 1 − 4.342.846) / 2 = 44. Lo mismo pasa con la distribución por profundidad, porque permite reconstruir las hojas desde 2^N.

Si falsadores = 0, hojas = número de extremales. **El conteo queda determinado por el resumen visible.**

Hay dos alternativas: ocultar también nodos, ramas podadas y profundidades, o aceptar que el conteo se conoce. Se adopta lo segundo:

- **El holdout de 𝓡_m protege la LISTA de extremales (`HOLDOUT_ext{m}.txt`), no su conteo.** La lista sigue sin abrirse hasta que 𝓡_m esté congelada.
- El conteo total de extremales en m = 7 y 8 se considera conocido. Por tanto, el futuro preregistro de 𝓡_m **no puede presentar como prospectiva** ninguna predicción que dependa exclusivamente de ese conteo.
- **Sí sigue siendo prospectivo** todo lo que dependa de la identidad de las palabras extremales, en particular:
  - la cobertura de 𝓡_m (qué extremales quedan dentro o fuera de la clase);
  - la intersección exacta `𝓡_m ∩ E_m`;
  - la precisión observada de 𝓡_m, porque su numerador `|𝓡_m ∩ E_m|` no se conoce mientras la lista permanezca sellada.
- Si posteriormente la cobertura resulta ser 100%, entonces la precisión queda determinada por `|E_m| / |𝓡_m|`; en ese caso deja de aportar información prospectiva adicional una vez conocida la cobertura.
