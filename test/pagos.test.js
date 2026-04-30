import assert from 'node:assert/strict';
import { calcularPrecio, procesarPago } from '../src/pagos.js';
import { dbUsers } from '../src/database.js';

describe('calcularPrecio', () => {
  it('retorna el precio base si no hay descuentos ni IVA', () => {
    const r = calcularPrecio(100000, 0, 0, 0, false, 0, 1);
    assert.equal(r.totalFinal, 100000);
  });

  it('aplica IVA del 19% correctamente', () => {
    const r = calcularPrecio(100000, 0, 0, 0, true, 0, 1);
    assert.equal(r.montoIva, 19000);
    assert.equal(r.totalFinal, 119000);
  });

  it('aplica el descuento de nivel correctamente', () => {
    const r = calcularPrecio(100000, 10, 0, 0, false, 0, 1);
    assert.equal(r.descuentoNivel, 10000);
    assert.equal(r.totalFinal, 90000);
  });
});

describe('procesarPago', () => {
  it('retorna error si el carrito está vacío', (done) => {
    procesarPago(1, 'efectivo', 'Calle 123', null, (r) => {
      assert.equal(r.ok, false);
      assert.equal(r.msg, 'carrito vacio');
      done();
    });
  });

  it('procesa el pago correctamente', (done) => {
    const pedro = dbUsers.find((u) => u.id === 3);
    pedro.carrito = [{ prodId: 103, qty: 1, addedAt: new Date() }];
    procesarPago(3, 'efectivo', 'Calle 123', null, (r) => {
      assert.equal(r.ok, true);
      assert.equal(r.data.estado, 'pagado');
      done();
    });
  });
});
