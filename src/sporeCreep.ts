import { Remember } from './Remember';
import { SporePathFinder, FORWARD } from './sporePathFinder';
import { SporePathOptions } from './SporePathOptions';
import { SporeCreepMovement } from './SporeCreepMovement';
import { ERR_NO_WORK, ERR_CANNOT_PERFORM_TASK } from './task';
import { BodyDefinition } from './BodyDefinition';
import { SpawnRequest } from './SpawnRequest';
import { BodyPartRequirements } from './BodyPartRequirements';
import { SporePath } from './sporePathFinder';
import { CollectOptions } from './CollectOptions';
import { ClaimReceipt } from './ClaimReceipt';

export var ACTION_TRANSFER: string = 'transfer';
export var ACTION_RECYCLE: string = 'recycle';
export var ACTION_COLLECT: string = 'collect';
export var ACTION_UPGRADE: string = 'upgrade';
export var ACTION_RESERVE: string = 'reserve';
export var ACTION_CLAIM: string = 'claim';
export var ACTION_BUILD: string = 'build';
export var ACTION_DISMANTLE: string = 'dismantle';
export var ACTION_REPAIR: string = 'repair';
export var ACTION_MOVE: string = 'move';

export var CREEP_TYPE: {
  [part: string]: BodyDefinition;
  MINER: BodyDefinition;
  REMOTE_MINER: BodyDefinition;
  UPGRADER: BodyDefinition;
  COURIER: BodyDefinition;
  REMOTE_COURIER: BodyDefinition;
  CITIZEN: BodyDefinition;
  MASON: BodyDefinition;
  WIRE: BodyDefinition;
  RESERVER: BodyDefinition;
  CLAIMER: BodyDefinition;
  REMOTE_DEFENDER: BodyDefinition;
} = <any>{};

var bodyDefinition = new BodyDefinition('MINER');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 5, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 1, 1, 1));
CREEP_TYPE.MINER = bodyDefinition;

var bodyDefinition = new BodyDefinition('REMOTE_MINER');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 6, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 3, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 1, 1, 1));
CREEP_TYPE.REMOTE_MINER = bodyDefinition;

var bodyDefinition = new BodyDefinition('UPGRADER');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 15, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 1, 1, 1));
CREEP_TYPE.UPGRADER = bodyDefinition;

var bodyDefinition = new BodyDefinition('COURIER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 12, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 12, 1, 1));
CREEP_TYPE.COURIER = bodyDefinition;

var bodyDefinition = new BodyDefinition('REMOTE_COURIER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 9, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 16, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 1, 1, 1));
CREEP_TYPE.REMOTE_COURIER = bodyDefinition;

var bodyDefinition = new BodyDefinition('CITIZEN');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 5, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 10, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 5, 1, 1));
CREEP_TYPE.CITIZEN = bodyDefinition;

var bodyDefinition = new BodyDefinition('MASON');
bodyDefinition.requirements.push(new BodyPartRequirements(WORK, 3, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 4, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 5, 1, 1));
CREEP_TYPE.MASON = bodyDefinition;

var bodyDefinition = new BodyDefinition('WIRE');
bodyDefinition.requirements.push(new BodyPartRequirements(CARRY, 6, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
CREEP_TYPE.WIRE = bodyDefinition;

var bodyDefinition = new BodyDefinition('RESERVER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 2, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CLAIM, 2, 1, 1));
CREEP_TYPE.RESERVER = bodyDefinition;

var bodyDefinition = new BodyDefinition('CLAIMER');
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(CLAIM, 1, 1, 1));
CREEP_TYPE.CLAIMER = bodyDefinition;

var bodyDefinition = new BodyDefinition('REMOTE_DEFENDER');
bodyDefinition.requirements.push(new BodyPartRequirements(TOUGH, 2, 1, 2));
bodyDefinition.requirements.push(new BodyPartRequirements(ATTACK, 3, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(RANGED_ATTACK, 1, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(MOVE, 7, 1, 1));
bodyDefinition.requirements.push(new BodyPartRequirements(HEAL, 1, 1, 1));
CREEP_TYPE.REMOTE_DEFENDER = bodyDefinition;

export class SporeCreep extends Creep {
  colony: SporeColony;

  get carryCount(): number {
    return _.sum(this.carry);
  }

  get carryCapacityRemaining(): number {
    return this.carryCapacity - this.carryCount;
  }

  private _claimReceipt: ClaimReceipt;
  get claimReceipt(): ClaimReceipt {
    if (this._claimReceipt != null) {
      return this._claimReceipt;
    }

    let memory = <CreepMemory>this.memory;

    if (memory.claimReceiptTargetId != null) {
      let target = Game.getObjectById<Claimable>(memory.claimReceiptTargetId);

      if (target !== null) {
        this._claimReceipt = new ClaimReceipt(
          target,
          memory.claimReceiptTargetType,
          memory.claimReceiptResourceType,
          memory.claimReceiptAmount
        );
      }

      if (this._claimReceipt == null) {
        delete memory.claimReceiptTargetId;
        delete memory.claimReceiptTargetType;
        delete memory.claimReceiptResourceType;
        delete memory.claimReceiptAmount;
      }
    }

    return this._claimReceipt;
  }

  set claimReceipt(value: ClaimReceipt) {
    this._claimReceipt = value;
    let memory = <CreepMemory>this.memory;

    if (value == null) {
      delete memory.claimReceiptTargetId;
      delete memory.claimReceiptTargetType;
      delete memory.claimReceiptResourceType;
      delete memory.claimReceiptAmount;
    } else {
      memory.claimReceiptTargetId = (<any>value.target).id;
      memory.claimReceiptTargetType = value.type;
      memory.claimReceiptResourceType = value.resourceType;
      memory.claimReceiptAmount = value.amount;
    }
  }

  get cost(): number {
    if (this.memory.cost == null) {
      this.memory.cost = 0;

      for (let part of this.body) {
        this.memory.cost += BODYPART_COST[part.type];
      }
    }

    return this.memory.cost;
  }

  set cost(value: number) {
    this.memory.cost = value;
  }

  getEfficiencyAs(bodyDefinition: BodyDefinition): number {
    let memory = <CreepMemory>this.memory;

    if (memory.bodyEfficiency == null) {
      memory.bodyEfficiency = {};
    }

    let existingValue = memory.bodyEfficiency[bodyDefinition.name];
    if (existingValue != null) {
      return existingValue;
    }

    let totalRequiredParts = 0;
    let totalMaxRequiredParts = 0;
    let bodyPartsByType = _.groupBy(this.body, function(part: BodyPartDefinition) {
      return part.type;
    });

    for (let requirement of bodyDefinition.requirements) {
      let bodyParts = bodyPartsByType[requirement.type];

      if (bodyParts == null || bodyParts.length < requirement.min) {
        memory.bodyEfficiency[bodyDefinition.name] = 0;
        return 0;
      }

      let totalActiveParts = 0;
      for (let part of bodyParts) {
        if (part.hits > 0) {
          totalActiveParts++;

          if (totalActiveParts >= requirement.min) {
            break;
          }
        }
      }

      if (totalActiveParts < requirement.min) {
        memory.bodyEfficiency[bodyDefinition.name] = 0;
        return 0;
      }

      totalMaxRequiredParts += requirement.max;
      totalRequiredParts += Math.min(bodyParts.length, requirement.max);
    }

    let newValue = totalRequiredParts / totalMaxRequiredParts;
    memory.bodyEfficiency[bodyDefinition.name] = newValue;
    return newValue;
  }

  get type(): string {
    return (<CreepMemory>this.memory).type;
  }

  get speed(): number {
    return (<CreepMemory>this.memory).speed;
  }

  private _spawnRequest: SpawnRequest;
  get spawnRequest(): SpawnRequest {
    if (this._spawnRequest != null) {
      if (this._spawnRequest.id != null) {
        return this._spawnRequest;
      }

      return null;
    }

    let memory = <CreepMemory>this.memory;

    this._spawnRequest = new SpawnRequest(null, null, null, null);
    this._spawnRequest.creepBody = SporeCreep[this.type];

    if (memory.spawnRequest != null) {
      this._spawnRequest.id = memory.spawnRequest.id;

      if (memory.spawnRequest.taskId != null) {
        this._spawnRequest.task = this.colony.tasksById[memory.spawnRequest.taskId];
      }

      if (memory.spawnRequest.replacingCreepName != null) {
        this._spawnRequest.replacingCreep = Game.creeps[memory.spawnRequest.replacingCreepName];
      }
    }

    if (this._spawnRequest.id != null) {
      return this._spawnRequest;
    }

    return null;
  }

  set spawnRequest(value: SpawnRequest) {
    this._spawnRequest = value;

    let memory = <CreepMemory>this.memory;

    if (value == null) {
      delete memory.spawnRequest;
    } else {
      memory.spawnRequest.id = this._spawnRequest.id;

      if (this._spawnRequest.task != null) {
        memory.spawnRequest.taskId = this._spawnRequest.task.id;
      }

      if (this._spawnRequest.replacingCreep != null) {
        memory.spawnRequest.replacingCreepName = this._spawnRequest.replacingCreep.name;
      }
    }
  }

  private _task: Task;
  get task(): Task {
    if (this._task != null) {
      return this._task;
    }

    let memory = <CreepMemory>this.memory;

    if (memory.taskId != null) {
      this._task = this.colony.tasksById[memory.taskId];

      if (this._task == null) {
        delete memory.taskId;
        this.taskPriority = -1;
        this.taskMetadata = null;
      }
    }

    return this._task;
  }

  set task(value: Task) {
    this._task = value;

    let memory = <CreepMemory>this.memory;

    if (value == null) {
      delete memory.taskId;
      this.claimReceipt = null;
    } else {
      memory.taskId = value.id;

      let taskCreeps = Remember.forTick(`${value.id}.creeps`, () => {
        return [];
      });

      if (!_.includes(taskCreeps, this.id)) {
        taskCreeps.push(this.id);
      }
    }
  }

  private _taskPriority: number;
  get taskPriority(): number {
    if (this._taskPriority != null) {
      return this._taskPriority;
    }

    let memory = <CreepMemory>this.memory;

    if (memory.taskPriority != null) {
      this._taskPriority = memory.taskPriority;
    } else {
      this._taskPriority = -1;
    }

    return this._taskPriority;
  }

  set taskPriority(value: number) {
    this._taskPriority = value;

    let memory = <CreepMemory>this.memory;

    if (value == null || value < 0) {
      delete memory.taskPriority;
      this._taskPriority = -1;
    } else {
      memory.taskPriority = value;
    }
  }

  private _taskMetadata: any;
  get taskMetadata(): any {
    if (this._taskMetadata !== undefined) {
      return this._taskMetadata;
    }

    let memory = <CreepMemory>this.memory;

    if (memory.taskMetadata != null) {
      this._taskMetadata = memory.taskMetadata;
    } else {
      this._taskMetadata = null;
    }

    return this._taskMetadata;
  }

  set taskMetadata(value: any) {
    this._taskMetadata = value;

    let memory = <CreepMemory>this.memory;

    if (value == null) {
      delete memory.taskMetadata;
      this._taskMetadata = null;
    } else {
      memory.taskMetadata = value;
    }
  }

  private _action: string;
  get action(): string {
    if (this._action != null) {
      return this._action;
    }

    let memory = <CreepMemory>this.memory;
    this._action = memory.action;

    return this._action;
  }

  set action(value: string) {
    this._action = value;
    let memory = <CreepMemory>this.memory;

    if (value == null) {
      delete memory.action;
    } else {
      memory.action = value;
    }
  }

  private _actionTarget: string;
  get actionTarget(): string {
    if (this._actionTarget != null) {
      return this._actionTarget;
    }

    let memory = <CreepMemory>this.memory;

    if ((<any>memory).actionTargetId != null) {
      delete (<any>memory).actionTargetId;
    }

    this._actionTarget = memory.actionTarget;

    if (this._actionTarget == null) {
      this._actionTarget = '';
      delete memory.actionTarget;
    }

    return this._actionTarget;
  }

  set actionTarget(value: string) {
    this._actionTarget = value;
    let memory = <CreepMemory>this.memory;

    if (value == null || value.length === 0) {
      delete memory.actionTarget;
    } else {
      memory.actionTarget = value;
    }
  }

  _movement: SporeCreepMovement;
  get movement(): SporeCreepMovement {
    return Remember.byName(`creep.${this.id}`, `movement`, () => {
      let memory = <CreepMemory>this.memory;

      if (memory.movement == null) {
        memory.movement = <any>{};
      }

      this._movement = new SporeCreepMovement(memory.movement);
      return this._movement;
    });
  }

  goMoveTo(target: RoomObject | RoomPosition | Ptr<RoomObject>, navigation?: NavigationRules): number {
    if (target == null) {
      return ERR_NO_WORK;
    }

    const movement = this.movement;

    // if this creep can't move right now then just early out
    if (this.fatigue > 0) {
      const points = movement.improv.getNextPositions(this.pos, movement.pathIndex + 1);
      this.room.visual.poly(points, { lineStyle: 'dashed' });
      if (movement.improv.end.roomName == this.room.name) {
        this.room.visual.text('\u{2691}', movement.improv.end);
      }

      this.action = ACTION_MOVE;
      this.actionTarget = target.toString();
      return OK;
    }

    let destination: RoomPosition = <RoomPosition>target;

    if ((<RoomObject>target).pos != null) {
      destination = (<RoomObject>target).pos;
    }

    // if an invalid destination was provided then error out
    if (destination == null) {
      return ERR_NO_WORK;
    }

    if (navigation == null) {
      navigation = {};
    }

    // default to a range of 1 if it wasn't specified
    if (navigation.range == null) {
      navigation.range = 1;
    }

    // default to a direction of FORWARD if it wasn't specified
    if (navigation.direction == null) {
      navigation.direction = FORWARD;
    }

    // check to see if the creep is already in range of the target
    if (this.pos.inRangeTo(destination, navigation.range)) {
      this.action = ACTION_MOVE;
      this.actionTarget = target.toString();
      return OK;
    }

    if (navigation.path != null) {
      // setting a different path will also invalidate any current improv path
      // but no changes will occur if the path is identical
      movement.path = navigation.path as SporePath;
    } else {
      // clear out any previous explicit path
      movement.path = null;
    }

    let currentPath = movement.improv;
    if (currentPath == null) {
      currentPath = movement.path;
    }

    // if the current paths don't lead to the destination...
    if (currentPath != null && !currentPath.leadsTo(destination, navigation.direction, navigation.range)) {
      // then clear them so we can get new ones
      movement.path = null;
      movement.improv = null;

      // if an explicit path had been provided...
      if (navigation.path != null) {
        // then they've provided the wrong path
        console.log(
          "ERROR: Attempted to move to '" + target + "' but provided an explicit path to a different location. "
        );
        return ERR_CANNOT_PERFORM_TASK;
      }
    }

    // if the creep is not on a valid path to the destination...
    if (movement.pathIndex === -1) {
      // if we've already spent all our path finding CPU...
      if (this.colony.cpuSpentPathing > this.colony.pathingCpuLimit) {
        // then early out
        this.action = ACTION_MOVE;
        this.actionTarget = target.toString();
        return OK;
      }

      // create a new path to the destination
      if (movement.path != null) {
        // since the creep is not on the explicit path we need to create an improv path to get it there
        let position: RoomPosition = movement.path.findLastPositionInRoom(this.pos.roomName, navigation.direction);
        let explicitPathPositions = movement.path.getPositions(this.pos.roomName);

        let options = new SporePathOptions([]);
        let creepCost = 4;

        if (this.speed >= 5) {
          // this creep moves full speed on swamp
          options.plainCost = 2;
          options.swampCost = 2;
          options.costs.push({
            id: 'path',
            cost: 1,
            targets: explicitPathPositions
          });
        } else if (this.speed >= 1) {
          // this creep moves full speed off-road
          options.plainCost = 2;
          options.swampCost = 10;
          creepCost = 20;
          options.costs.push({
            id: 'path',
            cost: 1,
            targets: explicitPathPositions
          });
        } else {
          // this creep moves slowly off-road
          options.plainCost = 4;
          options.swampCost = 20;
          creepCost = 40;

          options.costs.push({
            id: 'path',
            cost: 1,
            targets: explicitPathPositions
          });
          options.costs.push({ id: 'roads', cost: 2 });
        }

        options.costs.push({ id: 'nonwalkableStructures', cost: 255 });
        options.costs.push({ id: 'wires', cost: 255 });
        options.costs.push({ id: 'allySites', cost: 255 });
        movement.improv = this.colony.pathFinder.findPathTo(
          this.pos,
          { pos: position, range: 0 },
          options
        ) as SporePath;

        if (movement.improv != null) {
          // crop the improv path to where it first merges with the ideal path
          let intersection = movement.path.findIntersectionWith(movement.improv);
          if (intersection != null) {
            movement.improv.setIndexAsDestination(intersection.otherIndex);
            movement.mergeIndex = intersection.baseIndex;
            movement.pathIndex = 0;
          }
        }
      } else {
        let options = new SporePathOptions([]);
        let creepCost = 4;

        if (this.speed >= 5) {
          // this creep moves full speed on swamp
          options.plainCost = 1;
          options.swampCost = 1;
          creepCost = 2;
        } else if (this.speed >= 1) {
          // this creep moves full speed off-road
          //options.plainCost = 1;
          //options.swampCost = 5;
          creepCost = 10;
        } else {
          // this creep moves slowly off-road
          options.plainCost = 2;
          options.swampCost = 10;
          creepCost = 20;
          options.costs.push({ id: 'roads', cost: 1 });
        }

        options.costs.push({ id: 'nonwalkableStructures', cost: 255 });
        options.costs.push({ id: 'wires', cost: 255 });
        options.costs.push({ id: 'allySites', cost: 255 });
        movement.improv = this.colony.pathFinder.findPathTo(
          this.pos,
          { pos: destination, range: navigation.range },
          options
        ) as SporePath;
        movement.pathIndex = 0;
      }

      this.room.visual.text('\u{1F463}', this.pos);
    } else if (movement.improv != null && movement.improv.needsUpdated) {
      // if we've already spent all our path finding CPU...
      if (this.colony.cpuSpentPathing > this.colony.pathingCpuLimit) {
        // then early out
        this.action = ACTION_MOVE;
        this.actionTarget = target.toString();
        return OK;
      }
      
      let options = new SporePathOptions([]);
      let creepCost = 4;

      if (this.speed >= 5) {
        // this creep moves full speed on swamp
        options.plainCost = 1;
        options.swampCost = 1;
        creepCost = 2;
      } else if (this.speed >= 1) {
        // this creep moves full speed off-road
        //options.plainCost = 1;
        //options.swampCost = 5;
        creepCost = 10;
      } else {
        // this creep moves slowly off-road
        options.plainCost = 2;
        options.swampCost = 10;
        creepCost = 20;
        options.costs.push({ id: 'roads', cost: 1 });
      }

      options.costs.push({ id: 'creeps', cost: creepCost });
      options.costs.push({ id: 'nonwalkableStructures', cost: 255 });
      options.costs.push({ id: 'wires', cost: 255 });
      options.costs.push({ id: 'allySites', cost: 255 });
      movement.improv = this.colony.pathFinder.findPathTo(
        this.pos,
        { pos: destination, range: navigation.range },
        options
      ) as SporePath;
      movement.pathIndex = 0;
      movement.improv.needsUpdated = false;
      this.room.visual.text('\u{1F463}', this.pos);
    }

    currentPath = movement.improv;
    if (currentPath == null) {
      currentPath = movement.path;
    }

    // if we still don't have a valid path at this point then the destination must be unreachable
    if (currentPath == null) {
      //@todo check for incomplete paths?
      return ERR_NO_WORK;
    }

    // check whether the last requested move was successful
    if (movement.expectedPosition != null) {
      if (movement.expectedPosition.isEqualTo(this.pos)) {
        movement.expectedPosition = null;
        movement.pathIndex++;
        movement.failedMoveAttempts = 0;
      } else {
        movement.expectedPosition = null;
        movement.failedMoveAttempts++;
      }
    }

    let visualXOffset = 0.01;
    let visualYOffset = 0.18;
    let style: TextStyle = { font: 0.45 };

    if (movement.failedMoveAttempts > 0) {
      if (movement.failedMoveAttempts === 1) {
        // let structures = this.room.lookForAt(LOOK_STRUCTURES, movement.expectedPosition);
        // for (let structure of structures) {
        //   if (_.includes(OBSTACLE_OBJECT_TYPES, structure.structureType)) {
        //     if (movement.path != null) {
        //       movement.path.needsUpdated = true;
        //     }

        //     console.log('/////////////// UNEXPECTED STRUCTURE IN PATH: ' + movement.improv);
        //     movement.improv = null;
        //     this.room.visual.text('\u{1F632}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
        //     console.log('/////////////// UNEXPECTED STRUCTURE IN PATH: ' + structure);

        //     this.action = ACTION_MOVE;
        //     this.actionTarget = target.toString();

        //     return OK;
        //   }
        // }

        this.room.visual.text('\u{1F612}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
      } else if (movement.failedMoveAttempts === 2) {
        this.room.visual.text('\u{1F612}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
      } else if (movement.failedMoveAttempts === 3) {
        this.room.visual.text('\u{1F623}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
      } else if (movement.failedMoveAttempts === 4) {
        this.room.visual.text('\u{1F620}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
      } else if (movement.failedMoveAttempts >= 5) {
        if (movement.path != null) {
          movement.path.needsUpdated = true;
        }

        if (movement.improv != null) {
          movement.improv.needsUpdated = true;
        }

        this.room.visual.text('\u{1F621}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);

        this.action = ACTION_MOVE;
        this.actionTarget = target.toString();

        return OK;
      }
    }

    let nextDirection = currentPath.getNextMove(movement.pathIndex);

    if (nextDirection <= 0) {
      if (movement.improv != null && movement.mergeIndex >= 0) {
        movement.improv = null;
        movement.pathIndex = movement.mergeIndex;
        movement.mergeIndex = -1;
      } else {
        if (movement.path != null) {
          movement.path.needsUpdated = true;
        }

        movement.improv = null;
        console.log("ERROR: Attempted to move to '" + target + "' but encountered an unexpected end to that path. ");
        return ERR_CANNOT_PERFORM_TASK;
      }
    }

    const points = movement.improv.getNextPositions(this.pos, movement.pathIndex);
    this.room.visual.poly(points, { lineStyle: 'dashed' });
    if (movement.improv.end.roomName == this.room.name) {
      this.room.visual.text('\u{2691}', movement.improv.end);
    }

    let code = this.move(nextDirection);

    if (this.doTrack) {
      console.log(this + ' goMoveTo ' + code);
    }

    if (code == OK) {
      movement.expectedPosition = SporePathFinder.getNextPositionByDirection(this.pos, nextDirection);

      this.action = ACTION_MOVE;
      this.actionTarget = target.toString();
      return OK;
    }

    movement.expectedPosition = null;

    // ERR_NOT_OWNER	-1	You are not the owner of this creep.
    // ERR_BUSY	-4	The creep is still being spawned.
    // ERR_NO_BODYPART	-12	There are no MOVE body parts in this creep’s body.
    console.log("ERROR: Attempted to move to '" + target + "' but encountered unknown error. " + code);

    return ERR_CANNOT_PERFORM_TASK;
  }

  goHarvest(source: Ptr<Source>, navigation?: NavigationRules): number {
    if (!source.isValid) {
      return ERR_INVALID_TARGET;
    }

    let code = ERR_NO_WORK;

    if (source.isShrouded) {
      code = this.goMoveTo(source, navigation);
    } else {
      let claimReceipt = source.instance.makeClaim(
        this,
        RESOURCE_ENERGY,
        this.carryCapacityRemaining,
        this.carryCapacityRemaining,
        true
      );

      if (claimReceipt == null) {
        return ERR_NO_WORK;
      }

      this.claimReceipt = claimReceipt;

      code = claimReceipt.target.collect(this, claimReceipt);

      if (code === OK) {
        this.action = ACTION_COLLECT;
        this.actionTarget = claimReceipt != null ? claimReceipt.target.toString() : null;
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        code = this.goMoveTo(claimReceipt.target, navigation);
      }
    }

    if (code === OK) {
      return OK;
    }

    if (code === ERR_NOT_ENOUGH_RESOURCES || code === ERR_INVALID_TARGET) {
      return ERR_NO_WORK;
    }

    console.log("ERROR: Attempted to harvest '" + source + "' but encountered unknown error. " + code);

    return ERR_CANNOT_PERFORM_TASK;
  }

  goTransfer(
    resourceType: ResourceConstant,
    target: Ptr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>,
    navigation?: NavigationRules
  ): number {
    if (!target.isValid) {
      return ERR_NO_WORK;
    }

    let code = ERR_NO_WORK;

    if (target.isShrouded) {
      code = this.goMoveTo(target, navigation);
    } else {
      code = this.transfer(<any>target.instance, resourceType);

      if (code == OK) {
        this.action = ACTION_TRANSFER;
        this.actionTarget = target.toString();
        return OK;
      } else if (code == ERR_NOT_IN_RANGE) {
        return this.goMoveTo(target, navigation);
      }
    }

    if (this.doTrack) {
      console.log(this + ' goTransfer ' + code);
    }

    if (code == OK) {
      return OK;
    }

    if (code == ERR_FULL) {
      return ERR_NO_WORK;
    }

    if (code == ERR_NOT_OWNER) {
      console.log("ERROR: Attempted to transfer '" + resourceType + "' from another player's creep");
      return ERR_NO_WORK;
    }

    if (code == ERR_INVALID_TARGET) {
      console.log("ERROR: Attempted to transfer '" + resourceType + "' to an invalid target " + target);
      return ERR_NO_WORK;
    }

    if (code == ERR_BUSY) {
      console.log("ERROR: Attempted to transfer '" + resourceType + "' to a creep that hasn't spawned yet");
      return ERR_NO_WORK;
    }

    if (code == ERR_INVALID_ARGS) {
      console.log("ERROR: Attempted to transfer an invalid amount of '" + resourceType + "' to a target");
      return ERR_NO_WORK;
    }

    //ERR_NOT_ENOUGH_RESOURCES	-6	The creep does not have the given amount of resources.
    console.log(
      "ERROR: Attempted to transfer '" + resourceType + "' to '" + target + "' but encountered unknown error. " + code
    );

    return ERR_CANNOT_PERFORM_TASK;
  }

  goBuild(site: Ptr<ConstructionSite>, navigation?: NavigationRules): number {
    if (!site.isValid) {
      return ERR_NO_WORK;
    }

    if (this.getActiveBodyparts(WORK) === 0) {
      return ERR_CANNOT_PERFORM_TASK;
    }

    let code = ERR_NO_WORK;

    if (site.isShrouded) {
      code = this.goMoveTo(site, navigation);
    } else {
      code = this.build(site.instance);

      if (code === OK) {
        this.action = ACTION_BUILD;
        this.actionTarget = site.toString();
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        code = this.goMoveTo(site, navigation);
      }
    }

    if (code === OK) {
      return OK;
    }

    if (code == ERR_NOT_ENOUGH_RESOURCES || code == ERR_INVALID_TARGET || code == ERR_RCL_NOT_ENOUGH) {
      return ERR_NO_WORK;
    }

    // ERR_NOT_OWNER
    // ERR_BUSY
    // ERR_NO_BODYPART
    return ERR_CANNOT_PERFORM_TASK;
  }

  goDismantle(structure: Ptr<Structure>, navigation?: NavigationRules): number {
    if (!structure.isValid) {
      return ERR_NO_WORK;
    }

    let canWork = this.getActiveBodyparts(WORK) > 0;
    let canAttack = this.getActiveBodyparts(ATTACK) > 0;
    let canRangeAttack = this.getActiveBodyparts(RANGED_ATTACK) > 0;

    if (!canAttack && !canWork && !canRangeAttack) {
      return ERR_CANNOT_PERFORM_TASK;
    }

    let code = ERR_NO_WORK;

    if (structure.isShrouded) {
      code = this.goMoveTo(structure, navigation);
    } else {
      structure.instance.notifyWhenAttacked(false);

      if (canWork) {
        code = this.dismantle(structure.instance);
      } else if (canAttack) {
        code = this.attack(structure.instance);
      } else if (canRangeAttack) {
        code = this.rangedAttack(structure.instance);
      } else {
        return ERR_CANNOT_PERFORM_TASK;
      }

      if (code === OK) {
        this.action = ACTION_DISMANTLE;
        this.actionTarget = structure.toString();
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        code = this.goMoveTo(structure, navigation);

        if (canRangeAttack) {
          this.rangedAttack(structure.instance);
        }
      }
    }

    if (code === OK) {
      return OK;
    }

    if (code == ERR_INVALID_TARGET) {
      return ERR_NO_WORK;
    }

    // ERR_NOT_OWNER
    // ERR_BUSY
    // ERR_NO_BODYPART
    return ERR_CANNOT_PERFORM_TASK;
  }

  goRepair(structure: Ptr<Structure>, navigation?: NavigationRules): number {
    if (!structure.isValid) {
      return ERR_NO_WORK;
    }

    let code = ERR_NO_WORK;

    if (structure.isShrouded) {
      code = this.goMoveTo(structure, navigation);
    } else {
      code = this.repair(structure.instance);

      if (code === OK) {
        this.action = ACTION_REPAIR;
        this.actionTarget = structure.toString();
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        return this.goMoveTo(structure, navigation);
      }
    }

    if (code === OK) {
      return OK;
    }

    if (code === ERR_INVALID_TARGET) {
      return ERR_NO_WORK;
    }

    console.log('Creep ' + this.name + ' goRepair error code: ' + code);

    return ERR_CANNOT_PERFORM_TASK;
  }

  goCollect(
    resourceType: ResourceConstant,
    amount: number,
    minAmount: number,
    isExtended: boolean,
    near: RoomPosition | RoomObject,
    options: CollectOptions,
    excludes: Record<string, Claimable>,
    navigation?: NavigationRules
  ): number {
    if (this.action != ACTION_COLLECT && this.action != ACTION_MOVE) {
      this.claimReceipt = null;
    }

    let claimReceipt = this.colony.claimResource(
      this,
      resourceType,
      amount,
      minAmount,
      isExtended,
      near,
      options,
      excludes,
      this.claimReceipt
    );

    if (claimReceipt == null) {
      return ERR_NO_WORK;
    }

    this.claimReceipt = claimReceipt;

    let code = claimReceipt.target.collect(this, claimReceipt);

    if (code === OK) {
      this.action = ACTION_COLLECT;
      this.actionTarget = claimReceipt.target.toString();
      return OK;
    }

    if (code === ERR_NOT_IN_RANGE) {
      code = this.goMoveTo(claimReceipt.target, navigation);
    }

    if (code === OK) {
      return OK;
    }

    this.claimReceipt = null;

    if (code === ERR_NOT_ENOUGH_RESOURCES) {
      console.log(
        'FAILED TO CONFIRM AVAILABLE RESOURCES BEFORE COLLECTING. ' +
          this +
          ' ' +
          claimReceipt.target +
          ' ' +
          claimReceipt.amount +
          ' ' +
          claimReceipt.resourceType
      );
      return ERR_NO_WORK;
    }

    return ERR_CANNOT_PERFORM_TASK;
  }

  goUpgrade(controller: Ptr<StructureController>, navigation?: NavigationRules): number {
    if (!controller.isValid) {
      return ERR_NO_WORK;
    }

    let code = ERR_NO_WORK;

    if (controller.isShrouded) {
      code = this.goMoveTo(controller, navigation);
    } else {
      code = this.upgradeController(controller.instance);

      if (code === OK) {
        this.action = ACTION_UPGRADE;
        this.actionTarget = controller.toString();
        this.claimReceipt = null;
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        return this.goMoveTo(controller, navigation);
      }
    }

    if (code === OK) {
      return OK;
    }

    console.log('goUpgrade error code: ' + code + ' ' + this);

    return ERR_CANNOT_PERFORM_TASK;
  }

  goReserve(controller: Ptr<StructureController>, navigation?: NavigationRules): number {
    if (!controller.isValid) {
      return ERR_NO_WORK;
    }

    let code = ERR_NO_WORK;

    if (controller.isShrouded) {
      code = this.goMoveTo(controller, navigation);
    } else {
      code = this.reserveController(controller.instance);

      if (code === OK) {
        this.action = ACTION_RESERVE;
        this.actionTarget = controller.toString();
        this.claimReceipt = null;
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        return this.goMoveTo(controller, navigation);
      }
    }

    if (code === OK) {
      return OK;
    }

    console.log('goReserve error code: ' + code + ' ' + this);

    return ERR_CANNOT_PERFORM_TASK;
  }

  goClaim(controller: Ptr<StructureController>, navigation?: NavigationRules): number {
    if (!controller.isValid) {
      return ERR_NO_WORK;
    }

    let code = ERR_NO_WORK;

    if (controller.isShrouded) {
      code = this.goMoveTo(controller, navigation);
    } else {
      code = this.claimController(controller.instance);

      if (code === OK) {
        this.action = ACTION_CLAIM;
        this.actionTarget = controller.toString();
        this.claimReceipt = null;
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        return this.goMoveTo(controller, navigation);
      }
    }

    if (code === OK) {
      return OK;
    }

    console.log('goClaim error code: ' + code + ' ' + this);

    return ERR_CANNOT_PERFORM_TASK;
  }

  goRecycle(spawn: Ptr<StructureSpawn>, navigation?: NavigationRules): number {
    if (!spawn.isValid) {
      return ERR_NO_WORK;
    }

    let code = ERR_NO_WORK;

    if (spawn.isShrouded) {
      code = this.goMoveTo(spawn, navigation);
    } else {
      code = spawn.instance.recycleCreep(<any>this);

      if (code === OK) {
        this.action = ACTION_RECYCLE;
        this.actionTarget = spawn.toString();
        this.claimReceipt = null;
        return OK;
      } else if (code === ERR_NOT_IN_RANGE) {
        return this.goMoveTo(spawn, navigation);
      }
    }

    if (code === OK) {
      return OK;
    }

    console.log('goRecycle error code: ' + code);

    return ERR_CANNOT_PERFORM_TASK;
  }
}
