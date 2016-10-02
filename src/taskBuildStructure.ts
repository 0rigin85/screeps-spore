import {Task, ERR_NO_WORK, TaskPriority, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK} from './task';
import Dictionary = _.Dictionary;
import {SporeCreep, ACTION_BUILD, CREEP_TYPE} from "./sporeCreep";
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import {BodyDefinition} from "./bodyDefinition";

let STRUCTURE_BUILD_PRIORITY =
{
    "spawn": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.Mandatory },
    "tower": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.Mandatory },
    "extension": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.High },
    "container": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.High },
    "link": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.High },
    "extractor": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.High },
    "lab": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.MediumHigh },
    "storage": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.High },
    "terminal": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.MediumHigh },
    "rampart": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.MediumLow },
    "road": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.MediumHigh },
    "constructedWall": function(site: ScreepsPtr<ConstructionSite>) { return TaskPriority.MediumLow },
};

export class BuildStructure extends Task
{
    idealCreepBody: BodyDefinition;
    scheduledWork: number;
    desiredWork: number;

    constructor(public site: ScreepsPtr<ConstructionSite>)
    {
        super(false);

        this.id = 'Build [structure (' + site.lookTypeModifier + ') {room ' + this.site.pos.roomName + '}]';
        this.name = 'Build ' + site.toHtml();
        this.possibleWorkers = -1;
        this.priority = STRUCTURE_BUILD_PRIORITY[site.lookTypeModifier](site);
        this.idealCreepBody = CREEP_TYPE.CITIZEN;
        this.scheduledWork = 0;
        this.desiredWork = 5;
        this.near = site;
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        if (request.replacingCreep != null)
        {
            return super.createBasicAppointment(spawn, request, request.replacingCreep);
        }

        return super.createBasicAppointment(spawn, request, this.site);
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0)
            {
                return 0;
            }

            return super.basicPrioritizeCreep(object, this.site, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.scheduledWork = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers === 0 || !this.site.isValid || this.scheduledWork >= this.desiredWork)
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to build a structure with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let creep = <Creep>object;
        let code;

        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
        {
            creep.goMoveTo(creep.spawnRequest.replacingCreep);
            return OK;
        }

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            (creep.action === ACTION_BUILD && creep.carry[RESOURCE_ENERGY] > 0))
        {
            code = creep.goBuild(this.site);
        }
        else
        {
            let amount = creep.carryCapacityRemaining;
            if (!this.site.isShrouded)
            {
                Math.min(creep.carryCapacityRemaining, this.site.instance.progressRemaining);
            }

            code = creep.goCollect(
                RESOURCE_ENERGY,
                amount,
                amount,
                false,
                this.site.pos,
                [['near_dropped'], ['link','container','storage'], ['dropped']],
                {});
        }

        if (code === OK)
        {
            this.scheduledWork += creep.getActiveBodyparts(WORK);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (this.possibleWorkers === 0 || this.scheduledWork >= this.desiredWork)
        {
            return NO_MORE_WORK;
        }

        return code;
    }
}