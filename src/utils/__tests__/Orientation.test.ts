import {
  Direction,
  FaceMove,
  NodeTypes,
  RotationMove,
  SliceMove,
  WideMove,
} from '../../Algorithm/Parser';
import {
  FaceTurnNode,
  RotationTurnNode,
  SliceTurnNode,
  WideTurnNode,
} from '../../Algorithm/Turn';
import { Orientation } from '../Orientation';

describe('Orientation', () => {
  const [x, y, z] = ['x', 'y', 'z'] as const;
  const { CW, CCW, Double } = Direction;

  const rotation = (
    move: RotationMove,
    direction: Direction
  ): RotationTurnNode => ({
    type: NodeTypes.Turn,
    move,
    direction,
  });

  const turn = (
    move: FaceMove | WideMove | SliceMove,
    direction: Direction
  ): FaceTurnNode | WideTurnNode | SliceTurnNode => ({
    type: NodeTypes.Turn,
    move,
    direction,
  });

  it('tracks rotations correctly', () => {
    const rotations: RotationTurnNode[] = [
      rotation(x, CW),
      rotation(y, Double),
      rotation(z, CCW),
      rotation(x, CCW),
      rotation(y, Double),
    ];

    const orientation = new Orientation();
    rotations.forEach((rotation) => orientation.rotate(rotation));

    expect(orientation.getFace('U')).toEqual('D');
    expect(orientation.getFace('F')).toEqual('R');
    expect(orientation.getFace('R')).toEqual('F');
    expect(orientation.getFace('D')).toEqual('U');
    expect(orientation.getFace('B')).toEqual('L');
    expect(orientation.getFace('L')).toEqual('B');
  });

  it('resets the orientation', () => {
    const rotations: RotationTurnNode[] = [
      rotation(x, CCW),
      rotation(y, CCW),
      rotation(z, Double),
    ];

    const orientation = new Orientation();
    rotations.forEach((rotation) => orientation.rotate(rotation));

    orientation.reset();

    expect(orientation.getFace('U')).toEqual('U');
    expect(orientation.getFace('F')).toEqual('F');
    expect(orientation.getFace('R')).toEqual('R');
    expect(orientation.getFace('D')).toEqual('D');
    expect(orientation.getFace('B')).toEqual('B');
    expect(orientation.getFace('L')).toEqual('L');
  });

  it('gets the corresponding turn based on the current orientation', () => {
    const rotations: RotationTurnNode[] = [
      rotation(x, CW),
      rotation(z, Double),
    ];

    const orientation = new Orientation();
    rotations.forEach((rotation) => orientation.rotate(rotation));

    // Face moves
    expect(orientation.getTurn(turn('F', CW))).toEqual(turn('D', CW));
    expect(orientation.getTurn(turn('R', CCW))).toEqual(turn('L', CCW));
    expect(orientation.getTurn(turn('D', Double))).toEqual(turn('F', Double));

    // Wide moves
    expect(orientation.getTurn(turn('b', CW))).toEqual(turn('u', CW));
    expect(orientation.getTurn(turn('l', CCW))).toEqual(turn('r', CCW));
    expect(orientation.getTurn(turn('u', Double))).toEqual(turn('b', Double));

    // Slice moves
    expect(orientation.getTurn(turn('M', CW))).toEqual(turn('M', CCW));
    expect(orientation.getTurn(turn('M', CCW))).toEqual(turn('M', CW));
    expect(orientation.getTurn(turn('E', CW))).toEqual(turn('S', CW));
    expect(orientation.getTurn(turn('E', Double))).toEqual(turn('S', Double));
    expect(orientation.getTurn(turn('S', CCW))).toEqual(turn('E', CCW));
  });
});
