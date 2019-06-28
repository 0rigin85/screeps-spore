import { Task } from './tasks/task';
import { TaskPriority } from './tasks/TaskPriority';
import { Ptr } from './Ptr';
import { CREEP_TYPE } from './sporeCreep';
import { CollectOptions } from './CollectOptions';
import { Remember } from './Remember';
import { Economy } from './Economy';
import { Budget } from './Budget';
import { HarvestEnergy } from './tasks/taskHarvestEnergy';
import { TransferResource } from './tasks/taskTransferResource';
import { DefendRoom } from './tasks/taskDefendRoom';
import { UpgradeRoomController } from './tasks/taskUpgradeRoomController';
import { BuildBarrier } from './tasks/taskBuildBarrier';
import { RepairStructure } from './tasks/taskRepairStructure';
import { SporeRoomPosition } from './sporeRoomPosition';

// List of usernames, name must be lower case.
const FRIENDLY_WHITELIST = [
  'pcake0rigin',
  'barney', // Mr McBarnabas
  'pcakecysote', // Jacob
  'swifty', // Leigh
  'yeurch', // Richard
  '0xdeadfeed' // Wes
];

// List of usernames, name must be lower case.
const ALLY_WHITELIST = [
  'barney', // Mr McBarnabas
  'pcakecysote', // Jacob
  'swifty', // Leigh
  'yeurch', // Richard
  '0xdeadfeed' // Wes
];

let STRUCTURE_REPAIR_VALUES = {};
STRUCTURE_REPAIR_VALUES[STRUCTURE_CONTAINER] = {
  ideal: CONTAINER_HITS,
  regular: { threshold: 200000, priority: TaskPriority.High },
  dire: { threshold: 100000, priority: TaskPriority.Mandatory }
};
STRUCTURE_REPAIR_VALUES[STRUCTURE_TOWER] = {
  ideal: TOWER_HITS,
  regular: { threshold: 2000, priority: TaskPriority.High },
  dire: { threshold: 1000, priority: TaskPriority.Mandatory }
};
STRUCTURE_REPAIR_VALUES[STRUCTURE_ROAD] = {
  ideal: ROAD_HITS,
  regular: { threshold: 2500, priority: TaskPriority.High },
  dire: { threshold: 500, priority: TaskPriority.Medium }
};
STRUCTURE_REPAIR_VALUES[STRUCTURE_RAMPART] = {
  ideal: 20000,
  regular: { threshold: 15000, priority: TaskPriority.High },
  dire: { threshold: 10000, priority: TaskPriority.Medium }
};
STRUCTURE_REPAIR_VALUES[STRUCTURE_WALL] = {
  ideal: 20000,
  regular: { threshold: 20000, priority: TaskPriority.Medium },
  dire: { threshold: 10000, priority: TaskPriority.MediumLow }
};
STRUCTURE_REPAIR_VALUES[STRUCTURE_LINK] = {
  ideal: LINK_HITS_MAX,
  regular: { threshold: LINK_HITS_MAX * 0.8, priority: TaskPriority.High },
  dire: { threshold: LINK_HITS_MAX * 0.3, priority: TaskPriority.Mandatory }
};

export class SporeRoom extends Room {
  economy: Economy;

  get budget(): Budget {
    if (Memory.rooms == null) {
      Memory.rooms = {};
    }

    let memory = Memory.rooms[this.name];
    if (memory == null) {
      memory = <RoomMemory>{};
      Memory.rooms[this.name] = memory;
    }

    if (memory.budget == null) {
      memory.budget = new Budget();
    }

    return memory.budget;
  }

  get my(): boolean {
    return (
      this.controller != null &&
      (this.controller.my ||
        (this.controller.reservation != null && this.controller.reservation.username == 'PCake0rigin'))
    );
  }

  get isReserved(): boolean {
    let isReserved = false;

    if (this.controller != null && this.controller.reservation != null) {
      isReserved = this.controller.reservation.username == 'PCake0rigin';
    }

    return isReserved;
  }

  static getPriority(roomName: string): number {
    let memory = Memory.rooms[roomName];
    if (memory == null) {
      memory = <RoomMemory>{};
      Memory.rooms[roomName] = memory;
    }

    if (memory.priority == null) {
      memory.priority = 100;
    }

    if (Game.rooms[roomName] != null && Game.rooms[roomName].my && memory.priority <= 100) {
      memory.priority = 500;
    }

    return memory.priority;
  }

  get priority(): number {
    return SporeRoom.getPriority(this.name);
  }

  get energyHarvestedSinceLastInvasion(): number {
    let memory = Memory.rooms[this.name];
    if (memory == null) {
      memory = <RoomMemory>{};
      Memory.rooms[this.name] = memory;
    }

    if (memory.energyHarvestedSinceLastInvasion == null) {
      memory.energyHarvestedSinceLastInvasion = 300000;
    }

    return memory.energyHarvestedSinceLastInvasion;
  }

  set energyHarvestedSinceLastInvasion(value: number) {
    let memory = Memory.rooms[this.name];
    if (memory == null) {
      memory = <RoomMemory>{};
      Memory.rooms[this.name] = memory;
    }

    memory.energyHarvestedSinceLastInvasion = value;
  }

  get sources(): Source[] {
    return Remember.byName(
      `room.${this.name}`,
      `sources`,
      function() {
        let memory = Memory.rooms[this.name];
        if (memory == null) {
          memory = <RoomMemory>{};
          Memory.rooms[this.name] = memory;
        }

        let sources: Source[];
        let sourceIds = memory.sources;

        if (sourceIds == null) {
          memory.sources = {};

          sources = this.find(FIND_SOURCES);

          _.forEach(sources, function(source: Source) {
            memory.sources[source.id] = <SourceMemory>{};
          });
        } else {
          sources = [];
          for (let id in sourceIds) {
            let source = Game.getObjectById<Source>(id);

            if (source != null) {
              sources.push(source);
            }
          }
        }

        return sources;
      }.bind(this)
    );
  }

  get extractor(): StructureExtractor {
    return Remember.byName(
      `room.${this.name}`,
      `extractor`,
      function() {
        let extractors = this.find(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_EXTRACTOR
          }
        });

        let extractor = null;

        if (extractors != null && extractors.length > 0) {
          extractor = extractors[0];
        }

        return extractor;
      }.bind(this)
    );
  }

  get mySpawns(): StructureSpawn[] {
    return this.find(FIND_MY_SPAWNS);
  }

  get structures(): Structure[] {
    return this.find<Structure>(FIND_STRUCTURES);
  }

  get nonwalkableStructures(): Structure | ConstructionSite[] {
    return Remember.byName(
      `room.${this.name}`,
      `nonwalkableStructures`,
      function() {
        const structs = _.filter(
          this.structures,
          function(structure: Structure) {
            return _.includes(OBSTACLE_OBJECT_TYPES, structure.structureType);
          }.bind(this)
        );

        const sites = _.filter(
          this.constructionSites,
          function(site: ConstructionSite) {
            return site.my && _.includes(OBSTACLE_OBJECT_TYPES, site.structureType);
          }.bind(this)
        );

        return _.merge(structs, sites);
      }.bind(this)
    );
  }

  get roads(): Structure[] {
    return Remember.byName(
      `room.${this.name}`,
      `roads`,
      function() {
        return this.find(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_ROAD
          }
        });
      }.bind(this)
    );
  }

  get extensions(): StructureExtension[] {
    return Remember.byName(
      `room.${this.name}`,
      `extensions`,
      function() {
        return this.find(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_EXTENSION
          }
        });
      }.bind(this)
    );
  }

  get containers(): StructureContainer[] {
    return Remember.byName(
      `room.${this.name}`,
      `containers`,
      function() {
        return this.find(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_CONTAINER
          }
        });
      }.bind(this)
    );
  }

  get ramparts(): StructureRampart[] {
    return Remember.byName(
      `room.${this.name}`,
      `ramparts`,
      function() {
        return this.find(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_RAMPART
          }
        });
      }.bind(this)
    );
  }

  get towers(): StructureTower[] {
    return Remember.byName(
      `room.${this.name}`,
      `towers`,
      function() {
        return this.find(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_TOWER
          }
        });
      }.bind(this)
    );
  }

  get links(): StructureLink[] {
    return Remember.byName(
      `room.${this.name}`,
      `links`,
      function() {
        return this.find(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_LINK
          }
        });
      }.bind(this)
    );
  }

  get resources(): Resource[] {
    return this.find(FIND_DROPPED_RESOURCES);
  }

  get constructionSites(): ConstructionSite[] {
    return this.find(FIND_CONSTRUCTION_SITES);
  }

  get allySites(): ConstructionSite[] {
    return Remember.byName(
      `room.${this.name}`,
      `allySites`,
      function() {
        return this.find(FIND_CONSTRUCTION_SITES, {
          filter: function(site) {
            return ALLY_WHITELIST.indexOf(site.owner.username.toLowerCase()) > -1;
          }.bind(this)
        });
      }.bind(this)
    );
  }

  get creeps(): Creep[] {
    return this.find(FIND_CREEPS);
  }

  get myCreeps(): Creep[] {
    return this.find(FIND_MY_CREEPS);
  }

  get wires(): Flag[] {
    return this.find(FIND_FLAGS, {
      filter: function(flag: Flag) {
        return flag.color === COLOR_WHITE;
      }.bind(this)
    });
  }

  get hostileCreeps(): Creep[] {
    return Remember.byName(
      `room.${this.name}`,
      `hostileCreeps`,
      function() {
        return this.find(FIND_HOSTILE_CREEPS, {
          filter: function(creep) {
            return FRIENDLY_WHITELIST.indexOf(creep.owner.username.toLowerCase()) === -1;
          }.bind(this)
        });
      }.bind(this)
    );
  }

  get friendlyCreeps(): Creep[] {
    return Remember.byName(
      `room.${this.name}`,
      `friendlyCreeps`,
      function() {
        return this.find(FIND_HOSTILE_CREEPS, {
          filter: function(creep) {
            return FRIENDLY_WHITELIST.indexOf(creep.owner.username.toLowerCase()) > -1;
          }.bind(this)
        });
      }.bind(this)
    );
  }

  get injuredFriendlyCreeps(): Creep[] {
    return Remember.byName(
      `room.${this.name}`,
      `injuredFriendlyCreeps`,
      function() {
        return this.find(FIND_CREEPS, {
          filter: function(creep) {
            return creep.hits < creep.hitsMax && FRIENDLY_WHITELIST.indexOf(creep.owner.username.toLowerCase()) > -1;
          }.bind(this)
        });
      }.bind(this)
    );
  }

  get sourceKeepers(): Creep[] {
    return Remember.byName(
      `room.${this.name}`,
      `sourceKeepers`,
      function() {
        return this.find(FIND_CREEPS, {
          filter: function(creep) {
            return creep.owner.username === 'Source Keeper';
          }.bind(this)
        });
      }.bind(this)
    );
  }

  get invaders(): Creep[] {
    return Remember.byName(
      `room.${this.name}`,
      `invaders`,
      function() {
        return this.find(FIND_CREEPS, {
          filter: function(creep) {
            return creep.owner.username === 'Invader';
          }.bind(this)
        });
      }.bind(this)
    );
  }

  lookForByRadiusAt<T extends keyof AllLookAtTypes>(
    type: T,
    location: RoomObject | RoomPosition,
    radius: number,
    asArray?: false
  ): LookForAtAreaResultMatrix<AllLookAtTypes[T], T>;
  lookForByRadiusAt<T extends keyof AllLookAtTypes>(
    type: T,
    location: RoomObject | RoomPosition,
    radius: number,
    asArray: true
  ): LookForAtAreaResultArray<AllLookAtTypes[T], T>;
  lookForByRadiusAt<T extends keyof AllLookAtTypes>(
    type: T,
    location: RoomObject | RoomPosition,
    radius: number,
    asArray: boolean
  ): LookForAtAreaResultMatrix<AllLookAtTypes[T], T> | LookForAtAreaResultArray<AllLookAtTypes[T], T> {
    let pos = <RoomPosition>location;
    if ((<RoomObject>location).pos != null) {
      pos = (<RoomObject>location).pos;
    }

    if (asArray) {
      return this.lookForAtArea(
        type,
        Math.max(pos.y - radius, 0),
        Math.max(pos.x - radius, 0),
        Math.min(pos.y + radius, 49),
        Math.min(pos.x + radius, 49),
        true
      );
    } else {
      return this.lookForAtArea(
        type,
        Math.max(pos.y - radius, 0),
        Math.max(pos.x - radius, 0),
        Math.min(pos.y + radius, 49),
        Math.min(pos.x + radius, 49),
        false
      );
    }
  }

  trackEconomy(): void {
    this.economy = new Economy();

    if (this.budget.savings[RESOURCE_ENERGY] == null) {
      this.budget.savings[RESOURCE_ENERGY] = 100000;
    }

    for (let structure of this.containers) {
      if (structure.structureType === STRUCTURE_CONTAINER) {
        this.economy.countStoreResources((<StructureContainer>structure).store);
      }
    }

    for (let structure of this.links) {
      if (structure.structureType === STRUCTURE_LINK) {
        this.economy.resources[RESOURCE_ENERGY] += (<StructureLink>structure).energy;
      }
    }

    if (this.storage != null) {
      for (let prop in this.storage.store) {
        if (this.economy.resources[prop] == null) {
          this.economy.resources[prop] = 0;
        }

        let savings = 0;
        if (this.budget.savings[prop] != null && this.budget.savings[prop] > 0) {
          savings = this.budget.savings[prop];
        }

        this.economy.resources[prop] += Math.max(this.storage.store[prop] - savings, 0);
      }
    }

    for (let resource of this.resources) {
      this.economy.resources[resource.resourceType] += resource.amount;
    }

    for (let creep of this.myCreeps) {
      //this.economy.countStoreResources(creep.carry);
      this.economy.demand[RESOURCE_ENERGY] += creep.cost;
    }

    console.log(this + ' economy energy supply ' + this.economy.resources.energy);
    console.log(this + ' economy energy demand ' + Math.ceil(this.economy.demand.energy / 1500));
  }

  getTasks(): Task[] {
    let tasks: Task[] = [];

    //////////////////////////////////////////////////////////////////////////////
    // Activate safe mode
    {
      if (this.controller.safeModeAvailable > 0 && this.controller.safeMode == null && this.hostileCreeps.length > 0) {
        let structures = _.filter(this.structures, function(structure: Structure) {
          return !!(
            structure.structureType !== STRUCTURE_RAMPART &&
            structure.structureType !== STRUCTURE_WALL &&
            structure.structureType !== STRUCTURE_CONTAINER &&
            structure.structureType !== STRUCTURE_LINK &&
            structure.structureType !== STRUCTURE_ROAD
          );
        });

        for (let creep of this.hostileCreeps) {
          if (creep.pos.findFirstInRange(structures, 2)) {
            this.controller.activateSafeMode();
          }
        }
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Harvest energy
    {
      for (let source of this.sources) {
        if (source.doIgnore) {
          continue;
        }

        let task = new HarvestEnergy(Ptr.from<Source>(source));
        task.priority = TaskPriority.Mandatory + 25 + source.priorityModifier;

        if (this.isReserved) {
          task.idealCreepBody = CREEP_TYPE.REMOTE_MINER;

          const reservedBy = this.memory.reservedBy;
          if (reservedBy != null) {
            task.roomName = reservedBy;
          }
        }

        tasks.push(task);
      }
    }
    //////////////////////////////////////////////////////////////////////////////
    // Carry remote energy
    if (this.isReserved) {
      let targets = [];
      let link = Game.getObjectById<StructureLink>('5d0ae2635bf1730d8cfefd35');
      if (link != null) {
        targets.push(Ptr.from(link));
      } else {
        targets.push(Ptr.from(Game.rooms['E51S39'].storage));
      }

      let task = new TransferResource(
        targets,
        RESOURCE_ENERGY,
        null,
        new CollectOptions([this.name], [['near_dropped'], ['link', 'container', 'storage'], ['dropped']])
      );

      task.priority = TaskPriority.High + 300;
      task.id = 'Remote gather ' + this;
      task.name = task.id;
      task.idealCreepBody = CREEP_TYPE.REMOTE_COURIER;

      task.capacityCap = 0;
      for (let source of this.sources) {
        task.capacityCap += source.energyCapacity;
      }

      tasks.push(task);

      if (this.energyHarvestedSinceLastInvasion > 70000 || this.invaders.length > 0) {
        let defendTask = new DefendRoom(this.name);
        tasks.push(defendTask);
      }

      if (this.invaders.length > 0) {
        if (this.energyHarvestedSinceLastInvasion > 500) {
          let hasDefender = false;
          for (let creep of this.myCreeps) {
            if (creep.type === CREEP_TYPE.REMOTE_DEFENDER.name) {
              hasDefender = true;
              break;
            }
          }

          if (!hasDefender) {
            console.log('Invasion has occurred with no REMOTE_DEFENDER ' + this.energyHarvestedSinceLastInvasion);
            Game.notify(
              '[' +
                this.name +
                '] Invasion has occurred with no REMOTE_DEFENDER ' +
                this.energyHarvestedSinceLastInvasion,
              10
            );
          } else {
            console.log(
              'Invasion has occurred while protected by a REMOTE_DEFENDER ' + this.energyHarvestedSinceLastInvasion
            );
            Game.notify(
              '[' +
                this.name +
                '] Invasion has occurred while protected by a REMOTE_DEFENDER ' +
                this.energyHarvestedSinceLastInvasion,
              10
            );
          }
        }

        this.energyHarvestedSinceLastInvasion = 0;
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Fill Spawn and Extensions
    {
      let transferTargets: Ptr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>[] = [];

      for (let spawn of this.mySpawns) {
        transferTargets.push(Ptr.from<StructureSpawn>(spawn));
      }

      for (let extension of this.extensions) {
        transferTargets.push(Ptr.from<StructureExtension>(extension));
      }

      if (transferTargets.length > 0) {
        let task;

        if (this.economy.resources[RESOURCE_ENERGY] > 0) {
          task = new TransferResource(
            transferTargets,
            RESOURCE_ENERGY,
            null,
            new CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']])
          );
        } else {
          task = new TransferResource(
            transferTargets,
            RESOURCE_ENERGY,
            null,
            new CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped'], ['source']])
          );
        }

        task.priority = TaskPriority.Mandatory + 300;
        task.id = 'Fill Spawns and Extensions ' + this;
        task.name = task.id;
        //task.capacityCap = this.energyCapacityAvailable;
        //task.reserveWorkers = true;

        tasks.push(task);
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Fill storage
    {
      if (this.storage != null && this.storage.storeCapacityRemaining) {
        let transferEnergyTask = new TransferResource(
          [Ptr.from<StructureStorage>(this.storage)],
          RESOURCE_ENERGY,
          null,
          new CollectOptions(null, [['near_dropped'], ['link', 'container'], ['dropped']])
        );
        transferEnergyTask.priority = TaskPriority.High;
        transferEnergyTask.name = 'Transfer energy to ' + Ptr.from<StructureStorage>(this.storage).toHtml();
        transferEnergyTask.capacityCap = 600;
        tasks.push(transferEnergyTask);
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Upgrade room controller
    if (this.controller.my) {
      let task = new UpgradeRoomController(Ptr.from<StructureController>(this.controller));
      task.collectOptions.roomNames.push(this.name);
      tasks.push(task);
    }

    //////////////////////////////////////////////////////////////////////////////
    // Reinforce barriers
    if (!this.isReserved && this.controller.level >= 1) {
      let sites = _.filter(this.constructionSites, function(site: ConstructionSite) {
        if ((!site.doIgnore && site.structureType === STRUCTURE_RAMPART) || site.structureType === STRUCTURE_WALL) {
          return true;
        }

        return false;
      });

      let structures = _.filter(
        this.structures,
        function(structure: Structure) {
          if (
            structure.structureType === STRUCTURE_WALL &&
            (structure.pos.x === 0 || structure.pos.x === 49 || structure.pos.y === 0 || structure.pos.y === 49)
          ) {
            // don't repair newbie walls
            return false;
          }

          if (
            !structure.doIgnore &&
            (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL)
          ) {
            return true;
          }

          return false;
        }.bind(this)
      );

      let barriers: Ptr<ConstructionSite | StructureWall | StructureRampart>[] = _.map(sites, function(
        site: ConstructionSite
      ) {
        return Ptr.from<ConstructionSite>(site);
      }).concat(
        _.map(structures, function(structure: Structure) {
          return Ptr.from<any>(structure);
        })
      );

      if (barriers.length > 0) {
        let task: Task = new BuildBarrier(barriers);
        task.roomName = this.name;
        tasks.push(task);
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Manage Ramparts
    {
      if (this.hostileCreeps.length > 0 || this.friendlyCreeps.length > 0) {
        if (this.hostileCreeps.length > 5) {
          for (let rampart of this.ramparts) {
            rampart.setPublic(false);
          }
        } else {
          for (let creep of this.hostileCreeps) {
            let lookArea = creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep, 2, true);

            for (let spot of lookArea) {
              if (spot.structure != null && spot.structure.structureType === STRUCTURE_RAMPART) {
                (<StructureRampart>spot.structure).setPublic(false);
              }
            }
          }

          for (let creep of this.friendlyCreeps) {
            let lookArea = <LookAtResultWithPos[]>creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep, 2, true);

            for (let spot of lookArea) {
              if (spot.structure != null && spot.structure.structureType === STRUCTURE_RAMPART) {
                let rampart = <StructureRampart>spot.structure;
                let site = rampart.pos.lookFor(LOOK_CONSTRUCTION_SITES);
                if (site == null || site.length === 0) {
                  rampart.setPublic(true);
                } else {
                  rampart.setPublic(false);
                }

                rampart.setPublic(false);
              }
            }
          }
        }
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Construction sites
    {
      let sitesOrderedByProgress = _.sortBy(this.constructionSites, function(site: ConstructionSite) {
        return site.progressRemaining;
      });
      for (let site of sitesOrderedByProgress) {
        if (site.doIgnore || !site.my) {
          continue;
        }

        let siteTasks = site.getTasks();

        if (site.doFavor) {
          _.forEach(siteTasks, function(task: Task) {
            task.priority = TaskPriority.Mandatory + TaskPriority.ExtraDemandBoost;
          });
        }

        tasks.push.apply(tasks, siteTasks);
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Towers
    if (this.towers.length > 0) {
      if (this.hostileCreeps.length > 0) {
        for (let tower of this.towers) {
          if (
            tower.attackTarget != null &&
            tower.attackTarget.room != null &&
            tower.attackTarget.room.name === tower.room.name &&
            tower.attackTarget.pos.inRangeTo(tower.pos, 40)
          ) {
            tower.attack(tower.attackTarget);
            continue;
          }

          tower.attackTarget = null;

          let closestCreep = tower.pos.findClosestByRange<Creep>(this.hostileCreeps);

          if (closestCreep.pos.inRangeTo(tower.pos, 30)) {
            tower.attack(closestCreep);
            tower.attackTarget = closestCreep;
          }
        }
      } else if (this.injuredFriendlyCreeps.length > 0) {
        for (let tower of this.towers) {
          console.log('/////////////////////////////////// ' + this.injuredFriendlyCreeps[0].name);
          tower.heal(this.injuredFriendlyCreeps[0]);
        }
      }
    }

    //////////////////////////////////////////////////////////////////////////////
    // Structures
    {
      let hasTowersForRepair = this.towers.length > 0 && this.hostileCreeps.length === 0;
      for (let structure of this.structures) {
        if (structure.doIgnore) {
          continue;
        }

        if ((<any>structure).getTasks != null) {
          let structureTasks = (<any>structure).getTasks();

          if (structure.doFavor) {
            structureTasks.forEach(function(task: Task) {
              task.priority = TaskPriority.Mandatory + TaskPriority.ExtraDemandBoost;
            });
          }

          tasks.push.apply(tasks, structureTasks);
        }

        //////////////////////////////////////////////////////////////////////////////
        // Repair structures
        if (structure.structureType === STRUCTURE_CONTROLLER) {
          continue;
        }

        if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) {
          continue;
        }

        let structureValue = {
          ideal: 10000,
          regular: { threshold: 0.5, priority: TaskPriority.High },
          dire: { threshold: 0.85, priority: TaskPriority.Mandatory }
        };
        if (STRUCTURE_REPAIR_VALUES[structure.structureType] != null) {
          structureValue = STRUCTURE_REPAIR_VALUES[structure.structureType];
        }

        if (
          (structure.needsRepair && structure.hits < structureValue.ideal) ||
          structure.hits < structureValue.regular.threshold
        ) {
          structure.needsRepair = true;

          let wasTowerRepaired = false;
          if (hasTowersForRepair) {
            for (let tower of this.towers) {
              if (tower.repairTarget == null && tower.attackTarget == null && tower.energyCapacityRemaining < 300) {
                tower.repair(structure);
                tower.repairTarget = structure;
                wasTowerRepaired = true;
                break;
              }
            }
          }

          if (wasTowerRepaired === false) {
            hasTowersForRepair = false;

            let repairTask = new RepairStructure(Ptr.from<Structure>(structure));
            repairTask.priority = structureValue.regular.priority;

            if (structure.hits < structureValue.dire.threshold) {
              structure.dire = true;
            }

            if (structure.dire === true) {
              repairTask.priority = structureValue.dire.priority;
              repairTask.name = 'Repair ' + structure;
            }

            tasks.push(repairTask);
          }
        } else {
          structure.needsRepair = false;

          if (structure.dire === true) {
            structure.dire = false;
          }
        }
      }
    }

    return tasks;
  }
}
