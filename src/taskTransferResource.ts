import {Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, LaborDemandType, NO_MORE_WORK} from './task';
import Dictionary = _.Dictionary;
import {RoomObjectLike, ScreepsPtr, EnergyContainerLike, StoreContainerLike, CarryContainerLike} from "./screepsPtr";
import {ACTION_COLLECT, ACTION_TRANSFER, SporeCreep, CREEP_TYPE} from "./sporeCreep";
import {BodyDefinition} from "./bodyDefinition";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";

export class TransferResource extends Task
{
    scheduledTransfer: number = 0;
    scheduledCarry: number = 0;
    reserveWorkers: boolean = false;

    idealCreepBody: BodyDefinition = CREEP_TYPE.COURIER;

    private resourcesNeeded = -1;
    private needsResources: any[] = [];
    private resourceCapacity = -1;

    constructor(public targets: ScreepsPtr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>[],
                public resourceType: string,
                public source: ScreepsPtr<Source>,
                public storePriorities: string[][])
    {
        super(false);

        this.id = "Transfer:" + resourceType + " " + targets.map(function(t) { return t.id;}).join(',');

        let room = null;
        if (source != null)
        {
            this.id += " " + source;
            this.roomName = source.pos.roomName;
            room = source.room;
        }
        else
        {
            this.id += ' ';
            for (let index = 0; index < (<any[]>storePriorities).length; index++)
            {
                this.id += storePriorities[index].join(',');
            }

            this.roomName = targets[0].pos.roomName;
            room = targets[0].room;
        }

        this.name = "Transfer " + resourceType + " to " + targets.length + " objects";
        this.near = source;

        this.calculateRequirements();

        if (room != null &&
            room.economy != null &&
            room.economy.resources != null &&
            room.economy.resources[RESOURCE_ENERGY] > 0)
        {
            this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ carry: Math.floor((Math.min(this.resourceCapacity, 1200) / CARRY_CAPACITY) * 0.8) }, 1, 3);
        }
    }

    calculateRequirements(): void
    {
        this.needsResources.length = 0;
        this.resourcesNeeded = -1;
        this.resourceCapacity = -1;

        for (let index = 0; index < this.targets.length; index++)
        {
            let target = this.targets[index];

            if (!target.isValid)
            {
                continue;
            }

            if (target.isShrouded)
            {
                this.needsResources.push(this.targets[index]);
                continue;
            }

            if ((<EnergyContainerLike><any>target.instance).energyCapacity != null && this.resourceType === RESOURCE_ENERGY)
            {
                let energyContainer = <EnergyContainerLike><any>target.instance;
                let remainingStore = energyContainer.energyCapacityRemaining;
                this.resourceCapacity += energyContainer.energyCapacity;

                if (remainingStore > 0)
                {
                    this.needsResources.push(target);
                    this.resourcesNeeded += remainingStore;
                }
            }
            else if ((<StoreContainerLike><any>target.instance).storeCapacity != null)
            {
                let storeContainer = <StoreContainerLike><any>target.instance;
                let remainingStore = storeContainer.storeCapacityRemaining;

                if (storeContainer instanceof StructureStorage)
                {
                    this.resourceCapacity += 300000;
                }
                else
                {
                    this.resourceCapacity += (remainingStore + storeContainer.store[this.resourceType]);
                }

                if (remainingStore > 0)
                {
                    this.needsResources.push(target);
                    this.resourcesNeeded += remainingStore;
                }
            }
            else if ((<CarryContainerLike><any>target.instance).carryCapacity != null)
            {
                let carryContainer = <CarryContainerLike><any>target.instance;
                let remainingStore = carryContainer.carryCapacityRemaining;
                this.resourceCapacity += (remainingStore + carryContainer.carry[this.resourceType]);

                if (remainingStore > 0)
                {
                    this.needsResources.push(target);
                    this.resourcesNeeded += remainingStore;
                }
            }
            else
            {
                console.log("UNKNOWN TransferResource Target Type");
            }
        }
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        if (request.replacingCreep != null)
        {
            return super.createBasicAppointment(spawn, request, request.replacingCreep);
        }

        if (this.source != null)
        {
            return super.createBasicAppointment(spawn, request, this.source);
        }

        return super.createBasicAppointment(spawn, request, this.targets[0]);
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            if (object.carryCount === object.carryCapacity && object.carry[this.resourceType] === 0)
            {
                return 0;
            }

            return super.basicPrioritizeCreep(object, this.source, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.scheduledTransfer = 0;
        this.scheduledCarry = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        let room = null;
        if (this.source != null)
        {
            room = this.source.room;
        }
        else
        {
            room = this.targets[0].room;
        }

        if (this.possibleWorkers === 0)
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to transfer resources with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let creep = <Creep>object;

        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
        {
            creep.goMoveTo(creep.spawnRequest.replacingCreep);
            return OK;
        }

        //if (this.resourcesNeeded === 0 || this.resourcesNeeded < this.scheduledTransfer || this.needsResources.length === 0)
        let maxCarryReached = false;
        if (this.labor.types[this.idealCreepBody.name] != null)
        {
            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
            maxCarryReached = this.scheduledCarry >= this.labor.types[this.idealCreepBody.name].parts[CARRY];
        }

        if (this.scheduledTransfer >= this.resourceCapacity || maxCarryReached)
        {
            // console.log(creep + " resourcesNeeded: " + this.resourcesNeeded + " scheduledTransfer: " + this.scheduledTransfer + " needsResources: " + this.needsResources.length);
            return ERR_NO_WORK;
        }

        if (creep.type === CREEP_TYPE.MINER.name && this.scheduledTransfer > 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let remainingNeededResources = Math.max(0, this.resourcesNeeded - this.scheduledTransfer);
        let code: number;

        if (this.resourcesNeeded <= 0)
        {
            if (creep.carryCount < creep.carryCapacity)
            {
                code = this.scheduleCollect(creep, creep.carryCapacityRemaining, this.needsResources);
            }
            else
            {
                code = this.scheduleTransfer(creep, this.needsResources);

                if (code === ERR_NO_WORK)
                {
                    code = creep.goMoveTo(this.targets[0]);
                }
            }
        }
        else if (creep.action === ACTION_COLLECT && creep.carryCount < creep.carryCapacity)
        {
            code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);

            if (code === ERR_NO_WORK && creep.carry[this.resourceType] > 0)
            {
                code = this.scheduleTransfer(creep, this.needsResources);
            }
        }
        else if (creep.carry[this.resourceType] > 0)
        {
            if (creep.carryCount === creep.carryCapacity ||
                creep.carry[this.resourceType] >= remainingNeededResources ||
                (creep.action === ACTION_TRANSFER && creep.carry[this.resourceType] > 0))
            {
                code = this.scheduleTransfer(creep, this.needsResources);
            }
            else
            {
                let inRangeTarget = <any>creep.pos.findFirstInRange(this.needsResources, 4);

                if (inRangeTarget != null)
                {
                    code = creep.goTransfer(this.resourceType, inRangeTarget);
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

        if (this.reserveWorkers && creep.type === this.idealCreepBody.name)
        {
            code = OK;
        }

        if (code === OK && creep.spawnRequest == null)
        {
            let compatibleTransfer = creep.carryCapacityRemaining + creep.carry[this.resourceType];

            this.scheduledTransfer += compatibleTransfer;
            this.scheduledCarry += Math.floor((creep.carryCapacity / compatibleTransfer) / CARRY_CAPACITY);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (this.possibleWorkers === 0 || this.scheduledTransfer >= this.resourceCapacity || maxCarryReached)
        {
            return NO_MORE_WORK;
        }

        return code;
    }

    scheduleTransfer(creep: Creep, needsResources: any[]): number
    {
        let code: number = ERR_NO_WORK;
        let closestTarget = creep.pos.findClosestByRange<any>(needsResources);

        if (closestTarget != null)
        {
            code = creep.goTransfer(this.resourceType, closestTarget);
        }
        else if (needsResources.length > 0)
        {
            code = creep.goTransfer(this.resourceType, needsResources[0]);
        }
        else if (this.targets.length > 0)
        {
            code = creep.goTransfer(this.resourceType, this.targets[0]);
        }

        return code;
    }

    scheduleCollect(creep: Creep, remainingNeededResources: number, needsResources: any[]): number
    {
        let code: number;

        if (this.source != null)
        {
            code = creep.goHarvest(this.source);
        }
        else
        {
            let amount = Math.min(creep.carryCapacityRemaining, remainingNeededResources);
            code = creep.goCollect(
                this.resourceType,
                amount,
                amount,
                false,
                ((needsResources.length > 0) ? needsResources[0].pos : creep.pos),
                this.storePriorities,
                (<any>_).indexBy(this.targets, 'id'));

            if (code === ERR_NO_WORK)
            {
                if (creep.carry[this.resourceType] > 0)
                {
                    code = this.scheduleTransfer(creep, needsResources);
                }
                else
                {
                    code = creep.goCollect(
                        this.resourceType,
                        amount,
                        0,
                        false,
                        ((needsResources.length > 0) ? needsResources[0].pos : creep.pos),
                        this.storePriorities,
                        (<any>_).indexBy(this.targets, 'id'));
                }
            }
        }

        return code;
    }

    endScheduling(): void
    {

    }
}