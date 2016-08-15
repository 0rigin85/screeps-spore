///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {Task, TaskPriority} from "./task";
import {TransferResource} from "./taskTransferResource";

declare global
{
    interface StructureLink
    {
        energyCapacityRemaining: number;
        memory: LinkMemory;
        takesTransfers: boolean;
        bond: Bond;

        getTasks(): Task[];

        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export interface LinkMemory
{
    takesTransfers: boolean;
    nearBySourceId: string;

    bondTargetId: string;
    bondTargetFlagName: string;
    bondMyFlagName: string;
    bondType: string;
}

export class SporeLink extends StructureLink implements Claimable
{
    get energyCapacityRemaining(): number
    {
        return this.energyCapacity - this.energy;
    }

    get takesTransfers(): boolean
    {
        return this.memory.takesTransfers === true;
    }

    set takesTransfers(value: boolean)
    {
        this.memory.takesTransfers = value;
    }

    _bond: Bond;
    get bond(): Bond
    {
        if (this._bond != null)
        {
            return this._bond;
        }

        if (this.memory.bondTargetId != null)
        {
            this._bond = new Bond();
            this._bond.type = this.memory.bondType;
            this._bond.targetId = this.memory.bondTargetId;
            this._bond.target = Game.getObjectById<RoomObject>(this.memory.bondTargetId);
            this._bond.targetFlag = Game.flags[this.memory.bondTargetFlagName];
            this._bond.myFlag = Game.flags[this.memory.bondMyFlagName];

            if (!this._bond.exists())
            {
                this._bond = null;
                delete this.memory.bondTargetId;
                delete this.memory.bondTargetFlagName;
                delete this.memory.bondMyFlagName;
                delete this.memory.bondType;
            }
            else if (this._bond.targetId == null && this._bond.targetFlag.room != null)
            {
                if (this._bond.targetFlag.room != null)
                {
                    let found = this._bond.targetFlag.room.lookForAt<RoomObject>(this._bond.type, this._bond.targetFlag);

                    if (found.length > 0)
                    {
                        this._bond.target = found[0];
                    }
                }

                if (this._bond.target != null)
                {
                    this._bond.targetId = this._bond.target.id;
                }

                if (this._bond.target == null)
                {
                    this._bond = null;
                    delete this.memory.bondTargetId;
                    delete this.memory.bondTargetFlagName;
                    delete this.memory.bondMyFlagName;
                    delete this.memory.bondType;
                }
            }
        }

        return this._bond;
    }

    set bond(value: Bond)
    {
        this._bond = value;

        if (value == null)
        {
            delete this.memory.bondType;
            delete this.memory.bondTargetId;
            delete this.memory.bondTargetFlagName;
            delete this.memory.bondMyFlagName;
        }
        else
        {
            this.memory.bondType = value.type;

            if (value.target != null)
            {
                this.memory.bondTargetId = value.target.id;
            }

            if (value.targetFlag != null)
            {
                this.memory.bondTargetFlagName = value.targetFlag.name;
            }

            if (value.myFlag != null)
            {
                this.memory.bondMyFlagName = value.myFlag.name;
            }
        }
    }

    get nearBySource(): Source
    {
        if (this.memory.nearBySourceId != null)
        {
            let nearBySource = Game.getObjectById<Source>(this.memory.nearBySourceId);
            Object.defineProperty(this, "nearBySource", {value: nearBySource});
            return nearBySource;
        }

        let nearBySource = <Source>this.pos.findClosestInRange(this.room.sources, 2);

        if (nearBySource == null)
        {
            this.memory.nearBySourceId = '';
        }
        else
        {
            this.memory.nearBySourceId = nearBySource.id;
        }

        Object.defineProperty(this, "nearBySource", {value: nearBySource});
        return nearBySource;
    }

    get memory(): LinkMemory
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
        this.memory.takesTransfers = false;

        let transferTarget = null;
        let tasks: Task[] = [];

        if (this.bond == null)
        {
            this.bond = Bond.discover(this, LOOK_SOURCES);
        }

        if (this.bond != null)
        {
            let target: any = this.bond.target;

            if (target == null)
            {
                target = this.bond.targetFlag.pos;
            }

            let transferEnergyTask = new TransferResource("", [this], RESOURCE_ENERGY, target);
            transferEnergyTask.priority = TaskPriority.Mandatory;
            transferEnergyTask.name = "Transfer energy to " + this + " from " + target;
            transferEnergyTask.possibleWorkers = 1;
            tasks.push(transferEnergyTask);
        }
        else
        {
            if (this.nearBySource != null)
            {
                let transferEnergyTask = new TransferResource("", [this], RESOURCE_ENERGY, this.nearBySource);
                transferEnergyTask.priority = TaskPriority.Mandatory;
                transferEnergyTask.name = "Transfer energy to " + this + " from " + this.nearBySource;
                transferEnergyTask.possibleWorkers = 1;
                tasks.push(transferEnergyTask);
            }
            else
            {
                this.takesTransfers = true;
            }
        }

        if (this.energy > 0)
        {
            transferTarget = this.findLinkTakingTransfers();

            if (transferTarget != null)
            {
                this.transferEnergy(transferTarget);
            }
        }

        return tasks;
    }

    findLinkTakingTransfers(): StructureLink
    {
        for (let link of this.room.links)
        {
            if (link.takesTransfers === true && link.energyCapacityRemaining > 0)
            {
                return link;
            }
        }

        return null;
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
                Math.min(this.energy, collector.carryCapacityRemaining));
        }

        return ERR_INVALID_ARGS;
    }

    makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt
    {
        if (this.takesTransfers !== true || // ensure this is a pick up location
            resourceType != RESOURCE_ENERGY || // ensure they are trying to claim energy
            amount > this.energy - this.claims.energy) // ensure our remaining energy meets their claim
        {
            return null;
        }

        this.claims.count++;
        this.claims.energy += amount;

        return new ClaimReceipt(this, 'link', resourceType, amount);
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
    constructor(private link: StructureLink)
    { }

    count: number = 0;
    energy: number = 0;
}

class Bond
{
    target: RoomObject;
    targetId: string;
    targetFlag: Flag;
    myFlag: Flag;
    type: string;

    exists(): boolean
    {
        return (
            this.type != null &&
            this.targetFlag != null &&
            this.myFlag != null &&
            this.myFlag.color === COLOR_YELLOW && this.targetFlag.color === COLOR_YELLOW &&
            this.myFlag.secondaryColor === this.targetFlag.secondaryColor);
    }

    static discover(obj: RoomObject, lookType: string): Bond
    {
        let flagA = null;
        let flagB = null;

        let flags = obj.room.lookForAt<Flag>(LOOK_FLAGS, obj.pos);
        for (let index = 0; index < flags.length; index++)
        {
            let flag = flags[index];

            if (flag.color === COLOR_YELLOW)
            {
                flagA = flag;
                break;
            }
        }

        if (flagA == null)
        {
            return null;
        }

        for ( let flagName in Game.flags)
        {
            let flag = Game.flags[flagName];

            if (flag != flagA &&
                flag.color === COLOR_YELLOW &&
                flag.secondaryColor === flagA.secondaryColor &&
                flag.name.startsWith(flagA.name))
            {
                flagB = flag;
                break;
            }
        }

        if (flagB == null)
        {
            return null;
        }

        let bond = new Bond();
        bond.type = lookType;
        bond.target = null;
        bond.targetId = null;

        if (flagB.room != null)
        {
            let found = flagB.room.lookForAt(lookType, flagB);

            if (found.length > 0)
            {
                bond.target = found[0];
            }
        }

        if (bond.target != null)
        {
            bond.targetId = bond.target.id;
        }

        bond.targetFlag = flagB;
        bond.myFlag = flagA;

        return bond;
    }
}