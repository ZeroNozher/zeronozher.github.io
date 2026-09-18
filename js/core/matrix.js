/**
 * Matriz inmutable de Fractions.
 *
 * Ninguna operación modifica la instancia: todas devuelven una matriz nueva.
 * Eso deja la puerta abierta a un historial o a un "deshacer" más adelante
 * sin tocar esta capa.
 */

import { Fraction, CERO } from './fraction.js';

export class Matrix {
  /** @param {Fraction[][]} filas */
  constructor(filas) {
    this.filas = filas.map((fila) => fila.slice());
    Object.freeze(this.filas);
  }

  /** Acepta números, strings o Fractions. */
  static of(valores) {
    return new Matrix(
      valores.map((fila) =>
        fila.map((valor) => {
          const f = Fraction.parse(valor);
          if (!f) throw new Error(`Valor inválido: ${valor}`);
          return f;
        })
      )
    );
  }

  static zeros(orden) {
    return new Matrix(
      Array.from({ length: orden }, () => Array.from({ length: orden }, () => CERO))
    );
  }

  get orden() {
    return this.filas.length;
  }

  get columnas() {
    return this.filas[0] ? this.filas[0].length : 0;
  }

  get(fila, columna) {
    return this.filas[fila][columna];
  }

  getRow(indice) {
    return this.filas[indice].slice();
  }

  /** Copia con una celda cambiada. */
  withValue(fila, columna, valor) {
    const copia = this.filas.map((f) => f.slice());
    copia[fila][columna] = Fraction.parse(valor);
    return new Matrix(copia);
  }

  /** Copia con una fila entera cambiada. */
  withRow(indice, valores) {
    const copia = this.filas.map((f) => f.slice());
    copia[indice] = valores.slice();
    return new Matrix(copia);
  }

  clone() {
    return new Matrix(this.filas);
  }

  /** Representación plana, útil para comparar o serializar. */
  toStrings() {
    return this.filas.map((fila) => fila.map((valor) => valor.toString()));
  }
}
