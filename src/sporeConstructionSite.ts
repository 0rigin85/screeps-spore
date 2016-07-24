/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {TransferResource} from "./taskTransferResource";
import {Task, TaskPriority} from "./task";
import {ENERGYLOCATION} from "./energyManager";
import {RepairStructure} from "./taskRepairStructure";
import {BuildStructure} from "./taskBuildStructure";

// Ensure this is treated as a module.
export {};

export class ConstructionSiteMemory
{
    ignore: boolean = false;
    favor: boolean = false;
}

declare global
{
    interface ConstructionSite
    {
        getMemory(): ConstructionSiteMemory;

        getTasks(): Task[];
    }
}

ConstructionSite.prototype.getMemory = function()
{
    var memory = Memory[this.id];

    if (memory == null)
    {
        memory = new ConstructionSiteMemory();
        Memory[this.id] = memory;
    }

    return memory;
};

ConstructionSite.prototype.getTasks = function()
{
    let tasks: Task[] = [];

    let structurePriorities = {};
    structurePriorities[STRUCTURE_CONTAINER] = TaskPriority.High;
    structurePriorities[STRUCTURE_TOWER] = TaskPriority.High;
    structurePriorities[STRUCTURE_EXTENSION] = TaskPriority.High;
    structurePriorities[STRUCTURE_ROAD] = TaskPriority.Low;

    // declare var STRUCTURE_LINK: string;
    // declare var STRUCTURE_KEEPER_LAIR: string;
    // declare var STRUCTURE_STORAGE: string;
    // declare var STRUCTURE_OBSERVER: string;
    // declare var STRUCTURE_POWER_BANK: string;
    // declare var STRUCTURE_POWER_SPAWN: string;
    // declare var STRUCTURE_EXTRACTOR: string;
    // declare var STRUCTURE_LAB: string;
    // declare var STRUCTURE_TERMINAL: string;

    let taskPriority = TaskPriority.Medium;
    if (structurePriorities[this.structureType] != null)
    {
        taskPriority = structurePriorities[this.structureType];
    }

    let task = new BuildStructure("", this);
    task.priority = taskPriority;
    tasks.push(task);

    return tasks;
};