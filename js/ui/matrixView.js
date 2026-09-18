/**
 * Vista de una matriz.
 *
 * Se construye una sola vez y después solo se actualiza el texto de las
 * celdas que efectivamente cambiaron. Esa comparación es la que permite
 * animar únicamente lo que se modificó.
 */

const DURACION_SALIDA = 170; // ms — debe coincidir con --transicion-celda en el CSS

export class MatrixView {
  /**
   * @param {object} opciones
   * @param {string}   opciones.titulo
   * @param {string}  [opciones.subtitulo]
   * @param {boolean} [opciones.editable]     habilita el click en celdas
   * @param {string}  [opciones.variante]     paleta: 'a', 'b' o 'r'
   * @param {Function}[opciones.onSeleccion]  (fila, columna) => void
   */
  constructor({
    titulo,
    subtitulo = '',
    editable = false,
    variante = '',
    onSeleccion = null,
  }) {
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.editable = editable;
    this.variante = variante;
    this.onSeleccion = onSeleccion;

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
      celda.addEventListener('click', () => {
        this.seleccionar(fila, columna);
        if (this.onSeleccion) this.onSeleccion(fila, columna);
      });
    }

    return celda;
  }

  /** Actualiza la vista animando solo las celdas cuyo valor cambió. */
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

  seleccionar(fila, columna) {
    this.limpiarSeleccion();
    this.seleccion = { fila, columna };
    this.celdas[fila][columna].classList.add('celda--seleccionada');
  }

  limpiarSeleccion() {
    if (!this.seleccion) return;
    const { fila, columna } = this.seleccion;
    this.celdas[fila][columna].classList.remove('celda--seleccionada');
    this.seleccion = null;
  }

  /** Marca filas involucradas en la operación que está por aplicarse. */
  destacarFilas(indices = []) {
    this.celdas.forEach((fila, i) => {
      fila.forEach((celda) => {
        celda.classList.toggle('celda--destacada', indices.includes(i));
      });
    });
  }
}
