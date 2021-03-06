import { ClaimReceipt } from "./ClaimReceipt";
import { Ptr } from "./Ptr";
import { CollectOptions } from "./CollectOptions";
import { Remember } from "./Remember";
import { TransferResource } from "./tasks/taskTransferResource";
import { TaskPriority } from "./TaskPriority";

export class SporeContainer extends StructureContainer implements Claimable {
  get storeCount(): number {
    return _.sum(this.store);
  }

  get storeCapacityRemaining(): number {
    return this.storeCapacity - this.storeCount;
  }

  getTasks(): Task[] {
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

    let closestSource = <Source>(
      this.pos.findClosestInRange(this.room.sources, 2)
    );
    let nearExtractor = false;
    if (this.room.extractor != null) {
      nearExtractor = this.pos.inRangeTo(this.room.extractor.pos, 2) === true;
    }

    if (closestSource == null && !nearExtractor) {
      let container = Ptr.from<StoreContainerLike>(this);
      let transferEnergyTask = new TransferResource(
        [container],
        RESOURCE_ENERGY,
        null,
        new CollectOptions(null, [["near_dropped"], ["container"], ["dropped"]]),
        container
      );
      transferEnergyTask.priority = TaskPriority.Low;
      transferEnergyTask.name =
        "Fill " + container.toHtml();
      tasks.push(transferEnergyTask);
    }

    return tasks;
  }

  collect(collector: any, claimReceipt: ClaimReceipt): number {
    if (claimReceipt.target !== this) {
      return ERR_INVALID_TARGET;
    }

    if (
      collector.withdraw != null &&
      collector.carryCapacityRemaining != null
    ) {
      return collector.withdraw(
        this,
        claimReceipt.resourceType,
        Math.min(
          this.store[claimReceipt.resourceType],
          collector.carryCapacityRemaining
        )
      );
    }

    return ERR_INVALID_ARGS;
  }

  makeClaim(
    claimer: any,
    resourceType: string,
    amount: number,
    minAmount: number,
    isExtended?: boolean
  ): ClaimReceipt {
    if (this.claims[resourceType] == null) {
      this.claims[resourceType] = 0;
    }

    let claimAmount = amount;
    let remaining = this.store[resourceType] - this.claims[resourceType];
    // ensure our remaining resource meets their claim
    if (claimAmount > remaining) {
      if (minAmount > remaining) {
        return null;
      }

      claimAmount = remaining;
    }

    this.claims.count++;
    this.claims[resourceType] += claimAmount;

    return new ClaimReceipt(this, "container", resourceType, claimAmount);
  }

  private get claims(): Claims {
    return Remember.byName(`container.${this.id}`, `claims`, () => {
      return new Claims(this);
    });
  }
}

class Claims {
  constructor(private container: StructureContainer) {}

  count: number = 0;
}
