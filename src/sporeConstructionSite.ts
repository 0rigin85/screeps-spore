import { Task } from "./tasks/task";
import { Ptr } from "./Ptr";
import { BuildStructure } from "./tasks/taskBuildStructure";

export class SporeConstructionSite extends ConstructionSite {
  get progressRemaining(): number {
    return this.progressTotal - this.progress;
  }

  get memory(): ConstructionSiteMemory {
    let roomMemory = this.room.memory;

    if (roomMemory.sites == null) {
      roomMemory.sites = {};
    }

    let memory = roomMemory.sites[this.id];

    if (memory == null) {
      memory = {} as ConstructionSiteMemory;
      roomMemory.sites[this.id] = memory;
    }

    return memory;
  }

  getTasks(): Task[] {
    let tasks: Task[] = [];

    if (
      this.structureType !== STRUCTURE_RAMPART &&
      this.structureType !== STRUCTURE_WALL
    ) {
      let task = new BuildStructure(Ptr.from<ConstructionSite>(this));
      tasks.push(task);
    }

    return tasks;
  }
}
