import { NodeTypes } from '../Parser';
import { Visitor } from './Visitor';

export const validator: Visitor = {
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
