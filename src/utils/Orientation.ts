import {
  createTurn,
  FaceMove,
  FaceTurnNode,
  RotationTurnNode,
  SliceTurnNode,
  WideMove,
  WideTurnNode,
} from '../Algorithm/Nodes';
import { Turn } from '../Algorithm/Turn';

/**
 * Track the orientation of the cube
 */

export class Orientation {
  private orientation: Record<FaceMove, FaceMove> = {
    U: 'U',
    F: 'F',
    R: 'R',
    D: 'D',
    B: 'B',
    L: 'L',
  };

  /**
   * Check if the orientation is in the initial orientation
   */
  get isOriented() {
    return Object.entries(this.orientation).every(([position, face]) => position === face);
  }

  /**
   * Rotate the cube along the x, y or z axis.
   */
  rotate(rotation: RotationTurnNode) {
    const rotationCycles = {
      x: ['U', 'F', 'D', 'B'],
      y: ['F', 'R', 'B', 'L'],
      z: ['U', 'L', 'D', 'R'],
    } as const;

    const cycle = rotationCycles[rotation.move];
    const oldOrientation = { ...this.orientation };

    cycle.forEach((face, i) => {
      const previousLocation = cycle[(i + rotation.direction) % cycle.length];
      this.orientation[face] = oldOrientation[previousLocation];
    });
  }

  /**
   * Restore to default orientation.
   */
  reset() {
    (['U', 'F', 'R', 'D', 'B', 'L'] as const).forEach((face) => {
      this.orientation[face] = face;
    });
  }

  /**
   * Find a face ignoring orientation.
   * e.g. After a x rotation, U will evaluate to F.
   */
  getFace(move: FaceMove) {
    return this.orientation[move];
  }

  /**
   * Find a turn ignoring orientation.
   * e.g. After a y' rotation, M' will evaluate to S.
   */
  getTurn<T extends FaceTurnNode | WideTurnNode | SliceTurnNode>(turn: T): T {
    if (Turn.isFaceTurn(turn)) {
      return createTurn(this.getFace(turn.move), turn.direction);
    } else if (Turn.isWideTurn(turn)) {
      const face = turn.move.toUpperCase() as FaceMove;
      return createTurn(this.getFace(face).toLowerCase() as WideMove, turn.direction);
    } else if (Turn.isSliceTurn(turn)) {
      const sliceLikeFace = { M: 'L', E: 'D', S: 'F' } as const;
      const faceLikeSlice = { L: 'M', D: 'E', F: 'S' } as const;
      const oppositeFace = { R: 'L', U: 'D', B: 'F' } as const;

      // Slice turns MES follow the direction of face turns LDF
      const isLDF = (move: FaceMove): move is 'L' | 'D' | 'F' =>
        Object.keys(faceLikeSlice).includes(move);

      const face = this.getFace(sliceLikeFace[turn.move]);
      const move = faceLikeSlice[isLDF(face) ? face : oppositeFace[face]];

      return isLDF(face)
        ? createTurn(move, turn.direction)
        : Turn.invert(createTurn(move, turn.direction));
    } else {
      return turn;
    }
  }
}
