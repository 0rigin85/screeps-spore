/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {EnergyManager, ENERGYLOCATION, ERR_NOENERGY} from "./energyManager";
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

export var ERR_NOWORK: number = -400;
export var ERR_CANNOT_PERFORM_WORK: number = -401;

export class Task
{
    possibleWorkers: number = -1; //defaults to infinite
    scheduledWorkers: number = 0;
    priority: number = 50;

    constructor(public id: string, public isComplex: boolean)
    { }

    getSteps(): Task[]
    {
        return [];
    }

    schedule(creep: Creep): number
    {
        return ERR_NOWORK;
    }

    goMoveTo(creep: Creep, target: RoomObject): number
    {
        let moveCode = creep.moveTo(target);
        if (moveCode == OK)
        {
            return OK;
        }

        if (moveCode == ERR_NO_PATH ||
            moveCode == ERR_NO_BODYPART ||
            moveCode == ERR_BUSY ||
            moveCode == ERR_NOT_OWNER)
        {
            return ERR_CANNOT_PERFORM_WORK;
        }

        //if (moveCode == ERR_INVALID_TARGET)
        return ERR_NOWORK;
    }

    goHarvest(creep: Creep, source: Source): number
    {
        let harvestCode = creep.harvest(source);
        if (harvestCode == OK)
        {
            return OK;
        }

        if (harvestCode == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, source);
        }
        else if (harvestCode == ERR_NO_PATH ||
            harvestCode == ERR_NO_BODYPART ||
            harvestCode == ERR_BUSY ||
            harvestCode == ERR_NOT_OWNER)
        {
            return ERR_CANNOT_PERFORM_WORK;
        }

        //harvestCode == ERR_NOT_FOUND ||
        //harvestCode == ERR_NOT_ENOUGH_RESOURCES ||
        //harvestCode == ERR_INVALID_TARGET
        return ERR_NOWORK
    }

    goTransfer(creep: Creep, resourceType: string, target: Spawn | Structure | Creep): number
    {
        let code = creep.transfer(target, resourceType);

        if (code == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, target);
        }

        if (code == ERR_FULL)
        {
            return ERR_NOWORK;
        }

        if (code == ERR_NOT_OWNER ||
            code == ERR_BUSY ||
            code == ERR_INVALID_TARGET)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to another players creeps");
            return ERR_NOWORK;
        }

        if (code == ERR_INVALID_TARGET)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to an invalid target");
            return ERR_NOWORK;
        }

        if (code == ERR_BUSY)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to a creep that hasn't spawned yet");
            return ERR_NOWORK;
        }

        if (code == ERR_INVALID_ARGS)
        {
            console.log("ERROR: Attempted to transfer an invalid amount of '" + resourceType + "' to a target");
            return ERR_NOWORK;
        }

        //ERR_NOT_ENOUGH_RESOURCES	-6	The creep does not have the given amount of resources.
        return OK;
    }

    goBuild(creep: Creep, site: ConstructionSite): number
    {
        let code = creep.build(site);

        if (code == OK)
        {
            return OK;
        }

        if(code == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, site);
        }

        console.log("goBuild error code: " + code);
        return ERR_CANNOT_PERFORM_WORK;
    }

    goRepair(creep: Creep, structure: Structure): number
    {
        let code = creep.repair(structure);

        if (code == OK)
        {
            return OK;
        }

        if(code == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, structure);
        }

        console.log("goRepair error code: " + code);
        return ERR_CANNOT_PERFORM_WORK;
    }

    goCollect(creep: Creep, locations: ENERGYLOCATION[]): number
    {
        var energy = EnergyManager.collect(creep, locations);

        if (creep.memory.track == true)
        {
            console.log(creep.name + " collect code " + energy.statusCode);
        }

        if (energy.statusCode == OK)
        {
            return OK;
        }

        if(energy.statusCode == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, energy.object);
        }

        //energy.statusCode == ERR_NOENERGY
        return ERR_NOWORK;
    }

    goUpgrade(creep: Creep, controller: Controller): number
    {
        let code = creep.upgradeController(controller);

        if (code == OK)
        {
            return OK;
        }

        if(code == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, controller);
        }

        console.log("goUpgrade error code: " + code);
        return ERR_CANNOT_PERFORM_WORK;
    }
}