import {Task, ERR_NO_WORK, TaskPriority, LaborDemandType} from './task';
import Dictionary = _.Dictionary;
import {SporeCreep, ACTION_BUILD, CREEP_TYPE, ACTION_REPAIR, ACTION_MOVE} from "./sporeCreep";
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import {BodyDefinition} from "./bodyDefinition";

export class BuildBarrier extends Task
{
    idealCreepBody: BodyDefinition;
    minimumRampartHits: number = RAMPART_DECAY_AMOUNT * 10;
    requiredCarryPerBarrier: number = 0.25;
    scheduledCarry: number = 0;

    constructor(public barriers: ScreepsPtr<ConstructionSite | StructureWall | StructureRampart>[])
    {
        super(false);

        this.id = 'Reinforce barriers';
        this.name = 'Reinforce barriers';
        this.possibleWorkers = -1;
        this.priority = TaskPriority.Medium;
        this.idealCreepBody = CREEP_TYPE.CITIZEN;

        this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ carry: Math.floor((this.requiredCarryPerBarrier * this.barriers.length) / CARRY_CAPACITY) }, 1, 10);
    }

    sortBarriers(): void
    {
        this.barriers.sort(function (a, b)
        {
            let aIsRampart = a.lookTypeModifier === STRUCTURE_RAMPART;
            let bIsRampart = b.lookTypeModifier === STRUCTURE_RAMPART;

            let aIsStructure = a.lookType === LOOK_STRUCTURES;
            let bIsStructure = b.lookType === LOOK_STRUCTURES;

            let aIsShrouded = a.isShrouded;
            let bIsShrouded = b.isShrouded;

            let aIsDireRampart = aIsRampart && !aIsShrouded && (<Structure><any>a.instance).hits < this.minimumRampartHits;
            let bIsDireRampart = bIsRampart && !bIsShrouded && (<Structure><any>b.instance).hits < this.minimumRampartHits;

            if (aIsDireRampart && bIsDireRampart)
            {
                let aHits = (<Structure><any>a.instance).hits;
                let bHits = (<Structure><any>b.instance).hits;

                if (aHits === bHits)
                {
                    return this.comparePosition(a, b);
                }

                if (aHits < bHits)
                {
                    return -1;
                }

                return 1;
            }

            if (aIsDireRampart && !bIsDireRampart)
            {
                return -1;
            }

            if (!aIsDireRampart && bIsDireRampart)
            {
                return 1;
            }

            if (!aIsStructure && !bIsStructure)
            {
                return this.comparePosition(a, b);
            }

            if (aIsStructure && !bIsStructure)
            {
                return 1;
            }

            if (!aIsStructure && bIsStructure)
            {
                return -1;
            }

            if (aIsShrouded && bIsShrouded)
            {
                return this.comparePosition(a, b);
            }

            if (!aIsShrouded && bIsShrouded)
            {
                return -1;
            }

            if (aIsShrouded && !bIsShrouded)
            {
                return 1;
            }

            let aHits = (<Structure><any>a.instance).hits;
            let bHits = (<Structure><any>b.instance).hits;

            if (aHits === bHits)
            {
                return this.comparePosition(a, b);
            }

            if (aHits < bHits)
            {
                return -1;
            }

            return 1;
        }.bind(this));

        // for (let ptr of this.barriers)
        // {
        //     console.log(ptr);
        // }
    }

    comparePosition(a: RoomObjectLike, b: RoomObjectLike): number
    {
        if (a.pos.x === b.pos.x)
        {
            if (a.pos.y === b.pos.y)
            {
                return 0;
            }

            if (a.pos.y < b.pos.y)
            {
                return -1;
            }

            return 1;
        }

        if (a.pos.x < b.pos.x)
        {
            return -1;
        }

        return 1;
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        if (request.replacingCreep != null)
        {
            return super.createBasicAppointment(spawn, request, request.replacingCreep);
        }

        return super.createBasicAppointment(spawn, request, { pos: new RoomPosition(25, 25, this.roomName), room: Game.rooms[this.roomName] });
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0)
            {
                return 0;
            }

            return super.basicPrioritizeCreep(object, { pos: new RoomPosition(25, 25, this.roomName), room: Game.rooms[this.roomName] }, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.sortBarriers();
        this.scheduledCarry = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (this.possibleWorkers === 0 || !(object instanceof Creep) || this.scheduledCarry >= this.requiredCarryPerBarrier * this.barriers.length)
        {
            return ERR_NO_WORK;
        }

        let creep = <Creep>object;
        let code;

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            ((creep.action === ACTION_BUILD || creep.action === ACTION_REPAIR || creep.action === ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0))
        {
            if (this.barriers[0].lookType === LOOK_CONSTRUCTION_SITES)
            {
                code = creep.goBuild(<ScreepsPtr<ConstructionSite>>this.barriers[0]);
            }
            else
            {
                code = creep.goRepair(<ScreepsPtr<Structure>><any>this.barriers[0]);
            }
        }
        else
        {
            let amount = creep.carryCapacityRemaining;

            code = creep.goCollect(
                RESOURCE_ENERGY,
                amount,
                false,
                this.barriers[0].pos,
                [['near_dropped'], ['link','container','storage'], ['dropped']]);
        }

        if (code === OK)
        {
            this.scheduledCarry += creep.getActiveBodyparts(CARRY);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        return code;
    }

    endScheduling(): void
    {

    }
}