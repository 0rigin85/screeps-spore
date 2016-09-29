import {BodyDefinition} from "./bodyDefinition";
import {Task} from "./task";

export class SpawnRequest
{
    constructor(
        public id: string,
        public task: Task,
        public replacingCreep: Creep,
        public creepBody: BodyDefinition)
    { }
}

export class SpawnAppointment implements SpawnRequest
{
    constructor(
        public id: string,
        public task: Task,
        public spawnPriority: number,
        public spawn: Spawn,
        public ticksTillRequired: number,
        public replacingCreep: Creep,
        public creepBody: BodyDefinition)
    { }
}