/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority, ERR_CANNOT_PERFORM_TASK, ERR_NO_WORK, ACTION_UPGRADE} from './task';

export class UpgradeRoomController extends Task
{
    constructor(public parentId: string, public room: Room)
    {
        super(false);
        this.id = "UpgradeRoomController[" + room.name + "]";
        this.name = "Upgrade Room [" + room.name + "] Controller";
        this.possibleWorkers = -1;

        this.priority = TaskPriority.Medium + 10;

        if (room.controller.ticksToDowngrade < 2000)
        {
            this.priority = TaskPriority.Mandatory * 2;
        }
        else if (room.controller.ticksToDowngrade < 3000)
        {
            this.priority = TaskPriority.Mandatory;
        }
        else if (room.controller.level < 2)
        {
            this.priority = TaskPriority.Mandatory - 100;
        }
    }

    static deserialize(input: string): UpgradeRoomController
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let roomName = input.substring(startingBraceIndex, input.length - 1);

        let room = Game.rooms[roomName];

        if (room == null)
        {
            return null;
        }

        return new UpgradeRoomController(parentId, room);
    }

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NO_WORK;
        }

        if (creep.getActiveBodyparts(WORK) == 0 ||
            creep.getActiveBodyparts(CARRY) == 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code;

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            (creep.action === ACTION_UPGRADE && creep.carry[RESOURCE_ENERGY] > 0))
        {
            code = this.goUpgrade(creep, this.room.controller);
        }
        else
        {
            code = this.goCollect(
                creep,
                RESOURCE_ENERGY,
                creep.carryCapacityRemaining,
                false,
                this.room.controller.pos,
                [['dropped'], ['link','container'], ['source'], ['storage']]);
        }

        if (code === OK && this.possibleWorkers > 0)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}