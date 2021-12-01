import { Algorithm } from '../../Algorithm/Algorithm';
import { Cube } from '../Cube';

describe('Cube', () => {
  it('creates a solved cube', () => {
    const cube = new Cube();

    expect(cube.isSolved).toBe(true);
  });

  it('scrambles and solves the cube', () => {
    const cube = new Cube("U r M' D2 x' R f' E2 u d' y' z2 F2 B2 l b L S'");

    expect(cube.isSolved).toBe(false);

    cube.solve("x' z' U' R' F2 L B' L' B2"); // Cross
    cube.solve("U' R U' R2 U' R"); // F2L 1
    cube.solve("U2 L' U2 L U' L' U L"); // F2L 2
    cube.solve("U R U' R' y' R' U2 R"); // F2L 3
    cube.solve("L' U' L U' L' U L"); // F2L 4
    cube.solve("U R U2 R' U' R U' R'"); // OLL
    cube.solve("U2 l' U R' D2 R U' R' D2 R l U'"); // PLL

    expect(cube.isSolved).toBe(true);
  });

  it('accepts an Algorithm instance as input', () => {
    const scramble = new Algorithm(" R U R' U'");
    const solve = new Algorithm("U R U' R'");
    const cube = new Cube(scramble);

    cube.solve(solve);

    expect(cube.isSolved).toBe(true);
  });

  it('resets orientation', () => {
    const cube = new Cube('x y z');

    expect(cube.orientation.getFace('U')).toEqual('D');
    expect(cube.orientation.getFace('F')).toEqual('R');
    expect(cube.orientation.getFace('R')).toEqual('F');
    expect(cube.orientation.getFace('D')).toEqual('U');
    expect(cube.orientation.getFace('B')).toEqual('L');
    expect(cube.orientation.getFace('L')).toEqual('B');

    cube.orient();

    expect(cube.orientation.getFace('U')).toEqual('U');
    expect(cube.orientation.getFace('F')).toEqual('F');
    expect(cube.orientation.getFace('R')).toEqual('R');
    expect(cube.orientation.getFace('D')).toEqual('D');
    expect(cube.orientation.getFace('B')).toEqual('B');
    expect(cube.orientation.getFace('L')).toEqual('L');
  });
});
