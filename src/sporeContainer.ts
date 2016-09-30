///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ClaimReceipt, Claimable} from "./sporeClaimable";
import {Task, TaskPriority} from "./task";
import {TransferResource} from "./taskTransferResource";
import {StoreContainerLike, ScreepsPtr} from "./screepsPtr";
import {SporeCreep} from "./sporeCreep";

declare global
{
    interface StructureContainer
    {
        storeCount: number;
        storeCapacityRemaining: number;

        getTasks(): Task[];

        collect(collector: any, claimReceipt: ClaimReceipt): number;
        makeClaim(claimer: any, resourceType: string, amount: number, isExtended?: boolean): ClaimReceipt;
    }
}

export class SporeContainer extends StructureContainer implements Claimable
{
    get storeCount(): number
    {
        return _.sum(this.store);
    }

    get storeCapacityRemaining(): number
    {
        return this.storeCapacity - this.storeCount;
    }

    getTasks(): Task[]
    {
        let tasks: Task[] = [];

        // if (this.storeCount < this.storeCapacity)
        // {
        //     let linkFlag = null;
        //     let flags = this.room.lookForAt<Flag>(LOOK_FLAGS, this.pos);
        //     for (let index = 0; index < flags.length; index++)
        //     {
        //         let flag = flags[index];
        //
        //         if (flag.color == COLOR_YELLOW)
        //         {
        //             linkFlag = flag;
        //             break;
        //         }
        //     }
        //
        //     if (linkFlag != null)
        //     {
        //         let otherFlags = this.room.find<Flag>(FIND_FLAGS, {
        //             filter: {
        //                 color: COLOR_YELLOW,
        //                 secondaryColor: linkFlag.secondaryColor
        //             }
        //         });
        //
        //         for (let index = 0; index < otherFlags.length; index++)
        //         {
        //             let foundMatch = false;
        //             let otherFlag = otherFlags[index];
        //
        //             if (otherFlag != null)
        //             {
        //                 for (let source of this.room.sources)
        //                 {
        //                     if (source.pos.isEqualTo(otherFlag.pos))
        //                     {
        //                         let transferEnergyTask = new TransferResource([ScreepsPtr.from<StoreContainerLike>(this)], RESOURCE_ENERGY, ScreepsPtr.from<Source>(source), null);
        //                         transferEnergyTask.priority = TaskPriority.Mandatory;
        //                         transferEnergyTask.name = "Transfer energy to " + this + " from " + source;
        //                         transferEnergyTask.possibleWorkers = 1;
        //                         transferEnergyTask.idealCreepBody = CREEP_TYPE.CITIZEN;
        //                         tasks.push(transferEnergyTask);
        //
        //                         foundMatch = true;
        //                         break;
        //                     }
        //                 }
        //             }
        //
        //             if (foundMatch)
        //             {
        //                 break;
        //             }
        //         }
        //     }
        //     else
        //     {
        //         let closestSource = <Source>this.pos.findClosestInRange(this.room.sources, 2);
        //
        //         if (closestSource != null)
        //         {
        //             let transferEnergyTask = new TransferResource([ScreepsPtr.from<StoreContainerLike>(this)], RESOURCE_ENERGY, ScreepsPtr.from<Source>(closestSource), null);
        //             transferEnergyTask.priority = TaskPriority.Mandatory;
        //             transferEnergyTask.name = "Transfer energy to " + this + " from " + closestSource;
        //             transferEnergyTask.possibleWorkers = 1;
        //             transferEnergyTask.idealCreepBody = CREEP_TYPE.MINER;
        //
        //             tasks.push(transferEnergyTask);
        //         }
        //         else
        //         {
        //             let transferEnergyTask = new TransferResource([ScreepsPtr.from<StoreContainerLike>(this)], RESOURCE_ENERGY, null, [['dropped'], ['container']]);
        //             transferEnergyTask.priority = TaskPriority.High;
        //             transferEnergyTask.name = "Transfer energy to " + this;
        //             transferEnergyTask.possibleWorkers = 1;
        //             transferEnergyTask.idealCreepBody = CREEP_TYPE.COURIER;
        //
        //             tasks.push(transferEnergyTask);
        //         }
        //     }
        // }

        let closestSource = <Source>this.pos.findClosestInRange(this.room.sources, 2);

        if (closestSource == null)
        {
            let transferEnergyTask = new TransferResource([ScreepsPtr.from<StoreContainerLike>(this)], RESOURCE_ENERGY, null, [['near_dropped'], ['container'], ['dropped']]);
            transferEnergyTask.priority = TaskPriority.Low;
            transferEnergyTask.name = "Fill " + ScreepsPtr.from<StructureContainer>(this).toHtml();
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

        // ensure our remaining resource meets their claim
        if (amount > this.store[resourceType] - this.claims[resourceType])
        {
            return null;
        }

        this.claims.count++;
        this.claims[resourceType] += amount;

        return new ClaimReceipt(this, 'container', resourceType, amount);
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
    constructor(private container: StructureContainer)
    { }

    count: number = 0;
}
