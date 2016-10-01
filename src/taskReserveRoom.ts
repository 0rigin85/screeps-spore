import {Task, ERR_NO_WORK, TaskPriority, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK, LaborDemandType} from './task';
import Dictionary = _.Dictionary;
import {SporeCreep, ACTION_BUILD, CREEP_TYPE} from "./sporeCreep";
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import {BodyDefinition} from "./bodyDefinition";

export class ReserveRoom extends Task
{
    idealCreepBody: BodyDefinition;
    scheduledClaim: number;

    constructor(public controller: ScreepsPtr<StructureController>)
    {
        super(false);

        this.id = 'Reserve ' + controller;
        this.name = 'Reserve ' + controller.toHtml();
        this.possibleWorkers = -1;
        this.idealCreepBody = CREEP_TYPE.RESERVER;
        this.near = controller;

        if (controller.isShrouded)
        {
            this.priority = TaskPriority.MediumHigh;
        }
        else if (controller.instance.reservation != null)
        {
            if (controller.instance.reservation.ticksToEnd < 1000)
            {
                this.priority = TaskPriority.Mandatory;
            }
            else
            {
                this.priority = TaskPriority.High;
            }
        }
        else
        {
            this.priority = TaskPriority.MediumHigh;
        }

        this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ claim: 2 }, 1, 2);
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        if (request.replacingCreep != null)
        {
            return super.createBasicAppointment(spawn, request, request.replacingCreep);
        }

        return super.createBasicAppointment(spawn, request, this.controller);
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0)
            {
                return 0;
            }

            return super.basicPrioritizeCreep(object, this.controller, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.scheduledClaim = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers === 0 || !this.controller.isValid || this.scheduledClaim >= this.labor.types[this.idealCreepBody.name].parts[CLAIM])
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to reserve a controller with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let creep = <Creep>object;
        let code;

        code = creep.goReserve(this.controller);

        if (code === OK)
        {
            this.scheduledClaim += creep.getActiveBodyparts(CLAIM);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (this.possibleWorkers === 0 || this.scheduledClaim >= this.labor.types[this.idealCreepBody.name].parts[CLAIM])
        {
            return NO_MORE_WORK;
        }

        return code;
    }
}