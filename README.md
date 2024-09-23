# utils-js

Some utilities to js

- [visit](#visit)
- [get](#get)
- [set](#set)
- [pipe](#pipe)

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
get(obj); // => unknown | undefined
get(obj, ...paths); // => unknown | undefined

// Alternative get value only if is of a type
get.string(obj); // => string | undefined
get.string(obj, ...paths); // => string | undefined
get.number(obj); // => number | undefined
get.number(obj, ...paths); // => number | undefined
get.boolean(obj); // => boolean | undefined
get.boolean(obj, ...paths); // => boolean | undefined
get.function(obj); // => function | undefined
get.function(obj, ...paths); // => function | undefined
get.bigint(obj); // => bigint | undefined
get.bigint(obj, ...paths); // => bigint | undefined
get.symbol(obj); // => symbol | undefined
get.symbol(obj, ...paths); // => symbol | undefined
get.array(obj); // => Array<unknown> | undefined
get.array(obj, ...paths); // => Array<unknown> | undefined
get.date(obj); // => Date | string | number | undefined
get.date(obj, ...paths); // => Date | string | number | undefined
get.record(obj); // => Record | undefined
get.record(obj, ...paths); // => Record | undefined
```

**Arguments:**

- `obj` `<unknown>`: The object to retrieve the property from.
- `paths` `<Array<string | number | symbol>>`: The path(s) of properties to follow. If no paths are provided, returns the entire object.

**Return:**

If a value is found on this path, the results will be an `unknown` other side will return a `undefined` value.

The function check returns only the type defined.

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

## Pipe

> Inspiring on [tc39/proposal-pipeline-operator](https://github.com/tc39/proposal-pipeline-operator).

Simplify the joint operations to be easier to read and reduce complexity. It also supports async operations.

```ts
import { pipe } from "@jondotsoy/utils-js/pipe";

const sum = (v: number) => (a: number) => a + v;

const res = pipe(3).pipe(sum(1)).value();

res; // => 4
```

Alternative using to async operations. To this import `"@jondotsoy/utils-js/pipe/async"` module.

```ts
import { pipe } from "@jondotsoy/utils-js/pipe/async";

const sum = (v: number) => async (a: number) => a + v;

const res = await pipe(3).pipe(sum(1)).value();

res; // => 4
```

**Syntax:**

```ts
pipe(initialValue).value();
pipe(initialValue).pipe(operator).value();
pipe(initialValue).pipe(operator).pipe(operator).value();
```

**Arguments**

- `initialValue` `<unknown>`: initial value to pass on the next operator.
- `operator` `<(prevValue: unknown) => unknown>`: The operator to apply to the previous value.

**Return**

A pipe object that can be used to chain operations. call `.value()` to get the final result.

**Example:**

```ts
const sum = (v: number) => (a: number) => a + v;

pipe(3).pipe(sum(1)).value(); // => 4;

pipe(3)
  .pipe((a) => a + 1)
  .pipe((a) => a + 1)
  .value(); // => 5;

await pipe(3)
  .pipe(async (a) => a + 2)
  .pipe(sum(1))
  .value(); // => Promise<6>;
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details
