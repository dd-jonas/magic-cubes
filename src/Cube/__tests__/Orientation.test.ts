import { Direction, NodeTypes } from '../../Algorithm/Parser';
import { RotationTurnNode } from '../../Algorithm/Turn';
import { Orientation } from '../Orientation';

describe('Orientation', () => {
  it('tracks rotations correctly', () => {
    const rotations: RotationTurnNode[] = [
      {
        type: NodeTypes.Turn,
        move: 'x',
        direction: Direction.CW,
      },
      {
        type: NodeTypes.Turn,
        move: 'y',
        direction: Direction.Double,
      },
      {
        type: NodeTypes.Turn,
        move: 'z',
        direction: Direction.CCW,
      },
      {
        type: NodeTypes.Turn,
        move: 'x',
        direction: Direction.CCW,
      },
      {
        type: NodeTypes.Turn,
        move: 'y',
        direction: Direction.Double,
      },
    ];
    const orientation = new Orientation();

    rotations.forEach((rotation) => orientation.rotate(rotation));

    expect(orientation.orientationMap).toEqual({
      U: 'D',
      F: 'R',
      R: 'F',
      D: 'U',
      B: 'L',
      L: 'B',
    });
  });
});
