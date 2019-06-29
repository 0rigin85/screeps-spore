import { BodyPartRequirements } from './BodyPartRequirements';

export class BodyDefinition {

  constructor(public name: string) {
    this.requirements = [];
  }

  requirements: BodyPartRequirements[];

  getPossibleParts(part: string): number {
    for (let requirement of this.requirements) {
      if (requirement.type === part) {
        return requirement.max;
      }
    }
    return 0;
  }

  get minEnergyCost(): number {
    let value = 0;
    
    for (const requirement of this.requirements) {
      value += requirement.min * BODYPART_COST[requirement.type];
    } 

    return value;
  }

  get maxEnergyCost(): number {
    let value = 0;
    
    for (const requirement of this.requirements) {
      value += requirement.max * BODYPART_COST[requirement.type];
    } 

    return value;
  }
}
