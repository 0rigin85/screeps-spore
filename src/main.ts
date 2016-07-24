/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Spore} from "./spore";
import {Task, TaskPriority, ERR_NOWORK} from "./task";

// explicitly load all the prototype modifications
var sporeStructure = require("./sporeStructure");
var sporeCreep = require("./sporeCreep");
var sporeController = require("./sporeController");
var sporeSpawn = require("./sporeSpawn");
var sporeSource = require("./sporeSource");
var sporeExtension = require("./sporeExtension");
var sporeFlag = require("./sporeFlag");
var sporeRoomController = require("./sporeRoomPosition");
var sporeContainer = require("./sporeContainer");
var sporeConstructionSite = require("./sporeConstructionSite");
var sporeTower = require("./sporeTower");

declare var module: any;

var spore = new Spore();

module.exports.loop = function() {

    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    if (Memory.Sources == null)
    {
        Memory.Sources = [];
    }

    if (Memory.EnergyLocations == null)
    {
        Memory.EnergyLocations = [];
    }

    let tasks: Task[] = [];
    let basicTasks: Task[] = [];
    let tasksById = {};

    // collect all tasks
    //////////////////////////////////////////////////////

    for(let roomId in Game.rooms)
    {
        let room = Game.rooms[roomId];

        if (room != null && room.controller.my)
        {
            let structures = room.find<Structure>(FIND_STRUCTURES);

            for (let index = 0; index < structures.length; index++)
            {
                let structure = structures[index];
                let memory = structure.getMemory();
                memory.favor = false;
                memory.ignore = false;
            }

            let sites = room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

            for (let index = 0; index < sites.length; index++)
            {
                let site = sites[index];
                let memory = site.getMemory();
                memory.favor = false;
                memory.ignore = false;
            }
        }
    }

    // turn flags into tasks
    for(let name in Game.flags)
    {
        let flag = Game.flags[name];

        if (flag.room == null)
        {
            delete Game.flags[name];
            continue;
        }

        tasks.push.apply(tasks, flag.getTasks());
    }

    // get tasks from various rooms
    for(let roomId in Game.rooms)
    {
        let room = Game.rooms[roomId];

        if (room != null && room.controller.my)
        {
            // get tasks from the available structures in this room I own
            let structures = room.find<Structure>(FIND_STRUCTURES, {
                filter: function(object) {
                    return object.getTasks != null;
                }
            });

            for (let index = 0; index < structures.length; index++)
            {
                let structure = structures[index];
                if (structure.getMemory().ignore)
                {
                    continue;
                }

                let structureTasks = (<StructureExtension>structure).getTasks();

                if (structure.getMemory().favor)
                {
                    structureTasks.foreach(function(task: Task){ task.priority += TaskPriority.Mandatory + TaskPriority.ExtraDemandBoost});
                }

                tasks.push.apply(tasks, structureTasks);
            }


            // get tasks from the available construction sites in this room I own
            let sites = room.find<ConstructionSite>(FIND_CONSTRUCTION_SITES, {
                filter: function(object) {
                    return object.getTasks != null;
                }
            });

            for (let index = 0; index < sites.length; index++)
            {
                let site = sites[index];

                if (site.getMemory().ignore)
                {
                    continue;
                }

                let siteTasks = site.getTasks();

                if (site.getMemory().favor)
                {
                    siteTasks.foreach(function(task: Task){ task.priority += TaskPriority.Mandatory + TaskPriority.ExtraDemandBoost});
                }

                tasks.push.apply(tasks, siteTasks);
            }


            // get tasks from the available sources in this room I own
            let sources = room.find<Source>(FIND_SOURCES);

            for (let index = 0; index < sources.length; index++)
            {
                let source = sources[index];
                source.getMemory(); //populates memory
            }

            let towers = room.find<StructureTower>(FIND_MY_STRUCTURES, {
                filter: { structureType: STRUCTURE_TOWER }
            });

            if (towers.length > 0)
            {
                let hostileCreeps = room.find<Creep>(FIND_HOSTILE_CREEPS);

                if (hostileCreeps.length > 0)
                {
                    for (let towerIndex = 0; towerIndex < towers.length; towerIndex++)
                    {
                        let tower = towers[towerIndex];

                        let attackedCreep = Game.getObjectById<Creep>(tower.getMemory().isAttacking)
                        if (attackedCreep != null && attackedCreep.room.name == tower.room.name)
                        {
                            if (attackedCreep.pos.inRangeTo(tower.pos, 20))
                            {
                                tower.attack(attackedCreep);
                                tower.getMemory().isAttacking = attackedCreep.id;
                                continue;
                            }
                        }

                        tower.getMemory().isAttacking = null;

                        let closestCreep = tower.pos.findClosestByRange<Creep>(hostileCreeps);

                        if (closestCreep.pos.inRangeTo(tower.pos, 15))
                        {
                            tower.attack(closestCreep);
                            tower.getMemory().isAttacking = closestCreep.id;
                        }
                    }
                }
            }
        }
    }

    // Breakdown tasks
    for (let index = 0; index < tasks.length; index++)
    {
        let task = tasks[index];

        if (task.isComplex)
        {
            let subTasks = task.getSteps();
            tasks.push.apply(tasks, subTasks);
        }
        else if (tasksById[task.id] == null)
        {
            basicTasks.push(task);
            tasksById[task.id] = task;
        }
        else
        {
            tasksById[task.id].priority += TaskPriority.ExtraDemandBoost;
        }
    }

    class PrescheduledWork
    {
        constructor(public creep: Creep, public task: Task)
        { }
    }

    var untaskedCreeps: Creep[] = [];
    var prescheduledCreeps: PrescheduledWork[] = [];

    // Reschedule any work creeps were doing last tick that's still valid
    for(let name in Game.creeps)
    {
        let creep = Game.creeps[name];

        // skip creeps that haven't spawned yet
        if (creep.spawning)
        {
            continue;
        }

        let lastMemory = creep.getLastTickMemory();

        // Check if the creep was previously assigned a task
        if (lastMemory != null && lastMemory.taskId != null && lastMemory.taskId.length != 0)
        {
            let lastTask = tasksById[lastMemory.taskId];

            // Does the creeps last task still exist?
            if (lastTask != null)
            {
                // if we fail to reschedule the creep for their previous task then
                if (lastTask.schedule(creep) >= 0)
                {
                    console.log("Pre-Scheduled " + creep.name + " for " + lastTask.id);
                    creep.getTickMemory().taskId = lastTask.id;
                    lastTask.scheduledWorkers++;

                    prescheduledCreeps.push(new PrescheduledWork(creep, lastTask));
                }
                else
                {
                    // add him to the list of creeps needing work
                    untaskedCreeps.push(creep);
                }
            }
            else
            {
                // add him to the list of creeps needing work
                untaskedCreeps.push(creep);
            }
        }
        else
        {
            // add him to the list of creeps needing work
            untaskedCreeps.push(creep);
        }
    }

    // Sort the basic tasks by their priority
    function comparePriority(a, b)
    {
        if (a.priority < b.priority) {
            return 1;
        } if (a.priority > b.priority) {
            return -1;
        }
        return 0;
    }
    basicTasks.sort(comparePriority);


    for (let taskIndex = 0; taskIndex < basicTasks.length; taskIndex++)
    {
        let task = basicTasks[taskIndex];
        console.log(task.priority + " -> " + task.id);
    }

    // Schedule untasked creeps to tasks based on priority
    console.log("Tasks: " + tasks.length);
    console.log("Basic Tasks: " + basicTasks.length);

    let taskIndex = 0;
    for (; taskIndex < basicTasks.length; taskIndex++)
    {
        let task = basicTasks[taskIndex];

        if (task.possibleWorkers == 0)
        {
            basicTasks.splice(taskIndex, 1);
            taskIndex--;

            // skip any tasks that have already scheduled all their work
            continue;
        }

        for (let creepIndex = untaskedCreeps.length - 1; creepIndex >= 0; creepIndex--)
        {
            let creep = untaskedCreeps[creepIndex];

            let code = task.schedule(creep);
            if (code >= 0)
            {
                task.scheduledWorkers++;
                creep.getTickMemory().taskId = task.id;

                // remove creep now that it's been scheduled
                untaskedCreeps.splice(creepIndex, 1);
                console.log("Scheduled " + creep.name + " for " + task.id);
                break;
            }
            else if (code == ERR_NOWORK)
            {
                basicTasks.splice(taskIndex, 1);
                taskIndex--;
                break;
            }
        }

        // if we're out of creeps stop iterating over tasks
        if (untaskedCreeps.length == 0)
        {
            break;
        }
    }

    // ensure that any prescheduled tasks should be cancelled because there is higher priority work to be done
    for (let index = prescheduledCreeps.length - 1; index >= 0; index--)
    {
        let scheduledCreep = prescheduledCreeps[index];

        for (let basicIndex = 0; basicIndex < basicTasks.length; basicIndex++)
        {
            let task = basicTasks[basicIndex];

            if (scheduledCreep.task.priority < task.priority &&
                ((task.scheduledWorkers < task.possibleWorkers && task.possibleWorkers > -1) ||
                 task.scheduledWorkers == 0 && task.possibleWorkers == -1))
            {
                let creep = scheduledCreep.creep;

                let code = task.schedule(creep);
                if (code >= 0)
                {
                    task.scheduledWorkers++;
                    creep.getTickMemory().taskId = task.id;

                    // remove creep now that it's been scheduled
                    console.log("Re-Scheduled " + creep.name + " for " + task.id);
                    break;
                }
                else if (code == ERR_NOWORK)
                {
                    basicTasks.splice(basicIndex, 1);
                    basicIndex--;
                    break;
                }
            }
        }
    }

    console.log("Untasked Creeps: " + untaskedCreeps.length);

    let needMoreWorkers = false;

    for (let index = 0; index < basicTasks.length; index++)
    {
        let task = basicTasks[index];

        if ((task.scheduledWorkers < task.possibleWorkers && task.possibleWorkers > -1) ||
            (task.scheduledWorkers == 0 && task.possibleWorkers == -1))
        {
            needMoreWorkers = true;
            break;
        }
    }

    console.log("Need More Works: " + needMoreWorkers);
    if (Game.spawns['Spawn1'] != null && needMoreWorkers && untaskedCreeps.length == 0)
    {
        Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE, MOVE], undefined);

        //Game.spawns['Spawn1'].createCreep([WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], undefined);
    }

    for(let name in Memory.creeps)
    {
        if(Memory.creeps[name][Game.time - 1] != null) {
            delete Memory.creeps[name][Game.time - 1];
        }
    }

    for(let name in Memory.spawns)
    {
        if(Memory.spawns[name][Game.time - 1] != null)
        {
            delete Memory.spawns[name][Game.time - 1];
        }
    }

    for (let index = Memory.Sources.length - 1; index >= 0; index--)
    {
        let sourceId = Memory.Sources[index];

        if(Memory[sourceId][Game.time - 1] != null)
        {
            delete Memory[sourceId][Game.time - 1];
        }
    }
};
