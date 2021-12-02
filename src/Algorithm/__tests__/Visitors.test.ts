import { AST, Direction, NodeTypes } from '../Parser';
import { clean, sequence, validate } from '../Traverser';
import { turn } from '../Turn';

const { CW, CCW, Double } = Direction;

describe('Cleaner visitor', () => {
  it('does nothing when the input is already clean', () => {
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
              turns: [
                turn('R', CW),
                turn('U', CW),
                turn('R', CCW),
                turn('U', CCW),
              ],
            },
          ],
          multiplier: 2,
        },
      ],
    };

    const cleaned = clean(ast);

    expect(cleaned).toEqual(ast);
  });

  it('sorts parallel turns', () => {
    // M R2 r E d' R2 -> R2 r M d' E R2
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            turn('M', CW),
            turn('R', Double),
            turn('r', CW),
            turn('E', CW),
            turn('d', CCW),
            turn('R', Double),
          ],
        },
      ],
    };

    const cleaned = clean(ast);

    expect(cleaned).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            turn('R', Double),
            turn('r', CW),
            turn('M', CW),
            turn('d', CCW),
            turn('E', CW),
            turn('R', Double),
          ],
        },
      ],
    });
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

    expect(cleaned).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CCW), turn('U', CW), turn('R', CW), turn('U', CCW)],
        },
      ],
    });
  });

  it('merges non-adjacent turns of a sequence', () => {
    // "R F B2 y L' R F" -> "R B' y F"
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            turn('R', CW),
            turn('F', CW),
            turn('B', Double),
            turn('y', CW),
            turn('L', CCW),
            turn('R', CW),
            turn('F', CW),
          ],
        },
      ],
    };

    const cleaned = clean(ast);

    expect(cleaned).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [turn('R', CW), turn('B', CCW), turn('y', CW), turn('F', CW)],
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
          turns: [
            turn('R', CW),
            turn('U', Double),
            turn('U', CW),
            turn('U', CW),
            turn('R', CCW),
          ],
        },
      ],
    };

    const cleaned = clean(ast);

    expect(cleaned).toEqual({ type: NodeTypes.Algorithm, body: [] });
  });

  it('rearranges the algorithm when the conjugate setup cancels with the commutator interchange', () => {
    // Single/Single ([U: [U, L E L']] -> [U2: [L E L', U']])
    const ast1: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('U', CW)],
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
                  turns: [turn('L', CW), turn('E', CW), turn('L', CCW)],
                },
              ],
            },
          ],
        },
      ],
    };

    // Single/Double ([U': [U2, R D' R']] -> [U: [R D' R', U2]])
    const ast2: AST = {
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
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('U', Double)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('R', CW), turn('D', CCW), turn('R', CCW)],
                },
              ],
            },
          ],
        },
      ],
    };

    // Double/Single ([R2 D2: [D, R U' R']] -> [R2 D': [R U' R', D']])
    const ast3: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', Double), turn('D', Double)],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('D', CW)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('R', CW), turn('U', CCW), turn('R', CCW)],
                },
              ],
            },
          ],
        },
      ],
    };

    const cleaned1 = clean(ast1);
    const cleaned2 = clean(ast2);
    const cleaned3 = clean(ast3);

    expect(cleaned1).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('U', Double)],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('L', CW), turn('E', CW), turn('L', CCW)],
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

    expect(cleaned2).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('U', CW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('R', CW), turn('D', CCW), turn('R', CCW)],
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('U', Double)],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(cleaned3).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', Double), turn('D', CCW)],
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

    expect(cleaned).toEqual({ type: NodeTypes.Algorithm, body: [] });
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

    expect(cleaned).toEqual({
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
    // (R')6 -> R'
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

    expect(cleaned).toEqual({
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

    expect(() => validate(ast1)).not.toThrow();
    expect(() => validate(ast2)).toThrow();
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

    expect(sequenced).toEqual(ast);
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

    expect(sequenced).toEqual({
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

    expect(sequenced).toEqual({
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
