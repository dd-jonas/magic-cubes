import { Cube } from './Cube';
import { CornerPiece, EdgePiece, PieceName } from './Piece';

export type Face = 'U' | 'F' | 'R' | 'D' | 'B' | 'L';
export type CubeColors<S extends string> = S[][][];

export class CubeModel<ColorScheme extends Record<Face, string>> {
  private readonly cube: Cube;
  private readonly colorScheme: ColorScheme;

  static faceOrder = ['U', 'F', 'R', 'D', 'B', 'L'] as const;

  // Location of all stickers on their respective faces
  // e.g. DBL: [['D', 6], ...] means the D sticker of the DBL piece is the 6th sticker on the D face
  // prettier-ignore
  private static locationMap: Record<PieceName, [Face, number][]> = {
    UBL: [['U', 0], ['L', 0], ['B', 2]],
    UBR: [['U', 2], ['B', 0], ['R', 2]],
    UFR: [['U', 8], ['R', 0], ['F', 2]],
    UFL: [['U', 6], ['F', 0], ['L', 2]],
    DFL: [['D', 0], ['L', 8], ['F', 6]],
    DFR: [['D', 2], ['F', 8], ['R', 6]],
    DBR: [['D', 8], ['R', 8], ['B', 6]],
    DBL: [['D', 6], ['B', 8], ['L', 6]],
    UB: [['U', 1], ['B', 1]],
    UR: [['U', 5], ['R', 1]],
    UF: [['U', 7], ['F', 1]],
    UL: [['U', 3], ['L', 1]],
    FL: [['F', 3], ['L', 5]],
    FR: [['F', 5], ['R', 3]],
    BR: [['B', 3], ['R', 5]],
    BL: [['B', 5], ['L', 3]],
    DF: [['D', 1], ['F', 7]],
    DR: [['D', 5], ['R', 7]],
    DB: [['D', 7], ['B', 7]],
    DL: [['D', 3], ['L', 7]],
  };

  constructor(cube: Cube, colorScheme: ColorScheme) {
    this.cube = cube;
    this.colorScheme = colorScheme;
  }

  get colors(): CubeColors<ColorScheme[Face]> {
    const colors: Record<Face, Array<ColorScheme[Face]>> = {
      U: [],
      F: [],
      R: [],
      D: [],
      B: [],
      L: [],
    };

    CubeModel.faceOrder.forEach((center) => {
      colors[center][4] = this.colorScheme[center];
    });

    const cycleCW = (arr: Array<unknown>) => arr.unshift(arr.pop());
    const cycleCCW = (arr: Array<unknown>) => arr.push(arr.shift());

    Object.entries(CubeModel.locationMap).forEach(([position, indexes]) => {
      const piece = this.getPieceAtPosition(position as PieceName);
      const stickers: Face[] = this.getStickersOfPiece(piece);

      if (piece.orientation === 1) cycleCW(stickers);
      if (piece.orientation === 2) cycleCCW(stickers);

      stickers.forEach((sticker, i) => {
        colors[indexes[i][0]][indexes[i][1]] = this.colorScheme[sticker];
      });
    });

    const { orientation } = this.cube;
    const flatColors = [
      colors[orientation.getFace('U')],
      colors[orientation.getFace('F')],
      colors[orientation.getFace('R')],
      colors[orientation.getFace('D')],
      colors[orientation.getFace('B')],
      colors[orientation.getFace('L')],
    ];

    return flatColors.map((face) => [
      face.slice(0, 3),
      face.slice(3, 6),
      face.slice(6, 9),
    ]);
  }

  render<T>(callback: (c: CubeColors<ColorScheme[Face]>) => T) {
    return callback(this.colors);
  }

  private getPieceAtPosition(position: PieceName): CornerPiece | EdgePiece {
    const isCorner = position.length === 3;

    const type = isCorner ? 'corners' : 'edges';
    const index = isCorner
      ? Cube.solvedCorners.findIndex((corner) => corner === position)
      : Cube.solvedEdges.findIndex((edge) => edge === position);

    return this.cube[type][index];
  }

  private getStickersOfPiece(piece: CornerPiece | EdgePiece): Face[] {
    // Note: Order of stickers is important for corners
    return piece.name === 'UBL'
      ? ['U', 'L', 'B']
      : piece.name === 'UBR'
      ? ['U', 'B', 'R']
      : piece.name === 'UFR'
      ? ['U', 'R', 'F']
      : piece.name === 'UFL'
      ? ['U', 'F', 'L']
      : piece.name === 'DFL'
      ? ['D', 'L', 'F']
      : piece.name === 'DFR'
      ? ['D', 'F', 'R']
      : piece.name === 'DBR'
      ? ['D', 'R', 'B']
      : piece.name === 'DBL'
      ? ['D', 'B', 'L']
      : ([...piece.name] as Face[]);
  }
}
