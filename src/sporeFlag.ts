/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
import {Task} from "./task";
import {FlagBuildStructure} from "./flagBuildStructure";
import {FlagDismantleStructure} from "./flagDismantleStructure";

// Ensure this is treated as a module.
export {};

declare global
{
    interface Flag
    {
        getTasks(): Task[];
    }
}

Flag.prototype.getTasks = function()
{
    let tasks: Task[] = [];

    if (this.color == COLOR_GREEN)
    {
        tasks.push(new FlagBuildStructure("", Game.flags[this.name]));
    }
    else if (this.color == COLOR_RED)
    {
        tasks.push(new FlagDismantleStructure("", Game.flags[this.name]));
    }
    else if (this.color == COLOR_GREY)
    {
        let lookResults: LookAtResult[] = this.room.lookAt(this);

        for (var lookIndex = 0; lookIndex < lookResults.length; lookIndex++)
        {
            let lookObject = lookResults[lookIndex];

            if (lookObject.type == LOOK_SOURCES)
            {
                lookObject.source.getTickMemory().ignore = true;
            }
            else if (lookObject.type == LOOK_STRUCTURES)
            {
                lookObject.structure.getMemory().ignore = true;
            }
            else if (lookObject.type == LOOK_CONSTRUCTION_SITES)
            {
                lookObject.constructionSite.getMemory().ignore = true;
            }
        }
    }
    else if (this.color == COLOR_BLUE)
    {
        let lookResults: LookAtResult[] = this.room.lookAt(this);

        for (var lookIndex = 0; lookIndex < lookResults.length; lookIndex++)
        {
            let lookObject = lookResults[lookIndex];

            if (lookObject.type == LOOK_SOURCES)
            {
                lookObject.source.getTickMemory().favor = true;
            }
            else if (lookObject.type == LOOK_STRUCTURES)
            {
                lookObject.structure.getMemory().favor = true;
            }
            else if (lookObject.type == LOOK_CONSTRUCTION_SITES)
            {
                lookObject.constructionSite.getMemory().favor = true;
            }
        }
    }

    return tasks;
};
