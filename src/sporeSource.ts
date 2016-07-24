/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority} from "./task";
import {ENERGYLOCATION} from "./energyManager";
import {HarvestEnergy} from "./taskHarvestEnergy";

// Ensure this is treated as a module.
export {};

export class SourceTickMemory
{
    claims: string[] = [];
    ignore: boolean = false;
    favor: boolean = false;
}

export class SourceMemory
{
    type: number = 0;
    availableSlots: number = 0;
}

declare global
{
    interface Source
    {
        getMemory():SourceMemory;
        getTickMemory():SourceTickMemory;
        getLastTickMemory():SourceTickMemory;
    }
}

Source.prototype.getMemory = function()
{
    var memory = Memory[this.id];

    if (memory == null)
    {
        memory = new SourceMemory();
        memory.type = ENERGYLOCATION.SOURCE;
        memory.availableSlots = this.pos.getWalkableSurroundingArea();
        Memory[this.id] = memory;

        //@todo replace
        if (Memory.Sources.indexOf(this.id) == -1)
        {
            Memory.Sources.push(this.id);
        }

        //@todo replace
        if (Memory.EnergyLocations.indexOf(this.id) == -1)
        {
            Memory.EnergyLocations.push(this.id);
        }
    }

    return memory;
};

Source.prototype.getTickMemory = function()
{
    var memory = this.getMemory();
    var tickMemory = memory[Game.time];

    if (tickMemory == null)
    {
        tickMemory = new SourceTickMemory();
        memory[Game.time] = tickMemory;
    }

    return tickMemory;
};

Source.prototype.getLastTickMemory = function()
{
    return Memory[this.id][Game.time - 1];
};

