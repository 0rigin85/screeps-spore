/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Spore} from "./spore";
import {SporeColony} from "./sporeColony";

declare var module: any;


// // Any modules that you use that modify the game's prototypes should be require'd
// // before you require the profiler.
// import {profiler} from "./screeps-profiler";
//
// // This line monkey patches the global prototypes.
// profiler.enable();
// module.exports.loop = function() {
//     profiler.wrap(function() {
//
//         PathFinder.use(true);
//
//         for(let name in Memory.creeps)
//         {
//             if(!Game.creeps[name])
//             {
//                 delete Memory.creeps[name];
//                 console.log('Clearing non-existing creep memory:', name);
//             }
//         }
//
//         Spore.inject();
//         Spore.colony = new SporeColony();
//         Spore.colony.run();
//
//     });
// };


module.exports.loop = function() {

    PathFinder.use(true);

    for(let name in Memory.creeps)
    {
        if(!Game.creeps[name])
        {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    Spore.inject();
    Spore.colony = new SporeColony();
    Spore.colony.run();
};