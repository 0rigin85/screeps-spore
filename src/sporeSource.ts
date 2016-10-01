import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {ScreepsPtr} from "./screepsPtr";

declare global
{
    interface Source
    {
        doIgnore: boolean;
        doFavor: boolean;
        doTrack: boolean;

        memory: SourceMemory;
        slots: number;

        collect(collector: any, claimReceipt: ClaimReceipt): number;

        makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
        claims: SourceClaims;
    }
}

export interface SourceMemory
{
    track: boolean;

    claimSlots: number;
}

export class SourceClaims
{
    constructor(private source: Source)
    { }

    count: number = 0;
    work: number = 0;
    energy: number = 0;
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
    slots: number;

    collect(collector: any, claimReceipt: ClaimReceipt): number { return 0; }

    makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt  { return null; }
    claims: SourceClaims;
}

export class SporeSource extends ScreepsSource implements Claimable
{
    doIgnore: boolean;

    get doTrack(): boolean
    {
        return (<SourceMemory>this.memory).track === true;
    }

    doFavor: boolean;

    static getSlots(source: ScreepsPtr<Source>): number
    {
        let roomMemory = Memory.rooms[source.pos.roomName];

        if (roomMemory == null)
        {
            return -1;
        }

        if (roomMemory.sources == null)
        {
            roomMemory.sources = [];
        }

        let sourceMemory = roomMemory.sources[source.id];

        if (sourceMemory == null)
        {
            sourceMemory = {};
            roomMemory.sources[source.id] = sourceMemory;
        }

        if (sourceMemory.claimSlots == null)
        {
            sourceMemory.claimSlots = source.pos.getWalkableSurroundingArea();
        }

        return sourceMemory.claimSlots;
    }

    get slots(): number
    {
        let slots = this.memory.claimSlots;

        if (slots == null)
        {
            slots = this.pos.getWalkableSurroundingArea();
            this.memory.claimSlots = slots;
        }

        Object.defineProperty(this, "slots", {value: slots});
        return slots;
    }

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

    makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt
    {
        //console.log('makeClaim ' + claimer);
        if (resourceType != RESOURCE_ENERGY || // ensure they are trying to claim energy
            this.claims.count >= this.slots || //ensure we have open slots
            (this.claims.work >= 1 && isExtended === true)) // ensure for extended claims we have open work
        {
            //console.log('makeClaim energy ' + (amount > this.energy - this.claims.energy && isExtended === false));
            //console.log('makeClaim slots ' + (this.claims.count >= this.claims.slots));
            //console.log('   makeClaim count ' + this.claims.count);
            //console.log('   makeClaim slots ' + this.claims.slots);
            //console.log('makeClaim work ' + (this.claims.work >= 1 && isExtended === true));

            return null;
        }

        let claimAmount = amount;

        if (isExtended === false)
        {
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
        }

        this.claims.count++;
        this.claims.energy += claimAmount; // extended claims ignore the resource amount request on sources

        if (isExtended === true && claimer.getActiveBodyparts != null)
        {
            this.claims.work += claimer.getActiveBodyparts(WORK) / 5;
        }

        //console.log('makeClaim success');
        return new ClaimReceipt(this, 'source', resourceType, claimAmount);
    }

    private _claimTick: number;
    private _claims: SourceClaims;
    get claims(): SourceClaims
    {
        if (this._claims != null && this._claimTick == Game.time)
        {
            return this._claims;
        }

        this._claimTick = Game.time;
        this._claims = new SourceClaims(this);

        //Object.defineProperty(this, "claims", {value: claims, configurable: true, enumerable: true});
        return this._claims;
    }
}

