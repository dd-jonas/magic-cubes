import {
  AlgorithmNode,
  AST,
  CommutatorNode,
  ConjugateNode,
  Direction,
  Node,
  NodeTypes,
  RepeatingNode,
  SequenceNode,
  TurnNode,
} from './Parser';

class Generator {
  private ast: AST;
  algorithm = '';

  constructor(ast: AST) {
    this.ast = ast;
  }

  private generateFromTurn(node: TurnNode) {
    switch (node.direction) {
      case Direction.CW:
        return node.move;
      case Direction.CCW:
        return `${node.move}'`;
      case Direction.Double:
        return `${node.move}2`;
    }
  }

  private generateFromSequence(node: SequenceNode) {
    return this.generateFromArray(node.turns);
  }

  private generateFromConjugate(node: ConjugateNode) {
    const A = this.generateFromArray(node.A);
    const B = this.generateFromArray(node.B);
    return `[${A}: ${B}]`;
  }

  private generateFromCommutator(node: CommutatorNode) {
    const A = this.generateFromArray(node.A);
    const B = this.generateFromArray(node.B);
    return `[${A}, ${B}]`;
  }

  private generateFromRepeating(node: RepeatingNode) {
    const multiplicand = this.generateFromArray(node.multiplicand);
    return `(${multiplicand})${node.multiplier}`;
  }

  private generateFromAlgorithm(node: AlgorithmNode) {
    return this.generateFromArray(node.body);
  }

  private generateFromNode(node: Node): string {
    switch (node.type) {
      case NodeTypes.Turn:
        return this.generateFromTurn(node);
      case NodeTypes.Sequence:
        return this.generateFromSequence(node);
      case NodeTypes.Conjugate:
        return this.generateFromConjugate(node);
      case NodeTypes.Commutator:
        return this.generateFromCommutator(node);
      case NodeTypes.Repeating:
        return this.generateFromRepeating(node);
      case NodeTypes.Algorithm:
        return this.generateFromAlgorithm(node);
    }
  }

  private generateFromArray(nodes: Node[]) {
    return nodes
      .map((node) => {
        return this.generateFromNode(node);
      })
      .join(' ');
  }

  run() {
    this.algorithm = this.generateFromNode(this.ast);
  }
}

export const generate = (ast: AST) => {
  const generator = new Generator(ast);
  generator.run();

  return generator.algorithm;
};
