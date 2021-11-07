import { CornerPiece, EdgePiece } from '../Piece';

describe('Piece', () => {
  it('twists corner pieces', () => {
    const corner = new CornerPiece('UBL');

    expect(corner.orientation).toBe(0);

    corner.twist(5);

    expect(corner.orientation).toBe(2);
  });

  it('flips edge pieces', () => {
    const edge = new EdgePiece('UB');

    expect(edge.orientation).toBe(0);

    edge.flip();

    expect(edge.orientation).toBe(1);
  });
});
