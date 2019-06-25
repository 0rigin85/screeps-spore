import { SporePath } from './sporePathFinder';

export class SporeCreepMovement {
  private _improv: SporePath;
  get improv(): SporePath {
    if (this.memory.improv != null) {
      this._improv = new SporePath(this.memory.improv);
    }
    return this._improv;
  }
  set improv(value: SporePath) {
    if (value == null) {
      if (this.memory.improv != null) {
        this._improv = null;
        this.memory.improv = null;
        this.mergeIndex = -1;
        this.pathIndex = -1;
        this.expectedPosition = null;
        this.failedMoveAttempts = 0;
      }
    } else if ((this._improv == null && value != null) || (this._improv != null && !this._improv.isEqualTo(value))) {
      this._improv = value;
      this.memory.improv = this._improv.serialize();
      this.mergeIndex = -1;
      this.expectedPosition = null;
      this.failedMoveAttempts = 0;
    }
  }
  get mergeIndex(): number {
    return this.memory.mergeIndex;
  }
  set mergeIndex(value: number) {
    this.memory.mergeIndex = value;
  }
  private _path: SporePath;
  get path(): SporePath {
    if (this._path != null) {
      return this._path;
    }
    if (this.memory.path != null) {
      this._path = new SporePath(this.memory.path);
    }
    return this._path;
  }
  set path(value: SporePath) {
    if (value == null) {
      if (this.memory.path != null) {
        this._path = null;
        this.memory.path = null;
        this.pathIndex = -1;
        this.expectedPosition = null;
        this.failedMoveAttempts = 0;
        this.improv = null;
      }
    } else if ((this._path == null && value != null) || (this._path != null && !this._path.isEqualTo(value))) {
      this._path = value;
      this.memory.path = this._path.serialize();
      this.pathIndex = -1;
      this.expectedPosition = null;
      this.failedMoveAttempts = 0;
      this.improv = null;
    }
  }
  get pathIndex(): number {
    if (this.memory.pathIndex == null || (this.memory.path == null && this.memory.improv == null)) {
      this.memory.pathIndex = -1;
    }
    return this.memory.pathIndex;
  }
  set pathIndex(value: number) {
    this.memory.pathIndex = value;
  }
  private _expectedPosition: RoomPosition;
  get expectedPosition(): RoomPosition {
    if (this._expectedPosition != null) {
      return this._expectedPosition;
    }
    if (this.memory.expectedPosRoomName != null) {
      this._expectedPosition = new RoomPosition(
        this.memory.expectedPosX,
        this.memory.expectedPosY,
        this.memory.expectedPosRoomName
      );
    }
    return this._expectedPosition;
  }
  set expectedPosition(value: RoomPosition) {
    if (value != null) {
      this.memory.expectedPosRoomName = value.roomName;
      this.memory.expectedPosX = value.x;
      this.memory.expectedPosY = value.y;
    } else {
      this.memory.expectedPosRoomName = null;
      this.memory.expectedPosX = null;
      this.memory.expectedPosY = null;
    }
  }
  get failedMoveAttempts(): number {
    return this.memory.failedMoveAttempts;
  }
  set failedMoveAttempts(value: number) {
    this.memory.failedMoveAttempts = value;
  }
  constructor(private memory: CreepMovementMemory) {}
}
