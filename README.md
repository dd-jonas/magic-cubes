![npm](https://img.shields.io/npm/v/magic-cubes?style=for-the-badge)

# Magic Cubes

JavaScript library for simulating the Rubik's cube and working with algorithms.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [License](#license)

## Installation

#### npm

```bash
  npm install magic-cubes
```

#### Yarn

```bash
  yarn add magic-cubes
```

## Usage

### Cube

```js
import { Cube } from 'magic-cubes';

const cube = new Cube("L' R2 U2 B2 L2 U2 B2 L2 F U2 F2 L2 U R D' F D' F U L R");
console.log(cube.isSolved); // -> false

cube.solve("U2 D B R2 L2 U2 R L' F' U2 R2 D' F R D B2 R F'");
console.log(cube.isSolved); // -> true
```

### Cube Model

```js
import { Cube, CubeModel } from 'magic-cubes';

const cube = new Cube("D2 U2 B F2 D2 B D2 R2 D2 U2 R' U' B2 F2 R' U2 F L U R");
const colorScheme = {
  U: 'w', // white
  F: 'g', // green
  R: 'r', // red
  D: 'y', // yellow
  B: 'b', // blue
  L: 'o', // orange
};

const model = new CubeModel(cube, colorScheme);
model.render((faces) => {
  const [u, f, r, d, b, l] = faces.map((face) =>
    face.map((row) => row.join(''))
  );

  console.log(`
        ${u[0]}
        ${u[1]}
        ${u[2]}
    ${l[0]} ${f[0]} ${r[0]} ${b[0]}
    ${l[1]} ${f[1]} ${r[1]} ${b[1]}
    ${l[2]} ${f[2]} ${r[2]} ${b[2]}
        ${d[0]}
        ${d[1]}
        ${d[2]}
  `);

  // ->
  //        oyo
  //        rwg
  //        ryr
  //    bwb wbw gwy grw
  //    oor bgg rrb obw
  //    byw gyy gwb oor
  //        ogr
  //        oyb
  //        ygy
});
```

### Algorithm

```js
import { Algorithm } from 'magic-cubes';

const alg = new Algorithm('[Lw’ : [U , R’ D2 R]] ');
console.log(alg.clean); // -> [l', [U, R' D2 R]]
console.log(alg.inverse); // -> [l', [R' D2 R, U]]

try {
  const incorrectAlg = new Algorithm('foo');
} catch (error) {
  console.log(error); // -> Invalid character 'o' at position 2.
}
```

## API Reference

### Cube

```js
new Cube(scramble?);
```

#### Parameters

- `scramble: Algorithm | string`
  - The scramble to apply on the cube.
  - Calls the `scramble` method.

#### Properties

- `isSolved`
  - Checks if the cube is in the solved state.
  - Ignores orientation.

#### Methods

- `apply(alg: Algorithm | string)`
  - Applies an algorithm to the cube.
  - An `Algorithm` will be created when providing a `string`, which throws when invalid.
- `scramble(alg: Algorithm | string)`
  - Alias of `apply`
- `solve(alg: Algorithm | string)`
  - Alias of `apply`
- `orient()`
  - Resets the orientation of the cube.

### CubeModel

```js
new CubeModel(cube, colorScheme);
```

#### Parameters

- `cube: Cube`
  - Required
  - The `Cube` from which a model should be created.
- `colorScheme: Record<Face, string>`
  - Required
  - An object that maps each `Face` to a string.
  - `Face` is `'U' | 'D' | 'F' | 'B' | 'L' | 'R'`.

#### Methods

- `colors: () => CubeColors`
  - Object that describes the colors of the cube.
  - `CubeColors` is of type `Record<Face, string[]>`.
  - `string` will be a color defined in `colorScheme`.
  - _Tip: Use `as const` when defining the color scheme in TypeScript to give `CubeColors` a stronger typing (`Record<Face, string[]>` becomes `Record<Face, ColorScheme[Face][]>`)._

### Algorithm

```js
new Algorithm(alg);
```

#### Parameters

- `alg: string`
  - String representation of an algorithm.
  - Supports sequences, e.g. `"R U R' U' R' F R2 U' R' U' R U R' F'"`.
  - Supports commutators and conjugates, e.g. `"[l': [U, R' D2 R]]"`.
  - Supports repeating groups, e.g. `"F (R U R' U')2 F'"`.
  - Will be silently normalized before operating on it:
    - Leading and trailing whitespaces will be trimmed.
    - Prime characters (`'`, `’` and `′`) will be converted to `'`.
    - Double prime turns (`2'` or `'2`) will be converted to `2`.
    - Wide move notation with `w` will be converted to lowercase (e.g. `Fw` becomes `f`).
    - Parantheses without multiplier will be removed (e.g. `F (R U R' U') F'` becomes `F R U R' U' F'`).
    - Asterisks before multipliers will be removed (e.g. `(M U)*4` becomes `(M U)4`).
  - Throws a descriptive error when the string is invalid.

#### Properties

- `raw: string`
  - The original string input.
- `clean: string`
  - Cleaned up version of the input.
  - Normalizes spacing.
  - Merges multiple turns (e.g. `R R` becomes `R2`).
  - Inverts commutators when cancelling with the conjugate setup. (e.g. `[U: [U, L E L']]` becomes `[U2: [L E L', U']]`).
  - Removes repeating group with a multiplier of `0`.
  - Converts repeating groups with a multiplier of `1` to a sequence.
  - Etc.
- `inverse`
  - Inverse of the input.
- `turns: TurnNode[]`
  - Array of turn nodes after sequencing the algorithm.
  - Used by `Cube` when applying an algorithm. Shouldn't need to be called directly.

## Roadmap

- Additional algorithm props and methods (rotationless, parallel move concatentation, ...)
- Scramble generator
- Kociemba solver

## License

[MIT](https://choosealicense.com/licenses/mit/)
