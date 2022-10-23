export enum NodeTypes {
  Turn = 'turn',
  Sequence = 'sequence',
  Conjugate = 'conjugate',
  Commutator = 'commutator',
  Repeating = 'repeating group',
  Algorithm = 'algorithm',
}

export type FaceMove = 'U' | 'F' | 'R' | 'D' | 'B' | 'L';
export type WideMove = 'u' | 'f' | 'r' | 'd' | 'b' | 'l';
export type SliceMove = 'M' | 'E' | 'S';
export type RotationMove = 'x' | 'y' | 'z';
export type Move = FaceMove | WideMove | SliceMove | RotationMove;

export enum Direction {
  CW = 1,
  Double = 2,
  CCW = 3,
}

type BaseTurnNode<M extends Move> = {
  type: NodeTypes.Turn;
  move: M;
  direction: Direction;
};

export type FaceTurnNode = BaseTurnNode<FaceMove>;
export type WideTurnNode = BaseTurnNode<WideMove>;
export type SliceTurnNode = BaseTurnNode<SliceMove>;
export type RotationTurnNode = BaseTurnNode<RotationMove>;
export type TurnNode = FaceTurnNode | WideTurnNode | SliceTurnNode | RotationTurnNode;

export type SequenceNode = {
  type: NodeTypes.Sequence;
  turns: Array<TurnNode>;
};

export type ConjugateNode = {
  type: NodeTypes.Conjugate;
  A: Array<Node>;
  B: Array<Node>;
};

export type CommutatorNode = {
  type: NodeTypes.Commutator;
  A: Array<Node>;
  B: Array<Node>;
};

export type RepeatingNode = {
  type: NodeTypes.Repeating;
  multiplicand: Array<Node>;
  multiplier: number;
};

export type AlgorithmNode = {
  type: NodeTypes.Algorithm;
  body: Array<Node>;
};

export type Node =
  | TurnNode
  | SequenceNode
  | ConjugateNode
  | CommutatorNode
  | RepeatingNode
  | AlgorithmNode;

// Helper functions for creating nodes

export const createTurn = <T extends TurnNode>(move: T['move'], direction: T['direction']): T =>
  ({
    type: NodeTypes.Turn,
    move,
    direction,
  } as T);

export const createSequence = (turns: MaybeArray<SequenceNode['turns']> = []): SequenceNode => ({
  type: NodeTypes.Sequence,
  turns: makeArray(turns),
});

export const createConjugate = (
  A: MaybeArray<ConjugateNode['A']> = [],
  B: MaybeArray<ConjugateNode['B']> = []
): ConjugateNode => ({
  type: NodeTypes.Conjugate,
  A: makeArray(A),
  B: makeArray(B),
});

export const createCommutator = (
  A: MaybeArray<CommutatorNode['A']> = [],
  B: MaybeArray<CommutatorNode['B']> = []
): CommutatorNode => ({
  type: NodeTypes.Commutator,
  A: makeArray(A),
  B: makeArray(B),
});

export const createRepeating = (
  multiplicand: MaybeArray<RepeatingNode['multiplicand']> = [],
  multiplier: RepeatingNode['multiplier'] = 0
): RepeatingNode => ({
  type: NodeTypes.Repeating,
  multiplicand: makeArray(multiplicand),
  multiplier,
});

export const createAlgorithm = (body: MaybeArray<AlgorithmNode['body']> = []): AlgorithmNode => ({
  type: NodeTypes.Algorithm,
  body: makeArray(body),
});

type MaybeArray<T extends unknown[]> = T | T[number];

// TODO: Fix TS error
function makeArray<T>(value: T): T extends unknown[] ? T : T[] {
  // @ts-ignore
  return Array.isArray(value) ? value : [value];
}
