import { Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK } from './task';
import { TaskPriority } from './TaskPriority';
import { Ptr } from '../Ptr';
import { ACTION_REPAIR, CREEP_TYPE, ACTION_MOVE } from '../sporeCreep';
import { CollectOptions } from '../CollectOptions';
import { BodyDefinition } from '../BodyDefinition';

export class RepairStructure extends Task {
  idealCreepBody: BodyDefinition;

  constructor(public structure: Ptr<Structure>) {
    super(false);
    this.id = `Repair [${structure}]`;
    this.name = `Repair ${structure.toHtml()}`;
    this.priority = TaskPriority.MediumHigh;
    this.possibleWorkers = 2;
    this.idealCreepBody = CREEP_TYPE.CITIZEN;
    this.near = structure;
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

    super.getBasicPrioritizingConditions(conditions, this.structure, this.idealCreepBody);
  }

  isIdeal(object: RoomObject): boolean {
    if (object instanceof Creep) {
      return object.type === this.idealCreepBody.name;
    }

    return false;
  }

  schedule(object: RoomObject): number {
    if (this.possibleWorkers == 0) {
      return ERR_NO_WORK;
    }

    if (!(object instanceof Creep)) {
      console.log('ERROR: Attempted to harvest with a non-creep room object. ' + object);
      return ERR_CANNOT_PERFORM_TASK;
    }

    let code;
    let creep = <Creep>object;

    if (
      creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
      ((creep.action === ACTION_REPAIR || creep.action === ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0)
    ) {
      code = creep.goRepair(this.structure);
    } else {
      let amount = creep.carryCapacityRemaining;
      if (!this.structure.isShrouded) {
        Math.min(creep.carryCapacityRemaining, this.structure.instance.hitsMissing / 100);
      }

      code = creep.goCollect(
        RESOURCE_ENERGY,
        amount,
        amount,
        false,
        this.structure.pos,
        new CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]),
        {}
      );
    }

    if (code === OK && this.possibleWorkers > 0) {
      this.possibleWorkers--;
    }

    return code;
  }
}
