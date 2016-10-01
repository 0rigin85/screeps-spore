///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ClaimReceipt, Claimable} from "./sporeClaimable";

declare global
{
    interface StructureExtension
    {
        energyCapacityRemaining: number;

        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export class SporeExtension extends StructureExtension implements Claimable
{
    get energyCapacityRemaining(): number
    {
        return this.energyCapacity - this.energy;
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

    makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt
    {
        if (resourceType != RESOURCE_ENERGY) // ensure they are trying to claim energy
        {
            return null;
        }

        let claimAmount = amount;
        let remaining = this.energy - this.claims.energy;

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
        this.claims.energy += claimAmount;

        return new ClaimReceipt(this, 'spawn', resourceType, claimAmount);
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
    constructor(private extension: StructureExtension)
    { }

    count: number = 0;
    energy: number = 0;
}
