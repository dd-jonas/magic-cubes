import { Cube } from './Cube';
import { CornerPiece, EdgePiece, PieceName } from './Piece';

export type Face = 'U' | 'F' | 'R' | 'D' | 'B' | 'L';
export type CubeColors<S extends string> = Record<Face, S[]>;

export class CubeModel<
  ColorScheme extends Record<Face, string> = Record<Face, string>
> {
  private readonly cube: Cube;
  private readonly colorScheme: ColorScheme;

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

  colors(): CubeColors<ColorScheme[Face]> {
    const colors: Record<Face, Array<ColorScheme[Face]>> = {
      U: [],
      D: [],
      F: [],
      B: [],
      L: [],
      R: [],
    };

    // Insert center colors
    Object.entries(colors).forEach(([face, array]) => {
      array[4] = this.colorScheme[face as Face];
    });

    // Insert corner and edge colors
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

    // Apply rotations
    const { orientation } = this.cube;

    const rotateCW = <T>(array: T[]) => {
      const [a, b, c, d, e, f, g, h, i] = array;
      return [g, d, a, h, e, b, i, f, c];
    };

    const rotateCCW = <T>(array: T[]) => {
      const [a, b, c, d, e, f, g, h, i] = array;
      return [c, f, i, b, e, h, a, d, g];
    };

    const rotateDouble = <T>(array: T[]) => [...array].reverse();

    const up = orientation.getFace('U');
    const front = orientation.getFace('F');

    switch (up) {
      case 'U':
        switch (front) {
          case 'R':
            colors.U = rotateCW(colors.U);
            colors.D = rotateCCW(colors.D);
            break;
          case 'B':
            colors.U = rotateDouble(colors.U);
            colors.D = rotateDouble(colors.D);
            break;
          case 'L':
            colors.U = rotateCCW(colors.U);
            colors.D = rotateCW(colors.D);
            break;
        }
        break;

      case 'D':
        colors.F = rotateDouble(colors.F);
        colors.B = rotateDouble(colors.B);
        colors.L = rotateDouble(colors.L);
        colors.R = rotateDouble(colors.R);

        switch (front) {
          case 'R':
            colors.D = rotateCW(colors.D);
            colors.U = rotateCCW(colors.U);
            break;
          case 'F':
            colors.D = rotateDouble(colors.D);
            colors.U = rotateDouble(colors.U);
            break;
          case 'L':
            colors.D = rotateCCW(colors.D);
            colors.U = rotateCW(colors.U);
            break;
        }
        break;

      case 'F':
        colors.U = rotateDouble(colors.U);
        colors.B = rotateDouble(colors.B);
        colors.L = rotateCCW(colors.L);
        colors.R = rotateCW(colors.R);

        switch (front) {
          case 'R':
            colors.F = rotateCW(colors.F);
            colors.B = rotateCCW(colors.B);
            break;
          case 'U':
            colors.F = rotateDouble(colors.F);
            colors.B = rotateDouble(colors.B);
            break;
          case 'L':
            colors.F = rotateCCW(colors.F);
            colors.B = rotateCW(colors.B);
            break;
        }
        break;

      case 'B':
        colors.B = rotateDouble(colors.B);
        colors.D = rotateDouble(colors.D);
        colors.L = rotateCW(colors.L);
        colors.R = rotateCCW(colors.R);

        switch (front) {
          case 'R':
            colors.B = rotateCW(colors.B);
            colors.F = rotateCCW(colors.F);
            break;
          case 'D':
            colors.B = rotateDouble(colors.B);
            colors.F = rotateDouble(colors.F);
            break;
          case 'L':
            colors.B = rotateCCW(colors.B);
            colors.F = rotateCW(colors.F);
            break;
        }
        break;

      case 'L':
        colors.U = rotateCW(colors.U);
        colors.D = rotateCW(colors.D);
        colors.F = rotateCW(colors.F);
        colors.B = rotateCCW(colors.B);
        colors.L = rotateCW(colors.L);
        colors.R = rotateCW(colors.R);

        switch (front) {
          case 'U':
            colors.L = rotateCW(colors.L);
            colors.R = rotateCCW(colors.R);
            break;
          case 'B':
            colors.L = rotateDouble(colors.L);
            colors.R = rotateDouble(colors.R);
            break;
          case 'D':
            colors.L = rotateCCW(colors.L);
            colors.R = rotateCW(colors.R);
            break;
        }
        break;

      case 'R':
        colors.U = rotateCCW(colors.U);
        colors.D = rotateCCW(colors.D);
        colors.F = rotateCCW(colors.F);
        colors.B = rotateCW(colors.B);
        colors.L = rotateCCW(colors.L);
        colors.R = rotateCCW(colors.R);

        switch (front) {
          case 'D':
            colors.R = rotateCW(colors.R);
            colors.L = rotateCCW(colors.L);
            break;
          case 'B':
            colors.R = rotateDouble(colors.R);
            colors.L = rotateDouble(colors.L);
            break;
          case 'U':
            colors.R = rotateCCW(colors.R);
            colors.L = rotateCW(colors.L);
            break;
        }
        break;
    }

    return {
      U: colors[orientation.getFace('U')],
      D: colors[orientation.getFace('D')],
      F: colors[orientation.getFace('F')],
      B: colors[orientation.getFace('B')],
      L: colors[orientation.getFace('L')],
      R: colors[orientation.getFace('R')],
    };
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
