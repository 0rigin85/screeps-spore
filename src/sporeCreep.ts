///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {Task} from "./task";
import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {SporeColony} from "./sporeColony";

declare global
{
    interface Creep
    {
        carryCount: number;
        task: Task;
        action: string;
        actionTarget: RoomObject | RoomPosition | Source | Claimable;
        claimReceipt: ClaimReceipt;
        carryCapacityRemaining: number;

        colony: SporeColony;
    }
}

export interface CreepMemory
{
    taskId: string;

    action: string;
    actionTargetId: string;

    claimReceiptTargetId: string;
    claimReceiptTargetType: string;
    claimReceiptResourceType: string;
    claimReceiptAmount: number;
}

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

    private _actionTarget: RoomObject | RoomPosition | Source | Claimable;
    get actionTarget(): RoomObject | RoomPosition | Source | Claimable
    {
        if (this._actionTarget != null)
        {
            return this._actionTarget;
        }

        let memory = <CreepMemory>this.memory;

        if (memory.actionTargetId != null)
        {
            if (memory.actionTargetId.includes(','))
            {
                let parts = memory.actionTargetId.split(',');
                this._actionTarget = new RoomPosition(+parts[0], +parts[1], parts[2]);
            }
            else
            {
                this._actionTarget = Game.getObjectById<RoomObject>(memory.actionTargetId);

                if (this._actionTarget == null)
                {
                    delete memory.actionTargetId;
                }
            }
        }

        return this._actionTarget;
    }

    set actionTarget(value: RoomObject | RoomPosition | Source | Claimable)
    {
        this._actionTarget = value;
        let memory = <CreepMemory>this.memory;

        if (value == null)
        {
            delete memory.actionTargetId;
        }
        else
        {
            if ((<RoomObject>value).id == null)
            {
                memory.actionTargetId = (<RoomPosition>value).x + ',' + (<RoomPosition>value).y + ',' + (<RoomPosition>value).roomName;
            }
            else
            {
                memory.actionTargetId = (<RoomObject>value).id;
            }
        }
    }
}