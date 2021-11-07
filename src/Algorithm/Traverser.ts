import { AST, Node, NodeTypes } from './Parser';
import { Visitor } from './Visitors';

export class Traverser {
  private visitor: Visitor;
  ast: AST;

  constructor(ast: AST, visitor: Visitor) {
    this.ast = { ...ast };
    this.visitor = visitor;
  }

  private traverseNode(node: Node) {
    switch (node.type) {
      case NodeTypes.Turn:
        break;
      case NodeTypes.Sequence:
        node.turns = this.traverseArray(node.turns);
        break;
      case NodeTypes.Conjugate:
      case NodeTypes.Commutator:
        node.A = this.traverseArray(node.A);
        node.B = this.traverseArray(node.B);
        break;
      case NodeTypes.Repeating:
        node.multiplicand = this.traverseArray(node.multiplicand);
        break;
      case NodeTypes.Algorithm:
        node.body = this.traverseArray(node.body);
        break;
    }

    const action: any = this.visitor[node.type];
    return action?.(node);
  }

  private traverseArray<T extends Node = Node>(nodes: T[]) {
    return nodes
      .flatMap((node) => this.traverseNode(node))
      .filter(Boolean) as T[];
  }

  run() {
    this.ast = this.traverseNode(this.ast);
  }
}
