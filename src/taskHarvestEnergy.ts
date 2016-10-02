/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_NO_WORK, TaskPriority, ERR_CANNOT_PERFORM_TASK, LaborDemandType, NO_MORE_WORK} from './task';
import {CREEP_TYPE, ACTION_COLLECT} from "./sporeCreep";
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";
import {SpawnAppointment, SpawnRequest} from "./spawnRequest";
import {BodyDefinition} from "./bodyDefinition";
import {SporeSource} from "./sporeSource";

export class HarvestEnergy extends Task
{
    scheduledWork: number = 0;
    scheduledWorkers: Creep[] = [];
    idealCreepBody: BodyDefinition;

    constructor(public source: ScreepsPtr<Source>)
    {
        super(false);

        this.id = 'Harvesting ' + this.source;
        this.name = 'Harvesting ' + this.source.toHtml();
        this.possibleWorkers = -1;
        this.priority = TaskPriority.Mandatory;
        this.idealCreepBody = CREEP_TYPE.MINER;
        this.roomName = this.source.pos.roomName;
        this.near = source;

        let slots = SporeSource.getSlots(this.source);

        if (slots === -1)
        {
            slots = 8;
        }

        this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ work: 5 }, 1, slots);
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        return super.createBasicAppointment(spawn, request, this.source);
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0)
            {
                return 0;
            }

            return super.basicPrioritizeCreep(object, this.source, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.scheduledWork= 0;
        this.scheduledWorkers.length = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers === 0 || this.scheduledWork >= 1 || !this.source.isValid ||
            (!this.source.isShrouded && this.scheduledWorkers.length >= this.source.instance.slots))
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to harvest with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let creep = <Creep>object;

        if (creep.task != this && creep.task instanceof HarvestEnergy && creep.action === ACTION_COLLECT)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code;

        if (creep.spawnRequest != null)
        {
            if (creep.spawnRequest.replacingCreep != null)
            {
                code = creep.goMoveTo(creep.spawnRequest.replacingCreep);
            }
            else
            {
                code = creep.goMoveTo(this.source);
            }
        }
        else if (!this.source.isShrouded && this.source.instance.energy === 0)
        {
            code = creep.goMoveTo(this.source);
        }
        else
        {
            code = creep.goHarvest(this.source);
        }

        if (creep.carry[RESOURCE_ENERGY] > 0)
        {
            let areaResults = creep.room.lookForAtArea(LOOK_STRUCTURES, creep.pos.y - 1, creep.pos.x - 1, creep.pos.y + 1, creep.pos.x + 1, true);
            let areaResultsByType = _.groupBy(areaResults, function(l: LookAtResultWithPos){ return l.structure.structureType; });

            if (areaResultsByType[STRUCTURE_STORAGE] != null && areaResultsByType[STRUCTURE_STORAGE].length > 0)
            {
                let storage = <any>areaResultsByType[STRUCTURE_STORAGE][0].structure;
                if (storage.storeCapacityRemaining > 0)
                {
                    code = creep.goTransfer(RESOURCE_ENERGY, ScreepsPtr.from<StructureStorage>(storage));
                }
            }

            if (areaResultsByType[STRUCTURE_CONTROLLER] != null && areaResultsByType[STRUCTURE_CONTROLLER].length > 0)
            {
                let controller = <any>areaResultsByType[STRUCTURE_CONTROLLER][0].structure;
                code = creep.goUpgrade(ScreepsPtr.from<StructureController>(controller));
            }

            if (areaResultsByType[STRUCTURE_CONTAINER] != null && areaResultsByType[STRUCTURE_CONTAINER].length > 0)
            {
                for (let result of areaResultsByType[STRUCTURE_CONTAINER])
                {
                    let container = <any>result.structure;
                    if (container.storeCapacityRemaining > 0)
                    {
                        code = creep.goTransfer(RESOURCE_ENERGY, ScreepsPtr.from<StructureContainer>(container));
                        break;
                    }
                }
            }

            if (areaResultsByType[STRUCTURE_LINK] != null && areaResultsByType[STRUCTURE_LINK].length > 0)
            {
                let link = <any>areaResultsByType[STRUCTURE_LINK][0].structure;
                if (link.energyCapacityRemaining > 0)
                {
                    code = creep.goTransfer(RESOURCE_ENERGY, ScreepsPtr.from<StructureLink>(link));
                }
            }

            if (areaResultsByType[STRUCTURE_EXTENSION] != null && areaResultsByType[STRUCTURE_EXTENSION].length > 0)
            {
                let extension = <any>areaResultsByType[STRUCTURE_EXTENSION][0].structure;
                if (extension.energyCapacityRemaining > 0)
                {
                    code = creep.goTransfer(RESOURCE_ENERGY, ScreepsPtr.from<StructureExtension>(extension));
                }
            }

            if (areaResultsByType[STRUCTURE_SPAWN] != null && areaResultsByType[STRUCTURE_SPAWN].length > 0)
            {
                let spawn = <any>areaResultsByType[STRUCTURE_SPAWN][0].structure;
                if (spawn.energyCapacityRemaining > 0)
                {
                    code = creep.goTransfer(RESOURCE_ENERGY, ScreepsPtr.from<StructureSpawn>(spawn));
                }
            }

            if (areaResultsByType[STRUCTURE_TOWER] != null && areaResultsByType[STRUCTURE_TOWER].length > 0)
            {
                for (let result of areaResultsByType[STRUCTURE_TOWER])
                {
                    let tower = <any>result.structure;
                    if (tower.energyCapacityRemaining > 0)
                    {
                        code = creep.goTransfer(RESOURCE_ENERGY, ScreepsPtr.from<StructureTower>(tower));
                        break;
                    }
                }
            }
        }

        if (code === OK && creep.spawnRequest == null)
        {
            this.scheduledWork += creep.getActiveBodyparts(WORK) / 5;
            this.scheduledWorkers.push(creep);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (this.possibleWorkers === 0 || this.scheduledWork >= 1 || !this.source.isValid ||
            (!this.source.isShrouded && this.scheduledWorkers.length >= this.source.instance.slots))
        {
            return NO_MORE_WORK;
        }

        return code;
    }

    endScheduling(): void
    {

    }
}