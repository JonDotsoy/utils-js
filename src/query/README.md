# query

`query` is a utility for building declarative and chainable queries over data structures, designed to be used with the `visit` function. It allows you to filter nodes by class instance, properties, values, matches, or custom predicates in a fluent and expressive way.

## Import

```ts
import { query } from "@jondotsoy/utils-js/query";
import { visit } from "@jondotsoy/utils-js/visit";
```

## Basic usage

```ts
const tree = {
  type: "root",
  children: [
    { type: "element", name: "div", attributes: { id: "main" } },
    { type: "element", name: "span" },
    { type: "text", value: "Hello" },
  ],
};

// Find nodes with the 'attributes' property
const nodes = Array.from(visit(tree, query().hasProperty("attributes")));
// nodes will contain only the 'div' node
```

## API

### query()

Creates a new empty query.

### Chainable methods

- `.where(predicate)` — Filter by custom predicate.
- `.instanceOf(Class)` — Filter by class instance.
- `.hasProperty(prop)` — Filter nodes that have the given property (supports nesting).
- `.equal(value)` — Filter nodes whose value is equal to the given value.
- `.match(regexp|string)` — Filter string nodes that match the expression.

## Examples

### Filter by class instance

```ts
class Custom {}
const tree = { children: [new Custom(), { type: "element" }] };
const nodes = Array.from(visit(tree, query().instanceOf(Custom)));
// nodes will contain only instances of Custom
```

### Filter by nested properties and value

```ts
const tree = {
  children: [{ type: "element", meta: { prop1: true } }, { type: "element" }],
};
const nodes = Array.from(
  visit(tree, query().hasProperty("meta").hasProperty("prop1").equal(true)),
);
// nodes will contain only the node with meta.prop1 === true
```

### Filter by string match

```ts
const tree = {
  type: "root",
  children: [{ type: "element", metadata: { namespace: "profile:write" } }],
};
const nodes = Array.from(
  visit(
    tree,
    query().hasProperty("metadata").hasProperty("namespace").match("profile"),
  ),
);
// nodes will contain the node with metadata.namespace containing 'profile'
```

## Integration with visit

`query` is designed to be used as the second argument of `visit`, enabling complex and expressive searches in trees or nested structures.

### Advanced integration example

```ts
const ast = {
  type: "root",
  children: [
    { type: "element", meta: { prop1: true } },
    { type: "element", meta: { prop1: false } },
    { type: "text", value: "Hello" },
  ],
};

// Find all nodes with meta.prop1 === true
const result = Array.from(
  visit(ast, query().hasProperty("meta").hasProperty("prop1").equal(true)),
);
// result will contain only the nodes that match the condition
```

You can combine `query` with any predicate, class instance, or nested search to traverse and filter complex structures declaratively.
