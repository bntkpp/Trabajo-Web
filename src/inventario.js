import { dbUsers, dbProducts } from './database.js';

// ─── Inventario ─────────────────────────────────────────────────────────────
// Fuente: borrador/function_vsr.js (verificarInventario)
// Usa dbProducts de database.js en vez de lista duplicada

const nivelesInventario = [
  { max: 0,        estado: 'Agotado', color: 'red',    alerta: true  },
  { max: 5,        estado: 'Crítico', color: 'orange', alerta: true  },
  { max: 15,       estado: 'Bajo',    color: 'yellow', alerta: true  },
  { max: 30,       estado: 'Normal',  color: 'green',  alerta: false },
  { max: Infinity, estado: 'Alto',    color: 'green',  alerta: false },
];

export function verificarInventario(prodId) {
  const producto = dbProducts.find((p) => p.id === prodId);
  if (!producto) return { ok: false, msg: 'Producto no encontrado' };

  const nivel = nivelesInventario.find((n) => producto.stock <= n.max);

  return {
    ok:     true,
    prodId,
    stock:  producto.stock,
    estado: nivel.estado,
    color:  nivel.color,
    alerta: nivel.alerta,
  };
}

// ─── Estadísticas ───────────────────────────────────────────────────────────
// Fuente: borrador/functions.js (obtenerEstadisticas)

export function obtenerEstadisticas(cb) {
  const statsUsuarios = dbUsers.reduce(
    (acc, user) => {
      acc.total++;
      if (user.activo)            acc.activos++;
      if (user.bloqueado)         acc.bloqueados++;
      if (user.tipo === 'admin')   acc.admin++;
      if (user.tipo === 'cliente') acc.clientes++;
      if (user.tipo === 'vendedor')acc.vendedores++;
      return acc;
    },
    { total: 0, activos: 0, bloqueados: 0, admin: 0, clientes: 0, vendedores: 0 }
  );

  const statsProductos = dbProducts.reduce(
    (acc, prod) => {
      acc.total++;
      if (prod.activo) acc.activos++;
      else             acc.inactivos++;
      if (acc.porCategoria[prod.categoria] !== undefined)
        acc.porCategoria[prod.categoria]++;
      acc.stockTotal      += prod.stock;
      acc.valorInventario += prod.precio * prod.stock;
      return acc;
    },
    {
      total: 0, activos: 0, inactivos: 0,
      porCategoria: { electronica: 0, accesorios: 0, audio: 0, almacenamiento: 0, componentes: 0, muebles: 0 },
      stockTotal: 0, valorInventario: 0,
    }
  );

  cb({ ok: true, msg: 'ok', data: { usuarios: statsUsuarios, productos: statsProductos } });
}
