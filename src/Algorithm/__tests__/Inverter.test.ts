import { invert } from '../Inverter';
import { Direction, NodeTypes } from '../Parser';
import { turn } from '../Turn';

const { CW, CCW, Double } = Direction;

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

    expect(inverse).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: [
            turn('R', CW),
            turn('U', Double),
            turn('R', CCW),
            turn('U', CCW),
            turn('R', CW),
            turn('U', CCW),
            turn('R', CCW),
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

    expect(inverse).toEqual({
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

  it('inverts a commutator', () => {
    const inverse = invert({
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

    expect(inverse).toEqual({
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Commutator,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('D', Double)],
            },
          ],
          B: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('R', CW), turn('U', CW), turn('R', CCW)],
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
                turn('R', CW),
                turn('U', CW),
                turn('R', CCW),
                turn('U', CCW),
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
                turn('U', CW),
                turn('R', CW),
                turn('U', CCW),
                turn('R', CCW),
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

    expect(inverse).toEqual({
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
                  turns: [turn('D', CCW)],
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
                  turns: [
                    turn('D', CCW),
                    turn('R', CW),
                    turn('D', CW),
                    turn('R', CCW),
                  ],
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

    expect(inverse).toEqual({
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
                  turns: [
                    turn('D', CCW),
                    turn('R', CW),
                    turn('D', CW),
                    turn('R', CCW),
                  ],
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
                  turns: [turn('R', CW), turn('D', CCW), turn('R', CCW)],
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

  it('inverts a complex algorithm (nested repeating group)', () => {
    const inverse = invert({
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
                  turns: [
                    turn('U', CW),
                    turn('M', CCW),
                    turn('U', CW),
                    turn('M', CW),
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
              turns: [turn('M', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Repeating,
              multiplicand: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    turn('M', CCW),
                    turn('U', CCW),
                    turn('M', CW),
                    turn('U', CCW),
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
