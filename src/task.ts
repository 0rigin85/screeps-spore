import {Claimable} from "./sporeClaimable";

export const enum TaskPriority
{
    Mandatory = 1000,

    High = 100,
    MediumHigh = 75,
    Medium = 50,
    MediumLow = 25,
    Low = 0,

    ExtraDemandBoost = 10,
}

export var ERR_NO_WORK: number = -400;
export var ERR_CANNOT_PERFORM_TASK: number = -401;

export var ACTION_TRANSFER: string = "transfer";
export var ACTION_RECYCLE: string = "recycle";
export var ACTION_COLLECT: string = "collect";
export var ACTION_UPGRADE: string = "upgrade";
export var ACTION_BUILD: string = "build";
export var ACTION_DISMANTLE: string = "dismantle";
export var ACTION_REPAIR: string = "repair";
export var ACTION_MOVE: string = "move";

export class TaskSet
{
    [taskId: string]: Task;
}

export class Task
{
    id: string = "UNKNOWN";
    name: string;
    say: string;
    possibleWorkers: number = -1; //defaults to infinite
    scheduledWorkers: number = 0;
    priority: number = 50;

    constructor(public isComplex: boolean)
    { }

    getSteps(): Task[]
    {
        return [];
    }

    schedule(creep: Creep): number
    {
        return ERR_NO_WORK;
    }

    goMoveTo(creep: Creep, target: RoomObject | RoomPosition | Source | Claimable): number
    {
        let code = creep.moveTo(target, {noPathFinding: true});

        // Perform pathfinding only if we have enough CPU
        if (code == ERR_NOT_FOUND && Game.cpu.tickLimit - Game.cpu.getUsed() > 20)
        {
            code = creep.moveTo(target);
        }

        if (code == OK ||
            code == ERR_TIRED)
        {
            creep.action = ACTION_MOVE;
            creep.actionTarget = target;
            return OK;
        }

        if (code == ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        // ERR_NO_PATH
        // ERR_NO_BODYPART
        // ERR_BUSY
        // ERR_NOT_OWNER
        return ERR_CANNOT_PERFORM_TASK;
    }

    goHarvest(creep: Creep, source: Source): number
    {
        let claimReceipt = source.makeClaim(creep, RESOURCE_ENERGY, creep.carryCapacityRemaining, true);

        if (claimReceipt === null)
        {
            return ERR_NO_WORK;
        }

        let code = claimReceipt.target.collect(creep, claimReceipt);

        if (code === ERR_NOT_IN_RANGE)
        {
            code = this.goMoveTo(creep, claimReceipt.target);
        }

        if (code === OK)
        {
            creep.action = ACTION_COLLECT;
            creep.actionTarget = claimReceipt.target;
            return OK;
        }

        if (code === ERR_NOT_ENOUGH_RESOURCES ||
            code === ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        return ERR_CANNOT_PERFORM_TASK;
    }

    goTransfer(creep: Creep, resourceType: string, target: Spawn | Structure | Creep): number
    {
        let code = creep.transfer(target, resourceType);

        if (code == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, target);
        }

        if (code == OK)
        {
            creep.action = ACTION_TRANSFER;
            creep.actionTarget = target;
            return OK;
        }

        if (code == ERR_FULL)
        {
            return ERR_NO_WORK;
        }

        if (code == ERR_NOT_OWNER)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to another players creeps");
            return ERR_NO_WORK;
        }

        if (code == ERR_INVALID_TARGET)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to an invalid target " + target);
            return ERR_NO_WORK;
        }

        if (code == ERR_BUSY)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to a creep that hasn't spawned yet");
            return ERR_NO_WORK;
        }

        if (code == ERR_INVALID_ARGS)
        {
            console.log("ERROR: Attempted to transfer an invalid amount of '" + resourceType + "' to a target");
            return ERR_NO_WORK;
        }

        //ERR_NOT_ENOUGH_RESOURCES	-6	The creep does not have the given amount of resources.
        return ERR_CANNOT_PERFORM_TASK;
    }

    goBuild(creep: Creep, site: ConstructionSite): number
    {
        let code = creep.build(site);

        if (code === ERR_NOT_IN_RANGE)
        {
            code = this.goMoveTo(creep, site);
        }

        if (code === OK)
        {
            creep.action = ACTION_BUILD;
            creep.actionTarget = site;
            return OK;
        }

        if (code == ERR_NOT_ENOUGH_RESOURCES ||
            code == ERR_INVALID_TARGET ||
            code == ERR_RCL_NOT_ENOUGH)
        {
            return ERR_NO_WORK;
        }

        // ERR_NOT_OWNER
        // ERR_BUSY
        // ERR_NO_BODYPART
        return ERR_CANNOT_PERFORM_TASK;
    }

    goDismantle(creep: Creep, structure: Structure): number
    {
        structure.notifyWhenAttacked(false);

        let code = creep.dismantle(structure);

        if (code === ERR_NOT_IN_RANGE)
        {
            code = this.goMoveTo(creep, structure);
        }

        if (code === OK)
        {
            creep.action = ACTION_DISMANTLE;
            creep.actionTarget = structure;
            return OK;
        }

        if (code == ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        // ERR_NOT_OWNER
        // ERR_BUSY
        // ERR_NO_BODYPART
        return ERR_CANNOT_PERFORM_TASK;
    }

    goRepair(creep: Creep, structure: Structure): number
    {
        let code = creep.repair(structure);

        if(code === ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, structure);
        }

        if (code === OK)
        {
            creep.action = ACTION_REPAIR;
            creep.actionTarget = structure;
            return OK;
        }

        if (code === ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        console.log("Creep " + creep.name + " goRepair error code: " + code);
        return ERR_CANNOT_PERFORM_TASK;
    }

    goCollect(creep: Creep, resourceType: string, amount: number, isExtended: boolean, near: RoomPosition, storePriorities: string[][]): number
    {
        let claimReceipt = Game.rooms[near.roomName].claimResource(creep, resourceType, amount, isExtended, near, storePriorities, creep.claimReceipt);

        if (claimReceipt == null)
        {
            return ERR_NO_WORK;
        }

        creep.claimReceipt = claimReceipt;

        let code = claimReceipt.target.collect(creep, claimReceipt);

        if (code === ERR_NOT_IN_RANGE)
        {
            code = this.goMoveTo(creep, claimReceipt.target);
        }

        if (code === OK)
        {
            creep.action = ACTION_COLLECT;
            creep.actionTarget = claimReceipt.target;
            return OK;
        }

        if (code === ERR_NOT_ENOUGH_RESOURCES)
        {
            console.log("FAILED TO CONFIRM AVAILABLE RESOURCES BEFORE COLLECTING. " + creep + " " + claimReceipt.target + " " + claimReceipt.amount + " " + claimReceipt.resourceType);
            creep.claimReceipt = null;

            return ERR_NO_WORK;
        }

        return ERR_CANNOT_PERFORM_TASK;
    }

    goUpgrade(creep: Creep, controller: Controller): number
    {
        let code = creep.upgradeController(controller);

        if(code === ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, controller);
        }

        if (code === OK)
        {
            creep.action = ACTION_UPGRADE;
            creep.actionTarget = controller;
            return OK;
        }

        console.log("goUpgrade error code: " + code);
        return ERR_CANNOT_PERFORM_TASK;
    }

    goRecycle(creep: Creep, spawn: Spawn): number
    {
        let code = spawn.recycleCreep(creep);

        if(code === ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, spawn);
        }

        if (code === OK)
        {
            creep.action = ACTION_RECYCLE;
            creep.actionTarget = spawn;
            return OK;
        }

        console.log("goRecycle error code: " + code);
        return ERR_CANNOT_PERFORM_TASK;
    }
}