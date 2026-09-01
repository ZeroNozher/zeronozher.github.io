import {
  obtenerLocales,
  obtenerLocalesActivas,
  obtenerCategorias,
  obtenerCategoriasActivas,
  obtenerMarcas,
  obtenerMarcasActivas,
  agregarLocal,
  agregarCategoria,
  agregarMarca
} from "./database.js";
import {
  obtenerModoActualizacion,
  obtenerCambioPendiente,
  obtenerCamposEditados,
  estaEditando
} from "./update.js";
import {
  convertirFecha,
  opcionesConActual,
  obtenerUltimasPorLocal
} from "./products-query.js";

export function crearTarjeta(resultado) {

  return obtenerModoActualizacion()
    ? crearTarjetaEdicion(resultado)
    : crearTarjetaNormal(resultado);

}

function crearTarjetaEdicion({
  producto,
  categoria,
  local,
  ultima
}) {

  return `
    <article class="product-card">

      ${crearCheckbox(producto)}
      ${crearImagen(producto)}
      ${crearEncabezado(producto)}
      ${crearPrecio(producto, ultima)}
      ${crearDescuento(producto, ultima)}
      ${crearMarca(producto, ultima)}
      ${crearLocal(producto, local)}
      ${crearMedida(producto, ultima)}
      ${crearCategoria(producto, categoria)}
      ${crearFecha(producto, ultima)}

    </article>
  `;

}

function crearTarjetaNormal({
  producto,
  categoria,
  local,
  ultima
}) {

  return `
    <article class="product-card">

      ${crearCheckbox(producto)}
      ${crearImagen(producto)}

      <div class="price-block">
        <span class="price-value">$${ultima.precio}</span>
        ${crearAccionesPrecio(producto, local, ultima)}
      </div>

      <p class="card-legend">
        <strong>${producto.nombre}</strong>
        ${crearLeyendaExtra(ultima)}
      </p>

      <div class="card-footer">

        <div class="card-chips">
          <span class="chip">${local.nombre}</span>
          <span class="chip">${categoria.nombre}</span>
        </div>

        <span class="card-freshness" title="${ultima.fecha}">
          ${calcularFrescura(ultima.fecha)}
        </span>

      </div>

    </article>
  `;

}

function crearLeyendaExtra(ultima) {

  const marca = ultima.marca
    ? obtenerMarcas().find(m => m.id === ultima.marca)?.nombre
    : null;

  const partes = [];

  if (marca && marca.trim() !== "") partes.push(marca);
  if (ultima.medida && ultima.medida.trim() !== "") partes.push(ultima.medida);

  return partes.length ? `${partes.join(" - ")}` : "";;

}

function crearAccionesPrecio(producto, localActual, ultima) {

  const idMejor = `popover-mejor-${producto.id}`;
  const idDetalle = `popover-detalle-${producto.id}`;

  const comparables = obtenerUltimasPorLocal(producto.id)
    .map(obs => ({
      local: obtenerLocales().find(l => l.id === obs.local),
      neto: obs.precio - obs.descuento
    }))
    .sort((a, b) => a.neto - b.neto);

  const mejor = comparables[0];
  const esMejor = mejor.local.id === localActual.id;

  const neto = ultima.precio - ultima.descuento;

  return `
    <div class="price-actions">

      <button
        class="icon-button popover-trigger"
        data-target="${idMejor}"
        aria-label="Mejor precio conocido"
      >
        ${esMejor ? "🥇" : "🏷️"}
      </button>

      <div id="${idMejor}" class="price-popover hidden">
        <strong>Últimos precios por local</strong>
        ${comparables
          .map(o => `<div class="best-price-row">${o.local.nombre}: $${o.neto}</div>`)
          .join("")}
      </div>

      <button
        class="icon-button popover-trigger"
        data-target="${idDetalle}"
        aria-label="Detalle del precio"
      >
        🔍
      </button>

      <div id="${idDetalle}" class="price-popover hidden">
        Precio: $${ultima.precio}<br>
        Descuento: $${ultima.descuento}<br>
        Con descuento: $${neto}
      </div>

      <button
        class="icon-button history-button"
        data-producto="${producto.id}"
        aria-label="Ver historial de precios"
      >
        📈
      </button>

    </div>
  `;

}

function crearImagen(producto) {
  if (!producto.imagen) {
    return `<div class="product-image"></div>`;
  }

  return `
    <div class="product-image">
      <img
        src="${producto.imagen}"
        alt="${producto.nombre}"
      >
    </div>
  `;

}

function obtenerIndicador(producto, campo) {

  const cambio = obtenerCambioPendiente(producto.id);

  if (!cambio) return "";

  if (campo === "fecha") return "!";

  return obtenerCamposEditados(producto.id).has(campo) ? "!" : "✓";

}

function crearBotonesEdicion(producto, campo) {

  if (campo === "fecha")
    return "";

  if (!obtenerCambioPendiente(producto.id))
    return "";

  if (!estaEditando(producto, campo)) {

    return `
      <button
        class="edit-button"
        data-producto="${producto.id}"
        data-campo="${campo}"
      >
        ✏️
      </button>
    `;

  }

  return `
    <button
      class="accept-button"
      data-producto="${producto.id}"
      data-campo="${campo}"
      disabled
    >
      ✓
    </button>

    <button
      class="cancel-button"
      data-producto="${producto.id}"
      data-campo="${campo}"
    >
      ✗
    </button>
  `;

}

function crearCampo({
  producto,
  campo,
  nombre,
  valorMostrado,
  indicador,
  tipo,
  valorActual,
  opciones,
  moneda,
  sinAplicar,
  clase
}) {

  const contenido = estaEditando(producto, campo)
    ? crearInputEdicion(producto, campo, tipo, valorActual, opciones, moneda, sinAplicar)
    : `<span class="field-text">${valorMostrado}</span>`;

  return `
    <p class="field-row ${clase ?? ""}">

      <span class="field-indicator">${indicador}</span>
      <strong>${nombre}:</strong>
      <span class="field-value">${contenido}</span>
      <span class="field-actions">${crearBotonesEdicion(producto, campo)}</span>

    </p>
  `;

}

function crearInputEdicion(producto, campo, tipo, valorActual, opciones, moneda, sinAplicar) {

  if (tipo === "numero") {

    const input = `
      <input
        type="number"
        min="0"
        step="10"
        class="edit-input"
        data-producto="${producto.id}"
        data-campo="${campo}"
        data-original="${valorActual}"
        value="${valorActual}"
      >
    `;

    return moneda
      ? `<span class="edit-moneda">$${input}</span>`
      : input;

  }

  if (tipo === "texto") {

    return `
      <span class="edit-texto">
        <input
          type="text"
          class="edit-input"
          data-producto="${producto.id}"
          data-campo="${campo}"
          data-original="${valorActual}"
          value="${valorActual}"
          placeholder="No aplica"
          maxlength="10"
        >
      </span>
    `;

  }

  return `
    <span class="edit-seleccion">

      <select
        class="edit-input edit-select"
        data-producto="${producto.id}"
        data-campo="${campo}"
        data-original="${valorActual}"
      >
        ${sinAplicar ? `<option value="" ${valorActual === "" ? "selected" : ""}>No aplica</option>` : ""}

        ${opciones.map(o => `
          <option value="${o.id}" ${o.id === valorActual ? "selected" : ""}>
            ${o.nombre}
          </option>
        `).join("")}

        <option value="otro">Otro...</option>
      </select>

      <input
        type="text"
        class="edit-input edit-nuevo hidden"
        data-producto="${producto.id}"
        data-campo="${campo}"
        placeholder="Nuevo valor"
        maxlength="10"
      >

    </span>
  `;

}

function crearCheckbox(producto) {

  if (!obtenerModoActualizacion())
    return "";

  return `
    <input
      type="checkbox"
      class="update-checkbox"
      data-producto="${producto.id}"
      ${obtenerCambioPendiente(producto.id)
      ? "checked"
      : ""
    }
    >
  `;
}

function crearEncabezado(producto) {

  return `
    <div class="card-header">

      <h2>${producto.nombre}</h2>

      <button
        class="icon-button history-button"
        data-producto="${producto.id}"
        aria-label="Ver historial de precios"
      >
        📈
      </button>

    </div>
  `;

}

function crearPrecio(producto, ultima) {

  const cambio = obtenerCambioPendiente(producto.id);

  return crearCampo({
    producto,
    campo: "precio",
    nombre: "Precio",
    valorMostrado: `$${ultima.precio}`,
    indicador: obtenerIndicador(producto, "precio"),
    tipo: "numero",
    valorActual: cambio ? cambio.precio : ultima.precio,
    moneda: true,
    clase: "price-row"
  });

}

function crearDescuento(producto, ultima) {

  const cambio = obtenerCambioPendiente(producto.id);

  return crearCampo({
    producto,
    campo: "descuento",
    nombre: "Desc.",
    valorMostrado: ultima.descuento === 0 ? "No aplica" : `$${ultima.descuento}`,
    indicador: obtenerIndicador(producto, "descuento"),
    tipo: "numero",
    valorActual: cambio ? cambio.descuento : ultima.descuento,
    moneda: true
  });

}

function crearLocal(producto, local) {

  const cambio = obtenerCambioPendiente(producto.id);
  const localId = cambio ? cambio.local : local.id;
  const nombreMostrado = obtenerLocales().find(l => l.id === localId)?.nombre ?? local.nombre;

  return crearCampo({
    producto,
    campo: "local",
    nombre: "Local",
    valorMostrado: nombreMostrado,
    indicador: obtenerIndicador(producto, "local"),
    tipo: "seleccion",
    valorActual: localId,
    opciones: opcionesConActual(obtenerLocalesActivas(), obtenerLocales(), localId)
  });

}

function crearMarca(producto, ultima) {

  const cambio = obtenerCambioPendiente(producto.id);
  const marcaId = cambio ? cambio.marca : ultima.marca;
  const nombreMostrado = marcaId
    ? (obtenerMarcas().find(m => m.id === marcaId)?.nombre ?? "No aplica")
    : "No aplica";

  return crearCampo({
    producto,
    campo: "marca",
    nombre: "Marca",
    valorMostrado: nombreMostrado,
    indicador: obtenerIndicador(producto, "marca"),
    tipo: "seleccion",
    valorActual: marcaId ?? "",
    opciones: opcionesConActual(obtenerMarcasActivas(), obtenerMarcas(), marcaId ?? ""),
    sinAplicar: true
  });

}

function crearMedida(producto, ultima) {

  const cambio = obtenerCambioPendiente(producto.id);
  const valor = cambio ? cambio.medida : ultima.medida;

  return crearCampo({
    producto,
    campo: "medida",
    nombre: "Medida",
    valorMostrado: valor && valor.trim() !== "" ? valor : "No aplica",
    indicador: obtenerIndicador(producto, "medida"),
    tipo: "texto",
    valorActual: valor ?? ""
  });

}

function crearCategoria(producto, categoria) {

  const cambio = obtenerCambioPendiente(producto.id);
  const categoriaId = cambio ? cambio.categoria : categoria.id;
  const nombreMostrado = obtenerCategorias().find(c => c.id === categoriaId)?.nombre ?? categoria.nombre;

  return crearCampo({
    producto,
    campo: "categoria",
    nombre: "Categoría",
    valorMostrado: nombreMostrado,
    indicador: obtenerIndicador(producto, "categoria"),
    tipo: "seleccion",
    valorActual: categoriaId,
    opciones: opcionesConActual(obtenerCategoriasActivas(), obtenerCategorias(), categoriaId)
  });

}

function calcularFrescura(fecha) {

  const dias = Math.floor(
    (new Date() - convertirFecha(fecha)) / (1000 * 60 * 60 * 24)
  );

  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 7) return `Hace ${dias} días`;

  if (dias < 30) {
    const semanas = Math.floor(dias / 7);
    return `Hace ${semanas} semana${semanas > 1 ? "s" : ""}`;
  }

  const meses = Math.floor(dias / 30);
  return `Hace ${meses} mes${meses > 1 ? "es" : ""}`;

}

function crearFecha(producto, ultima) {

  const enEdicion = obtenerCambioPendiente(producto.id);

  const valorMostrado = enEdicion
    ? ultima.fecha
    : calcularFrescura(ultima.fecha);

  return `
    <p class="field-row">

      <span class="field-indicator">
        ${obtenerIndicador(producto, "fecha")}
      </span>

      <strong>Fecha:</strong>

      <span class="field-value" title="${ultima.fecha}">
        ${valorMostrado}
      </span>

    </p>
  `;

}