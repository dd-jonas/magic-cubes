import { generate } from '../Generator';
import { Direction, NodeTypes } from '../Parser';

describe('Generator', () => {
  it('generates an empty algorithm', () => {
    const algorithm = generate({ type: NodeTypes.Algorithm, body: [] });

    expect(algorithm).toEqual('');
  });

  it('generates a sequence', () => {
    const algorithm = generate({
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

    expect(algorithm).toEqual("R U R' U R U2 R'");
  });

  it('generates a conjugate', () => {
    const algorithm = generate({
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

    expect(algorithm).toEqual("[R U R': D2]");
  });

  it('generates a commutator', () => {
    const algorithm = generate({
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

    expect(algorithm).toEqual("[R U R', D2]");
  });

  it('generates a repeating group', () => {
    const algorithm = generate({
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

    expect(algorithm).toEqual("(R U R' U')6");
  });

  it('generates a complex algorithm (conjugate with nested commutator)', () => {
    const algorithm = generate({
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

    expect(algorithm).toEqual("[z': [R U' R', D']]");
  });

  it('generates a complex algorithm (multiple conjugates)', () => {
    const algorithm = generate({
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

    expect(algorithm).toEqual("[U': [R D' R': U] [D' R D R': U']]");
  });

  it('generates a complex algorithm (nested repeating group)', () => {
    const algorithm = generate({
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

    expect(algorithm).toEqual("[M': (U M' U M)2]");
  });
});
