
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";

declare global
{
    interface RoomPosition
    {
        sortByRangeTo(targets: RoomObjectLike[]): void;
        getWalkableSurroundingArea(): number;
        findFirstInRange(targets: RoomObjectLike[], range: number): RoomObjectLike;
        findClosestInRange(targets: RoomObjectLike[], range: number): RoomObjectLike;
        findDistanceByPathTo(other: RoomPosition | RoomObjectLike, opts?: FindPathOpts): number;
    }
}

export class RouteMemory
{
    [toRoom: string]: any[];
}

export class SporeRoomPosition extends RoomPosition
{
    sortByRangeTo(targets: RoomObjectLike[]): void
    {
        let cachedRange = {};

        targets.sort(function(a, b)
        {
            let rangeA = cachedRange[a.id];

            if (rangeA == null)
            {
                rangeA = this.getRangeTo(a);
                cachedRange[a.id] = rangeA;
            }

            let rangeB = cachedRange[b.id];

            if (rangeB == null)
            {
                rangeB = this.getRangeTo(b);
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

    getRouteTo(toRoom: string): any[]
    {
        let routeMemory = Memory.routes[this.roomName];
        if (routeMemory == null)
        {
            routeMemory = <RouteMemory>{};
            Memory.routes[this.roomName] = routeMemory;
        }

        if (routeMemory[toRoom] === undefined)
        {
            routeMemory[toRoom] = Game.map.findRoute(this.roomName, toRoom);

            if (routeMemory[toRoom] === ERR_NO_PATH)
            {
                routeMemory[toRoom] = null;
            }
        }

        return routeMemory[toRoom];
    }

    findDistanceByPathTo(other: RoomPosition | RoomObjectLike, opts?: FindPathOpts): number
    {
        console.log('///////////////////// ' + this + " -> " + other);

        let rangeToSite = 0;
        let toRoomName = '';

        if (other instanceof RoomPosition)
        {
            toRoomName = other.roomName;
        }
        else
        {
            toRoomName = other.pos.roomName;
        }

        if (this.roomName != toRoomName)
        {
            if (Game.rooms[this.roomName] == null)
            {
                return 0;
            }

            let route = this.getRouteTo(toRoomName);

            if (route.length === 0)
            {
                // creep can't navigate to this room
                return 0;
            }

            let closestExit = this.findClosestByRange<RoomPosition>(route[0].exit);

            rangeToSite = this.findPathTo(closestExit, opts).length;

            if (route.length >= 2)
            {
                rangeToSite += (route.length - 1) * 50;
            }

            let lastExit = route[route.length - 1];
            if (lastExit < 4)
            {
                lastExit += 4;
            }
            else
            {
                lastExit -= 4;
            }

            let closestLastExit = this.findClosestByRange<RoomPosition>(lastExit);
            rangeToSite += this.findPathTo(closestLastExit, opts).length;
        }
        else
        {
            let path = this.findPathTo(other, opts);
            rangeToSite = path.length;
        }

        return rangeToSite;
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
}


