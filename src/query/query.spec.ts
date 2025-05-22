import { describe, it, expect } from "bun:test";
import Query, { query } from "./query";
import { visit } from "../visit/visit";

describe("query", () => {
  it("should return true when value is true", () => {
    const predicate = Query.createPredicate(query().equal(true));
    const predicateResult = predicate(true);
    expect(predicateResult).toBeTrue();
  });

  it("should return true when nested property 'properties.active' is true", () => {
    const predicate = Query.createPredicate(
      query().hasProperty("properties").hasProperty("active").equal(true),
    );
    const predicateResult = predicate({ properties: { active: true } });
    expect(predicateResult).toBeTrue();
  });

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

  it("should find all nodes that are instances of a base class", () => {
    class CLS_A {}
    class CLS_B extends CLS_A {}

    const tree = {
      children: [new CLS_A(), new CLS_B()],
    };

    const nodes = Array.from(visit<any>(tree, query().instanceOf(CLS_A)));

    expect(nodes.length).toBe(2);
  });

  it("should find nodes that are instances of both base and derived class", () => {
    class CLS_A {}
    class CLS_B extends CLS_A {}

    const tree = {
      children: [new CLS_A(), new CLS_B()],
    };

    const nodes = Array.from(
      visit<any>(tree, query().instanceOf(CLS_A).instanceOf(CLS_B)),
    );

    expect(nodes.length).toBe(1);
  });

  it("should find nodes with nested property 'meta.prop1'", () => {
    const tree = {
      children: [
        {
          type: "element",
          meta: {
            prop1: true,
          },
        },
        {
          type: "element",
        },
      ],
    };

    const nodes = Array.from(
      visit<any>(tree, query().hasProperty("meta").hasProperty("prop1")),
    );

    expect(nodes.length).toBe(1);
  });

  it("should find nodes with nested property 'meta.prop1' equal to true", () => {
    const tree = {
      type: "element",
      meta: {
        prop1: true,
      },
    };

    const nodes = Array.from(
      visit<any>(
        tree,
        query().hasProperty("meta").hasProperty("prop1").equal(true),
      ),
    );

    expect(nodes.length).toBe(1);
  });

  it("should find nodes with nested property 'meta.prop1' equal to true in a root element", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          meta: {
            prop1: true,
          },
        },
      ],
    };

    const nodes = Array.from(
      visit<any>(
        tree,
        query().hasProperty("meta").hasProperty("prop1").equal(true),
      ),
    );

    expect(nodes.length).toBe(1);
  });

  it("should find nodes with a nested property 'metadata.namespace' matching 'profile'", () => {
    const tree = {
      type: "root",
      children: [
        {
          type: "element",
          metadata: {
            prop1: true,
            namespace: "profile:write",
          },
        },
      ],
    };

    const nodes = Array.from(
      visit<any>(
        tree,
        query()
          .hasProperty("metadata")
          .hasProperty("namespace")
          .match("profile"),
      ),
    );

    expect(nodes.length).toBe(1);
  });
});
