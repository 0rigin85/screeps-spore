import { LaborDemand } from '../LaborDemand';
import { LaborDemandType } from '../LaborDemandType';
import { BodyDefinition } from '../BodyDefinition';
import { SpawnRequest } from '../SpawnRequest';
import { SpawnAppointment } from '../SpawnAppointment';

export var NO_MORE_WORK: number = 123;
export var ERR_NO_WORK: number = -400;
export var ERR_CANNOT_PERFORM_TASK: number = -401;
export var ERR_SKIP_WORKER: number = -402;

export class Task {
  id: string = "UNKNOWN";
  name: string;
  possibleWorkers: number = -1; //defaults to infinite
  priority: number = 50;
  roomName: string;
  labor: LaborDemand = new LaborDemand();
  near: RoomObject | Ptr<RoomObject> = null;

  constructor(public isComplex: boolean) {}

  getSteps(): Task[] {
    return [];
  }

  createAppointment(
    spawn: StructureSpawn,
    request: SpawnRequest
  ): SpawnAppointment {
    return null;
  }

  protected createBasicAppointment(
    spawn: StructureSpawn,
    request: SpawnRequest,
    near: RoomObject | RoomPosition | Ptr<RoomObject>
  ): SpawnAppointment {
    let spawnPriority: number = -1;
    let ticksTillRequired: number = 0;
    let spawnDistanceFromNear: number = 0;

    let target = <RoomPosition>near;
    if (!(near instanceof RoomPosition)) {
      target = near.pos;
    }

    if (target != null) {
      if (target.x != -1 && target.y != -1) {
        spawnDistanceFromNear = new RoomPosition(
          spawn.pos.x,
          spawn.pos.y - 1,
          spawn.pos.roomName
        ).findDistanceByPathTo(target, { ignoreCreeps: true });
      } else {
        spawnDistanceFromNear =
          Game.map.getRoomLinearDistance(spawn.pos.roomName, target.roomName) *
          50;
      }
    }

    if (spawnDistanceFromNear < 250) {
      spawnPriority = 1 - spawnDistanceFromNear / 250;
    }

    let creep = request.replacingCreep;

    if (creep != null) {
      let body = spawn.getBody(request.creepBody);
      let moveTotal = 0;

      for (let part of body) {
        if (part === MOVE) {
          moveTotal++;
        }
      }

      let moveRate = Math.max(1, (body.length - moveTotal) / moveTotal);

      //console.log(creep + ' ' + creep.ticksToLive + ' - ((' + spawnDistanceFromNear + ' * ' + moveRate + ') + (' + spawn.getBody(request.creepBody).length + ' * ' + CREEP_SPAWN_TIME + '))');
      ticksTillRequired = Math.ceil(
        Math.max(
          0,
          creep.ticksToLive -
            (spawnDistanceFromNear * moveRate + body.length * CREEP_SPAWN_TIME)
        )
      );
    }

    return new SpawnAppointment(
      request.id,
      request.task,
      spawnPriority,
      spawn,
      ticksTillRequired,
      request.replacingCreep,
      request.creepBody
    );
  }

  shouldPlanToReplace(object: RoomObject): boolean {
    return true;
  }

  protected getBasicPrioritizingConditions(
    conditions: Array<any>,
    near: RoomObject | RoomPosition | Ptr<RoomObject>,
    idealBody: BodyDefinition
  ): void {
    let target = <RoomPosition>near;
    if (!(near instanceof RoomPosition) && near != null) {
      target = near.pos;
    }

    conditions.push((creep: Creep) => {
      // 1 - 40
      let efficiency = creep.getEfficiencyAs(idealBody);

      if (efficiency <= 0) {
        return -1;
      }

      return creep.type === idealBody.name
        ? 0.4 + efficiency * 0.2
        : efficiency * 0.2;
    });

    conditions.push((creep: Creep) => {
      let objectPriority = 0;

      // 41 - 60
      if (target != null && creep.pos.roomName == target.roomName) {
        objectPriority += 0.2;
      } else if (creep.task == null) {
        objectPriority = 0.1;
      }

      return objectPriority;
    });

    if (target != null) {
      conditions.push((creep: Creep) => {
        return 300 - creep.pos.findDistanceByPathTo(target);
      });
    }
  }

  getPrioritizingConditions(conditions: Array<any>): void {}

  isIdeal(object: RoomObject): boolean {
    return false;
  }

  beginScheduling(): void {}

  schedule(object: RoomObject): number {
    return ERR_NO_WORK;
  }

  endScheduling(): void {}
}
