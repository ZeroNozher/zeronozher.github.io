/**
 * Módulo 1 — Operaciones elementales (unarias).
 *
 * Una matriz de entrada editable, el panel de operaciones en el medio y
 * la matriz resultado a la derecha. Editar la entrada o sortear valores
 * reinicia el resultado; a partir de ahí las operaciones se encadenan
 * sobre el resultado.
 */

import { Matrix } from '../core/matrix.js';
import { matrizAlAzar } from '../core/random.js';
import { swapRows, scaleRow, combineRows } from '../core/rowOps.js';
import { MatrixView } from '../ui/matrixView.js';
import { CellEditor } from '../ui/cellEditor.js';
import { OperationPanel } from '../ui/operationPanel.js';

const ORDEN = 3;

export const elementaryOpsModule = {
  id: 'elementales',
  nombre: 'Operaciones elementales',
  descripcion: 'Una matriz entra, una operación de fila la transforma.',

  mount(contenedor) {
    const estado = {
      entrada: Matrix.zeros(ORDEN),
      resultado: Matrix.zeros(ORDEN),
    };

    const banco = document.createElement('div');
    banco.className = 'banco';

    const celdaEntrada = crearCelda(banco, 'banco__entrada');
    const celdaPanel = crearCelda(banco, 'banco__panel');
    const celdaResultado = crearCelda(banco, 'banco__resultado');
    const celdaOpciones = crearCelda(banco, 'banco__opciones');
    const celdaAyuda = crearCelda(banco, 'banco__ayuda');

    // --- Matriz de entrada -------------------------------------------------
    const vistaEntrada = new MatrixView({
      titulo: 'Entrada',
      subtitulo: 'Tocá una celda para cambiar su valor',
      editable: true,
      onSeleccion: (fila, columna) => {
        editor.abrir(fila, columna, estado.entrada.get(fila, columna).toString());
      },
    });
    vistaEntrada.mount(celdaEntrada, estado.entrada);

    const herramientas = document.createElement('div');
    herramientas.className = 'herramientas';

    const botonAzar = document.createElement('button');
    botonAzar.type = 'button';
    botonAzar.className = 'boton';
    botonAzar.textContent = 'Sortear valores';
    botonAzar.addEventListener('click', () => reiniciar(matrizAlAzar(ORDEN)));
    herramientas.appendChild(botonAzar);

    const botonVaciar = document.createElement('button');
    botonVaciar.type = 'button';
    botonVaciar.className = 'boton';
    botonVaciar.textContent = 'Poner en cero';
    botonVaciar.addEventListener('click', () => reiniciar(Matrix.zeros(ORDEN)));
    herramientas.appendChild(botonVaciar);

    celdaEntrada.appendChild(herramientas);

    const celdaEditor = document.createElement('div');
    celdaEditor.className = 'banco__editor';
    celdaEntrada.appendChild(celdaEditor);

    // --- Editor de celda ---------------------------------------------------
    const editor = new CellEditor({
      onConfirmar: (fila, columna, valor) => {
        estado.entrada = estado.entrada.withValue(fila, columna, valor);
        vistaEntrada.setMatriz(estado.entrada);
        vistaEntrada.limpiarSeleccion();
        sincronizarResultado();
      },
      onCancelar: () => vistaEntrada.limpiarSeleccion(),
    });
    editor.mount(celdaEditor);

    // --- Matriz resultado --------------------------------------------------
    const vistaResultado = new MatrixView({
      titulo: 'Resultado',
      subtitulo: 'Cada operación se aplica acá',
    });
    vistaResultado.mount(celdaResultado, estado.resultado);

    // --- Panel de operaciones ----------------------------------------------
    const panel = new OperationPanel({
      getMatriz: () => estado.resultado,
      onAplicar: (descriptor) => aplicar(descriptor),
      onFilasActivas: (filas) => vistaResultado.destacarFilas(filas),
    });
    panel.mount(celdaPanel, celdaOpciones);

    const ayuda = document.createElement('p');
    ayuda.className = 'banco__ayuda-texto';
    ayuda.textContent =
      'Para volver atrás aplicá la operación inversa: dividí por el mismo factor, ' +
      'sumá el factor opuesto, o repetí el intercambio.';
    celdaAyuda.appendChild(ayuda);

    contenedor.appendChild(banco);

    // --- Lógica ------------------------------------------------------------
    function reiniciar(matriz) {
      estado.entrada = matriz;
      vistaEntrada.setMatriz(estado.entrada);
      vistaEntrada.limpiarSeleccion();
      editor.cerrar();
      sincronizarResultado();
    }

    function sincronizarResultado() {
      estado.resultado = estado.entrada.clone();
      vistaResultado.setMatriz(estado.resultado);
      panel.sincronizar();
    }

    function aplicar(descriptor) {
      const matriz = estado.resultado;

      if (descriptor.tipo === 'intercambiar') {
        estado.resultado = swapRows(matriz, descriptor.a, descriptor.b);
      } else if (descriptor.tipo === 'multiplo') {
        estado.resultado = scaleRow(matriz, descriptor.fila, descriptor.factor);
      } else if (descriptor.tipo === 'combinar') {
        estado.resultado = combineRows(
          matriz,
          descriptor.origen,
          descriptor.factor,
          descriptor.destino
        );
      }

      vistaResultado.setMatriz(estado.resultado);
      panel.sincronizar();
    }

    reiniciar(matrizAlAzar(ORDEN));
  },
};

function crearCelda(padre, clase) {
  const celda = document.createElement('div');
  celda.className = clase;
  padre.appendChild(celda);
  return celda;
}
