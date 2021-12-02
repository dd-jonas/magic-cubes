import { Algorithm } from '../Algorithm';
import { Direction, NodeTypes } from '../Parser';

describe('Algorithm constructor', () => {
  it('throws when exceeding the max input length', () => {
    const longAlg =
      'R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U ';

    expect(() => new Algorithm(longAlg)).toThrow();
  });

  it('cleans the input', () => {
    const input = ' (Rw U)*2 (R2’ U’) ';

    const alg = new Algorithm(input);

    expect(alg.clean).toEqual("(r U)2 R2 U'");
  });

  it('inverses the input', () => {
    const input = "[r U r', D2]";

    const alg = new Algorithm(input);

    expect(alg.inverse).toEqual("[D2, r U r']");
  });

  it('sequences the input', () => {
    const input1 = "[M': (U M' U M)2]";
    const input2 = "[S U' R': [E, R2]]";

    const alg1 = new Algorithm(input1);
    const alg2 = new Algorithm(input2);

    expect(alg1.sequence).toEqual("M' U M' U M U M' U M2");
    expect(alg2.sequence).toEqual("S U' R' E R2 E' R' U S'");
  });

  it('sequences the input without rotations', () => {
    const input1 = "r U R' U' r' F R F'";
    const input2 = "[S U' R': [E, R2]]";

    const alg1 = new Algorithm(input1);
    const alg2 = new Algorithm(input2);

    expect(alg1.rotationless).toEqual("L F R' F' L' F R F'");
    expect(alg2.rotationless).toEqual("F' B L' U' R' L F2 R L' U' L F B'");
  });

  it('creates sequenced turn nodes', () => {
    const input = "[r U r', D2]";

    const alg = new Algorithm(input);

    expect(alg.turns).toEqual([
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CW },
      { type: NodeTypes.Turn, move: 'U', direction: Direction.CW },
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CCW },
      { type: NodeTypes.Turn, move: 'D', direction: Direction.Double },
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CW },
      { type: NodeTypes.Turn, move: 'U', direction: Direction.CCW },
      { type: NodeTypes.Turn, move: 'r', direction: Direction.CCW },
      { type: NodeTypes.Turn, move: 'D', direction: Direction.Double },
    ]);
  });
});
