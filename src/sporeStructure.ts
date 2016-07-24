/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority} from "./task";
import {RepairStructure} from "./taskRepairStructure";

// Ensure this is treated as a module.
export {};

export class StructureMemory
{
    ignore: boolean;
    favor: boolean;
}

declare global
{
    interface Structure
    {
        getMemory(): StructureMemory;

        getTasks(): Task[];
    }
}

Structure.prototype.getMemory = function()
{
    var memory = Memory[this.id];

    if (memory == null)
    {
        memory = new StructureMemory();
        Memory[this.id] = memory;
    }

    return memory;
};

Structure.prototype.getTasks = function()
{
    let tasks: Task[] = [];

    if (this.structureType == STRUCTURE_CONTROLLER)
    {
        return tasks;
    }

    let structureValues = {};
    structureValues[STRUCTURE_CONTAINER] = { regular: { threshold: 0.25, priority: TaskPriority.High}, dire:{threshold: 0.75, priority: TaskPriority.Mandatory} };
    structureValues[STRUCTURE_TOWER] = { regular: { threshold: 0.15, priority: TaskPriority.High}, dire:{threshold: 0.5, priority: TaskPriority.Mandatory} };
    structureValues[STRUCTURE_ROAD] = { regular: { threshold: 0.8, priority: TaskPriority.Low}, dire:{threshold: 0.9, priority: TaskPriority.Medium} };
    structureValues[STRUCTURE_RAMPART] = { regular: { threshold: 0.6, priority: TaskPriority.Medium}, dire:{threshold: 0.9, priority: TaskPriority.Mandatory} };
    structureValues[STRUCTURE_WALL] = { regular: { threshold: 0.999977, priority: TaskPriority.Low}, dire:{threshold: 0.999997, priority: TaskPriority.Medium} };

    // declare var STRUCTURE_LINK: string;
    // declare var STRUCTURE_KEEPER_LAIR: string;
    // declare var STRUCTURE_STORAGE: string;
    // declare var STRUCTURE_OBSERVER: string;
    // declare var STRUCTURE_POWER_BANK: string;
    // declare var STRUCTURE_POWER_SPAWN: string;
    // declare var STRUCTURE_EXTRACTOR: string;
    // declare var STRUCTURE_LAB: string;
    // declare var STRUCTURE_TERMINAL: string;

    let structureValue = { regular: { threshold: 0.5, priority: TaskPriority.Medium}, dire:{threshold: 0.85, priority: TaskPriority.Mandatory} };
    if (structureValues[this.structureType] != null)
    {
        structureValue = structureValues[this.structureType];
    }

    if (this.hitsMax - this.hits >= this.hitsMax * structureValue.regular.threshold)
    {
        let repairTask = new RepairStructure("", this);
        repairTask.priority = structureValue.regular.priority;

        if (this.hitsMax - this.hits >= this.hitsMax  * structureValue.dire.threshold)
        {
            repairTask.priority = structureValue.dire.priority;
        }

        tasks.push(repairTask);
    }

    return tasks;
};