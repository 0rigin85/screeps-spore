///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {Task, TaskPriority} from "./task";
import {TransferResource} from "./taskTransferResource";

declare global
{
    interface Resource
    {
        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export class SporeResource extends Resource implements Claimable
{
    collect(collector: any, claimReceipt: ClaimReceipt): number
    {
        if (claimReceipt.target !== this)
        {
            return ERR_INVALID_TARGET;
        }

        if (claimReceipt.resourceType === this.resourceType &&
            collector.withdraw != null && collector.carryCapacityRemaining != null)
        {
            return collector.pickup(this);
        }

        return ERR_INVALID_ARGS;
    }

    makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt
    {
        if (resourceType != this.resourceType || // ensure they are trying to claim the correct resource
            amount > this.amount - this.claims.amount) // ensure our remaining energy meets their claim
        {
            return null;
        }

        this.claims.count++;
        this.claims.amount += amount;

        return new ClaimReceipt(this, 'dropped', resourceType, amount);
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
    constructor(private resource: Resource)
    { }

    count: number = 0;
    amount: number = 0;
}