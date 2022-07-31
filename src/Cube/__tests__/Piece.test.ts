import { assert, describe, it } from 'vitest';

import { CornerPiece, EdgePiece } from '../Piece';

describe.concurrent('Piece', () => {
  it('twists corner pieces', () => {
    const corner = new CornerPiece('UBL');

    assert.equal(corner.orientation, 0);

    corner.twist(5);

    assert.equal(corner.orientation, 2);
  });

  it('flips edge pieces', () => {
    const edge = new EdgePiece('UB');

    assert.equal(edge.orientation, 0);

    edge.flip();

    assert.equal(edge.orientation, 1);
  });
});
