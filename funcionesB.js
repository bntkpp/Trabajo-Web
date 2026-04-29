

//Línea 442 a 497
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
function Sacar_PrecioIva(precio, tieneIva) {
  let montoIva = tieneIva ? precio * 0.19 : 0;
  return { precioConIva: precio + montoIva, montoIva};
}
function Calcular_Precio_Envio(precio, envio) {
  if(envio > 0) {
    return precio + envio;
  }
  return precio;
}

const Calcular_Precio_Final_Con_Cuotas = (precio, numeroCuotas) => {
  let precioFinal = precio;
  const intereses = { 2: 1.02, 3: 1.04, 6: 1.08, 12: 1.15, 24: 1.28, 36: 1.45 };
  if (numeroCuotas > 1) {
    if (numeroCuotas in intereses) {
      precioFinal = precio * intereses[numeroCuotas];
    }
  }
  return precioFinal;
}
function calcularPrecio(precioBase, descuentoNivel, descuentoCupon, descuentoEspecial, tieneIva, costoEnvio, numeroCuotas) {
  
  const { precioConDescuento, ...descuentos } = Calcular_Descuento(
    precioBase, descuentoNivel, descuentoCupon, descuentoEspecial
  );

  const { precioConIva, montoIva } = Sacar_PrecioIva(precioConDescuento, tieneIva);

  const subtotal = Calcular_Precio_Envio(precioConIva, costoEnvio);

  const totalFinal = Calcular_Precio_Final_Con_Cuotas(subtotal, numeroCuotas);

  return {
    base:          precioBase,
    descuentoNivel:   descuentos.descuentoNivel,
    descuentoCupon:   descuentos.descuentoCupon,
    descuentoEspecial: descuentos.descuentoEspecial,
    montoIva,
    costoEnvio,
    subtotal,
    totalFinal,
    totalPorCuota: numeroCuotas > 1 ? totalFinal / numeroCuotas : totalFinal,
  };
}

//Utils linea 1179 1210

// Antes parte de utils
function Capitalizar_Texto(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// Antes parte de utils
function Truncar_Texto(texto, longitudMaxima) {
  return texto.length > longitudMaxima
    ? `${texto.substring(0, longitudMaxima)}...`
    : texto;
}

// Antes parte de utils para hacer texto que sea amigable con URLS
function Convertir_A_Slug(texto) {
  return texto
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
}
// Antes parte de utils
function Numero_Aleatorio(minimo, maximo) {
  return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
}

// Antes parte de utils llamado deepclone la verdad no se q hace
function Clonar(objeto) {
  return JSON.parse(JSON.stringify(objeto));
}

// Antes parte de utils para cachar si hay un objeto vacío
function Es_Vacio(objeto) {
  return Object.keys(objeto).length === 0;
}

// Antes parte de utils 
function Sumar_Array(numeros) {
  return numeros.reduce((acumulado, numero) => acumulado + numero, 0);
}

// Antes parte de utils
function Promedio_Array(numeros) {
  if (numeros.length === 0) return 0;
  return Sumar_Array(numeros) / numeros.length; // reutiliza sumarArray
}

// Antes parte de utils
function Elementos_Unicos(array) {
  return [...new Set(array)];
}

// Antes parte de utils
function Aplanar_Array(array) {
  return array.flat();
}

//Linea a 783 a 854

const Reglas_Registro = [
  { campo: "nombre",   valido: (v) => v?.length >= 3,   error: "Nombre inválido: mínimo 3 caracteres" },
  { campo: "email",    valido: (v) => v?.includes("@"), error: "Email inválido" },
  { campo: "password", valido: (v) => v?.length >= 8,   error: "Contraseña: mínimo 8 caracteres" },
  { campo: "rut",      valido: (v) => v?.length >= 8,   error: "RUT inválido" },
  { campo: "telefono", valido: (v) => v?.length >= 9,   error: "Teléfono inválido" },
];

function Validar_Formulario(formData) {
  const errores = reglasRegistro
    .filter(({ campo, valido }) => !valido(formData[campo]))
    .map(({ error }) => error);

  if (formData.password !== formData.passwordConfirm)
    errores.push("Las contraseñas no coinciden");

  return errores;
}
const Usuarios_Repositorio = {
  existeEmail: (email, db) => db.some((u) => u.email === email),
  guardar:     (usuario, db) => db.push(usuario),
};

const Clave_Hash = (password) => `hashed_${password}`;

function Crear_Usuario(formData) {
  const ahora = new Date().toISOString();
  return {
    id:               crypto.randomUUID(),
    nombre:           formData.nombre,
    email:            formData.email,
    passwordHash:     Clave_Hash(formData.password),
    rut:              formData.rut,
    telefono:         formData.telefono,
    tipo:             "cliente",
    puntos:           0,
    activo:           true,
    bloqueado:        false,
    intentosFallidos: 0,
    historial: [], carrito: [], wishlist: [], direcciones: [], metodosPago: [],
    ultimoLogin:   null,
    creadoEn:      ahora,
    actualizadoEn: ahora,
  };
}

const Crear_Sesion = (usuario) => ({
  usuario,
  token:       `tkn_${crypto.randomUUID()}`,
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

