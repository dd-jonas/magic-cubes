export type CornerName = 'UBL' | 'UBR' | 'UFR' | 'UFL' | 'DFL' | 'DFR' | 'DBR' | 'DBL';
export type EdgeName = 'UB' | 'UR' | 'UF' | 'UL' | 'FL' | 'FR' | 'BR' | 'BL' | 'DF' | 'DR' | 'DB' | 'DL'; // prettier-ignore
export type PieceName = CornerName | EdgeName;

export type CornerTwist = 0 | 1 | 2;
export type EdgeFlip = 0 | 1;

export interface Piece {
  name: string;
  orientation: number;
}

export class CornerPiece implements Piece {
  readonly name: CornerName;
  orientation: CornerTwist;

  constructor(name: CornerName, orientation: CornerTwist = 0) {
    this.name = name;
    this.orientation = orientation;
  }

  twist(offset: number) {
    this.orientation = ((this.orientation + offset) % 3) as CornerTwist;
  }
}

export class EdgePiece implements Piece {
  readonly name: EdgeName;
  orientation: EdgeFlip;

  constructor(name: EdgeName, orientation: EdgeFlip = 0) {
    this.name = name;
    this.orientation = orientation;
  }

  flip() {
    this.orientation ^= 1;
  }
}
