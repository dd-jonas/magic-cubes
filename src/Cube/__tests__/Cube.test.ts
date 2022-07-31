import { assert, describe, it } from 'vitest';

import { Algorithm } from '../../Algorithm/Algorithm';
import { Cube } from '../Cube';

describe.concurrent('Cube', () => {
  it('creates a solved cube', () => {
    const cube = new Cube();

    assert.isTrue(cube.isSolved);
  });

  it('scrambles and solves the cube', () => {
    const cube = new Cube("U r M' D2 x' R f' E2 u d' y' z2 F2 B2 l b L S'");

    assert.isFalse(cube.isSolved);

    cube.solve("x' z' U' R' F2 L B' L' B2"); // Cross
    cube.solve("U' R U' R2 U' R"); // F2L 1
    cube.solve("U2 L' U2 L U' L' U L"); // F2L 2
    cube.solve("U R U' R' y' R' U2 R"); // F2L 3
    cube.solve("L' U' L U' L' U L"); // F2L 4
    cube.solve("U R U2 R' U' R U' R'"); // OLL
    cube.solve("U2 l' U R' D2 R U' R' D2 R l U'"); // PLL

    assert.isTrue(cube.isSolved);
  });

  it('accepts an Algorithm instance as input', () => {
    const scramble = new Algorithm(" R U R' U'");
    const solve = new Algorithm("U R U' R'");
    const cube = new Cube(scramble);

    cube.solve(solve);

    assert.isTrue(cube.isSolved);
  });

  it('checks if the cube is oriented', () => {
    const cube = new Cube();

    assert.isTrue(cube.isOriented);

    cube.apply('x y z');

    assert.isFalse(cube.isOriented);
  });

  it('resets orientation', () => {
    const cube = new Cube('x y z');

    assert.equal(cube.orientation.getFace('U'), 'D');
    assert.equal(cube.orientation.getFace('F'), 'R');
    assert.equal(cube.orientation.getFace('R'), 'F');
    assert.equal(cube.orientation.getFace('D'), 'U');
    assert.equal(cube.orientation.getFace('B'), 'L');
    assert.equal(cube.orientation.getFace('L'), 'B');

    cube.orient();

    assert.equal(cube.orientation.getFace('U'), 'U');
    assert.equal(cube.orientation.getFace('F'), 'F');
    assert.equal(cube.orientation.getFace('R'), 'R');
    assert.equal(cube.orientation.getFace('D'), 'D');
    assert.equal(cube.orientation.getFace('B'), 'B');
    assert.equal(cube.orientation.getFace('L'), 'L');
  });
});
