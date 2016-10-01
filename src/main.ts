/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Spore} from "./spore";
import {SporeColony} from "./sporeColony";

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
    Spore.colony = new SporeColony();
    Spore.colony.run();
};
