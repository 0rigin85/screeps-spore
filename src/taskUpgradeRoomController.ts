/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority, ERR_NO_WORK, LaborDemandType, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK} from './task';
import {RoomObjectLike, ScreepsPtr} from "./screepsPtr";
import {ACTION_UPGRADE, SporeCreep, CREEP_TYPE} from "./sporeCreep";
import {BodyDefinition} from "./bodyDefinition";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";

export class UpgradeRoomController extends Task
{
    idealCreepBody: BodyDefinition;

    constructor(public controller: ScreepsPtr<Controller>)
    {
        super(false);
        this.id = "Upgrade " + controller;
        this.name = "Upgrade " + controller.toHtml();
        this.possibleWorkers = -1;
        this.idealCreepBody = CREEP_TYPE.CITIZEN;
        this.roomName = controller.pos.roomName;
        this.priority = TaskPriority.Low;
        this.near = controller;

        if (!controller.isShrouded)
        {
            if (controller.instance.ticksToDowngrade < 2000)
            {
                this.priority = TaskPriority.Mandatory * 2;
            }
            else if (controller.instance.ticksToDowngrade < 3000)
            {
                this.priority = TaskPriority.Mandatory;
            }
            else if (controller.instance.level < 2)
            {
                this.priority = TaskPriority.Mandatory - 100;
            }
        }

        let carryDemand = 24;//Math.ceil((controller.room.economy.resources.energy * controller.room.budget.upgrade) / CARRY_CAPACITY);
        this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ carry: carryDemand }, 1, 50);
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
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

    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers === 0 || !this.controller.isValid)
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to upgrade a room controller with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let creep = <Creep>object;
        let code;

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            (creep.action === ACTION_UPGRADE && creep.carry[RESOURCE_ENERGY] > 0))
        {
            code = creep.goUpgrade(this.controller);
        }
        else
        {
            code = creep.goCollect(
                RESOURCE_ENERGY,
                creep.carryCapacityRemaining,
                false,
                this.controller.pos,
                [['near_dropped'], ['link','container','storage'], ['dropped']],
                {});
        }

        if (code === OK)
        {
            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (this.possibleWorkers === 0)
        {
            return NO_MORE_WORK;
        }

        return code;
    }

    endScheduling(): void
    {

    }
}