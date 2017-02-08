
import Dictionary = _.Dictionary;
import {Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK, ERR_SKIP_WORKER} from "./task";
import {RecycleCreep} from "./taskRecycleCreep";
import {ScreepsPtr} from "./screepsPtr";
import {SpawnAppointment, SpawnRequest} from "./spawnRequest";
import {CREEP_TYPE, CollectOptions, ACTION_MOVE} from "./sporeCreep";
import {SporeRoom} from "./sporeRoom";
import {Claimable, ClaimReceipt} from "./sporeClaimable";
import {SporePathFinder} from "./sporePathFinder";
import {Remember} from "./sporeRemember";

export class LaborPoolType
{
    constructor(
        public parts: { [name: string]: number },
        public count: number)
    {
        for (let name in BODYPART_COST)
        {
            if (parts[name] == null)
            {
                parts[name] = 0;
            }
        }
    }
}

export class LaborPool
{
    types: Dictionary<LaborPoolType> = {};

    addCreep(creep: Creep): void
    {
        if (creep.type == null)
        {
            return;
        }

        if (this.types[creep.type] == null)
        {
            this.types[creep.type] = new LaborPoolType({}, 0);
        }

        this.types[creep.type].count++;


        for(let part of creep.body)
        {
            if (part.hits > 0)
            {
                this.types[creep.type].parts[part.type]++;
            }
        }
    }
}

var GATHER_RESOURCE_STORES =
{
    'source': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        if (!(claimer instanceof Creep))
        {
            return;
        }
        else if (claimer.getActiveBodyparts(WORK) === 0)
        {
            return;
        }

        for (let source of this.sources)
        {
            if (source.doIgnore !== true && source.energy > 0 && excludes[source.id] == null)
            {
                collection.push(source);
            }
        }
    },
    'near_dropped': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        let nearClaimerResources = claimer.pos.findInRange(FIND_DROPPED_RESOURCES, 5);

        for (let resource of nearClaimerResources)
        {
            if (resource.doIgnore !== true &&
                resource.resourceType === resourceType &&
                resource.amount > 0 &&
                excludes[resource.id] == null)
            {
                collection.push(resource);
            }
        }

        if (near != null)
        {
            let nearTargetResources: Resource[] = <Resource[]>near.findInRange(FIND_DROPPED_RESOURCES, 5);

            for (let resource of nearTargetResources)
            {
                if (resource.doIgnore !== true &&
                    resource.resourceType === resourceType &&
                    resource.amount > 0 &&
                    excludes[resource.id] == null)
                {
                    collection.push(resource);
                }
            }
        }
    },
    'dropped': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        for (let resource of this.resources)
        {
            if (resource.doIgnore !== true &&
                resource.resourceType === resourceType &&
                resource.amount > 0 &&
                excludes[resource.id] == null)
            {
                collection.push(resource);
            }
        }
    },
    'container': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        for (let container of this.containers)
        {
            if (container.doIgnore !== true &&
                container.store[resourceType] > 0 &&
                excludes[container.id] == null)
            {
                collection.push(container);
            }
        }
    },
    'link': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let link of this.links)
        {
            if (link.doIgnore !== true &&
                link.energy > 0 &&
                link.takesTransfers &&
                excludes[link.id] == null)
            {
                collection.push(link);
            }
        }
    },
    'storage': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        if (this.storage != null &&
            this.storage.doIgnore !== true &&
            this.storage.store[resourceType] > 0 &&
            excludes[this.storage.id] == null)
        {
            let savings = this.budget.savings[resourceType];
            if (savings != null && this.storage.store[resourceType] - amount >= savings)
            {
                collection.push(this.storage);
            }
        }
    },
    'extension': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let extension of this.extensions)
        {
            if (extension.doIgnore !== true &&
                extension.energy > 0 &&
                excludes[extension.id] == null)
            {
                collection.push(extension);
            }
        }
    },
    'spawn': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let spawn of this.mySpawns)
        {
            if (spawn.doIgnore !== true &&
                spawn.energy > 0 &&
                excludes[spawn.id] == null)
            {
                collection.push(spawn);
            }
        }
    },
    'tower': function(collection: Claimable[], resourceType: string, amount: number, claimer: any, near: RoomPosition, excludes: Dictionary<Claimable>)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let tower of this.towers)
        {
            if (tower.doIgnore !== true &&
                tower.energy > 0 &&
                excludes[tower.id] == null)
            {
                collection.push(tower);
            }
        }
    }
};

export class SporeColony
{
    constructor()
    { }

    pathFinder: SporePathFinder = new SporePathFinder();
    tasks: Task[] = [];
    tasksById: Dictionary<Task> = {};
    laborPool: LaborPool = new LaborPool();
    spawnRequests: SpawnRequest[] = [];
    requestsCurrentlySpawning: string[] = [];

    cpuSpentPathing: number = 0;
    pathingCpuLimit: number = 30;

    get myRooms(): Room[]
    {
        return Remember.forTick('colony.myRooms', () => {
            let myRooms: Room[] = [];

            for (let roomId in Game.rooms)
            {
                let room = Game.rooms[roomId];

                if (room.my)
                {
                    myRooms.push(room);
                }
            }

            myRooms.sort(function (a, b)
            {
                if (a.priority < b.priority)
                {
                    return 1;
                }

                if (a.priority > b.priority)
                {
                    return -1;
                }

                if (a.name < b.name)
                {
                    return 1;
                }

                if (a.name > b.name)
                {
                    return -1;
                }

                return 0;
            });

            return myRooms;
        });
    }

    run(): void
    {
        this.tasks = [];
        this.tasksById = {};
        this.laborPool = new LaborPool();
        this.spawnRequests.length = 0;
        this.requestsCurrentlySpawning.length = 0;

        for(let room of this.myRooms)
        {
            room.trackEconomy();
        }

        this.collectTasks();

        let creeps: Dictionary<Creep> = {};
        let taskLaborPools: Dictionary<LaborPool> = {};
        let totalBodyCount = 0;

        for(let name in Game.creeps)
        {
            let creep = Game.creeps[name];

            if (creep.spawning)
            {
                continue;
            }

            totalBodyCount += creep.body.length;

            let spawnRequest = creep.spawnRequest;

            if (spawnRequest != null)
            {
                if (spawnRequest.id == null || spawnRequest.id.length === 0 || spawnRequest.replacingCreep == null)
                {
                    creep.spawnRequest = null;
                }
                else
                {
                    this.requestsCurrentlySpawning.push(creep.spawnRequest.id);
                }
            }

            creeps[creep.name] = creep;

            this.laborPool.addCreep(creep);
        }

        console.log('total creep body count: ' + totalBodyCount);

        for(let task of this.tasks)
        {
            this.scheduleTask(task, creeps, taskLaborPools);
        }

        for (let name in creeps)
        {
            let creep = creeps[name];
            if (creep != null)
            {
                creep.task = null;
                creep.say('\u{1F4A4}');
            }
        }

        this.spawnCreeps();

        let totalSurplusCreeps = _.size(creeps);
        console.log("Surplus Creeps: " + totalSurplusCreeps);

        //this.recycleCreeps(creeps);
    }

    scheduleTask(task: Task, creeps: Dictionary<Creep>, taskLaborPools: Dictionary<LaborPool>): void
    {
        let skippedCreeps: Dictionary<Creep> = {};
        let priorityCache: Dictionary<number> = {};
        taskLaborPools[task.id] = new LaborPool();

        task.beginScheduling();
        let prioritizedCreeps = this.getCreepsByTier(task, creeps, priorityCache);

        let code = OK;
        let creepTaskPriority = 0;

        for (let index = 0; index < prioritizedCreeps.length; index++)
        {
            let tierCreeps = prioritizedCreeps[index];

            if (tierCreeps.length > 1)
            {
                console.log('//////  Sorting Tier ' + index + ' for ' + task.name);
                this.sortCreepsBySecondPriority(task, tierCreeps);
            }

            for (let creep of tierCreeps)
            {
                if (creep.type != null && task.labor.types[creep.type] != null)
                {
                    taskLaborPools[task.id].addCreep(creep);
                }

                if (code === ERR_NO_WORK)
                {
                    break;
                }

                code = task.schedule(creep);

                // if (task instanceof TransferResource)
                // {
                //     console.log('    ' + code);
                // }

                if (code >= 0 || (creep.spawnRequest != null && creep.spawnRequest.task == task))
                {
                    creep.task = task;
                    creep.taskPriority = creepTaskPriority;
                    creepTaskPriority++;

                    // remove creep now that it's been scheduled
                    creeps[creep.name] = null;
                    delete creeps[creep.name];

                    if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
                    {
                        console.log("Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id) + ' ' + creep.type + ' REPLACEMENT');
                    }
                    else
                    {
                        console.log("Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id) + ' ' + creep.type);
                    }

                    if (creep.ticksToLive < 300 &&
                        CREEP_TYPE[creep.type] != null &&
                        creep.task != null &&
                        task.labor.types[creep.type] != null &&
                        task.shouldPlanToReplace(creep))
                    {
                        this.spawnRequests.push(new SpawnRequest('replace_' + creep.name, null, creep, CREEP_TYPE[creep.type]));
                    }

                    this.schedulePassives(creep);

                    if (code === NO_MORE_WORK)
                    {
                        break;
                    }
                }
                else if (code === ERR_NO_WORK)
                {

                }
                else if (code === ERR_CANNOT_PERFORM_TASK)
                {
                    //skip this creep
                    skippedCreeps[creep.name] = creep;
                    console.log('   ' + creep + ' ERR_CANNOT_PERFORM_TASK ' + task.id);
                }
                else if (code === ERR_SKIP_WORKER)
                {
                    //skip this creep
                    skippedCreeps[creep.name] = creep;
                }
                else
                {
                    console.log("UNKNOWN ERROR FROM SCHEDULING: " + task.id + " creep: " + creep + " code: " + code);
                }
            }

            if (code === NO_MORE_WORK || code === ERR_NO_WORK)
            {
                break;
            }
        }
        task.endScheduling();

        // DEBUG
        // for (let index = 0; index < prioritizedCreeps.length; index++)
        // {
        //     for (let creep of prioritizedCreeps[index])
        //     {
        //         if (task instanceof UpgradeRoomController)
        //         {
        //             console.log('    ' + priorityCache[creep.id] + ' - ' + creep);
        //         }
        //     }
        // }

        this.calculateLaborPool(task, prioritizedCreeps, skippedCreeps);
    }

    calculateLaborPool(task, prioritizedCreeps, skippedCreeps): void
    {
        let laborPool: LaborPool = new LaborPool();

        for (let index = 0; index < prioritizedCreeps.length; index++)
        {
            let tierCreeps = prioritizedCreeps[index];

            for (let creep of tierCreeps)
            {
                if (skippedCreeps[creep.name] == null && creep.type != null && task.labor.types[creep.type] != null)
                {
                    laborPool.addCreep(creep);
                }
            }
        }

        let log = false;
        // if (task instanceof UpgradeRoomController)
        // {
        //     log = true;
        // }

        for(let name in task.labor.types)
        {
            let type = task.labor.types[name];

            if (type == null)
            {
                continue;
            }

            if (laborPool.types[name] == null)
            {
                laborPool.types[name] = new LaborPoolType({}, 0);
            }

            let typePool = laborPool.types[name];
            let doSpawn = false;

            if (log)
            {
                console.log(task.name + ' -> ' + name + ': '+ type.min + ' > ' + typePool.count);
            }

            if (type.min > typePool.count)
            {
                //console.log(task.name + ' -> ' + name + ': '+ type.min + ' > ' + typePool.count);
                doSpawn = true;
            }

            if (!doSpawn)
            {
                for (let partName in type.parts)
                {
                    if (log)
                    {
                        console.log(task.name + ' -> ' + partName + ': '+ type.parts[partName] + ' > ' + typePool.parts[partName]);
                    }

                    if (type.parts[partName] > typePool.parts[partName])
                    {
                        //console.log(task.name + ' -> ' + partName + ': '+ type.parts[partName] + ' > ' + typePool.parts[partName]);
                        doSpawn = true;
                        break;
                    }
                }
            }

            if (log)
            {
                console.log(task.name + ' -> ' + name + ': '+ type.max + ' > ' + typePool.count);
            }

            if (doSpawn && type.max > typePool.count)
            {
                //console.log(task.name + ' -> ' + name + ': '+ type.max + ' > ' + typePool.count);
                this.spawnRequests.push(new SpawnRequest('new_: ' + task.id, task, null, CREEP_TYPE[name]));
            }
        }
    }

    schedulePassives(creep: Creep): void
    {
        if (creep.action === ACTION_MOVE || creep.action == null)
        {
            let structures = creep.room.lookForAt<Structure>(LOOK_STRUCTURES, creep.pos);

            if (structures.length > 0)
            {
                for (let structure of structures)
                {
                    if (structure.hits < structure.hitsMax)
                    {
                        creep.repair(structure);
                        break;

                    }
                }
            }
            else
            {
                let sites = creep.room.lookForAt<ConstructionSite>(LOOK_CONSTRUCTION_SITES, creep.pos);
                if (sites.length > 0)
                {
                    creep.build(sites[0]);
                }
            }
        }
    }

    collectTasks(): void
    {
        let globalTasks = [];

        //////////////////////////////////////////////////////////////////////////////
        // turn flags into tasks
        for (let name in Game.flags)
        {
            let flag = Game.flags[name];
            globalTasks.push.apply(globalTasks, flag.getTasks());
        }

        for(let room of this.myRooms)
        {
            globalTasks.push.apply(globalTasks, room.getTasks());
        }

        this.breakdownTasks(globalTasks, this.tasks);
        this.sortTasks(this.tasks);

        console.log("total tasks: " + this.tasks.length);
        for (let taskIndex = 0; taskIndex < this.tasks.length; taskIndex++)
        {
            let task = this.tasks[taskIndex];

            if (task.roomName == null)
            {
                console.log('   [global]' + task.priority + " -> " + ((task.name != null) ? task.name : task.id));
            }
            else
            {
                console.log('   [' + task.roomName + ']' + task.priority + " -> " + ((task.name != null) ? task.name : task.id));
            }
        }
    }

    sortTasks(tasks: Task[]): void
    {
        // Sort the basic tasks by their priority
        tasks.sort(function(a, b)
        {
            if (a.roomName == null && b.roomName != null)
            {
                return 1;
            }

            if (a.roomName != null && b.roomName == null)
            {
                return -1;
            }

            if (a.roomName != null && b.roomName != null)
            {
                if (SporeRoom.getPriority(a.roomName) < SporeRoom.getPriority(b.roomName))
                {
                    return 1;
                }

                if (SporeRoom.getPriority(a.roomName) > SporeRoom.getPriority(b.roomName))
                {
                    return -1;
                }
            }

            if (a.priority < b.priority)
            {
                return 1;
            }

            if (a.priority > b.priority)
            {
                return -1;
            }

            if (a.id < b.id)
            {
                return 1;
            }

            if (a.id > b.id)
            {
                return -1;
            }

            return 0;
        });
    }

    breakdownTasks(tasks: Task[], outputTasks: Task[]): void
    {
        // Breakdown tasks
        for (let index = 0; index < tasks.length; index++)
        {
            let task = tasks[index];

            if (task.isComplex)
            {
                let subTasks = task.getSteps();
                tasks.push.apply(tasks, subTasks);
            }
            else if (this.tasksById[task.id] == null)
            {
                outputTasks.push(task);
                this.tasksById[task.id] = task;
            }
            else
            {
                if (this.tasksById[task.id].priority !== task.priority)
                {
                    outputTasks.push(task);
                    this.tasksById[task.id] = task;
                }
            }
        }
    }

    getCreepsByTier(task: Task, creeps: Dictionary<Creep>, priorityCache?: Dictionary<number>): Creep[][]
    {
        if (priorityCache == null)
        {
            priorityCache = {};
        }

        let creepsByPriority: Creep[] = [];

        for (let name in creeps)
        {
            let creep = creeps[name];
            let priority = task.prioritize(creep);

            if (priority > 0)
            {
                priorityCache[creep.id] = priority;
                creepsByPriority.push(creep);
            }
        }

        creepsByPriority.sort(function (a, b)
        {
            let priorityA = priorityCache[a.id];
            let priorityB = priorityCache[b.id];

            if (priorityA < priorityB)
            {
                return 1;
            }

            if (priorityA > priorityB)
            {
                return -1;
            }

            return 0;
        });

        let tier = -1;
        let creepsByTier = [];
        let lastPriority = -1;
        for (let creep of creepsByPriority)
        {
            if (priorityCache[creep.id] != lastPriority)
            {
                lastPriority = priorityCache[creep.id];
                tier++;
                creepsByTier.push([]);
            }

            creepsByTier[tier].push(creep);
        }

        // if (_.size(creepsByPriority) > 0)
        // {
        //     console.log(task.name + ' creep priority: ' + _.size(creepsByPriority));
        //     for (let creep of creepsByPriority)
        //     {
        //         console.log('   ' + creep.name + ' ' + priorityCache[creep.id]);
        //     }
        // }

        return creepsByTier;
    }

    sortCreepsBySecondPriority(task: Task, creeps: Creep[]): void
    {
        let distanceCache: Dictionary<number> = {};

        creeps.sort(function (a, b)
        {
            if (task.near != null)
            {
                let aDistance = distanceCache[a.pos.toString()];
                if (aDistance == null)
                {
                    aDistance = a.pos.findDistanceByPathTo(task.near);
                    distanceCache[a.pos.toString()] = aDistance;
                }

                let bDistance = distanceCache[b.pos.toString()];
                if (bDistance == null)
                {
                    bDistance = b.pos.findDistanceByPathTo(task.near);
                    distanceCache[b.pos.toString()] = bDistance;
                }

                if (aDistance < bDistance)
                {
                    return 1;
                }

                if (aDistance > bDistance)
                {
                    return -1;
                }
            }

            if (a.name < b.name)
            {
                return 1;
            }

            if (a.name > b.name)
            {
                return -1;
            }

            return 0;
        });
    }

    sortAppointments(appointments: SpawnAppointment[]): void
    {
        appointments.sort(function (a, b)
        {
            let spawnRoomName = a.spawn.pos.roomName;

            let taskA = a.task;
            if (taskA == null && a.replacingCreep != null)
            {
                taskA = a.replacingCreep.task;
            }

            let taskB = b.task;
            if (taskB == null && b.replacingCreep != null)
            {
                taskB = b.replacingCreep.task;
            }

            if (taskA == null && taskB != null)
            {
                return 1;
            }

            if (taskA != null && taskB == null)
            {
                return -1;
            }

            if (taskA == null && taskB == null)
            {
                // tasks with more urgency should be favored
                if (a.spawnPriority < b.spawnPriority)
                {
                    return 1;
                }

                if (a.spawnPriority > b.spawnPriority)
                {
                    return -1;
                }

                if (a.ticksTillRequired < b.ticksTillRequired)
                {
                    return -1;
                }

                if (a.ticksTillRequired > b.ticksTillRequired)
                {
                    return 1;
                }
            }

            // global tasks should only be favored after all of the individual rooms needs are met
            if (taskA.roomName == null && (taskB.roomName != null&& taskB.roomName === spawnRoomName))
            {
                console.log(taskA.name + ' missing room identifier');
                return 1;
            }

            if ((taskA.roomName != null && taskA.roomName === spawnRoomName) && taskB.roomName == null)
            {
                console.log(taskB.name + ' missing room identifier');
                return -1;
            }

            // tasks in the same room as the spawn should be favored over other rooms needs
            if (taskA.roomName !== spawnRoomName && taskB.roomName === spawnRoomName)
            {
                return 1;
            }

            if (taskA.roomName === spawnRoomName && taskB.roomName !== spawnRoomName)
            {
                return -1;
            }

            let roomA = Game.rooms[taskA.roomName];
            let roomB = Game.rooms[taskB.roomName];

            if (roomA == null && roomB != null)
            {
                return 1;
            }

            if (roomA != null && roomB == null)
            {
                return -1;
            }

            // if (roomA != null && roomB != null)
            // {
            //     if (roomA.energyCapacityAvailable < roomB.energyCapacityAvailable)
            //     {
            //         return 1;
            //     }
            //
            //     if (roomA.energyCapacityAvailable > roomB.energyCapacityAvailable)
            //     {
            //         return -1;
            //     }
            // }

            // higher priority tasks should be favored
            if (taskA.priority < taskB.priority)
            {
                return 1;
            }

            if (taskA.priority > taskB.priority)
            {
                return -1;
            }

            // tasks with more urgency should be favored
            if (a.spawnPriority < b.spawnPriority)
            {
                return 1;
            }

            if (a.spawnPriority > b.spawnPriority)
            {
                return -1;
            }

            if (a.ticksTillRequired < b.ticksTillRequired)
            {
                return -1;
            }

            if (a.ticksTillRequired > b.ticksTillRequired)
            {
                return 1;
            }

            return 0;
        });
    }

    getSpawnAppointments(request: SpawnRequest, spawns: Dictionary<Spawn>): SpawnAppointment[]
    {
        let appointments: SpawnAppointment[] = [];

        for (let name in spawns)
        {
            let spawn = spawns[name];
            let appointment;

            let task = request.task;

            if (task == null && request.replacingCreep != null)
            {
                task = request.replacingCreep.task;
            }

            if (task != null)
            {
                appointment = task.createAppointment(spawn, request);

                if (appointment == null || appointment.spawnPriority === -1)
                {
                    console.log('Skipping Appointment: ' + request.id + ' ' + request.creepBody.name);
                    continue;
                }
            }
            else if (request.replacingCreep == null)
            {
                appointment = new SpawnAppointment(
                    request.id,
                    null,
                    0.001,
                    spawn,
                    0,
                    null,
                    request.creepBody);
            }
            else
            {
                console.log('Skipping Appointment: ' + request.id + ' ' + request.creepBody.name);
            }

            if (appointment != null)
            {
                appointments.push(appointment);
            }
        }

        return appointments;
    }

    spawnCreeps(): void
    {
        // 1. Rooms should not spawn creeps for low level tasks that can't be completed before a higher level task needs a spawn
        // 2. Rooms should favor requests from their own room
        // 3. When available, higher level rooms should build better creeps for nearby lower level rooms [aka favor over building them in the lower level rooms]
        // 4. When available, higher level rooms should build creeps for other rooms who can't

        let appointmentsBySpawn: Dictionary<SpawnAppointment[]> = {};
        let spawns: Dictionary<Spawn> = {};

        let hasNonWorkingSpawn = false;
        for (let name in Game.spawns)
        {
            let spawn = Game.spawns[name];
            // if (spawn.spawning != null)
            // {
            //     let creep = Game.creeps[spawn.spawning.name];
            //     if (creep.spawnRequest != null)
            //     {
            //         this.requestsCurrentlySpawning.push(creep.spawnRequest.id);
            //     }
            // }
            // else
            {
                hasNonWorkingSpawn = true;
                appointmentsBySpawn[spawn.name] = [];
                spawns[spawn.name] = spawn;
            }
        }

        if (!hasNonWorkingSpawn)
        {
            return;
        }

        for (let request of this.spawnRequests)
        {
            if (this.requestsCurrentlySpawning.indexOf(request.id) !== -1)
            {
                continue;
            }

            let prioritizedSpawnAppointments = this.getSpawnAppointments(request, spawns);

            for (let appointment of prioritizedSpawnAppointments)
            {
                appointmentsBySpawn[appointment.spawn.name].push(appointment);
            }
        }

        let spawnsList = _.values(spawns);
        spawnsList.sort(function (a, b)
        {
            if (a.room.energyCapacityAvailable < b.room.energyCapacityAvailable)
            {
                return 1;
            }

            if (a.room.energyCapacityAvailable > b.room.energyCapacityAvailable)
            {
                return -1;
            }

            if (a.room.name < b.room.name)
            {
                return 1;
            }

            if (a.room.name > b.room.name)
            {
                return -1;
            }

            return 0;
        });

        for (let spawn of spawnsList)
        {
            if (appointmentsBySpawn[spawn.name].length === 0)
            {
                continue;
            }

            this.sortAppointments(appointmentsBySpawn[spawn.name]);

            for (let appointment of appointmentsBySpawn[spawn.name])
            {
                console.log('Appointment: ' + appointment.id + ' ' + appointment.creepBody.name + ' ' + appointment.ticksTillRequired);
            }

            // have each vote for what it can handle
            // the highest prioritize spawn for each request that vote wins

            let priorityAppointment = null;
            let priorityBody = null;
            let priorityBodySpawnTime = null;

            for (let index = 0; index < appointmentsBySpawn[spawn.name].length; index++)
            {
                let appointment = appointmentsBySpawn[spawn.name][index];
                let body = appointment.spawn.getBody(appointment.creepBody);
                let bodySpawnTime = body.length * CREEP_SPAWN_TIME;

                if (priorityAppointment == null || appointment.ticksTillRequired + bodySpawnTime < priorityAppointment.ticksTillRequired - 10)
                {
                    priorityAppointment = appointment;
                    priorityBody = body;//priorityAppointment.spawn.getBody(priorityAppointment.creepBody);
                    priorityBodySpawnTime = bodySpawnTime;//priorityBody.length * CREEP_SPAWN_TIME;
                }
            }

            if (priorityAppointment != null && priorityAppointment.ticksTillRequired <= 0)
            {
                this.spawnCreep(priorityAppointment);
            }
        }
    }

    spawnCreep(appointment: SpawnAppointment)
    {
        let spawn = appointment.spawn;
        let creepBody = appointment.creepBody;

        if (spawn.spawning != null)
        {
            return;
        }

        let body = spawn.getBody(creepBody);

        if (spawn.canCreateCreep(body, undefined) === OK)
        {
            let taskId = (appointment.task != null) ? appointment.task.id : null;
            let replacingCreepName = (appointment.replacingCreep != null) ? appointment.replacingCreep.name : null;

            spawn.createCreep(body, undefined, {type: creepBody.name, spawnRequest: { id: appointment.id, taskId: taskId, replacingCreepName: replacingCreepName } });
        }
    }

    recycleCreeps(creeps: Dictionary<Creep>): void
    {
        let totalSurplusCreeps = _.size(creeps);
        console.log("Surplus Creeps: " + totalSurplusCreeps);

        // Recycle surplus creeps
        let allowedSurplusCreepsPerRoom = 6;
        if (totalSurplusCreeps > allowedSurplusCreepsPerRoom)
        {
            let creepByRoom = _.groupBy(creeps, function(c: Creep){ return c.room.name; });

            for(let room of this.myRooms)
            {
                let roomCreeps = creepByRoom[room.name];

                if (roomCreeps == null)
                {
                    continue;
                }

                if (roomCreeps.length > allowedSurplusCreepsPerRoom && room.mySpawns.length > 0)
                {
                    let recycleTask = new RecycleCreep(ScreepsPtr.from<Spawn>(room.mySpawns[0]));

                    // Sort the creeps so the cheapest ones get recycled first
                    roomCreeps.sort(function(a: Creep, b: Creep)
                    {
                        if (a.body.length < b.body.length)
                        {
                            return 1;
                        }

                        if (a.body.length > b.body.length)
                        {
                            return -1;
                        }

                        return 0;
                    });

                    for (let index = 0; index < roomCreeps.length - allowedSurplusCreepsPerRoom; index++)
                    {
                        let creep = roomCreeps[index];

                        if (recycleTask.schedule(creep) === ERR_NO_BODYPART)
                        {
                            creep.suicide();
                        }
                    }
                }
            }
        }
    }

    claimResource(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended: boolean, near: RoomPosition, options: CollectOptions, excludes: Dictionary<Claimable>, receipt?: ClaimReceipt): ClaimReceipt
    {
        if (receipt != null && receipt.target != null && excludes[receipt.target.id] == null)
        {
            let flatStorePriorities = _.flattenDeep<string>(options.storePriorities);
            if (_.includes(flatStorePriorities, receipt.type) ||
                _.includes(flatStorePriorities, receipt.target.id))
            {
                let claim = receipt.target.makeClaim(claimer, resourceType, amount, minAmount, isExtended);
                if (claim !== null)
                {
                    return claim;
                }
            }
        }

        if (options.roomNames == null || options.roomNames.length === 0)
        {
            options.roomNames = [];
            options.roomNames.push(claimer.pos.roomName);
        }

        for (let priorityIndex = 0; priorityIndex < options.storePriorities.length; priorityIndex++)
        {
            let group = options.storePriorities[priorityIndex];
            let claimables: Claimable[] = [];

            for (let index = 0; index < group.length; index++)
            {
                for (let roomName of options.roomNames)
                {
                    if (Game.rooms[roomName] != null)
                    {
                        GATHER_RESOURCE_STORES[group[index]].bind(Game.rooms[roomName])(claimables, resourceType, amount, claimer, near, excludes);
                    }
                }
            }

            if (claimables.length > 0)
            {
                near.sortByRangeTo(claimables);

                for (let claimable of claimables)
                {
                    if (claimable.makeClaim == null)
                    {
                        continue;
                    }

                    let newReceipt = claimable.makeClaim(claimer, resourceType, amount, minAmount, isExtended);

                    if (newReceipt != null)
                    {
                        return newReceipt;
                    }
                }
            }
        }

        return null;
    }

}