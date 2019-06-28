import { Screeps } from '../generated/actions_generated';

export class untilFailure {
    execute(data: Screeps.Creep.untilFailure): number {
        let source = Ptr.fromProto<Creep>(data.source);
        let target = Ptr.fromProto<Source>(data.target);

        return source.instance.harvest(target.instance);
    }
}