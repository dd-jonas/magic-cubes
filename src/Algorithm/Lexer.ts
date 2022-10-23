export enum TokenTypes {
  Whitespace = 'whitespace',
  Turn = 'turn',
  BracketOpen = 'bracket_open',
  BracketClose = 'bracket_close',
  SeperatorConjugate = 'seperator_conjugate',
  SeperatorCommutator = 'seperator_commutator',
  ParenthesisOpen = 'parenthesis_open',
  ParenthesisClose = 'parenthesis_close',
  Multiplier = 'multiplier',
}

export type Token = Readonly<{
  type: TokenTypes;
  value: string;
}>;

export type Grammar = Readonly<
  {
    type: TokenTypes;
    match: string;
  }[]
>;

class Lexer {
  private cursor = 0;
  private regex: RegExp;
  private grammar: Grammar = [
    {
      type: TokenTypes.Whitespace,
      match: `\\s`,
    },
    {
      type: TokenTypes.Turn,
      match: `[UFRDBLufrdblMESxyz]['2]?`,
    },
    {
      type: TokenTypes.BracketOpen,
      match: `\\[`,
    },
    {
      type: TokenTypes.BracketClose,
      match: `\\]`,
    },
    {
      type: TokenTypes.SeperatorConjugate,
      match: `:`,
    },
    {
      type: TokenTypes.SeperatorCommutator,
      match: `,`,
    },
    {
      type: TokenTypes.ParenthesisOpen,
      match: `\\(`,
    },
    {
      type: TokenTypes.ParenthesisClose,
      match: `\\)`,
    },
    {
      type: TokenTypes.Multiplier,
      match: `\\d+`,
    },
  ];
  input: string;
  tokens: Token[] = [];

  get isFinished() {
    return this.cursor === this.input.length;
  }

  constructor(input: string) {
    this.input = input;

    // Combine the grammar rules to a single RegExp
    this.regex = new RegExp(
      this.grammar.map((definition) => `(?<${definition.type}>${definition.match})`).join('|'),
      'g'
    );
  }

  /**
   * Generate a token from the first matched grammar rule
   */
  private *generateTokens() {
    while (this.cursor < this.input.length) {
      const match = this.regex.exec(this.input);

      if (!match || match.index !== this.cursor) return null;

      const groups = Object.entries(match.groups!);
      const [type, value] = groups.find(([, value]) => value !== undefined) as [TokenTypes, string];

      const length = value.length;
      this.cursor += length;

      yield { type, value };
    }
  }

  /**
   * Tokenize the input
   */
  run() {
    for (const token of this.generateTokens()) {
      if (token.type === TokenTypes.Whitespace) continue;
      this.tokens.push(token);
    }

    if (!this.isFinished) {
      throw new Error(
        `Invalid character '${this.input[this.cursor]}' at position ${this.cursor + 1}.`
      );
    }
  }
}

export const lex = (input: string) => {
  const lexer = new Lexer(input);
  lexer.run();

  return lexer.tokens;
};
