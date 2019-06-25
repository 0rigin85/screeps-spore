import { BodyDefinition } from './BodyDefinition';
import { SpawnRequest } from './SpawnRequest';

export class SpawnAppointment extends SpawnRequest {
  constructor(
    public id: string,
    public task: Task,
    public spawnPriority: number,
    public spawn: StructureSpawn,
    public ticksTillRequired: number,
    public replacingCreep: Creep,
    public creepBody: BodyDefinition
  ) {
    super(id, task, replacingCreep, creepBody);
  }
}
