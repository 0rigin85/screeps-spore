import { Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK, ERR_SKIP_WORKER } from '../task';
import { LaborDemandType } from '../LaborDemandType';
import { Ptr } from '../Ptr';
import { ACTION_COLLECT, ACTION_TRANSFER, CREEP_TYPE, ACTION_MOVE } from '../sporeCreep';
import { CollectOptions } from "../CollectOptions";
import { BodyDefinition } from '../BodyDefinition';
import { SpawnRequest } from '../SpawnRequest';
import { SpawnAppointment } from '../SpawnAppointment';

export class TransferResource extends Task {
  scheduledTransfer: number = 0;
  scheduledWorkers: number = 0;
  scheduledCarry: number = 0;
  reserveWorkers: boolean = false;
  capacityCap: number = 2000;

  idealCreepBody: BodyDefinition = CREEP_TYPE.COURIER;

  private resourcesNeeded = -1;
  private needsResources: any[] = [];
  private resourceCapacity = -1;

  constructor(
    public targets: Ptr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>[],
    public resourceType: ResourceConstant,
    public source: Ptr<Source>,
    //public resourcesPerTick: number, //resource per tick
    public options: CollectOptions,
    public anchor?: Ptr<RoomObject>
  ) {
    super(false);

    this.id = `Transfer:${resourceType} ${targets
      .map(function(t) {
        return t.id;
      })
      .join(',')}`;

    if (source != null) {
      this.id += ' ' + source;
      this.roomName = source.pos.roomName;
      this.anchor = source;
    } else {
      this.id += ' ';
      for (let index = 0; index < (<any[]>options.storePriorities).length; index++) {
        this.id += options.storePriorities[index].join(',');
      }

      this.roomName = targets[0].pos.roomName;
    }

    this.name = `Transfer ${resourceType} to ${targets.length} objects`;
    this.near = source;
    this.possibleWorkers = -1;

    // this.toDropOff = this.colony.pathFinder.findPathTo(this.source, targets[0], new SporePathOptions(
    //     [
    //         { id: 'structures', cost: 255 },
    //         { id: 'roads', cost: 1 },
    //         { id: 'creeps', cost: 255 }
    //     ],
    //     { id: this.id + ':toStore', ticks: 5 }
    // ));
    //
    // this.toPickUp = this.colony.pathFinder.findPathTo(targets[0], this.source, new SporePathOptions(
    //     [
    //         { id: 'structures', cost: 255 },
    //         { id: 'roads', cost: 1 },
    //         { id: 'creeps', cost: 255 }
    //     ],
    //     { id: this.id + ':toPickup', ticks: 5 }
    // ));

    // let distance = 0;
    // let ticksPerTripToTarget = 0;
    // let ticksPerTripToStore = 0;
    // let maxCarryPerCreep = 0;
    //
    // if (targets.length === 0)
    // {
    //     distance = targets[0].pos.findDistanceByPathTo(this.source);
    // }
    //
    // let carryRequiredPerRoundTrip = (((ticksPerTripToTarget + ticksPerTripToStore) * this.resourcesPerTick) / CARRY_CAPACITY);
    // let numberOfCreepsRequired = Math.ceil(carryRequiredPerRoundTrip / maxCarryPerCreep);
    // let carryPerCreep = carryRequiredPerRoundTrip / numberOfCreepsRequired;
  }

  calculateRequirements(): void {
    this.needsResources.length = 0;
    this.resourcesNeeded = -1;
    this.resourceCapacity = -1;

    for (let index = 0; index < this.targets.length; index++) {
      let target = this.targets[index];

      if (!target.isValid) {
        continue;
      }

      if (target.isShrouded) {
        this.needsResources.push(this.targets[index]);
        continue;
      }

      if (
        (<EnergyContainerLike>(<any>target.instance)).energyCapacity != null &&
        this.resourceType === RESOURCE_ENERGY
      ) {
        let energyContainer = <EnergyContainerLike>(<any>target.instance);
        let remainingStore = energyContainer.energyCapacityRemaining;
        this.resourceCapacity += energyContainer.energyCapacity;

        if (remainingStore > 0) {
          this.needsResources.push(target);
          this.resourcesNeeded += remainingStore;
        }
      } else if ((<StoreContainerLike>(<any>target.instance)).storeCapacity != null) {
        let storeContainer = <StoreContainerLike>(<any>target.instance);
        let remainingStore = storeContainer.storeCapacityRemaining;

        if (storeContainer instanceof StructureStorage) {
          this.resourceCapacity += 300000;
        } else {
          this.resourceCapacity += remainingStore + storeContainer.store[this.resourceType];
        }

        if (remainingStore > 0) {
          this.needsResources.push(target);
          this.resourcesNeeded += remainingStore;
        }
      } else if ((<CarryContainerLike>(<any>target.instance)).carryCapacity != null) {
        let carryContainer = <CarryContainerLike>(<any>target.instance);
        let remainingStore = carryContainer.carryCapacityRemaining;
        this.resourceCapacity += remainingStore + carryContainer.carry[this.resourceType];

        if (remainingStore > 0) {
          this.needsResources.push(target);
          this.resourcesNeeded += remainingStore;
        }
      } else {
        console.log('UNKNOWN TransferResource Target Type');
      }
    }
  }

  createAppointment(spawn: StructureSpawn, request: SpawnRequest): SpawnAppointment {
    if (request.replacingCreep != null) {
      return super.createBasicAppointment(spawn, request, request.replacingCreep);
    }

    if (this.source != null) {
      return super.createBasicAppointment(spawn, request, this.source);
    }

    return super.createBasicAppointment(spawn, request, this.targets[0]);
  }

  getPrioritizingConditions(conditions: Array<any>): void {
    conditions.push((creep: Creep) => {
      if (creep.carry[this.resourceType] === 0 && creep.carryCount === creep.carryCapacity) {
        return -1;
      }

      if (creep.type === CREEP_TYPE.UPGRADER.name) {
        return -1;
      }

      return 0;
    });

    super.getBasicPrioritizingConditions(conditions, this.anchor, this.idealCreepBody);
  }

  isIdeal(object: RoomObject): boolean {
    if (object instanceof Creep) {
      return object.type === this.idealCreepBody.name;
    }

    return false;
  }

  beginScheduling(): void {
    this.calculateRequirements();

    let room = null;
    if (this.source != null) {
      room = this.source.room;
    } else {
      room = this.targets[0].room;
    }

    // if (
    //   room != null &&
    //   room.economy != null &&
    //   room.economy.resources != null &&
    //   room.economy.resources[RESOURCE_ENERGY] > 0
    // ) {
      this.labor.types[this.idealCreepBody.name] = new LaborDemandType(
        {
          carry: Math.floor((Math.min(this.resourceCapacity, this.capacityCap) / CARRY_CAPACITY) * 0.8)
        },
        1,
        3
      );
    //}

    this.scheduledTransfer = 0;
    this.scheduledWorkers = 0;
    this.scheduledCarry = 0;
  }

  hasWork(): boolean {
    if (this.possibleWorkers === 0) {
      return false;
    }

    if (this.resourcesNeeded <= 0) {
      return false;
    }

    if (this.labor.types[this.idealCreepBody.name] != null) {
      //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
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
    let room = null;
    if (this.source != null) {
      room = this.source.room;
    } else {
      room = this.targets[0].room;
    }

    if (!(object instanceof Creep)) {
      console.log('ERROR: Attempted to transfer resources with a non-creep room object. ' + object);
      return ERR_CANNOT_PERFORM_TASK;
    }

    let creep = <Creep>object;

    if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
      creep.goMoveTo(creep.spawnRequest.replacingCreep);
      return OK;
    }

    if (!this.hasWork()) {
      //console.log(creep + " resourcesNeeded: " + this.resourcesNeeded + " scheduledTransfer: " + this.scheduledTransfer + " needsResources: " + this.needsResources.length);
      return ERR_NO_WORK;
    }

    if (
      this.scheduledTransfer > 0 &&
      (creep.type === CREEP_TYPE.MINER.name || creep.type === CREEP_TYPE.UPGRADER.name)
    ) {
      return ERR_SKIP_WORKER;
    }

    let remainingNeededResources = Math.max(0, this.resourcesNeeded - this.scheduledTransfer);
    let code: number;

    if (this.resourcesNeeded <= 0) {
      if (creep.carryCount < creep.carryCapacity) {
        code = this.scheduleCollect(creep, creep.carryCapacityRemaining, this.needsResources);
      } else {
        code = this.scheduleTransfer(creep, this.needsResources);

        if (code === ERR_NO_WORK) {
          code = creep.goMoveTo(this.targets[0]);
        }
      }
    } else if (creep.action === ACTION_COLLECT && creep.carryCount < creep.carryCapacity) {
      code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);

      if (code === ERR_NO_WORK && creep.carry[this.resourceType] > 0) {
        code = this.scheduleTransfer(creep, this.needsResources);
      }
    } else if (creep.carry[this.resourceType] > 0) {
      if (
        creep.carryCount === creep.carryCapacity ||
        creep.carry[this.resourceType] >= remainingNeededResources ||
        ((creep.action === ACTION_TRANSFER || creep.action === ACTION_MOVE) && creep.carry[this.resourceType] > 0)
      ) {
        code = this.scheduleTransfer(creep, this.needsResources);
      } else {
        let inRangeTarget = <any>creep.pos.findFirstInRange(this.needsResources, 4);

        if (inRangeTarget != null) {
          code = creep.goTransfer(this.resourceType, inRangeTarget);
        } else {
          code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
        }
      }
    } else {
      code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
    }

    if (this.reserveWorkers && creep.type === this.idealCreepBody.name) {
      code = OK;
    }

    if (code === OK && creep.spawnRequest == null) {
      let compatibleTransfer = creep.carryCapacityRemaining + creep.carry[this.resourceType];

      this.scheduledTransfer += compatibleTransfer;
      this.scheduledWorkers++;
      this.scheduledCarry += Math.floor(compatibleTransfer / CARRY_CAPACITY);

      if (this.possibleWorkers > 0) {
        this.possibleWorkers--;
      }
    }

    if (this.possibleWorkers === 0 || !this.hasWork()) {
      return NO_MORE_WORK;
    }

    return code;
  }

  scheduleTransfer(creep: Creep, needsResources: any[]): number {
    let code: number = ERR_NO_WORK;
    let closestTarget = creep.pos.findClosestByRange<any>(needsResources);

    if (closestTarget != null) {
      code = creep.goTransfer(this.resourceType, closestTarget as any);
    } else if (needsResources.length > 0) {
      code = creep.goTransfer(this.resourceType, needsResources[0]);
    } else if (this.targets.length > 0) {
      code = creep.goTransfer(this.resourceType, this.targets[0]);
    }

    return code;
  }

  scheduleCollect(creep: Creep, remainingNeededResources: number, needsResources: any[]): number {
    let code: number;

    if (this.source != null) {
      code = creep.goHarvest(this.source);
    } else {
      let amount = Math.min(creep.carryCapacityRemaining, remainingNeededResources);
      code = creep.goCollect(
        this.resourceType,
        amount,
        amount,
        false,
        needsResources.length > 0 ? needsResources[0].pos : creep.pos,
        this.options,
        (<any>_).indexBy(this.targets, 'id')
      );

      if (code === ERR_NO_WORK) {
        if (creep.carry[this.resourceType] > 0) {
          code = this.scheduleTransfer(creep, needsResources);
        } else {
          code = creep.goCollect(
            this.resourceType,
            amount,
            0,
            false,
            needsResources.length > 0 ? needsResources[0].pos : creep.pos,
            this.options,
            (<any>_).indexBy(this.targets, 'id')
          );
        }
      }
    }

    return code;
  }

  endScheduling(): void {}
}
