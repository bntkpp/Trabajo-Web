import { dbUsers, dbProducts } from './database.js';

// Fuente: borrador/functions.js (agregarAlCarrito)
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

  const itemEnCarrito = foundUser.carrito.find((item) => item.prodId === prodId);
  if (itemEnCarrito) {
    itemEnCarrito.qty += qty;
  } else {
    foundUser.carrito.push({ prodId, qty, addedAt: new Date() });
  }

  const total = foundUser.carrito.reduce((acc, item) => {
    const prod = dbProducts.find((p) => p.id === item.prodId);
    return acc + (prod ? prod.precio * item.qty : 0);
  }, 0);

  cb({ ok: true, msg: 'producto agregado al carrito', data: { carrito: foundUser.carrito, total } });
}

// Fuente: borrador/function_vsr.js (wishlist) — usa dbUsers de database.js
export function wishlist(action, userId, productId) {
  const usuario = dbUsers.find((u) => u.id === userId);
  if (!usuario) return { ok: false, msg: 'usuario no encontrado' };

  switch (action) {
    case 'add':
      if (usuario.wishlist.includes(productId))
        return { ok: false, msg: 'producto ya en la wishlist' };
      usuario.wishlist.push(productId);
      return { ok: true, msg: 'agregado a la wishlist', wishlist: usuario.wishlist };

    case 'remove': {
      const index = usuario.wishlist.indexOf(productId);
      if (index === -1) return { ok: false, msg: 'producto no esta en la wishlist' };
      usuario.wishlist.splice(index, 1);
      return { ok: true, msg: 'removido de la wishlist', wishlist: usuario.wishlist };
    }

    case 'get':
      return { ok: true, wishlist: usuario.wishlist };

    default:
      return { ok: false, msg: 'accion no reconocida' };
  }
}
