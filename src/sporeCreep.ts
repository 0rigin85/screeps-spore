///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK} from "./task";
import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {SporeColony} from "./sporeColony";
import {RoomObjectLike, ScreepsPtr, CarryContainerLike, StoreContainerLike, EnergyContainerLike} from "./screepsPtr";
import {BodyDefinition, BodyPartRequirements} from "./bodyDefinition";
import {SpawnRequest} from "./spawnRequest";
import Dictionary = _.Dictionary;
import {
    SporePathOptions, SporePath, DIRECTION_OFFSETS, SporePathFinder, SporePathMemory,
    FORWARD
} from "./sporePathFinder";
import {Remember} from "./sporeRemember";

declare global
{
    interface Creep
    {
        carryCount: number;
        task: Task;
        taskPriority: number;
        taskMetadata: any;
        action: string;
        actionTarget: string;
        claimReceipt: ClaimReceipt;
        carryCapacityRemaining: number;
        pos: RoomPosition;
        room: Room;
        type: string;
        spawnRequest: SpawnRequest;
        cost: number;

        colony: SporeColony;

        getEfficiencyAs(bodyDefinition: BodyDefinition) : number;

        goMoveTo(target: RoomObjectLike, navigation?: NavigationRules): number;
        goHarvest(source: ScreepsPtr<Source>, navigation?: NavigationRules): number;
        goTransfer(resourceType: string, target: ScreepsPtr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>, navigation?: NavigationRules): number;
        goBuild(site: ScreepsPtr<ConstructionSite>, navigation?: NavigationRules): number;
        goDismantle(structure: ScreepsPtr<Structure>, navigation?: NavigationRules): number;
        goRepair(structure: ScreepsPtr<Structure>, navigation?: NavigationRules): number;
        goCollect(resourceType: string, amount: number, minAmount: number, isExtended: boolean, near: RoomPosition, options: CollectOptions, excludes: Dictionary<Claimable>, navigation?: NavigationRules): number;
        goUpgrade(controller: ScreepsPtr<Controller>, navigation?: NavigationRules): number;
        goReserve(controller: ScreepsPtr<Controller>, navigation?: NavigationRules): number;
        goClaim(controller: ScreepsPtr<Controller>, navigation?: NavigationRules): number;
        goRecycle(spawn: ScreepsPtr<Spawn>, navigation?: NavigationRules): number;
    }
}

export class CollectOptions
{
    constructor(public roomNames: string[], public storePriorities: string[][])
    { }
}

interface NavigationRules
{
    path?: SporePath;
    direction?: number;
    range?: number;
}

interface SpawnRequestMemory
{
    id: string;
    taskId: string;
    replacingCreepName: string;
}

interface CreepMovementMemory
{
    improv: SporePathMemory;
    mergeIndex: number;

    path: SporePathMemory;
    pathIndex: number;

    expectedPosRoomName: string;
    expectedPosX: number;
    expectedPosY: number;

    failedMoveAttempts: number;
}

export interface CreepMemory
{
    type: string;
    speed: number;

    taskId: string;
    taskPriority: number;
    taskMetadata: any;
    spawnRequest: SpawnRequestMemory;
    cost: number;

    action: string;
    actionTarget: string;

    movement: CreepMovementMemory;
    bodyEfficiency: Dictionary<number>;

    claimReceiptTargetId: string;
    claimReceiptTargetType: string;
    claimReceiptResourceType: string;
    claimReceiptAmount: number;
}

export class SporeCreepMovement
{
    _improv: SporePath;
    get improv(): SporePath
    {
        if (this._improv != null)
        {
            return this._improv;
        }

        if (this.memory.improv != null)
        {
            this._improv = new SporePath(this.memory.improv);
        }

        return this._improv;
    }

    set improv(value: SporePath)
    {
        if (value == null)
        {
            if (this.memory.improv != null)
            {
                this._improv = null;
                this.memory.improv = null;
                this.mergeIndex = -1;
                this.pathIndex = -1;
                this.expectedPosition = null;
                this.failedMoveAttempts = 0;
            }
        }
        else if ((this._improv == null && value != null) || (this._improv != null && !this._improv.isEqualTo(value)))
        {
            this._improv = value;
            this.memory.improv = this._improv.serialize();
            this.mergeIndex = -1;
            this.expectedPosition = null;
            this.failedMoveAttempts = 0;
        }
    }

    get mergeIndex(): number
    {
        return this.memory.mergeIndex;
    }

    set mergeIndex(value: number)
    {
        this.memory.mergeIndex = value;
    }

    _path: SporePath;
    get path(): SporePath
    {
        if (this._path != null)
        {
            return this._path;
        }

        if (this.memory.path != null)
        {
            this._path = new SporePath(this.memory.path);
        }

        return this._path;
    }

    set path(value: SporePath)
    {
        if (value == null)
        {
            if (this.memory.path != null)
            {
                this._path = null;
                this.memory.path = null;
                this.pathIndex = -1;
                this.expectedPosition = null;
                this.failedMoveAttempts = 0;

                this.improv = null;
            }
        }
        else if ((this._path == null && value != null) || (this._path != null && !this._path.isEqualTo(value)))
        {
            this._path = value;
            this.memory.path = this._path.serialize();
            this.pathIndex = -1;
            this.expectedPosition = null;
            this.failedMoveAttempts = 0;

            this.improv = null;
        }
    }

    get pathIndex(): number
    {
        if (this.memory.pathIndex == null || (this.memory.path == null && this.memory.improv == null))
        {
            this.memory.pathIndex = -1;
        }

        return this.memory.pathIndex;
    }

    set pathIndex(value: number)
    {
        this.memory.pathIndex = value;
    }

    _expectedPosition: RoomPosition;
    get expectedPosition(): RoomPosition
    {
        if (this._expectedPosition != null)
        {
            return this._expectedPosition;
        }

        if (this.memory.expectedPosRoomName != null)
        {
            this._expectedPosition = new RoomPosition(this.memory.expectedPosX, this.memory.expectedPosY, this.memory.expectedPosRoomName);
        }

        return this._expectedPosition;
    }

    set expectedPosition(value: RoomPosition)
    {
        if (value != null)
        {
            this.memory.expectedPosRoomName = value.roomName;
            this.memory.expectedPosX = value.x;
            this.memory.expectedPosY = value.y;
        }
        else
        {
            this.memory.expectedPosRoomName = null;
            this.memory.expectedPosX = null;
            this.memory.expectedPosY = null;
        }
    }

    get failedMoveAttempts(): number
    {
        return this.memory.failedMoveAttempts;
    }

    set failedMoveAttempts(value: number)
    {
        this.memory.failedMoveAttempts = value;
    }

    constructor(private memory: CreepMovementMemory)
    { }
}

export var ACTION_TRANSFER: string = "transfer";
export var ACTION_RECYCLE: string = "recycle";
export var ACTION_COLLECT: string = "collect";
export var ACTION_UPGRADE: string = "upgrade";
export var ACTION_RESERVE: string = "reserve";
export var ACTION_CLAIM: string = "claim";
export var ACTION_BUILD: string = "build";
export var ACTION_DISMANTLE: string = "dismantle";
export var ACTION_REPAIR: string = "repair";
export var ACTION_MOVE: string = "move";

export var CREEP_TYPE: {
    [part: string]: BodyDefinition;
    MINER: BodyDefinition;
    REMOTE_MINER: BodyDefinition;
    UPGRADER: BodyDefinition;
    COURIER: BodyDefinition;
    REMOTE_COURIER: BodyDefinition;
    CITIZEN: BodyDefinition;
    MASON: BodyDefinition;
    WIRE: BodyDefinition;
    RESERVER: BodyDefinition;
    CLAIMER: BodyDefinition;
    REMOTE_DEFENDER: BodyDefinition;
} = <any>{};

var bodyDefinition = new BodyDefinition('MINER');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 5, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 1, 1, 1));
CREEP_TYPE.MINER = bodyDefinition;

var bodyDefinition = new BodyDefinition('REMOTE_MINER');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 6, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 3, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 1, 1, 1));
CREEP_TYPE.REMOTE_MINER = bodyDefinition;

var bodyDefinition = new BodyDefinition('UPGRADER');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 15, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 1, 1, 1));
CREEP_TYPE.UPGRADER = bodyDefinition;

var bodyDefinition = new BodyDefinition('COURIER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 12, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 12, 1, 1));
CREEP_TYPE.COURIER = bodyDefinition;

var bodyDefinition = new BodyDefinition('REMOTE_COURIER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 9, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 16, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 1, 1, 1));
CREEP_TYPE.REMOTE_COURIER = bodyDefinition;

var bodyDefinition = new BodyDefinition('CITIZEN');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 5, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 10, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 5, 1, 1));
CREEP_TYPE.CITIZEN = bodyDefinition;

var bodyDefinition = new BodyDefinition('MASON');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 3, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 4, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 5, 1, 1));
CREEP_TYPE.MASON = bodyDefinition;

var bodyDefinition = new BodyDefinition('WIRE');
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 6, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
CREEP_TYPE.WIRE = bodyDefinition;

var bodyDefinition = new BodyDefinition('RESERVER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 2, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CLAIM, 2, 1, 1));
CREEP_TYPE.RESERVER = bodyDefinition;

var bodyDefinition = new BodyDefinition('CLAIMER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CLAIM, 1, 1, 1));
CREEP_TYPE.CLAIMER = bodyDefinition;

var bodyDefinition = new BodyDefinition('REMOTE_DEFENDER');
bodyDefinition.requirements.push(new BodyPartRequirements(TOUGH, 2, 1, 2));
bodyDefinition.requirements.push(new BodyPartRequirements(ATTACK, 3, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(RANGED_ATTACK, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 7, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(HEAL, 1, 1, 1));
CREEP_TYPE.REMOTE_DEFENDER = bodyDefinition;

export class SporeCreep extends Creep
{
    get carryCount(): number
    {
        return _.sum(this.carry);
    }

    get carryCapacityRemaining(): number
    {
        return this.carryCapacity - this.carryCount;
    }

    private _claimReceipt: ClaimReceipt;
    get claimReceipt(): ClaimReceipt
    {
        if (this._claimReceipt != null)
        {
            return this._claimReceipt;
        }

        let memory = <CreepMemory>this.memory;

        if (memory.claimReceiptTargetId != null)
        {
            let target = Game.getObjectById<Claimable>(memory.claimReceiptTargetId);

            if (target !== null)
            {
                this._claimReceipt = new ClaimReceipt(
                    target,
                    memory.claimReceiptTargetType,
                    memory.claimReceiptResourceType,
                    memory.claimReceiptAmount);
            }

            if (this._claimReceipt == null)
            {
                delete memory.claimReceiptTargetId;
                delete memory.claimReceiptTargetType;
                delete memory.claimReceiptResourceType;
                delete memory.claimReceiptAmount;
            }
        }

        return this._claimReceipt;
    }

    set claimReceipt(value:ClaimReceipt)
    {
        this._claimReceipt = value;
        let memory = <CreepMemory>this.memory;

        if (value == null)
        {
            delete memory.claimReceiptTargetId;
            delete memory.claimReceiptTargetType;
            delete memory.claimReceiptResourceType;
            delete memory.claimReceiptAmount;
        }
        else
        {
            memory.claimReceiptTargetId = (<any>value.target).id;
            memory.claimReceiptTargetType = value.type;
            memory.claimReceiptResourceType = value.resourceType;
            memory.claimReceiptAmount = value.amount;
        }
    }

    get cost(): number
    {
        if (this.memory.cost == null)
        {
            this.memory.cost = 0;

            for (let part of this.body)
            {
                this.memory.cost += BODYPART_COST[part.type];
            }
        }

        return this.memory.cost;
    }

    set cost(value: number)
    {
        this.memory.cost = value;
    }

    getEfficiencyAs(bodyDefinition: BodyDefinition) : number
    {
        let memory = <CreepMemory>this.memory;

        if (memory.bodyEfficiency == null)
        {
            memory.bodyEfficiency = {};
        }

        let existingValue = memory.bodyEfficiency[bodyDefinition.name];
        if (existingValue != null)
        {
            return existingValue;
        }

        let totalRequiredParts = 0;
        let totalMaxRequiredParts = 0;
        let bodyPartsByType = _.groupBy(this.body, function(part: BodyPartDefinition){ return part.type; });

        for (let requirement of bodyDefinition.requirements)
        {
            let bodyParts = bodyPartsByType[requirement.type];

            if (bodyParts == null ||
                bodyParts.length < requirement.min)
            {
                memory.bodyEfficiency[bodyDefinition.name] = 0;
                return 0;
            }

            let totalActiveParts = 0;
            for (let part of bodyParts)
            {
                if (part.hits > 0)
                {
                    totalActiveParts++;

                    if (totalActiveParts >= requirement.min)
                    {
                        break;
                    }
                }
            }

            if (totalActiveParts < requirement.min)
            {
                memory.bodyEfficiency[bodyDefinition.name] = 0;
                return 0;
            }

            totalMaxRequiredParts += requirement.max;
            totalRequiredParts += Math.min(bodyParts.length, requirement.max);
        }

        let newValue = totalRequiredParts / totalMaxRequiredParts;
        memory.bodyEfficiency[bodyDefinition.name] = newValue;
        return newValue;
    }

    get type(): string
    {
        return (<CreepMemory>this.memory).type;
    }

    get speed(): number
    {
        return (<CreepMemory>this.memory).speed;
    }

    private _spawnRequest: SpawnRequest;
    get spawnRequest(): SpawnRequest
    {
        if (this._spawnRequest != null)
        {
            if (this._spawnRequest.id != null)
            {
                return this._spawnRequest;
            }

            return null;
        }

        let memory = <CreepMemory>this.memory;

        this._spawnRequest = new SpawnRequest(null, null, null, null);
        this._spawnRequest.creepBody = SporeCreep[this.type];

        if (memory.spawnRequest != null)
        {
            this._spawnRequest.id = memory.spawnRequest.id;

            if (memory.spawnRequest.taskId != null)
            {
                this._spawnRequest.task = this.colony.tasksById[memory.spawnRequest.taskId];
            }

            if (memory.spawnRequest.replacingCreepName != null)
            {
                this._spawnRequest.replacingCreep = Game.creeps[memory.spawnRequest.replacingCreepName];
            }
        }

        if (this._spawnRequest.id != null)
        {
            return this._spawnRequest;
        }

        return null;
    }

    set spawnRequest(value:SpawnRequest)
    {
        this._spawnRequest = value;

        let memory = <CreepMemory>this.memory;

        if (value == null)
        {
            delete memory.spawnRequest;
        }
        else
        {
            memory.spawnRequest.id = this._spawnRequest.id;

            if (this._spawnRequest.task != null)
            {
                memory.spawnRequest.taskId = this._spawnRequest.task.id;
            }

            if (this._spawnRequest.replacingCreep != null)
            {
                memory.spawnRequest.replacingCreepName = this._spawnRequest.replacingCreep.name;
            }
        }
    }

    private _task: Task;
    get task(): Task
    {
        if (this._task != null)
        {
            return this._task;
        }

        let memory = <CreepMemory>this.memory;

        if (memory.taskId != null)
        {
            this._task = this.colony.tasksById[memory.taskId];

            if (this._task == null)
            {
                delete memory.taskId;
                this.taskPriority = -1;
                this.taskMetadata = null;
            }
        }

        return this._task;
    }

    set task(value:Task)
    {
        this._task = value;

        let memory = <CreepMemory>this.memory;

        if (value == null)
        {
            delete memory.taskId;
            this.claimReceipt = null;
        }
        else
        {
            memory.taskId = value.id;

            let taskCreeps = Remember.forTick(`${value.id}.creeps`, () => { return []; });

            if (!_.includes(taskCreeps, this.id))
            {
                taskCreeps.push(this.id);
            }
        }
    }

    private _taskPriority: number;
    get taskPriority(): number
    {
        if (this._taskPriority != null)
        {
            return this._taskPriority;
        }

        let memory = <CreepMemory>this.memory;

        if (memory.taskPriority != null)
        {
            this._taskPriority = memory.taskPriority;
        }
        else
        {
            this._taskPriority = -1;
        }

        return this._taskPriority;
    }

    set taskPriority(value: number)
    {
        this._taskPriority = value;

        let memory = <CreepMemory>this.memory;

        if (value == null || value < 0)
        {
            delete memory.taskPriority;
            this._taskPriority = -1;
        }
        else
        {
            memory.taskPriority = value;
        }
    }

    private _taskMetadata: any;
    get taskMetadata(): any
    {
        if (this._taskMetadata !== undefined)
        {
            return this._taskMetadata;
        }

        let memory = <CreepMemory>this.memory;

        if (memory.taskMetadata != null)
        {
            this._taskMetadata = memory.taskMetadata;
        }
        else
        {
            this._taskMetadata = null;
        }

        return this._taskMetadata;
    }

    set taskMetadata(value: any)
    {
        this._taskMetadata = value;

        let memory = <CreepMemory>this.memory;

        if (value == null)
        {
            delete memory.taskMetadata;
            this._taskMetadata = null;
        }
        else
        {
            memory.taskMetadata = value;
        }
    }

    private _action: string;
    get action(): string
    {
        if (this._action != null)
        {
            return this._action;
        }

        let memory = <CreepMemory>this.memory;
        this._action = memory.action;

        return this._action;
    }

    set action(value: string)
    {
        this._action = value;
        let memory = <CreepMemory>this.memory;

        if (value == null)
        {
            delete memory.action;
        }
        else
        {
            memory.action = value;
        }
    }

    private _actionTarget: string;
    get actionTarget(): string
    {
        if (this._actionTarget != null)
        {
            return this._actionTarget;
        }

        let memory = <CreepMemory>this.memory;

        if ((<any>memory).actionTargetId != null)
        {
            delete (<any>memory).actionTargetId;
        }

        this._actionTarget = memory.actionTarget;

        if (this._actionTarget == null)
        {
            this._actionTarget = '';
            delete memory.actionTarget;
        }

        return this._actionTarget;
    }

    set actionTarget(value: string)
    {
        this._actionTarget = value;
        let memory = <CreepMemory>this.memory;

        if (value == null || value.length === 0)
        {
            delete memory.actionTarget;
        }
        else
        {
            memory.actionTarget = value;
        }
    }

    _movement: SporeCreepMovement;
    get movement(): SporeCreepMovement
    {
        return Remember.byName(`creep.${this.id}`, `movement`, () =>
        {
            let memory = <CreepMemory>this.memory;

            if (memory.movement == null)
            {
                memory.movement = <any>{ };
            }

            this._movement = new SporeCreepMovement(memory.movement);
            return this._movement;
        });
    }

    goMoveTo(target: RoomObjectLike | RoomPosition, navigation?: NavigationRules): number
    {
        // if this creep can't move right now then just early out
        if (this.fatigue > 0)
        {
            this.action = ACTION_MOVE;
            this.actionTarget = target.toString();
            return OK;
        }

        let destination: RoomPosition = <RoomPosition>target;

        if ((<RoomObjectLike>target).pos != null)
        {
            destination = (<RoomObjectLike>target).pos;
        }

        // if an invalid destination was provided then error out
        if (destination == null)
        {
            return ERR_NO_WORK;
        }

        if (navigation == null)
        {
            navigation = {};
        }

        // default to a range of 1 if it wasn't specified
        if (navigation.range == null)
        {
            navigation.range = 1;
        }

        // default to a direction of FORWARD if it wasn't specified
        if (navigation.direction == null)
        {
            navigation.direction = FORWARD;
        }

        // check to see if the creep is already in range of the target
        if (this.pos.inRangeTo(destination, navigation.range))
        {
            this.action = ACTION_MOVE;
            this.actionTarget = target.toString();
            return OK;
        }

        if (navigation.path != null)
        {
            // setting a different path will also invalidate any current improv path
            // but no changes will occur if the path is identical
            this.movement.path = navigation.path;
        }
        else
        {
            // clear out any previous explicit path
            this.movement.path = null;
        }

        let currentPath = this.movement.improv;
        if (currentPath == null)
        {
            currentPath = this.movement.path;
        }

        // if the current paths don't lead to the destination...
        if (currentPath != null && !currentPath.leadsTo(destination, navigation.direction, navigation.range))
        {
            // then clear them so we can get new ones
            this.movement.path = null;
            this.movement.improv = null;

            // if an explicit path had been provided...
            if (navigation.path != null)
            {
                // then they've provided the wrong path
                console.log("ERROR: Attempted to move to '" + target + "' but provided an explicit path to a different location. ");
                return ERR_CANNOT_PERFORM_TASK;
            }
        }

        // if the creep is not on a valid path to the destination...
        if (this.movement.pathIndex === -1)
        {
            // if we've already spent all our path finding CPU...
            if (this.colony.cpuSpentPathing > this.colony.pathingCpuLimit)
            {
                // then early out
                this.action = ACTION_MOVE;
                this.actionTarget = target.toString();
                return OK;
            }

            // create a new path to the destination
            if (this.movement.path != null)
            {
                // since the creep is not on the explicit path we need to create an improv path to get it there
                let position: RoomPosition = this.movement.path.findLastPositionInRoom(this.pos.roomName, navigation.direction);
                let explicitPathPositions = this.movement.path.getPositions(this.pos.roomName);

                let options = new SporePathOptions([]);
                let creepCost = 4;

                if (this.speed >= 5)
                {
                    // this creep moves full speed on swamp
                    options.plainCost = 2;
                    options.swampCost = 2;
                    options.costs.push({ id: 'path', cost: 1, targets: explicitPathPositions });
                }
                else if (this.speed >= 1)
                {
                    // this creep moves full speed off-road
                    options.plainCost = 2;
                    options.swampCost = 10;
                    creepCost = 20;
                    options.costs.push({ id: 'path', cost: 1, targets: explicitPathPositions });
                }
                else
                {
                    // this creep moves slowly off-road
                    options.plainCost = 4;
                    options.swampCost = 20;
                    creepCost = 40;

                    options.costs.push({ id: 'path', cost: 1, targets: explicitPathPositions });
                    options.costs.push({ id: 'roads', cost: 2 });
                }

                options.costs.push({ id: 'creeps', cost: creepCost });
                options.costs.push({ id: 'nonwalkableStructures', cost: 255 });
                options.costs.push({ id: 'allySites', cost: 255 });
                this.movement.improv = this.colony.pathFinder.findPathTo(this.pos, { pos: position, range: 0 }, options);

                if (this.movement.improv != null)
                {
                    // crop the improv path to where it first merges with the ideal path
                    let intersection = this.movement.path.findIntersectionWith(this.movement.improv);
                    if (intersection != null)
                    {
                        this.movement.improv.setIndexAsDestination(intersection.otherIndex);
                        this.movement.mergeIndex = intersection.baseIndex;
                        this.movement.pathIndex = 0;
                    }
                }
            }
            else
            {
                let options = new SporePathOptions([]);
                let creepCost = 4;

                if (this.speed >= 5)
                {
                    // this creep moves full speed on swamp
                    options.plainCost = 1;
                    options.swampCost = 1;
                    creepCost = 2;
                }
                else if (this.speed >= 1)
                {
                    // this creep moves full speed off-road
                    //options.plainCost = 1;
                    //options.swampCost = 5;
                    creepCost = 10;
                }
                else
                {
                    // this creep moves slowly off-road
                    options.plainCost = 2;
                    options.swampCost = 10;
                    creepCost = 20;
                    options.costs.push({ id: 'roads', cost: 1 });
                }

                options.costs.push({ id: 'creeps', cost: creepCost });
                options.costs.push({ id: 'nonwalkableStructures', cost: 255 });
                options.costs.push({ id: 'allySites', cost: 255 });
                this.movement.improv = this.colony.pathFinder.findPathTo(this.pos, { pos: destination, range: navigation.range }, options);
                this.movement.pathIndex = 0;
            }

            this.room.visual.text('\u{1F463}', this.pos);
        }

        currentPath = this.movement.improv;
        if (currentPath == null)
        {
            currentPath = this.movement.path;
        }

        // if we still don't have a valid path at this point then the destination must be unreachable
        if (currentPath == null)
        {
            //@todo check for incomplete paths?
            return ERR_NO_WORK;
        }

        // check whether the last requested move was successful
        if (this.movement.expectedPosition != null)
        {
            if (this.movement.expectedPosition.isEqualTo(this.pos))
            {
                this.movement.expectedPosition = null;
                this.movement.pathIndex++;
                this.movement.failedMoveAttempts = 0;
            }
            else
            {
                this.movement.expectedPosition = null;
                this.movement.failedMoveAttempts++;
            }
        }

        let visualXOffset = 0.01;
        let visualYOffset = 0.18;
        let style: Style = { size: 0.45 };

        if (this.movement.failedMoveAttempts > 0)
        {
            if (this.movement.failedMoveAttempts === 1)
            {
                let structures = this.room.lookForAt<Structure>(LOOK_STRUCTURES, this.movement.expectedPosition);
                for (let structure of structures)
                {
                    if (_.includes(OBSTACLE_OBJECT_TYPES, structure.structureType))
                    {
                        if (this.movement.path != null)
                        {
                            this.movement.path.needsUpdated = true;
                        }

                        console.log('/////////////// UNEXPECTED STRUCTURE IN PATH: ' + this.movement.improv);
                        this.movement.improv = null;
                        this.room.visual.text('\u{1F632}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
                        console.log('/////////////// UNEXPECTED STRUCTURE IN PATH: ' + structure);

                        this.action = ACTION_MOVE;
                        this.actionTarget = target.toString();

                        return OK;
                    }
                }

                this.room.visual.text('\u{1F612}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
            }
            else if (this.movement.failedMoveAttempts === 2)
            {
                this.room.visual.text('\u{1F612}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
            }
            else if (this.movement.failedMoveAttempts === 3)
            {
                this.room.visual.text('\u{1F623}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
            }
            else if (this.movement.failedMoveAttempts === 4)
            {
                this.room.visual.text('\u{1F620}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
            }
            else if (this.movement.failedMoveAttempts >= 5)
            {
                if (this.movement.path != null)
                {
                    this.movement.path.needsUpdated = true;
                }

                this.movement.improv = null;
                this.room.visual.text('\u{1F621}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);

                this.action = ACTION_MOVE;
                this.actionTarget = target.toString();

                return OK;
            }
        }

        let nextDirection = currentPath.getNextMove(this.movement.pathIndex);

        if (nextDirection <= 0)
        {
            if (this.movement.improv != null && this.movement.mergeIndex >= 0)
            {
                this.movement.improv = null;
                this.movement.pathIndex = this.movement.mergeIndex;
                this.movement.mergeIndex = -1;
            }
            else
            {
                if (this.movement.path != null)
                {
                    this.movement.path.needsUpdated = true;
                }

                this.movement.improv = null;
                console.log("ERROR: Attempted to move to '" + target + "' but encountered an unexpected end to that path. ");
                return ERR_CANNOT_PERFORM_TASK;
            }
        }

        let code = this.move(nextDirection);

        if (this.doTrack)
        {
            console.log(this + " goMoveTo " + code);
        }

        if (code == OK)
        {
            this.movement.expectedPosition = SporePathFinder.getNextPositionByDirection(this.pos, nextDirection);

            this.action = ACTION_MOVE;
            this.actionTarget = target.toString();
            return OK;
        }

        this.movement.expectedPosition = null;

        if (code == ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        // ERR_NOT_OWNER	-1	You are not the owner of this creep.
        // ERR_BUSY	-4	The creep is still being spawned.
        // ERR_NO_BODYPART	-12	There are no MOVE body parts in this creep’s body.
        console.log("ERROR: Attempted to move to '" + target + "' but encountered unknown error. " + code);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goHarvest(source: ScreepsPtr<Source>, navigation?: NavigationRules): number
    {
        if (!source.isValid)
        {
            return ERR_INVALID_TARGET;
        }

        let code = ERR_NO_WORK;

        if (source.isShrouded)
        {
            code = this.goMoveTo(source, navigation);
        }
        else
        {
            let claimReceipt = source.instance.makeClaim(this, RESOURCE_ENERGY, this.carryCapacityRemaining, this.carryCapacityRemaining, true);

            if (claimReceipt == null)
            {
                return ERR_NO_WORK;
            }

            this.claimReceipt = claimReceipt;

            code = claimReceipt.target.collect(this, claimReceipt);

            if (code === OK)
            {
                this.action = ACTION_COLLECT;
                this.actionTarget = claimReceipt != null ? claimReceipt.target.toString() : null;
                return OK;
            }
            else if (code === ERR_NOT_IN_RANGE)
            {
                code = this.goMoveTo(claimReceipt.target, navigation);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        if (code === ERR_NOT_ENOUGH_RESOURCES ||
            code === ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }


        console.log("ERROR: Attempted to harvest '" + source + "' but encountered unknown error. " + code);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goTransfer(resourceType: string, target: ScreepsPtr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>, navigation?: NavigationRules): number
    {
        if (!target.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (target.isShrouded)
        {
            code = this.goMoveTo(target, navigation);
        }
        else
        {
            code = this.transfer(<any>target.instance, resourceType);

            if (code == OK)
            {
                this.action = ACTION_TRANSFER;
                this.actionTarget = target.toString();
                return OK;
            }
            else if (code == ERR_NOT_IN_RANGE)
            {
                return this.goMoveTo(target, navigation);
            }
        }

        if (this.doTrack)
        {
            console.log(this + " goTransfer " + code);
        }

        if (code == OK)
        {
            return OK;
        }

        if (code == ERR_FULL)
        {
            return ERR_NO_WORK;
        }

        if (code == ERR_NOT_OWNER)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' from another player's creep");
            return ERR_NO_WORK;
        }

        if (code == ERR_INVALID_TARGET)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to an invalid target " + target);
            return ERR_NO_WORK;
        }

        if (code == ERR_BUSY)
        {
            console.log("ERROR: Attempted to transfer '" + resourceType + "' to a creep that hasn't spawned yet");
            return ERR_NO_WORK;
        }

        if (code == ERR_INVALID_ARGS)
        {
            console.log("ERROR: Attempted to transfer an invalid amount of '" + resourceType + "' to a target");
            return ERR_NO_WORK;
        }

        //ERR_NOT_ENOUGH_RESOURCES	-6	The creep does not have the given amount of resources.
        console.log("ERROR: Attempted to transfer '" + resourceType + "' to '" + target + "' but encountered unknown error. " + code);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goBuild(site: ScreepsPtr<ConstructionSite>, navigation?: NavigationRules): number
    {
        if (!site.isValid)
        {
            return ERR_NO_WORK;
        }

        if (this.getActiveBodyparts(WORK) === 0)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code = ERR_NO_WORK;

        if (site.isShrouded)
        {
            code = this.goMoveTo(site, navigation);
        }
        else
        {
            code = this.build(site.instance);

            if (code === OK)
            {
                this.action = ACTION_BUILD;
                this.actionTarget = site.toString();
                return OK;
            }
            else if (code === ERR_NOT_IN_RANGE)
            {
                code = this.goMoveTo(site, navigation);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        if (code == ERR_NOT_ENOUGH_RESOURCES ||
            code == ERR_INVALID_TARGET ||
            code == ERR_RCL_NOT_ENOUGH)
        {
            return ERR_NO_WORK;
        }

        // ERR_NOT_OWNER
        // ERR_BUSY
        // ERR_NO_BODYPART
        return ERR_CANNOT_PERFORM_TASK;
    }

    goDismantle(structure: ScreepsPtr<Structure>, navigation?: NavigationRules): number
    {
        if (!structure.isValid)
        {
            return ERR_NO_WORK;
        }

        let canWork = this.getActiveBodyparts(WORK) > 0;
        let canAttack = this.getActiveBodyparts(ATTACK) > 0;
        let canRangeAttack = this.getActiveBodyparts(RANGED_ATTACK) > 0;

        if (!canAttack && !canWork && !canRangeAttack)
        {
            return ERR_CANNOT_PERFORM_TASK;
        }

        let code = ERR_NO_WORK;

        if (structure.isShrouded)
        {
            code = this.goMoveTo(structure, navigation);
        }
        else
        {
            structure.instance.notifyWhenAttacked(false);

            if (canWork)
            {
                code = this.dismantle(structure.instance);
            }
            else if (canAttack)
            {
                code = this.attack(structure.instance);
            }
            else if (canRangeAttack)
            {
                code = this.rangedAttack(structure.instance);
            }
            else
            {
                return ERR_CANNOT_PERFORM_TASK;
            }

            if (code === OK)
            {
                this.action = ACTION_DISMANTLE;
                this.actionTarget = structure.toString();
                return OK;
            }
            else if (code === ERR_NOT_IN_RANGE)
            {
                code = this.goMoveTo(structure, navigation);

                if (canRangeAttack)
                {
                    this.rangedAttack(structure.instance);
                }
            }
        }

        if (code === OK)
        {
            return OK;
        }

        if (code == ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        // ERR_NOT_OWNER
        // ERR_BUSY
        // ERR_NO_BODYPART
        return ERR_CANNOT_PERFORM_TASK;
    }

    goRepair(structure: ScreepsPtr<Structure>, navigation?: NavigationRules): number
    {
        if (!structure.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (structure.isShrouded)
        {
            code = this.goMoveTo(structure, navigation);
        }
        else
        {
            code = this.repair(structure.instance);

            if (code === OK)
            {
                this.action = ACTION_REPAIR;
                this.actionTarget = structure.toString();
                return OK;
            }
            else if(code === ERR_NOT_IN_RANGE)
            {
                return this.goMoveTo(structure, navigation);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        if (code === ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        console.log("Creep " + this.name + " goRepair error code: " + code);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goCollect(resourceType: string, amount: number, minAmount: number, isExtended: boolean, near: RoomPosition, options: CollectOptions, excludes: Dictionary<Claimable>, navigation?: NavigationRules): number
    {
        if (this.action != ACTION_COLLECT && this.action != ACTION_MOVE)
        {
            this.claimReceipt = null;
        }

        let claimReceipt = this.colony.claimResource(this, resourceType, amount, minAmount, isExtended, near, options, excludes, this.claimReceipt);

        if (claimReceipt == null)
        {
            return ERR_NO_WORK;
        }

        this.claimReceipt = claimReceipt;

        let code = claimReceipt.target.collect(this, claimReceipt);

        if (code === OK)
        {
            this.action = ACTION_COLLECT;
            this.actionTarget = claimReceipt.target.toString();
            return OK;
        }

        if (code === ERR_NOT_IN_RANGE)
        {
            code = this.goMoveTo(claimReceipt.target, navigation);
        }

        if (code === OK)
        {
            return OK;
        }

        this.claimReceipt = null;

        if (code === ERR_NOT_ENOUGH_RESOURCES)
        {
            console.log("FAILED TO CONFIRM AVAILABLE RESOURCES BEFORE COLLECTING. " + this + " " + claimReceipt.target + " " + claimReceipt.amount + " " + claimReceipt.resourceType);
            return ERR_NO_WORK;
        }

        console.log(code);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goUpgrade(controller: ScreepsPtr<Controller>, navigation?: NavigationRules): number
    {
        if (!controller.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (controller.isShrouded)
        {
            code = this.goMoveTo(controller, navigation);
        }
        else
        {
            code = this.upgradeController(controller.instance);

            if (code === OK)
            {
                this.action = ACTION_UPGRADE;
                this.actionTarget = controller.toString();
                this.claimReceipt = null;
                return OK;
            }
            else if(code === ERR_NOT_IN_RANGE)
            {
                return this.goMoveTo(controller, navigation);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        console.log("goUpgrade error code: " + code + " " + this);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goReserve(controller: ScreepsPtr<Controller>, navigation?: NavigationRules): number
    {
        if (!controller.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (controller.isShrouded)
        {
            code = this.goMoveTo(controller, navigation);
        }
        else
        {
            code = this.reserveController(controller.instance);

            if (code === OK)
            {
                this.action = ACTION_RESERVE;
                this.actionTarget = controller.toString();
                this.claimReceipt = null;
                return OK;
            }
            else if(code === ERR_NOT_IN_RANGE)
            {
                return this.goMoveTo(controller, navigation);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        console.log("goReserve error code: " + code + " " + this);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goClaim(controller: ScreepsPtr<Controller>, navigation?: NavigationRules): number
    {
        if (!controller.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (controller.isShrouded)
        {
            code = this.goMoveTo(controller, navigation);
        }
        else
        {
            code = this.claimController(controller.instance);

            if (code === OK)
            {
                this.action = ACTION_CLAIM;
                this.actionTarget = controller.toString();
                this.claimReceipt = null;
                return OK;
            }
            else if(code === ERR_NOT_IN_RANGE)
            {
                return this.goMoveTo(controller, navigation);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        console.log("goClaim error code: " + code + " " + this);

        return ERR_CANNOT_PERFORM_TASK;
    }

    goRecycle(spawn: ScreepsPtr<Spawn>, navigation?: NavigationRules): number
    {
        if (!spawn.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (spawn.isShrouded)
        {
            code = this.goMoveTo(spawn, navigation);
        }
        else
        {
            code = spawn.instance.recycleCreep(<any>this);

            if (code === OK)
            {
                this.action = ACTION_RECYCLE;
                this.actionTarget = spawn.toString();
                this.claimReceipt = null;
                return OK;
            }
            else if(code === ERR_NOT_IN_RANGE)
            {
                return this.goMoveTo(spawn, navigation);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        console.log("goRecycle error code: " + code);

        return ERR_CANNOT_PERFORM_TASK;
    }
}
