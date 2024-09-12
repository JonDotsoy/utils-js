# utils-js

Some utilities to js

- [visit](#visit)
- [get](#get)

## Visit

A generator function that recursively visits nodes in an object, yielding each node that passes the provided test.

**Syntax**

```ts
visit(node);
visit(node, test);
```

**Arguments:**

- `node` `<unknown>`: The starting node to visit.
- `test` `<(node: unknown) => boolean>`: An optional function that takes a node as input and returns a boolean. If true, the node will be yielded

**Example:**

```ts
import { visit } from "@jondotsoy/utils-js/visit";

const v = visit([1, 2, 3]);
v.next().value; // [1, 2, 3]
v.next().value; // 1
v.next().value; // 2
v.next().value; // 3

const v = visit(
  {
    children: [
      { type: "span", value: "foo" },
      { type: "block", children: [{ type: "span", value: "var" }] },
    ],
  },
  (node) => node.type === "span",
);
v.next().value; // {type:"span",value:"foo"}
v.next().value; // {type:"span",value:"var"}
```

## Get

Recursively retrieves a property from an object by following the specified path.

**Syntax:**

```ts
get(obj);
get(obj, ...paths);
```

**Arguments:**

- `obj` `<unknown>`: The object to retrieve the property from.
- `paths` `<Array<string | number | symbol>>`: The path(s) of properties to follow. If no paths are provided, returns the entire object.

**Example:**

```ts
const obj = { key: { key: { a: 1, b: 2 } } };
get(obj, "key", "key"); // <unknown> { a: 1, b: 2 }

const obj = { key: { key: { a: 1, b: 2 } } };
get.record(obj, "key", "key"); // <Record<unknown, unknown>> { a: 1, b: 2 }
```

## Set

Sets a value at a specified path within a nested object structure.

**Syntax**

```ts
set(obj, paths, value);
```

**Arguments**

- `obj` `<unknown>`: The object to modify.
- `paths` `<Array<string | number | symbol>>`: An array of property keys representing the path to the target property.
- `value` `<unknown>`: The value to set at the specified path.

**Return**

The modified object.

**Example:**

```ts
const obj = { a: {} };
set(obj, ["a", "b", "c"], 1); // => { a: { b: { c: 1} } }

const data = { a: { b: 1 } };

set(data, ["a", "b"], 2); // => { a: { b: 2 } }

set(data, ["a", "c", "d"], 3); //=> { a: { b: 2, c: { d: 3 } } }
```
