// =====================================
// Aqui estan las funciones que saque de doEverything en problema.js
// Cada una hace una sola cosa: login, buscar productos, carrito, pago y estadisticas
// Antes todo eso estaba mezclado en doEverything con un parametro "action" para saber que hacer
// =====================================

// Matias Diaz línea 1 a la 379

import { dbUsers, dbProducts } from './database.js';

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
      prod.nombre.toLowerCase().includes(query.toLowerCase()) ||
      prod.descripcion.toLowerCase().includes(query.toLowerCase()) ||
      prod.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

    const coincideCategoria = !categoria || prod.categoria === categoria;
    const coincidePrecio = prod.precio >= precioMin && prod.precio <= precioMax;

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
    return acc + (prod ? prod.precio * item.qty : 0);
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
      const totalItem = prod.precio * itemCarrito.qty;
      subtotal += totalItem;
      itemsOrden.push({
        prod: prod.nombre,
        qty: itemCarrito.qty,
        precUnit: prod.precio,
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
      if (acc.porCategoria[prod.categoria] !== undefined) {
        acc.porCategoria[prod.categoria]++;
      }
      acc.stockTotal += prod.stock;
      acc.valorInventario += prod.precio * prod.stock;
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
