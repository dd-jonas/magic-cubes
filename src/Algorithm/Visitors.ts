import {
  AlgorithmNode,
  CommutatorNode,
  ConjugateNode,
  Node,
  NodeTypes,
  RepeatingNode,
  SequenceNode,
  TurnNode,
} from './Parser';
import { Turn } from './Turn';

type VisitorFn<T extends Node> = (node: T) => Node | Node[] | null;

export type Visitor = Readonly<{
  [NodeTypes.Turn]: VisitorFn<TurnNode>;
  [NodeTypes.Sequence]: VisitorFn<SequenceNode>;
  [NodeTypes.Conjugate]: VisitorFn<ConjugateNode>;
  [NodeTypes.Commutator]: VisitorFn<CommutatorNode>;
  [NodeTypes.Repeating]: VisitorFn<RepeatingNode>;
  [NodeTypes.Algorithm]: (node: AlgorithmNode) => AlgorithmNode;
}>;

/**
 * Cleaner
 */

export const Cleaner: Visitor = {
  [NodeTypes.Turn]: (node) => node,

  [NodeTypes.Sequence]: (node) => {
    // Sort parallel moves
    let sortedTurns: TurnNode[] = [];

    node.turns.forEach((turn) => {
      let previousTurn = sortedTurns[sortedTurns.length - 1];

      if (previousTurn && Turn.isParallel(previousTurn, turn)) {
        // Pop all parallel moves in new array
        const parallelTurns = [turn];

        while (previousTurn && Turn.isParallel(previousTurn, turn)) {
          parallelTurns.push(sortedTurns.pop()!);
          previousTurn = sortedTurns[sortedTurns.length - 1];
        }

        // Sort array
        const sortOrder = [
          ['U', 'F', 'R', 'D', 'B', 'L'],
          ['u', 'f', 'r', 'b', 'd', 'l'],
          ['M', 'E', 'S'],
        ];

        parallelTurns.sort((turn1, turn2) => {
          return (
            sortOrder.findIndex((array) => array.includes(turn1.move)) -
            sortOrder.findIndex((array) => array.includes(turn2.move))
          );
        });

        // Place back
        sortedTurns = sortedTurns.concat(parallelTurns);
      } else {
        sortedTurns.push(turn);
      }
    });

    node.turns = sortedTurns;

    // Merge same turns
    let mergedTurns: TurnNode[] = [];

    node.turns.forEach((turn) => {
      const previousTurn = mergedTurns[mergedTurns.length - 1];

      if (previousTurn && Turn.isSameMove(previousTurn, turn)) {
        const mergedTurn = Turn.merge(turn, mergedTurns.pop()!);

        if (mergedTurn) {
          mergedTurns = mergedTurns.concat(mergedTurn);
        }
      } else {
        mergedTurns.push(turn);
      }
    });

    node.turns = mergedTurns;

    // Remove node if turns array is empty
    if (node.turns.length === 0) {
      return null;
    }

    return node;
  },

  [NodeTypes.Conjugate]: (node) => {
    // Conjugate setup cancels with commutator interchange
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

      // Single/Single ([U: [U, L E L']] > [U2: [L E L', U']])
      if (
        Turn.isSingleTurn(lastTurnOfSetup) &&
        Turn.isSingleTurn(interchange) &&
        Turn.isSameMove(lastTurnOfSetup, interchange)
      ) {
        newLastTurnOfSetup = Turn.repeat(lastTurnOfSetup, 2)!;
        newInterchange = Turn.invert(interchange);
      }

      // Single/Double ([U': [U2, R D' R']] > [U: [R D' R', U2]])
      if (
        Turn.isSingleTurn(lastTurnOfSetup) &&
        Turn.isDoubleleTurn(interchange) &&
        Turn.isSameMove(lastTurnOfSetup, interchange)
      ) {
        newLastTurnOfSetup = Turn.invert(lastTurnOfSetup);
        newInterchange = interchange;
      }

      // Double/Single ([R2 D2: [D, R U' R']] > [R2 D': [R U' R', D']])
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
    // Remove node if multiplier is 0
    if (node.multiplier === 0) {
      return null;
    }

    // Flatten node if multiplier is 1
    if (node.multiplier === 1) {
      return node.multiplicand;
    }

    // Flatten to sequence when multiplying a single turn
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

/**
 * Validator
 */

export const Validator: Visitor = {
  [NodeTypes.Turn]: (node) => node,

  [NodeTypes.Sequence]: (node) => node,

  [NodeTypes.Conjugate]: (node) => node,

  [NodeTypes.Commutator]: (node) => node,

  [NodeTypes.Repeating]: (node) => {
    if (node.multiplier > 6) {
      throw new Error("Multiplier can't be higher than 6.");
    }

    return node;
  },

  [NodeTypes.Algorithm]: (node) => node,
};

/**
 * Sequencer
 */

const invertSequence = (node: SequenceNode): SequenceNode => {
  return {
    type: NodeTypes.Sequence,
    turns: [...node.turns].reverse().map((turn) => Turn.invert(turn)),
  };
};

export const Sequencer: Visitor = {
  [NodeTypes.Turn]: (node) => node,

  [NodeTypes.Sequence]: (node) => node,

  [NodeTypes.Conjugate]: (node) => {
    return [
      ...node.A,
      ...node.B,
      ...node.A.map((node) => invertSequence(node as SequenceNode)),
    ];
  },

  [NodeTypes.Commutator]: (node) => {
    return [
      ...node.A,
      ...node.B,
      ...node.A.map((node) => invertSequence(node as SequenceNode)),
      ...node.B.map((node) => invertSequence(node as SequenceNode)),
    ];
  },

  [NodeTypes.Repeating]: (node) => {
    return [...new Array(node.multiplier)].flatMap(() => node.multiplicand);
  },

  [NodeTypes.Algorithm]: (node) => {
    return {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Sequence,
          turns: node.body.reduce(
            (acc, node) => [...acc, ...(node as SequenceNode).turns],
            <TurnNode[]>[]
          ),
        },
      ],
    };
  },
};
