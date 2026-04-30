import assert from 'node:assert/strict';
import { agregarAlCarrito, wishlist } from '../src/carrito.js';
import { dbUsers } from '../src/database.js';

describe('agregarAlCarrito', () => {
  before(() => {
    dbUsers.find((u) => u.id === 5).carrito = [];
  });

  it('agrega un producto al carrito correctamente', (done) => {
    agregarAlCarrito(5, 102, 1, (r) => {
      assert.equal(r.ok, true);
      assert.equal(r.msg, 'producto agregado al carrito');
      done();
    });
  });

  it('retorna error si el producto no existe', (done) => {
    agregarAlCarrito(5, 9999, 1, (r) => {
      assert.equal(r.ok, false);
      assert.equal(r.msg, 'producto no encontrado');
      done();
    });
  });

  it('retorna error si no hay suficiente stock', (done) => {
    agregarAlCarrito(5, 101, 1000, (r) => {
      assert.equal(r.ok, false);
      assert.equal(r.msg, 'stock insuficiente');
      done();
    });
  });
});

describe('wishlist', () => {
  before(() => {
    dbUsers.find((u) => u.id === 2).wishlist = [];
  });

  it('agrega un producto a la wishlist', () => {
    const r = wishlist('add', 2, 103);
    assert.equal(r.ok, true);
    assert.ok(r.wishlist.includes(103));
  });

  it('remueve un producto de la wishlist', () => {
    wishlist('add', 2, 104);
    const r = wishlist('remove', 2, 104);
    assert.equal(r.ok, true);
    assert.ok(!r.wishlist.includes(104));
  });
});
