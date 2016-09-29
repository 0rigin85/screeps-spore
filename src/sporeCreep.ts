///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK} from "./task";
import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {SporeColony} from "./sporeColony";
import {RoomObjectLike, ScreepsPtr, CarryContainerLike, StoreContainerLike, EnergyContainerLike} from "./screepsPtr";
import {BodyDefinition, BodyPartRequirements} from "./bodyDefinition";
import {SpawnRequest} from "./spawnRequest";

declare global
{
    interface Creep
    {
        carryCount: number;
        task: Task;
        action: string;
        actionTarget: string;
        claimReceipt: ClaimReceipt;
        carryCapacityRemaining: number;
        pos: RoomPosition;
        room: Room;
        type: string;
        spawnRequest: SpawnRequest;

        colony: SporeColony;

        getEfficiencyAs(bodyDefinition: BodyDefinition) : number;

        goMoveTo(target: RoomObjectLike): number;
        goHarvest(source: ScreepsPtr<Source>): number;
        goTransfer(resourceType: string, target: ScreepsPtr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>): number;
        goBuild(site: ScreepsPtr<ConstructionSite>): number;
        goDismantle(structure: ScreepsPtr<Structure>): number;
        goRepair(structure: ScreepsPtr<Structure>): number;
        goCollect(resourceType: string, amount: number, isExtended: boolean, near: RoomPosition, storePriorities: string[][]): number;
        goUpgrade(controller: ScreepsPtr<Controller>): number;
        goRecycle(spawn: ScreepsPtr<Spawn>): number;
    }
}

interface SpawnRequestMemory
{
    id: string;
    taskId: string;
    replacingCreepName: string;
}

export interface CreepMemory
{
    taskId: string;
    spawnRequest: SpawnRequestMemory;

    action: string;
    actionTarget: string;

    claimReceiptTargetId: string;
    claimReceiptTargetType: string;
    claimReceiptResourceType: string;
    claimReceiptAmount: number;
}

export var ACTION_TRANSFER: string = "transfer";
export var ACTION_RECYCLE: string = "recycle";
export var ACTION_COLLECT: string = "collect";
export var ACTION_UPGRADE: string = "upgrade";
export var ACTION_BUILD: string = "build";
export var ACTION_DISMANTLE: string = "dismantle";
export var ACTION_REPAIR: string = "repair";
export var ACTION_MOVE: string = "move";

export var CREEP_TYPE: {
    [part: string]: BodyDefinition;
    MINER: BodyDefinition;
    COURIER: BodyDefinition;
    CITIZEN: BodyDefinition;
} = <any>{};

var bodyDefinition = new BodyDefinition('MINER');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 6, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 1, 1, 1));
CREEP_TYPE.MINER = bodyDefinition;

var bodyDefinition = new BodyDefinition('COURIER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 12, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 12, 1, 1));
CREEP_TYPE.COURIER = bodyDefinition;

var bodyDefinition = new BodyDefinition('CITIZEN');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 5, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 10, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 5, 1, 1));
CREEP_TYPE.CITIZEN = bodyDefinition;

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

    getEfficiencyAs(bodyDefinition: BodyDefinition) : number
    {
        let totalRequiredParts = 0;
        let totalMaxRequiredParts = 0;
        let bodyPartsByType = _.groupBy(this.body, function(part: BodyPartDefinition){ return part.type; });

        for (let requirement of bodyDefinition.requirements)
        {
            let bodyParts = bodyPartsByType[requirement.type];

            if (bodyParts == null ||
                bodyParts.length < requirement.min)
            {
                return 0;
            }

            totalMaxRequiredParts += requirement.max;
            totalRequiredParts += bodyParts.length;
        }

        return totalRequiredParts / totalMaxRequiredParts;
    }

    get type(): string
    {
        return this.memory.type;
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

    goMoveTo(target: RoomObjectLike): number
    {
        if (target.pos == null)
        {
            return ERR_NO_WORK;
        }

        let code = this.moveTo(target.pos, {noPathFinding: true});

        // Perform pathfinding only if we have enough CPU
        if (code == ERR_NOT_FOUND && Game.cpu.tickLimit - Game.cpu.getUsed() > 20)
        {
            code = this.moveTo(target.pos);
        }

        if (this.doTrack)
        {
            console.log(this + " goMoveTo " + code);
        }

        if (code == OK ||
            code == ERR_TIRED)
        {
            this.action = ACTION_MOVE;
            this.actionTarget = target.toString();
            return OK;
        }

        if (code == ERR_INVALID_TARGET)
        {
            return ERR_NO_WORK;
        }

        // ERR_NO_PATH
        // ERR_NO_BODYPART
        // ERR_BUSY
        // ERR_NOT_OWNER
        console.log("ERROR: Attempted to move to '" + target + "' but encountered unknown error. " + code);
        return ERR_CANNOT_PERFORM_TASK;
    }

    goHarvest(source: ScreepsPtr<Source>): number
    {
        if (!source.isValid)
        {
            return ERR_INVALID_TARGET;
        }

        let code = ERR_NO_WORK;

        if (source.isShrouded)
        {
            code = this.goMoveTo(source);
        }
        else
        {
            let claimReceipt = source.instance.makeClaim(this, RESOURCE_ENERGY, this.carryCapacityRemaining, true);

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
                code = this.goMoveTo(claimReceipt.target);
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

    goTransfer(resourceType: string, target: ScreepsPtr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>): number
    {
        if (!target.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (target.isShrouded)
        {
            code = this.goMoveTo(target);
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
                return this.goMoveTo(target);
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

    goBuild(site: ScreepsPtr<ConstructionSite>): number
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
            code = this.goMoveTo(site);
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
                code = this.goMoveTo(site);
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

    goDismantle(structure: ScreepsPtr<Structure>): number
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
            code = this.goMoveTo(structure);
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
                code = this.goMoveTo(structure);

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

    goRepair(structure: ScreepsPtr<Structure>): number
    {
        if (!structure.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (structure.isShrouded)
        {
            code = this.goMoveTo(structure);
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
                return this.goMoveTo(structure);
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

    goCollect(resourceType: string, amount: number, isExtended: boolean, near: RoomPosition, storePriorities: string[][]): number
    {
        if (this.action != ACTION_COLLECT && this.action != ACTION_MOVE)
        {
            this.claimReceipt = null;
        }

        let claimReceipt = Game.rooms[near.roomName].claimResource(this, resourceType, amount, isExtended, near, storePriorities, this.claimReceipt);

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
            code = this.goMoveTo(claimReceipt.target);
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

    goUpgrade(controller: ScreepsPtr<Controller>): number
    {
        if (!controller.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (controller.isShrouded)
        {
            code = this.goMoveTo(controller);
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
                return this.goMoveTo(controller);
            }
        }

        if (code === OK)
        {
            return OK;
        }

        console.log("goUpgrade error code: " + code + " " + this);
        return ERR_CANNOT_PERFORM_TASK;
    }

    goRecycle(spawn: ScreepsPtr<Spawn>): number
    {
        if (!spawn.isValid)
        {
            return ERR_NO_WORK;
        }

        let code = ERR_NO_WORK;

        if (spawn.isShrouded)
        {
            code = this.goMoveTo(spawn);
        }
        else
        {
            code = spawn.instance.recycleCreep(this);

            if (code === OK)
            {
                this.action = ACTION_RECYCLE;
                this.actionTarget = spawn.toString();
                this.claimReceipt = null;
                return OK;
            }
            else if(code === ERR_NOT_IN_RANGE)
            {
                return this.goMoveTo(spawn);
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
