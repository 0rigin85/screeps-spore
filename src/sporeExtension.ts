import { ClaimReceipt } from "./ClaimReceipt";
import { Remember } from "./Remember";

export class SporeExtension extends StructureExtension implements Claimable {
  get energyCapacityRemaining(): number {
    return this.energyCapacity - this.energy;
  }

  collect(collector: any, claimReceipt: ClaimReceipt): number {
    if (claimReceipt.target !== this) {
      return ERR_INVALID_TARGET;
    }

    if (
      claimReceipt.resourceType === RESOURCE_ENERGY &&
      collector.withdraw != null &&
      collector.carryCapacityRemaining != null
    ) {
      return collector.withdraw(
        this,
        claimReceipt.resourceType,
        Math.min(this.energy, collector.carryCapacityRemaining)
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
    if (resourceType != RESOURCE_ENERGY) {
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

    return new ClaimReceipt(this, "spawn", resourceType, claimAmount);
  }

  private get claims(): Claims {
    return Remember.byName(`extension.${this.id}`, `claims`, () => {
      return new Claims(this);
    });
  }
}

class Claims {
  constructor(private extension: StructureExtension) {}

  count: number = 0;
  energy: number = 0;
}
