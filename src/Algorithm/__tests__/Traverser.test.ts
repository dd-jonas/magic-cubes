import { AST, Direction, NodeTypes } from '../Parser';
import { traverse } from '../Traverser';
import { Visitor } from '../visitors';

describe('Traverser', () => {
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
              turns: [
                { type: NodeTypes.Turn, move: 'z', direction: Direction.CCW },
              ],
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
                      turns: [
                        {
                          type: NodeTypes.Turn,
                          move: 'R',
                          direction: Direction.CW,
                        },
                        {
                          type: NodeTypes.Turn,
                          move: 'U',
                          direction: Direction.CW,
                        },
                        {
                          type: NodeTypes.Turn,
                          move: 'R',
                          direction: Direction.CCW,
                        },
                      ],
                    },
                  ],
                  multiplier: 2,
                },
              ],
              B: [
                {
                  type: NodeTypes.Sequence,
                  turns: [
                    {
                      type: NodeTypes.Turn,
                      move: 'D',
                      direction: Direction.CCW,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const visitor: Visitor = {
      [NodeTypes.Turn]: jest.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Sequence]: jest.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Conjugate]: jest.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Commutator]: jest.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Repeating]: jest.fn((node) => {
        order.push(node.type);
        return node;
      }),

      [NodeTypes.Algorithm]: jest.fn((node) => {
        order.push(node.type);
        return node;
      }),
    };

    traverse(ast, visitor);

    expect(order).toEqual([
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
