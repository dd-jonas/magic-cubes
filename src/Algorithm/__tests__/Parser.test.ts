import { TokenTypes } from '../Lexer';
import { Direction, NodeTypes, parse } from '../Parser';

describe('Parser', () => {
  it('parses an empty token list', () => {
    const ast = parse([]);

    expect(ast).toEqual({ type: NodeTypes.Algorithm, body: [] });
  });

  it('parses a sequence', () => {
    const ast = parse([
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U2' },
      { type: TokenTypes.Turn, value: "R'" },
    ]);

    expect(ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
          ],
        },
      ],
    });
  });

  it('parses a conjugate', () => {
    const ast = parse([
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: 'D2' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);

    expect(ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
              ],
            },
          ],
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [
                {
                  type: NodeTypes.Turn,
                  move: 'D',
                  direction: Direction.Double,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses a commutator', () => {
    const ast = parse([
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorCommutator, value: ',' },
      { type: TokenTypes.Turn, value: 'D2' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);

    expect(ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Commutator,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
              ],
            },
          ],
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [
                {
                  type: NodeTypes.Turn,
                  move: 'D',
                  direction: Direction.Double,
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses a repeating group', () => {
    const ast = parse([
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.ParenthesisClose, value: ')' },
      { type: TokenTypes.Multiplier, value: '6' },
    ]);

    expect(ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
              ],
            },
          ],
          multiplier: 6,
        },
      ],
    });
  });

  it('parses complex algorithm (conjugate with nested commutator)', () => {
    const ast = parse([
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "z'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorCommutator, value: ',' },
      { type: TokenTypes.Turn, value: "D'" },
      { type: TokenTypes.BracketClose, value: ']' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);

    expect(ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'z', direction: Direction.CCW },
              ],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'R',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.CCW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'R',
                      direction: Direction.CCW,
                    },
                  ],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'D',
                      direction: Direction.CCW,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses a complex algorithm (multiple conjugates)', () => {
    const ast = parse([
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: "D'" },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.BracketClose, value: ']' },
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "D'" },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'D' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.BracketClose, value: ']' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);

    expect(ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
              ],
            },
          ],
          B: [
            {
              type: NodeTypes.Conjugate,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'R',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'D',
                      direction: Direction.CCW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'R',
                      direction: Direction.CCW,
                    },
                  ],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.CW,
                    },
                  ],
                },
              ],
            },
            {
              type: NodeTypes.Conjugate,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'D',
                      direction: Direction.CCW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'R',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'D',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'R',
                      direction: Direction.CCW,
                    },
                  ],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.CCW,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  it('parses a complex algorithm (nested repeating group)', () => {
    const ast = parse([
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "M'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "M'" },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: 'M' },
      { type: TokenTypes.ParenthesisClose, value: ')' },
      { type: TokenTypes.Multiplier, value: '2' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);

    expect(ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'M', direction: Direction.CCW },
              ],
            },
          ],
          B: [
            {
              type: NodeTypes.Repeating,
              multiplicand: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'M',
                      direction: Direction.CCW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'M',
                      direction: Direction.CW,
                    },
                  ],
                },
              ],
              multiplier: 2,
            },
          ],
        },
      ],
    });
  });

  it('throws when encountering unbalanced brackets', () => {
    const tokens1 = [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'U' },
    ];

    const tokens2 = [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: 'D' },
    ];

    const tokens3 = [
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.SeperatorCommutator, value: ',' },
      { type: TokenTypes.Turn, value: 'D' },
      { type: TokenTypes.BracketClose, value: ']' },
    ];

    const tokens4 = [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: 'D' },
      { type: TokenTypes.BracketClose, value: ']' },
    ];

    const tokens5 = [
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.Turn, value: 'U' },
    ];

    const tokens6 = [
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.ParenthesisClose, value: ')' },
      { type: TokenTypes.Multiplier, value: '2' },
    ];

    expect(() => parse(tokens1)).toThrow('Unexpected end of input.');
    expect(() => parse(tokens2)).toThrow('Unexpected end of input.');
    expect(() => parse(tokens3)).toThrow('Unexpected token , at position 2.');
    expect(() => parse(tokens4)).toThrow(
      'Missing seperator : or , inside brackets.'
    );
    expect(() => parse(tokens5)).toThrow('Unexpected end of input.');
    expect(() => parse(tokens6)).toThrow('Unexpected token ) at position 2.');
  });

  it('throws when encountering en empty part', () => {
    const tokens1 = [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.BracketClose, value: ']' },
    ];

    const tokens2 = [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.SeperatorCommutator, value: ',' },
      { type: TokenTypes.BracketClose, value: ']' },
    ];

    const tokens3 = [
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.ParenthesisClose, value: ')' },
      { type: TokenTypes.Multiplier, value: '2' },
    ];

    expect(() => parse(tokens1)).toThrow(
      "Left side of conjugate can't be empty."
    );
    expect(() => parse(tokens2)).toThrow(
      "Right side of commutator can't be empty."
    );
    expect(() => parse(tokens3)).toThrow("Repeating group can't be empty.");
  });

  it('throws when encountering missing multiplier', () => {
    const tokens = [
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.ParenthesisClose, value: ')' },
    ];

    expect(() => parse(tokens)).toThrow(
      'Repeating group must be followed by a multiplier.'
    );
  });
});
