import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {StructureMemory} from "./sporeStructure";

declare global
{
    interface Spawn
    {
        energyCapacityRemaining: number;
        needsRepair: boolean;
        dire: boolean;

        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export interface SpawnMemory extends StructureMemory
{

}

export class SporeSpawn extends Spawn implements Claimable
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
    constructor(private spawn: Spawn)
    { }

    count: number = 0;
    energy: number = 0;
}