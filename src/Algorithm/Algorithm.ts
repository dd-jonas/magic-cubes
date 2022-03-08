import { generate } from './Generator';
import { invert } from './Inverter';
import { lex } from './Lexer';
import { AST, parse, SequenceNode, TurnNode } from './Parser';
import { clean, rotationless, sequence, validate } from './Traverser';

export class Algorithm {
  readonly raw: string;
  readonly ast: AST;

  constructor(alg: string) {
    if (typeof alg !== 'string') {
      throw new Error('Algorithm must be a string');
    }

    this.ensureMaxLength(alg);

    const tokens = lex(this.normalize(alg));
    const ast = parse(tokens);

    validate(ast);

    this.raw = alg;
    this.ast = ast;
  }

  get clean(): string {
    const cleaned = clean(this.ast);
    return generate(cleaned);
  }

  get inverse(): string {
    const inversed = invert(this.ast);
    const cleaned = clean(inversed);
    return generate(cleaned);
  }

  get rotationless(): string {
    const rotationlessSequence = rotationless(this.ast);
    const cleaned = clean(rotationlessSequence);
    return generate(cleaned);
  }

  get sequence(): string {
    const sequenced = sequence(this.ast);
    const cleaned = clean(sequenced);
    return generate(cleaned);
  }

  get turns(): TurnNode[] {
    const sequenced = sequence(this.ast);
    const cleaned = clean(sequenced);
    return (cleaned.body[0] as SequenceNode).turns;
  }

  /**
   * Normalize the algorithm to ensure consistent usage of characters and notation.
   */
  private normalize(alg: string) {
    return (
      alg
        .trim()
        // Use single straight quote as prime character
        .replace(/’|′/g, "'")
        // Remove prime characters from double turns
        .replace(/2'|'2/g, '2')
        // Use small letters as wide turn notation
        .replace(/([UFRDBL])w/, (match, turn) => turn.toLowerCase())
        // Remove parentheses that are not followed by a digit
        .replace(/\(([^()]*)\)(?!\*?\d)/g, '$1')
        // Remove *'s of repeating groups
        .replace(/(?<=\))\*(?=\d)/, '')
    );
  }

  /** Throws when the provided algorithm exceeds the maximum length. */
  private ensureMaxLength(alg: string | Array<unknown>, maxLength = 64) {
    if (alg.length > maxLength) {
      throw new Error(
        `Algorithm can't be longer than ${maxLength} characters:
        ${alg.slice(0, 32)}... (length: ${alg.length})`
      );
    }
  }
}
