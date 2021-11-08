import { Token, TokenTypes } from './Lexer';

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

export enum NodeTypes {
  Turn = 'turn',
  Sequence = 'sequence',
  Conjugate = 'conjugate',
  Commutator = 'commutator',
  Repeating = 'repeating group',
  Algorithm = 'algorithm',
}

export type TurnNode = {
  type: NodeTypes.Turn;
  move: Move;
  direction: Direction;
};

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

export type ParseError = { index: number; message?: string };
export type AST = AlgorithmNode;

class Parser {
  private index = 0;
  private tokens: Token[];
  private errors: ParseError[] = [];
  ast: AST = { type: NodeTypes.Algorithm, body: [] };

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  /**
   * Get the token at the current index
   */
  private currentToken(): Token | undefined {
    return this.tokens[this.index];
  }

  /**
   * Get the token at the current index and increment the index
   */
  private nextToken(): Token | undefined {
    return this.tokens[++this.index];
  }

  /**
   * Get the current index
   */
  private createCheckpoint() {
    return this.index;
  }

  /**
   * Set the current index to a previous checkpoint
   */
  private restoreCheckpoint(checkpoint: number) {
    this.index = checkpoint;
  }

  /**
   * Push an error to the error stack
   */
  private createError(message?: string) {
    this.errors.push({
      index: this.index,
      ...(message && { message }),
    });
  }

  /**
   * Create an Error from the error with the highest index
   */
  private getDeepestError() {
    const { index, message } = this.errors.reduce((prev, current) =>
      current.index > prev.index ? current : prev
    );

    return new Error(
      message ??
        (index === this.tokens.length
          ? 'Unexpected end of input.'
          : `Unexpected token ${this.tokens[index].value} at position ${
              index + 1
            }.`)
    );
  }

  /**
   * Sequence = one or more turns
   */
  private parseSequence() {
    if (this.currentToken()?.type !== TokenTypes.Turn) {
      this.createError();
      return;
    }

    const node: SequenceNode = { type: NodeTypes.Sequence, turns: [] };

    let token = this.currentToken();
    while (token && token.type === TokenTypes.Turn) {
      const moveMatch = token.value.match(/^[UFRDBLufrdblMESxyz]/)!;
      const directionMatch = token.value.match(/['2]?$/)!;

      const move = moveMatch[0] as Move;
      const direction =
        directionMatch[0] === ''
          ? Direction.CW
          : directionMatch[0] === "'"
          ? Direction.CCW
          : Direction.Double;

      const turnNode: TurnNode = { type: NodeTypes.Turn, move, direction };

      node.turns.push(turnNode);
      token = this.nextToken();
    }

    return node;
  }

  /**
   * Shared logic for the conjugate and commutator parser
   */
  private parseConjugateOrCommutator(
    type: NodeTypes.Conjugate | NodeTypes.Commutator,
    node: ConjugateNode | CommutatorNode
  ) {
    if (this.currentToken()?.type !== TokenTypes.BracketOpen) {
      this.createError();
      return;
    }

    const checkpoint = this.createCheckpoint();

    let token = this.nextToken();
    while (
      token &&
      token.type !== TokenTypes.SeperatorConjugate &&
      token.type !== TokenTypes.SeperatorCommutator &&
      token.type !== TokenTypes.BracketClose
    ) {
      node.A.push(this.parseAny());
      token = this.currentToken();
    }

    const seperator =
      type === NodeTypes.Conjugate
        ? TokenTypes.SeperatorConjugate
        : TokenTypes.SeperatorCommutator;

    if (
      !token ||
      token.type === TokenTypes.BracketClose ||
      token.type !== seperator ||
      node.A.length === 0
    ) {
      const errorMessage =
        token?.type === TokenTypes.BracketClose
          ? 'Missing seperator : or , inside brackets.'
          : node.A.length === 0
          ? `Left side of ${type} can't be empty.`
          : undefined;
      this.createError(errorMessage);
      this.restoreCheckpoint(checkpoint);
      return;
    }

    token = this.nextToken();
    while (token && token.type !== TokenTypes.BracketClose) {
      node.B.push(this.parseAny());
      token = this.currentToken();
    }

    if (!token || node.B.length === 0) {
      const errorMessage =
        node.B.length === 0
          ? `Right side of ${type} can't be empty.`
          : undefined;
      this.createError(errorMessage);
      this.restoreCheckpoint(checkpoint);
      return;
    }

    this.nextToken();

    return node;
  }

  /**
   * Conjugate = [A: B]
   * where A and B are recursively parsed
   */
  private parseConjugate() {
    const node: ConjugateNode = { type: NodeTypes.Conjugate, A: [], B: [] };
    return this.parseConjugateOrCommutator(NodeTypes.Conjugate, node);
  }

  /**
   * Commutator = [A, B]
   * where A and B are recursively parsed
   */
  private parseCommutator() {
    const node: CommutatorNode = { type: NodeTypes.Commutator, A: [], B: [] };
    return this.parseConjugateOrCommutator(NodeTypes.Commutator, node);
  }

  /**
   * Repeating = (A)n
   * where A is recursively parsed and n is the multiplier
   */
  private parseRepeating() {
    if (this.currentToken()?.type !== TokenTypes.ParenthesisOpen) {
      this.createError();
      return;
    }

    const checkpoint = this.createCheckpoint();

    const node: RepeatingNode = {
      type: NodeTypes.Repeating,
      multiplicand: [],
      multiplier: 0,
    };

    let token = this.nextToken();
    while (token && token.type !== TokenTypes.ParenthesisClose) {
      node.multiplicand.push(this.parseAny());
      token = this.currentToken();
    }

    if (!token || node.multiplicand.length === 0) {
      const errorMessage =
        node.multiplicand.length === 0
          ? "Repeating group can't be empty."
          : undefined;
      this.createError(errorMessage);
      this.restoreCheckpoint(checkpoint);
      return;
    }

    token = this.nextToken();

    if (!token || token.type !== TokenTypes.Multiplier) {
      this.createError('Repeating group must be followed by a multiplier.');
      this.restoreCheckpoint(checkpoint);
      return;
    }

    node.multiplier = Number(token.value);

    this.nextToken();

    return node;
  }

  /**
   * Tries all parsers until one returns a node
   * or throws an error when no node is returned
   */
  private parseAny() {
    const node =
      this.parseSequence() ??
      this.parseConjugate() ??
      this.parseCommutator() ??
      this.parseRepeating();

    if (!node) {
      throw this.getDeepestError();
    }

    return node;
  }

  /**
   * Build an AST from the tokens
   */
  run() {
    while (this.index < this.tokens.length) {
      const node = this.parseAny();
      this.ast.body.push(node);
    }
  }
}

export const parse = (tokens: Token[]) => {
  const parser = new Parser(tokens);
  parser.run();

  return parser.ast;
};
