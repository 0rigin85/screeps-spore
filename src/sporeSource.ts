import {ClaimReceipt, Claimable} from "./sporeClaimable";

declare global
{
    interface Source
    {
        doIgnore: boolean;
        doFavor: boolean;
        doTrack: boolean;

        memory: SourceMemory;

        collect(collector: any, claimReceipt: ClaimReceipt): number;

        makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export interface SourceMemory
{
    track: boolean;

    claimSlots: number;
}

// unused mirror class of the screeps Source class used to make Typescript happy
class ScreepsSource implements Source
{
    prototype: Source;
    energy: number;
    energyCapacity: number;
    id: string;
    pos: RoomPosition;
    room: Room;
    ticksToRegeneration: number;

    doIgnore: boolean;
    doFavor: boolean;
    doTrack: boolean;
    memory: SourceMemory;

    collect(collector: any, claimReceipt: ClaimReceipt): number { return 0; }

    makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt  { return null; }
}

export class SporeSource extends ScreepsSource implements Claimable
{
    doIgnore: boolean;

    get doTrack(): boolean
    {
        return (<SourceMemory>this.memory).track === true;
    }

    doFavor: boolean;

    get memory(): SourceMemory
    {
        let roomMemory = this.room.memory;

        if (roomMemory.sources == null)
        {
            roomMemory.sources = [];
        }

        let memory = roomMemory.sources[this.id];

        if (memory == null)
        {
            memory = { };
            roomMemory.sources[this.id] = memory;
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

        if (collector.harvest != null)
        {
            return collector.harvest(this);
        }

        return ERR_INVALID_ARGS;
    }

    makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt
    {
        if (resourceType != RESOURCE_ENERGY || // ensure they are trying to claim energy
            amount > this.energy - this.claims.energy || // ensure our remaining energy meets their claim
            this.claims.count >= this.claims.slots || //ensure we have open slots
            (this.claims.work >= 1 && isExtended === true)) // ensure for extended claims we have open work
        {
            return null;
        }

        this.claims.count++;
        this.claims.energy += amount;

        if (isExtended === true && claimer.getActiveBodyparts != null)
        {
            this.claims.work += claimer.getActiveBodyparts(WORK) / 5;
        }

        return new ClaimReceipt(this, 'source', resourceType, amount);
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
    constructor(private source: Source)
    { }

    count: number = 0;
    work: number = 0;
    energy: number = 0;

    get slots(): number
    {
        let slots = this.source.memory.claimSlots;

        if (slots == null)
        {
            slots = this.source.pos.getWalkableSurroundingArea();
            this.source.memory.claimSlots = slots;
        }

        Object.defineProperty(this, "slots", {value: slots});
        return slots;
    }
}
