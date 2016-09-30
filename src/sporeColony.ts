
import Dictionary = _.Dictionary;
import {Task, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK} from "./task";
import {RecycleCreep} from "./taskRecycleCreep";
import {ScreepsPtr} from "./screepsPtr";
import {SpawnAppointment, SpawnRequest} from "./spawnRequest";
import {SporeCreep, CREEP_TYPE} from "./sporeCreep";
import {Economy} from "./sporeRoom";
import {HarvestEnergy} from "./taskHarvestEnergy";
import {TransferResource} from "./taskTransferResource";
import {UpgradeRoomController} from "./taskUpgradeRoomController";
import {BuildBarrier} from "./taskBuildBarrier";

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

export class SporeColony
{
    constructor()
    { }

    tasksById: Dictionary<Task> = {};
    laborPool: LaborPool = new LaborPool();
    spawnRequests: SpawnRequest[] = [];
    requestsCurrentlySpawning: string[] = [];

    get myRooms(): Room[]
    {
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
                return -1;
            }

            if (a.priority > b.priority)
            {
                return 1;
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

        Object.defineProperty(this, "myRooms", {value: myRooms});
        return myRooms;
    }

    run(): void
    {
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

        for(let name in Game.creeps)
        {
            let creep = Game.creeps[name];

            if (creep.spawning)
            {
                continue;
            }

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

        for(let room of this.myRooms)
        {
            for (let task of room.basicTasks)
            {
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
                        if (code >= 0 || (creep.spawnRequest != null && creep.spawnRequest.task == task))
                        {
                            creep.task = task;
                            creep.taskPriority = creepTaskPriority;
                            creepTaskPriority++;

                            // remove creep now that it's been scheduled
                            creeps[creep.name] = null;
                            delete creeps[creep.name];
                            console.log("Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id) + ' ' + creep.type);

                            if (creep.ticksToLive < 300 && CREEP_TYPE[creep.type] != null && creep.task != null)
                            {
                                this.spawnRequests.push(new SpawnRequest('replace_' + creep.name, null, creep, CREEP_TYPE[creep.type]));
                            }

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
                            console.log('   ' + creep + ' ERR_CANNOT_PERFORM_TASK ' + task.id);
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

                for(let name in task.labor.types)
                {
                    let type = task.labor.types[name];

                    if (type == null)
                    {
                        continue;
                    }

                    if (taskLaborPools[task.id].types[name] == null)
                    {
                        taskLaborPools[task.id].types[name] = new LaborPoolType({}, 0);
                    }

                    let typePool = taskLaborPools[task.id].types[name];
                    let doSpawn = false;

                    if (type.min > typePool.count)
                    {
                        //console.log(name + ': '+ type.min + ' > ' + typePool.count);
                        doSpawn = true;
                    }

                    if (!doSpawn)
                    {
                        for (let partName in type.parts)
                        {
                            if (type.parts[partName] > typePool.parts[partName])
                            {
                                //console.log(partName + ': '+ type.parts[partName] + ' > ' + typePool.parts[partName]);
                                doSpawn = true;
                                break;
                            }
                        }
                    }

                    if (doSpawn && type.max > typePool.count)
                    {
                        this.spawnRequests.push(new SpawnRequest('new_: ' + task.id, task, null, CREEP_TYPE[name]));
                    }
                }
            }
        }

        for (let name in creeps)
        {
            let creep = creeps[name];
            if (creep != null)
            {
                creep.task = null;
            }
        }

        this.spawnCreeps();

        let totalSurplusCreeps = _.size(creeps);
        console.log("Surplus Creeps: " + totalSurplusCreeps);
        //this.recycleCreeps(creeps);
    }

    collectTasks(): void
    {
        this.tasksById = {};

        for(let room of this.myRooms)
        {
            room.tasksById = {};
            room.tasks = [];
            room.basicTasks = [];

            //////////////////////////////////////////////////////////////////////////////
            // turn flags into tasks
            for (let name in Game.flags)
            {
                let flag = Game.flags[name];

                if (flag.room != room)
                {
                    continue;
                }

                flag.room.tasks.push.apply(flag.room.tasks, flag.getTasks());
            }

            room.tasks.push.apply(room.tasks, room.getTasks());

            // Breakdown tasks
            for (let index = 0; index < room.tasks.length; index++)
            {
                let task = room.tasks[index];

                if (task.isComplex)
                {
                    let subTasks = task.getSteps();
                    room.tasks.push.apply(room.tasks, subTasks);
                }
                else if (room.tasksById[task.id] == null)
                {
                    room.basicTasks.push(task);
                    room.tasksById[task.id] = task;
                    this.tasksById[task.id] = task;
                }
                else
                {
                    if (room.tasksById[task.id].priority !== task.priority)
                    {
                        room.basicTasks.push(task);
                        room.tasksById[task.id] = task;
                        this.tasksById[task.id] = task;
                    }
                }
            }

            // Sort the basic tasks by their priority
            room.basicTasks.sort(function(a, b)
            {
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

            console.log(room + " basic tasks: " + room.basicTasks.length);

            for (let taskIndex = 0; taskIndex < room.basicTasks.length; taskIndex++)
            {
                let task = room.basicTasks[taskIndex];
                console.log('   ' + task.priority + " -> " + ((task.name != null) ? task.name : task.id));
            }
        }
    }

    getCreepsByPriority(task: Task, creeps: Dictionary<Creep>, priorityCache?: Dictionary<number>): Creep[]
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

        let distanceCache: Dictionary<number> = {};

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

        // if (_.size(creepsByPriority) > 0)
        // {
        //     console.log(task.name + ' creep priority: ' + _.size(creepsByPriority));
        //     for (let creep of creepsByPriority)
        //     {
        //         console.log('   ' + creep.name + ' ' + priorityCache[creep.id]);
        //     }
        // }

        return creepsByPriority;
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
                return 1;
            }

            if ((taskA.roomName != null && taskA.roomName === spawnRoomName) && taskB.roomName == null)
            {
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

            if (roomA != null && roomB != null)
            {
                if (roomA.energyCapacityAvailable < roomB.energyCapacityAvailable)
                {
                    return 1;
                }

                if (roomA.energyCapacityAvailable > roomB.energyCapacityAvailable)
                {
                    return -1;
                }
            }

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
                    priorityBody = priorityAppointment.spawn.getBody(priorityAppointment.creepBody);
                    priorityBodySpawnTime = priorityBody.length * CREEP_SPAWN_TIME;
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
}