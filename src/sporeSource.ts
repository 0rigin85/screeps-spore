import { ClaimReceipt } from "./ClaimReceipt";
import { Ptr } from "./Ptr";
import { Remember } from "./Remember";

export class SourceClaims {
  constructor(private source: Source) {}

  count: number = 0;
  work: number = 0;
  energy: number = 0;
}

// unused mirror class of the screeps Source class used to make Typescript happy
// class ScreepsSource implements Source
// {
//     prototype: Source;
//     energy: number;
//     energyCapacity: number;
//     id: string;
//     pos: RoomPosition;
//     room: Room;
//     ticksToRegeneration: number;

//     doIgnore: boolean;
//     doFavor: boolean;
//     doTrack: boolean;
//     memory: SourceMemory;
//     slots: number;
//     priorityModifier: number;

//     collect(collector: any, claimReceipt: ClaimReceipt): number { return 0; }

//     makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt  { return null; }
//     claims: SourceClaims;
// }

export class SporeSource extends Source implements Claimable {
  doIgnore: boolean;

  get doTrack(): boolean {
    return (<SourceMemory>this.memory).track === true;
  }

  doFavor: boolean;

  static getSlots(source: Ptr<Source>): number {
    let roomMemory = Memory.rooms[source.pos.roomName];

    if (roomMemory == null) {
      return -1;
    }

    if (roomMemory.sources == null) {
      roomMemory.sources = {};
    }

    let sourceMemory = roomMemory.sources[source.id];

    if (sourceMemory == null) {
      sourceMemory = <SourceMemory>{};
      roomMemory.sources[source.id] = sourceMemory;
    }

    if (sourceMemory.claimSlots == null) {
      sourceMemory.claimSlots = source.pos.getWalkableSurroundingArea();
    }

    return sourceMemory.claimSlots;
  }

  get slots(): number {
    let slots = this.memory.claimSlots;

    if (slots == null) {
      slots = this.pos.getWalkableSurroundingArea();
      this.memory.claimSlots = slots;
    }

    return slots;
  }

  get priorityModifier(): number {
    return Remember.forTick(`${this.id}.priorityModifier`, () => {
      let pathToClosestSpawn: SporePathMemory = this.memory.pathToClosestSpawn;
      let priorityModifier = 0;

      if (
        pathToClosestSpawn == null ||
        Game.time - pathToClosestSpawn.tickCalculated > 300
      ) {
        let colony = (<any>this).colony;
        let path: SporePath = null;

        if (colony.cpuSpentPathing <= colony.pathingCpuLimit) {
          path = colony.pathFinder.findPathTo(
            this.pos,
            _.map(this.room.mySpawns, (spawn: StructureSpawn) => {
              return { pos: spawn.pos, range: 1 };
            })
          );
        }

        if (path != null) {
          this.memory.pathToClosestSpawn = path.serialize();
          priorityModifier += Math.max(0, 250 - path.cost);
        }
      } else {
        priorityModifier += Math.max(0, 250 - pathToClosestSpawn.cost);
      }

      return priorityModifier;
    });
  }

  get memory(): SourceMemory {
    let roomMemory = this.room.memory;

    if (roomMemory.sources == null) {
      roomMemory.sources = {};
    }

    let memory = roomMemory.sources[this.id];

    if (memory == null) {
      memory = <SourceMemory>{};
      roomMemory.sources[this.id] = memory;
    }

    return memory;
  }

  collect(collector: any, claimReceipt: ClaimReceipt): number {
    if (claimReceipt.target !== this) {
      return ERR_INVALID_TARGET;
    }

    if (collector.harvest != null) {
      let code = collector.harvest(this);

      if (code === OK) {
        this.room.energyHarvestedSinceLastInvasion +=
          collector.getActiveBodyparts(WORK) * 2;
      }

      return code;
    }

    return ERR_INVALID_ARGS;
  }

  makeClaim(
    claimer: any,
    resourceType: string,
    amount: number,
    minAmount: number,
    isExtended?: boolean
  ): ClaimReceipt {
    //console.log('makeClaim ' + claimer);
    if (
      resourceType != RESOURCE_ENERGY || // ensure they are trying to claim energy
      this.claims.count >= this.slots || //ensure we have open slots
      (this.claims.work >= 1 && isExtended === true)
    ) {
      // ensure for extended claims we have open work
      //console.log('makeClaim energy ' + (amount > this.energy - this.claims.energy && isExtended === false));
      //console.log('makeClaim slots ' + (this.claims.count >= this.claims.slots));
      //console.log('   makeClaim count ' + this.claims.count);
      //console.log('   makeClaim slots ' + this.claims.slots);
      //console.log('makeClaim work ' + (this.claims.work >= 1 && isExtended === true));

      return null;
    }

    let claimAmount = amount;

    if (isExtended === false) {
      let remaining = this.energy - this.claims.energy;

      // ensure our remaining resource meets their claim
      if (claimAmount > remaining) {
        if (minAmount > remaining) {
          return null;
        }

        claimAmount = remaining;
      }
    }

    this.claims.count++;
    this.claims.energy += claimAmount; // extended claims ignore the resource amount request on sources

    if (isExtended === true && claimer.getActiveBodyparts != null) {
      this.claims.work += claimer.getActiveBodyparts(WORK) / 5;
    }

    //console.log('makeClaim success');
    return new ClaimReceipt(this, "source", resourceType, claimAmount);
  }

  private _claimTick: number;
  private _claims: SourceClaims;
  get claims(): SourceClaims {
    if (this._claims != null && this._claimTick == Game.time) {
      return this._claims;
    }

    this._claimTick = Game.time;
    this._claims = new SourceClaims(this);

    //Object.defineProperty(this, "claims", {value: claims, configurable: true, enumerable: true});
    return this._claims;
  }
}
