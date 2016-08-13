/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Spore} from "./spore";

declare var module: any;

module.exports.loop = function() {

    for(let name in Memory.creeps)
    {
        if(!Game.creeps[name])
        {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    Spore.inject();
    Spore.colony.run();

    // for(let name in Memory.creeps)
    // {
    //     if(Memory.creeps[name][Game.time - 1] != null) {
    //         delete Memory.creeps[name][Game.time - 1];
    //     }
    // }
    //
    // for(let name in Memory.spawns)
    // {
    //     if(Memory.spawns[name][Game.time - 1] != null)
    //     {
    //         delete Memory.spawns[name][Game.time - 1];
    //     }
    // }
    //
    // for(let roomId in Game.myRooms)
    // {
    //     let room = Game.myRooms[roomId];
    //
    //     for (let source of room.sources)
    //     {
    //         let sourceId = source.id;
    //
    //         if (Memory[sourceId][Game.time - 1] != null)
    //         {
    //             delete Memory[sourceId][Game.time - 1];
    //         }
    //     }
    // }



    // function isNumeric(n) {
    //     return !isNaN(parseFloat(n)) && isFinite(n);
    // }
    //
    // for(let name in Memory.creeps)
    // {
    //     for (let key in Memory.creeps[name])
    //     {
    //         let memory = Memory.creeps[name];
    //
    //         if (memory[key] != null && memory[key].taskId != null && key != Game.time.toString() && isNumeric(key) == true)
    //         {
    //             console.log("deleting creep memory");
    //             delete memory[key];
    //         }
    //     }
    // }
    //
    // for(let name in Memory.spawns)
    // {
    //     if(Memory.spawns[name][Game.time - 1] != null)
    //     {
    //         delete Memory.spawns[name][Game.time - 1];
    //     }
    // }
    //
    // for (let index = Memory.Sources.length - 1; index >= 0; index--)
    // {
    //     let sourceId = Memory.Sources[index];
    //     let memory = Memory[sourceId];
    //
    //     for (let key in memory)
    //     {
    //         if (memory[key] != null && memory[key].ignore != null && key != Game.time.toString() && isNumeric(key) == true)
    //         {
    //             console.log("deleting source memory");
    //             delete memory[key];
    //         }
    //     }
    // }
};
