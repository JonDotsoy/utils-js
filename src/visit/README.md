# visit

`visit` es una utilidad de TypeScript para recorrer estructuras de datos complejas (objetos, arrays, árboles, etc.) de manera recursiva, permitiendo filtrar y obtener nodos según criterios personalizados. Es útil para inspección, transformación o búsqueda de nodos en árboles de datos, como ASTs, estructuras anidadas o colecciones heterogéneas.

## Importación

```typescript
import { visit } from "@jondotsoy/utils-js/visit";
```

## Uso básico

```typescript
import { visit } from "@jondotsoy/utils-js/visit";

const tree = {
  a: 1,
  b: { c: 2, d: [3, 4] },
};

for (const node of visit(tree)) {
  console.log(node); // Recorre todos los nodos del árbol
}
```

## API

### visit(node, test?, seenInstances?)

- **node**: Nodo raíz a recorrer (cualquier valor).
- **test**: (opcional) Función `(node) => boolean` para filtrar nodos. Si retorna `true`, el nodo es yield.
- **seenInstances**: (opcional) `WeakSet` para evitar ciclos en objetos.

#### Ejemplo con filtro

```typescript
// Solo números
for (const n of visit(tree, (x) => typeof x === "number")) {
  console.log(n); // 1, 2, 3, 4
}
```

#### Ejemplo con estructuras anidadas

```typescript
const ast = {
  type: "root",
  children: [
    { type: "span", value: "foo" },
    { type: "block", children: [{ type: "span", value: "bar" }] },
  ],
};

for (const node of visit(ast, (n) => n.type === "span")) {
  console.log(node); // { type: 'span', value: 'foo' }, { type: 'span', value: 'bar' }
}
```

### Propiedades auxiliares

#### visit.getParent(child)

Devuelve el nodo padre de un nodo visitado (si existe).

```typescript
const nodes = [...visit(tree)];
const parent = visit.getParent(nodes[2]);
```

#### visit.getFieldName(child)

Devuelve el nombre de la propiedad o índice por el cual se accede al nodo desde su padre.

```typescript
const nodes = [...visit(tree)];
const field = visit.getFieldName(nodes[2]);
```

## Detalles de implementación

- Utiliza `WeakMap` para rastrear padres y nombres de campo sin afectar el GC.
- Evita ciclos con `WeakSet`.
- Soporta propiedades con símbolos.

## Casos de uso

- Recorrer árboles de sintaxis abstracta (AST).
- Buscar nodos de cierto tipo en estructuras anidadas.
- Inspección y análisis de objetos complejos.
- Transformaciones profundas de datos.

## Ejemplo avanzado

```typescript
// Buscar todos los arrays en una estructura
for (const arr of visit(tree, (x) => Array.isArray(x))) {
  console.log(arr); // [3, 4]
}
```

---

> Para más ejemplos y utilidades, revisa el README principal del proyecto y el archivo ROADMAP.md para futuras mejoras.
