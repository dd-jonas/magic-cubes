import { Generator } from './Generator';
import { Inverter } from './Inverter';
import { Lexer, Token } from './Lexer';
import { AlgorithmNode, AST, Parser, SequenceNode, TurnNode } from './Parser';
import { Traverser } from './Traverser';
import { Cleaner, Sequencer, Validator } from './Visitors';

export class Algorithm {
  readonly raw: string;
  readonly ast: AST;

  constructor(alg: string) {
    this.ensureMaxLength(alg);

    const tokens = this.tokenize(this.normalize(alg));
    const ast = this.parse(tokens);

    this.validateAST(ast);

    this.raw = alg;
    this.ast = ast;

    this.ensureMaxLength(this.turns);
  }

  get clean(): string {
    const clean = this.cleanAST(this.ast);
    return this.getStringFromAST(clean);
  }

  get inverse(): string {
    const inverse = this.invertAST(this.ast);
    const clean = this.cleanAST(inverse);
    return this.getStringFromAST(clean);
  }

  get turns(): TurnNode[] {
    const sequence = this.sequenceAST(this.ast);
    const clean = this.cleanAST(sequence);
    return (clean.body[0] as SequenceNode).turns;
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

  //
  // Wrappers
  //

  /** Tokenize an algorithm */
  private tokenize(input: string) {
    const lexer = new Lexer(input);
    lexer.run();

    return lexer.tokens;
  }

  /** Parse an array of algorithm tokens */
  private parse(tokens: Token[]) {
    const parser = new Parser(tokens);
    parser.run();

    return parser.ast;
  }

  /** Traverse the AST with the Cleaner visitor */
  private cleanAST(ast: AlgorithmNode) {
    const cleaner = new Traverser(ast, Cleaner);
    cleaner.run();

    return cleaner.ast;
  }

  /** Traverse the AST with the Validator visitor  */
  private validateAST(ast: AlgorithmNode) {
    const validator = new Traverser(ast, Validator);
    validator.run();
  }

  /** Traverse the AST with the Inverter  */
  private invertAST(ast: AlgorithmNode) {
    const inverter = new Inverter(ast);
    inverter.run();

    return inverter.ast;
  }

  /** Traverse the AST with the Sequencer visitor */
  private sequenceAST(ast: AlgorithmNode) {
    const sequencer = new Traverser(ast, Sequencer);
    sequencer.run();

    return sequencer.ast;
  }

  /** Generate a string from an algorithm AST */
  private getStringFromAST(ast: AlgorithmNode) {
    const generator = new Generator(ast);
    generator.run();

    return generator.algorithm;
  }
}
