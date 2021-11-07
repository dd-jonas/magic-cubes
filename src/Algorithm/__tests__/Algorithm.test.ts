import { Algorithm } from '../Algorithm';
import { Direction, NodeTypes } from '../Parser';

describe('Algorithm constructor', () => {
  it('throws when exceeding the max input length', () => {
    const longAlg =
      'R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U R U ';

    expect(() => new Algorithm(longAlg)).toThrow();
  });

  it('normalizes the input', () => {
    const input = ' (Rw U)*2 (R2’ U’) ';

    const alg = new Algorithm(input);

    expect(alg.clean).toEqual("(r U)2 R2 U'");
  });

  it('inverses the input', () => {
    const input = "[r U r', D2]";

    const alg = new Algorithm(input);

    expect(alg.inverse).toEqual("[D2, r U r']");
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
