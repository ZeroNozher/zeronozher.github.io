const RUTA_JSON = "./json/";
const CLAVE_STORAGE = "bcp:v1";

let productos = [];
let categorias = [];
let locales = [];
let marcas = [];
let observaciones = [];
let tema = null;

async function cargarJSON(nombreArchivo) {
  const respuesta = await fetch(RUTA_JSON + nombreArchivo);
  return await respuesta.json();
}

export async function cargarBaseDeDatos() {

  const guardado = localStorage.getItem(CLAVE_STORAGE);

  if (guardado) {

    const datos = JSON.parse(guardado);

    productos = datos.productos;
    categorias = datos.categorias;
    locales = datos.locales;
    marcas = datos.marcas;
    observaciones = datos.observaciones;
    tema = datos.tema ?? null;

    return;

  }

  [productos, categorias, locales, marcas, observaciones] = await Promise.all([
    cargarJSON("productos.json"),
    cargarJSON("categorias.json"),
    cargarJSON("locales.json"),
    cargarJSON("marcas.json"),
    cargarJSON("observaciones.json")
  ]);

  persistir();

}

function persistir() {

  localStorage.setItem(CLAVE_STORAGE, JSON.stringify({
    productos,
    categorias,
    locales,
    marcas,
    observaciones,
    tema
  }));

}

function normalizarTexto(texto) {

  return texto
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

}

function limpiarNombre(nombre) {
  return nombre.trim().replace(/\s+/g, " ");
}

function renombrarEntidad(coleccion, id, nombre) {

  const entidad = coleccion.find(e => e.id === id);
  if (!entidad) return { ok: false, motivo: "No existe." };

  const nombreLimpio = limpiarNombre(nombre);
  if (nombreLimpio === "") return { ok: false, motivo: "El nombre no puede estar vacío." };

  const clave = normalizarTexto(nombreLimpio);

  const duplicado = coleccion.find(e =>
    e.id !== id &&
    e.activo !== false &&
    normalizarTexto(e.nombre) === clave
  );

  if (duplicado) {
    return { ok: false, motivo: `Ya existe "${duplicado.nombre}".` };
  }

  entidad.nombre = nombreLimpio;
  persistir();

  return { ok: true };

}

function eliminarEntidad(coleccion, id) {

  const entidad = coleccion.find(e => e.id === id);
  if (!entidad) return;

  entidad.activo = false;
  persistir();

}

// ---------- Productos ----------

export function obtenerProductos() {
  return productos;
}

export function actualizarProducto(id, cambios) {

  const producto = productos.find(p => p.id === id);
  if (!producto) return;

  Object.assign(producto, cambios);
  persistir();

}

// ---------- Categorías ----------

export function obtenerCategorias() {
  return categorias;
}

export function obtenerCategoriasActivas() {
  return categorias.filter(c => c.activo !== false);
}

export function agregarCategoria(nombre) {

  const nombreLimpio = limpiarNombre(nombre);
  const clave = normalizarTexto(nombreLimpio);

  const existente = categorias.find(
    c => normalizarTexto(c.nombre) === clave && c.activo !== false
  );

  if (existente) return existente;

  const id = categorias.length
    ? Math.max(...categorias.map(c => c.id)) + 1
    : 1;

  const nuevo = { id, nombre: nombreLimpio, activo: true };
  categorias.push(nuevo);

  persistir();

  return nuevo;

}

export function renombrarCategoria(id, nombre) {
  return renombrarEntidad(categorias, id, nombre);
}

export function eliminarCategoria(id) {
  eliminarEntidad(categorias, id);
}

export function contarProductosPorCategoria(id) {
  return productos.filter(p => p.categoria === id).length;
}

// ---------- Locales ----------

export function obtenerLocales() {
  return locales;
}

export function obtenerLocalesActivas() {
  return locales.filter(l => l.activo !== false);
}

export function agregarLocal(nombre) {

  const nombreLimpio = limpiarNombre(nombre);
  const clave = normalizarTexto(nombreLimpio);

  const existente = locales.find(
    l => normalizarTexto(l.nombre) === clave && l.activo !== false
  );

  if (existente) return existente;

  const id = locales.length
    ? Math.max(...locales.map(l => l.id)) + 1
    : 1;

  const nuevo = { id, nombre: nombreLimpio, activo: true };
  locales.push(nuevo);

  persistir();

  return nuevo;

}

export function renombrarLocal(id, nombre) {
  return renombrarEntidad(locales, id, nombre);
}

export function eliminarLocal(id) {
  eliminarEntidad(locales, id);
}

export function contarObservacionesPorLocal(id) {
  return observaciones.filter(o => o.local === id).length;
}

// ---------- Marcas ----------

export function obtenerMarcas() {
  return marcas;
}

export function obtenerMarcasActivas() {
  return marcas.filter(m => m.activo !== false);
}

export function agregarMarca(nombre) {

  const nombreLimpio = limpiarNombre(nombre);
  const clave = normalizarTexto(nombreLimpio);

  const existente = marcas.find(
    m => normalizarTexto(m.nombre) === clave && m.activo !== false
  );

  if (existente) return existente;

  const id = marcas.length
    ? Math.max(...marcas.map(m => m.id)) + 1
    : 1;

  const nuevo = { id, nombre: nombreLimpio, activo: true };
  marcas.push(nuevo);

  persistir();

  return nuevo;

}

export function renombrarMarca(id, nombre) {
  return renombrarEntidad(marcas, id, nombre);
}

export function eliminarMarca(id) {
  eliminarEntidad(marcas, id);
}

export function contarObservacionesPorMarca(id) {
  return observaciones.filter(o => o.marca === id).length;
}

// ---------- Observaciones ----------

export function obtenerObservaciones() {
  return observaciones;
}

export function agregarObservaciones(nuevasObservaciones) {

  const claves = new Set(
    nuevasObservaciones.map(o => `${o.producto}-${o.fecha}`)
  );

  observaciones = observaciones.filter(o =>
    !claves.has(`${o.producto}-${o.fecha}`)
  );

  observaciones.push(...nuevasObservaciones);
  persistir();

}

export function obtenerTema() {
  return tema;
}

export function guardarTema(clave, colores) {
  tema = { clave, colores };
  persistir();
}