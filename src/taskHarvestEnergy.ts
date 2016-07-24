/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_CANNOT_PERFORM_WORK, ERR_NOWORK} from './task';
import {EnergyManager} from "./energyManager";

export class HarvestEnergy extends Task
{
    constructor(parentId: string, public source: Source, public slotId: number)
    {
        super(((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Harvest:" + slotId + "[" + source.id + "]", false);

        this.possibleWorkers = 1;
    }

    static deserialize(input: string): HarvestEnergy
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let sourceId = input.substring(startingBraceIndex, input.length - 1);

        let colonIndex = input.lastIndexOf(":");
        let slotId = input.substring(colonIndex, startingBraceIndex);

        let source = Game.getObjectById<Source>(sourceId);

        if (source == null)
        {
            return null;
        }

        return new HarvestEnergy(parentId, source, +slotId);
    }

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NOWORK;
        }

        if (creep.getActiveBodyparts(WORK) == 0)
        {
            return ERR_CANNOT_PERFORM_WORK;
        }

        let code = ERR_NOWORK;

        if (creep.carry.energy < creep.carryCapacity)
        {
            code = this.goHarvest(creep);
        }
        else
        {
            code = this.goDeposit(creep);
        }

        if (code == OK)
        {
            EnergyManager.claimSource(creep, this.source.id);
            
            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        return code;
    }

    goHarvest(creep: Creep): number
    {
        let harvestCode = creep.harvest(this.source);
        if (harvestCode == OK)
        {
            return OK;
        }

        if (harvestCode == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, this.source);
        }
        else if (harvestCode == ERR_NO_PATH ||
            harvestCode == ERR_NO_BODYPART ||
            harvestCode == ERR_BUSY ||
            harvestCode == ERR_NOT_OWNER)
        {
            return ERR_CANNOT_PERFORM_WORK;
        }

        //harvestCode == ERR_NOT_FOUND ||
        //harvestCode == ERR_NOT_ENOUGH_RESOURCES ||
        //harvestCode == ERR_INVALID_TARGET
        return ERR_NOWORK
    }

    goDeposit(creep: Creep): number
    {
        var target = creep.pos.findClosestByRange<Structure>(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_CONTAINER ||
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
            }
        });

        let code = creep.transfer(target, RESOURCE_ENERGY);
        if (code == ERR_NOT_IN_RANGE)
        {
            return this.goMoveTo(creep, target);
        }

        // @todo handle the scenario where there is no place to put the energy we collected
        return OK;
    }
}