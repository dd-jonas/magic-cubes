import { FaceMove } from '../Algorithm/Parser';
import { RotationTurnNode } from '../Algorithm/Turn';

/**
 * Track the orientation of the cube
 */

export class Orientation {
  readonly orientationMap: Record<FaceMove, FaceMove> = {
    U: 'U',
    F: 'F',
    R: 'R',
    D: 'D',
    B: 'B',
    L: 'L',
  };

  rotate(rotation: RotationTurnNode) {
    const rotationCycles = {
      x: ['U', 'F', 'D', 'B'],
      y: ['F', 'R', 'B', 'L'],
      z: ['U', 'L', 'D', 'R'],
    } as const;

    const cycle = rotationCycles[rotation.move];
    const oldOrientationMap = { ...this.orientationMap };

    cycle.forEach((face, i) => {
      const previousLocation = cycle[(i + rotation.direction) % cycle.length];
      this.orientationMap[face] = oldOrientationMap[previousLocation];
    });
  }

  reset() {
    (['U', 'F', 'R', 'D', 'B', 'L'] as const).forEach((face) => {
      this.orientationMap[face] = face;
    });
  }
}
