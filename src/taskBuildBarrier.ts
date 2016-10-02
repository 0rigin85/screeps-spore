import {Task, ERR_NO_WORK, TaskPriority, LaborDemandType, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK} from './task';
import Dictionary = _.Dictionary;
import {SporeCreep, ACTION_BUILD, CREEP_TYPE, ACTION_REPAIR, ACTION_MOVE} from "./sporeCreep";
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import {BodyDefinition} from "./bodyDefinition";

export class BuildBarrier extends Task
{
    idealCreepBody: BodyDefinition;
    scheduledWorkers: number = 0;
    scheduledCarry: number = 0;

    direRampartHits: number = RAMPART_DECAY_AMOUNT * 10;
    averageHits: number = 0;
    averageDelta: number = 1000;
    requiredCarryPerBarrier: number = 0.20;

    constructor(public barriers: ScreepsPtr<ConstructionSite | StructureWall | StructureRampart>[])
    {
        super(false);

        this.id = 'Reinforce barriers';
        this.name = 'Reinforce barriers';
        this.possibleWorkers = -1;
        this.priority = TaskPriority.Medium;
        this.idealCreepBody = CREEP_TYPE.CITIZEN;

        let totalHits = 0;
        let total = 0;
        for (let barrier of barriers)
        {
            if (barrier.isValid && !barrier.isShrouded && barrier.lookType === LOOK_STRUCTURES)
            {
                total++;
                totalHits += (<Structure><any>barrier.instance).hits;
            }
        }

        this.averageHits = totalHits / total;

        this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ carry: Math.floor(this.requiredCarryPerBarrier * this.barriers.length) }, 1, 10);
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

            let aIsDireRampart = aIsRampart && !aIsShrouded && (<Structure><any>a.instance).hits < this.direRampartHits;
            let bIsDireRampart = bIsRampart && !bIsShrouded && (<Structure><any>b.instance).hits < this.direRampartHits;

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

            let ideal = this.averageHits + this.averageDelta;
            let aIsIdeal = aHits >= ideal;
            let bIsIdeal = bHits >= ideal;

            if (aIsIdeal && bIsIdeal)
            {
                return this.comparePosition(a, b);
            }

            if (!aIsIdeal && bIsIdeal)
            {
                return -1;
            }

            if (aIsIdeal && !bIsIdeal)
            {
                return 1;
            }

            if (aHits < bHits)
            {
                return -1;
            }

            if (aHits > bHits)
            {
                return 1;
            }

            return this.comparePosition(a, b);
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
        this.scheduledWorkers = 0;
        this.scheduledCarry = 0;
    }

    hasWork(): boolean
    {
        if (this.possibleWorkers === 0)
        {
            return false;
        }

        if (this.labor.types[this.idealCreepBody.name] != null)
        {
            if (this.scheduledCarry >= this.labor.types[this.idealCreepBody.name].parts[CARRY] ||
                this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max)
            {
                return false;
            }
        }

        return true;
    }

    schedule(object: RoomObjectLike): number
    {
        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to reinforce barriers with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let nextBarrier = 0;//Math.min(this.workers, this.barriers.length);
        let creep = <Creep>object;
        let code;

        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
        {
            creep.goMoveTo(creep.spawnRequest.replacingCreep);
            return OK;
        }

        if (!this.hasWork())
        {
            return ERR_NO_WORK;
        }

        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
            ((creep.action === ACTION_BUILD || creep.action === ACTION_REPAIR || creep.action === ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0))
        {
            code = this.goReinforce(creep, nextBarrier);
        }
        else
        {
            let amount = creep.carryCapacityRemaining;

            code = creep.goCollect(
                RESOURCE_ENERGY,
                amount,
                amount,
                false,
                this.barriers[nextBarrier].pos,
                [['near_dropped'], ['link','container','storage'], ['dropped']],
                {});

            if (code === ERR_NO_WORK)
            {
                if (creep.carry[RESOURCE_ENERGY] > 0)
                {
                    code = this.goReinforce(creep, nextBarrier);
                }
                else
                {
                    code = creep.goCollect(
                        RESOURCE_ENERGY,
                        amount,
                        0,
                        false,
                        this.barriers[nextBarrier].pos,
                        [['near_dropped'], ['link','container','storage'], ['dropped']],
                        {});
                }
            }
        }

        if (code === OK)
        {
            this.scheduledWorkers++;
            this.scheduledCarry += creep.getActiveBodyparts(CARRY);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (!this.hasWork())
        {
            return NO_MORE_WORK;
        }

        return code;
    }

    private goReinforce(creep: Creep, barrierIndex: number) : number
    {
        let code;

        if (this.barriers[barrierIndex].lookType === LOOK_CONSTRUCTION_SITES)
        {
            code = creep.goBuild(<ScreepsPtr<ConstructionSite>>this.barriers[barrierIndex]);
        }
        else
        {
            code = creep.goRepair(<ScreepsPtr<Structure>><any>this.barriers[barrierIndex]);
        }

        return code;
    }

    endScheduling(): void
    {

    }
}