import { dbUsers } from './database.js';

// ─── Helpers internos ───────────────────────────────────────────────────────

function calcularNivel(puntos) {
  if (puntos >= 300) return 'platino';
  if (puntos >= 200) return 'oro';
  if (puntos >= 100) return 'plata';
  return 'bronce';
}

function validarNombre(v)   { return v && v.length >= 3; }
function validarEmail(v)    { return v && v.includes('@'); }
function validarPassword(v) { return v && v.length >= 8; }
function validarRut(v)      { return v && v.length >= 8; }
function validarTelefono(v) { return v && v.length >= 9; }

export function validarFormulario(formData) {
  const errores = [];
  if (!validarNombre(formData.nombre))     errores.push('Nombre inválido: mínimo 3 caracteres');
  if (!validarEmail(formData.email))       errores.push('Email inválido');
  if (!validarPassword(formData.password)) errores.push('Contraseña: mínimo 8 caracteres');
  if (!validarRut(formData.rut))           errores.push('RUT inválido');
  if (!validarTelefono(formData.telefono)) errores.push('Teléfono inválido');
  if (formData.password !== formData.passwordConfirm) errores.push('Las contraseñas no coinciden');
  return errores;
}

const usuariosRepo = {
  existeEmail: (email, db) => db.some((u) => u.email === email),
  guardar:     (usuario, db) => db.push(usuario),
};

const hashPassword = (password) => `hashed_${password}`;

function crearUsuario(formData) {
  const ahora = new Date().toISOString();
  return {
    id:               crypto.randomUUID(),
    nombre:           formData.nombre,
    email:            formData.email,
    passwordHash:     hashPassword(formData.password),
    rut:              formData.rut,
    telefono:         formData.telefono,
    tipo:             'cliente',
    puntos:           0,
    activo:           true,
    bloqueado:        false,
    intentosFallidos: 0,
    historial:        [],
    carrito:          [],
    wishlist:         [],
    direcciones:      [],
    metodosPago:      [],
    ultimoLogin:      null,
    creadoEn:         ahora,
    actualizadoEn:    ahora,
  };
}

const crearSesion = (usuario) => ({
  usuario,
  token:       `tkn_${crypto.randomUUID()}`,
  tiempoLogin: new Date().toISOString(),
});

// ─── Exports ────────────────────────────────────────────────────────────────

// Fuente: borrador/functions.js (buscarUsuario) + borrador/integracion.js (calcularNivel)
export function buscarUsuario(email, password, cb) {
  const foundUser = dbUsers.find(
    (user) => user.email === email && user.pass === password
  );

  if (!foundUser) {
    const userByEmail = dbUsers.find((user) => user.email === email);
    if (userByEmail) {
      userByEmail.intentos++;
      if (userByEmail.intentos >= 3) userByEmail.bloqueado = true;
    }
    cb({ ok: false, msg: 'credenciales invalidas', data: null });
    return;
  }

  if (foundUser.bloqueado) {
    cb({ ok: false, msg: 'usuario bloqueado', data: null });
    return;
  }

  if (!foundUser.activo) {
    cb({ ok: false, msg: 'usuario inactivo', data: null });
    return;
  }

  foundUser.nivel       = calcularNivel(foundUser.puntos);
  foundUser.ultimoLogin = new Date().toISOString();

  const sessData = {
    user:      foundUser,
    token:     'tkn_' + Math.random().toString(36).substr(2, 9),
    loginTime: new Date(),
  };

  cb({ ok: true, msg: 'login ok', data: sessData });
}

// Fuente: borrador/funcionesB.js (Registrar_Usuario, Validar_Formulario, Crear_Usuario)
export async function registrarUsuario(formData, baseDeDatos) {
  const errores = validarFormulario(formData);
  if (errores.length > 0) return { ok: false, errores };

  if (usuariosRepo.existeEmail(formData.email, baseDeDatos))
    return { ok: false, errores: ['Email ya registrado'] };

  const usuario = crearUsuario(formData);
  usuariosRepo.guardar(usuario, baseDeDatos);

  return { ok: true, usuario, sesion: crearSesion(usuario), redirigirA: '/dashboard' };
}
