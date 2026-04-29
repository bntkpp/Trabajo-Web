/**
 * ============================================================================
 * Ajustes - Cristobal Piña
 * ============================================================================
 * Lineas 500 - 570: Función de generación de reportes (hacerReporte)
 * Lineas 740 - 781: Función de renderizado de productos (renderProduct)
 * 
 * 1. Unificación de reportes:
 *    - Se reemplazan las tres versiones separadas por una función y evitar la redudancia de usar 3 veces la misma funcion
 *
 * 2. Reutilización de lógica:
 *    - Se armo un encabezado común y una función para construir cada línea del reporte
 *
 * 3. Mejor mantenimiento:
 *    - Se simplifica la función de generación de reportes para que sea más fácil de mantener y extender en el futuro.
 *
 * 4. Validación de datos:
 *    - Se creo un validador de datos para que no hayan errores con datos vacios o nulos
 *
 * 5. Legibilidad:
 *    - Se mejoro la construccion de strings con template literals y se agregaron comentarios para mejorar la legibilidad del código.
 * ============================================================================
 */


// Funciones de formato (Se mantienen separadas para limpieza)
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


// Funcuion de generacion de reportes
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

  // Validación de datos con mensaje de error
  if (!Array.isArray(data) || data.length === 0) 
    {
    return report + "Sin datos para generar el reporte.\n";
  }

  let totalGeneral = 0;
  let max = -Infinity; //Se arregla el error que se rompia con numero negativos
  let min = Infinity;
  const lines = [];

  // Un solo ciclo para cualquier tipo de dato (No como la version anterior que tenia 3 ciclos separados)
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
  report += `\n${conf.sep.replace(/=/g, "-")}\n`; // Genera línea divisoria dinámica
  report += `Total ${tipo}: ${data.length}\n`;
  report += `Promedio: ${conf.unit}${avg.toFixed(2)}\n`;
  report += `Máximo: ${conf.unit}${max}\n`;
  report += `Mínimo: ${conf.unit}${min}\n`;

  return report;
}

// Funcion principal de reportes
function hacerReporte(type, from, to, data) 
{
  if (["ventas", "productos", "usuarios"].includes(type)) 
    {
    return generarReporte(type, from, to, data);
  }
  return "Tipo de reporte no valido";
}

// Exportación
if (typeof module !== "undefined" && module.exports) 
    {
  module.exports = { hacerReporte };
}

//Segunda funcion
// Helper para escapar texto (Prevención XSS)
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

// badges de stock
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

// funcion que muestra las estrellas del rating
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

function renderProduct(p) 
{
  // la validacion de imagen con una default en caso de que no haya imagenes
  const imageUrl = (p.imgs && Array.isArray(p.imgs) && p.imgs.length > 0) 
    ? p.imgs[0] 
    : 'assets/img/no-image.png'; // hay que poner la ruta de una imagen default...

  // textos visibles sanizados
  const safeName = escapeHTML(p.nom);

  const safeDesc = escapeHTML(p.desc);

  const safeCat = escapeHTML(p.cat);
  
  // la renderizacion limpia con Template Strings
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
        <div class='price'>${fmtPrice(p.prec)}</div>
        <div class='category'>Categoría: ${safeCat}</div>
        
        ${
          (p.activo && p.stock > 0) 
            // se usa data-id en lugar de onclick="..."
            ? `<button class='btn-cart' data-id='${p.id}'>Agregar al carrito</button>`
            : `<button disabled class='btn-cart-disabled'>No disponible</button>`
        }
      </div>
    </div>
  `;
}

// Listener global para manejar clicks en botones de carrito (Delegación de eventos)
document.addEventListener('click', function(event) 
{
  // Verificamos si el elemento clickeado tiene la clase del botón del carrito
  if (event.target.classList.contains('btn-cart')) 
    {
    // Obtenemos el ID desde el atributo data-id
    const productId = event.target.dataset.id;
    
    // Llamamos a tu función original
    if (productId) {
      addToCart(productId, 1);
    }
  }
});
