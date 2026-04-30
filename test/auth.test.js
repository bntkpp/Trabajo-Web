import assert from 'node:assert/strict';
import { validarFormulario, buscarUsuario } from '../src/auth.js';

describe('validarFormulario', () => {
  it('retorna sin errores con datos válidos', () => {
    const r = validarFormulario({
      nombre: 'Juan Perez',
      email: 'juan@mail.com',
      password: 'segura123',
      passwordConfirm: 'segura123',
      rut: '12345678-9',
      telefono: '912345678',
    });
    assert.equal(r.length, 0);
  });

  it('detecta email inválido', () => {
    const r = validarFormulario({
      nombre: 'Juan Perez',
      email: 'correoSinArroba',
      password: 'segura123',
      passwordConfirm: 'segura123',
      rut: '12345678-9',
      telefono: '912345678',
    });
    assert.ok(r.some((e) => e.includes('Email')));
  });

  it('detecta contraseñas que no coinciden', () => {
    const r = validarFormulario({
      nombre: 'Juan Perez',
      email: 'juan@mail.com',
      password: 'segura123',
      passwordConfirm: 'diferente',
      rut: '12345678-9',
      telefono: '912345678',
    });
    assert.ok(r.some((e) => e.includes('no coinciden')));
  });
});

describe('buscarUsuario', () => {
  it('retorna ok:true con credenciales correctas', (done) => {
    buscarUsuario('juan@mail.com', '1234', (r) => {
      assert.equal(r.ok, true);
      assert.equal(r.msg, 'login ok');
      done();
    });
  });

  it('retorna ok:false con contraseña incorrecta', (done) => {
    buscarUsuario('maria@mail.com', 'incorrecta', (r) => {
      assert.equal(r.ok, false);
      done();
    });
  });

  it('retorna ok:false si el usuario está bloqueado', (done) => {
    buscarUsuario('ana@mail.com', 'ana2024', (r) => {
      assert.equal(r.ok, false);
      assert.equal(r.msg, 'usuario bloqueado');
      done();
    });
  });
});
