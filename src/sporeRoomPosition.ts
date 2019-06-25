const _CUSTOM_OBSTACLES = {
  creep: function(creep: Creep) {
    return !creep.my;
  },
  energy: function(energy: Resource<RESOURCE_ENERGY>) {
    return false;
  },
  exit: function(exit: any) {
    return false;
  },
  flag: function(flag: Flag) {
    return false;
  },
  mineral: function(mineral: Mineral) {
    return true;
  },
  nuke: function(nuke: Nuke) {
    return false;
  },
  resource: function(resource: Resource) {
    return false;
  },
  source: function(source: Source) {
    return true;
  },
  structure: function(structure: Structure) {
    if (structure.structureType === STRUCTURE_RAMPART) {
      return !(structure as OwnedStructure).my;
    }
    return true;
  },
  terrain: function(terrain: Terrain) {
    return terrain === 'wall';
  },
  tombstone: function(tombstone: Tombstone) {
    return false;
  },
  powerCreep: function(powerCreep: PowerCreep) {
    return !powerCreep.my;
  }
};

export class SporeRoomPosition extends RoomPosition {
  static serialize(pos: RoomPosition): string {
    return pos.x + ',' + pos.y + ',' + pos.roomName;
  }

  serialize(): string {
    return this.x + ',' + this.y + ',' + this.roomName;
  }

  static deserialize(value: string): RoomPosition {
    let parameters = value.split(',');
    return new RoomPosition(+parameters[0], +parameters[1], parameters[2]);
  }

  sortByRangeTo(targets: RoomObject[]): void {
    let cachedRange = {};

    targets.sort(
      function(a, b) {
        let rangeA = cachedRange[a.id];

        if (rangeA == null) {
          rangeA = this.getRangeTo(a);

          if (rangeA == null) {
            rangeA = Game.map.getRoomLinearDistance(this.roomName, a.roomName) * 50;
          }

          cachedRange[a.id] = rangeA;
        }

        let rangeB = cachedRange[b.id];

        if (rangeB == null) {
          rangeB = this.getRangeTo(b);

          if (rangeB == null) {
            rangeB = Game.map.getRoomLinearDistance(this.roomName, b.roomName) * 50;
          }

          cachedRange[b.id] = rangeB;
        }

        if (rangeA < rangeB) {
          return -1;
        }

        if (rangeA > rangeB) {
          return 1;
        }

        return 0;
      }.bind(this)
    );
  }

  findDistanceByPathTo(other: RoomPosition | RoomObject, opts?: FindPathOpts): number {
    //console.log('///////////////////// ' + this + " -> " + other);

    let target = <RoomPosition>other;
    if (!(other instanceof RoomPosition)) {
      target = other.pos;
    }

    let result = PathFinder.search(this, { pos: target, range: 1 });

    return result.path.length;
  }

  findFirstInRange(targets: RoomObject[], range: number): RoomObject {
    for (let index = 0; index < targets.length; index++) {
      let target = targets[index];

      if (this.inRangeTo(target.pos, range)) {
        return target;
      }
    }

    return null;
  }

  findClosestInRange(targets: RoomObject[], range: number): RoomObject {
    let closestTargetRange = 500;
    let closestTarget = null;

    for (let index = 0; index < targets.length; index++) {
      let target = targets[index];
      let range = this.getRangeTo(target.pos);

      if (range < closestTargetRange) {
        closestTargetRange = range;
        closestTarget = target;
      }
    }

    if (closestTargetRange <= range) {
      return closestTarget;
    }

    return null;
  }

  getWalkableSurroundingArea(ignoreObjects: boolean = true): number {
    let availableSlots = 0;
    let room = Game.rooms[this.roomName];

    if (ignoreObjects || _.isNull(room)) {

      const terrain = Game.map.getRoomTerrain(this.roomName);
      for (var xOffset = -1; xOffset < 2; xOffset++) {
        for (var yOffset = -1; yOffset < 2; yOffset++) {
          if (xOffset == 0 && yOffset == 0) {
            continue;
          }

          if (terrain.get(this.x + xOffset, this.y + yOffset) != TERRAIN_MASK_WALL) {
            availableSlots++;
          }
        }
      }
    } else {
      let lookResults = room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);

      for (var xOffset = -1; xOffset < 2; xOffset++) {
        for (var yOffset = -1; yOffset < 2; yOffset++) {
          if (xOffset == 0 && yOffset == 0) {
            continue;
          }

          let resultArray = lookResults[this.y + yOffset][this.x + xOffset];

          let hasObstacle = false;
          for (let result of resultArray) {
            if (_CUSTOM_OBSTACLES[result.type](result[result.type])) {
              hasObstacle = true;
              break;
            }
          }

          if (hasObstacle === false) {
            availableSlots++;
          }
        }
      }
    }

    return availableSlots;
  }

  getWalkableSurroundingAreaInRange(
    target: RoomPosition,
    range: number,
    ignoreObjects: boolean = true
  ): RoomPosition[] {
    let availableSlots = [];
    let room = Game.rooms[this.roomName];

    if (ignoreObjects || _.isNull(room)) {

      const terrain = Game.map.getRoomTerrain(this.roomName);
      for (var xOffset = -1; xOffset < 2; xOffset++) {
        for (var yOffset = -1; yOffset < 2; yOffset++) {
          if (xOffset == 0 && yOffset == 0) {
            continue;
          }

          if (terrain.get(this.x + xOffset, this.y + yOffset) != TERRAIN_MASK_WALL) {
            let pos = new RoomPosition(this.x + xOffset, this.y + yOffset, target.roomName);
            if (target.inRangeTo(pos, range)) {
              availableSlots.push(pos);
            }
          }
        }
      }
    } else {
      let lookResults = <LookAtResultMatrix>room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);

      for (var xOffset = -1; xOffset < 2; xOffset++) {
        for (var yOffset = -1; yOffset < 2; yOffset++) {
          if (xOffset == 0 && yOffset == 0) {
            continue;
          }

          let resultArray = <LookAtResult[]>lookResults[this.y + yOffset][this.x + xOffset];

          let hasObstacle = false;
          for (let result of resultArray) {
            if (_CUSTOM_OBSTACLES[result.type](result[result.type])) {
              hasObstacle = true;
              break;
            }
          }

          if (hasObstacle === false) {
            let pos = new RoomPosition(this.x + xOffset, this.y + yOffset, target.roomName);
            if (target.inRangeTo(pos, range)) {
              availableSlots.push(pos);
            }
          }
        }
      }
    }

    return availableSlots;
  }
}
