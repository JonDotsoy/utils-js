type ArgvValue = string | string[];

const isWhitespace = (char: string) => /\s/.test(char);

const tokenizeStatic = (text: string): string[] => {
  const tokens: string[] = [];
  let current = "";
  let hasCurrent = false;
  let quote: '"' | "'" | null = null;

  for (const char of text) {
    if (quote) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      hasCurrent = true;
      continue;
    }

    if (isWhitespace(char)) {
      if (hasCurrent) {
        tokens.push(current);
        current = "";
        hasCurrent = false;
      }
      continue;
    }

    current += char;
    hasCurrent = true;
  }

  if (quote) {
    throw new Error(`argv: unterminated ${quote} quote in "${text}"`);
  }

  if (hasCurrent) tokens.push(current);

  return tokens;
};

export function argv(
  strings: TemplateStringsArray,
  ...values: ArgvValue[]
): string[] {
  const tokens: string[] = [];

  strings.forEach((chunk, i) => {
    tokens.push(...tokenizeStatic(chunk));

    if (i >= values.length) return;

    const value = values[i];
    if (Array.isArray(value)) {
      tokens.push(...value);
    } else if (typeof value === "string") {
      tokens.push(value);
    } else {
      throw new TypeError(
        `argv: interpolated values must be string or string[], got ${typeof value}`,
      );
    }
  });

  return tokens;
}

argv.escape = (value: string): string =>
  `"${value.replace(/[\\"]/g, (char) => `\\${char}`)}"`;
