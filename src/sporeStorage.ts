///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {Remember} from "./sporeRemember";

declare global
{
    interface StructureStorage
    {
        storeCount: number;
        storeCapacityRemaining: number;

        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export interface StorageMemory
{

}

export class SporeStorage extends StructureStorage implements Claimable
{
    get storeCount(): number
    {
        return _.sum(this.store);
    }

    get storeCapacityRemaining(): number
    {
        return this.storeCapacity - this.storeCount;
    }

    get memory(): StorageMemory
    {
        let roomMemory = this.room.memory;
        let memory = roomMemory.storage;

        if (memory == null)
        {
            memory = { };
            roomMemory.storage = memory;
        }

        return memory;
    }

    collect(collector: any, claimReceipt: ClaimReceipt): number
    {
        if (claimReceipt.target !== this)
        {
            return ERR_INVALID_TARGET;
        }

        if (collector.withdraw != null && collector.carryCapacityRemaining != null)
        {
            return collector.withdraw(
                this,
                claimReceipt.resourceType,
                Math.min(this.store[claimReceipt.resourceType], collector.carryCapacityRemaining));
        }

        return ERR_INVALID_ARGS;
    }

    makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt
    {
        if (this.claims[resourceType] == null)
        {
            this.claims[resourceType] = 0;
        }

        let claimAmount = amount;
        let savings = 0;

        if (this.room.budget.savings[resourceType] != null && this.room.budget.savings[resourceType] > 0)
        {
            savings = this.room.budget.savings[resourceType];
        }

        let remaining = this.store[resourceType] - this.claims[resourceType];
        remaining = Math.max(remaining - savings, 0);

        // ensure our remaining resource meets their claim
        if (claimAmount > remaining)
        {
            if (minAmount > remaining)
            {
                return null;
            }

            claimAmount = remaining;
        }

        this.claims.count++;
        this.claims[resourceType] += claimAmount;

        return new ClaimReceipt(this, 'storage', resourceType, claimAmount);
    }

    private get claims(): Claims
    {
        return Remember.forTick(`${this.id}.claims`, () =>
        {
            return new Claims(this);
        });
    }
}

class Claims
{
    constructor(private storage: StructureStorage)
    { }

    count: number = 0;
}