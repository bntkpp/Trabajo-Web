// =====================================
// Dividi la funcion doEverything en funciones mas pequeñas y especificas para cada tarea, como buscarUsuario, buscarProductos, agregarAlCarrito, procesarPago y obtenerEstadisticas. Cada funcion ahora se encarga de una sola responsabilidad, lo que mejora la legibilidad y mantenibilidad del codigo. Ademas, cada funcion recibe los parametros necesarios para su tarea especifica y devuelve un resultado a traves de un callback. 
// =====================================

// Matias Diaz

import { dbUsers, dbProducts } from "./database.js";

// Se separo de la funcion buscarUsuario, porque son lineas de codigo que se pueden hacer aparte y hacen que el codigo se entienda mejor, aparte se puede reutilizar

function calcularNivel(puntos) {
  let nivel = "";
  if (puntos >= 0 && puntos < 100) {
    nivel = "bronce";
  }
  if (puntos >= 100 && puntos < 200) {
    nivel = "plata";
  }
  if (puntos >= 200 && puntos < 300) {
    nivel = "oro";
  }
  if (puntos >= 300) {
    nivel = "platino";
  }
  return nivel;
}

function calculcarDescuento(puntos) {
  var descuento = 0;
  // descuento por nivel
  if (foundUser2.puntos >= 0 && foundUser2.puntos < 100) {
    descuento = 0;
  }
  if (foundUser2.puntos >= 100 && foundUser2.puntos < 200) {
    descuento = 5;
  }
  if (foundUser2.puntos >= 200 && foundUser2.puntos < 300) {
    descuento = 10;
  }
  if (foundUser2.puntos >= 300) {
    descuento = 15;
  }
  return descuento
}

export function buscarUsuario(email, password, cb) {
  // Variables
  let isOk = false;
  let msg = "";
  let tempUser = null;
  let sessData = null;
  let currentU = null;

  // Implementación de la función
  for (let i = 0; i < dbUsers.length; i++) {
    if (dbUsers[i].email == email && dbUsers[i].pass == password) {
      isOk = true;
      tempUser = dbUsers[i];
      break;
    }
  }
  if (isOk === true) {
    if (tempUser.bloqueado === true) {
      msg = "usuario bloqueado";
      isOk = false;
      cb({ ok: false, msg: msg, data: null });
      return;
    }
    if (tempUser.activo === false) {
      msg = "usuario inactivo";
      isOk = false;
      cb({ ok: false, msg: msg, data: null });
      return;
    }
    // Calcular nivel del usuario
    let nivel = calcularNivel(tempUser.puntos);
    tempUser.nivel = nivel;
    tempUser.ultimoLogin = new Date().toISOString();
    sessData = {
      user: tempUser,
      token: "tkn_" + Math.random().toString(36).substr(2, 9),
      loginTime: new Date(),
    };
    currentU = tempUser;
    cb({ ok: true, msg: "login ok", data: sessData });
    return;
  } else {
    // Incrementar intentos fallidos
    for (let i = 0; i < dbUsers.length; i++) {
      if (dbUsers[i].email === email) {
        dbUsers[i].intentos++;
        if (dbUsers[i].intentos >= 3) {
          dbUsers[i].bloqueado = true;
        }
        break;
      }
    }
    cb({ ok: false, msg: "credenciales invalidas", data: null });
    return;
  }
}

export function buscarProductos(dbProducts, query, dat, categoria, cb, precioMin, precioMax) {
  var query = dat;
  var categoria = extraDat;
  var precioMin = moreData ? moreData.min : 0;
  var precioMax = moreData ? moreData.max : 999999999;
  var res = [];
  for (var i = 0; i < dbProducts.length; i++) {
    var prod = dbProducts[i];
    var match = false;
    if (prod.activo == false) continue;
    if (query && query != "" && query != null && query != undefined) {
      if (prod.nom.toLowerCase().indexOf(query.toLowerCase()) != -1) {
        match = true;
      }
      if (prod.desc.toLowerCase().indexOf(query.toLowerCase()) != -1) {
        match = true;
      }
      for (var j = 0; j < prod.tags.length; j++) {
        if (prod.tags[j].toLowerCase().indexOf(query.toLowerCase()) != -1) {
          match = true;
        }
      }
    } else {
      match = true;
    }
    if (categoria && categoria != "" && categoria != null && categoria != undefined) {
      if (prod.categoria != categoria) {
        match = false;
      }
    }
    if (prod.precio < precioMin || prod.precio > precioMax) {
      match = false;
    }
    if (match == true) {
      res.push(prod);
    }
  }
  // ordenar por rating
  for (var i = 0; i < res.length - 1; i++) {
    for (var j = 0; j < res.length - i - 1; j++) {
      if (res[j].rating < res[j + 1].rating) {
        var tmp = res[j];
        res[j] = res[j + 1];
        res[j + 1] = tmp;
      }
    }
  }
  cb({ ok: true, msg: "ok", data: res });
  return;
}

export function agregarAlCarrito(u, prodId, qty, userId2) {
  // agregar al carrito
  var prodId = dat;
  var qty = extraDat;
  var userId2 = moreData;
  var foundProd = null;
  var foundUser = null;
  for (var i = 0; i < dbProducts.length; i++) {
    if (dbProducts[i].id == prodId) {
      foundProd = dbProducts[i];
      break;
    }
  }
  for (var i = 0; i < dbUsers.length; i++) {
    if (dbUsers[i].id == userId2) {
      foundUser = dbUsers[i];
      break;
    }
  }
  if (foundProd == null) {
    cb({ ok: false, msg: "producto no encontrado", data: null });
    return;
  }
  if (foundProd.activo == false) {
    cb({ ok: false, msg: "producto no disponible", data: null });
    return;
  }
  if (foundProd.stock < qty) {
    cb({ ok: false, msg: "stock insuficiente", data: null });
    return;
  }
  if (foundUser == null) {
    cb({ ok: false, msg: "usuario no encontrado", data: null });
    return;
  }
  // revisar si ya esta en el carrito
  var yaEsta = false;
  for (var i = 0; i < foundUser.carrito.length; i++) {
    if (foundUser.carrito[i].prodId == prodId) {
      foundUser.carrito[i].qty = foundUser.carrito[i].qty + qty;
      yaEsta = true;
      break;
    }
  }
  if (yaEsta == false) {
    foundUser.carrito.push({ prodId: prodId, qty: qty, addedAt: new Date() });
  }
  // calcular total del carrito
  var total = 0;
  for (var i = 0; i < foundUser.carrito.length; i++) {
    for (var j = 0; j < dbProducts.length; j++) {
      if (dbProducts[j].id == foundUser.carrito[i].prodId) {
        total = total + dbProducts[j].prec * foundUser.carrito[i].qty;
        break;
      }
    }
  }
  cb({
    ok: true,
    msg: "producto agregado al carrito",
    data: { carrito: foundUser.carrito, total: total },
  });
  return;
}

export function procesarPago() {
  // procesar pago y checkout
  var userId3 = dat;
  var metodoPago = extraDat;
  var direccion = moreData;
  var foundUser2 = null;
  for (var i = 0; i < dbUsers.length; i++) {
    if (dbUsers[i].id == userId3) {
      foundUser2 = dbUsers[i];
      break;
    }
  }
  if (foundUser2 == null) {
    cb({ ok: false, msg: "usuario no encontrado", data: null });
    return;
  }
  if (foundUser2.carrito.length == 0) {
    cb({ ok: false, msg: "carrito vacio", data: null });
    return;
  }
  // calcular subtotal
  var subtotal = 0;
  var itemsOrden = [];
  for (var i = 0; i < foundUser2.carrito.length; i++) {
    for (var j = 0; j < dbProducts.length; j++) {
      if (dbProducts[j].id == foundUser2.carrito[i].prodId) {
        var itemTotal = dbProducts[j].prec * foundUser2.carrito[i].qty;
        subtotal = subtotal + itemTotal;
        itemsOrden.push({
          prod: dbProducts[j].nom,
          qty: foundUser2.carrito[i].qty,
          precUnit: dbProducts[j].prec,
          totalItem: itemTotal,
        });
        break;
      }
    }
  }
  // aplicar descuentos
  var descuento = descuentoMonto(foundUser2.puntos);

  // descuento adicional del usuario
  descuento = descuento + foundUser2.descuento;
  let descuentoMonto = subtotal * (descuento / 100);
  var totalConDescuento = subtotal - descuentoMonto;

  // Calcular iva
  var iva = totalConDescuento * 0.19;
  var totalFinal = totalConDescuento + iva;
  // calcular puntos ganados
  var puntosGanados = Math.floor(totalFinal / 1000);

  // crear orden
  var ordenId = "ORD-" + Date.now();  

  // #FALTA CREAR LA BASE DE DATOS DE PEDIDOS
  var orden = { 
    id: ordenId,
    userId: userId3,
    items: itemsOrden,
    subtotal: subtotal,
    descuentoPct: descuento,
    descuentoMonto: descuentoMonto,
    totalSinIva: totalConDescuento,
    iva: iva,
    total: totalFinal,
    metodoPago: metodoPago,
    direccion: direccion,
    estado: "pendiente",
    puntosGanados: puntosGanados,
    createdAt: new Date(),
  };

  // Actualizar stock
  for (var i = 0; i < foundUser2.carrito.length; i++) {
    for (var j = 0; j < dbProducts.length; j++) {
      if (dbProducts[j].id == foundUser2.carrito[i].prodId) {
        dbProducts[j].stock = dbProducts[j].stock - foundUser2.carrito[i].qty;
        break;
      }
    }
  }
  // agregar puntos al usuario
  foundUser2.puntos = foundUser2.puntos + puntosGanados;
  // limpiar carrito
  foundUser2.carrito = [];
  // agregar al historial
  foundUser2.historial.push(orden);
  // simular proceso de pago
  var pagoOk = false;
  if (metodoPago == "tarjeta") {
    // simular validacion tarjeta
    if (
      flag99 &&
      flag99.numero &&
      flag99.numero.length == 16 &&
      flag99.cvv &&
      flag99.cvv.length == 3
    ) {
      pagoOk = true;
    } else {
      cb({ ok: false, msg: "datos de tarjeta invalidos", data: null });
      return;
    }
  }
  if (metodoPago == "transferencia") {
    pagoOk = true;
  }
  if (metodoPago == "efectivo") {
    pagoOk = true;
  }
  if (pagoOk == true) {
    orden.estado = "pagado";
    cb({ ok: true, msg: "orden creada exitosamente", data: orden });
  } else {
    cb({ ok: false, msg: "metodo de pago no valido", data: null });
  }
  return;
}

export function obtenerEstadisticas() {
  // obtener estadisticas
  var stats = {};
  // total usuarios
  var totalUsers = 0;
  var totalActivos = 0;
  var totalBloqueados = 0;
  var totalAdmin = 0;
  var totalClientes = 0;
  var totalVendedores = 0;
  for (var i = 0; i < dbUsers.length; i++) {
    totalUsers++;
    if (dbUsers[i].activo == true) totalActivos++;
    if (dbUsers[i].bloqueado == true) totalBloqueados++;
    if (dbUsers[i].tipo == "admin") totalAdmin++;
    if (dbUsers[i].tipo == "cliente") totalClientes++;
    if (dbUsers[i].tipo == "vendedor") totalVendedores++;
  }
  // total productos
  var totalProds = 0;
  var totalActivos2 = 0;
  var totalInactivos = 0;
  var totalElectronica = 0;
  var totalAccesorios = 0;
  var totalAudio = 0;
  var totalAlmacenamiento = 0;
  var totalComponentes = 0;
  var totalMuebles = 0;
  var stockTotal = 0;
  var valorInventario = 0;
  for (var i = 0; i < dbProducts.length; i++) {
    totalProds++;
    if (dbProducts[i].activo == true) totalActivos2++;
    if (dbProducts[i].activo == false) totalInactivos++;
    if (dbProducts[i].cat == "electronica") totalElectronica++;
    if (dbProducts[i].cat == "accesorios") totalAccesorios++;
    if (dbProducts[i].cat == "audio") totalAudio++;
    if (dbProducts[i].cat == "almacenamiento") totalAlmacenamiento++;
    if (dbProducts[i].cat == "componentes") totalComponentes++;
    if (dbProducts[i].cat == "muebles") totalMuebles++;
    stockTotal = stockTotal + dbProducts[i].stock;
    valorInventario =
      valorInventario + dbProducts[i].prec * dbProducts[i].stock;
  }
  stats.usuarios = {
    total: totalUsers,
    activos: totalActivos,
    bloqueados: totalBloqueados,
    admin: totalAdmin,
    clientes: totalClientes,
    vendedores: totalVendedores,
  };
  stats.productos = {
    total: totalProds,
    activos: totalActivos2,
    inactivos: totalInactivos,
    porCategoria: {
      electronica: totalElectronica,
      accesorios: totalAccesorios,
      audio: totalAudio,
      almacenamiento: totalAlmacenamiento,
      componentes: totalComponentes,
      muebles: totalMuebles,
    },
    stockTotal: stockTotal,
    valorInventario: valorInventario,
  };
  cb({ ok: true, msg: "ok", data: stats });
  return;
}


