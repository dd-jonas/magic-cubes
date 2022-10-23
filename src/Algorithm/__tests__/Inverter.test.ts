import { assert, describe, it } from 'vitest';

import { invert } from '../Inverter';
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

describe.concurrent('Inverter', () => {
  it('inverts an empty algorithm', () => {
    const inverse = invert(alg());

    assert.deepEqual(inverse, alg());
  });

  it('inverts a sequence', () => {
    const inverse = invert(
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

    assert.deepEqual(
      inverse,
      alg(
        seq([
          turn('R', CW),
          turn('U', Double),
          turn('R', CCW),
          turn('U', CCW),
          turn('R', CW),
          turn('U', CCW),
          turn('R', CCW),
        ])
      )
    );
  });

  it('inverts a conjugate', () => {
    const inverse = invert(
      alg(conj(seq([turn('R', CW), turn('U', CW), turn('R', CCW)]), seq(turn('D', CW))))
    );

    assert.deepEqual(
      inverse,
      alg(conj(seq([turn('R', CW), turn('U', CW), turn('R', CCW)]), seq(turn('D', CCW))))
    );
  });

  it('inverts a commutator', () => {
    const inverse = invert(
      alg(comm(seq([turn('R', CW), turn('U', CW), turn('R', CCW)]), seq(turn('D', Double))))
    );

    assert.deepEqual(
      inverse,
      alg(comm(seq(turn('D', Double)), seq([turn('R', CW), turn('U', CW), turn('R', CCW)])))
    );
  });

  it('inverts a repeating group', () => {
    const inverse = invert(
      alg(rep(seq([turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)]), 6))
    );

    assert.deepEqual(
      inverse,
      alg(rep(seq([turn('U', CW), turn('R', CW), turn('U', CCW), turn('R', CCW)]), 6))
    );
  });

  it('inverts a complex algorithm (conjugate with nested commutator)', () => {
    const inverse = invert(
      alg(
        conj(
          seq(turn('z', CCW)),
          comm(seq([turn('R', CW), turn('U', CCW), turn('R', CCW)]), seq(turn('D', CCW)))
        )
      )
    );

    assert.deepEqual(
      inverse,
      alg(
        conj(
          seq(turn('z', CCW)),
          comm(seq(turn('D', CCW)), seq([turn('R', CW), turn('U', CCW), turn('R', CCW)]))
        )
      )
    );
  });

  it('inverts a complex algorithm (multiple conjugates)', () => {
    const inverse = invert(
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

    assert.deepEqual(
      inverse,
      alg(
        conj(seq(turn('U', CCW)), [
          conj(
            seq([turn('D', CCW), turn('R', CW), turn('D', CW), turn('R', CCW)]),
            seq(turn('U', CW))
          ),
          conj(seq([turn('R', CW), turn('D', CCW), turn('R', CCW)]), seq(turn('U', CCW))),
        ])
      )
    );
  });

  it('inverts a complex algorithm (nested repeating group)', () => {
    const inverse = invert(
      alg(
        conj(
          seq(turn('M', CCW)),
          rep(seq([turn('U', CW), turn('M', CCW), turn('U', CW), turn('M', CW)]), 2)
        )
      )
    );

    assert.deepEqual(
      inverse,
      alg(
        conj(
          seq(turn('M', CCW)),
          rep(seq([turn('M', CCW), turn('U', CCW), turn('M', CW), turn('U', CCW)]), 2)
        )
      )
    );
  });
});
