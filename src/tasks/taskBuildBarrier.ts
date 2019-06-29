import { ACTION_BUILD, CREEP_TYPE, ACTION_REPAIR, ACTION_MOVE } from '../sporeCreep';
import { CollectOptions } from '../CollectOptions';
import { Ptr, OBJECT_CONSTRUCTION_SITE } from '../Ptr';
import { SpawnRequest } from '../SpawnRequest';
import { SpawnAppointment } from '../SpawnAppointment';
import { BodyDefinition } from '../BodyDefinition';
import { TaskPriority } from './TaskPriority';
import { Task, ERR_CANNOT_PERFORM_TASK, ERR_NO_WORK, NO_MORE_WORK } from './task';
import { LaborDemandType } from '../LaborDemandType';
import { Remember } from '../Remember';

export class BuildBarrier extends Task {
  idealCreepBody: BodyDefinition;
  scheduledWorkers: number = 0;
  scheduledCarry: number = 0;

  direRampartHits: number = RAMPART_DECAY_AMOUNT * 10;
  averageHits: number = 0;
  averageDelta: number = 1000;
  requiredCarryPerBarrier: number = 0.15;

  memory: BuildBarrierMemory;

  constructor(barriers: Ptr<ConstructionSite | StructureWall | StructureRampart>[]) {
    super(false);

    this.roomName = barriers[0].pos.roomName;
    this.id = 'Reinforce barriers ' + this.roomName;
    this.name = 'Reinforce barriers ' + this.roomName;
    this.possibleWorkers = -1;
    this.priority = TaskPriority.Medium;
    this.idealCreepBody = CREEP_TYPE.MASON;

    this.memory = Remember.forever(`rooms.${this.roomName}.tasks.buildbarrier`, () => {
      return BuildBarrier.createMemory(barriers);
    });

    if (
      this.memory == null ||
      this.memory.barriers == null ||
      this.memory.barriers.length != barriers.length ||
      Game.time - this.memory.tick > 10
    ) {
      this.memory = Memory.rooms[this.roomName].tasks.buildbarrier = BuildBarrier.createMemory(barriers);
    }

    this.labor.types[this.idealCreepBody.name] = new LaborDemandType(
      {
        carry: Math.floor(this.requiredCarryPerBarrier * barriers.length)
      },
      1,
      10
    );
  }

  private static createMemory(
    barriers: Ptr<ConstructionSite | StructureWall | StructureRampart>[]
  ): BuildBarrierMemory {
    let totalHits = 0;
    let total = 0;
    for (let barrier of barriers) {
      if (barrier.isValid && !barrier.isShrouded && barrier.type !== OBJECT_CONSTRUCTION_SITE) {
        total++;
        totalHits += (<Structure>(<any>barrier.instance)).hits;
      }
    }

    BuildBarrier.sortBarriers(barriers);

    return {
      tick: Game.time,
      barriers: barriers,
      averageHits: totalHits / total
    };
  }

  private static sortBarriers(barriers: Ptr<ConstructionSite | StructureWall | StructureRampart>[]): void {
    barriers.sort(
      function(a, b) {
        const aIsRampart = a.lookTypeModifier === STRUCTURE_RAMPART;
        const bIsRampart = b.lookTypeModifier === STRUCTURE_RAMPART;

        const aIsStructure = a.lookType === LOOK_STRUCTURES;
        const bIsStructure = b.lookType === LOOK_STRUCTURES;

        const aIsShrouded = a.isShrouded;
        const bIsShrouded = b.isShrouded;

        const aInstance = a.instance;
        const bInstance = b.instance;

        const aIsDireRampart = aIsRampart && !aIsShrouded && (<Structure>(<any>aInstance)).hits < this.direRampartHits;
        const bIsDireRampart = bIsRampart && !bIsShrouded && (<Structure>(<any>bInstance)).hits < this.direRampartHits;

        if (aIsDireRampart && bIsDireRampart) {
          const aHits = (<Structure>(<any>aInstance)).hits;
          const bHits = (<Structure>(<any>bInstance)).hits;

          if (aHits === bHits) {
            return BuildBarrier.comparePosition(a, b);
          }

          if (aHits < bHits) {
            return -1;
          }

          return 1;
        }

        if (aIsDireRampart && !bIsDireRampart) {
          return -1;
        }

        if (!aIsDireRampart && bIsDireRampart) {
          return 1;
        }

        if (!aIsStructure && !bIsStructure) {
          return BuildBarrier.comparePosition(a, b);
        }

        if (aIsStructure && !bIsStructure) {
          return 1;
        }

        if (!aIsStructure && bIsStructure) {
          return -1;
        }

        if (aIsShrouded && bIsShrouded) {
          return BuildBarrier.comparePosition(a, b);
        }

        if (!aIsShrouded && bIsShrouded) {
          return -1;
        }

        if (aIsShrouded && !bIsShrouded) {
          return 1;
        }

        let aHits = (<Structure>(<any>aInstance)).hits;
        let bHits = (<Structure>(<any>bInstance)).hits;

        let ideal = this.averageHits + this.averageDelta;
        let aIsIdeal = aHits >= ideal;
        let bIsIdeal = bHits >= ideal;

        if (aIsIdeal && bIsIdeal) {
          return BuildBarrier.comparePosition(a, b);
        }

        if (!aIsIdeal && bIsIdeal) {
          return -1;
        }

        if (aIsIdeal && !bIsIdeal) {
          return 1;
        }

        if (aHits < bHits) {
          return -1;
        }

        if (aHits > bHits) {
          return 1;
        }

        return BuildBarrier.comparePosition(a, b);
      }.bind(this)
    );

    // for (let ptr of barriers)
    // {
    //     console.log(ptr);
    // }
  }

  private static comparePosition(a: RoomObject, b: RoomObject): number {
    if (a.pos.x === b.pos.x) {
      if (a.pos.y === b.pos.y) {
        return 0;
      }

      if (a.pos.y < b.pos.y) {
        return -1;
      }

      return 1;
    }

    if (a.pos.x < b.pos.x) {
      return -1;
    }

    return 1;
  }

  createAppointment(spawn: StructureSpawn, request: SpawnRequest): SpawnAppointment {
    if (request.replacingCreep != null) {
      return super.createBasicAppointment(spawn, request, request.replacingCreep);
    }

    return super.createBasicAppointment(spawn, request, new RoomPosition(25, 25, this.roomName));
  }

  getPrioritizingConditions(conditions: Array<any>): void {
    conditions.push((creep: Creep) => {
      if (creep.carry[RESOURCE_ENERGY] === 0 && creep.carryCount === creep.carryCapacity) {
        return -1;
      }

      if (creep.type === CREEP_TYPE.MINER.name || creep.type === CREEP_TYPE.UPGRADER.name) {
        return -1;
      }

      return 0;
    });

    super.getBasicPrioritizingConditions(conditions, new RoomPosition(25, 25, this.roomName), this.idealCreepBody);
  }

  isIdeal(object: RoomObject): boolean {
    if (object instanceof Creep) {
      return object.type === this.idealCreepBody.name;
    }

    return false;
  }

  beginScheduling(): void {
    this.scheduledWorkers = 0;
    this.scheduledCarry = 0;
  }

  hasWork(): boolean {
    if (this.possibleWorkers === 0) {
      return false;
    }

    if (this.labor.types[this.idealCreepBody.name] != null) {
      if (
        this.scheduledCarry >= this.labor.types[this.idealCreepBody.name].parts[CARRY] ||
        this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max
      ) {
        return false;
      }
    }

    return true;
  }

  schedule(object: RoomObject): number {
    if (!(object instanceof Creep)) {
      console.log('ERROR: Attempted to reinforce barriers with a non-creep room object. ' + object);
      return ERR_CANNOT_PERFORM_TASK;
    }

    let nextBarrier = 0; //Math.min(this.workers, this.barriers.length);
    let creep = <Creep>object;
    let code;

    if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
      creep.goMoveTo(creep.spawnRequest.replacingCreep);
      return OK;
    }

    if (!this.hasWork()) {
      return ERR_NO_WORK;
    }

    var rememberedBarrier = this.memory.barriers[nextBarrier];

    let barrierObject: Ptr<ConstructionSite | StructureWall | StructureRampart>;
    if (!(rememberedBarrier instanceof Ptr)) {
      barrierObject = Ptr.fromString(rememberedBarrier as string);
    } else {
      barrierObject = rememberedBarrier;
    }

    if (barrierObject == null) {
      return ERR_INVALID_TARGET;
    }

    if (
      creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
      ((creep.action === ACTION_BUILD || creep.action === ACTION_REPAIR || creep.action === ACTION_MOVE) &&
        creep.carry[RESOURCE_ENERGY] > 0)
    ) {
      code = this.goReinforce(creep, barrierObject);
    } else {
      creep.taskMetadata = { type: 'BuildBarrier', target: null };
      let amount = creep.carryCapacityRemaining;

      code = creep.goCollect(
        RESOURCE_ENERGY,
        amount,
        amount,
        false,
        barrierObject.pos,
        new CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]),
        {}
      );

      if (code === ERR_NO_WORK) {
        if (creep.carry[RESOURCE_ENERGY] > 0) {
          code = this.goReinforce(creep, barrierObject);
        } else {
          code = creep.goCollect(
            RESOURCE_ENERGY,
            amount,
            0,
            false,
            barrierObject.pos,
            new CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]),
            {}
          );
        }
      }
    }

    if (code === OK) {
      this.scheduledWorkers++;
      this.scheduledCarry += creep.getActiveBodyparts(CARRY);

      if (this.possibleWorkers > 0) {
        this.possibleWorkers--;
      }
    }

    if (!this.hasWork()) {
      return NO_MORE_WORK;
    }

    return code;
  }

  private goReinforce(creep: Creep, barrierObject: Ptr<ConstructionSite | StructureWall | StructureRampart>): number {
    let code;

    if (creep.taskMetadata != null && creep.taskMetadata.type === 'BuildBarrier' && creep.taskMetadata.target != null) {
      let barrierId = creep.taskMetadata.target;
      let object = Game.getObjectById(barrierId);

      if (object != null) {
        barrierObject = Ptr.from<any>(object);
      }
    }

    if (barrierObject.type === OBJECT_CONSTRUCTION_SITE) {
      code = creep.goBuild(<Ptr<ConstructionSite>>barrierObject);
    } else {
      code = creep.goRepair(<Ptr<Structure>>(<any>barrierObject));
    }

    creep.taskMetadata = { type: 'BuildBarrier', target: barrierObject.id };

    return code;
  }

  endScheduling(): void {}
}
