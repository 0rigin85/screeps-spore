export const OBJECT_CREEP = 'creep';
export const OBJECT_SOURCE = 'source';
export const OBJECT_FLAG = 'flag';
export const OBJECT_CONSTRUCTION_SITE = 'site';
export const OBJECT_NUKE = 'nuke';
export const OBJECT_TOMBSTONE = 'tombstone';
export const OBJECT_POWER_CREEP = 'powerCreep';

interface LOOK_DECODER {
  type: LookConstant;
  modifier: string;
}

const LOOK_DECODER: Record<string, LOOK_DECODER> = {};
LOOK_DECODER[STRUCTURE_CONTAINER] = { type: LOOK_STRUCTURES, modifier: 'container' };
LOOK_DECODER[STRUCTURE_CONTROLLER] = { type: LOOK_STRUCTURES, modifier: 'controller' };
LOOK_DECODER[STRUCTURE_EXTENSION] = { type: LOOK_STRUCTURES, modifier: 'extension' };
LOOK_DECODER[STRUCTURE_EXTRACTOR] = { type: LOOK_STRUCTURES, modifier: 'extractor' };
LOOK_DECODER[STRUCTURE_KEEPER_LAIR] = { type: LOOK_STRUCTURES, modifier: 'keeperLair' };
LOOK_DECODER[STRUCTURE_LAB] = { type: LOOK_STRUCTURES, modifier: 'lab' };
LOOK_DECODER[STRUCTURE_LINK] = { type: LOOK_STRUCTURES, modifier: 'link' };
LOOK_DECODER[STRUCTURE_NUKER] = { type: LOOK_STRUCTURES, modifier: 'nuker' };
LOOK_DECODER[STRUCTURE_OBSERVER] = { type: LOOK_STRUCTURES, modifier: 'observer' };
LOOK_DECODER[STRUCTURE_POWER_BANK] = { type: LOOK_STRUCTURES, modifier: 'powerBank' };
LOOK_DECODER[STRUCTURE_POWER_SPAWN] = { type: LOOK_STRUCTURES, modifier: 'powerSpawn' };
LOOK_DECODER[STRUCTURE_PORTAL] = { type: LOOK_STRUCTURES, modifier: 'portal' };
LOOK_DECODER[STRUCTURE_RAMPART] = { type: LOOK_STRUCTURES, modifier: 'rampart' };
LOOK_DECODER[STRUCTURE_ROAD] = { type: LOOK_STRUCTURES, modifier: 'road' };
LOOK_DECODER[STRUCTURE_SPAWN] = { type: LOOK_STRUCTURES, modifier: 'spawn' };
LOOK_DECODER[STRUCTURE_STORAGE] = { type: LOOK_STRUCTURES, modifier: 'storage' };
LOOK_DECODER[STRUCTURE_TERMINAL] = { type: LOOK_STRUCTURES, modifier: 'terminal' };
LOOK_DECODER[STRUCTURE_TOWER] = { type: LOOK_STRUCTURES, modifier: 'tower' };
LOOK_DECODER[STRUCTURE_WALL] = { type: LOOK_STRUCTURES, modifier: 'constructedWall' };
LOOK_DECODER[OBJECT_CONSTRUCTION_SITE] = { type: LOOK_CONSTRUCTION_SITES, modifier: null };
LOOK_DECODER[OBJECT_CREEP] = { type: LOOK_CREEPS, modifier: null };
LOOK_DECODER[OBJECT_FLAG] = { type: LOOK_FLAGS, modifier: null };
LOOK_DECODER[OBJECT_NUKE] = { type: LOOK_NUKES, modifier: null };
LOOK_DECODER[OBJECT_SOURCE] = { type: LOOK_SOURCES, modifier: null };
LOOK_DECODER[OBJECT_TOMBSTONE] = { type: LOOK_TOMBSTONES, modifier: null };
LOOK_DECODER[OBJECT_POWER_CREEP] = { type: LOOK_POWER_CREEPS, modifier: null };
LOOK_DECODER[RESOURCE_ENERGY] = { type: LOOK_ENERGY, modifier: null };

for (let resourceType in REACTIONS) {
  LOOK_DECODER[resourceType] = { type: LOOK_RESOURCES, modifier: resourceType };
}

interface PtrResolution<T> {
  instance: T;
  isValid: boolean;
}

export class Ptr<T extends RoomObject> {
  prototype: RoomObject;

  pos: RoomPosition;
  id: string;
  type: PtrTypeConstant;
  modifier: string;

  private _string: string;
  private _resolution: PtrResolution<T>;

  public toJSON = (key: string): string => {
    return this.toString();
  };

  public toString = (): string => {
    // container #7a32f382c0a109da36a46a10 E53S36:20,30
    // flag ~Flag01~ E53S36:20,30
    // source #7a32f382c0a109da36a46a10 E53S36:20,30
    // storage E53S36:20,30
    if (this._string != null) {
      return this._string;
    }

    if (this.id != null) {
      if (this.modifier != null) {
        this._string = `${this.type} ~${this.modifier}~ #${this.id} ${this.pos.roomName}:${this.pos.x},${this.pos.y}`;
      } else {
        this._string = `${this.type} #${this.id} ${this.pos.roomName}:${this.pos.x},${this.pos.y}`;
      }
    } else {
      if (this.modifier != null) {
        this._string = `${this.type} ~${this.modifier}~ ${this.pos.roomName}:${this.pos.x},${this.pos.y}`;
      } else {
        this._string = `${this.type} ${this.pos.roomName}:${this.pos.x},${this.pos.y}`;
      }
    }

    return this._string;
  };

  public toHtml(): string {
    return `<font color='#ff4500'>[${this.toString()}]</font>`;
  }

  get room(): Room {
    if (this.resolve().isValid) {
      return this._resolution.instance.room;
    }
    return null;
  }

  get isValid(): boolean {
    return this.resolve().isValid;
  }

  get isShrouded(): boolean {
    this.resolve();
    return this._resolution.isValid && this._resolution.instance == null;
  }

  get instance(): T {
    return this.resolve().instance;
  }

  private resolve(): PtrResolution<T> {
    if (this._resolution != null) {
      return this._resolution;
    }

    this._resolution = { instance: null, isValid: true };

    if (this.id != null) {
      this._resolution.instance = Game.getObjectById<T>(this.id);

      if (this._resolution.instance != null) {
        return this._resolution;
      } else if (this.pos == null || Game.rooms[this.pos.roomName] != null) {
        // if we lack a position then we can't move towards the target.
        // if we have a position but we can see into that room and still
        // didn't find the id then we can't move towards the target.
        this._resolution.isValid = false;
        return this._resolution;
      }
    }

    if (this.type === LOOK_FLAGS) {
      if (this.modifier == null || this.modifier.length === 0) {
        this._resolution.isValid = false;
        return this._resolution;
      }

      this._resolution.instance = <T>(<any>Game.flags[this.modifier]);

      // Flags go invalid immediately once they have been removed, as you can see them from any room
      if (this._resolution.instance == null) {
        this._resolution.isValid = false;
      }
    } else if (this.pos != null) {
      if (Game.rooms[this.pos.roomName] != null) {
        let room = Game.rooms[this.pos.roomName];

        const look = LOOK_DECODER[this.type];

        if (look.modifier == null) {
          let foundObjects = room.lookForAt(look.type, this.pos);

          if (foundObjects.length == 1) {
            this._resolution.instance = (foundObjects[0] as unknown) as T;
          } else {
            this._resolution.isValid = false;
          }
        } else if (look.type === LOOK_STRUCTURES || look.type === LOOK_CONSTRUCTION_SITES) {
          let foundObjects = room.lookForAt(look.type, this.pos);
          this._resolution.instance = _.find<T>(
            <any>foundObjects,
            function(o: Structure | ConstructionSite) {
              return o.structureType === look.modifier;
            }.bind(this)
          );

          if (this._resolution.instance == null) {
            this._resolution.isValid = false;
          }
        } else if (look.type === LOOK_RESOURCES) {
          let foundObjects = room.lookForAt(look.type, this.pos);
          this._resolution.instance = _.find<T>(
            <any>foundObjects,
            function(o: Resource) {
              return o.resourceType === look.modifier;
            }.bind(this)
          );

          if (this._resolution.instance == null) {
            this._resolution.isValid = false;
          }
        }
      }
    } else {
      this._resolution.isValid = false;
    }

    return this._resolution;
  }

  static fromPosition<T extends RoomObject>(pos: RoomPosition, type: PtrTypeConstant, modifier?: string): Ptr<T> {
    let pointer = new Ptr<T>();
    pointer.pos = pos;
    pointer.type = type;
    pointer.modifier = modifier;

    return pointer;
  }

  static from<T extends RoomObject>(object: T): Ptr<T> {
    if (object == null) {
      return null;
    }

    let pointer = new Ptr<T>();
    pointer.id = (<any>object).id;
    pointer.pos = object.pos;
    pointer._resolution = { instance: object, isValid: true };

    if (object instanceof Creep) {
      pointer.type = OBJECT_CREEP;
    } else if (object instanceof Resource) {
      pointer.type = (object as Resource).resourceType;
    } else if (object instanceof Source) {
      pointer.type = OBJECT_SOURCE;
    } else if (object instanceof Structure) {
      pointer.type = (object as Structure).structureType;
    } else if (object instanceof Flag) {
      pointer.type = OBJECT_FLAG;
      pointer.modifier = (object as Flag).name;
    } else if (object instanceof ConstructionSite) {
      pointer.type = OBJECT_CONSTRUCTION_SITE;
      pointer.modifier = (object as ConstructionSite).structureType;
    } else if (object instanceof Source) {
      pointer.type = OBJECT_SOURCE;
    } else if (object instanceof Tombstone) {
      pointer.type = OBJECT_TOMBSTONE;
    } else if (object instanceof PowerCreep) {
      pointer.type = OBJECT_POWER_CREEP;
    } else if (object instanceof Nuke) {
      pointer.type = OBJECT_NUKE;
    } else {
      return null;
    }

    return pointer;
  }

  static fromProto<T extends RoomObject>(proto: any): Ptr<T> {
    return null;
  }

  static fromString<T extends RoomObject>(value: string): Ptr<T> {
    if (value == null || value.length === 0) {
      return null;
    }

    let type: PtrTypeConstant;
    let id: string;
    let modifier: string;
    let position: string;
    let roomName: string;
    let x: number;
    let y: number;

    let slidingIndex = value.indexOf(' ');
    if (slidingIndex < 0) {
      console.log('ERROR: PTR01');
      return null;
    }

    type = value.slice(0, slidingIndex) as PtrTypeConstant;
    if (type == null || type.length < 0) {
      console.log('ERROR: PTR02');
      return null;
    }

    let nextIndex;
    if (value[slidingIndex + 1] === '~') {
      nextIndex = value.indexOf('~', slidingIndex + 2);
      if (nextIndex < 0) {
        console.log('ERROR: PTR03');
        return null;
      }

      modifier = value.slice(slidingIndex + 1, nextIndex);
      if (modifier == null || modifier.length < 0) {
        console.log('ERROR: PTR04');
        return null;
      }

      slidingIndex = nextIndex;
    }

    nextIndex = value.indexOf(' ', slidingIndex + 1);
    if (nextIndex < 0) {
      console.log('ERROR: PTR05');
      return null;
    }

    let nextValue = value.slice(slidingIndex + 1, nextIndex);
    if (nextValue == null || nextValue.length < 0) {
      console.log('ERROR: PTR06');
      return null;
    }

    if (nextValue[0] === '#') {
      id = nextValue.slice(1, nextValue.length);
      slidingIndex = nextIndex;

      nextValue = value.slice(slidingIndex + 1);
      if (nextValue == null || nextValue.length < 0) {
        console.log('ERROR: PTR08');
        return null;
      }
    }

    position = nextValue;

    let temp = position.split(':');
    if (temp.length != 2) {
      console.log('ERROR: PTR09 ' + value + ` - ${type}, ${id}, ${modifier}, ${position}, ${slidingIndex}`);
      return null;
    }
    roomName = temp[0];

    if (roomName == null) {
      console.log('ERROR: PTR10');
      return null;
    }

    temp = temp[1].split(',');
    if (temp.length != 2) {
      console.log('ERROR: PTR11');
      return null;
    }

    x = +temp[0];
    if (x == null || x > 49 || x < 0) {
      console.log('ERROR: PTR12');
      return null;
    }

    y = +temp[1];
    if (y == null || y > 49 || y < 0) {
      console.log('ERROR: PTR13');
      return null;
    }

    let pointer = new Ptr<T>();
    pointer.id = id;
    pointer.type = type;
    pointer.modifier = modifier;
    pointer.pos = new RoomPosition(x, y, roomName);
    pointer._string = value;

    return pointer;
  }
}
