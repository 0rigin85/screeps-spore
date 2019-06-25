import { Task, ERR_NO_WORK } from '../task';
import { TaskPriority } from '../TaskPriority';
import { Ptr } from '../Ptr';

export class RecycleCreep extends Task {
  constructor(public spawn: Ptr<StructureSpawn>) {
    super(false);
    this.id = 'Recycle ' + spawn;
    this.priority = TaskPriority.MediumHigh;
    this.name = 'Recycling at ' + spawn;
    this.possibleWorkers = -1;
    this.near = spawn;
  }

  getPrioritizingConditions(conditions: Array<any>): void {
    conditions.push((creep: Creep) => {
      return (50 - creep.body.length) / 50;
    });
  }

  isIdeal(object: RoomObject): boolean {
    return false;
  }

  schedule(object: RoomObject): number {
    if (this.possibleWorkers === 0 || !this.spawn.isValid || !(object instanceof Creep)) {
      return ERR_NO_WORK;
    }

    let creep = <Creep>object;
    let code = creep.goRecycle(this.spawn);

    if (code == OK && this.possibleWorkers > 0) {
      this.possibleWorkers--;
    }

    return code;
  }
}
