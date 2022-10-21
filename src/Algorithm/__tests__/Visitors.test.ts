import { assert, describe, it } from 'vitest';

import { AST, Direction, NodeTypes } from '../Parser';
import { clean, sequence, validate } from '../Traverser';
import { turn } from '../Turn';

const { CW, CCW, Double } = Direction;

describe.concurrent('Cleaner visitor', () => {
  it('does nothing when the input is already clean', () => {
    // [l': [U, R' D2 R]] (R U R' U')2
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('l', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('U', CW)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('R', CCW), turn('D', Double), turn('R', CW)],
                },
              ],
            },
          ],
        },
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)],
            },
          ],
          multiplier: 2,
        },
      ],
    };

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, ast);
  });

  it('merges consecutive turns of a sequence', () => {
    // R2 R' R2 U2 U' L L' R U U U -> R' U R U'
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            turn('R', Double),
            turn('R', CCW),
            turn('R', Double),
            turn('U', Double),
            turn('U', CCW),
            turn('L', CW),
            turn('L', CCW),
            turn('R', CW),
            turn('U', CW),
            turn('U', CW),
            turn('U', CW),
          ],
        },
      ],
    };

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CCW), turn('U', CW), turn('R', CW), turn('U', CCW)],
        },
      ],
    });
  });

  it('removes the node if turns is empty', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CW), turn('U', Double), turn('U', CW), turn('U', CW), turn('R', CCW)],
        },
      ],
    };

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, { type: NodeTypes.Algorithm, body: [] });
  });

  it('removes repeating groups with multiplier 0', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', CW)],
            },
          ],
          multiplier: 0,
        },
      ],
    };

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, { type: NodeTypes.Algorithm, body: [] });
  });

  it('flattens repeating groups with multiplier 1', () => {
    // (y [M: U])1 -> y [M: U]
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('y', CW)],
            },
            {
              type: NodeTypes.Conjugate,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('M', CW)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('U', CW)],
                },
              ],
            },
          ],
          multiplier: 1,
        },
      ],
    };

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('y', CW)],
        },
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('M', CW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('U', CW)],
            },
          ],
        },
      ],
    });
  });

  it('flattens repeating groups to a sequence when multiplying a single turn', () => {
    // (R')6 -> R2
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', CCW)],
            },
          ],
          multiplier: 6,
        },
      ],
    };

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', Double)],
        },
      ],
    });
  });
});

describe('Validator visitor', () => {
  it('limits repeating group multipliers to 6', () => {
    const ast1: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [],
          multiplier: 6,
        },
      ],
    };

    const ast2: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [],
          multiplier: 7,
        },
      ],
    };

    assert.doesNotThrow(() => validate(ast1));
    assert.throws(() => validate(ast2), /higher than 6/i);
  });
});

describe('Sequencer visitor', () => {
  it('does nothing when sequencing a sequence', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)],
        },
      ],
    };

    const sequenced = sequence(ast);

    assert.deepEqual(sequenced, ast);
  });

  it('flattens multiple sequences', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CW), turn('U', CW)],
        },
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CCW), turn('U', CCW)],
        },
      ],
    };

    const sequenced = sequence(ast);

    assert.deepEqual(sequenced, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)],
        },
      ],
    });
  });

  it('flattens a complex algorithm', () => {
    const ast: AST = {
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
                  type: NodeTypes.Repeating,
                  multiplicand: [
                    {
                      type: NodeTypes.Sequence,
                      turns: [turn('R', CW), turn('U', CW), turn('R', CCW)],
                    },
                  ],
                  multiplier: 2,
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
    };

    const sequenced = sequence(ast);

    assert.deepEqual(sequenced, {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            turn('z', CCW),
            turn('R', CW),
            turn('U', CW),
            turn('R', CCW),
            turn('R', CW),
            turn('U', CW),
            turn('R', CCW),
            turn('D', CCW),
            turn('R', CW),
            turn('U', CCW),
            turn('R', CCW),
            turn('R', CW),
            turn('U', CCW),
            turn('R', CCW),
            turn('D', CW),
            turn('z', CW),
          ],
        },
      ],
    });
  });
});
