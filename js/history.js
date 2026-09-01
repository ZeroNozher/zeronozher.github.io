import {
  obtenerProductos,
  obtenerObservaciones
} from "./database.js";

const overlay = document.querySelector("#history-overlay");
const panel = document.querySelector("#history-panel");
const titulo = panel.querySelector(".history-title");
const lista = panel.querySelector(".history-list");
const btnCerrar = document.querySelector("#history-close");

export function inicializarHistorial() {

  btnCerrar.addEventListener("click", cerrarHistorial);
  overlay.addEventListener("click", cerrarHistorial);

  document.addEventListener("keydown", (evento) => {

    if (evento.key === "Escape") {
      cerrarHistorial();
    }

  });

}

export function abrirHistorial(idProducto) {

  const producto = obtenerProductos().find(p => p.id === idProducto);

  const historial = obtenerObservaciones()
    .filter(o => o.producto === idProducto)
    .sort((a, b) => convertirFecha(b.fecha) - convertirFecha(a.fecha));

  titulo.textContent = producto.nombre;
  lista.innerHTML = historial.map(crearFilaHistorial).join("");

  overlay.classList.remove("hidden");
  panel.classList.remove("hidden");

  requestAnimationFrame(() => {
    panel.classList.add("open");
  });

}

function crearFilaHistorial(obs, indice, historial) {

  const anterior = historial[indice + 1];
  const delta = anterior ? obs.precio - anterior.precio : null;

  return `
    <div class="history-row">

      <span class="history-fecha">${obs.fecha}</span>

      <span class="history-precio">
        $${obs.precio}
        ${obs.descuento > 0 ? `<small>(-$${obs.descuento} desc.)</small>` : ""}
      </span>

      <span class="history-delta ${claseDelta(delta)}">
        ${textoDelta(delta)}
      </span>

    </div>
  `;

}

function claseDelta(delta) {

  if (delta === null || delta === 0) return "delta-neutro";

  return delta > 0 ? "delta-sube" : "delta-baja";

}

function textoDelta(delta) {

  if (delta === null) return "—";
  if (delta === 0) return "= Sin cambio";

  return delta > 0
    ? `▲ +$${delta}`
    : `▼ -$${Math.abs(delta)}`;

}

function cerrarHistorial() {

  panel.classList.remove("open");

  setTimeout(() => {
    panel.classList.add("hidden");
    overlay.classList.add("hidden");
  }, 250);

}

function convertirFecha(fecha) {
  const [dia, mes, año] = fecha.split("/");

  return new Date(`${año}-${mes}-${dia}`);

}