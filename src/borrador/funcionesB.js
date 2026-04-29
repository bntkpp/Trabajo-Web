
//Línea 442 a 497
// calcula descuentos por orden, primero nivel, luego cupón sobre lo que queda, luego especial
function Calcular_Descuento(precio, descuentoNivel, descuentoCupon, descuentoEspecial) {
  const monto_DescuentoN = precio * (descuentoNivel / 100);
  const monto_DescuentoC = (precio - monto_DescuentoN) * (descuentoCupon / 100);
  const monto_DescuentoE = (precio - monto_DescuentoN - monto_DescuentoC) * (descuentoEspecial / 100);
  return {
    precioConDescuento: precio - monto_DescuentoN - monto_DescuentoC - monto_DescuentoE,
    descuentoCupon: monto_DescuentoC,
    descuentoEspecial: monto_DescuentoE,
    descuentoNivel: monto_DescuentoN
  };
}

// si tieneIva es true le mete el 19%, si no queda igual, si no mal recuerdo nos enseñó lo del ? en clases
function Sacar_PrecioIva(precio, tieneIva) {
  let montoIva = tieneIva ? precio * 0.19 : 0;
  return { precioConIva: precio + montoIva, montoIva };
}

// simple, si hay envío lo suma
function Calcular_Precio_Envio(precio, envio) {
  if (envio > 0) return precio + envio;
  return precio;
}

// las tasas las saqué viendo que hacía la funcion mal hecha pero fue un dolor de cabeza entenderla así que lo hice con IA
const TASAS_CUOTAS = { 2: 1.02, 3: 1.04, 6: 1.08, 12: 1.15, 24: 1.28, 36: 1.45 };

const Calcular_Precio_Final_Con_Cuotas = (precio, numeroCuotas) => {
  if (numeroCuotas > 1 && numeroCuotas in TASAS_CUOTAS)
    return precio * TASAS_CUOTAS[numeroCuotas];
  return precio;
}

function calcularPrecio(precioBase, descuentoNivel, descuentoCupon, descuentoEspecial, tieneIva, costoEnvio, numeroCuotas) {
  const { precioConDescuento, ...descuentos } = Calcular_Descuento(
    precioBase, descuentoNivel, descuentoCupon, descuentoEspecial
  );
  const { precioConIva, montoIva } = Sacar_PrecioIva(precioConDescuento, tieneIva);
  const subtotal = Calcular_Precio_Envio(precioConIva, costoEnvio);
  const totalFinal = Calcular_Precio_Final_Con_Cuotas(subtotal, numeroCuotas);

  return {
    base: precioBase,
    descuentoNivel: descuentos.descuentoNivel,
    descuentoCupon: descuentos.descuentoCupon,
    descuentoEspecial: descuentos.descuentoEspecial,
    montoIva,
    costoEnvio,
    subtotal,
    totalFinal,
    totalPorCuota: numeroCuotas > 1 ? totalFinal / numeroCuotas : totalFinal,
  };
}


//Utils linea 1179 1210
//Les pone mayúscula a la primera letra.
function Capitalizar_Texto(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// corta el texto
function Truncar_Texto(texto, longitudMaxima) {
  return texto.length > longitudMaxima
    ? `${texto.substring(0, longitudMaxima)}...`
    : texto;
}

// Slug es como algo que sirve para las URLS
function Convertir_A_Slug(texto) {
  return texto
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}

function Numero_Aleatorio(minimo, maximo) {
  return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
}

// No capto lo que hace la verdad pero lo hice con IA, creo que es para clonar objetos pero no se que tipo de objetos
function Clonar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

function Es_Vacio(objeto) {
  return Object.keys(objeto).length === 0;
}

// Vi que se puede hacer con reduce pero hacerlo con for es un clásico.
function Sumar_Array(numeros) {
  let total = 0;
  for (let n of numeros) total += n;
  return total;
}

// reutiliza Sumar_Array arriba
const Promedio_Array = (numeros) =>
  numeros.length === 0 ? 0 : Sumar_Array(numeros) / numeros.length;

// Set elimina duplicados automáticamente
function Elementos_Unicos(array) {
  return [...new Set(array)];
}

//No tengo claro que hace
function Aplanar_Array(array) {
  return array.flat();
}


//Linea 783 a 854
// validaciones del form de registro
// el de rut y son básicos y la verdad no lo validan correctamente.
function validar_nombre(v) { return v && v.length >= 3; }
function validar_email(v) { return v && v.includes("@"); }
function validar_password(v) { return v && v.length >= 8; }
function validar_rut(v) { return v && v.length >= 8; }
function validar_telefono(v) { return v && v.length >= 9; }

function Validar_Formulario(formData) {
  const errores = [];

  if (!validar_nombre(formData.nombre))
    errores.push("Nombre inválido: mínimo 3 caracteres");

  if (!validar_email(formData.email))
    errores.push("Email inválido");

  if (!validar_password(formData.password))
    errores.push("Contraseña: mínimo 8 caracteres");

  if (!validar_rut(formData.rut))
    errores.push("RUT inválido");

  if (!validar_telefono(formData.telefono))
    errores.push("Teléfono inválido");

  if (formData.password !== formData.passwordConfirm)
    errores.push("Las contraseñas no coinciden");

  return errores;
}

// esto simula la DB por ahora, después hay que conectar con el backend real
const Usuarios_Repositorio = {
  existeEmail: (email, db) => db.some((u) => u.email === email),
  guardar: (usuario, db) => db.push(usuario),
};

// TODO: cambiar por bcrypt cuando tengamos el backend
const Clave_Hash = (password) => `hashed_${password}`;

function Crear_Usuario(formData) {
  const ahora = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    nombre: formData.nombre,
    email: formData.email,
    passwordHash: Clave_Hash(formData.password),
    rut: formData.rut,
    telefono: formData.telefono,
    tipo: "cliente",
    puntos: 0,
    activo: true,
    bloqueado: false,
    intentosFallidos: 0,
    // estas listas arrancan vacías, se van llenando después
    historial: [],
    carrito: [],
    wishlist: [],
    direcciones: [],
    metodosPago: [],
    ultimoLogin: null,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
}

const Crear_Sesion = (usuario) => ({
  usuario,
  token: `tkn_${crypto.randomUUID()}`,
  tiempoLogin: new Date().toISOString(),
});

const Notificar_Bienvenida = (usuario) =>
  sendNotif("email", usuario.id, "¡Bienvenido!", { userName: usuario.nombre });

async function Registrar_Usuario(formData, baseDeDatos) {
  const errores = Validar_Formulario(formData);
  if (errores.length > 0)
    return { ok: false, errores };

  if (Usuarios_Repositorio.existeEmail(formData.email, baseDeDatos))
    return { ok: false, errores: ["Email ya registrado"] };

  const usuario = Crear_Usuario(formData);
  Usuarios_Repositorio.guardar(usuario, baseDeDatos);
  Notificar_Bienvenida(usuario);

  return { ok: true, usuario, sesion: Crear_Sesion(usuario), redirigirA: "/dashboard" };
}