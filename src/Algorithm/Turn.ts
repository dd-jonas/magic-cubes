import {
  Direction,
  FaceMove,
  Move,
  NodeTypes,
  RotationMove,
  SliceMove,
  TurnNode,
  WideMove,
} from './Parser';

export type FaceTurnNode = {
  type: NodeTypes.Turn;
  move: FaceMove;
  direction: Direction;
};

export type WideTurnNode = {
  type: NodeTypes.Turn;
  move: WideMove;
  direction: Direction;
};

export type SliceTurnNode = {
  type: NodeTypes.Turn;
  move: SliceMove;
  direction: Direction;
};

export type RotationTurnNode = {
  type: NodeTypes.Turn;
  move: RotationMove;
  direction: Direction;
};

const turn = (move: Move, direction: Direction): TurnNode => ({
  type: NodeTypes.Turn,
  move,
  direction,
});

const cw = Direction.CW;
const ccw = Direction.CCW;
const double = Direction.Double;

export class Turn {
  /**
   * Map wide and slice turns to outer turns and a rotation.
   */
  static wideAndSliceMap: Record<
    WideMove | SliceMove,
    Record<Direction, TurnNode[]>
  > = {
    u: {
      [Direction.CW]: [turn('D', cw), turn('y', cw)],
      [Direction.CCW]: [turn('D', ccw), turn('y', ccw)],
      [Direction.Double]: [turn('D', double), turn('y', double)],
    },
    f: {
      [Direction.CW]: [turn('B', cw), turn('z', cw)],
      [Direction.CCW]: [turn('B', ccw), turn('z', ccw)],
      [Direction.Double]: [turn('B', double), turn('z', double)],
    },
    r: {
      [Direction.CW]: [turn('L', cw), turn('x', cw)],
      [Direction.CCW]: [turn('L', ccw), turn('x', ccw)],
      [Direction.Double]: [turn('L', double), turn('x', double)],
    },
    d: {
      [Direction.CW]: [turn('U', cw), turn('y', ccw)],
      [Direction.CCW]: [turn('U', ccw), turn('y', cw)],
      [Direction.Double]: [turn('U', double), turn('y', double)],
    },
    b: {
      [Direction.CW]: [turn('F', cw), turn('z', ccw)],
      [Direction.CCW]: [turn('F', ccw), turn('z', cw)],
      [Direction.Double]: [turn('F', double), turn('z', double)],
    },
    l: {
      [Direction.CW]: [turn('R', cw), turn('x', ccw)],
      [Direction.CCW]: [turn('R', ccw), turn('x', cw)],
      [Direction.Double]: [turn('R', double), turn('x', double)],
    },
    M: {
      [Direction.CW]: [turn('R', cw), turn('L', ccw), turn('x', ccw)],
      [Direction.CCW]: [turn('R', ccw), turn('L', cw), turn('x', cw)],
      [Direction.Double]: [
        turn('R', double),
        turn('L', double),
        turn('x', double),
      ],
    },
    E: {
      [Direction.CW]: [turn('U', cw), turn('D', ccw), turn('y', ccw)],
      [Direction.CCW]: [turn('U', ccw), turn('D', cw), turn('y', cw)],
      [Direction.Double]: [
        turn('U', double),
        turn('D', double),
        turn('y', double),
      ],
    },
    S: {
      [Direction.CW]: [turn('F', ccw), turn('B', cw), turn('z', cw)],
      [Direction.CCW]: [turn('F', cw), turn('B', ccw), turn('z', ccw)],
      [Direction.Double]: [
        turn('F', double),
        turn('B', double),
        turn('z', double),
      ],
    },
  };

  static merge(turn1: TurnNode, turn2: TurnNode): TurnNode | TurnNode[] | null {
    if (turn1.move !== turn2.move) {
      return [turn1, turn2];
    }

    const newDirection = (turn1.direction + turn2.direction) % 4;

    return newDirection === 0
      ? null
      : { type: NodeTypes.Turn, move: turn1.move, direction: newDirection };
  }

  static repeat(turn: TurnNode, multiplier: number): TurnNode | null {
    const newDirection = (turn.direction * multiplier) % 4;

    return newDirection === 0
      ? null
      : { type: NodeTypes.Turn, move: turn.move, direction: newDirection };
  }

  static invert(turn: TurnNode): TurnNode {
    return {
      ...turn,
      direction:
        turn.direction === Direction.CW
          ? Direction.CCW
          : turn.direction === Direction.CCW
          ? Direction.CW
          : turn.direction,
    };
  }

  static isParallel(turn1: TurnNode, turn2: TurnNode) {
    const group1 = ['U', 'D', 'u', 'd', 'E'];
    const group2 = ['F', 'B', 'f', 'b', 'S'];
    const group3 = ['R', 'L', 'r', 'l', 'M'];

    return (
      (group1.includes(turn1.move) && group1.includes(turn2.move)) ||
      (group2.includes(turn1.move) && group2.includes(turn2.move)) ||
      (group3.includes(turn1.move) && group3.includes(turn2.move))
    );
  }

  static isFaceTurn = (turn: TurnNode): turn is FaceTurnNode => {
    return ['U', 'F', 'R', 'D', 'B', 'L'].includes(turn.move);
  };

  static isWideTurn = (turn: TurnNode): turn is WideTurnNode => {
    return ['u', 'f', 'r', 'd', 'b', 'l'].includes(turn.move);
  };

  static isSliceTurn = (turn: TurnNode): turn is SliceTurnNode => {
    return ['M', 'E', 'S'].includes(turn.move);
  };

  static isRotationTurn = (turn: TurnNode): turn is RotationTurnNode => {
    return ['x', 'y', 'z'].includes(turn.move);
  };

  static isSameMove(turn1: TurnNode, turn2: TurnNode) {
    return turn1.move === turn2.move;
  }

  static isSingleTurn(turn: TurnNode) {
    return turn.direction === Direction.CW || turn.direction === Direction.CCW;
  }

  static isDoubleleTurn(turn: TurnNode) {
    return turn.direction === Direction.Double;
  }
}
