import { Algorithm } from '../Algorithm/Algorithm';
import { Direction, FaceMove, TurnNode } from '../Algorithm/Parser';
import { Turn } from '../Algorithm/Turn';
import { Orientation } from '../utils/Orientation';
import { CornerName, CornerPiece, EdgeName, EdgePiece } from './Piece';

// prettier-ignore
export type Corners = [
  CornerPiece, CornerPiece, CornerPiece, CornerPiece,
  CornerPiece, CornerPiece, CornerPiece, CornerPiece
];

// prettier-ignore
export type Edges = [
  EdgePiece, EdgePiece, EdgePiece, EdgePiece,
  EdgePiece, EdgePiece, EdgePiece, EdgePiece,
  EdgePiece, EdgePiece, EdgePiece, EdgePiece
];

export class Cube {
  readonly corners: Corners = [
    new CornerPiece('UBL'),
    new CornerPiece('UBR'),
    new CornerPiece('UFR'),
    new CornerPiece('UFL'),
    new CornerPiece('DFL'),
    new CornerPiece('DFR'),
    new CornerPiece('DBR'),
    new CornerPiece('DBL'),
  ];

  readonly edges: Edges = [
    new EdgePiece('UB'),
    new EdgePiece('UR'),
    new EdgePiece('UF'),
    new EdgePiece('UL'),
    new EdgePiece('FL'),
    new EdgePiece('FR'),
    new EdgePiece('BR'),
    new EdgePiece('BL'),
    new EdgePiece('DF'),
    new EdgePiece('DR'),
    new EdgePiece('DB'),
    new EdgePiece('DL'),
  ];

  readonly orientation: Orientation;

  // prettier-ignore
  static readonly solvedCorners: Readonly<CornerName[]> = [
    'UBL', 'UBR', 'UFR', 'UFL',
    'DFL', 'DFR', 'DBR', 'DBL',
  ];

  // prettier-ignore
  static readonly solvedEdges: Readonly<EdgeName[]> = [
    'UB', 'UR', 'UF', 'UL',
    'FL', 'FR', 'BR', 'BL',
    'DF', 'DR', 'DB', 'DL',
  ];

  static readonly pieceLocations: Record<
    FaceMove,
    Record<'corners' | 'edges', number[]>
  > = {
    U: { corners: [0, 1, 2, 3], edges: [0, 1, 2, 3] },
    F: { corners: [3, 2, 5, 4], edges: [2, 5, 8, 4] },
    R: { corners: [2, 1, 6, 5], edges: [1, 6, 9, 5] },
    D: { corners: [4, 5, 6, 7], edges: [8, 9, 10, 11] },
    B: { corners: [1, 0, 7, 6], edges: [0, 7, 10, 6] },
    L: { corners: [0, 3, 4, 7], edges: [3, 4, 11, 7] },
  };

  constructor(scramble?: Algorithm | string) {
    this.orientation = new Orientation();

    if (scramble) {
      this.scramble(scramble);
    }
  }

  /** Checks if the cube is in the solved state. */
  get isSolved() {
    const cornersSolved = this.corners.every(
      (corner, i) =>
        corner.name === Cube.solvedCorners[i] && corner.orientation === 0
    );
    const edgesSolved = this.edges.every(
      (edge, i) => edge.name === Cube.solvedEdges[i] && edge.orientation === 0
    );

    return cornersSolved && edgesSolved;
  }

  /** Apply an algorithm to the cube. */
  apply(alg: Algorithm | string) {
    if (typeof alg === 'string') {
      alg = new Algorithm(alg);
    }

    alg.turns.forEach((turn) => this.turn(turn));

    return this;
  }

  /** Alias of apply. */
  scramble(alg: Algorithm | string) {
    return this.apply(alg);
  }

  /** Alias of apply. */
  solve(alg: Algorithm | string) {
    return this.apply(alg);
  }

  /** Reset orientation */
  orient() {
    this.orientation.reset();
  }

  /** Turn a layer of the cube. Only allows outer face moves. */
  private turn(turn: TurnNode) {
    if (Turn.isFaceTurn(turn)) {
      const layer = this.orientation.getFace(turn.move);
      const locations = Cube.pieceLocations[layer];
      const movingCorners = locations.corners.map((loc) => this.corners[loc]);
      const movingEdges = locations.edges.map((loc) => this.edges[loc]);

      // Orient pieces
      if (turn.direction !== Direction.Double) {
        if (['F', 'B', 'L', 'R'].includes(layer)) {
          movingCorners.forEach((corner, i) => corner.twist((i % 2) + 1));
        }

        if (['F', 'B'].includes(layer)) {
          movingEdges.forEach((edge) => edge.flip());
        }
      }

      // Permute pieces
      const cyclePieces = <Piece>(pieces: Piece[], direction: Direction) => {
        const cycledPieces = [...pieces];

        switch (direction) {
          case Direction.CW:
            cycledPieces.unshift(cycledPieces.pop()!);
            break;
          case Direction.CCW:
            cycledPieces.push(cycledPieces.shift()!);
            break;
          case Direction.Double:
            cycledPieces.unshift(cycledPieces.pop()!);
            cycledPieces.unshift(cycledPieces.pop()!);
            break;
        }

        return cycledPieces;
      };

      const cycledCorners = cyclePieces(movingCorners, turn.direction);
      const cycledEdges = cyclePieces(movingEdges, turn.direction);

      locations.corners.forEach((l, i) => (this.corners[l] = cycledCorners[i]));
      locations.edges.forEach((l, i) => (this.edges[l] = cycledEdges[i]));
    } else if (Turn.isWideTurn(turn) || Turn.isSliceTurn(turn)) {
      Turn.wideAndSliceMap[turn.move][turn.direction].forEach((turn) =>
        this.turn(turn)
      );
    } else if (Turn.isRotationTurn(turn)) {
      this.orientation.rotate(turn);
    }
  }
}
