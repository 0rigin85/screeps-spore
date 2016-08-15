import {Task, ERR_NO_WORK, ACTION_BUILD, ERR_CANNOT_PERFORM_TASK, TaskPriority} from './task';
import Dictionary = _.Dictionary;

let STRUCTURE_BUILD_PRIORITY =
{
    "spawn": function(site: ConstructionSite) { return TaskPriority.Mandatory },
    "tower": function(site: ConstructionSite) { return TaskPriority.Mandatory },
    "extension": function(site: ConstructionSite) { return TaskPriority.High },
    "container": function(site: ConstructionSite) { return TaskPriority.High },
    "link": function(site: ConstructionSite) { return TaskPriority.High },
    "extractor": function(site: ConstructionSite) { return TaskPriority.High },
    "lab": function(site: ConstructionSite) { return TaskPriority.MediumHigh },
    "storage": function(site: ConstructionSite) { return TaskPriority.High },
    "terminal": function(site: ConstructionSite) { return TaskPriority.MediumHigh },
    "rampart": function(site: ConstructionSite) { return TaskPriority.MediumLow },
    "road": function(site: ConstructionSite) { return TaskPriority.MediumHigh },
    "constructedWall": function(site: ConstructionSite) { return TaskPriority.MediumLow },
};

export class BuildStructure extends Task
{
    constructor(public site: ConstructionSite)
    {
        super(false);
        this.id = "Build " + site.structureType + " " + site.room;
        this.name = "Build " + site + " " + site.room;
        this.possibleWorkers = -1;
        this.priority = STRUCTURE_BUILD_PRIORITY[site.structureType](site);
    }

    static deserialize(input: string): BuildStructure
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let siteId = input.substring(startingBraceIndex, input.length - 1);

        let site = Game.getObjectById<ConstructionSite>(siteId);

        if (site == null)
        {
            return null;
        }

        return new BuildStructure(site);
    }

    schedule(creep: Creep): number
    {
        if (Game.getObjectById(this.site.id) == null)
        {
            return ERR_NO_WORK;
        }

        if (this.possibleWorkers === 0)
        {
            return ERR_NO_WORK;
        }

        if (creep.getActiveBodyparts(WORK) === 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code;

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            (creep.action === ACTION_BUILD && creep.carry[RESOURCE_ENERGY] > 0))
        {
            code = this.goBuild(creep, this.site);
        }
        else
        {
            code = this.goCollect(
                creep,
                RESOURCE_ENERGY,
                Math.min(creep.carryCapacityRemaining, this.site.progressRemaining),
                false,
                this.site.pos,
                [['dropped'], ['link','container'], ['source'], ['storage']]);
        }

        if (code === OK)
        {
            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        return code;
    }
}