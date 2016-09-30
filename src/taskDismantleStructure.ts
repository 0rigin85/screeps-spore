import {Task, ERR_NO_WORK} from './task';
import {RoomObjectLike, ScreepsPtr} from "./screepsPtr";
import {SporeCreep, CREEP_TYPE} from "./sporeCreep";
import {BodyDefinition} from "./bodyDefinition";

export class DismantleStructure extends Task
{
    idealCreepBody: BodyDefinition;
    structure: ScreepsPtr<Structure>;

    constructor(structure: ScreepsPtr<Structure>)
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
        if (this.possibleWorkers === 0 || !this.structure.isValid || !(object instanceof Creep))
        {
            return ERR_NO_WORK;
        }

        let creep = <Creep>object;
        let code = creep.goDismantle(this.structure);

        if (code === OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}