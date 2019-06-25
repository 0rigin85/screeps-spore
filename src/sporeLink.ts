import { ClaimReceipt } from './ClaimReceipt';
import { Remember } from './Remember';
import { Bond } from './Bond';

export class SporeLink extends StructureLink implements Claimable {
  get energyCapacityRemaining(): number {
    return this.energyCapacity - this.energy;
  }

  get takesTransfers(): boolean {
    return this.memory.takesTransfers === true;
  }

  set takesTransfers(value: boolean) {
    this.memory.takesTransfers = value;
  }

  _bond: Bond;
  get bond(): Bond {
    if (this._bond != null) {
      return this._bond;
    }

    if (this.memory.bondTargetId != null) {
      this._bond = new Bond();
      this._bond.type = this.memory.bondType;
      this._bond.targetId = this.memory.bondTargetId;
      this._bond.target = Game.getObjectById<RoomObject>(this.memory.bondTargetId);
      this._bond.targetFlag = Game.flags[this.memory.bondTargetFlagName];
      this._bond.myFlag = Game.flags[this.memory.bondMyFlagName];

      if (!this._bond.exists()) {
        this._bond = null;
        delete this.memory.bondTargetId;
        delete this.memory.bondTargetFlagName;
        delete this.memory.bondMyFlagName;
        delete this.memory.bondType;
      } else if (this._bond.targetId == null && this._bond.targetFlag.room != null) {
        if (this._bond.targetFlag.room != null) {
          let found = this._bond.targetFlag.room.lookForAt(this._bond.type, this._bond.targetFlag);

          if (found.length > 0) {
            this._bond.target = found[0] as RoomObject;
          }
        }

        if (this._bond.target != null) {
          this._bond.targetId = this._bond.target.id;
        }

        if (this._bond.target == null) {
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

  set bond(value: Bond) {
    this._bond = value;

    if (value == null) {
      delete this.memory.bondType;
      delete this.memory.bondTargetId;
      delete this.memory.bondTargetFlagName;
      delete this.memory.bondMyFlagName;
    } else {
      this.memory.bondType = value.type;

      if (value.target != null) {
        this.memory.bondTargetId = value.target.id;
      }

      if (value.targetFlag != null) {
        this.memory.bondTargetFlagName = value.targetFlag.name;
      }

      if (value.myFlag != null) {
        this.memory.bondMyFlagName = value.myFlag.name;
      }
    }
  }

  get nearBySource(): Source {
    return Remember.byName(`link.${this.id}`, `nearBySource`, () => {
      if (this.memory.nearBySourceId != null) {
        return Game.getObjectById<Source>(this.memory.nearBySourceId);
      }

      let nearBySource = <Source>this.pos.findClosestInRange(this.room.sources, 2);

      if (nearBySource == null) {
        this.memory.nearBySourceId = '';
      } else {
        this.memory.nearBySourceId = nearBySource.id;
      }

      return nearBySource;
    });
  }

  get memory(): LinkMemory {
    let roomMemory = this.room.memory;

    if (roomMemory.structures == null) {
      roomMemory.structures = {};
    }

    let memory: any = roomMemory.structures[this.id];

    if (memory == null) {
      memory = {};
      roomMemory.structures[this.id] = memory;
    }

    return memory;
  }

  getTasks(): Task[] {
    this.memory.takesTransfers = false;

    let transferTarget = null;
    let tasks: Task[] = [];
    //
    // if (this.bond == null)
    // {
    //     this.bond = Bond.discover(this, LOOK_SOURCES);
    // }
    //
    // if (this.bond != null)
    // {
    //     let target: any = this.bond.target;
    //
    //     if (target == null)
    //     {
    //         target = this.bond.targetFlag.pos;
    //     }
    //
    //     let transferEnergyTask = new TransferResource([ScreepsPtr.from<EnergyContainerLike>(this)], RESOURCE_ENERGY, ScreepsPtr.from<Source>(target), null);
    //     transferEnergyTask.priority = TaskPriority.Mandatory;
    //     transferEnergyTask.name = "Transfer energy to " + this + " from " + target;
    //     transferEnergyTask.possibleWorkers = 1;
    //     tasks.push(transferEnergyTask);
    // }
    // else
    // {
    if (this.nearBySource == null) {
      this.takesTransfers = true;
    }
    if (this.id === '5d0ae2635bf1730d8cfefd35') {
      this.takesTransfers = false;
    }
    // }
    //
    if (this.energy > 0 && !this.takesTransfers) {
      transferTarget = this.findLinkTakingTransfers();

      if (transferTarget != null) {
        this.transferEnergy(transferTarget);
      }
    }

    return tasks;
  }

  findLinkTakingTransfers(): StructureLink {
    for (let link of this.room.links) {
      if (link.takesTransfers === true && link.energyCapacityRemaining > 0) {
        return link;
      }
    }

    return null;
  }

  collect(collector: any, claimReceipt: ClaimReceipt): number {
    if (claimReceipt.target !== this) {
      return ERR_INVALID_TARGET;
    }

    if (collector.withdraw != null && collector.carryCapacityRemaining != null) {
      return collector.withdraw(
        this,
        claimReceipt.resourceType,
        Math.min(this.energy, collector.carryCapacityRemaining)
      );
    }

    return ERR_INVALID_ARGS;
  }

  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt {
    if (
      this.takesTransfers !== true || // ensure this is a pick up location
      resourceType != RESOURCE_ENERGY
    ) {
      // ensure they are trying to claim energy
      return null;
    }

    let claimAmount = amount;
    let remaining = this.energy - this.claims.energy;

    // ensure our remaining resource meets their claim
    if (claimAmount > remaining) {
      if (minAmount > remaining) {
        return null;
      }

      claimAmount = remaining;
    }

    this.claims.count++;
    this.claims.energy += claimAmount;

    return new ClaimReceipt(this, 'link', resourceType, claimAmount);
  }

  private get claims(): Claims {
    return Remember.byName(`link.${this.id}`, `claims`, () => {
      return new Claims(this);
    });
  }
}

class Claims {
  constructor(private link: StructureLink) {}

  count: number = 0;
  energy: number = 0;
}
