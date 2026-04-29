// Fuente: borrador/function_vsr.js (calcEnvio + shipping_config)

const shippingConfig = {
  ciudades: {
    'Santiago':    1.0,
    'Valparaiso':  1.2,
    'Concepcion':  1.4,
    'La Serena':   1.6,
    'Antofagasta': 1.8,
    'Iquique':     2.0,
    'Punta Arenas':2.5,
  },
  rangosPeso: [
    { max: 1,        costo: 2000 },
    { max: 5,        costo: 3500 },
    { max: 10,       costo: 5000 },
    { max: 20,       costo: 8000 },
    { max: Infinity, costo: 12000 },
  ],
  multiplicadorProducto: {
    fragil:     1.5,
    electronico:1.3,
    normal:     1.0,
  },
  recargos: {
    urgente: 0.5,
    seguro:  0.1,
  },
};

export function calcularEnvio(destCiudad, peso, tipoProducto, esUrgente, esGratis, tieneSeguro) {
  if (esGratis) return { costo: 0, desglose: 'Envío gratis' };

  const multiplicadorCiudad = shippingConfig.ciudades[destCiudad];
  if (!multiplicadorCiudad) return { ok: false, msg: 'Ciudad no disponible' };

  const rango = shippingConfig.rangosPeso.find((r) => peso <= r.max);
  if (!rango) return { ok: false, msg: 'Peso inválido' };

  const multiplicadorProducto = shippingConfig.multiplicadorProducto[tipoProducto] || 1.0;

  const costoBase      = rango.costo * multiplicadorProducto * multiplicadorCiudad;
  const recargoUrgente = esUrgente    ? costoBase * shippingConfig.recargos.urgente : 0;
  const recargoSeguro  = tieneSeguro  ? costoBase * shippingConfig.recargos.seguro  : 0;

  return {
    costo: costoBase + recargoUrgente + recargoSeguro,
    desglose: { base: costoBase, urgente: recargoUrgente, seguro: recargoSeguro },
  };
}
