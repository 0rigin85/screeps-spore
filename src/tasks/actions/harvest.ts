import { Screeps } from '../generated/actions_generated';

export type ActorCache = Record<number, Ptr<any>>;

export class Harvest {
    static execute(data: Screeps.Creep.Harvest, state: any, actorCache?: ActorCache ): number {

        actorCache[data.actor.hash()]
        

        let source = Ptr.fromProto<Creep>();

        if (source == null) {
            return ERR_INVALID_ARGS;
        }

        let target = Ptr.fromProto<Source>(data.target);

        if (target == null) {
            return ERR_INVALID_ARGS;
        }

        return source.instance.harvest(target.instance);
    }
}