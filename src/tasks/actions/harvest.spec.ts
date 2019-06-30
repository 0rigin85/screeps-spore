import { Harvest } from './harvest';
import { Screeps } from '../generated/actions_generated';

const source = {} as Source;

const creep = {
  harvest(target: Source | Mineral): number {
    return target === source ? OK : ERR_INVALID_ARGS;
  }
} as Creep;

const data = {
  actor(): Screeps.Creep.Actor {
    return creep;
  },
  target(): Screeps.Creep.Actor {
    return source;
  }
} as Screeps.Creep.Harvest;

describe('Harvest', () => {
  test('execute(data, state)', () => {
    const state = {};
    const code = Harvest.execute(data, state);

    expect(code).toBe(OK);
  });
});
