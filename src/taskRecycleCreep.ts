
import {Task, TaskPriority, ERR_NO_WORK} from './task';
import {RoomObjectLike, ScreepsPtr} from "./screepsPtr";

export class RecycleCreep extends Task
{
    constructor(public spawn: ScreepsPtr<Spawn>)
    {
        super(false);
        this.id = "Recycle " + spawn;
        this.priority = TaskPriority.MediumHigh;
        this.name = "Recycling at " + spawn;
        this.possibleWorkers = -1;
        this.near = spawn;
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            let creep = <Creep>object;
            return (50 - creep.body.length) / 50;
        }

        return 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers === 0 || !this.spawn.isValid || !(object instanceof Creep))
        {
            return ERR_NO_WORK;
        }

        let creep = <Creep>object;
        let code = creep.goRecycle(this.spawn);

        if (code == OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}