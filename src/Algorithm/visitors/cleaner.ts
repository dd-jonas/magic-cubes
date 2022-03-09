import { Orientation } from '../../utils/Orientation';
import { NodeTypes, TurnNode } from '../Parser';
import { Turn } from '../Turn';
import { Visitor } from './Visitor';

//
// Cleaner rules:
//
//   1. Sequence: Merge same turns
//     "R F B2 y L' R F" -> "R B' y F"
//
//   2. Repeating: Remove if multiplier is 0
//     "(R U R' U')0" -> ""
//
//   3. Repeating: Flatten if multiplier is 1
//     "(R U R' U')1" -> "R U R' U'"
//
//   4. Repeating: Flatten when multiplying a single turn
//     "(R)6" -> "R2"
//

export const cleaner: Visitor = {
  [NodeTypes.Turn]: (node) => node,

  [NodeTypes.Sequence]: (node) => {
    // 1. Merge same turns
    const merge = (turns: TurnNode[]): TurnNode[] => {
      const orientation = new Orientation();

      const groupedByParallel = turns.reduce(
        (groups: TurnNode[][], turn: TurnNode) => {
          const lastGroup = groups[groups.length - 1];

          if (!lastGroup) {
            return [[turn]];
          }

          if (Turn.isRotationTurn(turn)) {
            // Track rotation for current group
            orientation.rotate(turn);
            // Add rotation to the end of the last group
            lastGroup.push(turn);
          } else if (Turn.isParallel(orientation.getTurn(turn), lastGroup[0])) {
            // Add to the last group if parallel
            // Move the mapped turn in front of any previous rotations to allow for easy merging
            // Note that the order of parallel moves does not matter, as long as moves are mapped correctly
            // e.g. "U2 z M F2" -> [['E', 'U2', 'z'], ['F2']]
            lastGroup.unshift(orientation.getTurn(turn));
          } else {
            orientation.reset();
            groups.push([turn]);
          }

          return groups;
        },
        []
      );

      const groupedByMove = groupedByParallel.flatMap((group) => {
        // Get all unique moves
        const moves = [...new Set(group.map((turn) => turn.move))];

        const sortOrder = ['UFR', 'DBL', 'ufr', 'dbl', 'MES', 'xyz'];

        return moves
          .sort((a, b) => {
            const indexA = sortOrder.findIndex((v) => v.includes(a));
            const indexB = sortOrder.findIndex((v) => v.includes(b));
            return indexA - indexB;
          })
          .map((move) => group.filter((turn) => turn.move === move));
      });

      const merged = groupedByMove
        .map((group) => {
          const move = group.reduce(
            (firstMove, secondMove) =>
              (Turn.merge(firstMove, secondMove) as TurnNode | null) ?? {
                type: NodeTypes.Turn,
                move: firstMove.move,
                direction: 0,
              }
          );

          return move.direction ? move : null;
        })
        .filter(Boolean) as TurnNode[];

      return merged;
    };

    // If anything was merged, repeat ("F R U U' R' F" -> "F R R' F" -> "F2")
    const turnsToString = (turns: TurnNode[]) =>
      turns.map((turn) => `${turn.move}${turn.direction}`).join();

    let merged = merge(node.turns);
    while (turnsToString(merged) !== turnsToString(merge(merged))) {
      merged = merge(merged);
    }

    node.turns = merged;

    // Remove node if turns array is empty
    if (node.turns.length === 0) {
      return null;
    }

    return node;
  },

  [NodeTypes.Conjugate]: (node) => node,

  [NodeTypes.Commutator]: (node) => node,

  [NodeTypes.Repeating]: (node) => {
    // 2. Remove if multiplier is 0
    if (node.multiplier === 0) {
      return null;
    }

    // 3. Flatten if multiplier is 1
    if (node.multiplier === 1) {
      return node.multiplicand;
    }

    // 4. Flatten when multiplying a single turn
    if (
      node.multiplicand.length === 1 &&
      node.multiplicand[0].type === NodeTypes.Sequence &&
      node.multiplicand[0].turns.length === 1
    ) {
      const sequence = node.multiplicand[0];
      const newTurn = Turn.repeat(sequence.turns[0], node.multiplier);

      return newTurn
        ? {
            type: NodeTypes.Sequence,
            turns: [newTurn],
          }
        : null;
    }

    return node;
  },

  [NodeTypes.Algorithm]: (node) => node,
};
