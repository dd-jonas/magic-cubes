import { AST, Node, NodeTypes } from './Parser';
import {
  cleaner,
  rotationlessSequencer,
  sequencer,
  validator,
  Visitor,
} from './visitors';

class Traverser {
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

export const traverse = (ast: AST, visitor: Visitor) => {
  const traverser = new Traverser(ast, visitor);
  traverser.run();

  return traverser.ast;
};

export const clean = (ast: AST) => traverse(ast, cleaner);
export const sequence = (ast: AST) => traverse(ast, sequencer);
export const rotationless = (ast: AST) =>
  traverse(traverse(ast, sequencer), rotationlessSequencer);
export const validate = (ast: AST) => traverse(ast, validator);
