import { expect, test, mock } from "bun:test";
import { visit } from "./visit.js";
import { get } from "../get/get.js";

test("should return once node", () => {
  const fn = mock();
  const obj = {
    a: {
      b: [{ c: [{ visitable: true, d: 3 }] }],
    },
  };

  for (const elm of visit(obj, (e) => get.boolean(e, "visitable") ?? false)) {
    fn(elm);
  }

  expect(fn).toHaveBeenCalledTimes(1);
});

test("should return every nodes available", () => {
  const v = visit([1, 2, 3]);
  expect([...v]).toMatchSnapshot();
});

test("should return only nodes of type span", () => {
  const v = visit(
    {
      children: [
        { type: "span", value: "foo" },
        { type: "block", children: [{ type: "span", value: "var" }] },
      ],
    },
    (node: any) =>
      typeof node === "object" && node !== null && node.type === "span",
  );
  expect([...v]).toMatchSnapshot();
});

test("should return the parent element", () => {
  const object = {
    a: {
      b: [
        { c: { name: 1, toVisit: true } },
        [{}, { name: 4, toVisit: true }],
        { [Symbol("sd")]: { name: 3, toVisit: true } },
      ],
    },
    e: {
      name: 2,
      toVisit: true,
    },
  };

  expect(
    Array.from(
      visit(object, (object) => get.boolean(object, "toVisit") ?? false),
      (child) => ({
        field: visit.getFieldName(child),
        parent: visit.getParent(child),
      }),
    ),
  ).toMatchSnapshot();
});

test.only("should visit recursive node once time", () => {
  const nodeReferenced: Record<string, any> = {
    name: "foo",
  };

  nodeReferenced.recursive = nodeReferenced;

  const rootNode = {
    a: { b: nodeReferenced },
    b: [{ c: { d: nodeReferenced } }],
  };

  Array.from(visit(rootNode));
});
