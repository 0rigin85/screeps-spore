/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {RoomObjectLike} from "./screepsPtr";
import {BodyDefinition} from "./bodyDefinition";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import Dictionary = _.Dictionary;

export const enum TaskPriority
{
    Mandatory = 1000,

    High = 100,
    MediumHigh = 75,
    Medium = 50,
    MediumLow = 25,
    Low = 0,
    None = -1,

    ExtraDemandBoost = 10,
}

export var NO_MORE_WORK: number = 123;
export var ERR_NO_WORK: number = -400;
export var ERR_CANNOT_PERFORM_TASK: number = -401;
export var ERR_SKIP_WORKER: number = -402;

export class LaborDemandType
{
    constructor(
        public parts: { [name: string]: number },
        public min: number,
        public max: number)
    {
        for (let name in BODYPART_COST)
        {
            if (parts[name] == null)
            {
                parts[name] = 0;
            }
        }
    }
}

export class LaborDemand
{
    types: Dictionary<LaborDemandType> = {};
}

export class Task
{
    id: string = "UNKNOWN";
    name: string;
    possibleWorkers: number = -1; //defaults to infinite
    priority: number = 50;
    roomName: string;
    labor: LaborDemand = new LaborDemand();
    near: RoomObjectLike = null;

    constructor(public isComplex: boolean)
    { }

    getSteps(): Task[]
    {
        return [];
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        return null;
    }

    protected createBasicAppointment(spawn: Spawn, request: SpawnRequest, near: RoomObjectLike): SpawnAppointment
    {
        let spawnPriority: number = -1;
        let ticksTillRequired: number = 0;
        let spawnDistanceFromNear: number = 0;

        if (near != null)
        {
            if (near.pos.x != -1 && near.pos.y != -1)
            {
                spawnDistanceFromNear = (new RoomPosition(spawn.pos.x, spawn.pos.y - 1, spawn.pos.roomName)).findDistanceByPathTo(near, { ignoreCreeps: true });
            }
            else
            {
                spawnDistanceFromNear = Game.map.getRoomLinearDistance(spawn.pos.roomName, near.pos.roomName) * 50;
            }
        }

        if (spawnDistanceFromNear < 250)
        {
            spawnPriority = 1 - (spawnDistanceFromNear / 250);
        }

        let creep = request.replacingCreep;

        if (creep != null)
        {
            let body = spawn.getBody(request.creepBody);
            let moveTotal = 0;

            for(let part of body)
            {
                if (part === MOVE)
                {
                    moveTotal++;
                }
            }

            let moveRate = Math.max(1, (body.length - moveTotal) / moveTotal);

            //console.log(creep + ' ' + creep.ticksToLive + ' - ((' + spawnDistanceFromNear + ' * ' + moveRate + ') + (' + spawn.getBody(request.creepBody).length + ' * ' + CREEP_SPAWN_TIME + '))');
            ticksTillRequired = Math.ceil(Math.max(0, creep.ticksToLive - ((spawnDistanceFromNear * moveRate) + (body.length * CREEP_SPAWN_TIME))));
        }

        return new SpawnAppointment(
            request.id,
            request.task,
            spawnPriority,
            spawn,
            ticksTillRequired,
            request.replacingCreep,
            request.creepBody
        );
    }

    shouldPlanToReplace(object: RoomObjectLike): boolean
    {
        return true;
    }

    protected getBasicPrioritizingConditions(conditions: Array<any>, near: RoomObjectLike, idealBody: BodyDefinition) : void
    {
        conditions.push((creep:Creep) =>
        {
            // 1 - 40
            let efficiency = creep.getEfficiencyAs(idealBody);

            if (efficiency === 0)
            {
                return -1;
            }

            return (creep.type === idealBody.name) ? 0.4 + (efficiency * 0.2) : (efficiency * 0.2)
        });

        conditions.push((creep:Creep) =>
        {
            let objectPriority = 0;

            // 41 - 60
            if (near != null && creep.pos.roomName == near.pos.roomName)
            {
                objectPriority += 0.2;
            }
            else if (creep.task == null)
            {
                objectPriority = 0.1;
            }

            return objectPriority;
        });

        if (near != null)
        {
            conditions.push((creep:Creep) =>
            {
                return 300 - creep.pos.findDistanceByPathTo(near);
            });
        }
    }

    getPrioritizingConditions(conditions: Array<any>): void
    {

    }

    isIdeal(object: RoomObjectLike): boolean
    {
        return false;
    }

    beginScheduling(): void
    {

    }

    schedule(object: RoomObjectLike): number
    {
        return ERR_NO_WORK;
    }

    endScheduling(): void
    {

    }
}