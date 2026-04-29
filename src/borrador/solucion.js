// ============================================================================
// SISTEMA DE GESTIÓN DE TIENDA ONLINE - VERSIÓN MEJORADA CON CLEAN CODE
// ============================================================================
// Combinación de mejoras hechas por:
// - Matias Diaz: Refactorización de funciones principales
// - Cristóbal Piña: Reportes y renderizado
// - Matias B: Cálculos de precio y validaciones
// - Matias H: Funciones de utilidad y formato de fechas
// ============================================================================

import { dbUsers, dbProducts } from './database.js';

// =====================================
// FUNCIONES DE FORMATO Y UTILIDAD (Matias H)
// =====================================

function pad(n) {
  return n < 10 ? '0' + n : n;
}

// Formatea como dd/mm/aaaa hh:mm:ss
function formatDate(d4) {
  const day = pad(d4.getDate());
  const month = pad(d4.getMonth() + 1);
  const year = d4.getFullYear();
  const hours = pad(d4.getHours());
  const mins = pad(d4.getMinutes());
  const secs = pad(d4.getSeconds());
  return day + '/' + month + '/' + year + ' ' + hours + ':' + mins + ':' + secs;
}

// Formatea como dd/mm/aaaa
function formatDate2(d5) {
  const day = pad(d5.getDate());
  const month = pad(d5.getMonth() + 1);
  const year = d5.getFullYear();
  return day + '/' + month + '/' + year;
}

// Formatea desde un string YYYY-MM-DD a DD/MM/YYYY
function formatDate3(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  return dateStr;
}

// Utilidades varias
const utils = {
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str, max) => {
    if (str.length <= max) return str;
    return str.slice(0, max - 3) + '...';
  },

  slugify: (str) => {
    return str.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  },

  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  isEmptyObj: (obj) => {
    return Object.keys(obj).length === 0;
  },

  sumArray: (arr) => {
    let total = 0;
    for (let i = 0; i < arr.length; i++) {
      total += arr[i];
    }
    return total;
  },

  avgArray: (arr) => {
    if (arr.length === 0) return 0;
    return utils.sumArray(arr) / arr.length;
  },

  uniqueArray: (arr) => {
    return [...new Set(arr)];
  },

  flatArray: (arr) => {
    return arr.flat();
  }
};

// =====================================
// FUNCIONES DE VALIDACIÓN (Matias B)
// =====================================

// Validación genérica por tipo
function v(cosa, tipo) {
  let r = false;
  if (tipo == 1) {
    // validar email
    if (cosa != null && cosa != undefined && cosa != "" && cosa.indexOf("@") != -1 && cosa.indexOf(".") != -1) {
      r = true;
    }
  }
  if (tipo == 2) {
    // validar pass
    if (cosa != null && cosa != undefined && cosa.length >= 4) {
      r = true;
    }
  }
  if (tipo == 3) {
    // validar numero
    if (cosa != null && cosa != undefined && !isNaN(cosa) && cosa > 0) {
      r = true;
    }
  }
  if (tipo == 4) {
    // validar string
    if (cosa != null && cosa != undefined && cosa != "" && typeof cosa == "string") {
      r = true;
    }
  }
  if (tipo == 5) {
    // validar array
    if (cosa != null && cosa != undefined && Array.isArray(cosa) && cosa.length > 0) {
      r = true;
    }
  }
  if (tipo == 6) {
    // validar objeto
    if (cosa != null && cosa != undefined && typeof cosa == "object" && Object.keys(cosa).length > 0) {
      r = true;
    }
  }
  if (tipo == 7) {
    // validar fecha
    if (cosa != null && cosa != undefined) {
      const dd2 = new Date(cosa);
      if (!isNaN(dd2.getTime())) {
        r = true;
      }
    }
  }
  if (tipo == 8) {
    // validar rut chileno (super basico)
    if (cosa != null && cosa != undefined && cosa != "" && cosa.length >= 8 && cosa.indexOf("-") != -1) {
      r = true;
    }
  }
  return r;
}

// Validaciones específicas del formulario de registro
function validar_nombre(v) { return v && v.length >= 3; }
function validar_email(v) { return v && v.includes("@"); }
function validar_password(v) { return v && v.length >= 8; }
function validar_rut(v) { return v && v.length >= 8; }
function validar_telefono(v) { return v && v.length >= 9; }

function validarFormulario(formData) {
  const errores = [];

  if (!validar_nombre(formData.nombre))
    errores.push("Nombre inválido: mínimo 3 caracteres");

  if (!validar_email(formData.email))
    errores.push("Email inválido");

  if (!validar_password(formData.password))
    errores.push("Contraseña: mínimo 8 caracteres");

  if (!validar_rut(formData.rut))
    errores.push("RUT inválido");

  if (!validar_telefono(formData.telefono))
    errores.push("Teléfono inválido");

  if (formData.password !== formData.passwordConfirm)
    errores.push("Las contraseñas no coinciden");

  return errores;
}

// =====================================
// FUNCIONES DE CÁLCULO DE PRECIOS (Matias B)
// =====================================

function calcularDescuento(precio, descuentoNivel, descuentoCupon, descuentoEspecial) {
  const montoDescuentoN = precio * (descuentoNivel / 100);
  const montoDescuentoC = (precio - montoDescuentoN) * (descuentoCupon / 100);
  const montoDescuentoE = (precio - montoDescuentoN - montoDescuentoC) * (descuentoEspecial / 100);
  return {
    precioConDescuento: precio - montoDescuentoN - montoDescuentoC - montoDescuentoE,
    descuentoCupon: montoDescuentoC,
    descuentoEspecial: montoDescuentoE,
    descuentoNivel: montoDescuentoN
  };
}

function sacarPrecioIva(precio, tieneIva) {
  const montoIva = tieneIva ? precio * 0.19 : 0;
  return { precioConIva: precio + montoIva, montoIva };
}

function calcularPrecioEnvio(precio, envio) {
  if (envio > 0) {
    return precio + envio;
  }
  return precio;
}

const TASAS_CUOTAS = { 2: 1.02, 3: 1.04, 6: 1.08, 12: 1.15, 24: 1.28, 36: 1.45 };

const calcularPrecioFinalConCuotas = (precio, numeroCuotas) => {
  if (numeroCuotas > 1 && numeroCuotas in TASAS_CUOTAS) {
    return precio * TASAS_CUOTAS[numeroCuotas];
  }
  return precio;
};

function calcularPrecio(precioBase, descuentoNivel, descuentoCupon, descuentoEspecial, tieneIva, costoEnvio, numeroCuotas) {
  const { precioConDescuento, ...descuentos } = calcularDescuento(
    precioBase, descuentoNivel, descuentoCupon, descuentoEspecial
  );

  const { precioConIva, montoIva } = sacarPrecioIva(precioConDescuento, tieneIva);

  const subtotal = calcularPrecioEnvio(precioConIva, costoEnvio);

  const totalFinal = calcularPrecioFinalConCuotas(subtotal, numeroCuotas);

  return {
    base: precioBase,
    descuentoNivel: descuentos.descuentoNivel,
    descuentoCupon: descuentos.descuentoCupon,
    descuentoEspecial: descuentos.descuentoEspecial,
    montoIva,
    costoEnvio,
    subtotal,
    totalFinal,
    totalPorCuota: numeroCuotas > 1 ? totalFinal / numeroCuotas : totalFinal,
  };
}

// =====================================
// FUNCIONES DE NIVEL DE USUARIO (Matias Diaz)
// =====================================

function calcularNivel(puntos) {
  if (puntos >= 300) return 'platino';
  if (puntos >= 200) return 'oro';
  if (puntos >= 100) return 'plata';
  return 'bronce';
}

function calcularDescuentoPorNivel(puntos) {
  if (puntos >= 300) return 15;
  if (puntos >= 200) return 10;
  if (puntos >= 100) return 5;
  return 0;
}

// =====================================
// FUNCIONES PRINCIPALES (Matias Diaz)
// =====================================

export function buscarUsuario(email, password, cb) {
  const foundUser = dbUsers.find(
    (user) => user.email === email && user.pass === password
  );

  if (!foundUser) {
    const userByEmail = dbUsers.find((user) => user.email === email);
    if (userByEmail) {
      userByEmail.intentos++;
      if (userByEmail.intentos >= 3) {
        userByEmail.bloqueado = true;
      }
    }
    cb({ ok: false, msg: 'credenciales invalidas', data: null });
    return;
  }

  if (foundUser.bloqueado) {
    cb({ ok: false, msg: 'usuario bloqueado', data: null });
    return;
  }

  if (!foundUser.activo) {
    cb({ ok: false, msg: 'usuario inactivo', data: null });
    return;
  }

  foundUser.nivel = calcularNivel(foundUser.puntos);
  foundUser.ultimoLogin = new Date().toISOString();

  const sessData = {
    user: foundUser,
    token: 'tkn_' + Math.random().toString(36).substr(2, 9),
    loginTime: new Date(),
  };

  cb({ ok: true, msg: 'login ok', data: sessData });
}

export function buscarProductos(
  query,
  categoria,
  precioMin = 0,
  precioMax = 999999999,
  cb
) {
  const resultados = dbProducts.filter((prod) => {
    if (!prod.activo) return false;

    const coincideQuery =
      !query ||
      prod.nom.toLowerCase().includes(query.toLowerCase()) ||
      prod.desc.toLowerCase().includes(query.toLowerCase()) ||
      prod.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

    const coincideCategoria = !categoria || prod.cat === categoria;
    const coincidePrecio = prod.prec >= precioMin && prod.prec <= precioMax;

    return coincideQuery && coincideCategoria && coincidePrecio;
  });

  resultados.sort((a, b) => b.rating - a.rating);

  cb({ ok: true, msg: 'ok', data: resultados });
}

export function agregarAlCarrito(userId, prodId, qty, cb) {
  const foundProd = dbProducts.find((prod) => prod.id === prodId);
  const foundUser = dbUsers.find((user) => user.id === userId);

  if (!foundProd) {
    cb({ ok: false, msg: 'producto no encontrado', data: null });
    return;
  }
  if (!foundProd.activo) {
    cb({ ok: false, msg: 'producto no disponible', data: null });
    return;
  }
  if (foundProd.stock < qty) {
    cb({ ok: false, msg: 'stock insuficiente', data: null });
    return;
  }
  if (!foundUser) {
    cb({ ok: false, msg: 'usuario no encontrado', data: null });
    return;
  }

  const itemEnCarrito = foundUser.carrito.find(
    (item) => item.prodId === prodId
  );
  if (itemEnCarrito) {
    itemEnCarrito.qty += qty;
  } else {
    foundUser.carrito.push({ prodId, qty, addedAt: new Date() });
  }

  const total = foundUser.carrito.reduce((acc, item) => {
    const prod = dbProducts.find((p) => p.id === item.prodId);
    return acc + (prod ? prod.prec * item.qty : 0);
  }, 0);

  cb({
    ok: true,
    msg: 'producto agregado al carrito',
    data: { carrito: foundUser.carrito, total },
  });
}

export function procesarPago(userId, metodoPago, direccion, datosTarjeta, cb) {
  const foundUser = dbUsers.find((user) => user.id === userId);

  if (!foundUser) {
    cb({ ok: false, msg: 'usuario no encontrado', data: null });
    return;
  }
  if (foundUser.carrito.length === 0) {
    cb({ ok: false, msg: 'carrito vacio', data: null });
    return;
  }

  if (metodoPago === 'tarjeta') {
    const tarjetaValida =
      datosTarjeta?.numero?.length === 16 && datosTarjeta?.cvv?.length === 3;
    if (!tarjetaValida) {
      cb({ ok: false, msg: 'datos de tarjeta invalidos', data: null });
      return;
    }
  }

  const metodosValidos = ['tarjeta', 'transferencia', 'efectivo'];
  if (!metodosValidos.includes(metodoPago)) {
    cb({ ok: false, msg: 'metodo de pago no valido', data: null });
    return;
  }

  const itemsOrden = [];
  let subtotal = 0;

  for (const itemCarrito of foundUser.carrito) {
    const prod = dbProducts.find((p) => p.id === itemCarrito.prodId);
    if (prod) {
      const totalItem = prod.prec * itemCarrito.qty;
      subtotal += totalItem;
      itemsOrden.push({
        prod: prod.nom,
        qty: itemCarrito.qty,
        precUnit: prod.prec,
        totalItem,
      });
    }
  }

  const descuentoPct =
    calcularDescuentoPorNivel(foundUser.puntos) + foundUser.descuento;
  const descuentoMonto = subtotal * (descuentoPct / 100);
  const totalSinIva = subtotal - descuentoMonto;
  const iva = totalSinIva * 0.19;
  const total = totalSinIva + iva;
  const puntosGanados = Math.floor(total / 1000);

  const orden = {
    id: 'ORD-' + Date.now(),
    userId,
    items: itemsOrden,
    subtotal,
    descuentoPct,
    descuentoMonto,
    totalSinIva,
    iva,
    total,
    metodoPago,
    direccion,
    estado: 'pagado',
    puntosGanados,
    createdAt: new Date(),
  };

  for (const itemCarrito of foundUser.carrito) {
    const prod = dbProducts.find((p) => p.id === itemCarrito.prodId);
    if (prod) {
      prod.stock -= itemCarrito.qty;
    }
  }

  foundUser.puntos += puntosGanados;
  foundUser.carrito = [];
  foundUser.historial.push(orden);

  cb({ ok: true, msg: 'orden creada exitosamente', data: orden });
}

export function obtenerEstadisticas(cb) {
  const statsUsuarios = dbUsers.reduce(
    (acc, user) => {
      acc.total++;
      if (user.activo) acc.activos++;
      if (user.bloqueado) acc.bloqueados++;
      if (user.tipo === 'admin') acc.admin++;
      if (user.tipo === 'cliente') acc.clientes++;
      if (user.tipo === 'vendedor') acc.vendedores++;
      return acc;
    },
    {
      total: 0,
      activos: 0,
      bloqueados: 0,
      admin: 0,
      clientes: 0,
      vendedores: 0,
    }
  );

  const statsProductos = dbProducts.reduce(
    (acc, prod) => {
      acc.total++;
      if (prod.activo) acc.activos++;
      else acc.inactivos++;
      if (acc.porCategoria[prod.cat] !== undefined) {
        acc.porCategoria[prod.cat]++;
      }
      acc.stockTotal += prod.stock;
      acc.valorInventario += prod.prec * prod.stock;
      return acc;
    },
    {
      total: 0,
      activos: 0,
      inactivos: 0,
      porCategoria: {
        electronica: 0,
        accesorios: 0,
        audio: 0,
        almacenamiento: 0,
        componentes: 0,
        muebles: 0,
      },
      stockTotal: 0,
      valorInventario: 0,
    }
  );

  cb({
    ok: true,
    msg: 'ok',
    data: { usuarios: statsUsuarios, productos: statsProductos },
  });
}

// =====================================
// FUNCIONES DE REPORTES (Cristóbal Piña)
// =====================================

function construirEncabezado(titulo, from, to, separador) {
  return `${titulo}\n Desde: ${from}\n Hasta: ${to}\n${separador}\n`;
}

function construirLineaReporte(type, item) {
  const plantillas = {
    ventas: `Orden: ${item.id} - Total: $${item.total} - Estado: ${item.estado}`,
    productos: `Producto: ${item.nom} - Precio: $${item.prec} - Stock: ${item.stock} - Rating: ${item.rating}`,
    usuarios: `Usuario: ${item.nombre} - Email: ${item.email} - Tipo: ${item.tipo} - Puntos: ${item.puntos} - Activo: ${item.activo}`
  };
  return plantillas[type] || "";
}

function generarReporte(tipo, from, to, data) {
  const titulos = {
    ventas: { txt: "VENTAS", sep: "========================", key: "total", unit: "$" },
    productos: { txt: "PRODUCTOS", sep: "============================", key: "prec", unit: "$" },
    usuarios: { txt: "USUARIOS", sep: "===========================", key: "puntos", unit: "" }
  };

  const conf = titulos[tipo];
  let report = construirEncabezado(`=== REPORTE DE ${conf.txt} ===`, from, to, conf.sep);

  if (!Array.isArray(data) || data.length === 0) {
    return report + "Sin datos para generar el reporte.\n";
  }

  let totalGeneral = 0;
  let max = -Infinity;
  let min = Infinity;
  const lines = [];

  data.forEach(item => {
    const valor = item[conf.key];
    totalGeneral += valor;
    if (valor > max) max = valor;
    if (valor < min) min = valor;
    lines.push(construirLineaReporte(tipo, item));
  });

  const avg = totalGeneral / data.length;

  report += lines.join("\n");
  report += `\n${conf.sep.replace(/=/g, "-")}\n`;
  report += `Total ${tipo}: ${data.length}\n`;
  report += `Promedio: ${conf.unit}${avg.toFixed(2)}\n`;
  report += `Máximo: ${conf.unit}${max}\n`;
  report += `Mínimo: ${conf.unit}${min}\n`;

  return report;
}

export function hacerReporte(type, from, to, data) {
  if (["ventas", "productos", "usuarios"].includes(type)) {
    return generarReporte(type, from, to, data);
  }
  return "Tipo de reporte no valido";
}

// =====================================
// FUNCIONES DE RENDERIZADO (Cristóbal Piña)
// =====================================

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getStockBadge(stock) {
  if (stock <= 0) {
    return "<div class='badge-agotado'>AGOTADO</div>";
  }
  if (stock > 0 && stock <= 5) {
    return `<div class='badge-poco-stock'>ÚLTIMAS ${stock} UNIDADES</div>`;
  }
  return "";
}

function getStarsHTML(rating) {
  let stars = "";
  for (let i = 0; i < 5; i++) {
    if (i < Math.floor(rating)) {
      stars += "★";
    } else {
      stars += "☆";
    }
  }
  return `${stars} (${rating})`;
}

export function renderProduct(p) {
  const imageUrl = (p.imgs && Array.isArray(p.imgs) && p.imgs.length > 0)
    ? p.imgs[0]
    : 'assets/img/no-image.png';

  const safeName = escapeHTML(p.nom);
  const safeDesc = escapeHTML(p.desc);
  const safeCat = escapeHTML(p.cat);

  return `
    <div class='product-card'>
      <div class='product-img'>
        <img src='${imageUrl}' alt='${safeName}'>
        ${getStockBadge(p.stock)}
      </div>
      
      <div class='product-info'>
        <h3>${safeName}</h3>
        
        <div class='rating'>
          ${getStarsHTML(p.rating)}
        </div>
        
        <p class='desc'>${safeDesc}</p>
        <div class='price'>$${p.prec}</div>
        <div class='category'>Categoría: ${safeCat}</div>
        
        ${
          (p.activo && p.stock > 0)
            ? `<button class='btn-cart' data-id='${p.id}'>Agregar al carrito</button>`
            : `<button disabled class='btn-cart-disabled'>No disponible</button>`
        }
      </div>
    </div>
  `;
}

// =====================================
// EXPORTAR TODO
// =====================================

export {
  formatDate,
  formatDate2,
  formatDate3,
  utils,
  v,
  validarFormulario,
  calcularDescuento,
  sacarPrecioIva,
  calcularPrecioEnvio,
  calcularPrecioFinalConCuotas,
  calcularPrecio,
  calcularNivel,
  calcularDescuentoPorNivel
};
