/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_CANNOT_PERFORM_WORK} from './task';

export class DismantleStructure extends Task
{
    constructor(parentId: string, public structure: Structure)
    {
        super(((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Dismantle[" + structure.id + "]", false);
    }

    static deserialize(input: string): DismantleStructure
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

        return new DismantleStructure(parentId, structure);
    }

    schedule(creep: Creep): number
    {
        console.log("dismantling structure");

        if (creep.getActiveBodyparts(WORK) == 0)
        {
            return ERR_CANNOT_PERFORM_WORK;
        }

        //todo creeps without CARRY should not be favored
        //todo creeps with full CARRY should not be favored

        if (creep.dismantle(this.structure) == ERR_NOT_IN_RANGE)
        {
            creep.moveTo(this.structure);
        }

        return OK;
    }
}