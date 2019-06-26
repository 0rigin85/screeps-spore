export class Ptr<T extends RoomObject> implements RoomObject {
  doIgnore: boolean;
  doFavor: boolean;
  doTrack: boolean;
  memory: RoomObjectMemory;
  prototype: RoomObject;
  effects: RoomObjectEffect[];
  pos: RoomPosition;
  lookType: LookConstant;
  lookTypeModifier: string;
  id: string;

  private cache: PtrCache<T>;

  public toString = (): string => {
    let look = '';
    let position = '';
    if (this.lookType != null) {
      if (this.lookTypeModifier != null) {
        look = `${this.lookType} (${this.lookTypeModifier})`;
      } else {
        look = `${this.lookType}`;
      }
    }

    if (this.pos != null && this.lookType !== LOOK_FLAGS) {
      position = ` {room ${this.pos.roomName} pos ${this.pos.x}, ${this.pos.y} }`;
    }
    // [structure (container) {room E53S36 20,30}]
    // [flag (Flag01)]
    // [source {room E53S36 20,30}]
    return `[${look}${position}]`;
  };

  public toHtml = (): string => {
    return `<font color='#ff4500'>[${this.toString()}]</font>`;
  };

  get room(): Room {
    if (this.resolve().isValid) {
      return this.cache.instance.room;
    }
    return null;
  }

  get isValid(): boolean {
    return this.resolve().isValid;
  }

  get isShrouded(): boolean {
    this.resolve();
    return this.cache.isValid && this.cache.instance == null;
  }

  get instance(): T {
    return this.resolve().instance;
  }

  resolve(): PtrCache<T> {
    if (this.cache != null) {
      return this.cache;
    }
    this.cache = { instance: null, isValid: true };
    if (this.id != null) {
      this.cache.instance = Game.getObjectById<T>(this.id);
      if (this.cache.instance != null) {
        return this.cache;
      } else if (this.pos == null || Game.rooms[this.pos.roomName] != null) {
        // if we lack a position then we can't move towards the target.
        // if we have a position but we can see into that room and still
        // didn't find the id then we can't move towards the target.
        this.cache.isValid = false;
        return this.cache;
      }
    }
    if (this.lookType === LOOK_FLAGS) {
      this.cache.instance = <T>(<any>Game.flags[this.lookTypeModifier]);
      // Flags go invalid immediately once they have been removed, as you can see them from any room
      if (this.cache.instance == null) {
        this.cache.isValid = false;
      }
    } else if (this.pos != null) {
      if (Game.rooms[this.pos.roomName] != null) {
        let room = Game.rooms[this.pos.roomName];
        if (this.lookTypeModifier == null) {
          let foundObjects = room.lookForAt(this.lookType, this.pos);
          if (foundObjects.length == 1) {
            this.cache.instance = (foundObjects[0] as unknown) as T;
          } else {
            this.cache.isValid = false;
          }
        } else if (this.lookType == LOOK_STRUCTURES || this.lookType == LOOK_CONSTRUCTION_SITES) {
          let foundObjects = room.lookForAt(this.lookType, this.pos);
          this.cache.instance = _.find<T>(
            <any>foundObjects,
            function(o: Structure | ConstructionSite) {
              return o.structureType === this.lookTypeModifier;
            }.bind(this)
          );
          if (this.cache.instance == null) {
            this.cache.isValid = false;
          }
        }
      }
    } else {
      this.cache.isValid = false;
    }
    return this.cache;
  }

  static fromPosition<T extends RoomObject>(
    pos: RoomPosition,
    lookType: LookConstant,
    lookTypeModifier: string
  ): Ptr<T> {
    let promise = new Ptr<T>();
    promise.pos = pos;
    promise.lookType = lookType;
    promise.lookTypeModifier = lookTypeModifier;
    return promise;
  }

  static from<T extends RoomObject>(object: T): Ptr<T> {
    let promise = new Ptr<T>();
    promise.id = (<any>object).id;
    promise.pos = object.pos;
    promise.cache = { instance: object, isValid: true };
    if (object instanceof Creep) {
      promise.lookType = LOOK_CREEPS;
    } else if (object instanceof Resource) {
      promise.lookType = LOOK_RESOURCES;
    } else if (object instanceof Source) {
      promise.lookType = LOOK_SOURCES;
    } else if (object instanceof Structure) {
      promise.lookType = LOOK_STRUCTURES;
      promise.lookTypeModifier = (<Structure>(<any>object)).structureType;
    } else if (object instanceof Flag) {
      promise.lookType = LOOK_FLAGS;
      promise.lookTypeModifier = (<Flag>(<any>object)).name;
    } else if (object instanceof ConstructionSite) {
      promise.lookType = LOOK_CONSTRUCTION_SITES;
      promise.lookTypeModifier = (<Structure>(<any>object)).structureType;
    }
    return promise;
  }

  static fromString<T extends RoomObject>(object: string): Ptr<T> {
    let promise = new Ptr<T>();


    return promise;
  }
}
