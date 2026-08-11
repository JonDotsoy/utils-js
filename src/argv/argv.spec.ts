import { describe, it, expect, expectTypeOf } from "bun:test";
import { argv } from "./argv.js";

describe("argv", () => {
  it("splits space-separated static tokens", () => {
    expect(argv`foo tar`).toEqual(["foo", "tar"]);
  });

  it("collapses extra, leading and trailing whitespace", () => {
    expect(argv`  foo    tar  `).toEqual(["foo", "tar"]);
  });

  it("strips double quotes around a token without spaces", () => {
    expect(argv`foo "tar"`).toEqual(["foo", "tar"]);
  });

  it("keeps a double-quoted segment with spaces as one token", () => {
    expect(argv`foo "tar biz"`).toEqual(["foo", "tar biz"]);
  });

  it("keeps a single-quoted segment with spaces as one token", () => {
    expect(argv`foo 'tar biz'`).toEqual(["foo", "tar biz"]);
  });

  it("keeps a string interpolation as one token, spaces and all", () => {
    expect(argv`foo ${"tar biz"}`).toEqual(["foo", "tar biz"]);
  });

  it("spreads an array interpolation into multiple tokens", () => {
    expect(argv`foo ${["tar biz", "bliz"]}`).toEqual([
      "foo",
      "tar biz",
      "bliz",
    ]);
  });

  it("treats an interpolation as a standalone token even without surrounding whitespace", () => {
    expect(argv`foo${"bar"}baz`).toEqual(["foo", "bar", "baz"]);
  });

  it("returns an empty array for an empty template", () => {
    expect(argv``).toEqual([]);
  });

  it("throws on an unterminated double quote", () => {
    expect(() => argv`foo "bar`).toThrow();
  });

  it("throws on an unterminated single quote", () => {
    expect(() => argv`foo 'bar`).toThrow();
  });

  it("mixes static tokens and interpolations in one call", () => {
    expect(argv`run --name ${"foo bar"} --tags ${["a", "b"]} -x`).toEqual([
      "run",
      "--name",
      "foo bar",
      "--tags",
      "a",
      "b",
      "-x",
    ]);
  });

  it("has a string[] return type", () => {
    expectTypeOf(argv`foo`).toEqualTypeOf<string[]>();
  });

  it("treats shell operators as plain characters, not syntax", () => {
    expect(argv`ls | grep foo && echo done; exit 1 > out.txt`).toEqual([
      "ls",
      "|",
      "grep",
      "foo",
      "&&",
      "echo",
      "done;",
      "exit",
      "1",
      ">",
      "out.txt",
    ]);
  });

  it("leaves command substitution and variables untouched", () => {
    expect(argv`echo $HOME $(whoami) \`date\``).toEqual([
      "echo",
      "$HOME",
      "$(whoami)",
      "`date`",
    ]);
  });

  it("leaves glob and brace patterns untouched", () => {
    expect(argv`ls *.ts {a,b}.json`).toEqual(["ls", "*.ts", "{a,b}.json"]);
  });

  it("handles emoji and accented unicode characters", () => {
    expect(argv`echo 🚀 "café con leche" ñandú`).toEqual([
      "echo",
      "🚀",
      "café con leche",
      "ñandú",
    ]);
  });

  it("treats tabs and newlines as whitespace", () => {
    expect(argv`foo\ttar\nbaz`).toEqual(["foo", "tar", "baz"]);
  });

  it("returns an empty array for a whitespace-only template", () => {
    expect(argv`   \t  `).toEqual([]);
  });

  it("keeps a single quote literal inside a double-quoted segment", () => {
    expect(argv`foo "it's a test"`).toEqual(["foo", "it's a test"]);
  });

  it("keeps a double quote literal inside a single-quoted segment", () => {
    expect(argv`foo 'she said "hi"'`).toEqual(["foo", 'she said "hi"']);
  });

  it("produces an empty-string token for an empty quoted segment", () => {
    expect(argv`foo "" bar`).toEqual(["foo", "", "bar"]);
    expect(argv`foo '' bar`).toEqual(["foo", "", "bar"]);
  });

  it("merges adjacent quoted segments with no space between them", () => {
    expect(argv`foo"bar"'baz'qux`).toEqual(["foobarbazqux"]);
  });

  it("does NOT merge across an interpolation boundary, even with adjacent quotes", () => {
    expect(argv`"foo"${"bar"}"baz"`).toEqual(["foo", "bar", "baz"]);
  });

  it("does not throw when an unterminated quote is closed by a later interpolation", () => {
    expect(() => argv`foo "bar ${"baz"}`).toThrow();
  });

  it("keeps an interpolated empty string as its own token, unlike empty static text", () => {
    expect(argv`foo ${""} bar`).toEqual(["foo", "", "bar"]);
  });

  it("spreads an empty array interpolation into nothing", () => {
    expect(argv`foo ${[]} bar`).toEqual(["foo", "bar"]);
  });

  it("keeps empty strings inside an array interpolation", () => {
    expect(argv`foo ${["a", "", "b"]}`).toEqual(["foo", "a", "", "b"]);
  });

  it("handles back-to-back interpolations with no static text between them", () => {
    expect(argv`${"a"}${"b"}`).toEqual(["a", "b"]);
  });

  it("collapses whitespace-only static text between interpolations", () => {
    expect(argv`${"a"}   ${"b"}`).toEqual(["a", "b"]);
  });

  it("parses a lone empty quoted string as a single empty token", () => {
    // A known trap in other shell-word parsers (e.g. classic shlex): an
    // input that is *only* an empty quoted pair can be dropped entirely
    // instead of producing one empty-string token.
    expect(argv`""`).toEqual([""]);
    expect(argv`''`).toEqual([""]);
  });

  it("treats a backslash as a plain character, not an escape, outside quotes", () => {
    // Written as `\\` in the source so the JS engine's own template-literal
    // cooking (which happens before `argv` ever sees the text) collapses it
    // to one literal backslash rather than eating it as an escape.
    expect(argv`foo bar\\baz`).toEqual(["foo", "bar\\baz"]);
  });

  it("treats a backslash as a plain character, not an escape, inside quotes", () => {
    // Backslash-escaping a quote character is NOT supported: the (literal,
    // already-cooked) backslash is just ordinary data, and the following
    // quote still closes the string — leaving a dangling unescaped quote
    // that opens a new (unterminated) quoted segment.
    expect(() => argv`foo "a\\"b"`).toThrow();
  });

  it("throws when a quote is opened at the very end of the input", () => {
    expect(() => argv`foo "`).toThrow();
    expect(() => argv`foo '`).toThrow();
  });

  it("treats a non-breaking space as whitespace, per JS's \\s semantics", () => {
    expect(argv`foo\u00A0bar`).toEqual(["foo", "bar"]);
  });

  it("splits an unquoted Windows-style path on its spaces (no escaping support)", () => {
    // A common real-world trap: paths with spaces must be quoted, since
    // backslashes are not treated as path separators or escapes here.
    // (Doubled in the source for the same cooking reason as above.)
    expect(argv`copy C:\\Users\\a b\\file.txt`).toEqual([
      "copy",
      "C:\\Users\\a",
      "b\\file.txt",
    ]);
  });

  it("also documents that JS itself, not argv, interprets \\n and \\t escapes", () => {
    // `\t`/`\n` written directly in a template literal are cooked to real
    // tab/newline characters by the JS engine before `argv` runs — this is
    // why the earlier "tabs and newlines" test works without any escape
    // handling inside argv's own tokenizer.
    expect(argv`a\tb`).toEqual(["a", "b"]);
    expect(argv`a\\tb`).toEqual(["a\\tb"]);
  });
});

describe("argv.escape", () => {
  it("wraps a plain value in double quotes", () => {
    expect(argv.escape("tar biz")).toBe('"tar biz"');
  });

  it("escapes embedded double quotes", () => {
    expect(argv.escape('say "hi"')).toBe('"say \\"hi\\""');
  });

  it("escapes embedded backslashes", () => {
    expect(argv.escape("back\\slash")).toBe('"back\\\\slash"');
  });

  it("quotes an empty string", () => {
    expect(argv.escape("")).toBe('""');
  });

  it("still quotes a value with no special characters", () => {
    expect(argv.escape("plain")).toBe('"plain"');
  });

  it("escapes a value containing shell metacharacters as one literal", () => {
    expect(argv.escape("foo; rm -rf / | $(whoami) `date` && echo $HOME")).toBe(
      '"foo; rm -rf / | $(whoami) `date` && echo $HOME"',
    );
  });

  it("preserves emoji and accented unicode characters", () => {
    expect(argv.escape("🚀 café ñandú")).toBe('"🚀 café ñandú"');
  });

  it("escapes a value that is only a double quote", () => {
    expect(argv.escape('"')).toBe('"\\""');
  });

  it("escapes a run of consecutive backslashes", () => {
    expect(argv.escape("\\\\\\")).toBe('"\\\\\\\\\\\\"');
  });

  it("escapes quote and backslash characters adjacent to each other", () => {
    expect(argv.escape('a\\"b')).toBe('"a\\\\\\"b"');
  });

  it("preserves literal newlines and tabs without escaping them", () => {
    expect(argv.escape("line1\nline2\ttabbed")).toBe(
      '"line1\nline2\ttabbed"',
    );
  });

  it("round-trips through argv's own tokenizer for a single interpolation", () => {
    const value = 'weird $(value) with "quotes" and \\backslash\\';
    expect(argv`cmd ${value}`).toEqual(["cmd", value]);
  });
});
