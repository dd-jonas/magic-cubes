import { assert, describe, it, vi } from 'vitest';

import {
  createAlgorithm as alg,
  createCommutator as comm,
  createConjugate as conj,
  createRepeating as rep,
  createSequence as seq,
  createTurn as turn,
  Direction,
  NodeTypes,
} from '../Nodes';
import { traverse } from '../Traverser';
import { Visitor } from '../visitors';

const { CW, CCW } = Direction;

describe.concurrent('Traverser', () => {
  const order: Array<NodeTypes> = [];

  it('calls visitor methods in the correct order', () => {
    // [z': [(R U R')2, D']]
    const ast = alg(
      conj(
        seq(turn('z', CCW)),
        comm(rep(seq([turn('R', CW), turn('U', CW), turn('R', CCW)]), 2), seq(turn('D', CCW)))
      )
    );

    const visitor: Visitor = {
      [NodeTypes.Turn]: vi.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Sequence]: vi.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Conjugate]: vi.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Commutator]: vi.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Repeating]: vi.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Algorithm]: vi.fn((node) => {
        order.push(node.type);
        return node;
      }),
    };

    traverse(ast, visitor);

    assert.deepEqual(order, [
      NodeTypes.Turn,
      NodeTypes.Sequence,
      NodeTypes.Turn,
      NodeTypes.Turn,
      NodeTypes.Turn,
      NodeTypes.Sequence,
      NodeTypes.Repeating,
      NodeTypes.Turn,
      NodeTypes.Sequence,
      NodeTypes.Commutator,
      NodeTypes.Conjugate,
      NodeTypes.Algorithm,
    ]);
  });
});
