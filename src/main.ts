/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Spore} from "./spore";
import {SporeColony} from "./sporeColony";
import {Remember} from "./sporeRemember";
import {profiler} from "./screeps-profiler"

declare var module: any;

Spore.inject();

module.exports.loop = function() {
    profiler.wrap(function() {
        PathFinder.use(true);
        Remember.beginTick();

        if (Memory.config == null)
        {
            Memory.config = { tasks:{} };
        }

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

        Remember.endTick();
    });
};