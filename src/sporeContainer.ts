/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {TransferResource} from "./taskTransferResource";
import {Task, TaskPriority} from "./task";
import {ENERGYLOCATION} from "./energyManager";
import {RepairStructure} from "./taskRepairStructure";
import {StructureMemory} from "./sporeStructure";

// Ensure this is treated as a module.
export {};

export class ContainerMemory extends StructureMemory
{
    type: number = 0;
    availableSlots: number = 0;
}

declare global
{
    interface StructureContainer
    {
        getMemory(): ContainerMemory;
        getTasks(): Task[];
    }
}

StructureContainer.prototype.getMemory = function()
{
    let memory: ContainerMemory = Memory[this.id];

    if (memory == null)
    {
        memory = new ContainerMemory();
        memory.type = ENERGYLOCATION.STORAGE;
        memory.availableSlots = this.pos.getWalkableSurroundingArea();
        Memory[this.id] = memory;

        //@todo replace
        if (Memory.EnergyLocations.indexOf(this.id) == -1)
        {
            Memory.EnergyLocations.push(this.id);
        }
    }

    return memory;
};

StructureContainer.prototype.getTasks = function()
{
    this.getMemory();

    let tasks: Task[] = [];

    tasks.push.apply(tasks, Structure.prototype.getTasks.call(this));

    if (this.store.energy < this.storeCapacity)
    {
        let transferEnergyTask = new TransferResource("", this, RESOURCE_ENERGY, [ENERGYLOCATION.SOURCE]);
        transferEnergyTask.priority = TaskPriority.Mandatory;
        tasks.push(transferEnergyTask);
    }

    return tasks;
};