import { Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK } from '../task';
import { Ptr } from '../Ptr';
import { CREEP_TYPE } from '../sporeCreep';
import { BodyDefinition } from '../BodyDefinition';

export class DismantleStructure extends Task {
  idealCreepBody: BodyDefinition;
  scheduledWork: number;
  scheduledWorkers: number;

  constructor(public structure: Ptr<Structure>) {
    super(false);

    this.id = 'Dismantle ' + this.structure;
    this.name = 'Dismantle ' + this.structure;
    this.idealCreepBody = CREEP_TYPE.CITIZEN;
    this.near = structure;
  }

  getPrioritizingConditions(conditions: Array<any>): void {
    super.getBasicPrioritizingConditions(conditions, this.structure, this.idealCreepBody);
  }

  isIdeal(object: RoomObject): boolean {
    if (object instanceof Creep) {
      return object.type === this.idealCreepBody.name;
    }

    return false;
  }

  beginScheduling(): void {
    this.scheduledWork = 0;
    this.scheduledWorkers = 0;
  }

  schedule(object: RoomObject): number {
    if (this.possibleWorkers === 0 || !this.structure.isValid || !(object instanceof Creep)) {
      return ERR_NO_WORK;
    }

    let creep = <Creep>object;

    if (creep.type === CREEP_TYPE.MINER.name && this.scheduledWorkers > 0) {
      return ERR_CANNOT_PERFORM_TASK;
    }

    if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
      creep.goMoveTo(creep.spawnRequest.replacingCreep);
      return OK;
    }

    let code = creep.goDismantle(this.structure);

    if (code === OK) {
      this.scheduledWorkers++;
      this.scheduledWork += creep.getActiveBodyparts(WORK);

      if (this.possibleWorkers > 0) {
        this.possibleWorkers--;
      }
    }

    return code;
  }
}
