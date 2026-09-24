/**
 * Aritmética racional exacta.
 *
 * Todas las celdas de una matriz guardan una Fraction, no un número.
 * Así 1/3 sigue siendo 1/3 después de veinte operaciones, que es lo que
 * hace falta para escalonar sin arrastrar error de punto flotante.
 *
 * Las instancias son inmutables: cada operación devuelve una Fraction nueva.
 */

const MAX_DECIMALES = 9;

function mcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const resto = a % b;
    a = b;
    b = resto;
  }
  return a || 1;
}

export class Fraction {
  /**
   * @param {number} numerador   entero
   * @param {number} denominador entero distinto de 0
   */
  constructor(numerador, denominador = 1) {
    if (denominador === 0) {
      throw new Error('Denominador cero');
    }
    let n = numerador;
    let d = denominador;

    if (d < 0) {
      n = -n;
      d = -d;
    }

    const g = mcd(n, d);
    this.n = n / g;
    this.d = d / g;
    Object.freeze(this);
  }

  /** Convierte un número decimal finito en fracción exacta. */
  static fromNumber(valor) {
    if (!Number.isFinite(valor)) {
      throw new Error('Valor no finito');
    }
    if (Number.isInteger(valor)) {
      return new Fraction(valor, 1);
    }
    const decimales = Math.min((String(valor).split('.')[1] || '').length, MAX_DECIMALES);
    const factor = Math.pow(10, decimales);
    return new Fraction(Math.round(valor * factor), factor);
  }

  /**
   * Interpreta texto del usuario: "3", "-2", "1.5", "1,5", "3/4", "-3/4".
   * @returns {Fraction|null} null si el texto no es un número válido.
   */
  static parse(entrada) {
    if (entrada instanceof Fraction) return entrada;
    if (typeof entrada === 'number') return Fraction.fromNumber(entrada);

    const texto = String(entrada).trim().replace(',', '.');
    if (!texto) return null;

    const DECIMAL = /^-?(?:\d+\.?\d*|\.\d+)$/;
    const RACIONAL = /^-?(?:\d+\.?\d*|\.\d+)\s*\/\s*-?(?:\d+\.?\d*|\.\d+)$/;

    if (RACIONAL.test(texto)) {
      const [arriba, abajo] = texto.split('/').map((parte) => Number(parte.trim()));
      if (!Number.isFinite(arriba) || !Number.isFinite(abajo) || abajo === 0) return null;
      return Fraction.fromNumber(arriba).div(Fraction.fromNumber(abajo));
    }

    if (DECIMAL.test(texto)) {
      return Fraction.fromNumber(Number(texto));
    }

    return null;
  }

  add(otra) {
    return new Fraction(this.n * otra.d + otra.n * this.d, this.d * otra.d);
  }

  sub(otra) {
    return this.add(otra.neg());
  }

  mul(otra) {
    return new Fraction(this.n * otra.n, this.d * otra.d);
  }

  div(otra) {
    if (otra.n === 0) throw new Error('División por cero');
    return new Fraction(this.n * otra.d, this.d * otra.n);
  }

  neg() {
    return new Fraction(-this.n, this.d);
  }

  equals(otra) {
    return this.n === otra.n && this.d === otra.d;
  }

  isZero() {
    return this.n === 0;
  }

  isOne() {
    return this.n === 1 && this.d === 1;
  }

  toNumber() {
    return this.n / this.d;
  }

  /** "3", "-2", "3/4". */
  toString() {
    return this.d === 1 ? String(this.n) : `${this.n}/${this.d}`;
  }
}

export const CERO = new Fraction(0);
export const UNO = new Fraction(1);
