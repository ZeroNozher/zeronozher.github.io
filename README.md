# Banco de matrices

Herramientas separadas por pestañas para practicar álgebra lineal. La primera
cubre las operaciones elementales de fila sobre una matriz 3×3.

## Cómo abrirlo

Usa módulos ES, así que necesita servirse por HTTP (con `file://` el navegador
bloquea los `import`). Cualquiera de estas sirve:

```bash
python3 -m http.server 8000
npx serve .
```

O el botón de Live Server en VS Code.

## Subirlo a GitHub Pages

Todas las rutas de `index.html` son relativas (`css/tokens.css`,
`js/main.js`, no `/css/...`), así que funciona tanto en
`usuario.github.io` como en `usuario.github.io/nombre-del-repo`. El archivo
`.nojekyll` en la raíz evita que GitHub procese la carpeta con Jekyll antes
de servirla — sin él, algunas cosas se sirven raro (no debería hacer falta
para este proyecto, pero es la convención estándar y sale gratis).

1. Subí esta carpeta a un repositorio.
2. Configuración del repo → Pages → Deploy from a branch → elegí la rama y
   la carpeta (`/` si esta carpeta es la raíz del repo, `/docs` si la
   copiaste ahí).
3. GitHub tarda uno o dos minutos en publicar la primera vez.

## Responsive

Dos mecanismos separados, cada uno para lo que el otro no puede hacer:

- **Tamaños fluidos (`clamp()` en `tokens.css`)** — tipografía, espaciado y
  el tamaño de celda escalan solos con el ancho de pantalla, sin
  breakpoints. Cada `clamp()` está calibrado con la fórmula estándar de
  tipografía fluida (mínimo en 320px de viewport, máximo en 1024px), no a
  ojo: `pendiente = (máx − mín) / (1024 − 320)`. Por eso una matriz de 3×3
  entra con margen incluso en un iPhone SE (320px) sin que haga falta
  ningún breakpoint para ella.
- **Media queries (`layout.css`, `components.css`)** — para lo que
  `clamp()` no puede expresar: reordenar una grilla, apilar columnas,
  ocultar un texto. Tres niveles:
  1. **~1020px / ~1150px** — las dos grillas de tres y cuatro columnas se
     apilan en una sola, en el orden en que se usan: primero lo que se
     edita, después la operación, al final el resultado. El umbral de
     cada una sale de sumar el ancho mínimo real de sus columnas (ver el
     comentario en `layout.css`), no es un número de manual de estilo.
  2. **640px** — la fila de controles de "Operar entre filas" deja de
     entrar en una línea; pasa a un formulario vertical normal en vez de
     apretarse. Los bloques de operación pasan a una columna por el mismo
     motivo.
  3. **400px** — se oculta texto de apoyo (la bajada de la cabecera, el
     resumen de cada operación, la nota de cómo revertir). Nada de lo que
     se oculta ahí hace falta para editar una matriz, elegir una
     operación o leer el resultado — el criterio fue no tocar nada
     "útil", solo lo decorativo.

  Hay un salvavidas aparte para la matriz de procedimiento: si un producto
  con números de tres dígitos genera una cuenta demasiado larga incluso
  con la letra más chica, esa matriz puntual scrollea horizontalmente en
  vez de forzar el scroll de toda la página.

## Estructura

```
.nojekyll
index.html
css/
  tokens.css        variables de color, tipografía y medidas
  layout.css        base, cabecera, pestañas, grilla del banco
  components.css    matriz, celdas, campos, bloques, botones
js/
  main.js           registra qué módulos existen
  core/             lógica pura, sin DOM
    fraction.js     aritmética racional exacta
    matrix.js       matriz inmutable de Fractions
    rowOps.js       intercambiar, escalar, combinar filas
    matrixOps.js    suma, resta, producto y sus cuentas explicadas
    random.js       matrices al azar
    emitter.js      pub/sub mínimo
  ui/               componentes reutilizables
    matrixView.js   dibuja una matriz, anima los valores que cambian
    procedureView.js  grilla de cuentas escritas, celdas anchas
    numberField.js  input con filtrado de caracteres y rango
    cellEditor.js   editor temporal de celda
    controls.js     selects de fila y vista previa
    operationPanel.js  bloques de operación y sus opciones
    tabs.js         pestañas con montaje perezoso
  modules/          una herramienta por archivo
    elementaryOps.js
    binaryOps.js
```

La regla que sostiene todo: `core/` no sabe que existe el DOM y `ui/` no sabe
qué herramienta lo está usando. Los módulos son los únicos que conocen ambos.

## Por qué fracciones y no números

Escalonar con punto flotante convierte `1/3` en `0.3333333333333333` y a los
tres pasos aparecen ceros que no son cero. `Fraction` guarda numerador y
denominador enteros, así que `1/3 · 3` vuelve a ser exactamente `1`.

## Agregar una herramienta

Un módulo es un objeto con cuatro cosas:

```js
export const miModulo = {
  id: 'identificador',
  nombre: 'Lo que dice la pestaña',
  descripcion: 'Una línea',
  mount(contenedor) {
    // armá tu interfaz acá
  },
};
```

Después se importa en `js/main.js` y se agrega al arreglo `MODULOS`. Nada más.

## Detalles de la primera herramienta

- Editar una celda o sortear valores reinicia el resultado a la entrada.
- Las operaciones se encadenan sobre el resultado y no se deshacen.
- Para volver atrás: dividir por el mismo factor, sumar el factor opuesto, o
  repetir el intercambio.
- Las celdas admiten enteros de −100 a 100. El factor `k` admite además
  decimales y fracciones: `1.5`, `-3/4`, `0,25`.
- La fila origen y el factor se comparten entre "Obtener múltiplo" y "Operar
  entre filas", así que pasar de una a otra conserva lo que ya cargaste.

## Detalles de la segunda herramienta

- A y B son editables con la misma mecánica de celda; R no se toca.
- No hay botón de aplicar: elegir la operación o editar una celda recalcula
  todo en el acto.
- Sin operación elegida, R es A tal cual, porque no se le hizo nada.
- La matriz P de abajo muestra la cuenta de cada celda. Su ancho se calcula
  con la cuenta más larga, en unidades `ch`: como la tipografía es
  monoespaciada, la medida es exacta y un producto de tres términos ocupa
  más que una suma sin que haya que ajustar píxeles a mano.
- Los negativos van entre paréntesis dentro de la cuenta: `3 − (−7) = 10` se
  lee; `3 − -7 = 10` no.
