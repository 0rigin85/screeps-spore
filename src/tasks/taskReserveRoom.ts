import { Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK, ERR_SKIP_WORKER } from '../task';
import { LaborDemandType } from '../LaborDemandType';
import { TaskPriority } from '../TaskPriority';
import { Ptr } from '../Ptr';
import { SpawnRequest } from '../SpawnRequest';
import { SpawnAppointment } from '../SpawnAppointment';
import { BodyDefinition } from '../BodyDefinition';
import { CREEP_TYPE } from '../sporeCreep';

export class ReserveRoom extends Task {
  idealCreepBody: BodyDefinition;
  scheduledWorkers: number;
  scheduledClaim: number;

  constructor(public controller: Ptr<StructureController>) {
    super(false);

    this.id = 'Reserve ' + controller;
    this.name = 'Reserve ' + controller.toHtml();
    this.possibleWorkers = -1;
    this.idealCreepBody = CREEP_TYPE.RESERVER;
    this.near = controller;
    this.roomName = controller.pos.roomName;

    if (controller.isShrouded) {
      this.priority = TaskPriority.Mandatory - 100;
    } else if (controller.instance.reservation != null) {
      if (controller.instance.reservation.ticksToEnd < 1000) {
        this.priority = TaskPriority.Mandatory + 400;
      } else {
        this.priority = TaskPriority.High;
      }
    } else {
      this.priority = TaskPriority.High;
    }

    if (
      controller.isShrouded ||
      controller.instance.reservation == null ||
      controller.instance.reservation.ticksToEnd < 1500
    ) {
      this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ claim: 2 }, 1, 2);
    }
  }

  createAppointment(spawn: StructureSpawn, request: SpawnRequest): SpawnAppointment {
    if (request.replacingCreep != null) {
      return super.createBasicAppointment(spawn, request, request.replacingCreep);
    }

    return super.createBasicAppointment(spawn, request, this.controller);
  }

  shouldPlanToReplace(object: RoomObject): boolean {
    if (object instanceof Creep) {
      if (
        this.controller.isShrouded ||
        this.controller.instance.reservation == null ||
        this.controller.instance.reservation.username != 'PCake0rigin' ||
        this.controller.instance.reservation.ticksToEnd - object.ticksToLive < 1500
      ) {
        return true;
      }
    }

    return false;
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
    this.scheduledWorkers = 0;
    this.scheduledClaim = 0;
  }

  schedule(object: RoomObject): number {
    let claimLabor = 0;

    if (this.labor.types[this.idealCreepBody.name] != null) {
      claimLabor = this.labor.types[this.idealCreepBody.name].parts[CLAIM];
    }

    if (
      this.possibleWorkers === 0 ||
      !this.controller.isValid ||
      (claimLabor > 0 && this.scheduledClaim >= claimLabor)
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

    if (creep.spawnRequest == null && creep.task != this && creep.task instanceof ReserveRoom) {
      return ERR_SKIP_WORKER;
    }

    code = creep.goReserve(this.controller);

    if (code === OK) {
      this.scheduledWorkers++;
      this.scheduledClaim += creep.getActiveBodyparts(CLAIM);

      if (this.possibleWorkers > 0) {
        this.possibleWorkers--;
      }
    }

    if (
      this.possibleWorkers === 0 ||
      this.scheduledClaim >= claimLabor ||
      (!this.controller.isShrouded && this.scheduledWorkers >= this.controller.instance.slots)
    ) {
      return NO_MORE_WORK;
    }

    return code;
  }
}
