/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_CANNOT_PERFORM_WORK, ERR_NOWORK} from './task';
import {EnergyManager, ENERGYLOCATION, ERR_NOENERGY} from "./energyManager";

export class BuildStructure extends Task
{
    constructor(parentId: string, public site: ConstructionSite)
    {
        super(((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Build[" + site.id + "]", false);
        this.possibleWorkers = 2;

        if (site.structureType == STRUCTURE_TOWER)
        {
            this.possibleWorkers = -1;
        }
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

        return new BuildStructure(parentId, site);
    }

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NOWORK;
        }

        if(creep.memory.building && creep.carry.energy == 0)
        {
            creep.memory.building = false;
        }

        if(!creep.memory.building && creep.carry.energy == creep.carryCapacity)
        {
            creep.memory.building = true;
        }

        let code = ERR_NOWORK;
        if(creep.memory.building)
        {
            code = this.goBuild(creep, this.site);
        }
        else
        {
            code = this.goCollect(creep, [ENERGYLOCATION.DROPPED, ENERGYLOCATION.STORAGE, ENERGYLOCATION.SOURCE]);

            // if (code == OK && creep.carry.energy > 0 && creep.pos.inRangeTo(this.site.pos, 3))
            // {
            //     code = this.goBuild(creep, this.site);
            // }
        }

        if (code == OK)
        {
            this.possibleWorkers--;
        }

        return code;
    }
}