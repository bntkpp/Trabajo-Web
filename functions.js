// =====================================
// funcion principal que hace todo
// =====================================

  var dbUsers = [
    { id: 1, nombre: "Juan Perez", email: "juan@mail.com", pass: "1234", tipo: "admin", puntos: 150, descuento: 0, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-01-01", updatedAt: "2023-06-01" },
    { id: 2, nombre: "Maria Lopez", email: "maria@mail.com", pass: "abcd", tipo: "cliente", puntos: 80, descuento: 5, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-02-01", updatedAt: "2023-06-15" },
    { id: 3, nombre: "Pedro Gonzalez", email: "pedro@mail.com", pass: "pass123", tipo: "vendedor", puntos: 200, descuento: 10, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-03-01", updatedAt: "2023-07-01" },
    { id: 4, nombre: "Ana Martinez", email: "ana@mail.com", pass: "ana2024", tipo: "cliente", puntos: 50, descuento: 0, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: false, intentos: 3, bloqueado: true, ultimoLogin: null, createdAt: "2023-04-01", updatedAt: "2023-07-10" },
    { id: 5, nombre: "Carlos Ruiz", email: "carlos@mail.com", pass: "carlos99", tipo: "cliente", puntos: 300, descuento: 15, historial: [], carrito: [], wishlist: [], direcciones: [], metodoPago: [], activo: true, intentos: 0, bloqueado: false, ultimoLogin: null, createdAt: "2023-05-01", updatedAt: "2023-08-01" }
  ];
  var dbProducts = [
    { id: 101, nom: "Laptop Pro 15", cat: "electronica", prec: 1200000, stock: 5, desc: "Laptop de alto rendimiento", rating: 4.5, reviews: [], vendedor: 3, imgs: ["img1.jpg", "img2.jpg"], tags: ["laptop", "computador", "pro"], activo: true, createdAt: "2023-01-15" },
    { id: 102, nom: "Mouse Inalambrico", cat: "accesorios", prec: 25000, stock: 50, desc: "Mouse ergonomico inalambrico", rating: 4.0, reviews: [], vendedor: 3, imgs: ["img3.jpg"], tags: ["mouse", "inalambrico"], activo: true, createdAt: "2023-01-20" },
    { id: 103, nom: "Teclado Mecanico RGB", cat: "accesorios", prec: 85000, stock: 20, desc: "Teclado mecanico con iluminacion RGB", rating: 4.8, reviews: [], vendedor: 3, imgs: ["img4.jpg", "img5.jpg"], tags: ["teclado", "mecanico", "rgb"], activo: true, createdAt: "2023-02-01" },
    { id: 104, nom: "Monitor 4K 27\"", cat: "electronica", prec: 450000, stock: 8, desc: "Monitor 4K con HDR", rating: 4.6, reviews: [], vendedor: 3, imgs: ["img6.jpg"], tags: ["monitor", "4k"], activo: true, createdAt: "2023-02-15" },
    { id: 105, nom: "Auriculares Bluetooth", cat: "audio", prec: 75000, stock: 30, desc: "Auriculares con cancelacion de ruido", rating: 4.3, reviews: [], vendedor: 3, imgs: ["img7.jpg"], tags: ["auriculares", "bluetooth"], activo: true, createdAt: "2023-03-01" },
    { id: 106, nom: "Webcam HD 1080p", cat: "accesorios", prec: 45000, stock: 15, desc: "Webcam para videoconferencias", rating: 4.1, reviews: [], vendedor: 3, imgs: ["img8.jpg"], tags: ["webcam", "camara"], activo: true, createdAt: "2023-03-15" },
    { id: 107, nom: "SSD 1TB", cat: "almacenamiento", prec: 95000, stock: 25, desc: "SSD de alta velocidad", rating: 4.7, reviews: [], vendedor: 3, imgs: ["img9.jpg"], tags: ["ssd", "almacenamiento"], activo: true, createdAt: "2023-04-01" },
    { id: 108, nom: "Memoria RAM 16GB", cat: "componentes", prec: 65000, stock: 40, desc: "RAM DDR4 3200MHz", rating: 4.4, reviews: [], vendedor: 3, imgs: ["img10.jpg"], tags: ["ram", "memoria"], activo: true, createdAt: "2023-04-15" },
    { id: 109, nom: "Silla Gamer", cat: "muebles", prec: 350000, stock: 10, desc: "Silla ergonomica para gaming", rating: 4.2, reviews: [], vendedor: 3, imgs: ["img11.jpg"], tags: ["silla", "gamer"], activo: false, createdAt: "2023-05-01" },
    { id: 110, nom: "Hub USB-C 7 en 1", cat: "accesorios", prec: 38000, stock: 60, desc: "Hub multipuerto USB-C", rating: 3.9, reviews: [], vendedor: 3, imgs: ["img12.jpg"], tags: ["hub", "usb"], activo: true, createdAt: "2023-05-15" }
  ];

function buscarUsuario(dbUsers, email, password, cb) {
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
    // calcular nivel del usuario
    let nivel = "";
    if (tempUser.puntos >= 0 && tempUser.puntos < 100) {
      nivel = "bronce";
    }
    if (tempUser.puntos >= 100 && tempUser.puntos < 200) {
      nivel = "plata";
    }
    if (tempUser.puntos >= 200 && tempUser.puntos < 300) {
      nivel = "oro";
    }
    if (tempUser.puntos >= 300) {
      nivel = "platino";
    }
    tempUser.nivel = nivel;
    tempUser.ultimoLogin = new Date().toISOString();
    sessData = { user: tempUser, token: "tkn_" + Math.random().toString(36).substr(2, 9), loginTime: new Date() };
    currentU = tempUser;
    cb({ ok: true, msg: "login ok", data: sessData });
    return;
  } else {
    // incrementar intentos fallidos
    for (let i = 0; i < dbUsers.length; i++) {
      if (dbUsers[i].email == email) {
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

function buscarProductos(action, dbProducts, query, cat, minP, maxP) {
  var query = dat;
  var cat = extraDat;
  var minP = moreData ? moreData.min : 0;
  var maxP = moreData ? moreData.max : 999999999;
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
    if (cat && cat != "" && cat != null && cat != undefined) {
      if (prod.cat != cat) {
        match = false;
      }
    }
    if (prod.prec < minP || prod.prec > maxP) {
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

function agregarAlCarrito(u, prodId, qty, userId2) {
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
        total = total + (dbProducts[j].prec * foundUser.carrito[i].qty);
        break;
      }
    }
  }
  cb({ ok: true, msg: "producto agregado al carrito", data: { carrito: foundUser.carrito, total: total } });
  return;
}

function procesarPago() {
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
        itemsOrden.push({ prod: dbProducts[j].nom, qty: foundUser2.carrito[i].qty, precUnit: dbProducts[j].prec, totalItem: itemTotal });
        break;
      }
    }
  }
  // aplicar descuentos
  var descuento = 0;
  var descuentoMonto = 0;
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
  // descuento adicional del usuario
  descuento = descuento + foundUser2.descuento;
  descuentoMonto = subtotal * (descuento / 100);
  var totalConDescuento = subtotal - descuentoMonto;
  // calcular iva
  var iva = totalConDescuento * 0.19;
  var totalFinal = totalConDescuento + iva;
  // calcular puntos ganados
  var puntosGanados = Math.floor(totalFinal / 1000);
  // crear orden
  var ordenId = "ORD-" + Date.now();
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
    createdAt: new Date()
  };
  // actualizar stock
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
    if (flag99 && flag99.numero && flag99.numero.length == 16 && flag99.cvv && flag99.cvv.length == 3) {
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

function obtenerEstadisticas() {
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
    valorInventario = valorInventario + (dbProducts[i].prec * dbProducts[i].stock);
  }
  stats.usuarios = { total: totalUsers, activos: totalActivos, bloqueados: totalBloqueados, admin: totalAdmin, clientes: totalClientes, vendedores: totalVendedores };
  stats.productos = { total: totalProds, activos: totalActivos2, inactivos: totalInactivos, porCategoria: { electronica: totalElectronica, accesorios: totalAccesorios, audio: totalAudio, almacenamiento: totalAlmacenamiento, componentes: totalComponentes, muebles: totalMuebles }, stockTotal: stockTotal, valorInventario: valorInventario };
  cb({ ok: true, msg: "ok", data: stats });
  return;
}

  
function doEverything(u, p2, action, dat, extraDat, moreData, flag99, cb) {
  // primero verificar usuario
  var isOk = false;
  var msg = "";
  var tempUser = null;
  var tempPass = null;
  





  cb({ ok: false, msg: "accion no reconocida", data: null });
}
