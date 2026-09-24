(function () {
  // Las tarjetas marcadas con data-wip piden confirmación antes de abrir el proyecto.
  var dlg = document.getElementById("wip-dialog");
  var go = document.getElementById("wip-go");
  var msg = "Esta herramienta está en construcción y puede fallar o cambiar sin aviso. ¿Entrar igualmente?";

  document.querySelectorAll("a[data-wip]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (dlg && typeof dlg.showModal === "function") {
        e.preventDefault();
        go.setAttribute("href", link.getAttribute("href"));
        dlg.showModal();
      } else if (!window.confirm(msg)) {
        e.preventDefault(); // navegadores sin <dialog>: confirm() nativo
      }
    });
  });

  // Clic fuera del cuadro cierra el diálogo.
  if (dlg) {
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
  }
})();
