import {
  AlgorithmNode,
  CommutatorNode,
  ConjugateNode,
  Node,
  NodeTypes,
  RepeatingNode,
  SequenceNode,
  TurnNode,
} from '../Parser';

type VisitorFn<T extends Node> = (node: T) => Node | Node[] | null;

export type Visitor = Readonly<{
  [NodeTypes.Turn]: VisitorFn<TurnNode>;
  [NodeTypes.Sequence]: VisitorFn<SequenceNode>;
  [NodeTypes.Conjugate]: VisitorFn<ConjugateNode>;
  [NodeTypes.Commutator]: VisitorFn<CommutatorNode>;
  [NodeTypes.Repeating]: VisitorFn<RepeatingNode>;
  [NodeTypes.Algorithm]: (node: AlgorithmNode) => AlgorithmNode;
}>;
