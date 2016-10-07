import {Task, ERR_NO_WORK, TaskPriority, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK, LaborDemandType} from './task';
import {CREEP_TYPE} from "./sporeCreep";
import {ScreepsPtr, RoomObjectLike} from "./screepsPtr";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import {BodyDefinition} from "./bodyDefinition";
import Dictionary = _.Dictionary;

export class DefendRoom extends Task
{
    idealCreepBody: BodyDefinition;
    scheduledWorkers: number;
    anchor: RoomObjectLike;

    constructor(public defendingRoomName: string)
    {
        super(false);

        this.id = 'Defending ' + defendingRoomName;
        this.name = 'Defending [' + defendingRoomName + ']';
        this.possibleWorkers = -1;
        this.idealCreepBody = CREEP_TYPE.REMOTE_DEFENDER;
        this.priority = TaskPriority.High;
        this.anchor = { pos: new RoomPosition(25, 25, this.defendingRoomName), room: Game.rooms[this.defendingRoomName] };

        let room = Game.rooms[this.defendingRoomName];
        if (room != null && room.hostileCreeps.length > 0)
        {
            this.priority = TaskPriority.Mandatory + 199;
        }

        this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ }, 1, 1);

        for (let flagName in Game.flags)
        {
            let flag = Game.flags[flagName];

            if (flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_ORANGE && flag.pos.roomName === this.defendingRoomName)
            {
                this.anchor = flag;
                break;
            }
        }
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        if (request.replacingCreep != null)
        {
            return super.createBasicAppointment(spawn, request, request.replacingCreep);
        }

        return super.createBasicAppointment(spawn, request, this.anchor);
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            return super.basicPrioritizeCreep(object, this.anchor, this.idealCreepBody);
        }

        return 0;
    }

    beginScheduling(): void
    {
        this.scheduledWorkers = 0;
    }

    hasWork(): boolean
    {
        if (this.possibleWorkers === 0)
        {
            return false;
        }

        if (this.labor.types[this.idealCreepBody.name] != null)
        {
            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
            if (this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max)
            {
                return false;
            }
        }

        return true;
    }

    schedule(object: RoomObjectLike): number
    {
        if (!this.hasWork())
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to defend a room with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let creep = <Creep>object;
        let code;

        if (creep.pos.roomName != this.defendingRoomName)
        {
            code = creep.goMoveTo(this.anchor);
            creep.heal(creep);
        }
        else if (creep.room.hostileCreeps.length === 0)
        {
            if (creep.room.injuredFriendlyCreeps.length > 0)
            {
                let injuredCreep = creep.room.injuredFriendlyCreeps[0];
                if (creep.heal(injuredCreep) == ERR_NOT_IN_RANGE)
                {
                    code = creep.moveTo(injuredCreep);
                    if (creep.rangedHeal(injuredCreep) == ERR_NOT_IN_RANGE)
                    {
                        creep.heal(creep);
                    }
                }
                else
                {
                    code = OK;
                }
            }
            else
            {
                code = creep.goMoveTo(this.anchor);
            }
        }
        else
        {
            let hostile = null;

            if (creep.taskMetadata != null && creep.taskMetadata.target != null && creep.task == this && creep.taskMetadata.time >= Game.time - 15)
            {
                hostile = Game.getObjectById<Creep>(creep.taskMetadata.target);
            }

            if (hostile == null)
            {
                hostile = creep.pos.findClosestByPath(creep.room.hostileCreeps);
                creep.taskMetadata = { target: hostile.id, time: Game.time };
            }

            code = creep.attack(hostile);

            if (code === ERR_NOT_IN_RANGE)
            {
                code = creep.moveTo(hostile);

                if (code === ERR_TIRED)
                {
                    code = OK;
                }

                creep.heal(creep);
            }

            creep.rangedAttack(hostile);
        }

        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
        {
            return OK;
        }

        if (code === OK)
        {
            this.scheduledWorkers++;

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        if (!this.hasWork())
        {
            return NO_MORE_WORK;
        }

        return code;
    }
}