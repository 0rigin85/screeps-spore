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

        let task = new BuildStructure(this);
        tasks.push(task);

        return tasks;
    }
}