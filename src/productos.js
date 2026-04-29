import { dbProducts } from './database.js';

// ─── Helpers internos ───────────────────────────────────────────────────────

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function getStockBadge(stock) {
  if (stock <= 0) return "<div class='badge-agotado'>AGOTADO</div>";
  if (stock <= 5) return `<div class='badge-poco-stock'>ÚLTIMAS ${stock} UNIDADES</div>`;
  return '';
}

function getStarsHTML(rating) {
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < Math.floor(rating) ? '★' : '☆';
  }
  return `${stars} (${rating})`;
}

// ─── Exports ────────────────────────────────────────────────────────────────

// Fuente: borrador/functions.js (buscarProductos) — usa campos de database.js
export function buscarProductos(query, categoria, precioMin = 0, precioMax = 999999999, cb) {
  const resultados = dbProducts.filter((prod) => {
    if (!prod.activo) return false;

    const coincideQuery =
      !query ||
      prod.nombre.toLowerCase().includes(query.toLowerCase()) ||
      prod.descripcion.toLowerCase().includes(query.toLowerCase()) ||
      prod.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

    const coincideCategoria = !categoria || prod.categoria === categoria;
    const coincidePrecio    = prod.precio >= precioMin && prod.precio <= precioMax;

    return coincideQuery && coincideCategoria && coincidePrecio;
  });

  resultados.sort((a, b) => b.rating - a.rating);
  cb({ ok: true, msg: 'ok', data: resultados });
}

// Fuente: borrador/functionsCristobal.js (renderProduct) — con sanitización XSS y campos corregidos
export function renderProduct(p) {
  const imageUrl = p.imgs && Array.isArray(p.imgs) && p.imgs.length > 0
    ? p.imgs[0]
    : 'assets/img/no-image.png';

  const safeName = escapeHTML(p.nombre);
  const safeDesc = escapeHTML(p.descripcion);
  const safeCat  = escapeHTML(p.categoria);

  return `
    <div class='product-card'>
      <div class='product-img'>
        <img src='${imageUrl}' alt='${safeName}'>
        ${getStockBadge(p.stock)}
      </div>
      <div class='product-info'>
        <h3>${safeName}</h3>
        <div class='rating'>${getStarsHTML(p.rating)}</div>
        <p class='desc'>${safeDesc}</p>
        <div class='price'>$${p.precio}</div>
        <div class='category'>Categoría: ${safeCat}</div>
        ${
          p.activo && p.stock > 0
            ? `<button class='btn-cart' data-id='${p.id}'>Agregar al carrito</button>`
            : `<button disabled class='btn-cart-disabled'>No disponible</button>`
        }
      </div>
    </div>
  `;
}
