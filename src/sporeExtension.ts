/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {TransferResource} from "./taskTransferResource";
import {Task, TaskPriority} from "./task";
import {ENERGYLOCATION} from "./energyManager";

// Ensure this is treated as a module.
export {};

declare global
{
    interface StructureExtension
    {
        getTasks(): Task[];
    }
}

StructureExtension.prototype.getTasks = function()
{
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