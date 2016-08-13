/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_CANNOT_PERFORM_TASK, ERR_NO_WORK} from './task';

export class HarvestEnergy extends Task
{
    constructor(parentId: string, public source: Source, public target: Creep | Spawn | Structure)
    {
        super(false);

        this.id = ((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Harvest:" + target.id + "[" + source.id + "]";
        this.name = target + " Harvesting [" + source + "]";
        this.possibleWorkers = 1;
    }

    static deserialize(input: string): HarvestEnergy
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let sourceId = input.substring(startingBraceIndex, input.length - 1);

        let colonIndex = input.lastIndexOf(":");
        let targetId = input.substring(colonIndex, startingBraceIndex);

        let source = Game.getObjectById<Source>(sourceId);
        let target = Game.getObjectById<Creep | Spawn | Structure>(targetId);

        if (source == null || target == null)
        {
            return null;
        }

        return new HarvestEnergy(parentId, source, target);
    }

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers === 0)
        {
            return ERR_NO_WORK;
        }

        if (creep.getActiveBodyparts(WORK) == 0 ||
            creep.getActiveBodyparts(CARRY) == 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code;

        if (creep.carryCapacityRemaining > 0)
        {
            code = this.goHarvest(creep, this.source);
        }
        else
        {
            code = this.goTransfer(creep, RESOURCE_ENERGY, this.target);
        }

        if (code === OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}