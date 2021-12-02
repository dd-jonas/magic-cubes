import { Orientation } from '../../utils/Orientation';
import { NodeTypes, SequenceNode, TurnNode } from '../Parser';
import { Turn } from '../Turn';
import { Visitor } from './Visitor';

//
// Cleaner rules:
//
//   1. Sequence: Merge same turns
//     "R F B2 y L' R F" -> "R B' y F"
//
//   2. Conjugate: Invert commutator when cancelling with setup
//     "[U: [U, L E L']]""- > "[U2: [L E L', U']]"
//
//   3. Repeating: Remove if multiplier is 0
//     "(R U R' U')0" -> ""
//
//   4. Repeating: Flatten if multiplier is 1
//     "(R U R' U')1" -> "R U R' U'"
//
//   5. Repeating: Flatten when multiplying a single turn
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

        const sortOrder = [...'UFRDBL', ...'ufrdbl', ...'MES', ...'xyz'];

        return moves
          .sort((a, b) => sortOrder.indexOf(a) - sortOrder.indexOf(b))
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

  [NodeTypes.Conjugate]: (node) => {
    // 2. Invert commutator when cancelling with setup
    if (
      // Setup ends with sequence
      node.A[node.A.length - 1].type === NodeTypes.Sequence &&
      // Setup is followed by a commutator
      node.B.length === 1 &&
      node.B[0].type === NodeTypes.Commutator &&
      // Commutator starts with interchange
      node.B[0].A.length === 1 &&
      node.B[0].A[0].type === NodeTypes.Sequence &&
      node.B[0].A[0].turns.length === 1
    ) {
      const setupSequence = node.A[node.A.length - 1] as SequenceNode;
      const lastTurnOfSetup =
        setupSequence.turns[setupSequence.turns.length - 1];
      const interchange = node.B[0].A[0].turns[0];

      let newLastTurnOfSetup: TurnNode | undefined;
      let newInterchange: TurnNode | undefined;

      // Single/Single ([U: [U, L E L']] -> [U2: [L E L', U']])
      if (
        Turn.isSingleTurn(lastTurnOfSetup) &&
        Turn.isSingleTurn(interchange) &&
        Turn.isSameMove(lastTurnOfSetup, interchange)
      ) {
        newLastTurnOfSetup = Turn.repeat(lastTurnOfSetup, 2)!;
        newInterchange = Turn.invert(interchange);
      }

      // Single/Double ([U': [U2, R D' R']] -> [U: [R D' R', U2]])
      if (
        Turn.isSingleTurn(lastTurnOfSetup) &&
        Turn.isDoubleleTurn(interchange) &&
        Turn.isSameMove(lastTurnOfSetup, interchange)
      ) {
        newLastTurnOfSetup = Turn.invert(lastTurnOfSetup);
        newInterchange = interchange;
      }

      // Double/Single ([R2 D2: [D, R U' R']] -> [R2 D': [R U' R', D']])
      if (
        Turn.isDoubleleTurn(lastTurnOfSetup) &&
        Turn.isSingleTurn(interchange) &&
        Turn.isSameMove(lastTurnOfSetup, interchange)
      ) {
        newLastTurnOfSetup = Turn.invert(interchange);
        newInterchange = Turn.invert(interchange);
      }

      if (newLastTurnOfSetup && newInterchange) {
        return {
          type: NodeTypes.Conjugate,
          A: [
            ...node.A.slice(0, -1),
            {
              type: NodeTypes.Sequence,
              turns: [...setupSequence.turns.slice(0, -1), newLastTurnOfSetup],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: node.B[0].B,
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [newInterchange],
                },
              ],
            },
          ],
        };
      }
    }

    return node;
  },

  [NodeTypes.Commutator]: (node) => node,

  [NodeTypes.Repeating]: (node) => {
    // 3. Remove if multiplier is 0
    if (node.multiplier === 0) {
      return null;
    }

    // 4. Flatten if multiplier is 1
    if (node.multiplier === 1) {
      return node.multiplicand;
    }

    // 5. Flatten when multiplying a single turn
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
