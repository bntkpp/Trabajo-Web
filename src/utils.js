// ─── Fechas ──────────────────────────────────────────────────────────────────
// Fuente: borrador/integracion.js / borrador/Funciones (matias h)

function pad(n) {
  return n < 10 ? '0' + n : n;
}

export function formatDate(d) {
  return (
    pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear() +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
  );
}

export function formatDate2(d) {
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
}

// Convierte 'YYYY-MM-DD' → 'DD/MM/YYYY'
export function formatDate3(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) return parts[2] + '/' + parts[1] + '/' + parts[0];
  return dateStr;
}

// ─── Paginación ──────────────────────────────────────────────────────────────
// Fuente: borrador/function_vsr.js (paginar) + borrador/functionsBasti.js (paginate)

export function paginar(items, pagina = 1, tamanio = 10) {
  const total       = items.length;
  const totalPaginas = Math.ceil(total / tamanio);
  const inicio      = (pagina - 1) * tamanio;
  return {
    items:        items.slice(inicio, inicio + tamanio),
    pagina,
    totalPaginas,
    total,
    tamanio,
  };
}

// ─── Ordenamiento ────────────────────────────────────────────────────────────
// Fuente: borrador/functionsBasti.js (sortByField) — reemplaza sortProducts/sortUsers/sortOrders

export function ordenarPor(items, campo, orden = 'asc') {
  const dir = orden === 'asc' ? 1 : -1;
  return items.slice().sort((a, b) => {
    if (a[campo] < b[campo]) return -1 * dir;
    if (a[campo] > b[campo]) return 1  * dir;
    return 0;
  });
}

// ─── Log ────────────────────────────────────────────────────────────────────
// Fuente: borrador/function_vsr.js (registrar)

const LOG_NIVELES = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };
let nivelActual   = LOG_NIVELES.INFO;

export function registrar(msg, nivel = 'INFO', datos = null) {
  if (LOG_NIVELES[nivel] > nivelActual) return;
  const timestamp = new Date().toISOString();
  const entrada   = `[${timestamp}] [${nivel}] ${msg}`;
  console.log(datos ? `${entrada} | DATA: ${JSON.stringify(datos)}` : entrada);
}

// ─── Texto y objetos ─────────────────────────────────────────────────────────
// Fuente: borrador/funcionesB.js (utils) + borrador/integracion.js

export const utils = {
  capitalize:  (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '',
  truncate:    (str, max) => str.length <= max ? str : str.slice(0, max - 3) + '...',
  slugify:     (str) => str.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
  deepClone:   (obj) => JSON.parse(JSON.stringify(obj)),
  isEmptyObj:  (obj) => Object.keys(obj).length === 0,
  sumArray:    (arr) => arr.reduce((acc, n) => acc + n, 0),
  avgArray:    (arr) => arr.length === 0 ? 0 : utils.sumArray(arr) / arr.length,
  uniqueArray: (arr) => [...new Set(arr)],
  flatArray:   (arr) => arr.flat(),
};
