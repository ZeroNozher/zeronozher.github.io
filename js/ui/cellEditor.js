/**
 * Editor de celda.
 *
 * Aparece debajo de la matriz de entrada cuando hay una celda seleccionada
 * y desaparece al confirmar o cancelar. Solo acepta enteros del rango
 * permitido; Enter confirma, Escape cancela.
 */

import { NumberField } from './numberField.js';

export const RANGO_CELDA = { min: -100, max: 100 };

export class CellEditor {
  /**
   * @param {object}   opciones
   * @param {Function} opciones.onConfirmar (fila, columna, Fraction) => void
   * @param {Function}[opciones.onCancelar]
   * @param {string}  [opciones.prefijo]    nombre de la matriz, si hay más de una
   */
  constructor({ onConfirmar, onCancelar = null, prefijo = '' }) {
    this.onConfirmar = onConfirmar;
    this.onCancelar = onCancelar;
    this.prefijo = prefijo;
    this.destino = null;
    this.raiz = null;
    this.campo = null;
  }

  mount(contenedor) {
    const raiz = document.createElement('div');
    raiz.className = 'editor-celda';
    raiz.hidden = true;

    const ubicacion = document.createElement('p');
    ubicacion.className = 'editor-celda__ubicacion';
    raiz.appendChild(ubicacion);

    this.campo = new NumberField({
      modo: 'entero',
      min: RANGO_CELDA.min,
      max: RANGO_CELDA.max,
      placeholder: `${RANGO_CELDA.min} a ${RANGO_CELDA.max}`,
      onEnter: (valor) => this.confirmar(valor),
    });
    this.campo.mount(raiz);

    const ayuda = document.createElement('p');
    ayuda.className = 'editor-celda__ayuda';
    ayuda.textContent = 'Enter para guardar, Esc para cancelar.';
    raiz.appendChild(ayuda);

    raiz.addEventListener('keydown', (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        this.cerrar();
        if (this.onCancelar) this.onCancelar();
      }
    });

    contenedor.appendChild(raiz);
    this.ubicacion = ubicacion;
    this.raiz = raiz;
    return raiz;
  }

  abrir(fila, columna, valorActual) {
    this.destino = { fila, columna };
    const ubicacion = `Fila ${fila + 1}, columna ${columna + 1}`;
    this.ubicacion.textContent = this.prefijo ? `${this.prefijo} · ${ubicacion}` : ubicacion;
    this.raiz.hidden = false;
    this.campo.value = valorActual;

    // En pantallas chicas el editor puede quedar lejos de la celda que se
    // tocó (por ejemplo, la matriz B en la pestaña binaria queda varias
    // pantallas arriba). Lo traemos a la vista antes de enfocar; el foco
    // se retrasa un poco para no cortar la animación de scroll.
    this.raiz.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => this.campo.focus(), 220);
  }

  confirmar(valor) {
    if (!this.destino) return;
    const { fila, columna } = this.destino;
    this.onConfirmar(fila, columna, valor);
    this.cerrar();
  }

  cerrar() {
    this.raiz.hidden = true;
    this.campo.value = '';
    this.destino = null;
  }
}
