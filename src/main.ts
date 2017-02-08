/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Spore} from "./spore";
import {SporeColony} from "./sporeColony";
import {Remember} from "./sporeRemember";
import {profiler} from "./screeps-profiler"

declare var module: any;

Spore.inject();

module.exports.loop = function() {
    let cpuSpentDeserializingMemory = Game.cpu.getUsed();

    profiler.wrap(function() {
        PathFinder.use(true);
        Remember.tick();

        for(let name in Memory.creeps)
        {
            if(!Game.creeps[name])
            {
                delete Memory.creeps[name];
                console.log('Clearing non-existing creep memory:', name);
            }
        }

        Spore.colony = new SporeColony();
        Spore.colony.run();
    });

    console.log("DeserializingMemory CPU: <progress value='" + cpuSpentDeserializingMemory + "' max='" + 30 + "'/> [" + cpuSpentDeserializingMemory.toFixed(2) + "]");
};