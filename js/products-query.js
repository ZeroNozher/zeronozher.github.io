import { obtenerObservaciones } from "./database.js";
import { obtenerFiltrosActivos } from "./filters.js";

export function convertirFecha(fecha) {

  const [dia, mes, año] = fecha.split("/");

  return new Date(`${año}-${mes}-${dia}`);

}

export function obtenerUltimaObservacion(producto) {

  const historial = obtenerObservaciones().filter(
    o => o.producto === producto.id
  );

  if (historial.length === 0)
    return null;

  return historial.reduce((a, b) =>
    convertirFecha(a.fecha) > convertirFecha(b.fecha)
      ? a
      : b
  );

}

export function obtenerUltimasPorLocal(idProducto) {

  const observaciones = obtenerObservaciones()
    .filter(o => o.producto === idProducto);

  const porLocal = {};

  for (const obs of observaciones) {

    const actual = porLocal[obs.local];

    if (!actual || convertirFecha(obs.fecha) > convertirFecha(actual.fecha)) {
      porLocal[obs.local] = obs;
    }

  }

  return Object.values(porLocal);

}

export function coincideBusqueda(producto, categoria, local, texto) {

  const textoNormalizado = texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "")
    .toLowerCase();

  if (textoNormalizado === "") return true;

  return [
    producto.nombre,
    categoria.nombre,
    local.nombre
  ].some(valor =>
    valor
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, "")
      .toLowerCase()
      .includes(textoNormalizado)
  );

}

function cumpleFiltroPrecio(precio, valor) {

  switch (valor) {

    case "Menor a $3000":
      return precio < 3000;

    case "Entre $3000 y $10000":
      return precio >= 3000 &&
        precio <= 10000;

    case "Mayor a $10000":
      return precio > 10000;

  }

}

export function cumpleFiltros({ precio, categoria, local }) {

  const filtros = obtenerFiltrosActivos();

  const grupos = {};

  for (const filtro of filtros) {

    if (!grupos[filtro.atributo]) {
      grupos[filtro.atributo] = [];
    }

    grupos[filtro.atributo].push(filtro.valor);

  }

  return Object.entries(grupos).every(
    ([atributo, valores]) => {

      switch (atributo) {

        case "Precio":
          return valores.some(valor =>
            cumpleFiltroPrecio(precio, valor)
          );

        case "Categoría":
          return valores.some(valor =>
            categoria === valor
          );

        case "Local":
          return valores.some(valor =>
            local === valor
          );

        default:
          return true;

      }

    }
  );

}

export function opcionesConActual(activos, todos, actualId) {

  if (actualId == null || activos.some(o => o.id === actualId)) {
    return activos;
  }

  const actual = todos.find(o => o.id === actualId);

  return actual
    ? [...activos, { id: actual.id, nombre: `${actual.nombre} (eliminado)` }]
    : activos;

}