// Fuente: borrador/functionsCristobal.js (hacerReporte + helpers)

function construirEncabezado(titulo, from, to, separador) {
  return `${titulo}\n Desde: ${from}\n Hasta: ${to}\n${separador}\n`;
}

function construirLineaReporte(tipo, item) {
  const plantillas = {
    ventas:    `Orden: ${item.id} - Total: $${item.total} - Estado: ${item.estado}`,
    productos: `Producto: ${item.nombre} - Precio: $${item.precio} - Stock: ${item.stock} - Rating: ${item.rating}`,
    usuarios:  `Usuario: ${item.nombre} - Email: ${item.email} - Tipo: ${item.tipo} - Puntos: ${item.puntos} - Activo: ${item.activo}`,
  };
  return plantillas[tipo] || '';
}

function generarReporte(tipo, from, to, data) {
  const config = {
    ventas:    { txt: 'VENTAS',    sep: '========================',    key: 'total',  unit: '$' },
    productos: { txt: 'PRODUCTOS', sep: '============================', key: 'precio', unit: '$' },
    usuarios:  { txt: 'USUARIOS',  sep: '===========================',  key: 'puntos', unit: ''  },
  };

  const conf   = config[tipo];
  let   report = construirEncabezado(`=== REPORTE DE ${conf.txt} ===`, from, to, conf.sep);

  if (!Array.isArray(data) || data.length === 0)
    return report + 'Sin datos para generar el reporte.\n';

  let totalGeneral = 0;
  let max          = -Infinity;
  let min          = Infinity;
  const lines      = [];

  data.forEach((item) => {
    const valor = item[conf.key];
    totalGeneral += valor;
    if (valor > max) max = valor;
    if (valor < min) min = valor;
    lines.push(construirLineaReporte(tipo, item));
  });

  const avg = totalGeneral / data.length;

  report += lines.join('\n');
  report += `\n${conf.sep.replace(/=/g, '-')}\n`;
  report += `Total ${tipo}: ${data.length}\n`;
  report += `Promedio: ${conf.unit}${avg.toFixed(2)}\n`;
  report += `Máximo: ${conf.unit}${max}\n`;
  report += `Mínimo: ${conf.unit}${min}\n`;

  return report;
}

export function hacerReporte(tipo, from, to, data) {
  if (['ventas', 'productos', 'usuarios'].includes(tipo))
    return generarReporte(tipo, from, to, data);
  return 'Tipo de reporte no válido';
}
