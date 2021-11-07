import { Cube } from '../Cube';
import { CubeModel } from '../CubeModel';

describe('CubeModel', () => {
  const colorScheme = {
    U: 'white',
    F: 'green',
    R: 'red',
    D: 'yellow',
    B: 'blue',
    L: 'orange',
  } as const;

  it('creates a color array of a solved cube', () => {
    const cube = new Cube();

    const model = new CubeModel(cube, colorScheme);

    // prettier-ignore
    expect(model.colors).toEqual([
      [['white', 'white', 'white'], ['white', 'white', 'white'], ['white', 'white', 'white']],
      [['green', 'green', 'green'], ['green', 'green', 'green'], ['green', 'green', 'green']],
      [['red', 'red', 'red'], ['red', 'red', 'red'], ['red', 'red', 'red']],
      [['yellow', 'yellow', 'yellow'], ['yellow', 'yellow', 'yellow'], ['yellow', 'yellow', 'yellow']],
      [['blue', 'blue', 'blue'], ['blue', 'blue', 'blue'], ['blue', 'blue', 'blue']],
      [['orange', 'orange', 'orange'], ['orange', 'orange', 'orange'], ['orange', 'orange', 'orange']],
    ]);
  });

  it('creates a color array of a scrambled cube', () => {
    const cube = new Cube(
      "D2 U2 B F2 D2 B D2 R2 D2 U2 R' U' B2 F2 R' U2 F L U R"
    );

    const model = new CubeModel(cube, colorScheme);

    // prettier-ignore
    expect(model.colors).toEqual([
      [['orange', 'yellow', 'orange'], ['red', 'white', 'green'], ['red', 'yellow', 'red']],
      [['white', 'blue', 'white'], ['blue', 'green', 'green'], ['green', 'yellow', 'yellow']],
      [['green', 'white', 'yellow'], ['red', 'red', 'blue'], ['green', 'white', 'blue']],
      [['orange', 'green', 'red'], ['orange', 'yellow', 'blue'], ['yellow', 'green', 'yellow']],
      [['green', 'red', 'white'], ['orange', 'blue', 'white'], ['orange', 'orange', 'red']],
      [['blue', 'white', 'blue'], ['orange', 'orange', 'red'], ['blue', 'yellow', 'white']],
    ]);
  });

  it('handles rotations', () => {
    const cube = new Cube('x y z');

    const model = new CubeModel(cube, colorScheme);

    // prettier-ignore
    expect(model.colors).toEqual([
      [['yellow', 'yellow', 'yellow'], ['yellow', 'yellow', 'yellow'], ['yellow', 'yellow', 'yellow']],
      [['red', 'red', 'red'], ['red', 'red', 'red'], ['red', 'red', 'red']],
      [['green', 'green', 'green'], ['green', 'green', 'green'], ['green', 'green', 'green']],
      [['white', 'white', 'white'], ['white', 'white', 'white'], ['white', 'white', 'white']],
      [['orange', 'orange', 'orange'], ['orange', 'orange', 'orange'], ['orange', 'orange', 'orange']],
      [['blue', 'blue', 'blue'], ['blue', 'blue', 'blue'], ['blue', 'blue', 'blue']],
    ]);
  });

  it('calls a render function with the colors array as argument', () => {
    const cube = new Cube(
      "D2 U2 B F2 D2 B D2 R2 D2 U2 R' U' B2 F2 R' U2 F L U R"
    );

    const model = new CubeModel(cube, colorScheme);

    const renderMock = jest.fn();

    model.render(renderMock);

    // prettier-ignore
    expect(renderMock).toBeCalledWith([
      [['orange', 'yellow', 'orange'], ['red', 'white', 'green'], ['red', 'yellow', 'red']],
      [['white', 'blue', 'white'], ['blue', 'green', 'green'], ['green', 'yellow', 'yellow']],
      [['green', 'white', 'yellow'], ['red', 'red', 'blue'], ['green', 'white', 'blue']],
      [['orange', 'green', 'red'], ['orange', 'yellow', 'blue'], ['yellow', 'green', 'yellow']],
      [['green', 'red', 'white'], ['orange', 'blue', 'white'], ['orange', 'orange', 'red']],
      [['blue', 'white', 'blue'], ['orange', 'orange', 'red'], ['blue', 'yellow', 'white']],
    ]);
  });
});
