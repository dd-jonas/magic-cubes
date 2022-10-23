import { assert, describe, it } from 'vitest';

import {
  createAlgorithm as alg,
  createCommutator as comm,
  createConjugate as conj,
  createRepeating as rep,
  createSequence as seq,
  createTurn as turn,
  Direction,
  NodeTypes,
} from '../Nodes';
import { clean, rotationless, sequence, validate } from '../Traverser';

const { CW, CCW, Double } = Direction;

describe.concurrent('Cleaner visitor', () => {
  it('does nothing when the input is already clean', () => {
    // [l': [U, R' D2 R]] (R U R' U')2
    const ast = alg([
      conj(
        seq(turn('l', CCW)),
        comm(seq(turn('U', CW)), seq([turn('R', CCW), turn('D', Double), turn('R', CW)]))
      ),
      rep([seq([turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)])], 2),
    ]);

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, ast);
  });

  it('merges consecutive turns of a sequence', () => {
    // R2 R' R2 U2 U' L L' R U U U -> R' U R U'
    const ast = alg(
      seq([
        turn('R', Double),
        turn('R', CCW),
        turn('R', Double),
        turn('U', Double),
        turn('U', CCW),
        turn('L', CW),
        turn('L', CCW),
        turn('R', CW),
        turn('U', CW),
        turn('U', CW),
        turn('U', CW),
      ])
    );

    const cleaned = clean(ast);

    assert.deepEqual(
      cleaned,
      alg(seq([turn('R', CCW), turn('U', CW), turn('R', CW), turn('U', CCW)]))
    );
  });

  it('removes the node if turns is empty', () => {
    // R U2 U U R'
    const ast = alg(
      seq([turn('R', CW), turn('U', Double), turn('U', CW), turn('U', CW), turn('R', CCW)])
    );

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, { type: NodeTypes.Algorithm, body: [] });
  });

  it('removes repeating groups with multiplier 0', () => {
    // (R)0
    const ast = alg(rep(seq([turn('R', CW)]), 0));

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, alg());
  });

  it('flattens repeating groups with multiplier 1', () => {
    // (y [M: U])1 -> y [M: U]
    const ast = alg(rep([seq(turn('y', CW)), conj(seq(turn('M', CW)), seq(turn('U', CW)))], 1));

    const cleaned = clean(ast);

    assert.deepEqual(
      cleaned,
      alg([seq(turn('y', CW)), conj(seq(turn('M', CW)), seq(turn('U', CW)))])
    );
  });

  it('flattens repeating groups to a sequence when multiplying a single turn', () => {
    // (R')6 -> R2
    const ast = alg(rep(seq(turn('R', CCW)), 6));

    const cleaned = clean(ast);

    assert.deepEqual(cleaned, alg(seq(turn('R', Double))));
  });
});

describe.concurrent('Validator visitor', () => {
  it('limits repeating group multipliers to 6', () => {
    const ast1 = alg(rep(seq(), 6));
    const ast2 = alg(rep(seq(), 7));

    assert.doesNotThrow(() => validate(ast1));
    assert.throws(() => validate(ast2), /higher than 6/i);
  });
});

describe.concurrent('Sequencer visitor', () => {
  it('does nothing when sequencing a sequence', () => {
    // R U R' U'
    const ast = alg(seq([turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)]));

    const sequenced = sequence(ast);

    assert.deepEqual(sequenced, ast);
  });

  it('flattens multiple sequences', () => {
    // R U + R' U' -> R U R' U'
    const ast = alg([seq([turn('R', CW), turn('U', CW)]), seq([turn('R', CCW), turn('U', CCW)])]);

    const sequenced = sequence(ast);

    assert.deepEqual(
      sequenced,
      alg(seq([turn('R', CW), turn('U', CW), turn('R', CCW), turn('U', CCW)]))
    );
  });

  it('flattens a complex algorithm', () => {
    // [z': [(R U R')2, D']] -> z' R  U R' R U R' D' R U' R' R U' R' D Z
    const ast = alg(
      conj(
        seq(turn('z', CCW)),
        comm(rep(seq([turn('R', CW), turn('U', CW), turn('R', CCW)]), 2), seq(turn('D', CCW)))
      )
    );

    const sequenced = sequence(ast);

    assert.deepEqual(
      sequenced,
      alg(
        seq([
          turn('z', CCW),
          turn('R', CW),
          turn('U', CW),
          turn('R', CCW),
          turn('R', CW),
          turn('U', CW),
          turn('R', CCW),
          turn('D', CCW),
          turn('R', CW),
          turn('U', CCW),
          turn('R', CCW),
          turn('R', CW),
          turn('U', CCW),
          turn('R', CCW),
          turn('D', CW),
          turn('z', CW),
        ])
      )
    );
  });
});

describe.concurrent('Rotationless sequencer visitor', () => {
  it('flattens a complex algorithm to a rotationless sequence', () => {
    // R y F [z: [R x U R', d2]]
    const ast = alg([
      seq([turn('R', CW), turn('y', CW), turn('F', CW)]),
      conj(
        seq(turn('z', CW)),
        comm(
          seq([turn('R', CW), turn('x', CW), turn('U', CW), turn('R', CCW)]),
          seq(turn('d', Double))
        )
      ),
    ]);

    const rotationlessSequence = rotationless(ast);

    assert.deepEqual(
      rotationlessSequence,
      alg(
        seq([
          turn('R', CW),
          turn('R', CW),
          turn('U', CW),
          turn('R', CW),
          turn('U', CCW),
          turn('R', Double),
          turn('D', CW),
          turn('R', CCW),
          turn('D', CCW),
          turn('B', Double),
        ])
      )
    );
  });
});
