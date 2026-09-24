function lineaATexto(linea) {
  return linea.map((t) => t.texto).join('');
}

function celdaATexto(lineas) {
  return lineas.map(lineaATexto).join(' ');
}


const DURACION_SALIDA = 170;
const PISO_LINEA = 6;

export class ProcedureView {
  constructor({ titulo, subtitulo = '', controles = null }) {
    this.titulo = titulo;
    this.subtitulo = subtitulo;
    this.controles = controles;
    this.celdas = [];
    this.filas = null;
    this.minCaracteres = PISO_LINEA;
  }

  mount(contenedor, orden = 3, columnas = 3) {
    const raiz = document.createElement('section');
    raiz.className = 'matriz matriz--procedimiento matriz--a';

    const encabezado = document.createElement('header');
    encabezado.className = 'matriz__encabezado';

    const texto = document.createElement('div');
    texto.className = 'matriz__encabezado-texto';

    const titulo = document.createElement('h3');
    titulo.className = 'matriz__titulo';
    titulo.textContent = this.titulo;
    texto.appendChild(titulo);

    const subtitulo = document.createElement('p');
    subtitulo.className = 'matriz__subtitulo';
    subtitulo.textContent = this.subtitulo;
    texto.appendChild(subtitulo);

    encabezado.appendChild(texto);

    if (this.controles) {
      encabezado.appendChild(this.controles);
    }

    const cuerpo = document.createElement('div');
    cuerpo.className = 'matriz__cuerpo';

    const grilla = document.createElement('div');
    grilla.className = 'matriz__grilla';
    grilla.style.setProperty('--columnas', columnas);

    for (let fila = 0; fila < orden; fila += 1) {
      const etiqueta = document.createElement('span');
      etiqueta.className = 'matriz__etiqueta-fila';
      etiqueta.textContent = `F${fila + 1}`;
      grilla.appendChild(etiqueta);

      this.celdas[fila] = [];
      for (let columna = 0; columna < columnas; columna += 1) {
        const celda = document.createElement('div');
        celda.className = 'celda celda--procedimiento';

        const valor = document.createElement('div');
        valor.className = 'celda__valor';
        celda.appendChild(valor);

        grilla.appendChild(celda);
        this.celdas[fila][columna] = celda;
      }
    }

    cuerpo.appendChild(grilla);
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
    const celdas = filas.flatMap((fila) => fila);
    const ancho = Math.max(
      this.minCaracteres,
      ...celdas.flatMap((lineas) => lineas.map((l) => lineaATexto(l).length))
    );
    this.grilla.style.setProperty('--celda-ancho-proc', `calc(${ancho}ch + var(--esp-4))`);
  }

  setFilas(filas) {
    const anterior = this.filas;
    this.filas = filas;

    this.ajustarAncho(filas);

    filas.forEach((fila, i) => {
      fila.forEach((lineas, j) => {
        const previo = anterior ? celdaATexto(anterior[i][j]) : null;
        if (celdaATexto(lineas) !== previo) this.animarCambio(this.celdas[i][j], lineas);
      });
    });
  }

  animarCambio(celda, lineas) {
    const valor = celda.querySelector('.celda__valor');
    celda.classList.add('celda--saliendo');

    window.setTimeout(() => {
      valor.textContent = '';
      lineas.forEach((linea) => {
        const filaDiv = document.createElement('div');
        filaDiv.className = 'procedimiento__linea';
        linea.forEach((t) => {
          const pieza = document.createElement('span');
          pieza.className = `token token--${t.tipo}`;
          pieza.textContent = t.texto;
          filaDiv.appendChild(pieza);
        });
        valor.appendChild(filaDiv);
      });

      celda.classList.remove('celda--saliendo');
      celda.classList.add('celda--entrando');
      window.setTimeout(() => celda.classList.remove('celda--entrando'), DURACION_SALIDA);
    }, DURACION_SALIDA);
  }
}
