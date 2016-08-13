///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {Task} from "./task";
import {FlagBuildStructure} from "./flagBuildStructure";
import {FlagDismantleStructure} from "./flagDismantleStructure";

declare global
{
    interface Flag
    {
        getTasks(): Task[];
    }
}

export interface FlagMemory
{

}

export class SporeFlag extends Flag
{
    getTasks(): Task[]
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
                    lookObject.source.doIgnore = true;
                }
                else if (lookObject.type == LOOK_STRUCTURES)
                {
                    lookObject.structure.doIgnore = true;
                }
                else if (lookObject.type == LOOK_CONSTRUCTION_SITES)
                {
                    lookObject.constructionSite.doIgnore = true;
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
                    lookObject.source.doFavor = true;
                }
                else if (lookObject.type == LOOK_STRUCTURES)
                {
                    lookObject.structure.doFavor = true;
                }
                else if (lookObject.type == LOOK_CONSTRUCTION_SITES)
                {
                    lookObject.constructionSite.doFavor = true;
                }
            }
        }
        else if (this.color == COLOR_ORANGE)
        {
            let lookResults: LookAtResult[] = this.room.lookAt(this);

            for (var lookIndex = 0; lookIndex < lookResults.length; lookIndex++)
            {
                let lookObject = lookResults[lookIndex];

                if (lookObject.type == LOOK_SOURCES)
                {
                    lookObject.source.doFavor = true;
                }
            }
        }

        return tasks;
    }
}
