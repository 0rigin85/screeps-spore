/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task, TaskPriority, ERR_NO_WORK, LaborDemandType, ERR_CANNOT_PERFORM_TASK, NO_MORE_WORK} from './task';
import {RoomObjectLike, ScreepsPtr} from "./screepsPtr";
import {ACTION_UPGRADE, CREEP_TYPE, CollectOptions} from "./sporeCreep";
import {BodyDefinition} from "./bodyDefinition";
import {SpawnRequest, SpawnAppointment} from "./spawnRequest";
import max = require("lodash/max");
import {Claimable} from "./sporeClaimable";

export class UpgradeRoomController extends Task
{
    idealCreepBody: BodyDefinition;
    scheduledWorkers: number;
    scheduledWork: number;
    upgraderSlots: RoomPosition[];
    remainingUpgraderSlots: RoomPosition[];
    collectOptions: CollectOptions = new CollectOptions([], [['near_dropped'], ['link','container','storage'], ['dropped']]);
    claimable: Claimable = null;

    constructor(public controller: ScreepsPtr<Controller>)
    {
        super(false);
        this.id = "Upgrade " + controller;
        this.name = "Upgrade " + controller.toHtml();
        this.possibleWorkers = -1;
        this.idealCreepBody = CREEP_TYPE.CITIZEN;
        this.roomName = controller.pos.roomName;
        this.priority = TaskPriority.Low;
        this.near = controller;
        this.upgraderSlots = [];
        this.remainingUpgraderSlots = [];

        if (!controller.isShrouded)
        {
            let area = <LookAtResultWithPos[]>controller.instance.room.lookForByRadiusAt(LOOK_STRUCTURES, controller.instance, 4, true);
            for (let pos of area)
            {
                if (pos.structure.structureType === STRUCTURE_STORAGE)
                {
                    this.idealCreepBody = CREEP_TYPE.UPGRADER;
                    this.upgraderSlots = <any>pos.structure.pos.getWalkableSurroundingAreaInRange(controller.instance.pos, 3);
                    this.claimable = <any>pos.structure;
                    break;
                }

                if (pos.structure.structureType === STRUCTURE_LINK)
                {
                    this.idealCreepBody = CREEP_TYPE.UPGRADER;
                    this.upgraderSlots = <any>pos.structure.pos.getWalkableSurroundingAreaInRange(controller.instance.pos, 3);
                    this.claimable = <any>pos.structure;
                }
                else if (pos.structure.structureType === STRUCTURE_CONTAINER && this.near === controller)
                {
                    this.idealCreepBody = CREEP_TYPE.UPGRADER;
                    this.upgraderSlots = <any>pos.structure.pos.getWalkableSurroundingAreaInRange(controller.instance.pos, 3);
                    this.claimable = <any>pos.structure;
                }
            }

            for (let pos of this.upgraderSlots)
            {
                this.remainingUpgraderSlots.push(pos);
            }

            //console.log(controller.pos.roomName + ' upgraderSlots ' + this.upgraderSlots.length);

            if (controller.instance.ticksToDowngrade < 2000)
            {
                this.priority = TaskPriority.Mandatory * 2;
            }
            else if (controller.instance.ticksToDowngrade < 3000)
            {
                this.priority = TaskPriority.Mandatory;
            }
            else if (controller.instance.level < 2)
            {
                this.priority = TaskPriority.Mandatory - 100;
            }
        }
    }

    createAppointment(spawn: Spawn, request: SpawnRequest): SpawnAppointment
    {
        return super.createBasicAppointment(spawn, request, this.controller);
    }

    prioritize(object: RoomObjectLike): number
    {
        if (object instanceof Creep)
        {
            if (object.carry[RESOURCE_ENERGY] === 0 && object.carryCount === object.carryCapacity)
            {
                return 0;
            }

            return super.basicPrioritizeCreep(object, this.controller, this.idealCreepBody);
        }

        return 0;
    }

    hasWork(): boolean
    {
        if (this.possibleWorkers === 0 || !this.controller.isValid)
        {
            return false;
        }

        // let requiredWork = 0;
        // let requiredWorkers = 0;
        // for (let laborTypeName in this.labor.types)
        // {
        //     let laborType = this.labor.types[laborTypeName];
        //
        //     if (laborType != null && laborType.parts[WORK] != null)
        //     {
        //         requiredWork += laborType.parts[WORK];
        //         requiredWorkers += laborType.max;
        //     }
        // }
        //
        // if (requiredWork != 0 &&
        //     this.scheduledWork >= requiredWork ||
        //     this.scheduledWorkers >= requiredWorkers)
        // {
        //
        // }

        if (this.labor.types[this.idealCreepBody.name] != null)
        {
            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
            if (this.scheduledWork >= this.labor.types[this.idealCreepBody.name].parts[WORK] ||
                this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max)
            {
                return false;
            }
        }

        return true;
    }

    beginScheduling(): void
    {
        this.scheduledWorkers = 0;
        this.scheduledWork = 0;
    }

    schedule(object: RoomObjectLike): number
    {
        if (!this.hasWork())
        {
            return ERR_NO_WORK;
        }

        if (!(object instanceof Creep))
        {
            console.log('ERROR: Attempted to upgrade a room controller with a non-creep room object. ' + object);
            return ERR_CANNOT_PERFORM_TASK;
        }

        let creep = <Creep>object;
        let code;

        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null)
        {
            creep.goMoveTo(creep.spawnRequest.replacingCreep);
            return OK;
        }

        if (creep.type == CREEP_TYPE.UPGRADER.name)
        {
            if (this.remainingUpgraderSlots.length <= 0)
            {
                return ERR_CANNOT_PERFORM_TASK;
            }

            let pos = this.remainingUpgraderSlots[0];
            if (creep.taskMetadata != null && creep.taskMetadata.type == 'UpgradeRC')
            {
                let oldPos = new RoomPosition(creep.taskMetadata.x, creep.taskMetadata.y, creep.taskMetadata.roomName);

                for(let index = 0;  index < this.remainingUpgraderSlots.length; index++)
                {
                    let slot = this.remainingUpgraderSlots[index];

                    if (slot.isEqualTo(oldPos))
                    {
                        pos = oldPos;
                        this.remainingUpgraderSlots.splice(index, 1);
                        break;
                    }
                }
            }
            else
            {
                this.remainingUpgraderSlots.splice(0, 1);
            }

            if (!creep.pos.isEqualTo(pos))
            {
                code = creep.moveTo(pos);

                if (code === ERR_TIRED)
                {
                    code = OK;
                }
            }
            else
            {
                code = OK;
            }

            if (code >= 0)
            {
                creep.taskMetadata = { type: 'UpgradeRC', x: pos.x, y: pos.y, roomName: pos.roomName };
            }

            let claimReceipt = this.claimable.makeClaim(this, RESOURCE_ENERGY, creep.carryCapacityRemaining, creep.getActiveBodyparts(WORK), false);
            if (claimReceipt != null)
            {
                claimReceipt.target.collect(creep, claimReceipt);
            }

            if (!this.controller.isShrouded)
            {
                creep.upgradeController(this.controller.instance);
            }

            creep.action = ACTION_UPGRADE;
            creep.actionTarget = this.controller.toString();
        }
        else
        {
            if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
                (creep.action === ACTION_UPGRADE && creep.carry[RESOURCE_ENERGY] > 0))
            {
                code = creep.goUpgrade(this.controller);
            }
            else
            {
                let amount = creep.carryCapacityRemaining;

                //creep.moveOptions.favor.push({ target: this.controller, range: 3 });
                code = creep.goCollect(
                    RESOURCE_ENERGY,
                    amount,
                    amount,
                    false,
                    this.controller.pos,
                    this.collectOptions,
                    {});

                if (code === ERR_NO_WORK)
                {
                    if (creep.carry[RESOURCE_ENERGY] > 0)
                    {
                        code = creep.goUpgrade(this.controller);
                    }
                    else
                    {
                        code = creep.goCollect(
                            RESOURCE_ENERGY,
                            amount,
                            0,
                            false,
                            this.controller.pos,
                            this.collectOptions,
                            {});
                    }
                }

                if (!this.controller.isShrouded)
                {
                    creep.upgradeController(this.controller.instance);
                }
            }
        }

        if (code === OK)
        {
            this.scheduledWorkers++;
            this.scheduledWork += creep.getActiveBodyparts(WORK);

            if (this.possibleWorkers > 0)
            {
                this.possibleWorkers--;
            }
        }

        this.updateLaborRequirements();

        if (!this.hasWork())
        {
            return NO_MORE_WORK;
        }

        return code;
    }

    updateLaborRequirements(): void
    {
        let room = null;
        if (!this.controller.isShrouded)
        {
            room = this.controller.instance.room;
        }

        let maxUpgraders = 50;
        if (this.idealCreepBody.name === CREEP_TYPE.UPGRADER.name && this.upgraderSlots.length > 0)
        {
            maxUpgraders = this.upgraderSlots.length;
        }

        if (room != null && room.level >= 8)
        {
            this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ work: 15 }, 1, maxUpgraders);
        }
        else
        {
            if (room != null &&
                room.economy != null &&
                room.economy.resources != null &&
                room.economy.resources[RESOURCE_ENERGY] > this.scheduledWork * 300)
            {
                // if (this.scheduledWorkers >= maxUpgraders)
                // {
                //     let maxExtraCitizens = 1;
                //
                //     if (this.labor.types[CREEP_TYPE.CITIZEN.name] != null)
                //     {
                //         maxExtraCitizens = this.labor.types[CREEP_TYPE.CITIZEN.name].max;
                //     }
                //
                //     this.labor.types[CREEP_TYPE.CITIZEN.name] = new LaborDemandType({  }, 1, maxExtraCitizens);
                // }
                // else
                // {
                    this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ work: (this.scheduledWork + 1) }, 1, maxUpgraders);
                //}
            }
            else
            {
                maxUpgraders = this.scheduledWorkers;
                this.labor.types[this.idealCreepBody.name] = new LaborDemandType({ work: this.scheduledWork }, 1, maxUpgraders);
            }
        }
    }

    endScheduling(): void
    {
        this.updateLaborRequirements();
    }
}