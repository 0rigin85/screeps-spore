/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority, ERR_CANNOT_PERFORM_WORK, ERR_NOWORK} from './task';
import {EnergyManager, ENERGYLOCATION, ERR_NOENERGY} from "./energyManager";

export class UpgradeRoomController extends Task
{
    constructor(public parentId: string, public room: Room)
    {
        super(((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "UpgradeRoomController[" + room.name + "]", false);
        this.possibleWorkers = 2;
        this.priority = TaskPriority.Mandatory - 100;
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
            return ERR_NOWORK;
        }

        if(creep.memory.upgrading && creep.carry.energy == 0)
        {
            creep.memory.upgrading = false;
        }

        if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.upgrading = true;
        }

        let code = ERR_NOWORK;
        if(creep.memory.upgrading)
        {
            code = this.goUpgrade(creep, this.room.controller);
        }
        else
        {
            code = this.goCollect(creep, [ENERGYLOCATION.ANY]);
        }

        if (code == OK)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}