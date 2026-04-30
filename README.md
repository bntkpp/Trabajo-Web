# Tienda Online — Refactorización Clean Code

Proyecto de refactorización de una tienda online desarrollado como trabajo de asignatura. El código original consistía en un único archivo de más de 1.200 líneas con funciones mezcladas, duplicadas y sin estructura. El objetivo fue aplicar principios de **Clean Code** para transformarlo en un sistema modular, mantenible y testeable.

---

## Integrantes

| Nombre | Archivo original |
|---|---|
| Matias Diaz | `Functions.js` |
| Matias Hurtado | `Funciones (matias h)` |
| Bastián Pizarro | `functionsBasti.js` |
| Benjamín Fernández | `funcionesB.js` |
| Cristóbal | `functionsCristobal.js` |
| Victor Salazar Cofré | `function_vsr.js` |

---

## Descripción del problema

El punto de partida fue `original/problema.js`: un archivo monolítico con responsabilidades mezcladas — autenticación, carrito, pagos, inventario, envíos, reportes y utilidades conviviendo sin separación de dominio. Cada integrante aportó funciones propias desde su archivo individual.

### Principales problemas encontrados

- Funciones duplicadas entre archivos (3 versiones distintas de sort, 2 versiones de paginación)
- Datos hardcodeados dentro de funciones que ya existían en la base de datos
- Nombres de campo inconsistentes (`nom`, `prec`, `cat` vs `nombre`, `precio`, `categoria`)
- Funciones que mezclaban múltiples responsabilidades en un mismo archivo
- Sin tests, sin estructura de carpetas, sin separación por dominio

---

## Estructura del proyecto

```
Trabajo-Web/
├── src/
│   ├── database.js       # Fuente de datos: dbUsers, dbProducts, dbOrders
│   ├── auth.js           # Login, registro, validación de formularios
│   ├── productos.js      # Búsqueda y renderizado de productos
│   ├── carrito.js        # Gestión del carrito y wishlist
│   ├── pagos.js          # Cálculo de precios, cupones y procesamiento de pagos
│   ├── envio.js          # Cálculo de costo de envío
│   ├── inventario.js     # Control de stock y estadísticas
│   ├── reportes.js       # Generación de reportes (ventas, productos, usuarios)
│   ├── utils.js          # Utilidades: fechas, paginación, ordenamiento, logs
│   └── borrador/         # Archivos originales de cada integrante (respaldo)
│       ├── functions.js
│       ├── funcionesB.js
│       ├── function_vsr.js
│       ├── functionsBasti.js
│       ├── functionsCristobal.js
│       ├── integracion.js
│       ├── solucion.js
│       └── Funciones (matias h)
├── test/
│   ├── auth.test.js
│   ├── productos.test.js
│   ├── carrito.test.js
│   ├── pagos.test.js
│   ├── envio.test.js
│   ├── inventario.test.js
│   ├── reportes.test.js
│   └── utils.test.js
├── original/
│   └── problema.js       # Archivo original de 1.200+ líneas (solo referencia)
├── package.json
└── README.md
```

---

## Módulos

| Archivo | Exports principales | Fuente |
|---|---|---|
| `auth.js` | `buscarUsuario`, `registrarUsuario`, `validarFormulario` | functions.js, funcionesB.js |
| `productos.js` | `buscarProductos`, `renderProduct` | functions.js, functionsCristobal.js |
| `carrito.js` | `agregarAlCarrito`, `wishlist` | functions.js, function_vsr.js |
| `pagos.js` | `calcularPrecio`, `aplicarCupon`, `procesarPago` | functions.js, funcionesB.js, function_vsr.js |
| `envio.js` | `calcularEnvio` | function_vsr.js |
| `inventario.js` | `verificarInventario`, `obtenerEstadisticas` | function_vsr.js, functions.js |
| `reportes.js` | `hacerReporte` | functionsCristobal.js |
| `utils.js` | `formatDate`, `paginar`, `ordenarPor`, `registrar`, `utils` | funcionesB.js, function_vsr.js, functionsBasti.js, Funciones (matias h) |

---

## Instalación y uso

```bash
# Instalar dependencias
npm install

# Ejecutar tests
npm test

# Verificar estilo de código
npx eslint src/
```

---

## Tests

Los tests están escritos con **Mocha** usando el módulo nativo `assert` de Node.js. Cubren casos positivos y negativos para cada módulo.

```bash
npm test
# → mocha test/**/*.test.js
```

### Resultados

```
  validarFormulario
    ✔ retorna sin errores con datos válidos
    ✔ detecta email inválido
    ✔ detecta contraseñas que no coinciden

  buscarUsuario
    ✔ retorna ok:true con credenciales correctas
    ✔ retorna ok:false con contraseña incorrecta
    ✔ retorna ok:false si el usuario está bloqueado

  agregarAlCarrito
    ✔ agrega un producto al carrito correctamente
    ✔ retorna error si el producto no existe
    ✔ retorna error si no hay suficiente stock

  wishlist
    ✔ agrega un producto a la wishlist
    ✔ remueve un producto de la wishlist

  calcularPrecio
    ✔ retorna el precio base si no hay descuentos ni IVA
    ✔ aplica IVA del 19% correctamente
    ✔ aplica el descuento de nivel correctamente

  procesarPago
    ✔ retorna error si el carrito está vacío
    ✔ procesa el pago correctamente

  buscarProductos
    ✔ retorna todos los productos activos
    ✔ filtra por categoría
    ✔ filtra por texto en el nombre
    ✔ retorna vacío si no hay coincidencias


  20 passing (11ms)
```

---

## Herramientas

- **Node.js** con ES Modules (`"type": "module"`)
- **Mocha** — framework de testing
- **ESLint** — análisis estático de código
- **Prettier** — formateo automático
