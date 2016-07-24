/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, ERR_NOWORK} from './task';
import {ENERGYLOCATION} from "./energyManager";

export class TransferResource extends Task
{
    scheduledTransfer: number = 0;

    constructor(parentId: string,
                public target: Creep | Spawn | Structure,
                public resourceType: string,
                public locations: ENERGYLOCATION[])
    {
        super(((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "Transfer:" + resourceType + ((locations == null || locations.length == 0) ? "" : "," + locations.join()) + "[" + target.id + "]", false);
    }

    static deserialize(input: string): TransferResource
    {
        let parentId = "";
        let parentSplitIndex = input.lastIndexOf(">");

        if (parentSplitIndex >= 0)
        {
            parentId = input.substring(0, parentSplitIndex);
        }

        let startingBraceIndex = input.lastIndexOf("[");
        let targetId = input.substring(startingBraceIndex, input.length - 1);

        let colonIndex = input.lastIndexOf(":");
        let argsString = input.substring(colonIndex, startingBraceIndex);
        let args: any[] = argsString.split(",");

        let target = Game.getObjectById<Creep | Structure>(targetId);

        if (target == null)
        {
            return null;
        }

        let resourceType = <string>args.shift();
        let locations: ENERGYLOCATION[] = null;

        if (args.length > 1)
        {
            args.splice(0, 1);
            for(var i=args.length; i--;) locations.unshift(<ENERGYLOCATION>(args[i]|0));
        }

        return new TransferResource(parentId, target, resourceType, locations);
    }

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers == 0)
        {
            return ERR_NOWORK;
        }

        let hasWork = true;

        if ((<Spawn>this.target).energyCapacity != null)
        {
            let spawn = <Spawn>this.target;
            if (spawn.energy == spawn.energyCapacity || this.scheduledTransfer >= spawn.energyCapacity)
            {
                hasWork = false;
            }
        }
        else if ((<StructureStorage>this.target).storeCapacity != null)
        {
            let structure = <StructureStorage>this.target;
            if (structure.store[RESOURCE_ENERGY] == structure.storeCapacity || this.scheduledTransfer >= structure.storeCapacity)
            {
                hasWork = false;
            }
        }
        else if ((<Creep>this.target).carryCapacity != null)
        {
            let creepTarget = <Creep>this.target;
            if (creepTarget.carry[RESOURCE_ENERGY] == creepTarget.carryCapacity || this.scheduledTransfer >= creepTarget.carryCapacity)
            {
                hasWork = false;
            }
        }

        if (!hasWork)
        {
            return ERR_NOWORK;
        }

        let code: number;

        if (creep.carry.energy == creep.carryCapacity)
        {
            code = this.goTransfer(creep, this.resourceType, this.target);
        }
        else
        {
            code = this.goCollect(creep, this.locations);

            if (code == OK && creep.carry.energy > 0 && creep.pos.isNearTo(this.target))
            {
                code = this.goTransfer(creep, this.resourceType, this.target);
            }
        }

        if (code == OK)
        {
            this.scheduledTransfer += creep.carryCapacity;
        }

        return code;
    }
}