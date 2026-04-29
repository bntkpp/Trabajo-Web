import { dbUsers, dbProducts } from './database.js';

// ─── Cálculo de precios ─────────────────────────────────────────────────────
// Fuente: borrador/funcionesB.js (calcularPrecio y helpers)

function calcularDescuento(precio, descuentoNivel, descuentoCupon, descuentoEspecial) {
  const montoN = precio * (descuentoNivel / 100);
  const montoC = (precio - montoN) * (descuentoCupon / 100);
  const montoE = (precio - montoN - montoC) * (descuentoEspecial / 100);
  return {
    precioConDescuento: precio - montoN - montoC - montoE,
    descuentoNivel:     montoN,
    descuentoCupon:     montoC,
    descuentoEspecial:  montoE,
  };
}

function sacarPrecioIva(precio, tieneIva) {
  const montoIva = tieneIva ? precio * 0.19 : 0;
  return { precioConIva: precio + montoIva, montoIva };
}

function calcularPrecioEnvio(precio, envio) {
  return envio > 0 ? precio + envio : precio;
}

const TASAS_CUOTAS = { 2: 1.02, 3: 1.04, 6: 1.08, 12: 1.15, 24: 1.28, 36: 1.45 };

const calcularConCuotas = (precio, numeroCuotas) =>
  numeroCuotas > 1 && numeroCuotas in TASAS_CUOTAS
    ? precio * TASAS_CUOTAS[numeroCuotas]
    : precio;

export function calcularPrecio(precioBase, descuentoNivel, descuentoCupon, descuentoEspecial, tieneIva, costoEnvio, numeroCuotas) {
  const { precioConDescuento, ...descuentos } = calcularDescuento(
    precioBase, descuentoNivel, descuentoCupon, descuentoEspecial
  );
  const { precioConIva, montoIva } = sacarPrecioIva(precioConDescuento, tieneIva);
  const subtotal    = calcularPrecioEnvio(precioConIva, costoEnvio);
  const totalFinal  = calcularConCuotas(subtotal, numeroCuotas);

  return {
    base:              precioBase,
    descuentoNivel:    descuentos.descuentoNivel,
    descuentoCupon:    descuentos.descuentoCupon,
    descuentoEspecial: descuentos.descuentoEspecial,
    montoIva,
    costoEnvio,
    subtotal,
    totalFinal,
    totalPorCuota: numeroCuotas > 1 ? totalFinal / numeroCuotas : totalFinal,
  };
}

// ─── Cupones ────────────────────────────────────────────────────────────────
// Fuente: borrador/function_vsr.js (cupon)

const cuponesDisponibles = [
  { code: 'DESC10',    tipo: 'porcentaje', valor: 10,   minCompra: 50000,  maxUsos: 100,  usos: 45,  activo: true, expira: '2024-12-31', usuarios: [] },
  { code: 'DESC20',    tipo: 'porcentaje', valor: 20,   minCompra: 100000, maxUsos: 50,   usos: 50,  activo: true, expira: '2024-06-30', usuarios: [] },
  { code: 'ENVGRATIS', tipo: 'envio',      valor: 100,  minCompra: 30000,  maxUsos: 200,  usos: 180, activo: true, expira: '2024-12-31', usuarios: [] },
  { code: 'BIENVENIDO',tipo: 'fijo',       valor: 5000, minCompra: 20000,  maxUsos: 1000, usos: 523, activo: true, expira: '2025-12-31', usuarios: [] },
  { code: 'VIP2024',   tipo: 'porcentaje', valor: 25,   minCompra: 200000, maxUsos: 20,   usos: 15,  activo: true, expira: '2024-12-31', usuarios: [1, 3, 5] },
];

export function aplicarCupon(code, userId, cartTotal) {
  const cupon = cuponesDisponibles.find((c) => c.code === code);

  if (!cupon)                              return { ok: false, msg: 'cupon no encontrado',             descuento: 0 };
  if (!cupon.activo)                       return { ok: false, msg: 'cupon inactivo',                  descuento: 0 };
  if (new Date() > new Date(cupon.expira)) return { ok: false, msg: 'cupon expirado',                  descuento: 0 };
  if (cupon.usos >= cupon.maxUsos)         return { ok: false, msg: 'cupon agotado',                   descuento: 0 };
  if (cartTotal < cupon.minCompra)         return { ok: false, msg: 'compra minima no alcanzada',      descuento: 0 };
  if (cupon.usuarios.length > 0 && !cupon.usuarios.includes(userId))
                                           return { ok: false, msg: 'usuario no autorizado para este cupon', descuento: 0 };

  const calcDesc = () => {
    switch (cupon.tipo) {
      case 'porcentaje': return cartTotal * (cupon.valor / 100);
      case 'fijo':       return Math.min(cupon.valor, cartTotal);
      case 'envio':      return cupon.valor;
      default:           return 0;
    }
  };

  cupon.usos++;
  return { ok: true, msg: 'cupon aplicado', descuento: calcDesc(), tipo: cupon.tipo };
}

// ─── Pago ───────────────────────────────────────────────────────────────────
// Fuente: borrador/functions.js (procesarPago)

function calcularDescuentoPorNivel(puntos) {
  if (puntos >= 300) return 15;
  if (puntos >= 200) return 10;
  if (puntos >= 100) return 5;
  return 0;
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
    const tarjetaValida = datosTarjeta?.numero?.length === 16 && datosTarjeta?.cvv?.length === 3;
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
      itemsOrden.push({ prod: prod.nombre, qty: itemCarrito.qty, precUnit: prod.precio, totalItem });
    }
  }

  const descuentoPct   = calcularDescuentoPorNivel(foundUser.puntos) + foundUser.descuento;
  const descuentoMonto = subtotal * (descuentoPct / 100);
  const totalSinIva    = subtotal - descuentoMonto;
  const iva            = totalSinIva * 0.19;
  const total          = totalSinIva + iva;
  const puntosGanados  = Math.floor(total / 1000);

  const orden = {
    id: 'ORD-' + Date.now(),
    userId, items: itemsOrden, subtotal, descuentoPct, descuentoMonto,
    totalSinIva, iva, total, metodoPago, direccion,
    estado: 'pagado', puntosGanados, createdAt: new Date(),
  };

  for (const itemCarrito of foundUser.carrito) {
    const prod = dbProducts.find((p) => p.id === itemCarrito.prodId);
    if (prod) prod.stock -= itemCarrito.qty;
  }

  foundUser.puntos += puntosGanados;
  foundUser.carrito = [];
  foundUser.historial.push(orden);

  cb({ ok: true, msg: 'orden creada exitosamente', data: orden });
}
