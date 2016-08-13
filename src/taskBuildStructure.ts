import {Task, ERR_NO_WORK, ACTION_BUILD, ERR_CANNOT_PERFORM_TASK, TaskPriority} from './task';
import Dictionary = _.Dictionary;

let STRUCTURE_BUILD_PRIORITY =
{
    "spawn": function(spawn: Spawn) { return TaskPriority.Mandatory },
    "tower": function(tower: StructureTower) { return TaskPriority.Mandatory },
    "extension": function(extension: StructureExtension) { return TaskPriority.Mandatory },
    "container": function(container: StructureContainer) { return TaskPriority.Mandatory },
    "link": function(link: StructureLink) { return TaskPriority.Mandatory },
    "extractor": function(extractor: StructureExtractor) { return TaskPriority.Mandatory },
    "lab": function(lab: StructureLab) { return TaskPriority.Mandatory },
    "storage": function(storage: StructureStorage) { return TaskPriority.Mandatory },
    "terminal": function(terminal: StructureTerminal) { return TaskPriority.Mandatory },
    "rampart": function(rampart: StructureRampart) { return TaskPriority.Mandatory },
    "road": function(road: StructureRoad) { return TaskPriority.Mandatory },
    "wall": function(wall: StructureWall) { return TaskPriority.Mandatory },
};

export class BuildStructure extends Task
{
    constructor(public site: ConstructionSite)
    {
        super(false);
        this.id = "Build " + site.structureType + " " + site.room;
        this.name = "Build " + site + " " + site.room;;
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