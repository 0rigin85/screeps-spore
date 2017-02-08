/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {RoomObjectLike} from "./screepsPtr";
import Dictionary = _.Dictionary;

declare global
{
    interface RoomPosition
    {
        serialize(): string;
        sortByRangeTo(targets: RoomObjectLike[]): void;
        getWalkableSurroundingArea(): number;
        getWalkableSurroundingAreaInRange(target: RoomPosition, range: number): RoomPosition[];
        findFirstInRange(targets: RoomObjectLike[], range: number): RoomObjectLike;
        findClosestInRange(targets: RoomObjectLike[], range: number): RoomObjectLike;
        findDistanceByPathTo(other: RoomPosition | RoomObjectLike, opts?: FindPathOpts): number;
    }
}

export class SporeRoomPosition extends RoomPosition
{
    static serialize(pos: RoomPosition): string
    {
        return pos.x + ',' + pos.y + ',' +  pos.roomName;
    }

    serialize(): string
    {
        return this.x + ',' + this.y + ',' +  this.roomName;
    }

    static deserialize(value: string): RoomPosition
    {
        let parameters = value.split(',');
        return new RoomPosition(+parameters[0], +parameters[1], parameters[2]);
    }

    sortByRangeTo(targets: RoomObjectLike[]): void
    {
        let cachedRange = {};

        targets.sort(function(a, b)
        {
            let rangeA = cachedRange[a.id];

            if (rangeA == null)
            {
                rangeA = this.getRangeTo(a);

                if (rangeA == null)
                {
                    rangeA = Game.map.getRoomLinearDistance(this.roomName, a.roomName) * 50;
                }

                cachedRange[a.id] = rangeA;
            }

            let rangeB = cachedRange[b.id];

            if (rangeB == null)
            {
                rangeB = this.getRangeTo(b);

                if (rangeB == null)
                {
                    rangeB = Game.map.getRoomLinearDistance(this.roomName, b.roomName) * 50;
                }

                cachedRange[b.id] = rangeB;
            }

            if (rangeA < rangeB)
            {
                return -1;
            }

            if (rangeA > rangeB)
            {
                return 1;
            }

            return 0;
        }.bind(this));
    }

    findDistanceByPathTo(other: RoomPosition | RoomObjectLike, opts?: FindPathOpts): number
    {
        //console.log('///////////////////// ' + this + " -> " + other);

        let target = <RoomPosition>other;
        if (!(other instanceof RoomPosition))
        {
            target = other.pos;
        }

        let result = PathFinder.search(this, { pos: target, range: 1 });

        return result.path.length;
    }

    findFirstInRange(targets: RoomObjectLike[], range: number): RoomObjectLike
    {
        for (let index = 0; index < targets.length; index++)
        {
            let target = targets[index];

            if (this.inRangeTo(target.pos, range))
            {
                return target;
            }
        }

        return null;
    }

    findClosestInRange(targets: RoomObjectLike[], range: number): RoomObjectLike
    {
        let closestTargetRange = 500;
        let closestTarget = null;

        for (let index = 0; index < targets.length; index++)
        {
            let target = targets[index];
            let range = this.getRangeTo(target.pos);

            if (range < closestTargetRange)
            {
                closestTargetRange = range;
                closestTarget = target;
            }
        }

        if (closestTargetRange <= range)
        {
            return closestTarget;
        }

        return null;
    }

    getWalkableSurroundingArea(): number
    {
        let availableSlots = 0;
        let room = Game.rooms[this.roomName];

        if (_.isNull(room))
        {
            for (var xOffset = -1; xOffset < 2; xOffset++)
            {
                for (var yOffset = -1; yOffset < 2; yOffset++)
                {
                    if (xOffset == 0 && yOffset == 0)
                    {
                        continue;
                    }

                    if (Game.map.getTerrainAt(this.x + xOffset, this.y + yOffset, this.roomName) != "wall")
                    {
                        availableSlots++;
                    }
                }
            }
        }
        else
        {
            let lookResults = <LookAtResultMatrix>room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);

            for (var xOffset = -1; xOffset < 2; xOffset++)
            {
                for (var yOffset = -1; yOffset < 2; yOffset++)
                {
                    if (xOffset == 0 && yOffset == 0)
                    {
                        continue;
                    }

                    let resultArray = <LookAtResult[]>lookResults[this.y + yOffset][this.x + xOffset];

                    let hasObstacle = false;
                    for (let result of resultArray)
                    {
                        if (_.includes(OBSTACLE_OBJECT_TYPES, result[result.type]))
                        {
                            hasObstacle = true;
                            break;
                        }
                    }

                    if (hasObstacle === false)
                    {
                        availableSlots++;
                    }
                }
            }
        }

        return availableSlots;
    }

    getWalkableSurroundingAreaInRange(target: RoomPosition, range: number): RoomPosition[]
    {
        let availableSlots = [];
        let room = Game.rooms[this.roomName];

        if (_.isNull(room))
        {
            for (var xOffset = -1; xOffset < 2; xOffset++)
            {
                for (var yOffset = -1; yOffset < 2; yOffset++)
                {
                    if (xOffset == 0 && yOffset == 0)
                    {
                        continue;
                    }

                    if (Game.map.getTerrainAt(this.x + xOffset, this.y + yOffset, this.roomName) != "wall")
                    {
                        let pos = new RoomPosition(this.x + xOffset, this.y + yOffset, target.roomName);
                        if (target.inRangeTo(pos, range))
                        {
                            availableSlots.push(pos);
                        }
                    }
                }
            }
        }
        else
        {
            let lookResults = <LookAtResultMatrix>room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);

            for (var xOffset = -1; xOffset < 2; xOffset++)
            {
                for (var yOffset = -1; yOffset < 2; yOffset++)
                {
                    if (xOffset == 0 && yOffset == 0)
                    {
                        continue;
                    }

                    let resultArray = <LookAtResult[]>lookResults[this.y + yOffset][this.x + xOffset];

                    let hasObstacle = false;
                    for (let result of resultArray)
                    {
                        if (_.includes(OBSTACLE_OBJECT_TYPES, result[result.type]))
                        {
                            hasObstacle = true;
                            break;
                        }
                    }

                    if (hasObstacle === false)
                    {
                        let pos = new RoomPosition(this.x + xOffset, this.y + yOffset, target.roomName);
                        if (target.inRangeTo(pos, range))
                        {
                            availableSlots.push(pos);
                        }
                    }
                }
            }
        }

        return availableSlots;
    }
}


