import { Actions } from '../generated/actions_generated';
import { Actor } from '../actorResolver';

export class Harvest {
    static execute(data: Actions.Harvest, state: any): number {
        let creep = Actor.resolve<Creep>(data.actor());
        let target = Actor.resolve<Source|Mineral>(data.harvest());

        if (creep == null || target == null) {
            return ERR_INVALID_ARGS;
        }

        return creep.harvest(target);
    }
}