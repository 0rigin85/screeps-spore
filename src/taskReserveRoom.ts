import {
    Task, ERR_NO_WORK, TaskPriority, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK, LaborDemandType,
    ERR_SKIP_WORKER
} from './task';
import Dictionary = _.Dictionary;
import {SporeCreep, ACTION_BUILD, CREEP_TYPE} from "./sporeCreep";
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import {BodyDefinition} from "./bodyDefinition";

export class ReserveRoom extends Task
{
    idealCreepBody: BodyDefinition;
    scheduledWorkers: number;
    scheduledClaim: number;

    constructor(public controller: ScreepsPtr<StructureController>)
    {
        super(false);

        this.id = 'Reserve ' + controller;
        this.name = 'Reserve ' + controller.toHtml();
        this.possibleWorkers = -1;
        this.idealCreepBody = CREEP_TYPE.RESERVER;
        this.near = controller;
        this.roomName = controller.pos.roomName;

        if (controller.isShrouded)
        {
            this.priority = TaskPriority.Mandatory - 100;
        }
        else if (controller.instance.reservation != null)
        {
            if (controller.instance.reservation.ticksToEnd < 1000)
            {
                this.priority = TaskPriority.Mandatory + 400;
            }
            else
            {
                this.priority = TaskPriority.High;
            }
        }
        else
        {
            this.priority = TaskPriority.High;
        }

        if (controller.isShrouded || controller.instance.reservation == null || controller.instance.reservation.ticksToEnd < 1500)
        {
            this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ claim: 2 }, 1, 2);
        }
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        if (request.replacingCreep != null)
        {
            return super.createBasicAppointment(spawn, request, request.replacingCreep);
        }

        return super.createBasicAppointment(spawn, request, this.controller);
    }

    shouldPlanToReplace(object: RoomObjectLike): boolean
    {
        if (object instanceof Creep)
        {
            if (this.controller.isShrouded ||
                this.controller.instance.reservation == null ||
                this.controller.instance.reservation.username != 'PCake0rigin' ||
                this.controller.instance.reservation.ticksToEnd - object.ticksToLive < 1500)
            {
                return true;
            }
        }

        return false;
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            return super.basicPrioritizeCreep(object, this.controller, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.scheduledWorkers = 0;
        this.scheduledClaim = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        let claimLabor = 0;

        if (this.labor.types[this.idealCreepBody.name] != null)
        {
            claimLabor = this.labor.types[this.idealCreepBody.name].parts[CLAIM];
        }

        if (this.possibleWorkers === 0 || !this.controller.isValid || (claimLabor > 0 && this.scheduledClaim >= claimLabor))
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

        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
        {
            creep.goMoveTo(creep.spawnRequest.replacingCreep);
            return OK;
        }

        if (creep.spawnRequest == null && creep.task != this && creep.task instanceof ReserveRoom)
        {
            return ERR_SKIP_WORKER;
        }

        code = creep.goReserve(this.controller);

        if (code === OK)
        {
            this.scheduledWorkers++;
            this.scheduledClaim += creep.getActiveBodyparts(CLAIM);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (this.possibleWorkers === 0 ||
            this.scheduledClaim >= claimLabor ||
            (!this.controller.isShrouded && this.scheduledWorkers >= this.controller.instance.slots))
        {
            return NO_MORE_WORK;
        }

        return code;
    }
}