/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
import {Task, TaskPriority} from "./task";
import {UpgradeRoomController} from "./taskUpgradeRoomController";

// Ensure this is treated as a module.
export {};

declare global
{
    interface StructureController
    {
        getTasks(): Task[];
    }
}

StructureController.prototype.getTasks = function()
{
    let tasks: Task[] = [];

    tasks.push.apply(tasks, Structure.prototype.getTasks.call(this));

    let task = new UpgradeRoomController("", this.room);
    task.priority = TaskPriority.Medium;

    tasks.push(task);

    return tasks;
};