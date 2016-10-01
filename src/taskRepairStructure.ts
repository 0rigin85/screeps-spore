/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK} from './task';
import {RoomObjectLike, ScreepsPtr} from "./screepsPtr";
import {ACTION_REPAIR, SporeCreep, CREEP_TYPE} from "./sporeCreep";
import {BodyDefinition} from "./bodyDefinition";

export class RepairStructure extends Task
{
    idealCreepBody: BodyDefinition;

    constructor(public structure: ScreepsPtr<Structure>)
    {
        super(false);
        this.id = "Repair " + structure;
        this.name = "Repair " + structure;
        this.priority = TaskPriority.MediumHigh;
        this.possibleWorkers = 2;
        this.idealCreepBody = CREEP_TYPE.CITIZEN;
        this.near = structure;
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0)
            {
                return 0;
            }

            return super.basicPrioritizeCreep(object, this.structure, this.idealCreepBody);
        }

        return 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to harvest with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code;
        let creep = <Creep>object;

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            (creep.action === ACTION_REPAIR && creep.carry[RESOURCE_ENERGY] > 0))
        {
            code = creep.goRepair(this.structure);
        }
        else
        {
            let amount = creep.carryCapacityRemaining;
            if (!this.structure.isShrouded)
            {
                Math.min(creep.carryCapacityRemaining, this.structure.instance.hitsMissing / 100);
            }

            code = creep.goCollect(
                RESOURCE_ENERGY,
                amount,
                amount,
                false,
                this.structure.pos,
                [['near_dropped'], ['link','container','storage'], ['dropped']],
                {});
        }

        if (code === OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}