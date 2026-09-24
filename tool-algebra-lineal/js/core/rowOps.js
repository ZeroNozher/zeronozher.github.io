/**
 * Operaciones elementales de fila.
 *
 * Cada operación viene en dos formas:
 *   - preview*: devuelve solo la fila resultante (para mostrarla antes de aplicar)
 *   - la operación en sí: devuelve la matriz completa ya modificada
 *
 * Son funciones puras. La matriz de entrada nunca se toca.
 */

import { Matrix } from './matrix.js';
import { Fraction } from './fraction.js';

/** Intercambia dos filas. Es su propia inversa. */
export function swapRows(matriz, a, b) {
  if (a === b) return matriz;
  const filas = matriz.filas.map((f) => f.slice());
  const temporal = filas[a];
  filas[a] = filas[b];
  filas[b] = temporal;
  return new Matrix(filas);
}

/** k · F(indice), solo la fila. */
export function previewScaledRow(matriz, indice, k) {
  const factor = Fraction.parse(k);
  if (!factor) return null;
  return matriz.getRow(indice).map((valor) => valor.mul(factor));
}

/** F(indice) ← k · F(indice). Inversa: multiplicar por 1/k (k ≠ 0). */
export function scaleRow(matriz, indice, k) {
  const fila = previewScaledRow(matriz, indice, k);
  if (!fila) return matriz;
  return matriz.withRow(indice, fila);
}

/** F(destino) + k · F(origen), solo la fila. */
export function previewCombinedRow(matriz, origen, k, destino) {
  const escalada = previewScaledRow(matriz, origen, k);
  if (!escalada) return null;
  return matriz.getRow(destino).map((valor, i) => valor.add(escalada[i]));
}

/** F(destino) ← F(destino) + k · F(origen). Inversa: usar −k. */
export function combineRows(matriz, origen, k, destino) {
  const fila = previewCombinedRow(matriz, origen, k, destino);
  if (!fila) return matriz;
  return matriz.withRow(destino, fila);
}
