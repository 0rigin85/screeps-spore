/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {RoleBuilder} from "./roleBuilder";
import {RoleHarvester} from "./roleHarvester";
import {RoleUpgrader} from "./roleUpgrader";

declare var module: any;

module.exports.loop = function() {

    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var neededHarvesters = 2 - _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester').length;
    while(neededHarvesters >= 0) {
        Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'harvester'});
        neededHarvesters--;
    }

    var neededUpgraders = 2 - _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader').length;
    while(neededUpgraders >= 0) {
        Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'upgrader'});
        neededUpgraders--;
    }

    var neededBuilders = 4 - _.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length;
    while(neededBuilders >= 0) {
        Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], undefined, {role: 'builder'});
        neededBuilders--;
    }

    // var tower = Game.getObjectById('30f3f4838fe91c46785323c4');
    // if(tower) {
    //     var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    //         filter: (structure) => structure.hits < structure.hitsMax
    //     });
    //     if(closestDamagedStructure) {
    //         tower.repair(closestDamagedStructure);
    //     }
    //
    //     var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    //     if(closestHostile) {
    //         tower.attack(closestHostile);
    //     }
    // }

    for(let name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            RoleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            RoleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            RoleBuilder.run(creep);
        }
    }
};
