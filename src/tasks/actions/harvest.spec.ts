import { flatbuffers } from 'flatbuffers';
import { Actions } from '../generated/actions_generated';
require('../tests/screeps.mock');
import { Harvest } from './harvest';
import { Actor } from '../actorResolver';
jest.mock('../actorResolver');

let builder = new flatbuffers.Builder();

let creepStr = builder.createString('source #7a32f382c0a109da36a46a10 E53S36:20,30');
let sourceStr = builder.createString('creep #7a32f382c0a109da36a46123 E53S36:21,31');

Actions.Actor.startActor(builder);
Actions.Actor.addHash(builder, 123);
Actions.Actor.addRef(builder, creepStr);
let creepActor = Actions.Actor.endActor(builder);

Actions.Actor.startActor(builder);
Actions.Actor.addHash(builder, 321);
Actions.Actor.addRef(builder, sourceStr);
let sourceActor = Actions.Actor.endActor(builder);

Actions.Harvest.startHarvest(builder);
Actions.Harvest.addIndex(builder, 0);
Actions.Harvest.addActor(builder, creepActor);
Actions.Harvest.addHarvest(builder, sourceActor);
let harvest = Actions.Harvest.endHarvest(builder);
builder.finish(harvest);

let buffer = new flatbuffers.ByteBuffer(builder.asUint8Array());
let data = Actions.Harvest.getRootAsHarvest(buffer);

describe('Harvest', () => {
  beforeEach(() => {
    (Actor.resolve as any).mockReset();
  });

  describe('execute(data, state)', () => {
    test('OK', () => {
      const source = {};
      Actor.resolve = jest
        .fn()
        .mockReturnValueOnce({
          harvest(target: Source | Mineral): number {
            return target === source ? OK : ERR_INVALID_TARGET;
          }
        })
        .mockReturnValueOnce(source);

      const state = {};
      const code = Harvest.execute(data, state);

      expect(code).toBe(OK);
    });

    test('creep == null => ERR_INVALID_ARGS', () => {
      Actor.resolve = jest
        .fn()
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({});

      const state = {};
      const code = Harvest.execute(data, state);

      expect(code).toBe(ERR_INVALID_ARGS);
    });

    test('target == null => ERR_INVALID_ARGS', () => {
      Actor.resolve = jest
        .fn()
        .mockReturnValueOnce({
          harvest(target: Source | Mineral): number {
            return OK;
          }
        })
        .mockReturnValueOnce(null);

      const state = {};
      const code = Harvest.execute(data, state);

      expect(code).toBe(ERR_INVALID_ARGS);
    });
  });
});
