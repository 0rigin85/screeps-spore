import { ClaimReceipt } from './ClaimReceipt';
import { BodyDefinition } from './BodyDefinition';
import { Remember } from './Remember';

export class SporeSpawn extends StructureSpawn implements Claimable {
  doIgnore: boolean;
  doFavor: boolean;
  doTrack: boolean;
  get energyCapacityRemaining(): number {
    return this.energyCapacity - this.energy;
  }

  getBody(creepBody: BodyDefinition, energyCapacityAvailable?: number): BodyPartConstant[] {
    if (energyCapacityAvailable == null) {
      energyCapacityAvailable = this.room.energyCapacityAvailable;
    }

    let body: BodyPartConstant[] = [];
    let bodyCost = 0;

    let totalRequirements = creepBody.requirements.length;
    let startingRequirementIndex = 0;
    let requiredPartsAdded: number[] = [];
    for (let index = 0; index < 50; ++index) {
      let cost = null;
      let requirementIndex = startingRequirementIndex;

      if (requirementIndex >= totalRequirements) {
        requirementIndex = 0;
        startingRequirementIndex = totalRequirements - 1;
      }

      do {
        let requirement = creepBody.requirements[requirementIndex];

        if (requiredPartsAdded[requirementIndex] == null || requiredPartsAdded[requirementIndex] < requirement.max) {
          cost = BODYPART_COST[requirement.type] * requirement.increment;
          startingRequirementIndex = requirementIndex + 1;
          break;
        }

        requirementIndex++;
        if (requirementIndex >= totalRequirements) {
          requirementIndex = 0;
        }
      } while (startingRequirementIndex != requirementIndex);

      if (cost == null) {
        break;
      } else if (bodyCost + cost <= energyCapacityAvailable) {
        bodyCost += cost;

        let requirement = creepBody.requirements[startingRequirementIndex - 1];

        if (requiredPartsAdded[startingRequirementIndex - 1] == null) {
          requiredPartsAdded[startingRequirementIndex - 1] = 0;
        }

        let originalRequiredPartsAdded = Math.floor(requiredPartsAdded[startingRequirementIndex - 1]);
        requiredPartsAdded[startingRequirementIndex - 1] += requirement.increment;
        let totalIncrement = Math.floor(requiredPartsAdded[startingRequirementIndex - 1]) - originalRequiredPartsAdded;

        for (let increment = 0; increment < totalIncrement; ++increment) {
          if (requirement.type === TOUGH) {
            body.unshift(requirement.type);
          } else {
            body.push(requirement.type);
          }
        }
      } else {
        break;
      }
    }

    return body.reverse();
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

  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt {
    if (
      resourceType != RESOURCE_ENERGY || // ensure they are trying to claim energy
      amount > this.energy - this.claims.energy
    ) {
      // ensure our remaining energy meets their claim
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

    return new ClaimReceipt(this, 'spawn', resourceType, claimAmount);
  }

  private get claims(): Claims {
    return Remember.byName(
      `spawn.${this.id}`,
      `claims`,
      function() {
        return new Claims(this);
      }.bind(this)
    );
  }
}

class Claims {
  constructor(private spawn: SporeSpawn) {}

  count: number = 0;
  energy: number = 0;
}
