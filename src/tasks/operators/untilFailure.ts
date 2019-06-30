import { Screeps } from '../generated/actions_generated';

export class untilFailure {
    execute(data: Screeps.Creep.untilFailure, state: any): number {
        return OK;
    }
}

// .\flatc.exe --ts --no-fb-import -o ./src/tasks/generated ./src/tasks/actions.fbs