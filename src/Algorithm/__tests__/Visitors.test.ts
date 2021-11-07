import { AST, Direction, NodeTypes } from '../Parser';
import { Traverser } from '../Traverser';
import { Cleaner, Sequencer, Validator } from '../Visitors';

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
              turns: [
                { type: NodeTypes.Turn, move: 'l', direction: Direction.CCW },
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
                      move: 'U',
                      direction: Direction.CW,
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
                      move: 'R',
                      direction: Direction.CCW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'D',
                      direction: Direction.Double,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'R',
                      direction: Direction.CW,
                    },
                  ],
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
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
              ],
            },
          ],
          multiplier: 2,
        },
      ],
    };

    const traverser = new Traverser(ast, Cleaner);

    traverser.run();

    expect(traverser.ast).toEqual(ast);
  });

  it('sorts parallel turns', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'M', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'r', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'E', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'd', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.Double },
          ],
        },
      ],
    };

    const traverser = new Traverser(ast, Cleaner);

    traverser.run();

    expect(traverser.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'r', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'M', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'd', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'E', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.Double },
          ],
        },
      ],
    });
  });

  it('merges consecutive turns of a sequence', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'L', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'L', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
          ],
        },
      ],
    };

    const traverser = new Traverser(ast, Cleaner);

    traverser.run();

    expect(traverser.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
          ],
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
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
          ],
        },
      ],
    };

    const traverser = new Traverser(ast, Cleaner);

    traverser.run();

    expect(traverser.ast).toEqual({ type: NodeTypes.Algorithm, body: [] });
  });

  it('rearranges the algorithm when the conjugate setup cancels with the commutator interchange', () => {
    // Single/Single ([U: [U, L E L']] > [U2: [L E L', U']])
    const ast1: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
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
                      move: 'U',
                      direction: Direction.CW,
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
                      move: 'L',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'E',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'L',
                      direction: Direction.CCW,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    // Single/Double ([U': [U2, R D' R']] > [U: [R D' R', U2]])
    const ast2: AST = {
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
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.Double,
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
            },
          ],
        },
      ],
    };

    // Double/Single ([R2 D2: [D, R U' R']] > [R2 D': [R U' R', D']])
    const ast3: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                {
                  type: NodeTypes.Turn,
                  move: 'R',
                  direction: Direction.Double,
                },
                {
                  type: NodeTypes.Turn,
                  move: 'D',
                  direction: Direction.Double,
                },
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
                      move: 'D',
                      direction: Direction.CW,
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
            },
          ],
        },
      ],
    };

    const traverser1 = new Traverser(ast1, Cleaner);
    const traverser2 = new Traverser(ast2, Cleaner);
    const traverser3 = new Traverser(ast3, Cleaner);

    traverser1.run();
    traverser2.run();
    traverser3.run();

    expect(traverser1.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                {
                  type: NodeTypes.Turn,
                  move: 'U',
                  direction: Direction.Double,
                },
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
                      move: 'L',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'E',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'L',
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

    expect(traverser2.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
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
                      direction: Direction.Double,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    expect(traverser3.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                {
                  type: NodeTypes.Turn,
                  move: 'R',
                  direction: Direction.Double,
                },
                { type: NodeTypes.Turn, move: 'D', direction: Direction.CCW },
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

  it('removes repeating groups with multiplier 0', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
              ],
            },
          ],
          multiplier: 0,
        },
      ],
    };

    const traverser = new Traverser(ast, Cleaner);

    traverser.run();

    expect(traverser.ast).toEqual({ type: NodeTypes.Algorithm, body: [] });
  });

  it('flattens repeating groups with multiplier 1', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'y', direction: Direction.CW },
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
                      move: 'M',
                      direction: Direction.CW,
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
          ],
          multiplier: 1,
        },
      ],
    };

    const traverser = new Traverser(ast, Cleaner);

    traverser.run();

    expect(traverser.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [{ type: NodeTypes.Turn, move: 'y', direction: Direction.CW }],
        },
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'M', direction: Direction.CW },
              ],
            },
          ],
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
              ],
            },
          ],
        },
      ],
    });
  });

  it('flattens repeating groups to a sequence when multiplying a single turn', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
              ],
            },
          ],
          multiplier: 6,
        },
      ],
    };

    const traverser = new Traverser(ast, Cleaner);

    traverser.run();

    expect(traverser.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.Double },
          ],
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

    const traverser1 = new Traverser(ast1, Validator);
    const traverser2 = new Traverser(ast2, Validator);

    expect(() => traverser1.run()).not.toThrow();
    expect(() => traverser2.run()).toThrow();
  });
});

describe('Sequencer visitor', () => {
  it('does nothing when sequencing a sequence', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
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
    };

    const traverser = new Traverser(ast, Sequencer);

    traverser.run();

    expect(traverser.ast).toEqual(ast);
  });

  it('flattens multiple sequences', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
          ],
        },
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
          ],
        },
      ],
    };

    const traverser = new Traverser(ast, Sequencer);

    traverser.run();

    expect(traverser.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
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
                  type: NodeTypes.Repeating,
                  multiplicand: [
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
                  multiplier: 2,
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
    };

    const traverser = new Traverser(ast, Sequencer);

    traverser.run();

    expect(traverser.ast).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'z', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'D', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'D', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'z', direction: Direction.CW },
          ],
        },
      ],
    });
  });
});
