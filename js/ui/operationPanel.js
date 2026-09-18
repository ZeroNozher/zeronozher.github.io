/**
 * Panel de operaciones elementales.
 *
 * Tres bloques seleccionables. Al elegir uno, debajo del área de bloques
 * aparecen sus opciones y la vista previa de la fila resultante.
 *
 * El factor y la fila origen viven en un estado compartido: pasar de
 * "Obtener múltiplo" a "Operar entre filas" conserva lo que ya se cargó.
 */

import { NumberField } from './numberField.js';
import { crearSelectFila, crearSignoControl, crearVistaFila } from './controls.js';
import { previewScaledRow, previewCombinedRow } from '../core/rowOps.js';

export const RANGO_FACTOR = { min: -100, max: 100 };

export const OPERACIONES = [
  {
    id: 'intercambiar',
    nombre: 'Intercambiar filas',
    formula: 'Fi ↔ Fj',
    resumen: 'Dos filas cambian de lugar.',
  },
  {
    id: 'multiplo',
    nombre: 'Obtener múltiplo',
    formula: 'Fi ← k · Fi',
    resumen: 'Una fila se multiplica por un factor.',
  },
  {
    id: 'combinar',
    nombre: 'Operar entre filas',
    formula: 'Fj ← Fj + k · Fi',
    resumen: 'Un múltiplo de una fila se suma a otra.',
  },
];

export class OperationPanel {
  /**
   * @param {object}   opciones
   * @param {Function} opciones.getMatriz   () => Matrix sobre la que se opera
   * @param {Function} opciones.onAplicar   (descriptor) => void
   * @param {Function} [opciones.onFilasActivas] (number[]) => void
   */
  constructor({ getMatriz, onAplicar, onFilasActivas = null }) {
    this.getMatriz = getMatriz;
    this.onAplicar = onAplicar;
    this.onFilasActivas = onFilasActivas;

    this.estado = {
      operacion: null,
      intercambioA: 0,
      intercambioB: 1,
      filaOrigen: 0,
      filaDestino: 1,
      factor: '',
    };

    this.campoFactor = null;
  }

  /**
   * @param {HTMLElement} contenedor          donde van los bloques
   * @param {HTMLElement} [contenedorOpciones] donde van las opciones y el botón;
   *   si se omite, quedan debajo de los bloques.
   */
  mount(contenedor, contenedorOpciones = null) {
    const raiz = document.createElement('section');
    raiz.className = 'panel';

    const encabezado = document.createElement('header');
    encabezado.className = 'panel__encabezado';
    const titulo = document.createElement('h3');
    titulo.className = 'panel__titulo';
    titulo.textContent = 'Operación';
    encabezado.appendChild(titulo);
    raiz.appendChild(encabezado);

    const bloques = document.createElement('div');
    bloques.className = 'panel__bloques';
    this.bloques = new Map();

    OPERACIONES.forEach((operacion) => {
      const bloque = document.createElement('button');
      bloque.type = 'button';
      bloque.className = 'bloque';
      bloque.dataset.id = operacion.id;

      const nombre = document.createElement('span');
      nombre.className = 'bloque__nombre';
      nombre.textContent = operacion.nombre;

      const formula = document.createElement('span');
      formula.className = 'bloque__formula';
      formula.textContent = operacion.formula;

      const resumen = document.createElement('span');
      resumen.className = 'bloque__resumen';
      resumen.textContent = operacion.resumen;

      bloque.append(nombre, formula, resumen);
      bloque.addEventListener('click', () => this.elegirOperacion(operacion.id));

      bloques.appendChild(bloque);
      this.bloques.set(operacion.id, bloque);
    });

    raiz.appendChild(bloques);

    const destinoInferior = contenedorOpciones || raiz;

    const opciones = document.createElement('div');
    opciones.className = 'panel__opciones';
    destinoInferior.appendChild(opciones);

    const pie = document.createElement('footer');
    pie.className = 'panel__pie';

    const aplicar = document.createElement('button');
    aplicar.type = 'button';
    aplicar.className = 'boton boton--primario';
    aplicar.textContent = 'Aplicar operación';
    aplicar.disabled = true;
    aplicar.addEventListener('click', () => this.aplicar());
    pie.appendChild(aplicar);

    const nota = document.createElement('p');
    nota.className = 'panel__nota';
    nota.textContent = 'La operación cambia el resultado y no se deshace.';
    pie.appendChild(nota);

    destinoInferior.appendChild(pie);
    contenedor.appendChild(raiz);

    this.raiz = raiz;
    this.contenedorOpciones = opciones;
    this.botonAplicar = aplicar;

    this.renderOpciones();
    return raiz;
  }

  elegirOperacion(id) {
    this.estado.operacion = this.estado.operacion === id ? null : id;
    this.bloques.forEach((bloque, clave) => {
      bloque.classList.toggle('bloque--activo', clave === this.estado.operacion);
      bloque.setAttribute('aria-pressed', String(clave === this.estado.operacion));
    });
    this.renderOpciones();
  }

  /** Vuelve a dibujar las opciones y la vista previa desde el estado actual. */
  renderOpciones() {
    const contenedor = this.contenedorOpciones;
    contenedor.textContent = '';
    this.campoFactor = null;

    const { operacion } = this.estado;

    if (!operacion) {
      const vacio = document.createElement('p');
      vacio.className = 'panel__vacio';
      vacio.textContent = 'Elegí una operación para configurarla.';
      contenedor.appendChild(vacio);
      this.actualizarAplicar();
      this.marcarFilas();
      return;
    }

    if (operacion === 'intercambiar') this.renderIntercambio(contenedor);
    if (operacion === 'multiplo') this.renderMultiplo(contenedor);
    if (operacion === 'combinar') this.renderCombinacion(contenedor);

    this.actualizarAplicar();
    this.marcarFilas();
  }

  renderIntercambio(contenedor) {
    const matriz = this.getMatriz();
    const { intercambioA, intercambioB } = this.estado;

    const fila = document.createElement('div');
    fila.className = 'controles';

    fila.appendChild(
      crearSelectFila({
        etiqueta: 'Primera fila',
        orden: matriz.orden,
        valor: intercambioA,
        excluir: [intercambioB],
        onCambio: (valor) => {
          this.estado.intercambioA = valor;
          this.renderOpciones();
        },
      })
    );

    fila.appendChild(crearSignoControl('↔'));

    fila.appendChild(
      crearSelectFila({
        etiqueta: 'Segunda fila',
        orden: matriz.orden,
        valor: intercambioB,
        excluir: [intercambioA],
        onCambio: (valor) => {
          this.estado.intercambioB = valor;
          this.renderOpciones();
        },
      })
    );

    contenedor.appendChild(fila);
  }

  renderMultiplo(contenedor) {
    const matriz = this.getMatriz();
    const { filaOrigen, factor } = this.estado;

    const fila = document.createElement('div');
    fila.className = 'controles';

    fila.appendChild(
      crearSelectFila({
        etiqueta: 'Fila',
        orden: matriz.orden,
        valor: filaOrigen,
        onCambio: (valor) => {
          this.estado.filaOrigen = valor;
          if (this.estado.filaDestino === valor) {
            this.estado.filaDestino = (valor + 1) % matriz.orden;
          }
          this.renderOpciones();
        },
      })
    );

    fila.appendChild(crearSignoControl('×'));

    this.crearCampoFactor(fila);
    contenedor.appendChild(fila);

    const previa = previewScaledRow(matriz, filaOrigen, factor);
    contenedor.appendChild(crearVistaFila(`k · F${filaOrigen + 1}`, previa));
  }

  renderCombinacion(contenedor) {
    const matriz = this.getMatriz();
    const { filaOrigen, filaDestino, factor } = this.estado;

    if (filaDestino === filaOrigen) {
      this.estado.filaDestino = (filaOrigen + 1) % matriz.orden;
    }
    const destino = this.estado.filaDestino;

    const fila = document.createElement('div');
    fila.className = 'controles';

    fila.appendChild(
      crearSelectFila({
        etiqueta: 'Fila base',
        orden: matriz.orden,
        valor: filaOrigen,
        onCambio: (valor) => {
          this.estado.filaOrigen = valor;
          if (this.estado.filaDestino === valor) {
            this.estado.filaDestino = (valor + 1) % matriz.orden;
          }
          this.renderOpciones();
        },
      })
    );

    fila.appendChild(crearSignoControl('×'));

    this.crearCampoFactor(fila);

    fila.appendChild(crearSignoControl('se suma a'));

    fila.appendChild(
      crearSelectFila({
        etiqueta: 'Fila a modificar',
        orden: matriz.orden,
        valor: destino,
        excluir: [filaOrigen],
        onCambio: (valor) => {
          this.estado.filaDestino = valor;
          this.renderOpciones();
        },
      })
    );

    contenedor.appendChild(fila);

    const escalada = previewScaledRow(matriz, filaOrigen, factor);
    contenedor.appendChild(crearVistaFila(`k · F${filaOrigen + 1}`, escalada));

    const combinada = previewCombinedRow(matriz, filaOrigen, factor, destino);
    contenedor.appendChild(
      crearVistaFila(`F${destino + 1} + k · F${filaOrigen + 1}`, combinada)
    );
  }

  /**
   * El factor es el mismo objeto de estado para múltiplo y combinación.
   * Se monta directo en `contenedor` (la fila de controles): un wrapper
   * intermedio rompería el `display: contents` que alinea las tres filas
   * de la grilla.
   */
  crearCampoFactor(contenedor) {
    this.campoFactor = new NumberField({
      modo: 'racional',
      min: RANGO_FACTOR.min,
      max: RANGO_FACTOR.max,
      etiqueta: 'Factor k',
      placeholder: 'ej. -1/2',
      onCambio: () => {
        this.estado.factor = this.campoFactor.value;
        this.refrescarPrevia();
      },
    });

    this.campoFactor.mount(contenedor);
    this.campoFactor.value = this.estado.factor;
  }

  /** Redibuja solo las vistas previas, para no perder el foco del input. */
  refrescarPrevia() {
    const matriz = this.getMatriz();
    const { operacion, filaOrigen, filaDestino, factor } = this.estado;
    const vistas = this.contenedorOpciones.querySelectorAll('.vista-fila');
    if (!vistas.length) return;

    const reemplazar = (nodo, titulo, valores) => {
      const nueva = crearVistaFila(titulo, valores);
      nodo.replaceWith(nueva);
    };

    if (operacion === 'multiplo') {
      reemplazar(
        vistas[0],
        `k · F${filaOrigen + 1}`,
        previewScaledRow(matriz, filaOrigen, factor)
      );
    }

    if (operacion === 'combinar') {
      reemplazar(
        vistas[0],
        `k · F${filaOrigen + 1}`,
        previewScaledRow(matriz, filaOrigen, factor)
      );
      reemplazar(
        vistas[1],
        `F${filaDestino + 1} + k · F${filaOrigen + 1}`,
        previewCombinedRow(matriz, filaOrigen, factor, filaDestino)
      );
    }

    this.actualizarAplicar();
  }

  /** Redibuja las previas cuando cambió la matriz de resultado. */
  sincronizar() {
    this.refrescarPrevia();
    this.marcarFilas();
  }

  get descriptor() {
    const { operacion, intercambioA, intercambioB, filaOrigen, filaDestino } = this.estado;
    const factor = this.campoFactor ? this.campoFactor.fraccion : null;

    if (operacion === 'intercambiar') {
      return { tipo: 'intercambiar', a: intercambioA, b: intercambioB };
    }
    if (operacion === 'multiplo' && factor) {
      return { tipo: 'multiplo', fila: filaOrigen, factor };
    }
    if (operacion === 'combinar' && factor) {
      return { tipo: 'combinar', origen: filaOrigen, destino: filaDestino, factor };
    }
    return null;
  }

  actualizarAplicar() {
    this.botonAplicar.disabled = this.descriptor === null;
  }

  marcarFilas() {
    if (!this.onFilasActivas) return;
    const { operacion, intercambioA, intercambioB, filaOrigen, filaDestino } = this.estado;
    if (operacion === 'intercambiar') this.onFilasActivas([intercambioA, intercambioB]);
    else if (operacion === 'multiplo') this.onFilasActivas([filaOrigen]);
    else if (operacion === 'combinar') this.onFilasActivas([filaOrigen, filaDestino]);
    else this.onFilasActivas([]);
  }

  aplicar() {
    const descriptor = this.descriptor;
    if (!descriptor) return;
    this.onAplicar(descriptor);
  }
}
