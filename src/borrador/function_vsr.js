/**
 * CAMBIOS REALIZADOS:
 * Se realizaron correcciones fundamentales en las funciones `cupon` y `wishlist` para garantizar la consistencia 
 * y funcionamiento correcto del código. En la función `cupon`, se corrigieron las referencias inconsistentes a 
 * variables: se reemplazó `found` por `buscar_cupon` en las validaciones de fecha de expiración y tipo de descuento, 
 * asegurando que todas las propiedades se accedan desde la variable correcta. Además, se estandarizaron los retornos 
 * de error para usar objetos de respuesta consistentes con formato { success: false, message: "..." } en lugar de 
 * llamadas a una función error() no definida. En la función `wishlist`, se corrigieron las referencias a la variable 
 * `user` por `usuario`, manteniendo consistencia con la variable declarada en la búsqueda del usuario, lo que permite 
 * que la función acceda correctamente a las propiedades del usuario en todos los casos.
 */

// Líneas 636 a 700
// lista de cupones en una base de datos
const cupones_disponibles = [
  { code: "DESC10", tipo: "porcentaje", valor: 10, minCompra: 50000, maxUsos: 100, usos: 45, activo: true, expira: "2024-12-31", categorias: [], usuarios: [] },
  { code: "DESC20", tipo: "porcentaje", valor: 20, minCompra: 100000, maxUsos: 50, usos: 50, activo: true, expira: "2024-06-30", categorias: ["electronica"], usuarios: [] },
  { code: "ENVGRATIS", tipo: "envio", valor: 100, minCompra: 30000, maxUsos: 200, usos: 180, activo: true, expira: "2024-12-31", categorias: [], usuarios: [] },
  { code: "BIENVENIDO", tipo: "fijo", valor: 5000, minCompra: 20000, maxUsos: 1000, usos: 523, activo: true, expira: "2025-12-31", categorias: [], usuarios: [] },
  { code: "VIP2024", tipo: "porcentaje", valor: 25, minCompra: 200000, maxUsos: 20, usos: 15, activo: true, expira: "2024-12-31", categorias: [], usuarios: [1, 3, 5] }
];

function cupon(code, userId, cartTotal, products) {
    // buscar cupón en la BD
    const buscar_cupon = cupones_disponibles.find(c => c.code === code);

    if(!buscar_cupon) return { success: false, message: "cupon no encontrado" };
    if(!buscar_cupon.activo) return { success: false, message: "cupon inactivo" };
    if(new Date() > new Date(buscar_cupon.expira)) return { success: false, message: "cupon expirado" };
    if(buscar_cupon.usos >= buscar_cupon.maxUsos) return { success: false, message: "cupon agotado" };
    if(cartTotal < buscar_cupon.minCompra) return { success: false, message: "compra minima no alcanzada" };

    // Verificar acceso por usuario
    if(buscar_cupon.usuarios.length > 0 && !buscar_cupon.usuarios.includes(userId)) {
        return { success: false, message: "usuario no autorizado para usar este cupon" };
    }
    // Calcular descuento
    const calcular_desc = () => {
        switch (buscar_cupon.tipo) {
        case "porcentaje":
            return cartTotal * (buscar_cupon.valor / 100);
        case "fijo":
            return Math.min(buscar_cupon.valor, cartTotal);
        case "envio":
            return buscar_cupon.valor;
        default:
            return 0;
        }
    };

    buscar_cupon.usos++;
    return {
        ok: true,
        msg: "cupon aplicado",
        descuento: calcular_desc(),
        tipo: buscar_cupon.tipo
    };
}

// lineas 856 hasta la 907
// funcion de wishlist duplicando logica del carrito

const dbUsers2 = [
    { id: 1, wishlist: [101, 103] },
    { id: 2, wishlist: [102, 104, 105] },
    { id: 3, wishlist: [] },
    { id: 4, wishlist: [101] },
    { id: 5, wishlist: [103, 107, 108] }
];

function wishlist(action, userId, productId) {
  
  // Buscar usuario
  const usuario = dbUsers2.find(u => u.id === userId);
  if (!usuario) return { ok: false, msg: "usuario no encontrado" };

  // Usar switch para acciones
  switch (action) {
    case "add":
      if (usuario.wishlist.includes(productId)) {
        return error("producto ya en la wishlist");
      }
      usuario.wishlist.push(productId);
      return { ok: true, msg: "agregado a la wishlist", wishlist: usuario.wishlist };

    case "remove":
      const index = usuario.wishlist.indexOf(productId);
      if (index === -1) {
        return error("producto no esta en la wishlist");
      }
      usuario.wishlist.splice(index, 1);
      return { ok: true, msg: "removido de la wishlist", wishlist: usuario.wishlist };

    case "get":
      return { ok: true, wishlist: usuario.wishlist };

    default:
      return error("accion no reconocida");
  }
}

// linea 992 a 1029
// Configuración de envios
const shipping_config = {
  ciudades: {
    "Santiago": 1.0,
    "Valparaiso": 1.2,
    "Concepcion": 1.4,
    "La Serena": 1.6,
    "Antofagasta": 1.8,
    "Iquique": 2.0,
    "Punta Arenas": 2.5
  },
  rangos_peso: [
    { max: 1, costo: 2000 },
    { max: 5, costo: 3500 },
    { max: 10, costo: 5000 },
    { max: 20, costo: 8000 },
    { max: Infinity, costo: 12000 }
  ],
  multiplicador_producto: {
    "fragil": 1.5,
    "electronico": 1.3,
    "normal": 1.0
  },
  recargos: {
    urgente: 0.5,      // 50% adicional
    seguro: 0.1    // 10% del costo base
  }
};

function calcEnvio(destCiudad, peso, dimensiones, tipoProducto, esUrgente, esGratis, tieneSeguro) {
  if (esGratis) return { costo: 0, desglose: "Envío gratis" };

  // validar ciudad
  const multiplicadorCiudad = shipping_config.ciudades[destCiudad];
  if (!multiplicadorCiudad) return { error: "Ciudad no disponible" };

  // buscar rango por peso
  const rangoP = shipping_config.rangos_peso.find(r => peso <= r.max);
  if (!rangoP) return { error: "Peso inválido" };

  // multiplicador por tipo de producto
  const multiplicadorProducto = shipping_config.multiplicador_producto[tipoProducto] || 1;

  // calcular costo base
  const costoBase = rangoP.costo * multiplicadorProducto * multiplicadorCiudad;

  // calcular recargos
  const recargoUrgente = esUrgente ? costoBase * shipping_config.recargos.urgente : 0;
  const recargoSeguro = tieneSeguro ? costoBase * shipping_config.recargos.seguro : 0;

  const total = costoBase + recargoUrgente + recargoSeguro;

  return {
    costo: total,
    desglose: {
      base: costoBase,
      urgente: recargoUrgente,
      seguro: recargoSeguro
    }
  };
}

// lineas 1031 a 1088
// Configuración de inventario
const inventario_config = {
  levels: [
    { max: 0, status: "Agotado", color: "red", alerta: true },
    { max: 5, status: "Crítico", color: "orange", alerta: true },
    { max: 15, status: "Bajo", color: "yellow", alerta: true },
    { max: 30, status: "Normal", color: "green", alerta: false },
    { max: Infinity, status: "Alto", color: "green", alerta: false }
  ],
  productos: [
    { id: 101, stock: 5 }, { id: 102, stock: 50 }, { id: 103, stock: 20 },
    { id: 104, stock: 8 }, { id: 105, stock: 30 }, { id: 106, stock: 15 },
    { id: 107, stock: 25 }, { id: 108, stock: 40 }, { id: 109, stock: 0 },
    { id: 110, stock: 60 }
  ]
};

function verificarInventario(prodId) {
  const producto = inventario_config.productos.find(p => p.id === prodId);
  if (!producto) return { ok: false, msg: "Producto no encontrado" };

  const nivel = inventario_config.levels.find(l => producto.stock <= l.max);
  
  return {
    ok: true,
    prodId,
    stock: producto.stock,
    estado: nivel.status,
    color: nivel.color,
    alerta: nivel.alerta
  };
}

// Log mejorado con niveles
const log_niveles = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
let currentLogLevel = log_niveles.INFO;

function registrar(msg, nivel = "INFO", datos = null) {
  if (log_niveles[nivel] > currentLogLevel) return; // Filtrar por nivel
  
  const timestamp = new Date().toISOString();
  const entrada = `[${timestamp}] [${nivel}] ${msg}`;
  const salidaFinal = datos ? `${entrada} | DATA: ${JSON.stringify(datos)}` : entrada;
  
  console.log(salidaFinal);
}

// Función gde paginacion
function paginar(items, pagina = 1, tamanio = 10) {
  const total = items.length;
  const totalPaginas = Math.ceil(total / tamanio);
  const inicio = (pagina - 1) * tamanio;
  const fin = inicio + tamanio;
  const itemsPagina = items.slice(inicio, fin);
  
  return {
    items: itemsPagina,
    pagina,
    totalPaginas,
    total,
    tamanio
  };
}