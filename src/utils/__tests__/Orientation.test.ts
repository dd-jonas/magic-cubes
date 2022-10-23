import { assert, describe, it } from 'vitest';

import {
  createTurn,
  Direction,
  FaceMove,
  FaceTurnNode,
  RotationMove,
  RotationTurnNode,
  SliceMove,
  SliceTurnNode,
  WideMove,
  WideTurnNode,
} from '../../Algorithm/Nodes';
import { Orientation } from '../Orientation';

const { CW, CCW, Double } = Direction;
const [x, y, z] = ['x', 'y', 'z'] as const;

const rotation = (move: RotationMove, direction: Direction) =>
  createTurn<RotationTurnNode>(move, direction);

const turn = (move: FaceMove | WideMove | SliceMove, direction: Direction) =>
  createTurn<FaceTurnNode | WideTurnNode | SliceTurnNode>(move, direction);

describe('Orientation', () => {
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

    assert.equal(orientation.getFace('U'), 'D');
    assert.equal(orientation.getFace('F'), 'R');
    assert.equal(orientation.getFace('R'), 'F');
    assert.equal(orientation.getFace('D'), 'U');
    assert.equal(orientation.getFace('B'), 'L');
    assert.equal(orientation.getFace('L'), 'B');
  });

  it('checks if it is orientated', () => {
    const orientation = new Orientation();

    assert.isTrue(orientation.isOriented);

    orientation.rotate(rotation('x', CW));

    assert.isFalse(orientation.isOriented);

    orientation.rotate(rotation('x', CCW));

    assert.isTrue(orientation.isOriented);
  });

  it('resets the orientation', () => {
    const rotations: RotationTurnNode[] = [rotation(x, CCW), rotation(y, CCW), rotation(z, Double)];

    const orientation = new Orientation();
    rotations.forEach((rotation) => orientation.rotate(rotation));

    assert.isFalse(orientation.isOriented);

    orientation.reset();

    assert.isTrue(orientation.isOriented);
    assert.equal(orientation.getFace('U'), 'U');
    assert.equal(orientation.getFace('F'), 'F');
    assert.equal(orientation.getFace('R'), 'R');
    assert.equal(orientation.getFace('D'), 'D');
    assert.equal(orientation.getFace('B'), 'B');
    assert.equal(orientation.getFace('L'), 'L');
  });

  it('gets the corresponding turn based on the current orientation', () => {
    const rotations: RotationTurnNode[] = [rotation(x, CW), rotation(z, Double)];

    const orientation = new Orientation();
    rotations.forEach((rotation) => orientation.rotate(rotation));

    // Face moves
    assert.deepEqual(orientation.getTurn(turn('F', CW)), turn('D', CW));
    assert.deepEqual(orientation.getTurn(turn('R', CCW)), turn('L', CCW));
    assert.deepEqual(orientation.getTurn(turn('D', Double)), turn('F', Double));

    // Wide moves
    assert.deepEqual(orientation.getTurn(turn('b', CW)), turn('u', CW));
    assert.deepEqual(orientation.getTurn(turn('l', CCW)), turn('r', CCW));
    assert.deepEqual(orientation.getTurn(turn('u', Double)), turn('b', Double));

    // Slice moves
    assert.deepEqual(orientation.getTurn(turn('M', CW)), turn('M', CCW));
    assert.deepEqual(orientation.getTurn(turn('M', CCW)), turn('M', CW));
    assert.deepEqual(orientation.getTurn(turn('E', CW)), turn('S', CW));
    assert.deepEqual(orientation.getTurn(turn('E', Double)), turn('S', Double));
    assert.deepEqual(orientation.getTurn(turn('S', CCW)), turn('E', CCW));
  });
});
