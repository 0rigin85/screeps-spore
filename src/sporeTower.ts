/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {TransferResource} from "./taskTransferResource";
import {Task, TaskPriority} from "./task";
import {ENERGYLOCATION} from "./energyManager";
import {StructureMemory} from "./sporeStructure";

// Ensure this is treated as a module.
export {};

export class TowerMemory extends StructureMemory
{
    type: number = 0;
    isAttacking: string = "";
    isHealing: string = "";
    isRepairing: string = "";
}

declare global
{
    interface StructureTower
    {
        getTasks(): Task[];

        getMemory(): TowerMemory;
    }
}

StructureTower.prototype.getMemory = function()
{
    var memory = Memory[this.id];

    if (memory == null)
    {
        memory = new TowerMemory();
        memory.type = STRUCTURE_TOWER;
        Memory[this.id] = memory;
    }

    return memory;
};

StructureTower.prototype.getTasks = function()
{
    this.getMemory();

    let tasks: Task[] = [];

    tasks.push.apply(tasks, Structure.prototype.getTasks.call(this));

    if (this.energy < this.energyCapacity)
    {
        let transferEnergyTask = new TransferResource("", this, RESOURCE_ENERGY, [ENERGYLOCATION.DROPPED, ENERGYLOCATION.STORAGE, ENERGYLOCATION.SOURCE]);
        transferEnergyTask.priority = TaskPriority.Mandatory;
        tasks.push(transferEnergyTask);
    }

    return tasks;
};