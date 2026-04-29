// ============================================================================
// INTEGRACIÓN DE TRABAJO - TIENDA ONLINE (CLEAN CODE)
// Este archivo combina las funciones desarrolladas por el grupo siguiendo el orden original.
// ============================================================================

import { dbUsers, dbProducts } from './database.js';

// =====================================
// Matias Diaz línea 1 a la 379
// Refactorización de doEverything
// =====================================

// Estas dos funciones estaban repetidas dentro de doEverything (en el login y en el checkout)
// Las saque aparte para no repetir el mismo codigo dos veces

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

// Era el bloque if (action == 'login') dentro de doEverything
// Se simplificaron los loops con .find() y se separaron bien los casos de error
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

// Era el bloque if (action == 'buscarProductos') dentro de doEverything
// Se reemplazo el loop con for por .filter() y .sort(), queda mas corto y legible
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

// Era el bloque if (action == 'addCart') dentro de doEverything
// Los parametros ahora tienen nombres claros en vez de dat, extraDat, moreData
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

// Era el bloque if (action == 'checkout') dentro de doEverything
// Se usa calcularDescuentoPorNivel() en vez de repetir los if de puntos otra vez
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

// Era el bloque if (action == 'getStats') dentro de doEverything
// Se uso .reduce() en vez de varios contadores sueltos con nombres como totalActivos2
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
// Benjamín - Líneas 386-440
// Función de validación genérica
// =====================================

export function v(cosa, tipo) {
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

// =====================================
// Benjamín - Línea 442 a 497
// Funciones de cálculo de precios
// =====================================

// calcula descuentos por orden, primero nivel, luego cupón sobre lo que queda, luego especial
function Calcular_Descuento(precio, descuentoNivel, descuentoCupon, descuentoEspecial) {
  const monto_DescuentoN = precio * (descuentoNivel / 100);
  const monto_DescuentoC = (precio - monto_DescuentoN) * (descuentoCupon / 100);
  const monto_DescuentoE = (precio - monto_DescuentoN - monto_DescuentoC) * (descuentoEspecial / 100);
  return {
    precioConDescuento: precio - monto_DescuentoN - monto_DescuentoC - monto_DescuentoE,
    descuentoCupon: monto_DescuentoC,
    descuentoEspecial: monto_DescuentoE,
    descuentoNivel: monto_DescuentoN
  };
}

// si tieneIva es true le mete el 19%, si no queda igual, si no mal recuerdo nos enseñó lo del ? en clases
function Sacar_PrecioIva(precio, tieneIva) {
  let montoIva = tieneIva ? precio * 0.19 : 0;
  return { precioConIva: precio + montoIva, montoIva };
}

// simple, si hay envío lo suma
function Calcular_Precio_Envio(precio, envio) {
  if (envio > 0) return precio + envio;
  return precio;
}

// las tasas las saqué viendo que hacía la funcion mal hecha pero fue un dolor de cabeza entenderla así que lo hice con IA
const TASAS_CUOTAS = { 2: 1.02, 3: 1.04, 6: 1.08, 12: 1.15, 24: 1.28, 36: 1.45 };

const Calcular_Precio_Final_Con_Cuotas = (precio, numeroCuotas) => {
  if (numeroCuotas > 1 && numeroCuotas in TASAS_CUOTAS)
    return precio * TASAS_CUOTAS[numeroCuotas];
  return precio;
}

export function calcularPrecio(precioBase, descuentoNivel, descuentoCupon, descuentoEspecial, tieneIva, costoEnvio, numeroCuotas) {
  const { precioConDescuento, ...descuentos } = Calcular_Descuento(
    precioBase, descuentoNivel, descuentoCupon, descuentoEspecial
  );
  const { precioConIva, montoIva } = Sacar_PrecioIva(precioConDescuento, tieneIva);
  const subtotal = Calcular_Precio_Envio(precioConIva, costoEnvio);
  const totalFinal = Calcular_Precio_Final_Con_Cuotas(subtotal, numeroCuotas);

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
// Cristobal Piña - Líneas 500 - 570
// Función de generación de reportes
// =====================================

function construirEncabezado(titulo, from, to, separador) 
{
  return `${titulo}\n Desde: ${from}\n Hasta: ${to}\n${separador}\n`;
}

function construirLineaReporte(type, item) 
{
  const plantillas = 
  {
    ventas: `Orden: ${item.id} - Total: $${item.total} - Estado: ${item.estado}`,
    productos: `Producto: ${item.nom} - Precio: $${item.prec} - Stock: ${item.stock} - Rating: ${item.rating}`,
    usuarios: `Usuario: ${item.nombre} - Email: ${item.email} - Tipo: ${item.tipo} - Puntos: ${item.puntos} - Activo: ${item.activo}`
  };
  return plantillas[type] || "";
}

function generarReporte(tipo, from, to, data) 
{
  const titulos = 
  {
    ventas: { txt: "VENTAS", sep: "========================", key: "total", unit: "$" },
    productos: { txt: "PRODUCTOS", sep: "============================", key: "prec", unit: "$" },
    usuarios: { txt: "USUARIOS", sep: "===========================", key: "puntos", unit: "" }
  };

  const conf = titulos[tipo];
  let report = construirEncabezado(`=== REPORTE DE ${conf.txt} ===`, from, to, conf.sep);

  if (!Array.isArray(data) || data.length === 0) 
    {
    return report + "Sin datos para generar el reporte.\n";
  }

  let totalGeneral = 0;
  let max = -Infinity;
  let min = Infinity;
  const lines = [];

  data.forEach(item => 
    { 
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

export function hacerReporte(type, from, to, data) 
{
  if (["ventas", "productos", "usuarios"].includes(type)) 
    {
    return generarReporte(type, from, to, data);
  }
  return "Tipo de reporte no valido";
}

// =====================================
// PENDIENTE: Líneas 573 - 738
// (Notificaciones, Cupones, Búsqueda, Formateo)
// =====================================

// =====================================
// Cristobal Piña - Líneas 740 - 781
// Función de renderizado de productos
// =====================================

function escapeHTML(str) 
{
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getStockBadge(stock) 
{
  if (stock <= 0) 
    {
    return "<div class='badge-agotado'>AGOTADO</div>";
  }
  if (stock > 0 && stock <= 5) 
    {
    return `<div class='badge-poco-stock'>ÚLTIMAS ${stock} UNIDADES</div>`;
  }
  return "";
}

function getStarsHTML(rating) 
{
  let stars = "";
  for (let i = 0; i < 5; i++) 
    {
    if (i < Math.floor(rating)) 
        {
      stars += "★"; 
    } else 
        {
      stars += "☆";
    }
  }
  return `${stars} (${rating})`;
}

export function renderProduct(p) 
{
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
// Benjamín - Líneas 783 a 854
// Refactorización de Registro de Usuario
// =====================================

function validar_nombre(v) { return v && v.length >= 3; }
function validar_email(v) { return v && v.includes("@"); }
function validar_password(v) { return v && v.length >= 8; }
function validar_rut(v) { return v && v.length >= 8; }
function validar_telefono(v) { return v && v.length >= 9; }

function Validar_Formulario(formData) {
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

const Usuarios_Repositorio = {
  existeEmail: (email, db) => db.some((u) => u.email === email),
  guardar: (usuario, db) => db.push(usuario),
};

const Clave_Hash = (password) => `hashed_${password}`;

function Crear_Usuario(formData) {
  const ahora = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    nombre: formData.nombre,
    email: formData.email,
    passwordHash: Clave_Hash(formData.password),
    rut: formData.rut,
    telefono: formData.telefono,
    tipo: "cliente",
    puntos: 0,
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    historial: [],
    carrito: [],
    wishlist: [],
    direcciones: [],
    metodosPago: [],
    ultimoLogin: null,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}

const Crear_Sesion = (usuario) => ({
  usuario,
  token: `tkn_${crypto.randomUUID()}`,
  tiempoLogin: new Date().toISOString(),
});

const Notificar_Bienvenida = (usuario) =>
  sendNotif("email", usuario.id, "¡Bienvenido!", { userName: usuario.nombre });

export async function Registrar_Usuario(formData, baseDeDatos) {
  const errores = Validar_Formulario(formData);
  if (errores.length > 0)
    return { ok: false, errores };

  if (Usuarios_Repositorio.existeEmail(formData.email, baseDeDatos))
    return { ok: false, errores: ["Email ya registrado"] };

  const usuario = Crear_Usuario(formData);
  Usuarios_Repositorio.guardar(usuario, baseDeDatos);
  Notificar_Bienvenida(usuario);

  return { ok: true, usuario, sesion: Crear_Sesion(usuario), redirigirA: "/dashboard" };
}

// =====================================
// PENDIENTE: Líneas 857 - 1135
// (Wishlist, Perfil, Reviews, Envío, Inventario, Log, Paginación, Ordenamiento)
// =====================================

// =====================================
// Matias H - Líneas 1151 - 1176
// Funciones de formato de fecha
// =====================================

function pad(n) {
  return n < 10 ? '0' + n : n;
}

export function formatDate(d4) {
  var day = pad(d4.getDate());
  var month = pad(d4.getMonth() + 1);
  var year = d4.getFullYear();
  var hours = pad(d4.getHours());
  var mins = pad(d4.getMinutes());
  var secs = pad(d4.getSeconds());
  return day + '/' + month + '/' + year + ' ' + hours + ':' + mins + ':' + secs;
}

export function formatDate2(d5) {
  var day = pad(d5.getDate());
  var month = pad(d5.getMonth() + 1);
  var year = d5.getFullYear();
  return day + '/' + month + '/' + year;
}

export function formatDate3(dateStr) {
  var parts = dateStr.split('-')
  if (parts.length === 3) {
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }
  return dateStr;
}

// =====================================
// Benjamín - Líneas 1179 - 1210
// Utilidades varias
// =====================================

//Les pone mayúscula a la primera letra.
function Capitalizar_Texto(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// corta el texto
function Truncar_Texto(texto, longitudMaxima) {
  return texto.length > longitudMaxima
    ? `${texto.substring(0, longitudMaxima)}...`
    : texto;
}

// Slug es como algo que sirve para las URLS
function Convertir_A_Slug(texto) {
  return texto
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

function Numero_Aleatorio(minimo, maximo) {
  return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
}

// No capto lo que hace la verdad pero lo hice con IA, creo que es para clonar objetos pero no se que tipo de objetos
function Clonar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function Es_Vacio(objeto) {
  return Object.keys(objeto).length === 0;
}

// Vi que se puede hacer con reduce pero hacerlo con for es un clásico.
function Sumar_Array(numeros) {
  let total = 0;
  for (let n of numeros) total += n;
  return total;
}

// reutiliza Sumar_Array arriba
const Promedio_Array = (numeros) =>
  numeros.length === 0 ? 0 : Sumar_Array(numeros) / numeros.length;

// Set elimina duplicados automáticamente
function Elementos_Unicos(array) {
  return [...new Set(array)];
}

//No tengo claro que hace
function Aplanar_Array(array) {
  return array.flat();
}
