import { SporeCostMatrixCache } from './sporeCostMatrix';
import { SporePathOptions } from './SporePathOptions';
import { SporeRoomPosition } from './sporeRoomPosition';

export var NON_WALKABLE: number = 255;
export var FORWARD: number = 1;
export var REVERSE: number = -1;

export var DIRECTION_OFFSETS = [];
DIRECTION_OFFSETS.push({ x: 0, y: 0 }); // NONE
DIRECTION_OFFSETS.push({ x: 0, y: -1 }); // TOP
DIRECTION_OFFSETS.push({ x: 1, y: -1 }); // TOP_RIGHT
DIRECTION_OFFSETS.push({ x: 1, y: 0 }); // RIGHT
DIRECTION_OFFSETS.push({ x: 1, y: 1 }); // BOTTOM_RIGHT
DIRECTION_OFFSETS.push({ x: 0, y: 1 }); // BOTTOM
DIRECTION_OFFSETS.push({ x: -1, y: 1 }); // BOTTOM_LEFT
DIRECTION_OFFSETS.push({ x: -1, y: 0 }); // LEFT
DIRECTION_OFFSETS.push({ x: -1, y: -1 }); // TOP_LEFT

export var OFFSETS_DIRECTION = [];
OFFSETS_DIRECTION.push([]);
OFFSETS_DIRECTION[0].push(TOP_LEFT);
OFFSETS_DIRECTION[0].push(LEFT);
OFFSETS_DIRECTION[0].push(BOTTOM_LEFT);

OFFSETS_DIRECTION.push([]);
OFFSETS_DIRECTION[1].push(TOP);
OFFSETS_DIRECTION[1].push(0);
OFFSETS_DIRECTION[1].push(BOTTOM);

OFFSETS_DIRECTION.push([]);
OFFSETS_DIRECTION[2].push(TOP_RIGHT);
OFFSETS_DIRECTION[2].push(RIGHT);
OFFSETS_DIRECTION[2].push(BOTTOM_RIGHT);

export class SporePath {
  get ops(): number {
    return this.memory.ops;
  }
  get cost(): number {
    return this.memory.cost;
  }
  get incomplete(): boolean {
    return this.memory.incomplete === true;
  }
  get needsUpdated(): boolean {
    return this.memory.needsUpdated;
  }
  set needsUpdated(value: boolean) {
    this.memory.needsUpdated = value;
  }
  // a cache of all the positions in this path, may be null
  private _positions?: RoomPosition[];
  // A map of all the positions that compose the path to that positions index on the path
  // this is a cache value and thus may be null
  private _positionsMap?: {
    [x: number]: {
      [y: number]: {
        [roomName: string]: number;
      };
    };
  };
  private _start?: RoomPosition;
  get start(): RoomPosition {
    if (this._start != null) {
      return this._start;
    }
    this._start = SporeRoomPosition.deserialize(this.memory.start);
    return this._start;
  }
  private _end?: RoomPosition;
  get end(): RoomPosition {
    if (this._end != null) {
      return this._end;
    }
    this._end = SporeRoomPosition.deserialize(this.memory.end);
    return this._end;
  }
  getNextMove(index: number): DirectionConstant {
    if (index >= 0 && index < this.memory.directions.length) {
      return +this.memory.directions[index] as DirectionConstant;
    }
    return 0 as DirectionConstant;
  }
  getNextPositions(pos: RoomPosition, index: number, count?: number): RoomPosition[] {
    let path: RoomPosition[] = [];

    let stopIndex = count ? count : this.memory.directions.length;
    if (stopIndex > this.memory.directions.length) {
      stopIndex = this.memory.directions.length;
    }

    let lastRoomPosition = pos;
    path.push(lastRoomPosition);

    for (let i = index; i < stopIndex; ++i) {
      let direction = +this.memory.directions[i];
      lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);

      if (lastRoomPosition.roomName !== pos.roomName) {
        break;
      }

      path.push(lastRoomPosition);
    }

    return path;
  }
  getPositions(roomName?: string): RoomPosition[] {
    if (this._positions != null) {
      return _.filter(this._positions, { roomName: roomName });
    }
    if (this.memory.rooms[roomName] == null) {
      return [];
    }
    let result = [];
    let lastRoomPosition = SporeRoomPosition.deserialize(this.memory.rooms[roomName].entrance);
    let index = this.memory.rooms[roomName].entranceIndex;
    for (; index < this.memory.directions.length; ++index) {
      result.push(lastRoomPosition);
      let direction = +this.memory.directions[index];
      lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
    }
    result.push(lastRoomPosition);
    return result;
  }
  findLastPositionInRoom(roomName: string, direction: number): RoomPosition {
    if (direction === FORWARD) {
      if (this.memory.rooms[roomName].exit == null) {
        if (this.end.roomName === roomName) {
          return this.end;
        } else {
          return null;
        }
      }
      return SporeRoomPosition.deserialize(this.memory.rooms[roomName].exit);
    } else if (direction === REVERSE) {
      if (this.memory.rooms[roomName].entrance == null) {
        if (this.start.roomName === roomName) {
          return this.start;
        } else {
          return null;
        }
      }
      return SporeRoomPosition.deserialize(this.memory.rooms[roomName].entrance);
    }
    return null;
  }
  getSubPath(roomName: string): SporePath {
    let startIndex = this.memory.rooms[roomName].entranceIndex;
    let start = this.memory.rooms[roomName].entrance;
    if (start == null) {
      startIndex = 0;
      start = this.memory.start;
    }
    let endIndex = this.memory.rooms[roomName].exitIndex;
    let end = this.memory.rooms[roomName].exit;
    if (end == null) {
      endIndex = this.memory.directions.length;
      end = this.memory.end;
    }
    let directions = this.memory.directions.substring(startIndex, endIndex);
    return new SporePath({
      ops: -1,
      cost: -1,
      start: start,
      end: end,
      directions: directions,
      rooms: {},
      tickCalculated: this.memory.tickCalculated,
      tickLifespan: this.memory.tickLifespan,
      needsUpdated: false
    });
  }
  findIntersectionWith(
    other: SporePath
  ): {
    baseIndex: number;
    otherIndex: number;
  } {
    //@todo make this faster?
    let lastRoomPosition = other.start;
    for (let otherIndex = 0; otherIndex < other.memory.directions.length; ++otherIndex) {
      let direction = +this.memory.directions[otherIndex];
      lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
      let baseIndex = this._getIndexOnPath(lastRoomPosition);
      if (baseIndex >= 0) {
        return { baseIndex: baseIndex, otherIndex: otherIndex };
      }
    }
    return null;
  }
  private _getIndexOnPath(pos: RoomPosition): number {
    if (this._positionsMap == null) {
      this._positionsMap = {};
      let lastRoomPosition = this.start;
      for (let index = 0; index < this.memory.directions.length; ++index) {
        this._cachePositionToMap(lastRoomPosition, index);
        let direction = +this.memory.directions[index];
        lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
      }
      this._cachePositionToMap(lastRoomPosition, this.memory.directions.length);
    }
    let map: any = this._positionsMap[pos.x];
    if (map == null) {
      return -1;
    }
    map = map[pos.y];
    if (map == null) {
      return -1;
    }
    map = map[pos.roomName];
    if (map == null) {
      return -1;
    }
    return map;
  }
  private _cachePositionToMap(pos: RoomPosition, index: number) {
    let x = this._positionsMap[pos.x];
    if (x == null) {
      let roomName = <any>{};
      roomName[pos.roomName] = index;
      this._positionsMap[pos.x] = { [pos.y]: roomName };
    }
    let y = x[pos.y];
    if (y == null) {
      let roomName = <any>{};
      roomName[pos.roomName] = index;
      x[pos.y] = roomName;
    }
    if (y[pos.roomName] == null) {
      y[pos.roomName] = index;
    }
  }
  private _cacheRoomBoundaries() {
    this.memory.rooms = {};
    // assuming that a creep won't walk along the room edge
    // we can then assume any position at 0 or 50 is an entrance or exit
    let lastRoomPosition = this.start;
    for (let index = 0; index < this.memory.directions.length; ++index) {
      if (
        lastRoomPosition.x === 0 ||
        lastRoomPosition.x === 50 ||
        lastRoomPosition.y === 0 ||
        lastRoomPosition.y === 50
      ) {
        if (this.memory.rooms[lastRoomPosition.roomName] == null) {
          this.memory.rooms[lastRoomPosition.roomName] = {};
        }
        if (this.memory.rooms[lastRoomPosition.roomName].entrance == null) {
          this.memory.rooms[lastRoomPosition.roomName].entrance = SporeRoomPosition.serialize(lastRoomPosition);
          this.memory.rooms[lastRoomPosition.roomName].entranceIndex = index;
        } else if (this.memory.rooms[lastRoomPosition.roomName].exit == null) {
          this.memory.rooms[lastRoomPosition.roomName].exit = SporeRoomPosition.serialize(lastRoomPosition);
          this.memory.rooms[lastRoomPosition.roomName].exitIndex = index;
        } else {
          console.log('///////////////////////////////// ERROR CACHING ROOM BOUNDARIES');
        }
      }
      let direction = +this.memory.directions[index];
      lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
    }
  }
  setIndexAsDestination(index: number) {
    this.memory.directions = this.memory.directions.substr(0, index);
    let lastRoomPosition = this.start;
    for (let index = 0; index < this.memory.directions.length; ++index) {
      this._cachePositionToMap(lastRoomPosition, index);
      let direction = +this.memory.directions[index];
      lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
    }
  }
  leadsTo(pos: RoomPosition, direction: number, range: number): boolean {
    if (direction === FORWARD) {
      if (this.end.isEqualTo(pos)) {
        return true;
      } else {
        return this.end.inRangeTo(pos, range);
      }
    } else if (direction === REVERSE) {
      if (this.start.isEqualTo(pos)) {
        return true;
      } else {
        return this.start.inRangeTo(pos, range);
      }
    }
    return false;
  }
  isEqualTo(other: SporePath): boolean {
    return !!(
      this.memory.start === other.memory.start &&
      this.memory.end === other.memory.end &&
      this.memory.directions === other.memory.directions
    );
  }
  serialize(): SporePathMemory {
    return this.memory;
  }
  constructor(private memory: SporePathMemory) {
    if (memory.rooms == null) {
      this._cacheRoomBoundaries();
    }
  }
}

export class SporePathFinder {
  _costMatrixCache: SporeCostMatrixCache = new SporeCostMatrixCache();
  _pathCache: Record<string, SporePath> = {};

  static serializeDirections(start: RoomPosition, path: RoomPosition[]): string {
    if (path == null || path.length === 0) {
      return '';
    }

    let value = '';
    value +=
      OFFSETS_DIRECTION[Math.min(Math.max(path[0].x - start.x, -1), 1) + 1][
        Math.min(Math.max(path[0].y - start.y, -1), 1) + 1
      ];

    for (let index = 1; index < path.length; ++index) {
      // 49 -> 0
      // 0 -> 49

      let previousIndex = index - 1;
      if (
        (path[previousIndex].x >= 49 ||
          path[previousIndex].x <= 0 ||
          path[previousIndex].y >= 49 ||
          path[previousIndex].y <= 0) &&
        (path[index].x >= 49 || path[index].x <= 0 || path[index].y >= 49 || path[index].y <= 0)
      ) {
        continue;
      } else {
        value +=
          OFFSETS_DIRECTION[Math.min(Math.max(path[index].x - path[previousIndex].x, -1), 1) + 1][
            Math.min(Math.max(path[index].y - path[previousIndex].y, -1), 1) + 1
          ];
      }
    }

    return value;
  }

  static deserializeDirections(value: string, start: RoomPosition): RoomPosition[] {
    let path: RoomPosition[] = [];

    if (value == null || value.length === 0) {
      return path;
    }

    let lastRoomPosition = start;
    path.push(lastRoomPosition);

    for (let index = 0; index < value.length; ++index) {
      let direction = +value[index];
      lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
      path.push(lastRoomPosition);
    }

    return path;
  }

  static getNextPositionByDirection(pos: RoomPosition, direction: number): RoomPosition {
    if (pos == null) {
      return null;
    }

    let transitionedRooms = false;
    let offsets = DIRECTION_OFFSETS[direction];
    let roomXOffset = 0;
    let roomYOffset = 0;

    let x = pos.x + offsets.x;
    let y = pos.y + offsets.y;
    let roomName = pos.roomName;

    if (x >= 49) {
      x = 0;
      ++roomXOffset;
      transitionedRooms = true;
    } else if (x <= 0) {
      x = 49;
      --roomXOffset;
      transitionedRooms = true;
    }

    if (y >= 49) {
      y = 0;
      ++roomYOffset;
      transitionedRooms = true;
    } else if (y <= 0) {
      y = 49;
      --roomYOffset;
      transitionedRooms = true;
    }

    if (transitionedRooms) {
      let horizontalRoomDirection = pos.roomName[0];

      let verticalRoomDirectionIndex = pos.roomName.indexOf('N');
      if (verticalRoomDirectionIndex === -1) {
        verticalRoomDirectionIndex = pos.roomName.indexOf('S');
      }

      let verticalRoomDirection = pos.roomName[verticalRoomDirectionIndex];

      let roomX = +pos.roomName.substring(1, verticalRoomDirectionIndex);
      let roomY = +pos.roomName.substring(verticalRoomDirectionIndex + 1, pos.roomName.length);

      if (roomX < 0) {
        if (horizontalRoomDirection === 'E') {
          horizontalRoomDirection = 'W';
        } else {
          horizontalRoomDirection = 'E';
        }
      }

      if (roomY < 0) {
        if (verticalRoomDirection === 'N') {
          verticalRoomDirection = 'S';
        } else {
          verticalRoomDirection = 'N';
        }
      }

      roomName = horizontalRoomDirection + (roomX + roomXOffset) + verticalRoomDirection + (roomY + roomYOffset);
    }

    return new RoomPosition(x, y, roomName);
  }

  findPathTo(
    origin: RoomPosition,
    goals:
      | RoomPosition
      | { pos: RoomPosition; range: number }
      | (RoomPosition | { pos: RoomPosition; range: number })[],
    options?: SporePathOptions
  ): SporePath {
    if (options == null) {
      options = SporePathOptions.Default;
    }

    let persistId: string = <any>options.persist;
    let persistTicks = 0;

    // if (options.persist != null && (<any>options.persist).id != null)
    // {
    //     persistId = (<any>options.persist).id;
    //     persistTicks = (<any>options.persist).ticks;
    // }
    //
    // if (persistId == null || persistId.length === 0)
    // {
    //     persistId = _.join(_.map(options.costs, function(cost: SporeCostMatrixOption){ return cost.id; }));
    //     persistTicks = 0;
    // }

    let path; // = this._pathCache[persistId];

    if (path != null) {
      return path;
    }

    //console.log('//////////// New Path ');

    let rawPath = PathFinder.search(origin, <any>goals, {
      plainCost: options.plainCost,
      swampCost: options.swampCost,
      roomCallback: function(roomName) {
        return this._costMatrixCache.findCostMatrix(roomName, options.costs);
      }.bind(this)
    });

    if (rawPath.path == null || rawPath.path.length === 0) {
      return null;
    }

    let pathMemory: SporePathMemory = {
      ops: rawPath.ops,
      cost: rawPath.cost,
      incomplete: rawPath.incomplete,
      start: origin.serialize(),
      end: rawPath.path[rawPath.path.length - 1].serialize(),
      directions: SporePathFinder.serializeDirections(origin, rawPath.path),
      rooms: null,
      tickCalculated: Game.time,
      tickLifespan: persistTicks,
      needsUpdated: false
    };

    path = new SporePath(pathMemory);
    path._positions = rawPath.path;

    // if (persistId != null && persistId.length > 0)
    // {
    //     this._pathCache[persistId] = path;
    //
    //     if (persistTicks > 0)
    //     {
    //         Memory.paths[persistId] = pathMemory
    //     }
    // }

    return path;
  }

  constructor() {
    let paths = Memory.paths;

    if (paths == null) {
      Memory.paths = {};
      paths = Memory.paths;
    }

    let pathIds = Object.keys(paths);

    for (let pathId in pathIds) {
      let path = paths[pathId];
      if (path.tickLifespan >= Game.time - path.tickCalculated) {
        this._pathCache[pathId] = <any>path; // we'll deserialize the path on demand
      } else {
        delete paths[pathId];
      }
    }
  }
}
