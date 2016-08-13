
import {Task, ERR_CANNOT_PERFORM_TASK, TaskPriority, ERR_NO_WORK} from './task';

export class RecycleCreep extends Task
{
    constructor(parentId: string, public spawn: Spawn)
    {
        super(false);
        this.id = ((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Recycle[" + spawn.name + "]";
        this.priority = TaskPriority.MediumHigh;
        this.name = "Recycling at Spawn[" + spawn.name + "]";
        this.possibleWorkers = -1;
    }

    static deserialize(input: string): RecycleCreep
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let spawnName = input.substring(startingBraceIndex, input.length - 1);

        let spawn = Game.spawns[spawnName];

        if (spawn == null)
        {
            return null;
        }

        return new RecycleCreep(parentId, spawn);
    }

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NO_WORK;
        }

        let code = this.goRecycle(creep, this.spawn);

        if (code == OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}