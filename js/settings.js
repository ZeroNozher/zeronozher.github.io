import { obtenerTema, guardarTema } from "./database.js";

const RUTA_JSON = "./json/temas.json";

let temas = {};
let temaActual = null;

const btnAjustes = document.querySelector("#btn-settings");
const overlay = document.querySelector("#settings-overlay");
const panel = document.querySelector("#settings-panel");
const btnCerrar = document.querySelector("#settings-close");
const listaTemas = document.querySelector("#theme-options");

export async function inicializarAjustes() {

  const datos = await cargarJSON();

  temas = datos.temas;

  const guardado = obtenerTema();
  temaActual = guardado?.clave ?? datos.temaPorDefecto;

  aplicarTema(temaActual);
  renderizarOpciones();

  if (!guardado) {
    guardarColoresActuales(temaActual);
  }

  btnAjustes.addEventListener("click", abrirAjustes);
  btnCerrar.addEventListener("click", cerrarAjustes);
  overlay.addEventListener("click", cerrarAjustes);

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarAjustes();
  });

  const tabs = document.querySelectorAll(".settings-tab");
  const paneles = document.querySelectorAll(".settings-panel-tab");

  tabs.forEach(tab => {

    tab.addEventListener("click", () => {

      tabs.forEach(t => t.classList.toggle("active", t === tab));

      paneles.forEach(p =>
        p.classList.toggle("active", p.dataset.tab === tab.dataset.tab)
      );

    });

  });

}

function guardarColoresActuales(clave) {

  const tema = temas[clave];

  guardarTema(clave, {
    bg: tema.bg,
    surface: tema.surface,
    text: tema.text,
    bg2img: tema.bg2img
  });

}

async function cargarJSON() {
  const respuesta = await fetch(RUTA_JSON);
  return await respuesta.json();
}

function renderizarOpciones() {

  listaTemas.innerHTML = "";

  for (const [clave, tema] of Object.entries(temas)) {

    const label = document.createElement("label");

    const radio = document.createElement("input");
    radio.type = "radio";
    radio.name = "tema";
    radio.value = clave;
    radio.checked = clave === temaActual;

    radio.addEventListener("change", () => {
      if (radio.checked) {
        temaActual = clave;
        aplicarTema(clave);
        guardarColoresActuales(clave);
      }
    });

    label.appendChild(radio);
    label.append(" " + tema.nombre);

    listaTemas.appendChild(label);

  }

}

function aplicarTema(clave) {

  const tema = temas[clave];
  if (!tema) return;

  const raiz = document.documentElement.style;

  raiz.setProperty("--bg", tema.bg);
  raiz.setProperty("--surface", tema.surface);
  raiz.setProperty("--text", tema.text);
  raiz.setProperty("--bg2img", tema.bg2img);

}

function abrirAjustes() {

  btnAjustes.classList.add("hidden");

  overlay.classList.remove("hidden");
  panel.classList.remove("hidden");

  requestAnimationFrame(() => panel.classList.add("open"));

}

function cerrarAjustes() {

  panel.classList.remove("open");

  setTimeout(() => {
    panel.classList.add("hidden");
    overlay.classList.add("hidden");
    btnAjustes.classList.remove("hidden");
  }, 250);

}