/**
 * Campo numérico con filtrado de caracteres.
 *
 * Dos modos:
 *   'entero'   — solo signo y dígitos, acotado por min/max. Lo usan las celdas.
 *   'racional' — además acepta punto, coma y barra: 1.5, -3/4, 0,25.
 *
 * El filtrado ocurre en el evento input, así que ni pegar ni dictar
 * meten caracteres prohibidos.
 */

import { Fraction } from '../core/fraction.js';

const PATRONES = {
  entero: /[^0-9-]/g,
  racional: /[^0-9.,/-]/g,
};

export function filtrarNumero(texto, modo) {
  let limpio = texto.replace(PATRONES[modo], '');

  limpio = limpio.replace(/(?!^)-/g, (guion, posicion) =>
    limpio[posicion - 1] === '/' ? guion : ''
  );

  if (modo === 'racional') {
    const partes = limpio.split('/');
    if (partes.length > 2) {
      limpio = `${partes[0]}/${partes.slice(1).join('')}`;
    }
    limpio = limpio
      .split('/')
      .map((parte) => {
        const trozos = parte.replace(/,/g, '.').split('.');
        return trozos.length > 2 ? `${trozos[0]}.${trozos.slice(1).join('')}` : parte;
      })
      .join('/');
  }

  return limpio;
}

export class NumberField {
  /**
   * @param {object}   opciones
   * @param {'entero'|'racional'} opciones.modo
   * @param {number}  [opciones.min]
   * @param {number}  [opciones.max]
   * @param {string}  [opciones.etiqueta]
   * @param {string}  [opciones.placeholder]
   * @param {Function}[opciones.onEnter]  (Fraction) => void
   * @param {Function}[opciones.onCambio] (Fraction|null) => void
   */
  constructor({
    modo = 'entero',
    min = null,
    max = null,
    etiqueta = '',
    placeholder = '',
    onEnter = null,
    onCambio = null,
  } = {}) {
    this.modo = modo;
    this.min = min;
    this.max = max;
    this.etiqueta = etiqueta;
    this.placeholder = placeholder;
    this.onEnter = onEnter;
    this.onCambio = onCambio;
    this.raiz = null;
    this.input = null;
    this.aviso = null;
  }

  mount(contenedor) {
    const raiz = document.createElement('div');
    raiz.className = 'campo';

    if (this.etiqueta) {
      const etiqueta = document.createElement('label');
      etiqueta.className = 'campo__etiqueta';
      etiqueta.textContent = this.etiqueta;
      raiz.appendChild(etiqueta);
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'campo__input';
    input.inputMode = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.placeholder = this.placeholder;
    raiz.appendChild(input);

    const aviso = document.createElement('p');
    aviso.className = 'campo__aviso';
    aviso.setAttribute('role', 'status');
    raiz.appendChild(aviso);

    input.addEventListener('input', () => {
      const limpio = this.filtrar(input.value);
      if (limpio !== input.value) {
        const cursor = input.selectionStart - (input.value.length - limpio.length);
        input.value = limpio;
        input.setSelectionRange(cursor, cursor);
      }
      this.revisar();
      if (this.onCambio) this.onCambio(this.fraccion);
    });

    input.addEventListener('keydown', (evento) => {
      if (evento.key !== 'Enter') return;
      evento.preventDefault();
      const valor = this.fraccion;
      if (valor && this.onEnter) this.onEnter(valor);
    });

    contenedor.appendChild(raiz);
    this.raiz = raiz;
    this.input = input;
    this.aviso = aviso;
    return raiz;
  }

  /** Quita caracteres prohibidos y signos repetidos fuera de lugar. */
  filtrar(texto) {
    return filtrarNumero(texto, this.modo);
  }

  /** @returns {Fraction|null} */
  get fraccion() {
    const valor = Fraction.parse(this.input.value);
    if (!valor) return null;
    if (!this.enRango(valor)) return null;
    return valor;
  }

  enRango(valor) {
    const numero = valor.toNumber();
    if (this.min !== null && numero < this.min) return false;
    if (this.max !== null && numero > this.max) return false;
    return true;
  }

  get vacio() {
    return this.input.value.trim() === '';
  }

  revisar() {
    if (this.vacio) {
      this.marcar('', false);
      return;
    }
    const valor = Fraction.parse(this.input.value);
    if (!valor) {
      this.marcar('Escribí un número.', true);
      return;
    }
    if (!this.enRango(valor)) {
      this.marcar(`El valor va de ${this.min} a ${this.max}.`, true);
      return;
    }
    this.marcar('', false);
  }

  marcar(mensaje, esError) {
    this.aviso.textContent = mensaje;
    this.raiz.classList.toggle('campo--error', esError);
  }

  set value(texto) {
    this.input.value = texto;
    this.revisar();
  }

  get value() {
    return this.input.value;
  }

  focus() {
    this.input.focus();
    this.input.select();
  }
}
