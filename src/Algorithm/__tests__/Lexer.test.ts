import { assert, describe, it } from 'vitest';

import { lex, TokenTypes } from '../Lexer';

describe.concurrent('Lexer', () => {
  it('scans an empty string', () => {
    const input = '';
    const tokens = lex(input);

    assert.deepEqual(tokens, []);
  });

  it('scans a sequence', () => {
    const input = "R U R' U R U2 R'";
    const tokens = lex(input);

    assert.deepEqual(tokens, [
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U2' },
      { type: TokenTypes.Turn, value: "R'" },
    ]);
  });

  it('scans a conjugate', () => {
    const input = "[R U R': D2]";
    const tokens = lex(input);

    assert.deepEqual(tokens, [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: 'D2' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);
  });

  it('scans a commutator', () => {
    const input = "[R U R', D2]";
    const tokens = lex(input);

    assert.deepEqual(tokens, [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorCommutator, value: ',' },
      { type: TokenTypes.Turn, value: 'D2' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);
  });

  it('scans a repeating group', () => {
    const input = "(R U R' U')6";
    const tokens = lex(input);

    assert.deepEqual(tokens, [
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.ParenthesisClose, value: ')' },
      { type: TokenTypes.Multiplier, value: '6' },
    ]);
  });

  it('scans a complex algorithm (conjugate with nested commutator)', () => {
    const input = "[z': [R U' R', D']]";
    const tokens = lex(input);

    assert.deepEqual(tokens, [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "z'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorCommutator, value: ',' },
      { type: TokenTypes.Turn, value: "D'" },
      { type: TokenTypes.BracketClose, value: ']' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);
  });

  it('scans a complex algorithm (multiple conjugates)', () => {
    const input = "[U': [R D' R': U] [D' R D R': U']]";
    const tokens = lex(input);

    assert.deepEqual(tokens, [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: "D'" },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.BracketClose, value: ']' },
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "D'" },
      { type: TokenTypes.Turn, value: 'R' },
      { type: TokenTypes.Turn, value: 'D' },
      { type: TokenTypes.Turn, value: "R'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.Turn, value: "U'" },
      { type: TokenTypes.BracketClose, value: ']' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);
  });

  it('scans a complex algorithm (nested repeating group)', () => {
    const input = "[M': (U M' U M)2]";
    const tokens = lex(input);

    assert.deepEqual(tokens, [
      { type: TokenTypes.BracketOpen, value: '[' },
      { type: TokenTypes.Turn, value: "M'" },
      { type: TokenTypes.SeperatorConjugate, value: ':' },
      { type: TokenTypes.ParenthesisOpen, value: '(' },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: "M'" },
      { type: TokenTypes.Turn, value: 'U' },
      { type: TokenTypes.Turn, value: 'M' },
      { type: TokenTypes.ParenthesisClose, value: ')' },
      { type: TokenTypes.Multiplier, value: '2' },
      { type: TokenTypes.BracketClose, value: ']' },
    ]);
  });

  it('allows outer layer turns', () => {
    const input = "U F' R2 D B' L2";

    assert.doesNotThrow(() => lex(input));
  });

  it('allows wide layer turns', () => {
    const input = "u f' r2 d b' l2";

    assert.doesNotThrow(() => lex(input));
  });

  it('allows slice layer turns', () => {
    const input = "M E' S2";

    assert.doesNotThrow(() => lex(input));
  });

  it('allows rotations', () => {
    const input = "x y' z2";

    assert.doesNotThrow(() => lex(input));
  });

  it('allows commutators and conjugate notation', () => {
    const input = '[:,]';

    assert.doesNotThrow(() => lex(input));
  });

  it('allows repeating group notation', () => {
    const input = '()4';

    assert.doesNotThrow(() => lex(input));
  });

  it('allows whitespace characters', () => {
    const input = ' \f\n\r\t\v';

    assert.doesNotThrow(() => lex(input));
  });

  it('throws when encountering an invalid character', () => {
    const input = "R U R' ?";

    assert.throws(() => lex(input), /invalid character/i);
  });
});
