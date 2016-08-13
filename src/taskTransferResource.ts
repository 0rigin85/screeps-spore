import {Task, ERR_NO_WORK, ACTION_COLLECT, ACTION_TRANSFER, ERR_CANNOT_PERFORM_TASK} from './task';

export class TransferResource extends Task
{
    scheduledTransfer: number = 0;

    constructor(parentId: string,
                public targets: RoomObject[],
                public resourceType: string,
                public storePriorities: string[][] | Source | RoomPosition)
    {
        super(false);

        if (parentId != null && parentId.length > 0)
        {
            this.id = parentId + ">";
        }
        else
        {
            this.id = "";
        }

        this.id += "Transfer:" + resourceType + " " + targets.map(function(t) { return t.id;}).join(',');

        if ((<Source>storePriorities).id != null)
        {
            this.id += " " + (<Source>storePriorities).pos.toString();
        }
        else if ((<RoomPosition>storePriorities).roomName != null)
        {
            this.id += " " + (<RoomPosition>storePriorities).toString();
        }
        else
        {
            for (let index = 0; index < (<any[]>storePriorities).length; index++)
            {
                this.id += storePriorities[index].join(',');
            }
        }

        this.name = "Transfer " + resourceType + " to " + targets.length + " objects";
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
        let targetIdsStr = input.substring(startingBraceIndex, input.length - 1);
        let targetIds = targetIdsStr.split(',');

        let targets;// = _.map<any>(targetIds, function(id){return Game.getObjectById(id);});

        if (targets == null || targets.length == 0)
        {
            return null;
        }

        let colonIndex = input.lastIndexOf(":");
        let argsString = input.substring(colonIndex, startingBraceIndex);
        let args: any[] = argsString.split(",");

        let resourceType = <string>args.shift();
        let storePriorities: string[][] | Source = null;
        //
        // if (args.length == 2)
        // {
        //     let source = Game.getObjectById<Source>(args[1]);
        //
        //     if (source != null)
        //     {
        //         location = source;
        //     }
        //     else
        //     {
        //         location = [];
        //         (<ENERGYLOCATION[]>location).push(args[1]);
        //     }
        // }
        // else if (args.length > 2)
        // {
        //     args.splice(0, 1);
        //     location = [];
        //     for(var i=args.length; i--;) (<ENERGYLOCATION[]>location).unshift(<ENERGYLOCATION>(args[i]|0));
        // }

        return new TransferResource(parentId, targets, resourceType, storePriorities);
    }

    private resourcesNeeded;
    private needsResources: any[];

    schedule(creep: Creep): number
    {
        if (this.possibleWorkers === 0)
        {
            return ERR_NO_WORK;
        }

        if (creep.carryCount === creep.carryCapacity && creep.carry[this.resourceType] == 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        if (this.resourcesNeeded == null)
        {
            this.resourcesNeeded = 0;
            this.needsResources = [];

            for (let index = 0; index < this.targets.length; index++)
            {
                let target = this.targets[index];

                if ((<Spawn>target).energyCapacity != null && this.resourceType === RESOURCE_ENERGY)
                {
                    let spawn = <Spawn>target;
                    let remainingStore = spawn.energyCapacityRemaining;

                    if (remainingStore > 0)
                    {
                        this.needsResources.push(spawn);
                        this.resourcesNeeded += remainingStore;
                    }
                }
                else if ((<StructureStorage>target).storeCapacity != null)
                {
                    let structure = <StructureStorage>target;
                    let remainingStore = structure.storeCapacityRemaining;

                    if (remainingStore > 0)
                    {
                        this.needsResources.push(structure);
                        this.resourcesNeeded += remainingStore;
                    }
                }
                else if ((<Creep>target).carryCapacity != null)
                {
                    let creepTarget = <Creep>target;
                    let remainingStore = creepTarget.carryCapacityRemaining;

                    if (remainingStore > 0)
                    {
                        this.needsResources.push(creepTarget);
                        this.resourcesNeeded += remainingStore;
                    }
                }
                else
                {
                    console.log("UNKNOWN TransferResource Target Type");
                }
            }
        }

        if (this.resourcesNeeded == 0 || this.resourcesNeeded < this.scheduledTransfer || this.needsResources.length == 0)
        {
            return ERR_NO_WORK;
        }

        let remainingNeededResources = this.resourcesNeeded - this.scheduledTransfer;
        let code: number;

        if (creep.action == ACTION_COLLECT && creep.carryCount < creep.carryCapacity)
        {
            code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
        }
        else if (creep.carry[this.resourceType] > 0)
        {
            if (creep.carry[this.resourceType] == creep.carryCapacity ||
                creep.carry[this.resourceType] >= remainingNeededResources ||
                (creep.action == ACTION_TRANSFER && creep.carry[this.resourceType] > 0))
            {
                let closestTarget = creep.pos.findClosestByRange<any>(this.needsResources);

                code = this.goTransfer(creep, this.resourceType, closestTarget);
            }
            else
            {
                let inRangeTarget = <any>creep.pos.findFirstInRange(this.needsResources, 4);

                if (inRangeTarget != null)
                {
                    code = this.goTransfer(creep, this.resourceType, inRangeTarget);
                }
                else
                {
                    code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
                }
            }
        }
        else
        {
            code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
        }

        if (code == OK)
        {
            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }

            this.scheduledTransfer += creep.carryCapacity;
        }

        return code;
    }

    scheduleCollect(creep: Creep, remainingNeededResources: number, needsResources: any[])
    {
        let code: number;

        if ((<Source>this.storePriorities).id != null)
        {
            code = this.goHarvest(creep, <Source>this.storePriorities);
        }
        else if ((<RoomPosition>this.storePriorities).roomName != null)
        {
            code = this.goMoveTo(creep, <RoomPosition>this.storePriorities);
        }
        else
        {
            code = this.goCollect(
                creep,
                this.resourceType,
                Math.min(creep.carryCapacityRemaining, remainingNeededResources),
                false,
                needsResources[0].pos,
                <string[][]>this.storePriorities);
        }

        return code;
    }
}