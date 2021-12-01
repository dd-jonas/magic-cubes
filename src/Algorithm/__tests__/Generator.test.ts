import { generate } from '../Generator';
import { Direction, NodeTypes } from '../Parser';
import { turn } from '../Turn';

const { CW, CCW, Double } = Direction;

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

    expect(algorithm).toEqual("[M': (U M' U M)2]");
  });
});
