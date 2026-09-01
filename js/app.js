import { cargarBaseDeDatos } from "./database.js";
import { inicializarFiltros } from "./filters.js";
import { mostrarProductos } from "./products.js";
import { inicializarHistorial } from "./history.js";
import { inicializarAjustes } from "./settings.js";
import { inicializarCatalogos } from "./catalogos.js";

document.addEventListener("DOMContentLoaded", async () => {

  await cargarBaseDeDatos();
  await inicializarAjustes();
  inicializarCatalogos();

  inicializarFiltros();

  mostrarProductos();

  inicializarHistorial();

});