import { assert, describe, it } from 'vitest';

import { generate } from '../Generator';
import {
  createAlgorithm as alg,
  createCommutator as comm,
  createConjugate as conj,
  createRepeating as rep,
  createSequence as seq,
  createTurn as turn,
  Direction,
} from '../Nodes';

const { CW, CCW, Double } = Direction;

describe.concurrent('Generator', () => {
  it('generates an empty algorithm', () => {
    const algorithm = generate(alg());

    assert.strictEqual(algorithm, '');
  });

  it('generates a sequence', () => {
    const algorithm = generate(
      alg(
        seq([
          turn('R', CW),
          turn('U', CW),
          turn('R', CCW),
          turn('U', CW),
          turn('R', CW),
          turn('U', Double),
          turn('R', CCW),
        ])
      )
    );

    assert.equal(algorithm, "R U R' U R U2 R'");
  });

  it('generates a conjugate', () => {
    const algorithm = generate(
      alg(conj(seq([turn('R', CW), turn('U', CW), turn('R', CCW)]), seq(turn('D', Double))))
    );

    assert.equal(algorithm, "[R U R': D2]");
  });

  it('generates a commutator', () => {
    const algorithm = generate(
      alg(comm(seq([turn('R', CW), turn('U', CW), turn('R', CCW)]), seq(turn('D', Double))))
    );

    assert.equal(algorithm, "[R U R', D2]");
  });

  it('generates a repeating group', () => {
    const algorithm = generate(
      alg(rep(seq([turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)]), 6))
    );

    assert.equal(algorithm, "(R U R' U')6");
  });

  it('generates a complex algorithm (conjugate with nested commutator)', () => {
    const algorithm = generate(
      alg(
        conj(
          seq(turn('z', CCW)),
          comm(seq([turn('R', CW), turn('U', CCW), turn('R', CCW)]), seq(turn('D', CCW)))
        )
      )
    );

    assert.equal(algorithm, "[z': [R U' R', D']]");
  });

  it('generates a complex algorithm (multiple conjugates)', () => {
    const algorithm = generate(
      alg(
        conj(seq(turn('U', CCW)), [
          conj(seq([turn('R', CW), turn('D', CCW), turn('R', CCW)]), seq(turn('U', CW))),
          conj(
            seq([turn('D', CCW), turn('R', CW), turn('D', CW), turn('R', CCW)]),
            seq(turn('U', CCW))
          ),
        ])
      )
    );

    assert.equal(algorithm, "[U': [R D' R': U] [D' R D R': U']]");
  });

  it('generates a complex algorithm (nested repeating group)', () => {
    const algorithm = generate(
      alg(
        conj(
          seq(turn('M', CCW)),
          rep(seq([turn('U', CW), turn('M', CCW), turn('U', CW), turn('M', CW)]), 2)
        )
      )
    );

    assert.equal(algorithm, "[M': (U M' U M)2]");
  });
});
