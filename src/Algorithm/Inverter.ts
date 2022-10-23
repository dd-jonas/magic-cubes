import {
  AlgorithmNode,
  createAlgorithm,
  createCommutator,
  createConjugate,
  createRepeating,
  createSequence,
  Node,
  NodeTypes,
  TurnNode,
} from './Nodes';
import { Turn } from './Turn';

/**
 * Special type of traverser to inverse an algorithm
 */

class Inverter {
  ast: AlgorithmNode;

  constructor(ast: AlgorithmNode) {
    this.ast = ast;
  }

  private invertNode(node: Node): Node {
    switch (node.type) {
      case NodeTypes.Turn:
        return Turn.invert(node);
      case NodeTypes.Sequence:
        return createSequence([...this.invertArray(node.turns)] as TurnNode[]);
      case NodeTypes.Conjugate:
        return createConjugate(node.A, this.invertArray(node.B));
      case NodeTypes.Commutator:
        return createCommutator(node.B, node.A);
      case NodeTypes.Repeating:
        return createRepeating(this.invertArray(node.multiplicand), node.multiplier);
      case NodeTypes.Algorithm:
        return createAlgorithm(this.invertArray(node.body));
    }
  }

  private invertArray(nodes: Node[]) {
    return nodes.map((node) => this.invertNode(node)).reverse();
  }

  run() {
    this.ast = this.invertNode(this.ast) as AlgorithmNode;
  }
}

export const invert = (ast: AlgorithmNode) => {
  const inverter = new Inverter(ast);
  inverter.run();

  return inverter.ast;
};
