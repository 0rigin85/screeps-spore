import { BodyDefinition } from './BodyDefinition';
export class SpawnRequest {
  constructor(public id: string, public task: Task, public replacingCreep: Creep, public creepBody: BodyDefinition) {}
}
