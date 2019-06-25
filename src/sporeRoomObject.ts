export class SporeRoomObject extends RoomObject {
  doIgnore: boolean;
  get doTrack(): boolean {
    return this.memory.track === true;
  }
  doFavor: boolean;
}