/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_CANNOT_PERFORM_WORK, TaskPriority, ERR_NOWORK} from './task';
import {EnergyManager, ENERGYLOCATION} from "./energyManager";

export class RepairStructure extends Task
{
    constructor(parentId: string, public structure: Structure)
    {
        super(((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Repair[" + structure.id + "]", false);
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
            return ERR_NOWORK;
        }

        if(creep.memory.repairing && creep.carry.energy == 0)
        {
            creep.memory.repairing = false;
        }

        if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.repairing = true;
        }

        let code = ERR_NOWORK;

        if(creep.memory.repairing)
        {
            code = this.goRepair(creep, this.structure);
        }
        else
        {
            code = this.goCollect(creep, [ENERGYLOCATION.DROPPED, ENERGYLOCATION.STORAGE, ENERGYLOCATION.SOURCE]);
        }

        if (code == OK)
        {
            this.possibleWorkers--;
            return OK;
        }

        return ERR_CANNOT_PERFORM_WORK;
    }
}