import { Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK } from '../task';
import { LaborDemandType } from '../LaborDemandType';
import { TaskPriority } from '../TaskPriority';
import { CREEP_TYPE } from '../sporeCreep';
import { SpawnRequest } from '../SpawnRequest';
import { SpawnAppointment } from '../SpawnAppointment';
import { BodyDefinition } from '../BodyDefinition';

export class Wire extends Task {
  idealCreepBody: BodyDefinition;
  scheduledWorkers: number;
  anchor: RoomPosition;

  constructor(public pos: RoomPosition) {
    super(false);

    this.id = `Wiring ${pos}`;
    this.name = `Wiring {room ${pos.roomName} pos ${pos.x},${pos.y}}`;
    this.possibleWorkers = -1;
    this.idealCreepBody = CREEP_TYPE.WIRE;
    this.priority = TaskPriority.High + 350;
    this.anchor = pos;
    this.roomName = pos.roomName;

    this.labor.types[this.idealCreepBody.name] = new LaborDemandType({}, 1, 1);
  }

  createAppointment(spawn: StructureSpawn, request: SpawnRequest): SpawnAppointment {
    if (request.replacingCreep != null) {
      return super.createBasicAppointment(spawn, request, request.replacingCreep);
    }

    return super.createBasicAppointment(spawn, request, this.anchor);
  }

  getPrioritizingConditions(conditions: Array<any>): void {
    super.getBasicPrioritizingConditions(conditions, this.anchor, this.idealCreepBody);
  }

  isIdeal(object: RoomObject): boolean {
    if (object instanceof Creep) {
      return object.type === this.idealCreepBody.name;
    }

    return false;
  }

  beginScheduling(): void {
    this.scheduledWorkers = 0;
  }

  hasWork(): boolean {
    if (this.possibleWorkers === 0) {
      return false;
    }

    if (this.labor.types[this.idealCreepBody.name] != null) {
      //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
      if (this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max) {
        return false;
      }
    }

    return true;
  }

  schedule(object: RoomObject): number {
    if (!this.hasWork()) {
      return ERR_NO_WORK;
    }

    if (!(object instanceof Creep)) {
      console.log('ERROR: Attempted to defend a room with a non-creep room object. ' + object);
      return ERR_CANNOT_PERFORM_TASK;
    }

    let creep = <Creep>object;
    let code;

    if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
      creep.goMoveTo(creep.spawnRequest.replacingCreep);
      return OK;
    }

    if (!creep.pos.isEqualTo(this.pos)) {
      code = creep.moveTo(this.pos);

      if (code === ERR_TIRED) {
        code = OK;
      }
    } else {
      code = OK;
      let area = <LookAtResultWithPos[]>creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep, 1, true);

      for (let spot of area) {
        if (spot.structure.structureType === STRUCTURE_LINK) {
          creep.withdraw(spot.structure, RESOURCE_ENERGY);
        }
        if (spot.structure.structureType === STRUCTURE_TERMINAL) {
          creep.withdraw(spot.structure, RESOURCE_ENERGY);
        } else if (spot.structure.structureType === STRUCTURE_STORAGE) {
          creep.transfer(spot.structure, RESOURCE_ENERGY);
        }
      }
    }

    if (code === OK) {
      this.scheduledWorkers++;

      if (this.possibleWorkers > 0) {
        this.possibleWorkers--;
      }
    }

    if (!this.hasWork()) {
      return NO_MORE_WORK;
    }

    return code;
  }
}
