import { flatbuffers } from 'flatbuffers';
import { Actions } from './generated/actions_generated';
require('./tests/screeps.mock');

import { ActionStream } from './ActionStream';
import { Hash } from '../common/hash';

const source = {};
const creep = {};

describe('ActionStream', () => {
  beforeEach(() => {
    //(Actor.resolve as any).mockReset();
  });

  describe('encode(object)', () => {
    test('simple 1', () => {

        let builder = new flatbuffers.Builder();

        let creepRef = 'creep #7a32f382c0a109da36a46123 E53S36:21,31';
        let sourceRef = 'source #7a32f382c0a109da36a46a10 E53S36:20,30';

        let creepStr = builder.createString(creepRef);
        let sourceStr = builder.createString(sourceRef);

        Actions.Actor.startActor(builder);
        Actions.Actor.addHash(builder, Hash.string(creepRef));
        Actions.Actor.addRef(builder, creepStr);
        let creepActor = Actions.Actor.endActor(builder);

        Actions.Actor.startActor(builder);
        Actions.Actor.addHash(builder, Hash.string(sourceRef));
        Actions.Actor.addRef(builder, sourceStr);
        let sourceActor = Actions.Actor.endActor(builder);


        Actions.MoveTo.startNextVector(builder, 1);
        Actions.NextAction.createNextAction(builder, null, 1);
        let nextMoveTo = builder.endVector();

        Actions.MoveTo.startMoveTo(builder);
        Actions.MoveTo.addIndex(builder, 0);
        Actions.MoveTo.addActor(builder, creepActor);
        Actions.MoveTo.addMoveTo(builder, sourceActor);
        Actions.MoveTo.addNext(builder, nextMoveTo);
        let moveTo = Actions.MoveTo.endMoveTo(builder);


        Actions.Loop.startNextVector(builder, 1);
        Actions.NextAction.createNextAction(builder, null, 2);
        let nextLoop = builder.endVector();

        Actions.Loop.startLoop(builder);
        Actions.Loop.addIndex(builder, 1);
        Actions.Loop.addNext(builder, nextLoop);
        let loop = Actions.Loop.endLoop(builder);


        Actions.Harvest.startNextVector(builder, 1);
        Actions.NextAction.createNextAction(builder, null, 1);
        let nextHarvest = builder.endVector();

        Actions.Harvest.startHarvest(builder);
        Actions.Harvest.addIndex(builder, 2);
        Actions.Harvest.addActor(builder, creepActor);
        Actions.Harvest.addHarvest(builder, sourceActor);
        Actions.Harvest.addNext(builder, nextHarvest);
        let harvest = Actions.Harvest.endHarvest(builder);

        let data = Actions.Stream.createActionsVector(builder, [ moveTo, loop, harvest ]);
        let actors = Actions.Stream.createActorsVector(builder, [ creepActor, sourceActor ]);

        Actions.Stream.startStream(builder);
        Actions.Stream.addActions(builder, data);
        Actions.Stream.addActors(builder, actors);
        let stream = Actions.Stream.endStream(builder);

        builder.finish(stream);

        let array = builder.asUint8Array();

        let result = ActionStream.encode([
            { MoveTo: source },
            { Loop: [
                { Harvest: source }
            ]}
        ], { Creep: creep });

        expect(result).toStrictEqual(array);
    });
  });
});


// const creep = null;
//       const creepA = null;
//       const creepB = null;
//       const creepC = null;
//       const container = null;
//       const storage = null;

//       const globals = { creep: creep };

      ActionStream.encode([
        { moveTo: source,
          while: [
            { heal: creep },
            { on: STRUCTURE_ROAD,
                yes: { repair: '$.on.road' } }
          ]
        },
        { if: source,
            isEmpty: [
                { lookNearBy: LOOK_STRUCTURES, name: 'nearBy' },
                { forEach: '$.nearBy', name: 'struct',
                    do: [
                        { if: '$.struct', 
                            isDamaged: { repair: '$.struct' }
                        },
                        { if: source, isNotEmpty: { goTo: 'nearBy' } }
                    ]
                },
                { waitTill: { if: source, isNotEmpty: { goTo: 'nearBy' } } }
            ],
            else: { lookNearBy: LOOK_STRUCTURES, name: 'nearBy',
                STRUCTURE_STORAGE: {
                    loop: [
                        { harvest: source, 
                            ERR_NOT_ENOUGH_RESOURCES: OK
                        },
                        { transfer: RESOURCE_ENERGY, 
                            to: '$.nearBy.container',
                            ERR_INVALID_TARGET: { goTo: 'nearBy' },
                            ERR_NOT_IN_RANGE: { goTo: 'nearBy' },
                            ERR_NOT_ENOUGH_RESOURCES: OK,
                            ERR_FULL: OK
                        }
                    ]},
                STRUCTURE_LINK: { 
                    loop: [
                        { harvest: source, 
                            ERR_NOT_ENOUGH_RESOURCES: OK
                        },
                        { transfer: RESOURCE_ENERGY, 
                            to: '$.nearBy.link',
                            ERR_INVALID_TARGET: { goTo: 'nearBy' },
                            ERR_NOT_IN_RANGE: { goTo: 'nearBy' },
                            ERR_NOT_ENOUGH_RESOURCES: OK,
                            ERR_FULL: OK
                        }
                    ]},
                STRUCTURE_CONTAINER: { 
                    loop: [
                        { harvest: source, 
                            ERR_NOT_ENOUGH_RESOURCES: OK
                        },
                        { transfer: RESOURCE_ENERGY, 
                            to: '$.nearBy.container',
                            ERR_INVALID_TARGET: { goTo: 'nearBy' },
                            ERR_NOT_IN_RANGE: { goTo: 'nearBy' },
                            ERR_NOT_ENOUGH_RESOURCES: OK,
                            ERR_FULL: OK
                        }
                    ]},
                else : [{
                    loop: [
                        { harvest: source, 
                            ERR_NOT_ENOUGH_RESOURCES: OK
                        },
                        { 
                            drop: RESOURCE_ENERGY,
                                ERR_NOT_ENOUGH_RESOURCES: OK,
                        }
                    ], count: 10 },
                    { goTo: 'nearBy' }
                ]
            }
        }], globals);

//       ActionStream.encode(
//         [
//           {
//             carrying: RESOURCE_ENERGY,
//             yes: [
//               { moveTo: storage, while: { carrying: RESOURCE_ENERGY } },
//               { transfer: RESOURCE_ENERGY, to: storage }
//             ],
//             no: [{ moveTo: container }, { withdraw: RESOURCE_ENERGY, from: container }]
//           }
//         ],
//         globals
//       );

//       ActionStream.encode([
//         {
//           wait: 'all',
//           do: [
//             { moveTo: storage, creep: creepA },
//             { moveTo: storage, creep: creepB },
//             { moveTo: storage, creep: creepC }
//           ]
//         }
//       ]);