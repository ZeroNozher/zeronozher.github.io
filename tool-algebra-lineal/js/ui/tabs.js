/**
 * Pestañas.
 *
 * Cada módulo se monta perezosamente la primera vez que se abre y queda
 * vivo después: no se desmonta, así conserva su estado al cambiar de
 * pestaña. Agregar una herramienta es agregar un módulo al arreglo.
 */

export class Tabs {
  /** @param {Array<{id:string, nombre:string, descripcion?:string, mount:Function}>} modulos */
  constructor(modulos) {
    this.modulos = modulos;
    this.paneles = new Map();
    this.botones = new Map();
    this.montados = new Set();
    this.activo = null;
  }

  mount(contenedor) {
    const nav = document.createElement('nav');
    nav.className = 'pestanias';
    nav.setAttribute('role', 'tablist');

    const cuerpo = document.createElement('div');
    cuerpo.className = 'pestanias__cuerpo';

    this.modulos.forEach((modulo) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'pestania';
      boton.setAttribute('role', 'tab');
      boton.id = `pestania-${modulo.id}`;
      boton.setAttribute('aria-controls', `panel-${modulo.id}`);
      boton.textContent = modulo.nombre;
      boton.addEventListener('click', () => this.abrir(modulo.id));
      nav.appendChild(boton);
      this.botones.set(modulo.id, boton);

      const panel = document.createElement('section');
      panel.className = 'panel-modulo';
      panel.id = `panel-${modulo.id}`;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', boton.id);
      panel.hidden = true;
      cuerpo.appendChild(panel);
      this.paneles.set(modulo.id, panel);
    });

    contenedor.appendChild(nav);
    contenedor.appendChild(cuerpo);

    if (this.modulos.length) this.abrir(this.modulos[0].id);
  }

  abrir(id) {
    if (this.activo === id) return;
    this.activo = id;

    this.botones.forEach((boton, clave) => {
      const activo = clave === id;
      boton.classList.toggle('pestania--activa', activo);
      boton.setAttribute('aria-selected', String(activo));
    });

    this.paneles.forEach((panel, clave) => {
      panel.hidden = clave !== id;
    });

    if (!this.montados.has(id)) {
      const modulo = this.modulos.find((m) => m.id === id);
      modulo.mount(this.paneles.get(id));
      this.montados.add(id);
    }
  }
}
