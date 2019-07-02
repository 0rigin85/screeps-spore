import { Actions } from './generated/actions_generated';
import { Ptr } from '../Ptr';

export class Actor {
  static _cache = new Map<number, Ptr<any>>();

  static resolve<T extends RoomObject>(o: Actions.Actor): T {
    const hash = o.hash();
    let ptr = Actor._cache.get(hash)

    if (ptr != null) {
      return ptr.instance;
    }

    ptr = Ptr.fromString(o.ref());
    Actor._cache.set(hash, ptr);

    return ptr.instance;
  }
}
