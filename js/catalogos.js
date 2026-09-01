import {
  obtenerMarcasActivas,
  obtenerLocalesActivas,
  obtenerCategoriasActivas,
  agregarMarca,
  agregarLocal,
  agregarCategoria,
  renombrarMarca,
  renombrarLocal,
  renombrarCategoria,
  eliminarMarca,
  eliminarLocal,
  eliminarCategoria,
  contarObservacionesPorMarca,
  contarObservacionesPorLocal,
  contarProductosPorCategoria
} from "./database.js";
import { mostrarProductos } from "./products.js";
import { actualizarOpcionesFiltros } from "./filters.js";

const configuraciones = [

  {
    contenedor: document.querySelector("#marca-lista"),
    inputNuevo: document.querySelector("#marca-nuevo-input"),
    btnNuevo: document.querySelector("#marca-nuevo-btn"),
    obtenerActivos: obtenerMarcasActivas,
    agregar: agregarMarca,
    renombrar: renombrarMarca,
    eliminar: eliminarMarca,
    contarUso: contarObservacionesPorMarca,
    etiquetaUso: "observaciones"
  },
  {
    contenedor: document.querySelector("#local-lista"),
    inputNuevo: document.querySelector("#local-nuevo-input"),
    btnNuevo: document.querySelector("#local-nuevo-btn"),
    obtenerActivos: obtenerLocalesActivas,
    agregar: agregarLocal,
    renombrar: renombrarLocal,
    eliminar: eliminarLocal,
    contarUso: contarObservacionesPorLocal,
    etiquetaUso: "observaciones"
  },
  {
    contenedor: document.querySelector("#categoria-lista"),
    inputNuevo: document.querySelector("#categoria-nuevo-input"),
    btnNuevo: document.querySelector("#categoria-nuevo-btn"),
    obtenerActivos: obtenerCategoriasActivas,
    agregar: agregarCategoria,
    renombrar: renombrarCategoria,
    eliminar: eliminarCategoria,
    contarUso: contarProductosPorCategoria,
    etiquetaUso: "productos"
  }

];

export function inicializarCatalogos() {

  for (const config of configuraciones) {

    renderizarLista(config);

    config.btnNuevo.addEventListener("click", () => {

      const nombre = config.inputNuevo.value.trim();
      if (nombre === "") return;

      config.agregar(nombre);
      config.inputNuevo.value = "";

      renderizarLista(config);
      refrescarConsumidores();

    });

  }

}

function renderizarLista(config) {

  config.contenedor.innerHTML = "";

  const activos = config.obtenerActivos();

  if (activos.length === 0) {
    config.contenedor.innerHTML = `<p class="catalog-empty">No hay elementos.</p>`;
    return;
  }

  for (const entidad of activos) {
    config.contenedor.appendChild(crearFilaCatalogo(config, entidad));
  }

}

function crearFilaCatalogo(config, entidad) {

  const fila = document.createElement("div");
  fila.className = "catalog-row";

  const texto = document.createElement("span");
  texto.className = "catalog-name";
  texto.textContent = entidad.nombre;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "catalog-edit-input hidden";
  input.value = entidad.nombre;
  input.maxLength = 10;

  const btnEditar = crearBotonIcono("✏️", "Renombrar");
  const btnAceptar = crearBotonIcono("✓", "Confirmar");
  const btnCancelar = crearBotonIcono("✗", "Cancelar");
  const btnEliminar = crearBotonIcono("🗑️", "Eliminar");

  btnAceptar.classList.add("hidden");
  btnCancelar.classList.add("hidden");

  const mensaje = document.createElement("p");
  mensaje.className = "catalog-error hidden";

  btnEditar.addEventListener("click", () => {
    alternarModoEdicion(true);
    input.focus();
    input.select();
  });

  btnCancelar.addEventListener("click", () => {
    input.value = entidad.nombre;
    mensaje.classList.add("hidden");
    alternarModoEdicion(false);
  });

  btnAceptar.addEventListener("click", () => {

    const resultado = config.renombrar(entidad.id, input.value);

    if (!resultado.ok) {
      mensaje.textContent = resultado.motivo;
      mensaje.classList.remove("hidden");
      return;
    }

    renderizarLista(config);
    refrescarConsumidores();

  });

  btnEliminar.addEventListener("click", () => {

    const cantidad = config.contarUso(entidad.id);

    const aviso = cantidad > 0
      ? `"${entidad.nombre}" está en uso por ${cantidad} ${config.etiquetaUso}. Se conservarán en el historial, pero dejará de estar disponible para nuevas cargas. ¿Eliminar de todas formas?`
      : `¿Eliminar "${entidad.nombre}"?`;

    if (!confirm(aviso)) return;

    config.eliminar(entidad.id);

    renderizarLista(config);
    refrescarConsumidores();

  });

  function alternarModoEdicion(activo) {
    texto.classList.toggle("hidden", activo);
    input.classList.toggle("hidden", !activo);
    btnEditar.classList.toggle("hidden", activo);
    btnEliminar.classList.toggle("hidden", activo);
    btnAceptar.classList.toggle("hidden", !activo);
    btnCancelar.classList.toggle("hidden", !activo);
  }

  fila.append(texto, input, btnEditar, btnAceptar, btnCancelar, btnEliminar, mensaje);

  return fila;

}

function crearBotonIcono(simbolo, etiqueta) {
  const boton = document.createElement("button");
  boton.className = "icon-button";
  boton.textContent = simbolo;
  boton.setAttribute("aria-label", etiqueta);
  return boton;
}

function refrescarConsumidores() {
  actualizarOpcionesFiltros();
  mostrarProductos();
}