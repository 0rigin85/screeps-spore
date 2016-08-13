import {Task, TaskPriority} from "./task";
import {BuildStructure} from "./taskBuildStructure";

declare global
{
    interface ConstructionSite
    {
        progressRemaining: number;
        memory: ConstructionSiteMemory;

        getTasks(): Task[];
    }
}

export interface ConstructionSiteMemory
{

}

var STRUCTURE_PRIORITIES = {};
STRUCTURE_PRIORITIES[STRUCTURE_CONTAINER] = TaskPriority.High;
STRUCTURE_PRIORITIES[STRUCTURE_TOWER] = TaskPriority.High;
STRUCTURE_PRIORITIES[STRUCTURE_EXTENSION] = TaskPriority.High;
STRUCTURE_PRIORITIES[STRUCTURE_ROAD] = TaskPriority.Low;

// declare var STRUCTURE_LINK: string;
// declare var STRUCTURE_KEEPER_LAIR: string;
// declare var STRUCTURE_STORAGE: string;
// declare var STRUCTURE_OBSERVER: string;
// declare var STRUCTURE_POWER_BANK: string;
// declare var STRUCTURE_POWER_SPAWN: string;
// declare var STRUCTURE_EXTRACTOR: string;
// declare var STRUCTURE_LAB: string;
// declare var STRUCTURE_TERMINAL: string;

export class SporeConstructionSite extends ConstructionSite
{
    get progressRemaining(): number
    {
        return this.progressTotal - this.progress;
    }

    get memory(): ConstructionSiteMemory
    {
        let roomMemory = this.room.memory;

        if (roomMemory.sites == null)
        {
            roomMemory.sites = [];
        }

        let memory = roomMemory.sites[this.id];

        if (memory == null)
        {
            memory = { };
            roomMemory.sites[this.id] = memory;
        }

        Object.defineProperty(this, "memory", {value: memory});
        return memory;
    }

    getTasks(): Task[]
    {
        let tasks: Task[] = [];

        let taskPriority = TaskPriority.Medium;
        if (STRUCTURE_PRIORITIES[this.structureType] != null)
        {
            taskPriority = STRUCTURE_PRIORITIES[this.structureType];
        }

        let task = new BuildStructure(this);
        task.priority = taskPriority;
        tasks.push(task);

        return tasks;
    }
}