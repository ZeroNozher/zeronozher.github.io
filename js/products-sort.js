import { convertirFecha } from "./products-query.js";
import { obtenerModoActualizacion, obtenerCambioPendiente } from "./update.js";

function porFechaDesc(a, b) {
  return convertirFecha(b.ultima.fecha) - convertirFecha(a.ultima.fecha); // más reciente primero
}

function porFechaAsc(a, b) {
  return convertirFecha(a.ultima.fecha) - convertirFecha(b.ultima.fecha); // más antiguo primero
}

function porPrecioAsc(a, b) {
  return a.ultima.precio - b.ultima.precio; // más barato primero
}

function porPrecioDesc(a, b) {
  return b.ultima.precio - a.ultima.precio; // más caro primero
}

function encadenar(principal, desempate) {
  return (a, b) => {
    const resultado = principal(a, b);
    return resultado !== 0 ? resultado : desempate(a, b);
  };
}

const comparadores = {

  "fecha-asc": encadenar(porFechaDesc, porPrecioAsc),
  "fecha-desc": encadenar(porFechaAsc, porPrecioAsc),

  "precio-asc": encadenar(porPrecioAsc, porFechaDesc),
  "precio-desc": encadenar(porPrecioDesc, porFechaDesc),

  "nombre-asc": (a, b) =>
    a.producto.nombre.localeCompare(b.producto.nombre),

  "nombre-desc": (a, b) =>
    b.producto.nombre.localeCompare(a.producto.nombre)

};

export function ordenarResultados(resultados, criterio) {

  const comparadorBase = comparadores[criterio];

  if (!obtenerModoActualizacion()) {
    resultados.sort(comparadorBase);
    return;
  }

  resultados.sort((a, b) => {

    const aSeleccionado = Boolean(obtenerCambioPendiente(a.producto.id));
    const bSeleccionado = Boolean(obtenerCambioPendiente(b.producto.id));

    if (aSeleccionado !== bSeleccionado) {
      return aSeleccionado ? -1 : 1;
    }

    return comparadorBase(a, b);

  });

}