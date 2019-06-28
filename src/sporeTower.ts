import { TransferResource } from "./tasks/taskTransferResource";
import { TaskPriority } from "./tasks/TaskPriority";
import { Remember } from "./Remember";
import { Ptr } from "./Ptr";
import { CollectOptions } from "./CollectOptions";

export class SporeTower extends StructureTower implements Claimable
{
    _attackTarget: Creep;
    get attackTarget(): Creep
    {
        if (this._attackTarget != null)
        {
            return this._attackTarget;
        }

        if (this.memory.attackTargetId != null)
        {
            this._attackTarget = Game.getObjectById<Creep>(this.memory.attackTargetId);
        }

        return this._attackTarget;
    }

    set attackTarget(value: Creep)
    {
        this._attackTarget = value;

        if (value != null && value.id != null)
        {
            this.memory.attackTargetId = value.id;
        }
        else
        {
            delete this.memory.attackTargetId;
        }
    }

    get energyCapacityRemaining(): number
    {
        return this.energyCapacity - this.energy;
    }

    get memory(): TowerMemory
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

        return memory;
    }

    getTasks(): Task[]
    {
        let tasks: Task[] = [];

        if (this.energy < this.energyCapacity)
        {
            let transferEnergyTask = new TransferResource([Ptr.from<StructureTower>(this)], RESOURCE_ENERGY, null, new CollectOptions(null, [['near_dropped'], ['link', 'container','storage'], ['dropped']]));
            transferEnergyTask.priority = TaskPriority.Mandatory;
            transferEnergyTask.name = "Fill " + Ptr.from<StructureTower>(this).toHtml();
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
        return Remember.byName(`tower.${this.id}`, `claims`, () =>
        {
            return new Claims(this);
        });
    }
}

class Claims
{
    constructor(private tower: StructureTower)
    { }

    count: number = 0;
    energy: number = 0;
}
