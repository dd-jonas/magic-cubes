import { assert, describe, it } from 'vitest';

import { Algorithm } from '../Algorithm';
import { Direction, NodeTypes } from '../Parser';

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
    const longAlg =
      'R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U ';

    assert.throws(() => new Algorithm(longAlg));
  });

  it('cleans the input', () => {
    const input = ' (Rw U)*2 (R2’ U’) ';

    const alg = new Algorithm(input);

    assert.equal(alg.clean, "(r U)2 R2 U'");
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
    assert.equal(alg2.rotationless, "F' B L' U' R' L F2 R L' U' L F B'");
  });

  it('creates sequenced turn nodes', () => {
    const input = "[r U r', D2]";

    const alg = new Algorithm(input);

    assert.deepEqual(alg.turns, [
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CW },
      { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CCW },
      { type: NodeTypes.Turn, move: 'D', direction: Direction.Double },
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CW },
      { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CCW },
      { type: NodeTypes.Turn, move: 'D', direction: Direction.Double },
    ]);
  });
});
