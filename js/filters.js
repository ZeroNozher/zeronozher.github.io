import {
  obtenerCategoriasActivas,
  obtenerLocalesActivas
} from "./database.js";
import { mostrarProductos } from "./products.js";

const filtrosActivos = [];

const summaryFilter = document.querySelector(".summary-filter");
const summaryTitle = summaryFilter.querySelector("summary");
const summaryMenu = summaryFilter.querySelector(".summary-menu");
const activeFilters = document.querySelector(".active-filters");

export function inicializarFiltros() {

  crearFiltros();

  const sortSelector = document.querySelector("#sort-selector");

  summaryFilter.addEventListener("click", (evento) => {

    evento.preventDefault();

    const seVaAAbrir = summaryMenu.classList.contains("hidden");

    cerrarPaneles();

    if (seVaAAbrir) {
      summaryMenu.classList.remove("hidden");
      summaryFilter.open = true;
    }

  });

  const detalles = document.querySelectorAll(".filter:not(.summary-filter)");

  for (const detalle of detalles) {

    detalle.addEventListener("toggle", () => {

      if (!detalle.open) return;

      cerrarPaneles(detalle);

    });

  }

  document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape") {
      cerrarPaneles();
    }

  });

  document.addEventListener("click", (evento) => {

    if (!evento.target.closest(".filter-bar")) {
      cerrarPaneles();
    }

  });

  sortSelector.addEventListener("mousedown", () => {
    cerrarPaneles();
  });

  renderizarFiltros();

}

function cerrarPaneles(excepto = null) {

  summaryMenu.classList.add("hidden");

  document.querySelectorAll(".filter[open]").forEach(detalle => {

    if (detalle !== excepto) {
      detalle.open = false;
    }

  });

}

function crearFiltros() {

  crearFiltro(
    "#price-filter .filter-menu",
    "Precio",
    ["Menor a $3000", "Entre $3000 y $10000", "Mayor a $10000"]
  );

  crearFiltro(
    "#category-filter .filter-menu",
    "Categoría",
    obtenerCategoriasActivas().map(c => c.nombre)
  );

  crearFiltro(
    "#location-filter .filter-menu",
    "Local",
    obtenerLocalesActivas().map(l => l.nombre)
  );

}

export function actualizarOpcionesFiltros() {
  crearFiltros();
}

function crearFiltro(selector, atributo, valores, tipo = "checkbox") {

  const menu = document.querySelector(selector);

  menu.innerHTML = "";

  for (const valor of valores) {

    const label = document.createElement("label");

    const checkbox = document.createElement("input");

    checkbox.type = tipo;

    if (tipo === "radio") {
      checkbox.name = atributo;
    }

    checkbox.addEventListener("change", () => {

      if (checkbox.checked) {
        agregarFiltro(atributo, valor);
      } else {
        eliminarFiltro(atributo, valor);
      }

    });

    label.appendChild(checkbox);
    label.append(" " + valor);

    menu.appendChild(label);

  }

}

function agregarFiltro(atributo, valor) {

  if (filtrosActivos.some(f =>
    f.atributo === atributo &&
    f.valor === valor
  )) return;

  filtrosActivos.push({
    atributo,
    valor
  });

  renderizarFiltros();
  mostrarProductos();

}

function eliminarFiltro(atributo, valor) {

  const indice = filtrosActivos.findIndex(f =>
    f.atributo === atributo &&
    f.valor === valor
  );

  if (indice === -1) return;

  filtrosActivos.splice(indice, 1);

  renderizarFiltros();
  mostrarProductos();

}

function renderizarFiltros() {

  activeFilters.innerHTML = "";
  summaryMenu.innerHTML = "";

  if (filtrosActivos.length === 0) {

    summaryFilter.classList.add("hidden");
    summaryMenu.classList.add("hidden");

    return;

  }

  if (filtrosActivos.length === 1) {

    summaryFilter.classList.add("hidden");
    summaryMenu.classList.add("hidden");

    activeFilters.appendChild(
      crearBotonFiltro(filtrosActivos[0])
    );

    return;

  }

  summaryFilter.classList.remove("hidden");
  summaryTitle.textContent = `Filtros (${filtrosActivos.length})`;

  summaryMenu.classList.add("hidden");

  for (const filtro of filtrosActivos) {

    summaryMenu.appendChild(
      crearBotonDestructivo(filtro)
    );

  }

}

function crearBotonFiltro(filtro) {

  const boton = document.createElement("button");

  boton.className = "active-filter";
  boton.textContent = `${filtro.atributo}: ${filtro.valor} ✕`;

  boton.addEventListener("click", () => {

    desactivarFiltro(filtro);

  });

  return boton;

}

function crearBotonDestructivo(filtro) {

  const boton = document.createElement("button");

  boton.className = "destructive-filter";
  boton.textContent = `${filtro.atributo}: ${filtro.valor} ✕`;

  boton.addEventListener("click", () => {

    desactivarFiltro(filtro);

  });

  return boton;

}

function desactivarFiltro(filtro) {

  eliminarFiltro(filtro.atributo, filtro.valor);

  const checkboxes = document.querySelectorAll(".filter-menu input");

  for (const checkbox of checkboxes) {

    const atributo = checkbox
      .closest(".filter")
      .querySelector("summary")
      .textContent.trim();

    const valor = checkbox.parentElement.textContent.trim();

    if (
      atributo === filtro.atributo &&
      valor === filtro.valor
    ) {

      checkbox.checked = false;
      break;

    }

  }

}

export function obtenerFiltrosActivos() {
  return filtrosActivos;
}