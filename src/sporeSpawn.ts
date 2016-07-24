/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {TransferResource} from "./taskTransferResource";
import {Task, TaskPriority} from "./task";
import {ENERGYLOCATION} from "./energyManager";
import {StructureMemory} from "./sporeStructure";

// Ensure this is treated as a module.
export {};

export class SpawnTickMemory
{
    claims: string[] = [];
    claimed: number = 0;
}

export class SpawnMemory extends StructureMemory
{
    type: number = 0;
    availableSlots: number = 0;
}

declare global
{
    interface Spawn
    {
        getMemory(): SpawnMemory;
        getTickMemory(): SpawnTickMemory;
        getLastTickMemory(): SpawnTickMemory;

        getTasks(): Task[];
    }
}

Spawn.prototype.getMemory = function()
{
    if (this.memory.type == null)
    {
        this.memory.type = 0;
        this.memory.availableSlots = 0;
        Memory[this.id] = this.memory;
    }

    return this.memory;
};

Spawn.prototype.getTickMemory = function()
{
    var tickMemory = this.memory[Game.time];

    if (tickMemory == null)
    {
        tickMemory = new SpawnTickMemory();
        this.memory[Game.time] = tickMemory;
    }

    return tickMemory;
};

Spawn.prototype.getLastTickMemory = function()
{
    var tickMemory = this.memory[Game.time - 1];

    if (tickMemory == null)
    {
        tickMemory = new SpawnTickMemory();
        this.memory[Game.time - 1] = tickMemory;
    }

    return tickMemory;
};

Spawn.prototype.getTasks = function()
{
    let memory = this.getMemory();

    let tasks: Task[] = [];

    tasks.push.apply(tasks, Structure.prototype.getTasks.call(this));

    if (this.energy < this.energyCapacity)
    {
        let task = new TransferResource("", this, RESOURCE_ENERGY, [ENERGYLOCATION.DROPPED, ENERGYLOCATION.STORAGE, ENERGYLOCATION.SOURCE]);
        task.priority = TaskPriority.Mandatory;

        tasks.push(task);
    }

    return tasks;
};