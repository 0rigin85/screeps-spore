/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_CANNOT_PERFORM_TASK, TaskPriority, ERR_NO_WORK, ACTION_REPAIR} from './task';

export class RepairStructure extends Task
{
    constructor(parentId: string, public structure: Structure)
    {
        super(false);
        this.id = ((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Repair[" + structure.id + "]";
        this.name = "Repair " + structure;
        this.priority = TaskPriority.MediumHigh;
        this.possibleWorkers = 2;
    }

    static deserialize(input: string): RepairStructure
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let structureId = input.substring(startingBraceIndex, input.length - 1);

        let structure = Game.getObjectById<Structure>(structureId);

        if (structure == null)
        {
            return null;
        }

        return new RepairStructure(parentId, structure);
    }

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NO_WORK;
        }

        if (creep.getActiveBodyparts(WORK) == 0 ||
            creep.getActiveBodyparts(CARRY) == 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code;

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            (creep.action === ACTION_REPAIR && creep.carry[RESOURCE_ENERGY] > 0))
        {
            code = this.goRepair(creep, this.structure);
        }
        else
        {
            code = this.goCollect(
                creep,
                RESOURCE_ENERGY,
                Math.min(creep.carryCapacityRemaining, this.structure.hitsMissing / 100),
                false,
                this.structure.pos,
                [['dropped'], ['link','container'], ['source'], ['storage']]);
        }

        if (code === OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}