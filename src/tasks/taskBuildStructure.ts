import { Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK, ERR_SKIP_WORKER } from '../task';
import { LaborDemandType } from '../LaborDemandType';
import { TaskPriority } from '../TaskPriority';
import { ACTION_BUILD, CREEP_TYPE, ACTION_MOVE } from '../sporeCreep';
import { CollectOptions } from "../CollectOptions";
import { Ptr } from '../Ptr';
import { SpawnRequest } from '../SpawnRequest';
import { SpawnAppointment } from '../SpawnAppointment';
import { BodyDefinition } from '../BodyDefinition';
import { ClaimReceipt } from "../ClaimReceipt";

let STRUCTURE_BUILD_PRIORITY = {
  spawn: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.Mandatory;
  },
  tower: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.Mandatory;
  },
  extension: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.High;
  },
  container: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.High;
  },
  link: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.High;
  },
  extractor: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.High;
  },
  lab: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumHigh;
  },
  storage: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.High;
  },
  terminal: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumHigh;
  },
  rampart: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumLow;
  },
  road: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumHigh;
  },
  constructedWall: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumLow;
  },
  observer: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumLow;
  },
  powerSpawn: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumLow;
  },
  nuker: function(site: Ptr<ConstructionSite>) {
    return TaskPriority.MediumLow;
  }
};

export class BuildStructure extends Task {
  idealCreepBody: BodyDefinition;
  scheduledWork: number;
  desiredWork: number;

  constructor(public site: Ptr<ConstructionSite>) {
    super(false);

    this.id = 'Build [structure (' + site.lookTypeModifier + ') {room ' + this.site.pos.roomName + '}]';
    this.name = 'Build ' + site.toHtml();
    this.possibleWorkers = -1;
    this.priority = STRUCTURE_BUILD_PRIORITY[site.lookTypeModifier](site);
    this.idealCreepBody = CREEP_TYPE.CITIZEN;
    this.scheduledWork = 0;
    this.desiredWork = 5;
    this.near = site;
    this.roomName = this.site.pos.roomName;

    this.labor.types[this.idealCreepBody.name] = new LaborDemandType({}, 1, 2);
  }

  createAppointment(spawn: StructureSpawn, request: SpawnRequest): SpawnAppointment {
    if (request.replacingCreep != null) {
      return super.createBasicAppointment(spawn, request, request.replacingCreep);
    }

    return super.createBasicAppointment(spawn, request, this.site);
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

    super.getBasicPrioritizingConditions(conditions, this.site, this.idealCreepBody);
  }

  isIdeal(object: RoomObject): boolean {
    if (object instanceof Creep) {
      return object.type === this.idealCreepBody.name;
    }

    return false;
  }

  beginScheduling(): void {
    this.scheduledWork = 0;
  }

  schedule(object: RoomObject): number {
    if (this.possibleWorkers === 0 || !this.site.isValid || this.scheduledWork >= this.desiredWork) {
      return ERR_NO_WORK;
    }

    if (!(object instanceof Creep)) {
      console.log('ERROR: Attempted to build a structure with a non-creep room object. ' + object);
      return ERR_CANNOT_PERFORM_TASK;
    }

    let creep = <Creep>object;
    let code;

    if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
      creep.goMoveTo(creep.spawnRequest.replacingCreep);
      return OK;
    }

    if (
      creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
      ((creep.action === ACTION_BUILD || creep.action === ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0)
    ) {
      code = creep.goBuild(this.site);
    } else {
      let amount = creep.carryCapacityRemaining;
      if (!this.site.isShrouded) {
        Math.min(creep.carryCapacityRemaining, this.site.instance.progressRemaining);
      }

      code = creep.goCollect(
        RESOURCE_ENERGY,
        amount,
        amount,
        false,
        this.site.pos,
        new CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]),
        {}
      );
    }

    if (code === OK) {
      this.scheduledWork += creep.getActiveBodyparts(WORK);

      if (this.possibleWorkers > 0) {
        this.possibleWorkers--;
      }
    }

    if (this.possibleWorkers === 0 || this.scheduledWork >= this.desiredWork) {
      return NO_MORE_WORK;
    }

    return code;
  }
}
