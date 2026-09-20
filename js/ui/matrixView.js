/**
 * Vista de una matriz.
 *
 * Se construye una sola vez y después solo se actualiza el texto de las
 * celdas que efectivamente cambiaron. Esa comparación es la que permite
 * animar únicamente lo que se modificó.
*/

import { Fraction } from '../core/fraction.js';
import { filtrarNumero } from './numberField.js';

const DURACION_SALIDA = 170;
const RANGO_CELDA = { min: -100, max: 100 };

export class MatrixView {
  constructor({
    titulo,
    subtitulo = '',
    editable = false,
    variante = '',
    onCambio = null,
    onEmpezarEdicion = null,
  }) {
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.editable = editable;
    this.variante = variante;
    this.onCambio = onCambio;
    this.onEmpezarEdicion = onEmpezarEdicion;

    this.celdas = [];
    this.seleccion = null;
    this.raiz = null;
    this.matriz = null;
  }

  mount(contenedor, matriz) {
    this.matriz = matriz;

    const raiz = document.createElement('section');
    raiz.className = `matriz ${this.editable ? 'matriz--editable' : 'matriz--resultado'}`;
    if (this.variante) raiz.classList.add(`matriz--${this.variante}`);

    const encabezado = document.createElement('header');
    encabezado.className = 'matriz__encabezado';

    const titulo = document.createElement('h3');
    titulo.className = 'matriz__titulo';
    titulo.textContent = this.titulo;
    encabezado.appendChild(titulo);

    if (this.subtitulo) {
      const subtitulo = document.createElement('p');
      subtitulo.className = 'matriz__subtitulo';
      subtitulo.textContent = this.subtitulo;
      encabezado.appendChild(subtitulo);
    }

    const cuerpo = document.createElement('div');
    cuerpo.className = 'matriz__cuerpo';

    const grilla = document.createElement('div');
    grilla.className = 'matriz__grilla';
    grilla.style.setProperty('--columnas', matriz.columnas);

    const etiquetas = document.createElement('div');
    etiquetas.className = 'matriz__filas-etiquetas';

    for (let fila = 0; fila < matriz.orden; fila += 1) {
      const etiqueta = document.createElement('span');
      etiqueta.className = 'matriz__etiqueta-fila';
      etiqueta.textContent = `F${fila + 1}`;
      etiquetas.appendChild(etiqueta);

      this.celdas[fila] = [];
      for (let columna = 0; columna < matriz.columnas; columna += 1) {
        const celda = this.crearCelda(fila, columna, matriz.get(fila, columna).toString());
        this.celdas[fila][columna] = celda;
        grilla.appendChild(celda);
      }
    }

    cuerpo.appendChild(etiquetas);
    cuerpo.appendChild(grilla);

    raiz.appendChild(encabezado);
    raiz.appendChild(cuerpo);
    contenedor.appendChild(raiz);

    this.raiz = raiz;
    return raiz;
  }

  crearCelda(fila, columna, texto) {
    const celda = document.createElement(this.editable ? 'button' : 'div');
    celda.className = 'celda';
    celda.dataset.fila = String(fila);
    celda.dataset.columna = String(columna);

    const valor = document.createElement('span');
    valor.className = 'celda__valor';
    valor.textContent = texto;
    celda.appendChild(valor);

    if (this.editable) {
      celda.type = 'button';
      celda.setAttribute('aria-label', `Fila ${fila + 1}, columna ${columna + 1}`);
      celda.addEventListener('click', () => this.iniciarEdicion(fila, columna));
    }

    return celda;
  }

  iniciarEdicion(fila, columna) {
    if (this.edicion) {
      if (this.edicion.fila === fila && this.edicion.columna === columna) return;
      this.confirmarOCancelar();
    }

    if (this.onEmpezarEdicion) this.onEmpezarEdicion();

    const celda = this.celdas[fila][columna];
    const valorSpan = celda.querySelector('.celda__valor');
    const actual = this.matriz.get(fila, columna).toString();

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'celda__input';
    input.inputMode = 'text'; // 'numeric' esconde el signo menos en varios teclados
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.value = actual;

    input.addEventListener('input', () => {
      const limpio = filtrarNumero(input.value, 'entero');
      if (limpio !== input.value) input.value = limpio;
      celda.classList.toggle('celda--invalida', !this.validar(input.value));
    });

    input.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter') {
        evento.preventDefault();
        this.confirmar(fila, columna, input.value);
      } else if (evento.key === 'Escape') {
        evento.preventDefault();
        this.cancelarEdicion();
      }
    });

    input.addEventListener('blur', () => {
      // Tocar afuera de la celda también debe cerrar la edición.
      // El setTimeout deja que un click en OTRA celda primero dispare su
      // propio iniciarEdicion (que ya cierra esta edición); si eso ya pasó,
      // this.edicion apunta a otra celda y esta llamada no hace nada.
      window.setTimeout(() => {
        if (this.edicion && this.edicion.fila === fila && this.edicion.columna === columna) {
          this.confirmarOCancelar();
        }
      }, 0);
    });

    valorSpan.hidden = true;
    celda.appendChild(input);
    celda.classList.add('celda--editando');
    this.edicion = { fila, columna, input, valorSpan };

    input.focus();
    input.select();
  }

  validar(texto) {
    const valor = Fraction.parse(texto);
    if (!valor) return false;
    const numero = valor.toNumber();
    return numero >= RANGO_CELDA.min && numero <= RANGO_CELDA.max;
  }

  confirmar(fila, columna, texto) {
    if (!this.validar(texto)) return; // Enter con valor inválido: no hace nada
    const valor = Fraction.parse(texto);
    this.cerrarEdicionDom();
    if (this.onCambio) this.onCambio(fila, columna, valor);
  }

  confirmarOCancelar() {
    if (!this.edicion) return;
    const { fila, columna, input } = this.edicion;
    if (this.validar(input.value)) {
      this.confirmar(fila, columna, input.value);
    } else {
      this.cancelarEdicion();
    }
  }

  cancelarEdicion() {
    if (!this.edicion) return;
    this.cerrarEdicionDom();
  }

  cerrarEdicionDom() {
    const { fila, columna, input, valorSpan } = this.edicion;
    const celda = this.celdas[fila][columna];
    celda.classList.remove('celda--editando', 'celda--invalida');
    input.remove();
    valorSpan.hidden = false;
    this.edicion = null;
  }

  setMatriz(matriz) {
    const anterior = this.matriz;
    this.matriz = matriz;

    for (let fila = 0; fila < matriz.orden; fila += 1) {
      for (let columna = 0; columna < matriz.columnas; columna += 1) {
        const nuevo = matriz.get(fila, columna).toString();
        const viejo = anterior ? anterior.get(fila, columna).toString() : null;
        if (nuevo !== viejo) {
          this.animarCambio(this.celdas[fila][columna], nuevo);
        }
      }
    }
  }

  animarCambio(celda, texto) {
    const valor = celda.querySelector('.celda__valor');
    celda.classList.add('celda--saliendo');

    window.setTimeout(() => {
      valor.textContent = texto;
      celda.classList.remove('celda--saliendo');
      celda.classList.add('celda--entrando');
      window.setTimeout(() => celda.classList.remove('celda--entrando'), DURACION_SALIDA);
    }, DURACION_SALIDA);
  }

  destacarFilas(indices = []) {
    this.celdas.forEach((fila, i) => {
      fila.forEach((celda) => {
        celda.classList.toggle('celda--destacada', indices.includes(i));
      });
    });
  }
}
