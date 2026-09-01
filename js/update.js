import {
  obtenerObservaciones,
  agregarObservaciones,
  actualizarProducto
} from "./database.js";
import { mostrarProductos } from "./products.js";

let modoActualizacion = false;
const cambiosPendientes = [];
const camposEditados = {};
const btnAbrir = document.querySelector("#btn-open-update");
const btnConfirmar = document.querySelector("#btn-confirm-update");
const btnCancelar = document.querySelector("#btn-cancel-update");

function actualizarBotones() {

  btnAbrir.classList.toggle(
    "hidden",
    modoActualizacion
  );

  btnConfirmar.classList.toggle(
    "hidden",
    !modoActualizacion
  );

  btnCancelar.classList.toggle(
    "hidden",
    !modoActualizacion
  );

  btnConfirmar.disabled =
    cambiosPendientes.length === 0;

}

export function obtenerModoActualizacion() {
  return modoActualizacion;
}

export function activarModoActualizacion() {
  modoActualizacion = true;
  actualizarBotones();
}

export function cancelarModoActualizacion() {
  modoActualizacion = false;
  cambiosPendientes.length = 0;
  for (const clave in camposEditados) {
    delete camposEditados[clave];
  }
  camposEnEdicion.clear();
  actualizarBotones();
}

export function obtenerCambiosPendientes() {
  return cambiosPendientes;
}

export function obtenerCambioPendiente(idProducto) {

  return cambiosPendientes.find(
    cambio => cambio.producto === idProducto
  );

}

export function alternarProducto(producto) {

  const indice = cambiosPendientes.findIndex(
    cambio => cambio.producto === producto.id
  );

  if (indice !== -1) {

    cambiosPendientes.splice(indice, 1);
    delete camposEditados[producto.id];
    limpiarEdicionesProducto(producto.id);
    actualizarBotones();
    return;

  }

  const historial = obtenerObservaciones()
    .filter(o => o.producto === producto.id);

  const ultima = historial.reduce((a, b) =>
    new Date(a.fecha.split("/").reverse().join("-")) >
      new Date(b.fecha.split("/").reverse().join("-"))
      ? a
      : b
  );

  const hoy = new Date();

  cambiosPendientes.push({

    producto: producto.id,

    precio: ultima.precio,
    descuento: ultima.descuento,
    local: ultima.local,
    marca: ultima.marca ?? null,
    medida: ultima.medida ?? null,
    categoria: producto.categoria,

    fecha: hoy.toLocaleDateString("es-AR")

  });

  camposEditados[producto.id] = new Set();

  actualizarBotones();

}

btnAbrir.addEventListener("click", () => {

  activarModoActualizacion();

  mostrarProductos();

});

btnCancelar.addEventListener("click", () => {

  cancelarModoActualizacion();

  mostrarProductos();

});

btnConfirmar.addEventListener("click", () => {

  const observaciones = obtenerObservaciones();

  let ultimoId = Math.max(
    ...observaciones.map(o => o.id)
  );

  const nuevasObservaciones = cambiosPendientes.map(cambio => ({

    id: ++ultimoId,
    producto: cambio.producto,
    precio: cambio.precio,
    descuento: cambio.descuento,
    local: cambio.local,
    marca: cambio.marca,
    medida: cambio.medida,
    fecha: cambio.fecha

  }));

  agregarObservaciones(nuevasObservaciones);

  for (const cambio of cambiosPendientes) {

    actualizarProducto(cambio.producto, {
      categoria: cambio.categoria
    });

  }

  cancelarModoActualizacion();

  mostrarProductos();

});

const camposEnEdicion = new Set();

function limpiarEdicionesProducto(idProducto) {

  for (const clave of camposEnEdicion) {

    if (clave.startsWith(`${idProducto}-`)) {
      camposEnEdicion.delete(clave);
    }

  }

}

export function editarCampo(producto, campo) {

  camposEnEdicion.clear();

  camposEnEdicion.add(
    `${producto.id}-${campo}`
  );

}

export function cancelarEdicion(producto, campo) {

  camposEnEdicion.delete(
    `${producto.id}-${campo}`
  );

}

export function estaEditando(producto, campo) {

  return camposEnEdicion.has(
    `${producto.id}-${campo}`
  );

}

export function confirmarEdicion(producto, campo, valor) {

  const cambio = obtenerCambioPendiente(producto.id);

  if (!cambio) return;

  cambio[campo] = valor;

  if (!camposEditados[producto.id]) {
    camposEditados[producto.id] = new Set();
  }

  camposEditados[producto.id].add(campo);

  cancelarEdicion(producto, campo);

}

export function obtenerCamposEditados(idProducto) {
  return camposEditados[idProducto] ?? new Set();
}