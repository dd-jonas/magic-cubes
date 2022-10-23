import {
  createTurn,
  Direction,
  FaceTurnNode,
  Move,
  RotationTurnNode,
  SliceMove,
  SliceTurnNode,
  TurnNode,
  WideMove,
  WideTurnNode,
} from './Nodes';

const { CW, CCW, Double } = Direction;
const t = createTurn;

export class Turn {
  /**
   * Map wide and slice turns to outer turns and a rotation.
   */
  private static wideAndSliceMap: Record<WideMove | SliceMove, Record<Direction, TurnNode[]>> = {
    u: { [CW]: [t('D', CW), t('y', CW)],  [CCW]: [t('D', CCW), t('y', CCW)], [Double]: [t('D', Double), t('y', Double)], },
    f: { [CW]: [t('B', CW), t('z', CW)],  [CCW]: [t('B', CCW), t('z', CCW)], [Double]: [t('B', Double), t('z', Double)], },
    r: { [CW]: [t('L', CW), t('x', CW)],  [CCW]: [t('L', CCW), t('x', CCW)], [Double]: [t('L', Double), t('x', Double)], },
    d: { [CW]: [t('U', CW), t('y', CCW)], [CCW]: [t('U', CCW), t('y', CW)],  [Double]: [t('U', Double), t('y', Double)], },
    b: { [CW]: [t('F', CW), t('z', CCW)], [CCW]: [t('F', CCW), t('z', CW)],  [Double]: [t('F', Double), t('z', Double)], },
    l: { [CW]: [t('R', CW), t('x', CCW)], [CCW]: [t('R', CCW), t('x', CW)],  [Double]: [t('R', Double), t('x', Double)], },
    M: { [CW]: [t('R', CW), t('L', CCW), t('x', CCW)], [CCW]: [t('R', CCW), t('L', CW), t('x', CW)],  [Double]: [t('R', Double), t('L', Double), t('x', Double)], },
    E: { [CW]: [t('U', CW), t('D', CCW), t('y', CCW)], [CCW]: [t('U', CCW), t('D', CW), t('y', CW)],  [Double]: [t('U', Double), t('D', Double), t('y', Double)], },
    S: { [CW]: [t('F', CCW), t('B', CW), t('z', CW)],  [CCW]: [t('F', CW), t('B', CCW), t('z', CCW)], [Double]: [t('F', Double), t('B', Double), t('z', Double)], },
  }; // prettier-ignore

  static merge<M extends Move>(
    turn1: TurnNode & { move: M },
    turn2: TurnNode & { move: M }
  ): TurnNode | TurnNode[] | null {
    if (turn1.move !== turn2.move) {
      return [turn1, turn2];
    }

    const newDirection = (turn1.direction + turn2.direction) % 4;

    return newDirection === 0 ? null : createTurn(turn1.move, newDirection);
  }

  static repeat(turn: TurnNode, multiplier: number): TurnNode | null {
    const newDirection = (turn.direction * multiplier) % 4;

    return newDirection === 0 ? null : createTurn(turn.move, newDirection);
  }

  static invert<T extends TurnNode>(turn: T): T {
    const newDirection =
      turn.direction === Direction.CW
        ? Direction.CCW
        : turn.direction === Direction.CCW
        ? Direction.CW
        : turn.direction;

    return createTurn(turn.move, newDirection);
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

  static mapWideAndSliceTurn(turn: WideTurnNode | SliceTurnNode): TurnNode[] {
    return Turn.wideAndSliceMap[turn.move][turn.direction];
  }
}
