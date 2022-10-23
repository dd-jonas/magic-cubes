import { assert, describe, it } from 'vitest';

import { Algorithm } from '../Algorithm';
import { createTurn as turn, Direction } from '../Nodes';

const { CW, CCW, Double } = Direction;

describe.concurrent('Algorithm constructor', () => {
  it('handles empty input', () => {
    const alg = new Algorithm('');

    assert.doesNotThrow(() => {
      alg.clean;
      alg.inverse;
      alg.rotationless;
      alg.sequence;
      alg.turns;
    });
  });

  it('throws when exceeding the max input length', () => {
    const longAlg = 'R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U ';

    assert.throws(() => new Algorithm(longAlg));
  });

  it('normalizes the input', () => {
    const input = ' (Rw U)*2 (R2’ U’) ';

    const alg = new Algorithm(input);

    assert.equal(alg.clean, "(r U)2 R2 U'");
  });

  it('parses the input', () => {
    const input = "F (R U R' U') F' (R)3";

    const alg = new Algorithm(input);

    assert.equal(alg.parsed, "F (R U R' U')1 F' (R)3");
  });

  it('cleans the input', () => {
    const input = "F (R U R' U')1 F' (R)3";

    const alg = new Algorithm(input);

    assert.equal(alg.clean, "F R U R' U' F' R'");
  });

  it('inverses the input', () => {
    const input = "[r U r', D2]";

    const alg = new Algorithm(input);

    assert.equal(alg.inverse, "[D2, r U r']");
  });

  it('sequences the input', () => {
    const input1 = "[M': (U M' U M)2]";
    const input2 = "[S U' R': [E, R2]]";

    const alg1 = new Algorithm(input1);
    const alg2 = new Algorithm(input2);

    assert.equal(alg1.sequence, "M' U M' U M U M' U M2");
    assert.equal(alg2.sequence, "S U' R' E R2 E' R' U S'");
  });

  it('sequences the input without rotations', () => {
    const input1 = "r U R' U' r' F R F'";
    const input2 = "[S U' R': [E, R2]]";

    const alg1 = new Algorithm(input1);
    const alg2 = new Algorithm(input2);

    assert.equal(alg1.rotationless, "L F R' F' L' F R F'");
    assert.equal(alg2.rotationless, "F' B L' U' L R' F2 L' R U' L F B'");
  });

  it('creates sequenced turn nodes', () => {
    const input = "[r U r', D2]";

    const alg = new Algorithm(input);

    assert.deepEqual(alg.turns, [
      turn('r', CW),
      turn('U', CW),
      turn('r', CCW),
      turn('D', Double),
      turn('r', CW),
      turn('U', CCW),
      turn('r', CCW),
      turn('D', Double),
    ]);
  });
});
