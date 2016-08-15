
import {Task, TaskPriority, TaskSet, ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK} from "./task";
import {RecycleCreep} from "./taskRecycleCreep";

export class SporeColony
{
    constructor()
    { }

    tasksById: TaskSet = {};

    get myRooms(): Room[]
    {
        let rooms: Room[] = [];

        for (let roomId in Game.rooms)
        {
            let room = Game.rooms[roomId];

            if (room.my)
            {
                rooms.push(room);
            }
        }

        // Object.defineProperty(this, "myRooms", {
        //     value: myRooms,
        //     enumerable: true,
        //     configurable: true
        // });
        return rooms;
    }

    run(): void
    {
        // colony
        // - Invade
        // - Scout
        // - Mine unclaimed

        // room 1
        // - Spawns & Extensions
        // - Upgrade Controller
        // - Repair
        //   - rampart
        //   - wall
        //   - container
        // - Build
        // - Store
        // - Mine

        // - Gather
        //   - energy
        //   - minerals
        // - Defend
        //   - tower
        //   -
        // - Attack

        // room 2
        // room 3

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

                return 0;
            });

            for (let taskIndex = 0; taskIndex < room.basicTasks.length; taskIndex++)
            {
                let task = room.basicTasks[taskIndex];
                console.log(task.priority + " -> " + ((task.name != null) ? task.name : task.id));
            }

            // Schedule untasked creeps to tasks based on priority
            //console.log("Tasks: " + room.tasks.length);
            console.log(room + " basic tasks: " + room.basicTasks.length);
        }


        {
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

                // Check if the creep was previously assigned a task
                if (creep.task != null)
                {
                    prescheduledCreeps.push(new PrescheduledWork(creep, creep.task));
                }
                else
                {
                    untaskedCreeps.push(creep);
                }
            }

            console.log("untaskedCreeps: " + untaskedCreeps.length);

            // Sort the basic tasks by their priority
            prescheduledCreeps.sort(function(a: PrescheduledWork, b: PrescheduledWork)
            {
                if (a.task.priority < b.task.priority)
                {
                    return 1;
                }

                if (a.task.priority > b.task.priority)
                {
                    return -1;
                }

                return 0;
            });

            for (let index = 0; index < prescheduledCreeps.length; index++)
            {
                let creep = prescheduledCreeps[index].creep;
                let task = prescheduledCreeps[index].task;

                // if we fail to reschedule the creep for their previous task then
                let code = task.schedule(creep);
                if (code >= 0)
                {
                    console.log("Pre-Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id));
                    creep.task = task;
                    task.scheduledWorkers++;
                }
                else
                {
                    if (creep.doTrack === true)
                    {
                        console.log("/////////// " + creep + " failed to preschedule " + ((task.name != null) ? task.name : task.id) + " " + code);
                    }

                    // add him to the list of creeps needing work
                    untaskedCreeps.push(creep);
                    prescheduledCreeps.splice(index, 1);
                    index--;
                }
            }

            for(let room of this.myRooms)
            {
                let taskIndex = 0;
                for (; taskIndex < room.basicTasks.length; taskIndex++)
                {
                    let task = room.basicTasks[taskIndex];

                    if (task.possibleWorkers === 0)
                    {
                        room.basicTasks.splice(taskIndex, 1);
                        taskIndex--;

                        // skip any tasks that have already scheduled all their work
                        continue;
                    }

                    // if we're out of creeps stop iterating over tasks
                    if (untaskedCreeps.length === 0)
                    {
                        if ((task.scheduledWorkers === 0 && task.possibleWorkers === -1) ||
                            (task.possibleWorkers > task.scheduledWorkers))
                        {
                            room.needsWorkers = true;
                        }
                        break;
                    }

                    for (let creepIndex = untaskedCreeps.length - 1; creepIndex >= 0; creepIndex--)
                    {
                        let creep = untaskedCreeps[creepIndex];

                        if (creep.room != room)
                        {
                            continue;
                        }

                        let code = task.schedule(creep);
                        if (code >= 0)
                        {
                            task.scheduledWorkers++;
                            creep.task = task;

                            // remove creep now that it's been scheduled
                            untaskedCreeps.splice(creepIndex, 1);
                            console.log("Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id));
                            break;
                        }
                        else if (code === ERR_NO_WORK)
                        {
                            room.basicTasks.splice(taskIndex, 1);
                            taskIndex--;
                            break;
                        }
                        else if (code === ERR_CANNOT_PERFORM_TASK)
                        {
                            //skip this creep
                        }
                        else
                        {
                            console.log("UNKNOWN ERROR FROM SCHEDULING: " + task.id + " code: " + code);
                        }
                    }
                }
            }

            // ensure that any prescheduled tasks are cancelled if there is higher priority work to be done
            for (let index = prescheduledCreeps.length - 1; index >= 0; index--)
            {
                let scheduledCreep = prescheduledCreeps[index];
                let creep = scheduledCreep.creep;
                let scheduledTask = scheduledCreep.task;

                if (!scheduledCreep.creep.room.my)
                {
                    continue;
                }

                for (let basicIndex = 0; basicIndex < creep.room.basicTasks.length; basicIndex++)
                {
                    let task = creep.room.basicTasks[basicIndex];

                    if (scheduledTask.priority < task.priority &&
                        ((task.scheduledWorkers < task.possibleWorkers && task.possibleWorkers > -1) ||
                        task.scheduledWorkers == 0 && task.possibleWorkers == -1))
                    {

                        let code = task.schedule(creep);
                        if (code >= 0)
                        {
                            task.scheduledWorkers++;
                            creep.task = task;

                            console.log("Re-Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id));
                            break;
                        }
                        else if (code == ERR_NO_WORK)
                        {
                            creep.room.basicTasks.splice(basicIndex, 1);
                            basicIndex--;
                            break;
                        }
                    }
                }
            }

            console.log("Untasked Creeps: " + untaskedCreeps.length);

            for(let room of this.myRooms)
            {
                if (!room.needsWorkers)
                {
                    continue;
                }

                for (let spawn of room.mySpawns)
                {
                    if (spawn.spawning != null)
                    {
                        continue;
                    }

                    if (room.name == 'W23S48')
                    {
                        //spawn.createCreep([WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined);
                        //spawn.createCreep([WORK, WORK, WORK, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined);
                        spawn.createCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined);
                        //spawn.createCreep([TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE], undefined);
                    }
                    else if (room.name == 'sim')
                    {
                        spawn.createCreep([WORK, CARRY, MOVE, MOVE], undefined);
                    }
                    else
                    {
                        //spawn.createCreep([WORK, CARRY, MOVE, MOVE], undefined);
                        //spawn.createCreep([WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], undefined);
                        spawn.createCreep([WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined);

                        //spawn.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, WORK, MOVE, ATTACK, MOVE], undefined);
                        //spawn.createCreep([ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined);
                        //spawn.createCreep([HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], undefined);
                        //spawn.createCreep([CLAIM, WORK, ATTACK, MOVE, MOVE, MOVE], undefined);
                    }
                    break;
                }
            }

            if (untaskedCreeps.length > 0)
            {
                let creepByRoom = _.groupBy(untaskedCreeps, function(c: Creep){ return c.room.name; });

                for(let room of this.myRooms)
                {
                    let creeps = creepByRoom[room.name];

                    if (creeps == null)
                    {
                        continue;
                    }

                    if (creeps.length > 5 && room.mySpawns.length > 0)
                    {
                        let recycleTask = new RecycleCreep("", room.mySpawns[0]);

                        // Sort the creeps so the cheapest ones get recycled first
                        creeps.sort(function(a: Creep, b: Creep)
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

                        for (let index = 0; index < creeps.length - 5; index++)
                        {
                            let creep = creeps[index];

                            if (recycleTask.schedule(creep) === ERR_NO_BODYPART)
                            {
                                // need to heal or suicide
                            }
                        }
                    }
                }
            }
        }
    }
}