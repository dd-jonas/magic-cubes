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

export const turn = (move: Move, direction: Direction): TurnNode => ({
  type: NodeTypes.Turn,
  move,
  direction,
});

const { CW, CCW, Double } = Direction;

export class Turn {
  /**
   * Map wide and slice turns to outer turns and a rotation.
   */
  static wideAndSliceMap: Record<
    WideMove | SliceMove,
    Record<Direction, TurnNode[]>
  > = {
    u: {
      [CW]: [turn('D', CW), turn('y', CW)],
      [CCW]: [turn('D', CCW), turn('y', CCW)],
      [Double]: [turn('D', Double), turn('y', Double)],
    },
    f: {
      [CW]: [turn('B', CW), turn('z', CW)],
      [CCW]: [turn('B', CCW), turn('z', CCW)],
      [Double]: [turn('B', Double), turn('z', Double)],
    },
    r: {
      [CW]: [turn('L', CW), turn('x', CW)],
      [CCW]: [turn('L', CCW), turn('x', CCW)],
      [Double]: [turn('L', Double), turn('x', Double)],
    },
    d: {
      [CW]: [turn('U', CW), turn('y', CCW)],
      [CCW]: [turn('U', CCW), turn('y', CW)],
      [Double]: [turn('U', Double), turn('y', Double)],
    },
    b: {
      [CW]: [turn('F', CW), turn('z', CCW)],
      [CCW]: [turn('F', CCW), turn('z', CW)],
      [Double]: [turn('F', Double), turn('z', Double)],
    },
    l: {
      [CW]: [turn('R', CW), turn('x', CCW)],
      [CCW]: [turn('R', CCW), turn('x', CW)],
      [Double]: [turn('R', Double), turn('x', Double)],
    },
    M: {
      [CW]: [turn('R', CW), turn('L', CCW), turn('x', CCW)],
      [CCW]: [turn('R', CCW), turn('L', CW), turn('x', CW)],
      [Double]: [turn('R', Double), turn('L', Double), turn('x', Double)],
    },
    E: {
      [CW]: [turn('U', CW), turn('D', CCW), turn('y', CCW)],
      [CCW]: [turn('U', CCW), turn('D', CW), turn('y', CW)],
      [Double]: [turn('U', Double), turn('D', Double), turn('y', Double)],
    },
    S: {
      [CW]: [turn('F', CCW), turn('B', CW), turn('z', CW)],
      [CCW]: [turn('F', CW), turn('B', CCW), turn('z', CCW)],
      [Double]: [turn('F', Double), turn('B', Double), turn('z', Double)],
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

  static invert<T extends TurnNode>(turn: T): T {
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
