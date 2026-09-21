import { Matrix } from '../core/matrix.js';
import { matrizAlAzar } from '../core/random.js';
import {
  OPERACIONES_BINARIAS,
  buscarOperacion,
  explicarBinaria,
} from '../core/matrixOps.js';
import { MatrixView } from '../ui/matrixView.js';
import { ProcedureView } from '../ui/procedureView.js';

const ORDEN = 3;

const MINIMO_CARACTERES = { ninguna: 6, suma: 8, resta: 8, producto: 8 };
const ICONOS_OPERACION = { suma: '+', resta: '−', producto: '×' };

export const binaryOpsModule = {
  id: 'binarias',
  nombre: 'Suma, resta y producto',
  descripcion: 'Dos matrices entran, una sale.',

  mount(contenedor) {
    const estado = { a: Matrix.zeros(ORDEN), b: Matrix.zeros(ORDEN), operacion: null };

    const banco = document.createElement('div');
    banco.className = 'banco-binario';

    const celdaA = crearCelda(banco, 'banco-binario__a');
    const celdaB = crearCelda(banco, 'banco-binario__b');
    const celdaProcedimiento = crearCelda(banco, 'banco-binario__procedimiento');

    const vistaA = new MatrixView({
      titulo: 'Matriz A',
      subtitulo: 'Tocá una celda para cambiar su valor',
      editable: true,
      variante: 'a',
      controles: crearHerramientas('a'),
      onCambio: (fila, columna, valor) => guardar('a', fila, columna, valor),
      onEmpezarEdicion: () => vistaB.cancelarEdicion(),
    });
    vistaA.mount(celdaA, estado.a);

    const vistaB = new MatrixView({
      titulo: 'Matriz B',
      subtitulo: 'Tocá una celda para cambiar su valor',
      editable: true,
      variante: 'b',
      controles: crearHerramientas('b'),
      onCambio: (fila, columna, valor) => guardar('b', fila, columna, valor),
      onEmpezarEdicion: () => vistaA.cancelarEdicion(),
    });
    vistaB.mount(celdaB, estado.b);

    const vistas = { a: vistaA, b: vistaB };

    // --- Selector de operación: va en la cabecera de Procedimiento ---------
    const selector = document.createElement('div');
    selector.className = 'selector-operacion';
    selector.setAttribute('role', 'group');
    selector.setAttribute('aria-label', 'Operación');

    const botonesOperacion = new Map();

    OPERACIONES_BINARIAS.forEach((operacion) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'boton boton-operador';
      boton.textContent = ICONOS_OPERACION[operacion.id];
      boton.setAttribute('aria-label', operacion.nombre);
      boton.setAttribute('aria-pressed', 'false');
      boton.title = operacion.nombre;
      boton.addEventListener('click', () => elegirOperacion(operacion.id));
      selector.appendChild(boton);
      botonesOperacion.set(operacion.id, boton);
    });

    // --- Procedimiento -----------------------------------------------------
    const vistaProcedimiento = new ProcedureView({
      titulo: 'Procedimiento',
      subtitulo: 'La cuenta detrás de cada celda del resultado',
      controles: selector,
    });
    vistaProcedimiento.mount(celdaProcedimiento, ORDEN, ORDEN);

    contenedor.appendChild(banco);

    // --- Lógica --------------------------------------------------------------
    function crearHerramientas(clave) {
      const herramientas = document.createElement('div');
      herramientas.className = 'herramientas';

      const azar = document.createElement('button');
      azar.type = 'button';
      azar.className = 'boton';
      azar.textContent = '🎲';
      azar.setAttribute('aria-label', 'Sortear valores');
      azar.title = 'Sortear valores';
      azar.addEventListener('click', () => reiniciar(clave, matrizAlAzar(ORDEN)));

      const cero = document.createElement('button');
      cero.type = 'button';
      cero.className = 'boton';
      cero.textContent = '🔄';
      cero.setAttribute('aria-label', 'Poner en cero');
      cero.title = 'Poner en cero';
      cero.addEventListener('click', () => reiniciar(clave, Matrix.zeros(ORDEN)));

      herramientas.append(azar, cero);
      return herramientas;
    }

    function elegirOperacion(id) {
      estado.operacion = estado.operacion === id ? null : id;
      botonesOperacion.forEach((boton, clave) => {
        const activo = clave === estado.operacion;
        boton.classList.toggle('boton-operador--activo', activo);
        boton.setAttribute('aria-pressed', String(activo));
      });
      recalcular();
    }

    function guardar(clave, fila, columna, valor) {
      estado[clave] = estado[clave].withValue(fila, columna, valor);
      vistas[clave].setMatriz(estado[clave]);
      recalcular();
    }

    function reiniciar(clave, matriz) {
      estado[clave] = matriz;
      vistas[clave].setMatriz(matriz);
      vistas[clave].cancelarEdicion();
      recalcular();
    }

    function recalcular() {
      const { operacion, a, b } = estado;

      const definicion = buscarOperacion(operacion);
      if (definicion) {
        vistaProcedimiento.setAnchoMinimo(MINIMO_CARACTERES[definicion.id]);
        vistaProcedimiento.setSubtitulo(definicion.formula);
        vistaProcedimiento.setVariante('r');
      } else {
        vistaProcedimiento.setAnchoMinimo(MINIMO_CARACTERES.ninguna);
        vistaProcedimiento.setSubtitulo('Sin operación, el resultado es A sin tocar');
        vistaProcedimiento.setVariante('a'); // P toma el color de A cuando no hay operación
      }
      vistaProcedimiento.setFilas(explicarBinaria(operacion, a, b));
    }

    reiniciar('a', Matrix.zeros(ORDEN));
    reiniciar('b', Matrix.zeros(ORDEN));
  },
};

function crearCelda(padre, clase) {
  const celda = document.createElement('div');
  celda.className = clase;
  padre.appendChild(celda);
  return celda;
}