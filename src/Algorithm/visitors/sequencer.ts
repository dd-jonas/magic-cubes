import { NodeTypes, SequenceNode, TurnNode } from '../Parser';
import { Turn } from '../Turn';
import { Visitor } from './Visitor';

const invertSequence = (node: SequenceNode): SequenceNode => {
  return {
    type: NodeTypes.Sequence,
    turns: [...node.turns].reverse().map((turn) => Turn.invert(turn)),
  };
};

export const sequencer: Visitor = {
  [NodeTypes.Turn]: (node) => node,

  [NodeTypes.Sequence]: (node) => node,

  [NodeTypes.Conjugate]: (node) => {
    return [...node.A, ...node.B, ...node.A.map((node) => invertSequence(node as SequenceNode))];
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
