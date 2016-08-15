
declare global
{
    interface RoomPosition
    {
        sortByRangeTo(targets: RoomObject[]): void;
        getWalkableSurroundingArea(): number;
        findFirstInRange(targets: RoomObject[], range: number): RoomObject;
        findClosestInRange(targets: RoomObject[], range: number): RoomObject;
    }
}

export class SporeRoomPosition extends RoomPosition
{
    sortByRangeTo(targets: RoomObject[]): void
    {
        let cachedRange = {};

        targets.sort(function(a, b)
        {
            let rangeA = cachedRange[a];

            if (rangeA == null)
            {
                rangeA = this.getRangeTo(a);
                cachedRange[a] = rangeA;
            }

            let rangeB = cachedRange[a];

            if (rangeB == null)
            {
                rangeB = this.getRangeTo(b);
                cachedRange[b] = rangeB;
            }

            if (rangeA < rangeB)
            {
                return 1;
            }

            if (rangeA > rangeB)
            {
                return -1;
            }

            return 0;
        }.bind(this));
    }

    findFirstInRange(targets: RoomObject[], range: number): RoomObject
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

    findClosestInRange(targets: RoomObject[], range: number): RoomObject
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


