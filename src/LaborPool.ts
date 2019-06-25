import { LaborPoolType } from './LaborPoolType';
export class LaborPool {
  types: Record<string, LaborPoolType> = {};
  addCreep(creep: Creep): void {
    if (creep.type == null) {
      return;
    }
    if (this.types[creep.type] == null) {
      this.types[creep.type] = new LaborPoolType({}, 0);
    }
    this.types[creep.type].count++;
    for (let part of creep.body) {
      if (part.hits > 0) {
        this.types[creep.type].parts[part.type]++;
      }
    }
  }
}
