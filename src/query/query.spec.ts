import { describe, it, expect } from "bun:test";
import Query, { query } from "./query";
import { visit } from "../visit/visit";

describe("query", () => {
  it("should traverse and query a sample tree structure", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          name: "div",
          attributes: { id: "main", class: "container" },
        },
      ],
    };

    const nodes = Array.from(visit(tree, query()));

    expect(nodes).toBeDefined();
    expect(nodes).toMatchSnapshot();
  });

  it("should traverse and query instances of a specific class in the tree", () => {
    class CLS {
      constructor(readonly name: string) {}
    }

    const tree = {
      type: "root",
      children: [
        new CLS("label"),
        {
          type: "element",
          name: "div",
          attributes: { id: "main", class: "container" },
        },
      ],
    };

    const nodes = Array.from(visit(tree, query().instanceOf(CLS)));

    expect(nodes).toBeDefined();
    expect(nodes).toMatchSnapshot();
  });

  it("should filter nodes where type is 'element' using where()", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          name: "div",
          attributes: { id: "main", class: "container" },
        },
        {
          type: "element",
          name: "span",
          attributes: { id: "secondary", class: "item" },
        },
        {
          type: "text",
          value: "Hello",
        },
      ],
    };

    const nodes = Array.from(
      visit<any>(
        tree,
        query<any>().where((node) => node.type === "element"),
      ),
    );

    expect(nodes.length).toBe(2);
    expect(nodes.every((n) => n.type === "element")).toBe(true);
    expect(nodes.map((n) => n.name)).toEqual(["div", "span"]);
  });

  it("should filter nodes that have a specific property using hasProperty()", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          name: "div",
          attributes: { id: "main", class: "container" },
        },
        {
          type: "element",
          name: "span",
        },
        {
          type: "text",
          value: "Hello",
        },
      ],
    };

    const nodes: any = Array.from(
      visit(tree, query<any>().hasProperty("attributes")),
    );

    expect(nodes.length).toBe(1);
    expect(nodes[0]).toHaveProperty("attributes");
    expect(nodes[0].name).toBe("div");
  });

  it("should return all nodes when no predicates are set", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          name: "div",
        },
        {
          type: "text",
          value: "Hello",
        },
      ],
    };

    const nodes = Array.from(visit<any>(tree, query()));

    // Should include root and both children
    expect(nodes.length).toBe(9);
    expect(nodes.some((n) => n.type === "root")).toBe(true);
    expect(nodes.some((n) => n.type === "element")).toBe(true);
    expect(nodes.some((n) => n.type === "text")).toBe(true);
  });

  it("should combine multiple predicates with where()", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          name: "div",
          attributes: { id: "main" },
        },
        {
          type: "element",
          name: "span",
        },
        {
          type: "element",
          name: "div",
        },
      ],
    };

    const nodes = Array.from(
      visit<any>(
        tree,
        query<any>()
          .where((node) => node.type === "element")
          .where((node: any) => node.name === "div"),
      ),
    );

    expect(nodes.length).toBe(2);
    expect(nodes.every((n) => n.name === "div")).toBe(true);
  });

  it("should return empty array if no nodes match", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          name: "div",
        },
      ],
    };

    const nodes = Array.from(
      visit<any>(
        tree,
        query<any>().where((node) => node.type === "nonexistent"),
      ),
    );

    expect(nodes.length).toBe(0);
  });

  it("should filter nodes by instanceOf", () => {
    class Custom {}
    const tree = {
      type: "root",
      children: [new Custom(), { type: "element", name: "div" }],
    };

    const nodes = Array.from(visit(tree, query().instanceOf(Custom)));

    expect(nodes.length).toBe(1);
    expect(nodes[0] instanceof Custom).toBe(true);
  });
});
