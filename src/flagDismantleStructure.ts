/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority} from './task';
import {BuildStructure} from "./taskBuildStructure";
import {DismantleStructure} from "./taskDismantleStructure";
import {UpgradeRoomController} from "./taskUpgradeRoomController";
import {ScreepsPtr} from "./screepsPtr";

export class FlagDismantleStructure extends Task
{
    structureType: string;

    constructor(parentId: string, public flag: Flag)
    {
        super(true);
        this.id = ((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "FlagDismantleStructure[" + flag.name + "]";
        
        if (this.flag.secondaryColor == COLOR_RED)
        {
            this.structureType = null;
        }
        else if (this.flag.secondaryColor == COLOR_GREEN)
        {
            this.structureType = STRUCTURE_EXTENSION;
        }
        else if (this.flag.secondaryColor == COLOR_YELLOW)
        {
            this.structureType = STRUCTURE_CONTAINER;
        }
    }

    static deserialize(input: string): FlagDismantleStructure
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let flagName = input.substring(startingBraceIndex, input.length - 1);

        let flag = Game.flags[flagName];

        if (flag == null)
        {
            return null;
        }

        return new FlagDismantleStructure(parentId, flag);
    }

    getSteps(): Task[]
    {
        let steps: Task[] = [];

        if (this.flag.room != null)
        {
            let sitesUnderFlag = this.flag.room.lookForAt<ConstructionSite>(LOOK_CONSTRUCTION_SITES, this.flag.pos);
            if (sitesUnderFlag != null && sitesUnderFlag.length > 0)
            {
                for (var index = 0; index < sitesUnderFlag.length; index++)
                {
                    var type = sitesUnderFlag[index].structureType;

                    if (this.structureType == null || type == this.structureType)
                    {
                        sitesUnderFlag[index].remove();
                    }
                }
            }

            let structuresUnderFlag = this.flag.room.lookForAt<Structure>(LOOK_STRUCTURES, this.flag.pos);
            if (structuresUnderFlag != null)
            {
                for (var index = 0; index < structuresUnderFlag.length; index++)
                {
                    var type = structuresUnderFlag[index].structureType;

                    if (this.structureType == null || this.structureType == type)
                    {
                        steps.push(new DismantleStructure(ScreepsPtr.from<Structure>(structuresUnderFlag[index])));
                    }
                }
            }
        }

        return steps;
    }
}