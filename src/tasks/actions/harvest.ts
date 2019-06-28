import { Screeps } from '../generated/actions_generated';

export class Harvest {
    execute(data: Screeps.Creep.Harvest): number {
        let source = Ptr.fromProto<Creep>(data.source);
        let target = Ptr.fromProto<Source>(data.target);

        return source.instance.harvest(target.instance);
    }
}