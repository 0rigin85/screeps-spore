import {Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK} from './task';
import {RoomObjectLike, ScreepsPtr} from "./screepsPtr";
import {CREEP_TYPE} from "./sporeCreep";
import {BodyDefinition} from "./bodyDefinition";

export class DismantleStructure extends Task
{
    idealCreepBody: BodyDefinition;
    scheduledWork: number;
    scheduledWorkers: number;

    constructor(public structure: ScreepsPtr<Structure>)
    {
        super(false);

        this.id = 'Dismantle ' + this.structure;
        this.name = 'Dismantle ' + this.structure;
        this.idealCreepBody = CREEP_TYPE.CITIZEN;
        this.near = structure;
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            return super.basicPrioritizeCreep(object, this.structure, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.scheduledWork = 0;
        this.scheduledWorkers = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers === 0 || !this.structure.isValid || !(object instanceof Creep))
        {
            return ERR_NO_WORK;
        }

        let creep = <Creep>object;

        if (creep.type === CREEP_TYPE.MINER.name && this.scheduledWorkers > 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
        {
            creep.goMoveTo(creep.spawnRequest.replacingCreep);
            return OK;
        }

        let code = creep.goDismantle(this.structure);

        if (code === OK)
        {
            this.scheduledWorkers++;
            this.scheduledWork += creep.getActiveBodyparts(WORK);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        return code;
    }
}