/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

// Ensure this is treated as a module.
export {};

export class CreepTickMemory
{
    taskId: string;
    energyId: string;
    energyType: number;
}

declare global
{
    interface Creep
    {
        getTickMemory(): CreepTickMemory;
        getLastTickMemory(): CreepTickMemory;
    }
}

Creep.prototype.getTickMemory = function()
{
    var tickMemory = this.memory[Game.time];

    if (tickMemory == null)
    {
        tickMemory = new CreepTickMemory();
        this.memory[Game.time] = tickMemory;
    }

    return tickMemory;
};

Creep.prototype.getLastTickMemory = function()
{
    return this.memory[Game.time - 1];
};