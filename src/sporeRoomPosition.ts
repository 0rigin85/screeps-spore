/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

// Ensure this is treated as a module.
export {};

declare global
{
    interface RoomPosition
    {
        getWalkableSurroundingArea(): number;
    }
}

RoomPosition.prototype.getWalkableSurroundingArea = function()
{
    var availableSlots = 0;

    for (var xoffset = -1; xoffset < 2; xoffset++)
    {
        for (var yoffset = -1; yoffset < 2; yoffset++)
        {
            if (xoffset == 0 && yoffset == 0)
            {
                continue;
            }
            else if(Game.map.getTerrainAt(this.x + xoffset, this.y + yoffset, this.roomName) != "wall")
            {
                availableSlots++;
            }
        }
    }

    return availableSlots;
};


