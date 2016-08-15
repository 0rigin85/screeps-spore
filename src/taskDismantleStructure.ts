import {Task, ERR_CANNOT_PERFORM_TASK, ERR_NO_WORK} from './task';

export class DismantleStructure extends Task
{
    constructor(parentId: string, public structure: Structure)
    {
        super(false);
        this.id = ((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Dismantle[" + structure.id + "]";
        this.name = "Dismantle [" + structure + "]";
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
        if (Game.getObjectById(this.structure.id) == null)
        {
            return ERR_NO_WORK;
        }

        if (this.possibleWorkers === 0)
        {
            return ERR_NO_WORK;
        }

        if (creep.getActiveBodyparts(WORK) == 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code = this.goDismantle(creep, this.structure);

        if (code === OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}