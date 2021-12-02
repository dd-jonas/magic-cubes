import { Orientation } from '../../utils/Orientation';
import { NodeTypes, TurnNode } from '../Parser';
import { Turn } from '../Turn';
import { Visitor } from './Visitor';

export const rotationlessSequencer: Visitor = {
  [NodeTypes.Turn]: (node) => node,

  [NodeTypes.Sequence]: (node) => {
    const orientation = new Orientation();

    node.turns = node.turns
      // Map wide turns and slice turns to face turns and rotations
      .flatMap((turn) =>
        Turn.isWideTurn(turn) || Turn.isSliceTurn(turn)
          ? Turn.wideAndSliceMap[turn.move][turn.direction]
          : turn
      )
      // Map face turns and remove rotations
      .reduce((rotationless, turn) => {
        if (Turn.isRotationTurn(turn)) {
          orientation.rotate(turn);
        } else {
          rotationless.push(orientation.getTurn(turn));
        }
        return rotationless;
      }, <TurnNode[]>[]);

    return node;
  },

  [NodeTypes.Conjugate]: (node) => node,

  [NodeTypes.Commutator]: (node) => node,

  [NodeTypes.Repeating]: (node) => node,

  [NodeTypes.Algorithm]: (node) => node,
};
