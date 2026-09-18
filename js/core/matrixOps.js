/**
 * Operaciones entre dos matrices.
 *
 * Cada operación viene en dos formas, igual que en rowOps.js:
 *   - la que devuelve la matriz resultado
 *   - explicar(), que devuelve la cuenta escrita de cada celda
 *
 * La segunda existe porque el resultado solo dice qué pasó; el
 * procedimiento dice por qué.
 */

import { Matrix } from './matrix.js';
import { CERO } from './fraction.js';

export const OPERACIONES_BINARIAS = [
  {
    id: 'suma',
    nombre: 'A + B',
    formula: 'Rij = Aij + Bij',
    terminos: 2,
  },
  {
    id: 'resta',
    nombre: 'A − B',
    formula: 'Rij = Aij − Bij',
    terminos: 2,
  },
  {
    id: 'producto',
    nombre: 'A × B',
    formula: 'Rij = Ai1·B1j + Ai2·B2j + Ai3·B3j',
    terminos: 3,
  },
];

export function buscarOperacion(id) {
  return OPERACIONES_BINARIAS.find((operacion) => operacion.id === id) || null;
}

/** Los negativos van entre paréntesis para que "3 + (−2)" se lea de una. */
function escribir(fraccion) {
  const texto = fraccion.toString();
  return fraccion.n < 0 ? `(${texto})` : texto;
}

/**
 * Un pedazo de la cuenta, etiquetado con de dónde sale.
 * @param {'a'|'b'|'r'|'op'} tipo
 */
function token(tipo, texto) {
  return { tipo, texto };
}

/** Largo de una celda de procedimiento, en caracteres. */
export function largoTokens(tokens) {
  return tokens.reduce((total, t) => total + t.texto.length, 0);
}

function porCelda(a, b, calcular) {
  const filas = a.filas.map((fila, i) => fila.map((_, j) => calcular(i, j)));
  return new Matrix(filas);
}

export function sumar(a, b) {
  return porCelda(a, b, (i, j) => a.get(i, j).add(b.get(i, j)));
}

export function restar(a, b) {
  return porCelda(a, b, (i, j) => a.get(i, j).sub(b.get(i, j)));
}

export function multiplicar(a, b) {
  return porCelda(a, b, (i, j) => {
    let acumulado = CERO;
    for (let k = 0; k < a.columnas; k += 1) {
      acumulado = acumulado.add(a.get(i, k).mul(b.get(k, j)));
    }
    return acumulado;
  });
}

/**
 * @param {string|null} id
 * @returns {Matrix} si no hay operación elegida, A pasa sin tocarse.
 */
export function aplicarBinaria(id, a, b) {
  if (id === 'suma') return sumar(a, b);
  if (id === 'resta') return restar(a, b);
  if (id === 'producto') return multiplicar(a, b);
  return a.clone();
}
/**
 * Cuenta de cada celda, partida en líneas y cada línea en tokens.
 *
 * Línea 1: el primer término solo. Líneas siguientes: operador + término.
 * Última línea: "= resultado". En desktop las líneas se muestran en una
 * sola fila (ver CSS); en mobile se apilan una debajo de la otra.
 *
 * @returns {Array<Array<Array<Array<{tipo:string, texto:string}>>>>}
 *   filas → columnas → líneas → tokens
 */
export function explicarBinaria(id, a, b) {
  if (id === 'suma' || id === 'resta') {
    const signo = id === 'suma' ? '+' : '−';
    const resultado = id === 'suma' ? sumar(a, b) : restar(a, b);
    return a.filas.map((fila, i) =>
      fila.map((_, j) => [
        [token('a', escribir(a.get(i, j)))],
        [token('op', `${signo} `), token('b', escribir(b.get(i, j)))],
        [token('op', '= '), token('r', resultado.get(i, j).toString())],
      ])
    );
  }

  if (id === 'producto') {
    const resultado = multiplicar(a, b);
    return a.filas.map((fila, i) =>
      fila.map((_, j) => {
        const lineas = [];
        for (let k = 0; k < a.columnas; k += 1) {
          const prefijo = k === 0 ? [] : [token('op', '+ ')];
          lineas.push([
            ...prefijo,
            token('a', escribir(a.get(i, k))),
            token('op', '·'),
            token('b', escribir(b.get(k, j))),
          ]);
        }
        lineas.push([token('op', '= '), token('r', resultado.get(i, j).toString())]);
        return lineas;
      })
    );
  }

  return a.filas.map((fila, i) => fila.map((_, j) => [[token('a', a.get(i, j).toString())]]));
}