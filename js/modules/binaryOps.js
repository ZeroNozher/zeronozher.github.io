/**
 * Módulo 2 — Operaciones binarias.
 *
 * A, una operación, B, y el resultado. Sin botón de aplicar: elegir la
 * operación o editar cualquier celda recalcula todo en el acto.
 *
 * Debajo, la matriz P muestra la cuenta de cada celda. Es la parte que
 * hace que esto sirva para estudiar y no solo para obtener un número.
 */

import { Matrix } from '../core/matrix.js';
import { matrizAlAzar } from '../core/random.js';
import {
  OPERACIONES_BINARIAS,
  buscarOperacion,
  aplicarBinaria,
  explicarBinaria,
} from '../core/matrixOps.js';
import { MatrixView } from '../ui/matrixView.js';
import { ProcedureView } from '../ui/procedureView.js';
import { CellEditor } from '../ui/cellEditor.js';

const ORDEN = 3;

/** Piso de ancho del procedimiento, en caracteres, según cuántos términos entran. */
const MINIMO_CARACTERES = {
  ninguna: 6,
  suma: 8,
  resta: 8,
  producto: 8,
};

export const binaryOpsModule = {
  id: 'binarias',
  nombre: 'Suma, resta y producto',
  descripcion: 'Dos matrices entran, una sale.',

  mount(contenedor) {
    const estado = {
      a: Matrix.zeros(ORDEN),
      b: Matrix.zeros(ORDEN),
      operacion: null,
    };

    const banco = document.createElement('div');
    banco.className = 'banco-binario';

    const celdaA = crearCelda(banco, 'banco-binario__a');
    const celdaOperacion = crearCelda(banco, 'banco-binario__operacion');
    const celdaB = crearCelda(banco, 'banco-binario__b');
    const celdaR = crearCelda(banco, 'banco-binario__r');
    const celdaProcedimiento = crearCelda(banco, 'banco-binario__procedimiento');

    // --- Matrices A y B ----------------------------------------------------
    const vistaA = new MatrixView({
      titulo: 'Matriz A',
      subtitulo: 'Tocá una celda para cambiar su valor',
      editable: true,
      variante: 'a',
      onSeleccion: (fila, columna) => abrirEditor('a', fila, columna),
    });
    vistaA.mount(celdaA, estado.a);
    celdaA.appendChild(crearHerramientas('a'));

    const vistaB = new MatrixView({
      titulo: 'Matriz B',
      subtitulo: 'Tocá una celda para cambiar su valor',
      editable: true,
      variante: 'b',
      onSeleccion: (fila, columna) => abrirEditor('b', fila, columna),
    });
    vistaB.mount(celdaB, estado.b);
    celdaB.appendChild(crearHerramientas('b'));

    // --- Matriz resultado --------------------------------------------------
    const vistaR = new MatrixView({
      titulo: 'Resultado',
      subtitulo: 'Se recalcula solo',
      variante: 'r',
    });
    vistaR.mount(celdaR, estado.a);

    // --- Editor ------------------------------------------------------------
    // Uno solo para las dos matrices: el prefijo dice cuál se está editando,
    // así que no hace falta un campo por matriz.
    let enEdicion = null;

    const editor = new CellEditor({
      onConfirmar: (fila, columna, valor) => guardar(enEdicion, fila, columna, valor),
      onCancelar: () => cerrarEdicion(),
    });

    const vistas = { a: vistaA, b: vistaB };

    // --- Selector de operación ---------------------------------------------
    const panel = document.createElement('section');
    panel.className = 'panel panel--angosto';

    const tituloPanel = document.createElement('h3');
    tituloPanel.className = 'panel__titulo';
    tituloPanel.textContent = 'Operación';
    panel.appendChild(tituloPanel);

    const select = document.createElement('select');
    select.className = 'campo__select campo__select--operacion';

    const sinElegir = document.createElement('option');
    sinElegir.value = '';
    sinElegir.textContent = 'Seleccionar operación';
    select.appendChild(sinElegir);

    OPERACIONES_BINARIAS.forEach((operacion) => {
      const opcion = document.createElement('option');
      opcion.value = operacion.id;
      opcion.textContent = operacion.nombre;
      select.appendChild(opcion);
    });

    select.addEventListener('change', () => {
      estado.operacion = select.value || null;
      recalcular();
    });

    panel.appendChild(select);

    const notaPanel = document.createElement('p');
    notaPanel.className = 'panel__nota';
    notaPanel.textContent = 'Sin operación elegida, el resultado es A sin tocar.';
    panel.appendChild(notaPanel);

    celdaOperacion.appendChild(panel);
    editor.mount(celdaOperacion);

    // --- Procedimiento -----------------------------------------------------
    const vistaProcedimiento = new ProcedureView({
      titulo: 'Procedimiento',
      subtitulo: 'La cuenta detrás de cada celda del resultado',
    });
    vistaProcedimiento.mount(celdaProcedimiento, ORDEN, ORDEN);

    contenedor.appendChild(banco);

    // --- Lógica ------------------------------------------------------------
    function crearHerramientas(clave) {
      const herramientas = document.createElement('div');
      herramientas.className = 'herramientas';

      const azar = document.createElement('button');
      azar.type = 'button';
      azar.className = 'boton';
      azar.textContent = 'Sortear valores';
      azar.addEventListener('click', () => reiniciar(clave, matrizAlAzar(ORDEN)));

      const cero = document.createElement('button');
      cero.type = 'button';
      cero.className = 'boton';
      cero.textContent = 'Poner en cero';
      cero.addEventListener('click', () => reiniciar(clave, Matrix.zeros(ORDEN)));

      herramientas.append(azar, cero);
      return herramientas;
    }

    /** Solo una celda en edición a la vez, sin importar de qué matriz sea. */
    function abrirEditor(clave, fila, columna) {
      const otra = clave === 'a' ? 'b' : 'a';
      vistas[otra].limpiarSeleccion();
      enEdicion = clave;
      editor.prefijo = clave === 'a' ? 'Matriz A' : 'Matriz B';
      editor.abrir(fila, columna, estado[clave].get(fila, columna).toString());
    }

    function cerrarEdicion() {
      editor.cerrar();
      vistaA.limpiarSeleccion();
      vistaB.limpiarSeleccion();
      enEdicion = null;
    }

    function guardar(clave, fila, columna, valor) {
      estado[clave] = estado[clave].withValue(fila, columna, valor);
      vistas[clave].setMatriz(estado[clave]);
      cerrarEdicion();
      recalcular();
    }

    function reiniciar(clave, matriz) {
      estado[clave] = matriz;
      vistas[clave].setMatriz(matriz);
      cerrarEdicion();
      recalcular();
    }

    function recalcular() {
      const { operacion, a, b } = estado;

      vistaR.setMatriz(aplicarBinaria(operacion, a, b));

      const definicion = buscarOperacion(operacion);
      if (definicion) {
        vistaProcedimiento.setAnchoMinimo(MINIMO_CARACTERES[definicion.id]);
        vistaProcedimiento.setSubtitulo(definicion.formula);
        vistaProcedimiento.setVariante('r');
      } else {
        vistaProcedimiento.setAnchoMinimo(MINIMO_CARACTERES.ninguna);
        vistaProcedimiento.setSubtitulo('Sin operación, el resultado es A sin tocar');
        vistaProcedimiento.setVariante('a');
      }
      vistaProcedimiento.setFilas(explicarBinaria(operacion, a, b));
    }

    reiniciar('a', matrizAlAzar(ORDEN));
    reiniciar('b', matrizAlAzar(ORDEN));
  },
};

function crearCelda(padre, clase) {
  const celda = document.createElement('div');
  celda.className = clase;
  padre.appendChild(celda);
  return celda;
}
