import { createSequence, NodeTypes, TurnNode } from '../Nodes';
import { Turn } from '../Turn';
import { Visitor } from './Visitor';

type Nullable<T> = T | null;

export const cleaner: Visitor = {
  [NodeTypes.Turn]: (node) => node,

  [NodeTypes.Sequence]: (node) => {
    // Merge consecutive turns with the same move
    const merge = (turns: TurnNode[]) =>
      turns
        .reduce(groupByMoveReducer, [])
        .map((group) => group.reduce(mergeTurnsReducer, null))
        .filter(Boolean) as TurnNode[];

    do {
      node.turns = merge(node.turns);
    } while (node.turns.length !== merge(node.turns).length);

    if (node.turns.length === 0) {
      return null;
    }

    return node;
  },

  [NodeTypes.Conjugate]: (node) => node,

  [NodeTypes.Commutator]: (node) => node,

  [NodeTypes.Repeating]: (node) => {
    // Remove if multiplier is 0
    if (node.multiplier === 0) {
      return null;
    }

    // Flatten if multiplier is 1
    if (node.multiplier === 1) {
      return node.multiplicand;
    }

    // Flatten when multiplying a single turn
    if (
      node.multiplicand.length === 1 &&
      node.multiplicand[0].type === NodeTypes.Sequence &&
      node.multiplicand[0].turns.length === 1
    ) {
      const sequence = node.multiplicand[0];
      const newTurn = Turn.repeat(sequence.turns[0], node.multiplier);

      return newTurn ? createSequence([newTurn]) : null;
    }

    return node;
  },

  [NodeTypes.Algorithm]: (node) => node,
};

// Group consecutive turns with the same move (e.g. [U, R, R2, D] -> [[U], [R, R2], [D]])
function groupByMoveReducer(groups: TurnNode[][], turn: TurnNode) {
  const lastGroup = groups.at(-1);
  const lastTurn = lastGroup?.at(-1);

  if (!lastGroup || lastTurn?.move !== turn.move) {
    groups.push([turn]);
  } else {
    lastGroup.push(turn);
  }

  return groups;
}

// Merge turns with the same move (e.g. [[U], [R, R2], [D]] -> [U, R', D])
function mergeTurnsReducer(mergedTurn: TurnNode | null, turn: TurnNode) {
  return mergedTurn ? (Turn.merge(mergedTurn, turn) as Nullable<TurnNode>) : turn;
}
