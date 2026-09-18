/**
 * Generación de valores al azar.
 *
 * El rango de la matriz aleatoria es más chico que el rango editable a
 * propósito: números de dos dígitos se leen mejor en pantalla y escalonar
 * a mano con ellos es más realista para practicar.
 */

import { Matrix } from './matrix.js';

export const RANGO_ALEATORIO = { min: -9, max: 9 };

export function enteroAlAzar(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function matrizAlAzar(orden, rango = RANGO_ALEATORIO) {
  const valores = Array.from({ length: orden }, () =>
    Array.from({ length: orden }, () => enteroAlAzar(rango.min, rango.max))
  );
  return Matrix.of(valores);
}
