import assert from 'node:assert/strict';
import { buscarProductos } from '../src/productos.js';

describe('buscarProductos', () => {
  it('retorna todos los productos activos', (done) => {
    buscarProductos('', '', 0, 999999999, (r) => {
      assert.equal(r.ok, true);
      assert.equal(r.data.length, 9);
      done();
    });
  });

  it('filtra por categoría', (done) => {
    buscarProductos('', 'electronica', 0, 999999999, (r) => {
      assert.ok(r.data.every((p) => p.categoria === 'electronica'));
      done();
    });
  });

  it('filtra por texto en el nombre', (done) => {
    buscarProductos('mouse', '', 0, 999999999, (r) => {
      assert.ok(r.data.length > 0);
      done();
    });
  });

  it('retorna vacío si no hay coincidencias', (done) => {
    buscarProductos('productoquenoexiste', '', 0, 999999999, (r) => {
      assert.equal(r.data.length, 0);
      done();
    });
  });
});
