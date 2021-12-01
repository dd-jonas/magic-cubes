import { FaceMove, WideMove } from '../Algorithm/Parser';
import {
  FaceTurnNode,
  RotationTurnNode,
  SliceTurnNode,
  Turn,
  WideTurnNode,
} from '../Algorithm/Turn';

/**
 * Track the orientation of the cube
 */

export class Orientation {
  private map: Record<FaceMove, FaceMove> = {
    U: 'U',
    F: 'F',
    R: 'R',
    D: 'D',
    B: 'B',
    L: 'L',
  };

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
    const oldMap = { ...this.map };

    cycle.forEach((face, i) => {
      const previousLocation = cycle[(i + rotation.direction) % cycle.length];
      this.map[face] = oldMap[previousLocation];
    });
  }

  /**
   * Restore to default orientation.
   */
  reset() {
    (['U', 'F', 'R', 'D', 'B', 'L'] as const).forEach((face) => {
      this.map[face] = face;
    });
  }

  /**
   * Find a face ignoring orientation.
   * e.g. After a x rotation, U will evaluate to F.
   */
  getFace(move: FaceMove) {
    return this.map[move];
  }

  /**
   * Find a turn ignoring orientation.
   * e.g. After a y' rotation, M' will evaluate to S.
   */
  getTurn<T extends FaceTurnNode | WideTurnNode | SliceTurnNode>(turn: T): T {
    if (Turn.isFaceTurn(turn)) {
      return { ...turn, move: this.getFace(turn.move) };
    } else if (Turn.isWideTurn(turn)) {
      const face = turn.move.toUpperCase() as FaceMove;
      return {
        ...turn,
        move: this.getFace(face).toLowerCase() as WideMove,
      };
    } else if (Turn.isSliceTurn(turn)) {
      const sliceLikeFace = { M: 'L', E: 'D', S: 'F' } as const;
      const faceLikeSlice = { L: 'M', D: 'E', F: 'S' } as const;
      const oppositeFace = { R: 'L', U: 'D', B: 'F' } as const;

      const isLDF = (move: FaceMove): move is 'L' | 'D' | 'F' =>
        Object.keys(faceLikeSlice).includes(move);

      const face = this.getFace(sliceLikeFace[turn.move]);
      const move = faceLikeSlice[isLDF(face) ? face : oppositeFace[face]];

      return isLDF(face) ? { ...turn, move } : Turn.invert({ ...turn, move });
    } else {
      return turn;
    }
  }
}
