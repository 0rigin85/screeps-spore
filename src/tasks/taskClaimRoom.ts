import { CREEP_TYPE } from "../sporeCreep";
import { TaskPriority } from "./TaskPriority";
import { Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK } from "./task";
import { LaborDemandType } from '../LaborDemandType';

export class ClaimRoom extends Task {
  idealCreepBody: BodyDefinition;
  scheduledClaim: number;

  constructor(public controller: Ptr<StructureController>) {
    super(false);

    this.id = 'Claim ' + controller;
    this.name = 'Claim ' + controller.toHtml();
    this.possibleWorkers = -1;
    this.idealCreepBody = CREEP_TYPE.CLAIMER;
    this.near = controller;
    this.priority = TaskPriority.MediumHigh;

    if (!controller.isShrouded && controller.instance.owner != null) {
      this.priority = TaskPriority.None;
    }

    this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ claim: 1 }, 1, 1);
  }

  createAppointment(spawn: StructureSpawn, request: SpawnRequest): SpawnAppointment {
    if (request.replacingCreep != null) {
      return super.createBasicAppointment(spawn, request, request.replacingCreep);
    }

    return super.createBasicAppointment(spawn, request, this.controller);
  }

  getPrioritizingConditions(conditions: Array<any>): void {
    super.getBasicPrioritizingConditions(conditions, this.controller, this.idealCreepBody);
  }

  isIdeal(object: RoomObject): boolean {
    if (object instanceof Creep) {
      return object.type === this.idealCreepBody.name;
    }

    return false;
  }

  beginScheduling(): void {
    this.scheduledClaim = 0;
  }

  schedule(object: RoomObject): number {
    if (
      this.possibleWorkers === 0 ||
      !this.controller.isValid ||
      this.scheduledClaim >= this.labor.types[this.idealCreepBody.name].parts[CLAIM]
    ) {
      return ERR_NO_WORK;
    }

    if (!(object instanceof Creep)) {
      console.log('ERROR: Attempted to reserve a controller with a non-creep room object. ' + object);
      return ERR_CANNOT_PERFORM_TASK;
    }

    let creep = <Creep>object;
    let code;

    if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
      creep.goMoveTo(creep.spawnRequest.replacingCreep);
      return OK;
    }

    code = creep.goClaim(this.controller);

    if (code === OK) {
      this.scheduledClaim += creep.getActiveBodyparts(CLAIM);

      if (this.possibleWorkers > 0) {
        this.possibleWorkers--;
      }
    }

    if (this.possibleWorkers === 0 || this.scheduledClaim >= this.labor.types[this.idealCreepBody.name].parts[CLAIM]) {
      return NO_MORE_WORK;
    }

    return code;
  }
}
