import { AST, Node, NodeTypes, TurnNode } from './Parser';
import { Turn } from './Turn';

/**
 * Special type of traverser to inverse an algorithm
 */

export class Inverter {
  ast: AST;

  constructor(ast: AST) {
    this.ast = ast;
  }

  private invertNode(node: Node): Node {
    switch (node.type) {
      case NodeTypes.Turn:
        return Turn.invert(node);
      case NodeTypes.Sequence:
        return {
          type: NodeTypes.Sequence,
          turns: [...this.invertArray(node.turns)] as TurnNode[],
        };
      case NodeTypes.Conjugate:
        return {
          type: NodeTypes.Conjugate,
          A: node.A,
          B: this.invertArray(node.B),
        };
      case NodeTypes.Commutator:
        return {
          type: NodeTypes.Commutator,
          A: node.B,
          B: node.A,
        };
      case NodeTypes.Repeating:
        return {
          type: NodeTypes.Repeating,
          multiplicand: this.invertArray(node.multiplicand),
          multiplier: node.multiplier,
        };
      case NodeTypes.Algorithm:
        return {
          type: NodeTypes.Algorithm,
          body: this.invertArray(node.body),
        };
    }
  }

  private invertArray(nodes: Node[]) {
    return nodes.map((node) => this.invertNode(node)).reverse();
  }

  run() {
    this.ast = this.invertNode(this.ast) as AST;
  }
}
