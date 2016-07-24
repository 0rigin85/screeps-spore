/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

// Ensure this is treated as a module.
export {};

declare global
{
    interface Memory
    {
        Sources: string[];
        EnergyLocations: string[];
    }
}

Memory.Sources = [];
Memory.EnergyLocations = [];