import { SporeRoom } from './sporeRoom';
import { SporeCreep } from './sporeCreep';
import { SporeSource } from './sporeSource';
import { SporeRoomObject } from './SporeRoomObject';
import { SporeConstructionSite } from './sporeConstructionSite';
import { SporeContainer } from './sporeContainer';
import { SporeController } from './sporeController';
import { SporeExtension } from './SporeExtension';
import { SporeFlag } from './sporeFlag';
import { SporeRoomPosition } from './sporeRoomPosition';
import { SporeSpawn } from './SporeSpawn';
import { SporeStorage } from './sporeStorage';
import { SporeStructure } from './SporeStructure';
import { SporeTower } from './SporeTower';
import { SporeColony } from './sporeColony';
import { SporeResource } from './sporeResource';
import { SporeLink } from './sporeLink';

export class Spore {
  constructor() {}

  static colony: SporeColony = null;

  static inject(): void {
    function completeAssign(target, ...sources) {
      sources.forEach(source => {
        let descriptors = Object.getOwnPropertyNames(source).reduce(
          (descriptors, key) => {
            if (key != 'constructor' && key != 'colony') {
              descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
              descriptors[key].enumerable = true;
            }

            return descriptors;
          },
          <PropertyDescriptorMap>{}
        );

        // by default, Object.assign copies enumerable Symbols too
        Object.getOwnPropertySymbols(source).forEach(sym => {
          let descriptor = Object.getOwnPropertyDescriptor(source, sym);
          if (descriptor.enumerable) {
            descriptors[sym as any] = descriptor;
          }
        });

        Object.defineProperties(target, descriptors);

        if (target['colony'] == null) {
          Object.defineProperty(target, 'colony', {
            get: function() {
              return Spore.colony;
            },
            configurable: true
          });
        }
      });
      return target;
    }

    completeAssign(ConstructionSite.prototype, SporeConstructionSite.prototype);
    completeAssign(StructureContainer.prototype, SporeContainer.prototype);
    completeAssign(StructureController.prototype, SporeController.prototype);
    completeAssign(Creep.prototype, SporeCreep.prototype);
    completeAssign(StructureExtension.prototype, SporeExtension.prototype);
    completeAssign(Flag.prototype, SporeFlag.prototype);
    completeAssign(Room.prototype, SporeRoom.prototype);
    completeAssign(RoomObject.prototype, SporeRoomObject.prototype);
    completeAssign(RoomPosition.prototype, SporeRoomPosition.prototype);
    completeAssign(Source.prototype, SporeSource.prototype);
    completeAssign(StructureSpawn.prototype, SporeSpawn.prototype);
    completeAssign(StructureStorage.prototype, SporeStorage.prototype);
    completeAssign(Structure.prototype, SporeStructure.prototype);
    completeAssign(StructureTower.prototype, SporeTower.prototype);
    completeAssign(Resource.prototype, SporeResource.prototype);
    completeAssign(StructureLink.prototype, SporeLink.prototype);
  }
}
