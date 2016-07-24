/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {SourceMemory} from "./sporeSource";
import {SpawnMemory} from "./sporeSpawn";

export var ERR_NOENERGY: number = -500;

export const enum ENERGYLOCATION
{
    ANY = 0,
    DROPPED,
    STORAGE,
    EXTENSION,
    SPAWN,
    SOURCE,

    COUNT = 6,
}

export class CollectResponse
{
    constructor(public object: RoomObject, public statusCode: number)
    { }
}

export class EnergyManager
{
    //@todo improve claim versus available slots
    static claimSource(creep: Creep, sourceId: string): boolean
    {
        var source = Game.getObjectById<Source>(sourceId);
        if (source == null)
        {
            return false;
        }

        var memory = source.getMemory();
        var tickMemory = source.getTickMemory();
        var previouslyClaimed = tickMemory.claims.indexOf(creep.id) != -1;

        if ((previouslyClaimed || tickMemory.claims.length < memory.availableSlots))
        {
            if (previouslyClaimed == false)
            {
                tickMemory.claims.push(creep.id);
            }

            creep.getTickMemory().energyId = sourceId;

            return true;
        }

        return false;
    }

    static claimSpawn(creep: Creep, spawnId: string): boolean
    {
        var spawn = Game.getObjectById<Spawn>(spawnId);
        if (spawn == null)
        {
            return false;
        }

        var tickMemory = spawn.getTickMemory();
        var previouslyClaimed = tickMemory.claims.indexOf(creep.id) != -1;

        if ((previouslyClaimed || spawn.energy - tickMemory.claimed >=  creep.carryCapacity - creep.carry[RESOURCE_ENERGY]))
        {
            if (previouslyClaimed == false)
            {
                tickMemory.claims.push(creep.id);
                tickMemory.claimed += creep.carry[RESOURCE_ENERGY];
            }

            creep.getTickMemory().energyId = spawnId;

            return true;
        }

        return false;
    }

    static collect(creep: Creep, locations: ENERGYLOCATION[]): CollectResponse
    {
        let lastCreepTickMemory = creep.getLastTickMemory();

        if (lastCreepTickMemory != null && lastCreepTickMemory.energyId != null)
        {
            let energyId = lastCreepTickMemory.energyId;

            if (Memory[energyId] != null && locations.indexOf(Memory[energyId].type) != -1)
            {
                let preferredEnergy = Game.getObjectById<RoomObject>(energyId);
                if (preferredEnergy != null)
                {
                    if (lastCreepTickMemory.energyType == ENERGYLOCATION.STORAGE)
                    {
                        let structure = <Structure>preferredEnergy;
                        return new CollectResponse(preferredEnergy, creep.withdraw(structure, RESOURCE_ENERGY, Math.min((<StructureStorage>structure).store.energy, creep.carryCapacity - creep.carry[RESOURCE_ENERGY])));
                    }
                    else if (lastCreepTickMemory.energyType == ENERGYLOCATION.SOURCE &&  EnergyManager.claimSource(creep, energyId))
                    {
                        let source = <Source>preferredEnergy;
                        return new CollectResponse(preferredEnergy, creep.harvest(source));
                    }
                    else if (lastCreepTickMemory.energyType == ENERGYLOCATION.DROPPED)
                    {
                        let resource = <Resource>preferredEnergy;
                        return new CollectResponse(preferredEnergy, creep.pickup(resource));
                    }
                    else if (lastCreepTickMemory.energyType == ENERGYLOCATION.EXTENSION)
                    {
                        let extension = <StructureExtension>preferredEnergy;
                        return new CollectResponse(preferredEnergy, creep.withdraw(extension, RESOURCE_ENERGY, Math.min(extension.energy, creep.carryCapacity - creep.carry[RESOURCE_ENERGY])));
                    }
                    else if (lastCreepTickMemory.energyType == ENERGYLOCATION.SPAWN &&  EnergyManager.claimSpawn(creep, energyId))
                    {
                        let spawn = <Spawn>preferredEnergy;
                        return new CollectResponse(spawn, creep.withdraw(spawn, RESOURCE_ENERGY, Math.min(spawn.energy, creep.carryCapacity - creep.carry[RESOURCE_ENERGY])));
                    }
                }
            }
        }

        function compareRange(a, b) {
            if (a.range < b.range) {
                return 1;
            } if (a.range > b.range) {
                return -1;
            }
            return 0;
        }

        for (let index = 0; index < locations.length; index++)
        {
            let location = locations[index];

            if (location == ENERGYLOCATION.SOURCE)
            {
                if (creep.memory.track == true)
                {
                    console.log(creep.name + " considering collecting from sources");
                }

                let list = [];
                for (let index = 0; index < Memory.Sources.length; index++)
                {
                    let sourceId = Memory.Sources[index];
                    let source = Game.getObjectById<Source>(sourceId);

                    if (!source.getTickMemory().ignore)
                    {
                        let rangeToSource = creep.pos.getRangeTo(source);
                        list.push({ range: rangeToSource, source: source });
                    }
                }

                list.sort(compareRange);

                while(list.length > 0)
                {
                    let object = list.pop();

                    if (EnergyManager.claimSource(creep, object.source.id))
                    {
                        return new CollectResponse(object.source, creep.harvest(object.source));
                    }
                }
            }
            else if (location == ENERGYLOCATION.SPAWN)
            {
                if (creep.memory.track == true)
                {
                    console.log(creep.name + " considering collecting from spawns");
                }

                let spawn = Game.spawns['Spawn1'];

                if (EnergyManager.claimSpawn(creep, spawn.id))
                {
                    return new CollectResponse(spawn, creep.withdraw(spawn, RESOURCE_ENERGY, Math.min(spawn.energy, creep.carryCapacity - creep.carry[RESOURCE_ENERGY])));
                }
            }
            else if (location == ENERGYLOCATION.DROPPED)
            {
                if (creep.memory.track == true)
                {
                    console.log(creep.name + " considering collecting from dropped resources");
                }

                let targets = creep.pos.findInRange<Resource>(FIND_DROPPED_ENERGY, 5);

                if(targets.length > 0)
                {
                    let resource = targets[0];

                    creep.getTickMemory().energyId = resource.id;

                    return new CollectResponse(resource, creep.pickup(resource));
                }
            }
            else if (location == ENERGYLOCATION.STORAGE)
            {
                if (creep.memory.track == true)
                {
                    console.log(creep.name + " considering collecting from storage containers");
                }

                let structures = creep.room.find<Structure>(FIND_STRUCTURES, {
                    filter: function(object) {
                        return object.structureType == STRUCTURE_CONTAINER || object.structureType == STRUCTURE_STORAGE;
                    }
                });

                let list = [];
                for (let index = 0; index < structures.length; index++)
                {
                    let structure = structures[index];

                    //if (!structure.getTickMemory().ignore)
                    {
                        let rangeToSource = creep.pos.getRangeTo(structure);
                        list.push({ range: rangeToSource, structure: structure });
                    }
                }

                list.sort(compareRange);

                while(list.length > 0)
                {
                    let structure = list.pop().structure;

                    if (structure.store[RESOURCE_ENERGY] >= creep.carryCapacity - creep.carry[RESOURCE_ENERGY])
                    {
                        creep.getTickMemory().energyId = structure.id;
                        return new CollectResponse(structure, creep.withdraw(structure, RESOURCE_ENERGY, Math.min((<StructureStorage>structure).store[RESOURCE_ENERGY], creep.carryCapacity - creep.carry[RESOURCE_ENERGY])));
                    }
                }
            }
            else if (location == ENERGYLOCATION.EXTENSION)
            {
                if (creep.memory.track == true)
                {
                    console.log(creep.name + " considering collecting from extensions");
                }

                let structures = creep.room.find<StructureExtension>(FIND_MY_STRUCTURES, {
                    filter: { structureType: STRUCTURE_EXTENSION }
                });

                let list = [];
                for (let index = 0; index < structures.length; index++)
                {
                    let structure = structures[index];

                    //if (!structure.getTickMemory().ignore)
                    {
                        let rangeToSource = creep.pos.getRangeTo(structure);
                        list.push({ range: rangeToSource, extension: structure });
                    }
                }

                list.sort(compareRange);

                while(list.length > 0)
                {
                    let extension = list.pop().extension;

                    if (extension.energy >= creep.carryCapacity - creep.carry[RESOURCE_ENERGY])
                    {
                        creep.getTickMemory().energyId = extension.id;
                        return new CollectResponse(extension, creep.withdraw(extension, RESOURCE_ENERGY, Math.min(extension.energy, creep.carryCapacity - creep.carry[RESOURCE_ENERGY])));
                    }
                }
            }
            else if (location == ENERGYLOCATION.ANY)
            {
                if (creep.memory.track == true)
                {
                    console.log(creep.name + " considering collecting from any location");
                }

                //replace ANY with all the not specified energy locations
                var missingLocations: ENERGYLOCATION[] = [];

                //@todo figure out how to properly iterate over enumerations in typescript
                if (locations.indexOf(ENERGYLOCATION.DROPPED) == -1)
                {
                    missingLocations.push(ENERGYLOCATION.DROPPED);
                }

                if (locations.indexOf(ENERGYLOCATION.STORAGE) == -1)
                {
                    missingLocations.push(ENERGYLOCATION.STORAGE);
                }

                if (locations.indexOf(ENERGYLOCATION.SOURCE) == -1)
                {
                    missingLocations.push(ENERGYLOCATION.SOURCE);
                }

                if (locations.indexOf(ENERGYLOCATION.EXTENSION) == -1)
                {
                    missingLocations.push(ENERGYLOCATION.EXTENSION);
                }

                if (locations.indexOf(ENERGYLOCATION.SPAWN) == -1)
                {
                    missingLocations.push(ENERGYLOCATION.SPAWN);
                }

                locations.splice(index, 1);
                locations.push.apply(locations, missingLocations);

                index--;
            }
        }

        return new CollectResponse(null, ERR_NOENERGY);
    }
}