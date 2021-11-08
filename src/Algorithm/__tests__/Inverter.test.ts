import { invert } from '../Inverter';
import { Direction, NodeTypes } from '../Parser';

describe('Inverter', () => {
  it('inverts an empty algorithm', () => {
    const inverse = invert({ type: NodeTypes.Algorithm, body: [] });

    expect(inverse).toEqual({ type: NodeTypes.Algorithm, body: [] });
  });

  it('inverts a sequence', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.Double },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
            { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
            { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
          ],
        },
      ],
    });
  });

  it('inverts a conjugate', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
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

  it('inverts a commutator', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Commutator,
          A: [
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
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
              ],
            },
          ],
        },
      ],
    });
  });

  it('inverts a repeating group', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Repeating,
          multiplicand: [
            {
              type: NodeTypes.Sequence,
              turns: [
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CW },
                { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
                { type: NodeTypes.Turn, move: 'R', direction: Direction.CCW },
              ],
            },
          ],
          multiplier: 6,
        },
      ],
    });
  });

  it('inverts a complex algorithm (conjugate with nested commutator)', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
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
                      move: 'D',
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
    });
  });

  it('inverts a complex algorithm (multiple conjugates)', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
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

  it('inverts a complex algorithm (nested repeating group)', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
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
                      move: 'M',
                      direction: Direction.CCW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.CCW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'M',
                      direction: Direction.CW,
                    },
                    {
                      type: NodeTypes.Turn,
                      move: 'U',
                      direction: Direction.CCW,
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
});
