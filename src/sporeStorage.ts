///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ClaimReceipt, Claimable} from "./sporeClaimable";

declare global
{
    interface StructureStorage
    {
        storeCount: number;
        storeCapacityRemaining: number;

        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt;
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

        Object.defineProperty(this, "memory", {value: memory});
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

    makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt
    {
        if (this.claims[resourceType] == null)
        {
            this.claims[resourceType] = 0;
        }

        if (resourceType != RESOURCE_ENERGY || // ensure they are trying to claim energy
            amount > this.store[resourceType] - this.claims[resourceType]) // ensure our remaining energy meets their claim
        {
            return null;
        }

        this.claims.count++;
        this.claims[resourceType] += amount;

        return new ClaimReceipt(this, 'storage', resourceType, amount);
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
    constructor(private storage: StructureStorage)
    { }

    count: number = 0;
}