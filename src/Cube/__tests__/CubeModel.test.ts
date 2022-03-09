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
    expect(model.colors()).toEqual({
      U: ['white', 'white', 'white', 'white', 'white', 'white', 'white', 'white', 'white'],
      D: ['yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow', 'yellow'],
      F: ['green', 'green', 'green', 'green', 'green', 'green', 'green', 'green', 'green'],
      B: ['blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue', 'blue'],
      L: ['orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange', 'orange'],
      R: ['red', 'red', 'red', 'red', 'red', 'red', 'red', 'red', 'red'],
    });
  });

  it('creates a color array of a scrambled cube', () => {
    const cube = new Cube(
      "D2 U2 B F2 D2 B D2 R2 D2 U2 R' U' B2 F2 R' U2 F L U R"
    );

    const model = new CubeModel(cube, colorScheme);

    // prettier-ignore
    expect(model.colors()).toEqual({
      U: ['orange', 'yellow', 'orange', 'red', 'white', 'green', 'red', 'yellow', 'red'],
      D: ['orange', 'green', 'red', 'orange', 'yellow', 'blue', 'yellow', 'green', 'yellow'],
      F: ['white', 'blue', 'white', 'blue', 'green', 'green', 'green', 'yellow', 'yellow'],
      B: ['green', 'red', 'white', 'orange', 'blue', 'white', 'orange', 'orange', 'red'],
      L: ['blue', 'white', 'blue', 'orange', 'orange', 'red', 'blue', 'yellow', 'white'],
      R: ['green', 'white', 'yellow', 'red', 'red', 'blue', 'green', 'white', 'blue'],
    });
  });

  it('handles rotations', () => {
    const cube1 = new Cube('R U F D2');
    const cube2 = new Cube('R U F D2 y');
    const cube3 = new Cube("R U F D2 y'");
    const cube4 = new Cube('R U F D2 y2');
    const cube5 = new Cube('R U F D2 x');
    const cube6 = new Cube("R U F D2 x'");

    const model1 = new CubeModel(cube1, colorScheme);
    const model2 = new CubeModel(cube2, colorScheme);
    const model3 = new CubeModel(cube3, colorScheme);
    const model4 = new CubeModel(cube4, colorScheme);
    const model5 = new CubeModel(cube5, colorScheme);
    const model6 = new CubeModel(cube6, colorScheme);

    // prettier-ignore
    expect(model1.colors()).toEqual({
      U: ['white', 'white', 'white', 'white', 'white', 'white', 'orange', 'orange', 'yellow'],
      D: ['blue', 'yellow', 'yellow', 'blue', 'yellow', 'yellow', 'white', 'red', 'red'],
      F: ['green', 'green', 'red', 'green', 'green', 'red', 'white', 'blue', 'blue'],
      B: ['orange', 'orange', 'orange', 'white', 'blue', 'blue', 'yellow', 'yellow', 'red'],
      L: ['green', 'green', 'yellow', 'orange', 'orange', 'yellow', 'green', 'red', 'red'],
      R: ['green', 'blue', 'blue', 'green', 'red', 'red', 'orange', 'orange', 'blue'],
    });

    // prettier-ignore
    expect(model2.colors()).toEqual({
      U: ['orange', 'white', 'white', 'orange', 'white', 'white', 'yellow', 'white', 'white'],
      D: ['yellow', 'yellow', 'red', 'yellow', 'yellow', 'red', 'blue', 'blue', 'white'],
      F: ['green', 'blue', 'blue', 'green', 'red', 'red', 'orange', 'orange', 'blue'],
      B: ['green', 'green', 'yellow', 'orange', 'orange', 'yellow', 'green', 'red', 'red'],
      L: ['green', 'green', 'red', 'green', 'green', 'red', 'white', 'blue', 'blue'],
      R: ['orange', 'orange', 'orange', 'white', 'blue', 'blue', 'yellow', 'yellow', 'red'],
    });

    // prettier-ignore
    expect(model3.colors()).toEqual({
      U: ['white', 'white', 'yellow', 'white', 'white', 'orange', 'white', 'white', 'orange'],
      D: ['white', 'blue', 'blue', 'red', 'yellow', 'yellow', 'red', 'yellow', 'yellow'],
      F: ['green', 'green', 'yellow', 'orange', 'orange', 'yellow', 'green', 'red', 'red'],
      B: ['green', 'blue', 'blue', 'green', 'red', 'red', 'orange', 'orange', 'blue'],
      L: ['orange', 'orange', 'orange', 'white', 'blue', 'blue', 'yellow', 'yellow', 'red'],
      R: ['green', 'green', 'red', 'green', 'green', 'red', 'white', 'blue', 'blue'],
    });

    // prettier-ignore
    expect(model4.colors()).toEqual({
      U: ['yellow', 'orange', 'orange', 'white', 'white', 'white', 'white', 'white', 'white'],
      D: ['red', 'red', 'white', 'yellow', 'yellow', 'blue', 'yellow', 'yellow', 'blue'],
      F: ['orange', 'orange', 'orange', 'white', 'blue', 'blue', 'yellow', 'yellow', 'red'],
      B: ['green', 'green', 'red', 'green', 'green', 'red', 'white', 'blue', 'blue'],
      L: ['green', 'blue', 'blue', 'green', 'red', 'red', 'orange', 'orange', 'blue'],
      R: ['green', 'green', 'yellow', 'orange', 'orange', 'yellow', 'green', 'red', 'red'],
    });

    // prettier-ignore
    expect(model5.colors()).toEqual({
      U: ['green', 'green', 'red', 'green', 'green', 'red', 'white', 'blue', 'blue'],
      D: ['red', 'yellow', 'yellow', 'blue', 'blue', 'white', 'orange', 'orange', 'orange'],
      F: ['blue', 'yellow', 'yellow', 'blue', 'yellow', 'yellow', 'white', 'red', 'red'],
      B: ['yellow', 'orange', 'orange', 'white', 'white', 'white', 'white', 'white', 'white'],
      L: ['yellow', 'yellow', 'red', 'green', 'orange', 'red', 'green', 'orange', 'green'],
      R: ['orange', 'green', 'green', 'orange', 'red', 'blue', 'blue', 'red', 'blue'],
    });

    // prettier-ignore
    expect(model1.colors()).toEqual({
      U: ['white', 'white', 'white', 'white', 'white', 'white', 'orange', 'orange', 'yellow'],
      D: ['blue', 'yellow', 'yellow', 'blue', 'yellow', 'yellow', 'white', 'red', 'red'],
      F: ['green', 'green', 'red', 'green', 'green', 'red', 'white', 'blue', 'blue'],
      B: ['orange', 'orange', 'orange', 'white', 'blue', 'blue', 'yellow', 'yellow', 'red'],
      L: ['green', 'green', 'yellow', 'orange', 'orange', 'yellow', 'green', 'red', 'red'],
      R: ['green', 'blue', 'blue', 'green', 'red', 'red', 'orange', 'orange', 'blue'],
    });

    // prettier-ignore
    expect(model6.colors()).toEqual({
      U: ['red', 'yellow', 'yellow', 'blue', 'blue', 'white', 'orange', 'orange', 'orange'],
      D: ['green', 'green', 'red', 'green', 'green', 'red', 'white', 'blue', 'blue'],
      F: ['white', 'white', 'white', 'white', 'white', 'white', 'orange', 'orange', 'yellow'],
      B: ['red', 'red', 'white', 'yellow', 'yellow', 'blue', 'yellow', 'yellow', 'blue'],
      L: ['green', 'orange', 'green', 'red', 'orange', 'green', 'red', 'yellow', 'yellow'],
      R: ['blue', 'red', 'blue', 'blue', 'red', 'orange', 'green', 'green', 'orange'],
    });
  });
});
