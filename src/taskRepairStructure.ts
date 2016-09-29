/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority, ERR_NO_WORK} from './task';
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

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NO_WORK;
        }

        let code;

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
                false,
                this.structure.pos,
                [['near_dropped'], ['link','container','storage'], ['dropped']]);
        }

        if (code === OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}