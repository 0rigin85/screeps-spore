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
}
