import { assert, describe, it } from 'vitest';

import { TokenTypes } from '../Lexer';
import { Direction, NodeTypes, parse } from '../Parser';
import { turn } from '../Turn';

const { CW, CCW, Double } = Direction;

describe.concurrent('Parser', () => {
  it('parses an empty token list', () => {
    const ast = parse([]);

    assert.deepEqual(ast, { type: NodeTypes.Algorithm, body: [] });
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

    assert.deepEqual(ast, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            turn('R', CW),
            turn('U', CW),
            turn('R', CCW),
            turn('U', CW),
            turn('R', CW),
            turn('U', Double),
            turn('R', CCW),
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

    assert.deepEqual(ast, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', CW), turn('U', CW), turn('R', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('D', Double)],
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

    assert.deepEqual(ast, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Commutator,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', CW), turn('U', CW), turn('R', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('D', Double)],
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

    assert.deepEqual(ast, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)],
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

    assert.deepEqual(ast, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('z', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('R', CW), turn('U', CCW), turn('R', CCW)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('D', CCW)],
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

    assert.deepEqual(ast, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('U', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Conjugate,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('R', CW), turn('D', CCW), turn('R', CCW)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('U', CW)],
                },
              ],
            },
            {
              type: NodeTypes.Conjugate,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('D', CCW), turn('R', CW), turn('D', CW), turn('R', CCW)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('U', CCW)],
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

    assert.deepEqual(ast, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('M', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Repeating,
              multiplicand: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('U', CW), turn('M', CCW), turn('U', CW), turn('M', CW)],
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

    assert.throws(() => parse(tokens1), /unexpected end of input/i);
    assert.throws(() => parse(tokens2), /unexpected end of input/i);
    assert.throws(() => parse(tokens3), /unexpected token/i);
    assert.throws(() => parse(tokens4), /missing seperator/i);
    assert.throws(() => parse(tokens5), /unexpected end of input/i);
    assert.throws(() => parse(tokens6), /unexpected token/i);
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

    assert.throws(() => parse(tokens1), /left side of conjugate/i);
    assert.throws(() => parse(tokens2), /right side of commutator/i);
    assert.throws(() => parse(tokens3), /repeating group/i);
  });

  it('throws when encountering missing multiplier', () => {
    const tokens = [
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.ParenthesisClose, value: ')' },
    ];

    assert.throws(() => parse(tokens), /repeating group must be followed by a multiplier/i);
  });
});
