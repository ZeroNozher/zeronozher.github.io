/**
 * Controles chicos que comparten el panel de operaciones y, más adelante,
 * cualquier otro módulo: selects de fila y la tira de vista previa.
 */

/**
 * Select de filas.
 * @param {object}   opciones
 * @param {string}   opciones.etiqueta
 * @param {number}   opciones.orden      cantidad de filas
 * @param {number}   opciones.valor      índice elegido
 * @param {number[]} [opciones.excluir]  índices que no deben ofrecerse
 * @param {Function} opciones.onCambio   (indice) => void
 */
export function crearSelectFila({ etiqueta, orden, valor, excluir = [], onCambio }) {
  const raiz = document.createElement('div');
  raiz.className = 'campo campo--select';

  const rotulo = document.createElement('label');
  rotulo.className = 'campo__etiqueta';
  rotulo.textContent = etiqueta;
  raiz.appendChild(rotulo);

  const select = document.createElement('select');
  select.className = 'campo__select';

  for (let i = 0; i < orden; i += 1) {
    if (excluir.includes(i)) continue;
    const opcion = document.createElement('option');
    opcion.value = String(i);
    opcion.textContent = `F${i + 1}`;
    if (i === valor) opcion.selected = true;
    select.appendChild(opcion);
  }

  select.addEventListener('change', () => onCambio(Number(select.value)));

  rotulo.htmlFor = select.id = `select-${Math.random().toString(36).slice(2, 8)}`;
  raiz.appendChild(select);

  // Aviso vacío: el campo numérico tiene uno, y hacen falta las mismas tres
  // partes para que etiquetas y controles alineen en la fila de controles.
  const aviso = document.createElement('p');
  aviso.className = 'campo__aviso';
  raiz.appendChild(aviso);

  return raiz;
}

/**
 * Signo entre dos controles ("×", "se suma a", "↔").
 *
 * Se arma con las mismas tres partes que un campo —etiqueta, contenido,
 * aviso— aunque dos estén vacías. Es lo que hace que caiga exactamente en
 * la fila del medio de la grilla de controles, sin posicionarlo a mano.
 */
export function crearSignoControl(texto) {
  const raiz = document.createElement('div');
  raiz.className = 'campo campo--signo';

  const arriba = document.createElement('span');
  arriba.className = 'campo__etiqueta';

  const signo = document.createElement('span');
  signo.className = 'controles__signo';
  signo.textContent = texto;

  const abajo = document.createElement('p');
  abajo.className = 'campo__aviso';

  raiz.append(arriba, signo, abajo);
  return raiz;
}

/**
 * Tira horizontal con los valores de una fila.
 * @param {string} titulo
 * @param {import('../core/fraction.js').Fraction[]|null} valores
 */
export function crearVistaFila(titulo, valores) {
  const raiz = document.createElement('div');
  raiz.className = 'vista-fila';

  const rotulo = document.createElement('p');
  rotulo.className = 'vista-fila__titulo';
  rotulo.textContent = titulo;
  raiz.appendChild(rotulo);

  const tira = document.createElement('div');
  tira.className = 'vista-fila__valores';

  if (!valores) {
    tira.classList.add('vista-fila__valores--vacia');
    tira.textContent = 'Falta el factor';
  } else {
    valores.forEach((valor) => {
      const celda = document.createElement('span');
      celda.className = 'vista-fila__valor';
      celda.textContent = valor.toString();
      tira.appendChild(celda);
    });
  }

  raiz.appendChild(tira);
  return raiz;
}
