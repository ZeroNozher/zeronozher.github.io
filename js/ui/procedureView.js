/**
 * Vista del procedimiento.
 *
 * Misma anatomía que MatrixView —encabezado, etiquetas de fila, grilla—
 * pero cada celda lleva una cuenta partida en tokens, y cada token se
 * pinta según de dónde sale: A, B, el resultado, o un operador.
 *
 * Es más chica que las otras matrices a propósito: acá el protagonista
 * es la cuenta, no el número.
 */

const DURACION_SALIDA = 170; // ms — igual que en matrixView.js

/** Texto plano de una celda, para comparar y para medir. */
function aTexto(tokens) {
  return tokens.map((t) => t.texto).join('');
}

export class ProcedureView {
  /**
   * @param {object}  opciones
   * @param {string}  opciones.titulo
   * @param {string} [opciones.subtitulo]
   */
  constructor({ titulo, subtitulo = '' }) {
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.celdas = [];
    this.filas = null;
    this.minCaracteres = 12;
  }

  mount(contenedor, orden = 3, columnas = 3) {
    const raiz = document.createElement('section');
    raiz.className = 'matriz matriz--procedimiento matriz--a';

    const encabezado = document.createElement('header');
    encabezado.className = 'matriz__encabezado';

    const titulo = document.createElement('h3');
    titulo.className = 'matriz__titulo';
    titulo.textContent = this.titulo;
    encabezado.appendChild(titulo);

    const subtitulo = document.createElement('p');
    subtitulo.className = 'matriz__subtitulo';
    subtitulo.textContent = this.subtitulo;
    encabezado.appendChild(subtitulo);

    const cuerpo = document.createElement('div');
    cuerpo.className = 'matriz__cuerpo';

    const etiquetas = document.createElement('div');
    etiquetas.className = 'matriz__filas-etiquetas';

    const grilla = document.createElement('div');
    grilla.className = 'matriz__grilla';
    grilla.style.setProperty('--columnas', columnas);

    for (let fila = 0; fila < orden; fila += 1) {
      const etiqueta = document.createElement('span');
      etiqueta.className = 'matriz__etiqueta-fila';
      etiqueta.textContent = `F${fila + 1}`;
      etiquetas.appendChild(etiqueta);

      this.celdas[fila] = [];
      for (let columna = 0; columna < columnas; columna += 1) {
        const celda = document.createElement('div');
        celda.className = 'celda celda--procedimiento';

        const valor = document.createElement('span');
        valor.className = 'celda__valor';
        celda.appendChild(valor);

        grilla.appendChild(celda);
        this.celdas[fila][columna] = celda;
      }
    }

    cuerpo.append(etiquetas, grilla);
    raiz.append(encabezado, cuerpo);
    contenedor.appendChild(raiz);

    this.raiz = raiz;
    this.subtituloNodo = subtitulo;
    this.grilla = grilla;
    return raiz;
  }

  /**
   * Paleta de la matriz: 'a' cuando no hay operación (P es A sin tocar),
   * 'r' cuando sí la hay (P explica cómo se llegó al resultado).
   */
  setVariante(variante) {
    this.raiz.classList.toggle('matriz--a', variante === 'a');
    this.raiz.classList.toggle('matriz--r', variante === 'r');
  }

  /**
   * Piso de ancho, en caracteres. El ancho real lo manda la celda más
   * larga; esto solo evita que una cuenta corta se vea apretada.
   */
  setAnchoMinimo(caracteres) {
    this.minCaracteres = caracteres;
  }

  setSubtitulo(texto) {
    this.subtituloNodo.textContent = texto;
  }

  ajustarAncho(filas) {
    const largo = Math.max(
      this.minCaracteres,
      ...filas.flat().map((tokens) => aTexto(tokens).length)
    );
    // La tipografía es monoespaciada, así que 1ch mide exactamente un carácter.
    this.grilla.style.setProperty('--celda-ancho-proc', `calc(${largo}ch + var(--esp-4))`);
  }

  /** @param {Array<Array<Array<{tipo: string, texto: string}>>>} filas */
  setFilas(filas) {
    const anterior = this.filas;
    this.filas = filas;

    this.ajustarAncho(filas);

    filas.forEach((fila, i) => {
      fila.forEach((tokens, j) => {
        const previo = anterior ? aTexto(anterior[i][j]) : null;
        if (aTexto(tokens) !== previo) this.animarCambio(this.celdas[i][j], tokens);
      });
    });
  }

  animarCambio(celda, tokens) {
    const valor = celda.querySelector('.celda__valor');
    celda.classList.add('celda--saliendo');

    window.setTimeout(() => {
      valor.textContent = '';
      tokens.forEach((t) => {
        const pieza = document.createElement('span');
        pieza.className = `token token--${t.tipo}`;
        pieza.textContent = t.texto;
        valor.appendChild(pieza);
      });

      celda.classList.remove('celda--saliendo');
      celda.classList.add('celda--entrando');
      window.setTimeout(() => celda.classList.remove('celda--entrando'), DURACION_SALIDA);
    }, DURACION_SALIDA);
  }
}
