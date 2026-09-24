/**
 * Publicación/suscripción mínima.
 *
 * Los componentes de UI no se llaman entre sí: emiten y escuchan.
 * Agregar un componente nuevo no obliga a tocar los existentes.
 */

export class Emitter {
  constructor() {
    this.oyentes = new Map();
  }

  /** @returns {() => void} función para desuscribirse */
  on(evento, callback) {
    if (!this.oyentes.has(evento)) {
      this.oyentes.set(evento, new Set());
    }
    this.oyentes.get(evento).add(callback);
    return () => this.off(evento, callback);
  }

  off(evento, callback) {
    const grupo = this.oyentes.get(evento);
    if (grupo) grupo.delete(callback);
  }

  emit(evento, datos) {
    const grupo = this.oyentes.get(evento);
    if (!grupo) return;
    grupo.forEach((callback) => callback(datos));
  }
}
