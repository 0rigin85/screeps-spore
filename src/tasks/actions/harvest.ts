import { Actions } from '../generated/actions_generated';
import { Actor } from '../actorResolver';

export class Harvest {
  static execute(data: Actions.Harvest, state: any): number {
    let creep = Actor.resolve<Creep>(data.actor());
    let target = Actor.resolve<Source | Mineral>(data.harvest());

    if (creep == null || target == null) {
      return ERR_INVALID_ARGS;
    }

    return creep.harvest(target);
  }

  static compile(env: Environment, obj: any): Actions.Harvest {

    if (!compile_actor(obj.harvest)) {
      return undefined;
    }

    if (!compile_actor(obj.creep)) {
      return undefined;
    }
    

    compile_nextactions(obj);

    if (obj.harvest) {
        if (obj.harvest instanceof Ptr<any>) {

        }
    } 

    env.actors

    Actions.Actor.startActor(builder);
    Actions.Actor.addHash(builder, Hash.string(sourceRef));
    Actions.Actor.addRef(builder, sourceStr);
    let sourceActor = Actions.Actor.endActor(builder);

    Actions.Harvest.startNextVector(builder, 1);
    Actions.NextAction.createNextAction(builder, null, 1);
    let next = builder.endVector();

    Actions.Harvest.startMoveTo(builder);
    Actions.Harvest.addIndex(builder, 0);
    Actions.Harvest.addActor(builder, creepActor);
    Actions.Harvest.addMoveTo(builder, sourceActor);
    Actions.Harvest.addNext(builder, nextMoveTo);
    let moveTo = Actions.MoveTo.endMoveTo(builder);
  }
}

// { harvest: source, creep: obj,
//   ERR_NOT_ENOUGH_RESOURCES: OK
// }