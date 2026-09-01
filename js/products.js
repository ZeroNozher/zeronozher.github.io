import {
  obtenerProductos,
  obtenerLocales,
  obtenerCategorias,
  agregarLocal,
  agregarCategoria,
  agregarMarca
} from "./database.js";
import {
  obtenerModoActualizacion,
  obtenerCambioPendiente,
  alternarProducto,
  editarCampo,
  cancelarEdicion,
  confirmarEdicion
} from "./update.js";
import { abrirHistorial } from "./history.js";
import {
  obtenerUltimaObservacion,
  coincideBusqueda,
  cumpleFiltros
} from "./products-query.js";
import { ordenarResultados } from "./products-sort.js";
import { crearTarjeta } from "./products-render.js";

const productList = document.querySelector(".product-list");
const search = document.querySelector(".search");
const sortSelector = document.querySelector("#sort-selector");

export function mostrarProductos() {

  const productos = obtenerProductos();
  const categorias = obtenerCategorias();
  const locales = obtenerLocales();
  const resultados = [];

  for (const producto of productos) {

    const categoria = categorias.find(c => c.id === producto.categoria);

    const ultimaReal = obtenerUltimaObservacion(producto);
    if (!ultimaReal) continue;

    const ultima =
      obtenerCambioPendiente(producto.id)
      ?? ultimaReal;

    const local = locales.find(l => l.id === ultima.local);

    if (!coincideBusqueda(producto, categoria, local, search.value))
      continue;

    if (!cumpleFiltros({
      precio: ultima.precio,
      categoria: categoria.nombre,
      local: local.nombre
    }))
      continue;

    resultados.push({
      producto,
      categoria,
      local,
      ultima
    });

  }

  ordenarResultados(resultados, sortSelector.value);
  renderizarResultados(resultados);
}

function actualizarEstadoAceptar(input) {

  const fila = input.closest("p");
  const boton = fila.querySelector(".accept-button");

  if (!boton) return;

  const campo = boton.dataset.campo;
  const select = fila.querySelector(".edit-select");

  let valido = false;
  let cambio = false;

  if (select) {

    const inputNuevo = fila.querySelector(".edit-nuevo");
    const original = select.dataset.original;

    if (select.value === "otro") {
      valido = inputNuevo.value.trim() !== "";
      cambio = true;
    } else {
      valido = true;
      cambio = select.value !== original;
    }

  } else if (campo === "medida") {

    const texto = fila.querySelector(".edit-input");
    const original = texto.dataset.original;

    valido = true;
    cambio = texto.value.trim() !== original.trim();

  } else {

    const numerico = fila.querySelector(".edit-input");
    const original = numerico.dataset.original;
    const numero = Number(numerico.value);

    valido = numerico.value !== "" &&
      Number.isInteger(numero) &&
      numero >= 0 &&
      (campo !== "precio" || numero > 0);

    cambio = numerico.value !== original;

  }

  boton.disabled = !(valido && cambio);

}

function obtenerValorInput(fila, campo) {

  if (campo === "local" || campo === "categoria") {

    const select = fila.querySelector(".edit-select");

    if (select.value !== "otro") {
      return Number(select.value);
    }

    const nuevoNombre = fila.querySelector(".edit-nuevo").value.trim();

    const nuevo = campo === "local"
      ? agregarLocal(nuevoNombre)
      : agregarCategoria(nuevoNombre);

    return nuevo.id;

  }

  if (campo === "marca") {

    const select = fila.querySelector(".edit-select");

    if (select.value === "") return null;
    if (select.value !== "otro") return Number(select.value);

    const nuevoNombre = fila.querySelector(".edit-nuevo").value.trim();
    return agregarMarca(nuevoNombre).id;

  }

  if (campo === "medida") {

    const texto = fila.querySelector(".edit-input").value.trim();
    return texto === "" ? null : texto;

  }

  const input = fila.querySelector(".edit-input");
  return Number(input.value);

}

function renderizarResultados(resultados) {
  productList.innerHTML = "";

  for (const resultado of resultados) {
    productList.innerHTML += crearTarjeta(resultado);
  }

  if (resultados.length === 0) {
    productList.innerHTML = `
      <p class="empty-message">
        Ningún producto coincide con la búsqueda.
      </p>
    `;
  }

  document
    .querySelectorAll(".history-button")
    .forEach(boton => {

      boton.addEventListener("click", () => {
        abrirHistorial(Number(boton.dataset.producto));
      });

    });

  document
    .querySelectorAll(".popover-trigger")
    .forEach(boton => {

      boton.addEventListener("click", (evento) => {

        evento.stopPropagation();

        const popover = document.getElementById(boton.dataset.target);
        const estabaAbierto = !popover.classList.contains("hidden");

        document
          .querySelectorAll(".price-popover")
          .forEach(p => p.classList.add("hidden"));

        if (!estabaAbierto) {
          popover.classList.remove("hidden");
        }

      });

    });

  if (!obtenerModoActualizacion()) return;

  document
    .querySelectorAll(".update-checkbox")
    .forEach(checkbox => {

      checkbox.addEventListener("change", () => {

        const producto = obtenerProductos().find(
          p => p.id === Number(checkbox.dataset.producto)
        );

        alternarProducto(producto);

        mostrarProductos();

      });

    });

  document
    .querySelectorAll(".edit-button")
    .forEach(boton => {

      boton.addEventListener("click", () => {

        const producto = {
          id: Number(boton.dataset.producto)
        };

        editarCampo(
          producto,
          boton.dataset.campo
        );

        mostrarProductos();

      });

    });

  document
    .querySelectorAll(".cancel-button")
    .forEach(boton => {

      boton.addEventListener("click", () => {

        const producto = {
          id: Number(boton.dataset.producto)
        };

        cancelarEdicion(
          producto,
          boton.dataset.campo
        );

        mostrarProductos();

      });

    });

  document
    .querySelectorAll(".edit-input")
    .forEach(input => {

      const evento = input.tagName === "SELECT" ? "change" : "input";

      input.addEventListener(evento, () => {

        if (input.classList.contains("edit-select")) {

          const contenedor = input.closest(".edit-seleccion");
          const inputNuevo = contenedor.querySelector(".edit-nuevo");

          inputNuevo.classList.toggle("hidden", input.value !== "otro");

        }

        actualizarEstadoAceptar(input);

      });

    });

  document
    .querySelectorAll(".accept-button")
    .forEach(boton => {

      boton.addEventListener("click", () => {

        const producto = { id: Number(boton.dataset.producto) };
        const campo = boton.dataset.campo;
        const fila = boton.closest("p");

        const valor = obtenerValorInput(fila, campo);

        confirmarEdicion(producto, campo, valor);

        mostrarProductos();

      });

    });

}

sortSelector.addEventListener("change", mostrarProductos);
search.addEventListener("input", mostrarProductos);

document.addEventListener("click", () => {

  document
    .querySelectorAll(".price-popover")
    .forEach(p => p.classList.add("hidden"));

});