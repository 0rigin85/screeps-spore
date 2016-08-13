///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {Task, TaskPriority} from "./task";
import {TransferResource} from "./taskTransferResource";

declare global
{
    interface StructureTower
    {
        attackTarget: Creep;
        energyCapacityRemaining: number;
        memory: TowerMemory;

        getTasks(): Task[];

        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export interface TowerMemory
{
    attackTargetId: string;
}

export class SporeTower extends StructureTower implements Claimable
{
    _attackTarget: Creep;
    get attackTarget(): Creep
    {
        if (this._attackTarget != null)
        {
            return this._attackTarget;
        }

        if (this.memory.attackTargetId != null)
        {
            this._attackTarget = Game.getObjectById<Creep>(this.memory.attackTargetId);
        }

        return this._attackTarget;
    }

    set attackTarget(value: Creep)
    {
        this._attackTarget = value;

        if (value != null && value.id != null)
        {
            this.memory.attackTargetId = value.id;
        }
        else
        {
            delete this.memory.attackTargetId;
        }
    }

    get energyCapacityRemaining(): number
    {
        return this.energyCapacity - this.energy;
    }

    get memory(): TowerMemory
    {
        let roomMemory = this.room.memory;

        if (roomMemory.structures == null)
        {
            roomMemory.structures = {};
        }

        let memory: any = roomMemory.structures[this.id];

        if (memory == null)
        {
            memory = { };
            roomMemory.structures[this.id] = memory;
        }

        Object.defineProperty(this, "memory", {value: memory});
        return memory;
    }

    getTasks(): Task[]
    {
        let tasks: Task[] = [];

        if (this.energy < this.energyCapacity)
        {
            let transferEnergyTask = new TransferResource("", [this], RESOURCE_ENERGY, [['dropped'], ['link', 'container'], ['source'], ['storage']]);
            transferEnergyTask.priority = TaskPriority.Mandatory;
            transferEnergyTask.name = "Fill " + this;
            tasks.push(transferEnergyTask);
        }

        return tasks;
    }

    collect(collector: any, claimReceipt: ClaimReceipt): number
    {
        if (claimReceipt.target !== this)
        {
            return ERR_INVALID_TARGET;
        }

        if (claimReceipt.resourceType === RESOURCE_ENERGY &&
            collector.withdraw != null &&
            collector.carryCapacityRemaining != null)
        {
            return collector.withdraw(
                this,
                claimReceipt.resourceType,
                Math.min(this.energy, collector.carryCapacityRemaining));
        }

        return ERR_INVALID_ARGS;
    }

    makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt
    {
        if (resourceType != RESOURCE_ENERGY || // ensure they are trying to claim energy
            amount > this.energy - this.claims.energy) // ensure our remaining energy meets their claim
        {
            return null;
        }

        this.claims.count++;
        this.claims.energy += amount;

        return new ClaimReceipt(this, 'spawn', resourceType, amount);
    }

    private get claims(): Claims
    {
        let claims = new Claims(this);

        Object.defineProperty(this, "claims", {value: claims});
        return claims;
    }
}

class Claims
{
    constructor(private tower: StructureTower)
    { }

    count: number = 0;
    energy: number = 0;
}
