import { assert, describe, it, vi } from 'vitest';

import { AST, Direction, NodeTypes } from '../Parser';
import { traverse } from '../Traverser';
import { turn } from '../Turn';
import { Visitor } from '../visitors';

const { CW, CCW } = Direction;

describe.concurrent('Traverser', () => {
  const order: Array<NodeTypes> = [];

  it('calls visitor methods in the correct order', () => {
    const ast: AST = {
      type: NodeTypes.Algorithm,
      body: [
        {
          type: NodeTypes.Conjugate,
          A: [
            {
              type: NodeTypes.Sequence,
              turns: [turn('z', CCW)],
            },
          ],
          B: [
            {
              type: NodeTypes.Commutator,
              A: [
                {
                  type: NodeTypes.Repeating,
                  multiplicand: [
                    {
                      type: NodeTypes.Sequence,
                      turns: [turn('R', CW), turn('U', CW), turn('R', CCW)],
                    },
                  ],
                  multiplier: 2,
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [turn('D', CCW)],
                },
              ],
            },
          ],
        },
      ],
    };

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
