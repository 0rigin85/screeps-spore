module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const spore_1 = __webpack_require__(2);
	const sporeColony_1 = __webpack_require__(41);
	const sporeRemember_1 = __webpack_require__(13);
	const screeps_profiler_1 = __webpack_require__(40);
	spore_1.Spore.inject();
	module.exports.loop = function () {
	    screeps_profiler_1.profiler.wrap(function () {
	        PathFinder.use(true);
	        sporeRemember_1.Remember.beginTick();
	        if (Memory.config == null) {
	            Memory.config = { tasks: {} };
	        }
	        for (let name in Memory.creeps) {
	            if (!Game.creeps[name]) {
	                delete Memory.creeps[name];
	                console.log('Clearing non-existing creep memory:', name);
	            }
	        }
	        spore_1.Spore.colony = new sporeColony_1.SporeColony();
	        spore_1.Spore.colony.run();
	        sporeRemember_1.Remember.endTick();
	    });
	};


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeRoom_1 = __webpack_require__(3);
	const sporeCreep_1 = __webpack_require__(7);
	const sporeSource_1 = __webpack_require__(18);
	const sporeRoomObject_1 = __webpack_require__(21);
	const sporeConstructionSite_1 = __webpack_require__(22);
	const sporeContainer_1 = __webpack_require__(24);
	const sporeController_1 = __webpack_require__(25);
	const sporeExtension_1 = __webpack_require__(26);
	const sporeFlag_1 = __webpack_require__(27);
	const sporeRoomPosition_1 = __webpack_require__(12);
	const sporeSpawn_1 = __webpack_require__(34);
	const sporeStorage_1 = __webpack_require__(35);
	const sporeStructure_1 = __webpack_require__(36);
	const sporeTower_1 = __webpack_require__(37);
	const sporeResource_1 = __webpack_require__(38);
	const sporeLink_1 = __webpack_require__(39);
	const screeps_profiler_1 = __webpack_require__(40);
	class Spore {
	    constructor() { }
	    static inject() {
	        function completeAssign(target, ...sources) {
	            sources.forEach(source => {
	                let descriptors = Object.getOwnPropertyNames(source).reduce((descriptors, key) => {
	                    if (key != "constructor" && key != "colony") {
	                        descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
	                        descriptors[key].enumerable = true;
	                    }
	                    return descriptors;
	                }, {});
	                // by default, Object.assign copies enumerable Symbols too
	                Object.getOwnPropertySymbols(source).forEach(sym => {
	                    let descriptor = Object.getOwnPropertyDescriptor(source, sym);
	                    if (descriptor.enumerable) {
	                        descriptors[sym] = descriptor;
	                    }
	                });
	                Object.defineProperties(target, descriptors);
	                if (target['colony'] == null) {
	                    Object.defineProperty(target, "colony", { get: function () { return Spore.colony; }, configurable: true });
	                }
	            });
	            return target;
	        }
	        completeAssign(ConstructionSite.prototype, sporeConstructionSite_1.SporeConstructionSite.prototype);
	        completeAssign(StructureContainer.prototype, sporeContainer_1.SporeContainer.prototype);
	        completeAssign(StructureController.prototype, sporeController_1.SporeController.prototype);
	        completeAssign(Creep.prototype, sporeCreep_1.SporeCreep.prototype);
	        completeAssign(StructureExtension.prototype, sporeExtension_1.SporeExtension.prototype);
	        completeAssign(Flag.prototype, sporeFlag_1.SporeFlag.prototype);
	        completeAssign(Room.prototype, sporeRoom_1.SporeRoom.prototype);
	        completeAssign(RoomObject.prototype, sporeRoomObject_1.SporeRoomObject.prototype);
	        completeAssign(RoomPosition.prototype, sporeRoomPosition_1.SporeRoomPosition.prototype);
	        completeAssign(Source.prototype, sporeSource_1.SporeSource.prototype);
	        completeAssign(Spawn.prototype, sporeSpawn_1.SporeSpawn.prototype);
	        completeAssign(StructureStorage.prototype, sporeStorage_1.SporeStorage.prototype);
	        completeAssign(Structure.prototype, sporeStructure_1.SporeStructure.prototype);
	        completeAssign(StructureTower.prototype, sporeTower_1.SporeTower.prototype);
	        completeAssign(Resource.prototype, sporeResource_1.SporeResource.prototype);
	        completeAssign(StructureLink.prototype, sporeLink_1.SporeLink.prototype);
	        screeps_profiler_1.profiler.enable();
	        // profiler.registerObject(Task.prototype, 'Task');
	        // profiler.registerObject(SporeColony.prototype, 'SporeColony');
	        // profiler.registerObject(BuildBarrier.prototype, 'TaskBuildBarrier');
	        // profiler.registerObject(ClaimRoom.prototype, 'ClaimRoom');
	        // profiler.registerObject(DefendRoom.prototype, 'DefendRoom');
	        // profiler.registerObject(DismantleStructure.prototype, 'DismantleStructure');
	        // profiler.registerObject(HarvestEnergy.prototype, 'HarvestEnergy');
	        // profiler.registerObject(RecycleCreep.prototype, 'RecycleCreep');
	        // profiler.registerObject(RepairStructure.prototype, 'RepairStructure');
	        // profiler.registerObject(ReserveRoom.prototype, 'ReserveRoom');
	        // profiler.registerObject(TransferResource.prototype, 'TransferResource');
	        // profiler.registerObject(UpgradeRoomController.prototype, 'UpgradeRoomController');
	        // profiler.registerObject(Wire.prototype, 'Wire');
	    }
	}
	Spore.colony = null;
	exports.Spore = Spore;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const taskTransferResource_1 = __webpack_require__(4);
	const taskUpgradeRoomController_1 = __webpack_require__(14);
	const taskRepairStructure_1 = __webpack_require__(15);
	const screepsPtr_1 = __webpack_require__(16);
	const taskHarvestEnergy_1 = __webpack_require__(17);
	const taskBuildBarrier_1 = __webpack_require__(19);
	const sporeCreep_1 = __webpack_require__(7);
	const taskDefendRoom_1 = __webpack_require__(20);
	const sporeRemember_1 = __webpack_require__(13);
	// List of usernames, name must be lower case.
	const FRIENDLY_WHITELIST = [
	    'pcake0rigin',
	    'barney',
	    'pcakecysote',
	    'swifty',
	    'yeurch',
	    '0xdeadfeed' // Wes
	];
	// List of usernames, name must be lower case.
	const ALLY_WHITELIST = [
	    'barney',
	    'pcakecysote',
	    'swifty',
	    'yeurch',
	    '0xdeadfeed' // Wes
	];
	let STRUCTURE_REPAIR_VALUES = {};
	STRUCTURE_REPAIR_VALUES[STRUCTURE_CONTAINER] = { ideal: CONTAINER_HITS, regular: { threshold: 200000, priority: 100 /* High */ }, dire: { threshold: 100000, priority: 1000 /* Mandatory */ } };
	STRUCTURE_REPAIR_VALUES[STRUCTURE_TOWER] = { ideal: TOWER_HITS, regular: { threshold: 2000, priority: 100 /* High */ }, dire: { threshold: 1000, priority: 1000 /* Mandatory */ } };
	STRUCTURE_REPAIR_VALUES[STRUCTURE_ROAD] = { ideal: ROAD_HITS, regular: { threshold: 2500, priority: 100 /* High */ }, dire: { threshold: 500, priority: 50 /* Medium */ } };
	STRUCTURE_REPAIR_VALUES[STRUCTURE_RAMPART] = { ideal: 20000, regular: { threshold: 15000, priority: 100 /* High */ }, dire: { threshold: 10000, priority: 50 /* Medium */ } };
	STRUCTURE_REPAIR_VALUES[STRUCTURE_WALL] = { ideal: 20000, regular: { threshold: 20000, priority: 50 /* Medium */ }, dire: { threshold: 10000, priority: 25 /* MediumLow */ } };
	STRUCTURE_REPAIR_VALUES[STRUCTURE_LINK] = { ideal: LINK_HITS_MAX, regular: { threshold: LINK_HITS_MAX * 0.8, priority: 100 /* High */ }, dire: { threshold: LINK_HITS_MAX * 0.3, priority: 1000 /* Mandatory */ } };
	class Economy {
	    constructor() {
	        this.resources = {};
	        this.demand = {};
	        for (let name of RESOURCES_ALL) {
	            this.resources[name] = 0;
	            this.demand[name] = 0;
	        }
	    }
	    countStoreResources(store) {
	        for (let prop in store) {
	            if (this.resources[prop] == null) {
	                this.resources[prop] = 0;
	            }
	            this.resources[prop] += store[prop];
	        }
	    }
	}
	exports.Economy = Economy;
	class Budget {
	    constructor() {
	        this.savings = {};
	    }
	}
	exports.Budget = Budget;
	class SporeRoom extends Room {
	    get budget() {
	        let memory = Memory.rooms[this.name];
	        if (memory == null) {
	            memory = {};
	            Memory.rooms[this.name] = memory;
	        }
	        if (memory.budget == null) {
	            memory.budget = new Budget();
	        }
	        return memory.budget;
	    }
	    get my() {
	        return this.controller != null && (this.controller.my || (this.controller.reservation != null && this.controller.reservation.username == 'PCake0rigin'));
	    }
	    get isReserved() {
	        let isReserved = false;
	        if (this.controller != null && this.controller.reservation != null) {
	            isReserved = this.controller.reservation.username == 'PCake0rigin';
	        }
	        return isReserved;
	    }
	    static getPriority(roomName) {
	        let memory = Memory.rooms[roomName];
	        if (memory == null) {
	            memory = {};
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
	    get priority() {
	        return SporeRoom.getPriority(this.name);
	    }
	    get energyHarvestedSinceLastInvasion() {
	        let memory = Memory.rooms[this.name];
	        if (memory == null) {
	            memory = {};
	            Memory.rooms[this.name] = memory;
	        }
	        if (memory.energyHarvestedSinceLastInvasion == null) {
	            memory.energyHarvestedSinceLastInvasion = 300000;
	        }
	        return memory.energyHarvestedSinceLastInvasion;
	    }
	    set energyHarvestedSinceLastInvasion(value) {
	        let memory = Memory.rooms[this.name];
	        if (memory == null) {
	            memory = {};
	            Memory.rooms[this.name] = memory;
	        }
	        memory.energyHarvestedSinceLastInvasion = value;
	    }
	    get sources() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `sources`, function () {
	            let memory = Memory.rooms[this.name];
	            if (memory == null) {
	                memory = {};
	                Memory.rooms[this.name] = memory;
	            }
	            let sources;
	            let sourceIds = memory.sources;
	            if (sourceIds == null) {
	                memory.sources = {};
	                sources = this.find(FIND_SOURCES);
	                _.forEach(sources, function (source) { memory.sources[source.id] = {}; });
	            }
	            else {
	                sources = [];
	                for (let id in sourceIds) {
	                    let source = Game.getObjectById(id);
	                    if (source != null) {
	                        sources.push(source);
	                    }
	                }
	            }
	            return sources;
	        }.bind(this));
	    }
	    get extractor() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `extractor`, function () {
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
	        }.bind(this));
	    }
	    get mySpawns() {
	        return this.find(FIND_MY_SPAWNS);
	    }
	    get structures() {
	        return this.find(FIND_STRUCTURES);
	    }
	    get nonwalkableStructures() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `nonwalkableStructures`, function () {
	            return _.filter(this.structures, function (structure) {
	                return _.includes(OBSTACLE_OBJECT_TYPES, structure.structureType);
	            }.bind(this));
	        }.bind(this));
	    }
	    get roads() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `roads`, function () {
	            return this.find(FIND_STRUCTURES, {
	                filter: {
	                    structureType: STRUCTURE_ROAD
	                }
	            });
	        }.bind(this));
	    }
	    get extensions() {
	        debugger;
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `extensions`, function () {
	            debugger;
	            return this.find(FIND_STRUCTURES, {
	                filter: {
	                    structureType: STRUCTURE_EXTENSION
	                }
	            });
	        }).bind(this);
	    }
	    get containers() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `containers`, function () {
	            return this.find(FIND_STRUCTURES, {
	                filter: {
	                    structureType: STRUCTURE_CONTAINER
	                }
	            });
	        }.bind(this));
	    }
	    get ramparts() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `ramparts`, function () {
	            return this.find(FIND_STRUCTURES, {
	                filter: {
	                    structureType: STRUCTURE_RAMPART
	                }
	            });
	        }.bind(this));
	    }
	    get towers() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `towers`, function () {
	            return this.find(FIND_STRUCTURES, {
	                filter: {
	                    structureType: STRUCTURE_TOWER
	                }
	            });
	        }.bind(this));
	    }
	    get links() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `links`, function () {
	            return this.find(FIND_STRUCTURES, {
	                filter: {
	                    structureType: STRUCTURE_LINK
	                }
	            });
	        }.bind(this));
	    }
	    get resources() {
	        return this.find(FIND_DROPPED_RESOURCES);
	    }
	    get constructionSites() {
	        return this.find(FIND_CONSTRUCTION_SITES);
	    }
	    get allySites() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `allySites`, function () {
	            return this.find(FIND_CONSTRUCTION_SITES, {
	                filter: function (site) {
	                    return ALLY_WHITELIST.indexOf(site.owner.username.toLowerCase()) > -1;
	                }.bind(this)
	            });
	        }.bind(this));
	    }
	    get creeps() {
	        return this.find(FIND_CREEPS);
	    }
	    get myCreeps() {
	        return this.find(FIND_MY_CREEPS);
	    }
	    get hostileCreeps() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `hostileCreeps`, function () {
	            return this.find(FIND_HOSTILE_CREEPS, {
	                filter: function (creep) {
	                    return FRIENDLY_WHITELIST.indexOf(creep.owner.username.toLowerCase()) === -1;
	                }.bind(this)
	            });
	        }.bind(this));
	    }
	    get friendlyCreeps() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `friendlyCreeps`, function () {
	            return this.find(FIND_HOSTILE_CREEPS, {
	                filter: function (creep) {
	                    return FRIENDLY_WHITELIST.indexOf(creep.owner.username.toLowerCase()) > -1;
	                }.bind(this)
	            });
	        }.bind(this));
	    }
	    get injuredFriendlyCreeps() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `injuredFriendlyCreeps`, function () {
	            return this.find(FIND_CREEPS, {
	                filter: function (creep) {
	                    return creep.hits < creep.hitsMax && FRIENDLY_WHITELIST.indexOf(creep.owner.username.toLowerCase()) > -1;
	                }.bind(this)
	            });
	        }.bind(this));
	    }
	    get sourceKeepers() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `sourceKeepers`, function () {
	            return this.find(FIND_CREEPS, {
	                filter: function (creep) {
	                    return creep.owner.username === "Source Keeper";
	                }.bind(this)
	            });
	        }.bind(this));
	    }
	    get invaders() {
	        return sporeRemember_1.Remember.byName(`room.${this.name}`, `invaders`, function () {
	            return this.find(FIND_CREEPS, {
	                filter: function (creep) {
	                    return creep.owner.username === "Invader";
	                }.bind(this)
	            });
	        }.bind(this));
	    }
	    lookForByRadiusAt(type, location, radius, asArray) {
	        let pos = location;
	        if (location.pos != null) {
	            pos = location.pos;
	        }
	        return this.lookForAtArea(type, Math.max(pos.y - radius, 0), Math.max(pos.x - radius, 0), Math.min(pos.y + radius, 49), Math.min(pos.x + radius, 49), asArray);
	    }
	    trackEconomy() {
	        this.economy = new Economy();
	        if (this.budget.savings[RESOURCE_ENERGY] == null) {
	            this.budget.savings[RESOURCE_ENERGY] = 100000;
	        }
	        for (let structure of this.containers) {
	            if (structure.structureType === STRUCTURE_CONTAINER) {
	                this.economy.countStoreResources(structure.store);
	            }
	        }
	        for (let structure of this.links) {
	            if (structure.structureType === STRUCTURE_LINK) {
	                this.economy.resources[RESOURCE_ENERGY] += structure.energy;
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
	    getTasks() {
	        let tasks = [];
	        //////////////////////////////////////////////////////////////////////////////
	        // Activate safe mode
	        {
	            if (this.controller.safeModeAvailable > 0 && this.controller.safeMode == null && this.hostileCreeps.length > 0) {
	                let structures = _.filter(this.structures, function (structure) {
	                    return !!(structure.structureType !== STRUCTURE_RAMPART &&
	                        structure.structureType !== STRUCTURE_WALL &&
	                        structure.structureType !== STRUCTURE_CONTAINER &&
	                        structure.structureType !== STRUCTURE_LINK &&
	                        structure.structureType !== STRUCTURE_ROAD);
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
	                let task = new taskHarvestEnergy_1.HarvestEnergy(screepsPtr_1.ScreepsPtr.from(source));
	                task.priority = 1000 /* Mandatory */ + 25 + source.priorityModifier;
	                if (this.isReserved) {
	                    task.idealCreepBody = sporeCreep_1.CREEP_TYPE.REMOTE_MINER;
	                }
	                if (this.isReserved) {
	                    task.id += 'E1N49';
	                    task.roomName = 'E1N49';
	                }
	                tasks.push(task);
	            }
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Carry remote energy
	        if (this.isReserved) {
	            if (this.name === 'E2N49' || this.name === 'E2N48' || this.name === 'E1N48') {
	                let targets = [];
	                let link = Game.getObjectById('57f697aab36576753223a1c4');
	                if (link != null && this.name === 'E2N49') {
	                    targets.push(screepsPtr_1.ScreepsPtr.from(Game.rooms['E1N49'].storage));
	                }
	                else {
	                    targets.push(screepsPtr_1.ScreepsPtr.from(Game.rooms['E1N49'].storage));
	                }
	                let task = new taskTransferResource_1.TransferResource(targets, RESOURCE_ENERGY, null, new sporeCreep_1.CollectOptions([this.name], [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]));
	                task.priority = 100 /* High */ + 300;
	                task.id = "Remote gather " + this;
	                task.name = task.id;
	                task.idealCreepBody = sporeCreep_1.CREEP_TYPE.REMOTE_COURIER;
	                task.id += 'E1N49';
	                task.roomName = 'E1N49';
	                task.capacityCap = 0;
	                for (let source of this.sources) {
	                    task.capacityCap += source.energyCapacity;
	                }
	                tasks.push(task);
	                if (this.energyHarvestedSinceLastInvasion > 70000 || this.invaders.length > 0) {
	                    let defendTask = new taskDefendRoom_1.DefendRoom(this.name);
	                    defendTask.roomName = 'E1N49';
	                    tasks.push(defendTask);
	                }
	            }
	            if (this.invaders.length > 0) {
	                if (this.energyHarvestedSinceLastInvasion > 500) {
	                    let hasDefender = false;
	                    for (let creep of this.myCreeps) {
	                        if (creep.type === sporeCreep_1.CREEP_TYPE.REMOTE_DEFENDER.name) {
	                            hasDefender = true;
	                            break;
	                        }
	                    }
	                    if (!hasDefender) {
	                        console.log('Invasion has occurred with no REMOTE_DEFENDER ' + this.energyHarvestedSinceLastInvasion);
	                        Game.notify('[' + this.name + '] Invasion has occurred with no REMOTE_DEFENDER ' + this.energyHarvestedSinceLastInvasion, 10);
	                    }
	                    else {
	                        console.log('Invasion has occurred while protected by a REMOTE_DEFENDER ' + this.energyHarvestedSinceLastInvasion);
	                        Game.notify('[' + this.name + '] Invasion has occurred while protected by a REMOTE_DEFENDER ' + this.energyHarvestedSinceLastInvasion, 10);
	                    }
	                }
	                this.energyHarvestedSinceLastInvasion = 0;
	            }
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Fill Spawn and Extensions
	        {
	            let transferTargets = [];
	            for (let spawn of this.mySpawns) {
	                transferTargets.push(screepsPtr_1.ScreepsPtr.from(spawn));
	            }
	            for (let extension of this.extensions) {
	                transferTargets.push(screepsPtr_1.ScreepsPtr.from(extension));
	            }
	            if (transferTargets.length > 0) {
	                let task;
	                if (this.economy.resources[RESOURCE_ENERGY] > 0) {
	                    task = new taskTransferResource_1.TransferResource(transferTargets, RESOURCE_ENERGY, null, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]));
	                }
	                else {
	                    task = new taskTransferResource_1.TransferResource(transferTargets, RESOURCE_ENERGY, null, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped'], ['source']]));
	                }
	                task.priority = 1000 /* Mandatory */ + 300;
	                task.id = "Fill Spawns and Extensions " + this;
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
	                let transferEnergyTask = new taskTransferResource_1.TransferResource([screepsPtr_1.ScreepsPtr.from(this.storage)], RESOURCE_ENERGY, null, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container'], ['dropped']]));
	                transferEnergyTask.priority = 100 /* High */;
	                transferEnergyTask.name = "Transfer energy to " + screepsPtr_1.ScreepsPtr.from(this.storage).toHtml();
	                transferEnergyTask.capacityCap = 600;
	                tasks.push(transferEnergyTask);
	            }
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Upgrade room controller
	        if (this.controller.owner != null && this.controller.owner.username == 'PCake0rigin') {
	            let task = new taskUpgradeRoomController_1.UpgradeRoomController(screepsPtr_1.ScreepsPtr.from(this.controller));
	            task.collectOptions.roomNames.push(this.name);
	            tasks.push(task);
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Reinforce barriers
	        if (!this.isReserved && this.controller.level >= 2) {
	            let sites = _.filter(this.constructionSites, function (site) {
	                if (!site.doIgnore && site.structureType === STRUCTURE_RAMPART || site.structureType === STRUCTURE_WALL) {
	                    return true;
	                }
	                return false;
	            });
	            let structures = _.filter(this.structures, function (structure) {
	                if (structure.structureType === STRUCTURE_WALL &&
	                    (structure.pos.x === 0 || structure.pos.x === 49 ||
	                        structure.pos.y === 0 || structure.pos.y === 49)) {
	                    // don't repair newbie walls
	                    return false;
	                }
	                if (!structure.doIgnore && (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL)) {
	                    return true;
	                }
	                return false;
	            }.bind(this));
	            let barriers = _.map(sites, function (site) {
	                return screepsPtr_1.ScreepsPtr.from(site);
	            }).concat(_.map(structures, function (structure) {
	                return screepsPtr_1.ScreepsPtr.from(structure);
	            }));
	            if (barriers.length > 0) {
	                let task = new taskBuildBarrier_1.BuildBarrier(barriers);
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
	                }
	                else {
	                    for (let creep of this.hostileCreeps) {
	                        let lookArea = creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep, 2, true);
	                        for (let spot of lookArea) {
	                            if (spot.structure != null && spot.structure.structureType === STRUCTURE_RAMPART) {
	                                spot.structure.setPublic(false);
	                            }
	                        }
	                    }
	                    for (let creep of this.friendlyCreeps) {
	                        let lookArea = creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep, 2, true);
	                        for (let spot of lookArea) {
	                            if (spot.structure != null && spot.structure.structureType === STRUCTURE_RAMPART) {
	                                let rampart = spot.structure;
	                                let site = rampart.pos.lookFor(LOOK_CONSTRUCTION_SITES);
	                                if (site == null || site.length === 0) {
	                                    rampart.setPublic(true);
	                                }
	                                else {
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
	            let sitesOrderedByProgress = _.sortBy(this.constructionSites, function (site) { return site.progressRemaining; });
	            for (let site of sitesOrderedByProgress) {
	                if (site.doIgnore || !site.my) {
	                    continue;
	                }
	                let siteTasks = site.getTasks();
	                if (site.doFavor) {
	                    _.forEach(siteTasks, function (task) { task.priority = 1000 /* Mandatory */ + 10 /* ExtraDemandBoost */; });
	                }
	                tasks.push.apply(tasks, siteTasks);
	            }
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Towers
	        if (this.towers.length > 0) {
	            if (this.hostileCreeps.length > 0) {
	                for (let tower of this.towers) {
	                    if (tower.attackTarget != null &&
	                        tower.attackTarget.room != null &&
	                        tower.attackTarget.room.name === tower.room.name &&
	                        tower.attackTarget.pos.inRangeTo(tower.pos, 40)) {
	                        tower.attack(tower.attackTarget);
	                        continue;
	                    }
	                    tower.attackTarget = null;
	                    let closestCreep = tower.pos.findClosestByRange(this.hostileCreeps);
	                    if (closestCreep.pos.inRangeTo(tower.pos, 30)) {
	                        tower.attack(closestCreep);
	                        tower.attackTarget = closestCreep;
	                    }
	                }
	            }
	            else if (this.injuredFriendlyCreeps.length > 0) {
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
	                if (structure.getTasks != null) {
	                    let structureTasks = structure.getTasks();
	                    if (structure.doFavor) {
	                        structureTasks.forEach(function (task) { task.priority = 1000 /* Mandatory */ + 10 /* ExtraDemandBoost */; });
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
	                let structureValue = { ideal: 10000, regular: { threshold: 0.5, priority: 100 /* High */ }, dire: { threshold: 0.85, priority: 1000 /* Mandatory */ } };
	                if (STRUCTURE_REPAIR_VALUES[structure.structureType] != null) {
	                    structureValue = STRUCTURE_REPAIR_VALUES[structure.structureType];
	                }
	                if ((structure.needsRepair && structure.hits < structureValue.ideal) || structure.hits < structureValue.regular.threshold) {
	                    structure.needsRepair = true;
	                    let wasTowerRepaired = false;
	                    if (hasTowersForRepair) {
	                        for (let tower of this.towers) {
	                            if (tower.repairTarget == null &&
	                                tower.attackTarget == null &&
	                                tower.energyCapacityRemaining < 300) {
	                                tower.repair(structure);
	                                tower.repairTarget = structure;
	                                wasTowerRepaired = true;
	                                break;
	                            }
	                        }
	                    }
	                    if (wasTowerRepaired === false) {
	                        hasTowersForRepair = false;
	                        let repairTask = new taskRepairStructure_1.RepairStructure(screepsPtr_1.ScreepsPtr.from(structure));
	                        repairTask.priority = structureValue.regular.priority;
	                        if (structure.dire == true || structure.hits < structureValue.dire.threshold) {
	                            structure.dire = true;
	                            repairTask.priority = structureValue.dire.priority;
	                            repairTask.name = "Repair " + structure;
	                        }
	                        tasks.push(repairTask);
	                    }
	                }
	                else {
	                    structure.needsRepair = false;
	                    structure.dire = false;
	                }
	            }
	        }
	        return tasks;
	    }
	}
	exports.SporeRoom = SporeRoom;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class TransferResource extends task_1.Task {
	    constructor(targets, resourceType, source, 
	        //public resourcesPerTick: number, //resource per tick
	        options) {
	        super(false);
	        this.targets = targets;
	        this.resourceType = resourceType;
	        this.source = source;
	        this.options = options;
	        this.scheduledTransfer = 0;
	        this.scheduledWorkers = 0;
	        this.scheduledCarry = 0;
	        this.reserveWorkers = false;
	        this.capacityCap = 2000;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.COURIER;
	        this.resourcesNeeded = -1;
	        this.needsResources = [];
	        this.resourceCapacity = -1;
	        this.id = "Transfer:" + resourceType + " " + targets.map(function (t) { return t.id; }).join(',');
	        if (source != null) {
	            this.id += " " + source;
	            this.roomName = source.pos.roomName;
	        }
	        else {
	            this.id += ' ';
	            for (let index = 0; index < options.storePriorities.length; index++) {
	                this.id += options.storePriorities[index].join(',');
	            }
	            this.roomName = targets[0].pos.roomName;
	        }
	        this.name = "Transfer " + resourceType + " to " + targets.length + " objects";
	        this.near = source;
	        // this.toDropOff = this.colony.pathFinder.findPathTo(this.source, targets[0], new SporePathOptions(
	        //     [
	        //         { id: 'structures', cost: 255 },
	        //         { id: 'roads', cost: 1 },
	        //         { id: 'creeps', cost: 255 }
	        //     ],
	        //     { id: this.id + ':toStore', ticks: 5 }
	        // ));
	        //
	        // this.toPickUp = this.colony.pathFinder.findPathTo(targets[0], this.source, new SporePathOptions(
	        //     [
	        //         { id: 'structures', cost: 255 },
	        //         { id: 'roads', cost: 1 },
	        //         { id: 'creeps', cost: 255 }
	        //     ],
	        //     { id: this.id + ':toPickup', ticks: 5 }
	        // ));
	        // let distance = 0;
	        // let ticksPerTripToTarget = 0;
	        // let ticksPerTripToStore = 0;
	        // let maxCarryPerCreep = 0;
	        //
	        // if (targets.length === 0)
	        // {
	        //     distance = targets[0].pos.findDistanceByPathTo(this.source);
	        // }
	        //
	        // let carryRequiredPerRoundTrip = (((ticksPerTripToTarget + ticksPerTripToStore) * this.resourcesPerTick) / CARRY_CAPACITY);
	        // let numberOfCreepsRequired = Math.ceil(carryRequiredPerRoundTrip / maxCarryPerCreep);
	        // let carryPerCreep = carryRequiredPerRoundTrip / numberOfCreepsRequired;
	    }
	    calculateRequirements() {
	        this.needsResources.length = 0;
	        this.resourcesNeeded = -1;
	        this.resourceCapacity = -1;
	        for (let index = 0; index < this.targets.length; index++) {
	            let target = this.targets[index];
	            if (!target.isValid) {
	                continue;
	            }
	            if (target.isShrouded) {
	                this.needsResources.push(this.targets[index]);
	                continue;
	            }
	            if (target.instance.energyCapacity != null && this.resourceType === RESOURCE_ENERGY) {
	                let energyContainer = target.instance;
	                let remainingStore = energyContainer.energyCapacityRemaining;
	                this.resourceCapacity += energyContainer.energyCapacity;
	                if (remainingStore > 0) {
	                    this.needsResources.push(target);
	                    this.resourcesNeeded += remainingStore;
	                }
	            }
	            else if (target.instance.storeCapacity != null) {
	                let storeContainer = target.instance;
	                let remainingStore = storeContainer.storeCapacityRemaining;
	                if (storeContainer instanceof StructureStorage) {
	                    this.resourceCapacity += 300000;
	                }
	                else {
	                    this.resourceCapacity += (remainingStore + storeContainer.store[this.resourceType]);
	                }
	                if (remainingStore > 0) {
	                    this.needsResources.push(target);
	                    this.resourcesNeeded += remainingStore;
	                }
	            }
	            else if (target.instance.carryCapacity != null) {
	                let carryContainer = target.instance;
	                let remainingStore = carryContainer.carryCapacityRemaining;
	                this.resourceCapacity += (remainingStore + carryContainer.carry[this.resourceType]);
	                if (remainingStore > 0) {
	                    this.needsResources.push(target);
	                    this.resourcesNeeded += remainingStore;
	                }
	            }
	            else {
	                console.log("UNKNOWN TransferResource Target Type");
	            }
	        }
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        if (this.source != null) {
	            return super.createBasicAppointment(spawn, request, this.source);
	        }
	        return super.createBasicAppointment(spawn, request, this.targets[0]);
	    }
	    getPrioritizingConditions(conditions) {
	        conditions.push((creep) => {
	            if (creep.carry[this.resourceType] === 0 && creep.carryCount === creep.carryCapacity) {
	                return -1;
	            }
	            if (creep.type === sporeCreep_1.CREEP_TYPE.UPGRADER.name) {
	                return -1;
	            }
	            return 0;
	        });
	        super.getBasicPrioritizingConditions(conditions, this.source, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.calculateRequirements();
	        let room = null;
	        if (this.source != null) {
	            room = this.source.room;
	        }
	        else {
	            room = this.targets[0].room;
	        }
	        if (room != null &&
	            room.economy != null &&
	            room.economy.resources != null &&
	            room.economy.resources[RESOURCE_ENERGY] > 0) {
	            this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ carry: Math.floor((Math.min(this.resourceCapacity, this.capacityCap) / CARRY_CAPACITY) * 0.8) }, 1, 3);
	        }
	        this.scheduledTransfer = 0;
	        this.scheduledWorkers = 0;
	        this.scheduledCarry = 0;
	    }
	    hasWork() {
	        if (this.possibleWorkers === 0) {
	            return false;
	        }
	        if (this.resourcesNeeded <= 0) {
	            return false;
	        }
	        if (this.labor.types[this.idealCreepBody.name] != null) {
	            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
	            if (this.scheduledCarry >= this.labor.types[this.idealCreepBody.name].parts[CARRY] ||
	                this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max) {
	                return false;
	            }
	        }
	        return true;
	    }
	    schedule(object) {
	        let room = null;
	        if (this.source != null) {
	            room = this.source.room;
	        }
	        else {
	            room = this.targets[0].room;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to transfer resources with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        if (!this.hasWork()) {
	            //console.log(creep + " resourcesNeeded: " + this.resourcesNeeded + " scheduledTransfer: " + this.scheduledTransfer + " needsResources: " + this.needsResources.length);
	            return task_1.ERR_NO_WORK;
	        }
	        if (this.scheduledTransfer > 0 && (creep.type === sporeCreep_1.CREEP_TYPE.MINER.name || creep.type === sporeCreep_1.CREEP_TYPE.UPGRADER.name)) {
	            return task_1.ERR_SKIP_WORKER;
	        }
	        let remainingNeededResources = Math.max(0, this.resourcesNeeded - this.scheduledTransfer);
	        let code;
	        if (this.resourcesNeeded <= 0) {
	            if (creep.carryCount < creep.carryCapacity) {
	                code = this.scheduleCollect(creep, creep.carryCapacityRemaining, this.needsResources);
	            }
	            else {
	                code = this.scheduleTransfer(creep, this.needsResources);
	                if (code === task_1.ERR_NO_WORK) {
	                    code = creep.goMoveTo(this.targets[0]);
	                }
	            }
	        }
	        else if (creep.action === sporeCreep_1.ACTION_COLLECT && creep.carryCount < creep.carryCapacity) {
	            code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
	            if (code === task_1.ERR_NO_WORK && creep.carry[this.resourceType] > 0) {
	                code = this.scheduleTransfer(creep, this.needsResources);
	            }
	        }
	        else if (creep.carry[this.resourceType] > 0) {
	            if (creep.carryCount === creep.carryCapacity ||
	                creep.carry[this.resourceType] >= remainingNeededResources ||
	                ((creep.action === sporeCreep_1.ACTION_TRANSFER || creep.action === sporeCreep_1.ACTION_MOVE) && creep.carry[this.resourceType] > 0)) {
	                code = this.scheduleTransfer(creep, this.needsResources);
	            }
	            else {
	                let inRangeTarget = creep.pos.findFirstInRange(this.needsResources, 4);
	                if (inRangeTarget != null) {
	                    code = creep.goTransfer(this.resourceType, inRangeTarget);
	                }
	                else {
	                    code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
	                }
	            }
	        }
	        else {
	            code = this.scheduleCollect(creep, remainingNeededResources, this.needsResources);
	        }
	        if (this.reserveWorkers && creep.type === this.idealCreepBody.name) {
	            code = OK;
	        }
	        if (code === OK && creep.spawnRequest == null) {
	            let compatibleTransfer = creep.carryCapacityRemaining + creep.carry[this.resourceType];
	            this.scheduledTransfer += compatibleTransfer;
	            this.scheduledWorkers++;
	            this.scheduledCarry += Math.floor(compatibleTransfer / CARRY_CAPACITY);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (this.possibleWorkers === 0 || !this.hasWork()) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	    scheduleTransfer(creep, needsResources) {
	        let code = task_1.ERR_NO_WORK;
	        let closestTarget = creep.pos.findClosestByRange(needsResources);
	        if (closestTarget != null) {
	            code = creep.goTransfer(this.resourceType, closestTarget);
	        }
	        else if (needsResources.length > 0) {
	            code = creep.goTransfer(this.resourceType, needsResources[0]);
	        }
	        else if (this.targets.length > 0) {
	            code = creep.goTransfer(this.resourceType, this.targets[0]);
	        }
	        return code;
	    }
	    scheduleCollect(creep, remainingNeededResources, needsResources) {
	        let code;
	        if (this.source != null) {
	            code = creep.goHarvest(this.source);
	        }
	        else {
	            let amount = Math.min(creep.carryCapacityRemaining, remainingNeededResources);
	            code = creep.goCollect(this.resourceType, amount, amount, false, ((needsResources.length > 0) ? needsResources[0].pos : creep.pos), this.options, _.indexBy(this.targets, 'id'));
	            if (code === task_1.ERR_NO_WORK) {
	                if (creep.carry[this.resourceType] > 0) {
	                    code = this.scheduleTransfer(creep, needsResources);
	                }
	                else {
	                    code = creep.goCollect(this.resourceType, amount, 0, false, ((needsResources.length > 0) ? needsResources[0].pos : creep.pos), this.options, _.indexBy(this.targets, 'id'));
	                }
	            }
	        }
	        return code;
	    }
	    endScheduling() {
	    }
	}
	exports.TransferResource = TransferResource;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const spawnRequest_1 = __webpack_require__(6);
	exports.NO_MORE_WORK = 123;
	exports.ERR_NO_WORK = -400;
	exports.ERR_CANNOT_PERFORM_TASK = -401;
	exports.ERR_SKIP_WORKER = -402;
	class LaborDemandType {
	    constructor(parts, min, max) {
	        this.parts = parts;
	        this.min = min;
	        this.max = max;
	        for (let name in BODYPART_COST) {
	            if (parts[name] == null) {
	                parts[name] = 0;
	            }
	        }
	    }
	}
	exports.LaborDemandType = LaborDemandType;
	class LaborDemand {
	    constructor() {
	        this.types = {};
	    }
	}
	exports.LaborDemand = LaborDemand;
	class Task {
	    constructor(isComplex) {
	        this.isComplex = isComplex;
	        this.id = "UNKNOWN";
	        this.possibleWorkers = -1; //defaults to infinite
	        this.priority = 50;
	        this.labor = new LaborDemand();
	        this.near = null;
	    }
	    getSteps() {
	        return [];
	    }
	    createAppointment(spawn, request) {
	        return null;
	    }
	    createBasicAppointment(spawn, request, near) {
	        let spawnPriority = -1;
	        let ticksTillRequired = 0;
	        let spawnDistanceFromNear = 0;
	        if (near != null) {
	            if (near.pos.x != -1 && near.pos.y != -1) {
	                spawnDistanceFromNear = (new RoomPosition(spawn.pos.x, spawn.pos.y - 1, spawn.pos.roomName)).findDistanceByPathTo(near, { ignoreCreeps: true });
	            }
	            else {
	                spawnDistanceFromNear = Game.map.getRoomLinearDistance(spawn.pos.roomName, near.pos.roomName) * 50;
	            }
	        }
	        if (spawnDistanceFromNear < 250) {
	            spawnPriority = 1 - (spawnDistanceFromNear / 250);
	        }
	        let creep = request.replacingCreep;
	        if (creep != null) {
	            let body = spawn.getBody(request.creepBody);
	            let moveTotal = 0;
	            for (let part of body) {
	                if (part === MOVE) {
	                    moveTotal++;
	                }
	            }
	            let moveRate = Math.max(1, (body.length - moveTotal) / moveTotal);
	            //console.log(creep + ' ' + creep.ticksToLive + ' - ((' + spawnDistanceFromNear + ' * ' + moveRate + ') + (' + spawn.getBody(request.creepBody).length + ' * ' + CREEP_SPAWN_TIME + '))');
	            ticksTillRequired = Math.ceil(Math.max(0, creep.ticksToLive - ((spawnDistanceFromNear * moveRate) + (body.length * CREEP_SPAWN_TIME))));
	        }
	        return new spawnRequest_1.SpawnAppointment(request.id, request.task, spawnPriority, spawn, ticksTillRequired, request.replacingCreep, request.creepBody);
	    }
	    shouldPlanToReplace(object) {
	        return true;
	    }
	    getBasicPrioritizingConditions(conditions, near, idealBody) {
	        conditions.push((creep) => {
	            // 1 - 40
	            let efficiency = creep.getEfficiencyAs(idealBody);
	            if (efficiency === 0) {
	                return -1;
	            }
	            return (creep.type === idealBody.name) ? 0.4 + (efficiency * 0.2) : (efficiency * 0.2);
	        });
	        conditions.push((creep) => {
	            let objectPriority = 0;
	            // 41 - 60
	            if (near != null && creep.pos.roomName == near.pos.roomName) {
	                objectPriority += 0.2;
	            }
	            else if (creep.task == null) {
	                objectPriority = 0.1;
	            }
	            return objectPriority;
	        });
	        if (near != null) {
	            conditions.push((creep) => {
	                return 300 - creep.pos.findDistanceByPathTo(near);
	            });
	        }
	    }
	    getPrioritizingConditions(conditions) {
	    }
	    isIdeal(object) {
	        return false;
	    }
	    beginScheduling() {
	    }
	    schedule(object) {
	        return exports.ERR_NO_WORK;
	    }
	    endScheduling() {
	    }
	}
	exports.Task = Task;


/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	class SpawnRequest {
	    constructor(id, task, replacingCreep, creepBody) {
	        this.id = id;
	        this.task = task;
	        this.replacingCreep = replacingCreep;
	        this.creepBody = creepBody;
	    }
	}
	exports.SpawnRequest = SpawnRequest;
	class SpawnAppointment {
	    constructor(id, task, spawnPriority, spawn, ticksTillRequired, replacingCreep, creepBody) {
	        this.id = id;
	        this.task = task;
	        this.spawnPriority = spawnPriority;
	        this.spawn = spawn;
	        this.ticksTillRequired = ticksTillRequired;
	        this.replacingCreep = replacingCreep;
	        this.creepBody = creepBody;
	    }
	}
	exports.SpawnAppointment = SpawnAppointment;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeClaimable_1 = __webpack_require__(8);
	const bodyDefinition_1 = __webpack_require__(9);
	const spawnRequest_1 = __webpack_require__(6);
	const sporePathFinder_1 = __webpack_require__(10);
	const sporeRemember_1 = __webpack_require__(13);
	class CollectOptions {
	    constructor(roomNames, storePriorities) {
	        this.roomNames = roomNames;
	        this.storePriorities = storePriorities;
	    }
	}
	exports.CollectOptions = CollectOptions;
	class SporeCreepMovement {
	    constructor(memory) {
	        this.memory = memory;
	    }
	    get improv() {
	        if (this._improv != null) {
	            return this._improv;
	        }
	        if (this.memory.improv != null) {
	            this._improv = new sporePathFinder_1.SporePath(this.memory.improv);
	        }
	        return this._improv;
	    }
	    set improv(value) {
	        if (value == null) {
	            if (this.memory.improv != null) {
	                this._improv = null;
	                this.memory.improv = null;
	                this.mergeIndex = -1;
	                this.pathIndex = -1;
	                this.expectedPosition = null;
	                this.failedMoveAttempts = 0;
	            }
	        }
	        else if ((this._improv == null && value != null) || (this._improv != null && !this._improv.isEqualTo(value))) {
	            this._improv = value;
	            this.memory.improv = this._improv.serialize();
	            this.mergeIndex = -1;
	            this.expectedPosition = null;
	            this.failedMoveAttempts = 0;
	        }
	    }
	    get mergeIndex() {
	        return this.memory.mergeIndex;
	    }
	    set mergeIndex(value) {
	        this.memory.mergeIndex = value;
	    }
	    get path() {
	        if (this._path != null) {
	            return this._path;
	        }
	        if (this.memory.path != null) {
	            this._path = new sporePathFinder_1.SporePath(this.memory.path);
	        }
	        return this._path;
	    }
	    set path(value) {
	        if (value == null) {
	            if (this.memory.path != null) {
	                this._path = null;
	                this.memory.path = null;
	                this.pathIndex = -1;
	                this.expectedPosition = null;
	                this.failedMoveAttempts = 0;
	                this.improv = null;
	            }
	        }
	        else if ((this._path == null && value != null) || (this._path != null && !this._path.isEqualTo(value))) {
	            this._path = value;
	            this.memory.path = this._path.serialize();
	            this.pathIndex = -1;
	            this.expectedPosition = null;
	            this.failedMoveAttempts = 0;
	            this.improv = null;
	        }
	    }
	    get pathIndex() {
	        if (this.memory.pathIndex == null || (this.memory.path == null && this.memory.improv == null)) {
	            this.memory.pathIndex = -1;
	        }
	        return this.memory.pathIndex;
	    }
	    set pathIndex(value) {
	        this.memory.pathIndex = value;
	    }
	    get expectedPosition() {
	        if (this._expectedPosition != null) {
	            return this._expectedPosition;
	        }
	        if (this.memory.expectedPosRoomName != null) {
	            this._expectedPosition = new RoomPosition(this.memory.expectedPosX, this.memory.expectedPosY, this.memory.expectedPosRoomName);
	        }
	        return this._expectedPosition;
	    }
	    set expectedPosition(value) {
	        if (value != null) {
	            this.memory.expectedPosRoomName = value.roomName;
	            this.memory.expectedPosX = value.x;
	            this.memory.expectedPosY = value.y;
	        }
	        else {
	            this.memory.expectedPosRoomName = null;
	            this.memory.expectedPosX = null;
	            this.memory.expectedPosY = null;
	        }
	    }
	    get failedMoveAttempts() {
	        return this.memory.failedMoveAttempts;
	    }
	    set failedMoveAttempts(value) {
	        this.memory.failedMoveAttempts = value;
	    }
	}
	exports.SporeCreepMovement = SporeCreepMovement;
	exports.ACTION_TRANSFER = "transfer";
	exports.ACTION_RECYCLE = "recycle";
	exports.ACTION_COLLECT = "collect";
	exports.ACTION_UPGRADE = "upgrade";
	exports.ACTION_RESERVE = "reserve";
	exports.ACTION_CLAIM = "claim";
	exports.ACTION_BUILD = "build";
	exports.ACTION_DISMANTLE = "dismantle";
	exports.ACTION_REPAIR = "repair";
	exports.ACTION_MOVE = "move";
	exports.CREEP_TYPE = {};
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('MINER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(WORK, 5, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 1, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 1, 1, 1));
	exports.CREEP_TYPE.MINER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('REMOTE_MINER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(WORK, 6, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 3, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 1, 1, 1));
	exports.CREEP_TYPE.REMOTE_MINER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('UPGRADER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(WORK, 15, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 1, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 1, 1, 1));
	exports.CREEP_TYPE.UPGRADER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('COURIER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 12, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 12, 1, 1));
	exports.CREEP_TYPE.COURIER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('REMOTE_COURIER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 9, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 16, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(WORK, 1, 1, 1));
	exports.CREEP_TYPE.REMOTE_COURIER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('CITIZEN');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(WORK, 5, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 10, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 5, 1, 1));
	exports.CREEP_TYPE.CITIZEN = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('MASON');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(WORK, 3, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 4, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 5, 1, 1));
	exports.CREEP_TYPE.MASON = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('WIRE');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 6, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 1, 1, 1));
	exports.CREEP_TYPE.WIRE = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('RESERVER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 2, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CLAIM, 2, 1, 1));
	exports.CREEP_TYPE.RESERVER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('CLAIMER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 1, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CLAIM, 1, 1, 1));
	exports.CREEP_TYPE.CLAIMER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('REMOTE_DEFENDER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(TOUGH, 2, 1, 2));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(ATTACK, 3, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(RANGED_ATTACK, 1, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 7, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(HEAL, 1, 1, 1));
	exports.CREEP_TYPE.REMOTE_DEFENDER = bodyDefinition;
	class SporeCreep extends Creep {
	    get carryCount() {
	        return _.sum(this.carry);
	    }
	    get carryCapacityRemaining() {
	        return this.carryCapacity - this.carryCount;
	    }
	    get claimReceipt() {
	        if (this._claimReceipt != null) {
	            return this._claimReceipt;
	        }
	        let memory = this.memory;
	        if (memory.claimReceiptTargetId != null) {
	            let target = Game.getObjectById(memory.claimReceiptTargetId);
	            if (target !== null) {
	                this._claimReceipt = new sporeClaimable_1.ClaimReceipt(target, memory.claimReceiptTargetType, memory.claimReceiptResourceType, memory.claimReceiptAmount);
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
	    set claimReceipt(value) {
	        this._claimReceipt = value;
	        let memory = this.memory;
	        if (value == null) {
	            delete memory.claimReceiptTargetId;
	            delete memory.claimReceiptTargetType;
	            delete memory.claimReceiptResourceType;
	            delete memory.claimReceiptAmount;
	        }
	        else {
	            memory.claimReceiptTargetId = value.target.id;
	            memory.claimReceiptTargetType = value.type;
	            memory.claimReceiptResourceType = value.resourceType;
	            memory.claimReceiptAmount = value.amount;
	        }
	    }
	    get cost() {
	        if (this.memory.cost == null) {
	            this.memory.cost = 0;
	            for (let part of this.body) {
	                this.memory.cost += BODYPART_COST[part.type];
	            }
	        }
	        return this.memory.cost;
	    }
	    set cost(value) {
	        this.memory.cost = value;
	    }
	    getEfficiencyAs(bodyDefinition) {
	        let memory = this.memory;
	        if (memory.bodyEfficiency == null) {
	            memory.bodyEfficiency = {};
	        }
	        let existingValue = memory.bodyEfficiency[bodyDefinition.name];
	        if (existingValue != null) {
	            return existingValue;
	        }
	        let totalRequiredParts = 0;
	        let totalMaxRequiredParts = 0;
	        let bodyPartsByType = _.groupBy(this.body, function (part) { return part.type; });
	        for (let requirement of bodyDefinition.requirements) {
	            let bodyParts = bodyPartsByType[requirement.type];
	            if (bodyParts == null ||
	                bodyParts.length < requirement.min) {
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
	    get type() {
	        return this.memory.type;
	    }
	    get speed() {
	        return this.memory.speed;
	    }
	    get spawnRequest() {
	        if (this._spawnRequest != null) {
	            if (this._spawnRequest.id != null) {
	                return this._spawnRequest;
	            }
	            return null;
	        }
	        let memory = this.memory;
	        this._spawnRequest = new spawnRequest_1.SpawnRequest(null, null, null, null);
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
	    set spawnRequest(value) {
	        this._spawnRequest = value;
	        let memory = this.memory;
	        if (value == null) {
	            delete memory.spawnRequest;
	        }
	        else {
	            memory.spawnRequest.id = this._spawnRequest.id;
	            if (this._spawnRequest.task != null) {
	                memory.spawnRequest.taskId = this._spawnRequest.task.id;
	            }
	            if (this._spawnRequest.replacingCreep != null) {
	                memory.spawnRequest.replacingCreepName = this._spawnRequest.replacingCreep.name;
	            }
	        }
	    }
	    get task() {
	        if (this._task != null) {
	            return this._task;
	        }
	        let memory = this.memory;
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
	    set task(value) {
	        this._task = value;
	        let memory = this.memory;
	        if (value == null) {
	            delete memory.taskId;
	            this.claimReceipt = null;
	        }
	        else {
	            memory.taskId = value.id;
	            let taskCreeps = sporeRemember_1.Remember.forTick(`${value.id}.creeps`, () => { return []; });
	            if (!_.includes(taskCreeps, this.id)) {
	                taskCreeps.push(this.id);
	            }
	        }
	    }
	    get taskPriority() {
	        if (this._taskPriority != null) {
	            return this._taskPriority;
	        }
	        let memory = this.memory;
	        if (memory.taskPriority != null) {
	            this._taskPriority = memory.taskPriority;
	        }
	        else {
	            this._taskPriority = -1;
	        }
	        return this._taskPriority;
	    }
	    set taskPriority(value) {
	        this._taskPriority = value;
	        let memory = this.memory;
	        if (value == null || value < 0) {
	            delete memory.taskPriority;
	            this._taskPriority = -1;
	        }
	        else {
	            memory.taskPriority = value;
	        }
	    }
	    get taskMetadata() {
	        if (this._taskMetadata !== undefined) {
	            return this._taskMetadata;
	        }
	        let memory = this.memory;
	        if (memory.taskMetadata != null) {
	            this._taskMetadata = memory.taskMetadata;
	        }
	        else {
	            this._taskMetadata = null;
	        }
	        return this._taskMetadata;
	    }
	    set taskMetadata(value) {
	        this._taskMetadata = value;
	        let memory = this.memory;
	        if (value == null) {
	            delete memory.taskMetadata;
	            this._taskMetadata = null;
	        }
	        else {
	            memory.taskMetadata = value;
	        }
	    }
	    get action() {
	        if (this._action != null) {
	            return this._action;
	        }
	        let memory = this.memory;
	        this._action = memory.action;
	        return this._action;
	    }
	    set action(value) {
	        this._action = value;
	        let memory = this.memory;
	        if (value == null) {
	            delete memory.action;
	        }
	        else {
	            memory.action = value;
	        }
	    }
	    get actionTarget() {
	        if (this._actionTarget != null) {
	            return this._actionTarget;
	        }
	        let memory = this.memory;
	        if (memory.actionTargetId != null) {
	            delete memory.actionTargetId;
	        }
	        this._actionTarget = memory.actionTarget;
	        if (this._actionTarget == null) {
	            this._actionTarget = '';
	            delete memory.actionTarget;
	        }
	        return this._actionTarget;
	    }
	    set actionTarget(value) {
	        this._actionTarget = value;
	        let memory = this.memory;
	        if (value == null || value.length === 0) {
	            delete memory.actionTarget;
	        }
	        else {
	            memory.actionTarget = value;
	        }
	    }
	    get movement() {
	        return sporeRemember_1.Remember.byName(`creep.${this.id}`, `movement`, () => {
	            let memory = this.memory;
	            if (memory.movement == null) {
	                memory.movement = {};
	            }
	            this._movement = new SporeCreepMovement(memory.movement);
	            return this._movement;
	        });
	    }
	    goMoveTo(target, navigation) {
	        // if this creep can't move right now then just early out
	        if (this.fatigue > 0) {
	            this.action = exports.ACTION_MOVE;
	            this.actionTarget = target.toString();
	            return OK;
	        }
	        let destination = target;
	        if (target.pos != null) {
	            destination = target.pos;
	        }
	        // if an invalid destination was provided then error out
	        if (destination == null) {
	            return task_1.ERR_NO_WORK;
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
	            navigation.direction = sporePathFinder_1.FORWARD;
	        }
	        // check to see if the creep is already in range of the target
	        if (this.pos.inRangeTo(destination, navigation.range)) {
	            this.action = exports.ACTION_MOVE;
	            this.actionTarget = target.toString();
	            return OK;
	        }
	        if (navigation.path != null) {
	            // setting a different path will also invalidate any current improv path
	            // but no changes will occur if the path is identical
	            this.movement.path = navigation.path;
	        }
	        else {
	            // clear out any previous explicit path
	            this.movement.path = null;
	        }
	        let currentPath = this.movement.improv;
	        if (currentPath == null) {
	            currentPath = this.movement.path;
	        }
	        // if the current paths don't lead to the destination...
	        if (currentPath != null && !currentPath.leadsTo(destination, navigation.direction, navigation.range)) {
	            // then clear them so we can get new ones
	            this.movement.path = null;
	            this.movement.improv = null;
	            // if an explicit path had been provided...
	            if (navigation.path != null) {
	                // then they've provided the wrong path
	                console.log("ERROR: Attempted to move to '" + target + "' but provided an explicit path to a different location. ");
	                return task_1.ERR_CANNOT_PERFORM_TASK;
	            }
	        }
	        // if the creep is not on a valid path to the destination...
	        if (this.movement.pathIndex === -1) {
	            // if we've already spent all our path finding CPU...
	            if (this.colony.cpuSpentPathing > this.colony.pathingCpuLimit) {
	                // then early out
	                this.action = exports.ACTION_MOVE;
	                this.actionTarget = target.toString();
	                return OK;
	            }
	            // create a new path to the destination
	            if (this.movement.path != null) {
	                // since the creep is not on the explicit path we need to create an improv path to get it there
	                let position = this.movement.path.findLastPositionInRoom(this.pos.roomName, navigation.direction);
	                let explicitPathPositions = this.movement.path.getPositions(this.pos.roomName);
	                let options = new sporePathFinder_1.SporePathOptions([]);
	                let creepCost = 4;
	                if (this.speed >= 5) {
	                    // this creep moves full speed on swamp
	                    options.plainCost = 2;
	                    options.swampCost = 2;
	                    options.costs.push({ id: 'path', cost: 1, targets: explicitPathPositions });
	                }
	                else if (this.speed >= 1) {
	                    // this creep moves full speed off-road
	                    options.plainCost = 2;
	                    options.swampCost = 10;
	                    creepCost = 20;
	                    options.costs.push({ id: 'path', cost: 1, targets: explicitPathPositions });
	                }
	                else {
	                    // this creep moves slowly off-road
	                    options.plainCost = 4;
	                    options.swampCost = 20;
	                    creepCost = 40;
	                    options.costs.push({ id: 'path', cost: 1, targets: explicitPathPositions });
	                    options.costs.push({ id: 'roads', cost: 2 });
	                }
	                options.costs.push({ id: 'creeps', cost: creepCost });
	                options.costs.push({ id: 'nonwalkableStructures', cost: 255 });
	                options.costs.push({ id: 'allySites', cost: 255 });
	                this.movement.improv = this.colony.pathFinder.findPathTo(this.pos, { pos: position, range: 0 }, options);
	                if (this.movement.improv != null) {
	                    // crop the improv path to where it first merges with the ideal path
	                    let intersection = this.movement.path.findIntersectionWith(this.movement.improv);
	                    if (intersection != null) {
	                        this.movement.improv.setIndexAsDestination(intersection.otherIndex);
	                        this.movement.mergeIndex = intersection.baseIndex;
	                        this.movement.pathIndex = 0;
	                    }
	                }
	            }
	            else {
	                let options = new sporePathFinder_1.SporePathOptions([]);
	                let creepCost = 4;
	                if (this.speed >= 5) {
	                    // this creep moves full speed on swamp
	                    options.plainCost = 1;
	                    options.swampCost = 1;
	                    creepCost = 2;
	                }
	                else if (this.speed >= 1) {
	                    // this creep moves full speed off-road
	                    //options.plainCost = 1;
	                    //options.swampCost = 5;
	                    creepCost = 10;
	                }
	                else {
	                    // this creep moves slowly off-road
	                    options.plainCost = 2;
	                    options.swampCost = 10;
	                    creepCost = 20;
	                    options.costs.push({ id: 'roads', cost: 1 });
	                }
	                options.costs.push({ id: 'creeps', cost: creepCost });
	                options.costs.push({ id: 'nonwalkableStructures', cost: 255 });
	                options.costs.push({ id: 'allySites', cost: 255 });
	                this.movement.improv = this.colony.pathFinder.findPathTo(this.pos, { pos: destination, range: navigation.range }, options);
	                this.movement.pathIndex = 0;
	            }
	            this.room.visual.text('\u{1F463}', this.pos);
	        }
	        currentPath = this.movement.improv;
	        if (currentPath == null) {
	            currentPath = this.movement.path;
	        }
	        // if we still don't have a valid path at this point then the destination must be unreachable
	        if (currentPath == null) {
	            //@todo check for incomplete paths?
	            return task_1.ERR_NO_WORK;
	        }
	        // check whether the last requested move was successful
	        if (this.movement.expectedPosition != null) {
	            if (this.movement.expectedPosition.isEqualTo(this.pos)) {
	                this.movement.expectedPosition = null;
	                this.movement.pathIndex++;
	                this.movement.failedMoveAttempts = 0;
	            }
	            else {
	                this.movement.expectedPosition = null;
	                this.movement.failedMoveAttempts++;
	            }
	        }
	        let visualXOffset = 0.01;
	        let visualYOffset = 0.18;
	        let style = { size: 0.45 };
	        if (this.movement.failedMoveAttempts > 0) {
	            if (this.movement.failedMoveAttempts === 1) {
	                let structures = this.room.lookForAt(LOOK_STRUCTURES, this.movement.expectedPosition);
	                for (let structure of structures) {
	                    if (_.includes(OBSTACLE_OBJECT_TYPES, structure.structureType)) {
	                        if (this.movement.path != null) {
	                            this.movement.path.needsUpdated = true;
	                        }
	                        console.log('/////////////// UNEXPECTED STRUCTURE IN PATH: ' + this.movement.improv);
	                        this.movement.improv = null;
	                        this.room.visual.text('\u{1F632}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
	                        console.log('/////////////// UNEXPECTED STRUCTURE IN PATH: ' + structure);
	                        this.action = exports.ACTION_MOVE;
	                        this.actionTarget = target.toString();
	                        return OK;
	                    }
	                }
	                this.room.visual.text('\u{1F612}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
	            }
	            else if (this.movement.failedMoveAttempts === 2) {
	                this.room.visual.text('\u{1F612}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
	            }
	            else if (this.movement.failedMoveAttempts === 3) {
	                this.room.visual.text('\u{1F623}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
	            }
	            else if (this.movement.failedMoveAttempts === 4) {
	                this.room.visual.text('\u{1F620}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
	            }
	            else if (this.movement.failedMoveAttempts >= 5) {
	                if (this.movement.path != null) {
	                    this.movement.path.needsUpdated = true;
	                }
	                this.movement.improv = null;
	                this.room.visual.text('\u{1F621}', this.pos.x + visualXOffset, this.pos.y + visualYOffset, style);
	                this.action = exports.ACTION_MOVE;
	                this.actionTarget = target.toString();
	                return OK;
	            }
	        }
	        let nextDirection = currentPath.getNextMove(this.movement.pathIndex);
	        if (nextDirection <= 0) {
	            if (this.movement.improv != null && this.movement.mergeIndex >= 0) {
	                this.movement.improv = null;
	                this.movement.pathIndex = this.movement.mergeIndex;
	                this.movement.mergeIndex = -1;
	            }
	            else {
	                if (this.movement.path != null) {
	                    this.movement.path.needsUpdated = true;
	                }
	                this.movement.improv = null;
	                console.log("ERROR: Attempted to move to '" + target + "' but encountered an unexpected end to that path. ");
	                return task_1.ERR_CANNOT_PERFORM_TASK;
	            }
	        }
	        let code = this.move(nextDirection);
	        if (this.doTrack) {
	            console.log(this + " goMoveTo " + code);
	        }
	        if (code == OK) {
	            this.movement.expectedPosition = sporePathFinder_1.SporePathFinder.getNextPositionByDirection(this.pos, nextDirection);
	            this.action = exports.ACTION_MOVE;
	            this.actionTarget = target.toString();
	            return OK;
	        }
	        this.movement.expectedPosition = null;
	        if (code == ERR_INVALID_TARGET) {
	            return task_1.ERR_NO_WORK;
	        }
	        // ERR_NOT_OWNER	-1	You are not the owner of this creep.
	        // ERR_BUSY	-4	The creep is still being spawned.
	        // ERR_NO_BODYPART	-12	There are no MOVE body parts in this creep’s body.
	        console.log("ERROR: Attempted to move to '" + target + "' but encountered unknown error. " + code);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goHarvest(source, navigation) {
	        if (!source.isValid) {
	            return ERR_INVALID_TARGET;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (source.isShrouded) {
	            code = this.goMoveTo(source, navigation);
	        }
	        else {
	            let claimReceipt = source.instance.makeClaim(this, RESOURCE_ENERGY, this.carryCapacityRemaining, this.carryCapacityRemaining, true);
	            if (claimReceipt == null) {
	                return task_1.ERR_NO_WORK;
	            }
	            this.claimReceipt = claimReceipt;
	            code = claimReceipt.target.collect(this, claimReceipt);
	            if (code === OK) {
	                this.action = exports.ACTION_COLLECT;
	                this.actionTarget = claimReceipt != null ? claimReceipt.target.toString() : null;
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                code = this.goMoveTo(claimReceipt.target, navigation);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        if (code === ERR_NOT_ENOUGH_RESOURCES ||
	            code === ERR_INVALID_TARGET) {
	            return task_1.ERR_NO_WORK;
	        }
	        console.log("ERROR: Attempted to harvest '" + source + "' but encountered unknown error. " + code);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goTransfer(resourceType, target, navigation) {
	        if (!target.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (target.isShrouded) {
	            code = this.goMoveTo(target, navigation);
	        }
	        else {
	            code = this.transfer(target.instance, resourceType);
	            if (code == OK) {
	                this.action = exports.ACTION_TRANSFER;
	                this.actionTarget = target.toString();
	                return OK;
	            }
	            else if (code == ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(target, navigation);
	            }
	        }
	        if (this.doTrack) {
	            console.log(this + " goTransfer " + code);
	        }
	        if (code == OK) {
	            return OK;
	        }
	        if (code == ERR_FULL) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (code == ERR_NOT_OWNER) {
	            console.log("ERROR: Attempted to transfer '" + resourceType + "' from another player's creep");
	            return task_1.ERR_NO_WORK;
	        }
	        if (code == ERR_INVALID_TARGET) {
	            console.log("ERROR: Attempted to transfer '" + resourceType + "' to an invalid target " + target);
	            return task_1.ERR_NO_WORK;
	        }
	        if (code == ERR_BUSY) {
	            console.log("ERROR: Attempted to transfer '" + resourceType + "' to a creep that hasn't spawned yet");
	            return task_1.ERR_NO_WORK;
	        }
	        if (code == ERR_INVALID_ARGS) {
	            console.log("ERROR: Attempted to transfer an invalid amount of '" + resourceType + "' to a target");
	            return task_1.ERR_NO_WORK;
	        }
	        //ERR_NOT_ENOUGH_RESOURCES	-6	The creep does not have the given amount of resources.
	        console.log("ERROR: Attempted to transfer '" + resourceType + "' to '" + target + "' but encountered unknown error. " + code);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goBuild(site, navigation) {
	        if (!site.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (this.getActiveBodyparts(WORK) === 0) {
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (site.isShrouded) {
	            code = this.goMoveTo(site, navigation);
	        }
	        else {
	            code = this.build(site.instance);
	            if (code === OK) {
	                this.action = exports.ACTION_BUILD;
	                this.actionTarget = site.toString();
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                code = this.goMoveTo(site, navigation);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        if (code == ERR_NOT_ENOUGH_RESOURCES ||
	            code == ERR_INVALID_TARGET ||
	            code == ERR_RCL_NOT_ENOUGH) {
	            return task_1.ERR_NO_WORK;
	        }
	        // ERR_NOT_OWNER
	        // ERR_BUSY
	        // ERR_NO_BODYPART
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goDismantle(structure, navigation) {
	        if (!structure.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let canWork = this.getActiveBodyparts(WORK) > 0;
	        let canAttack = this.getActiveBodyparts(ATTACK) > 0;
	        let canRangeAttack = this.getActiveBodyparts(RANGED_ATTACK) > 0;
	        if (!canAttack && !canWork && !canRangeAttack) {
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (structure.isShrouded) {
	            code = this.goMoveTo(structure, navigation);
	        }
	        else {
	            structure.instance.notifyWhenAttacked(false);
	            if (canWork) {
	                code = this.dismantle(structure.instance);
	            }
	            else if (canAttack) {
	                code = this.attack(structure.instance);
	            }
	            else if (canRangeAttack) {
	                code = this.rangedAttack(structure.instance);
	            }
	            else {
	                return task_1.ERR_CANNOT_PERFORM_TASK;
	            }
	            if (code === OK) {
	                this.action = exports.ACTION_DISMANTLE;
	                this.actionTarget = structure.toString();
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
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
	            return task_1.ERR_NO_WORK;
	        }
	        // ERR_NOT_OWNER
	        // ERR_BUSY
	        // ERR_NO_BODYPART
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goRepair(structure, navigation) {
	        if (!structure.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (structure.isShrouded) {
	            code = this.goMoveTo(structure, navigation);
	        }
	        else {
	            code = this.repair(structure.instance);
	            if (code === OK) {
	                this.action = exports.ACTION_REPAIR;
	                this.actionTarget = structure.toString();
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(structure, navigation);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        if (code === ERR_INVALID_TARGET) {
	            return task_1.ERR_NO_WORK;
	        }
	        console.log("Creep " + this.name + " goRepair error code: " + code);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goCollect(resourceType, amount, minAmount, isExtended, near, options, excludes, navigation) {
	        if (this.action != exports.ACTION_COLLECT && this.action != exports.ACTION_MOVE) {
	            this.claimReceipt = null;
	        }
	        let claimReceipt = this.colony.claimResource(this, resourceType, amount, minAmount, isExtended, near, options, excludes, this.claimReceipt);
	        if (claimReceipt == null) {
	            return task_1.ERR_NO_WORK;
	        }
	        this.claimReceipt = claimReceipt;
	        let code = claimReceipt.target.collect(this, claimReceipt);
	        if (code === OK) {
	            this.action = exports.ACTION_COLLECT;
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
	            console.log("FAILED TO CONFIRM AVAILABLE RESOURCES BEFORE COLLECTING. " + this + " " + claimReceipt.target + " " + claimReceipt.amount + " " + claimReceipt.resourceType);
	            return task_1.ERR_NO_WORK;
	        }
	        console.log(code);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goUpgrade(controller, navigation) {
	        if (!controller.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (controller.isShrouded) {
	            code = this.goMoveTo(controller, navigation);
	        }
	        else {
	            code = this.upgradeController(controller.instance);
	            if (code === OK) {
	                this.action = exports.ACTION_UPGRADE;
	                this.actionTarget = controller.toString();
	                this.claimReceipt = null;
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(controller, navigation);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        console.log("goUpgrade error code: " + code + " " + this);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goReserve(controller, navigation) {
	        if (!controller.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (controller.isShrouded) {
	            code = this.goMoveTo(controller, navigation);
	        }
	        else {
	            code = this.reserveController(controller.instance);
	            if (code === OK) {
	                this.action = exports.ACTION_RESERVE;
	                this.actionTarget = controller.toString();
	                this.claimReceipt = null;
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(controller, navigation);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        console.log("goReserve error code: " + code + " " + this);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goClaim(controller, navigation) {
	        if (!controller.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (controller.isShrouded) {
	            code = this.goMoveTo(controller, navigation);
	        }
	        else {
	            code = this.claimController(controller.instance);
	            if (code === OK) {
	                this.action = exports.ACTION_CLAIM;
	                this.actionTarget = controller.toString();
	                this.claimReceipt = null;
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(controller, navigation);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        console.log("goClaim error code: " + code + " " + this);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goRecycle(spawn, navigation) {
	        if (!spawn.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (spawn.isShrouded) {
	            code = this.goMoveTo(spawn, navigation);
	        }
	        else {
	            code = spawn.instance.recycleCreep(this);
	            if (code === OK) {
	                this.action = exports.ACTION_RECYCLE;
	                this.actionTarget = spawn.toString();
	                this.claimReceipt = null;
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(spawn, navigation);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        console.log("goRecycle error code: " + code);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	}
	exports.SporeCreep = SporeCreep;


/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	class ClaimReceipt {
	    constructor(target, type, resourceType, amount) {
	        this.target = target;
	        this.type = type;
	        this.resourceType = resourceType;
	        this.amount = amount;
	    }
	}
	exports.ClaimReceipt = ClaimReceipt;


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	class BodyDefinition {
	    constructor(name) {
	        this.name = name;
	        this.requirements = [];
	    }
	    getPossibleParts(part) {
	        for (let requirement of this.requirements) {
	            if (requirement.type === part) {
	                return requirement.max;
	            }
	        }
	        return 0;
	    }
	}
	exports.BodyDefinition = BodyDefinition;
	class BodyPartRequirements {
	    constructor(type, max, min, increment) {
	        this.type = type;
	        this.max = max;
	        this.min = min;
	        this.increment = increment;
	    }
	}
	exports.BodyPartRequirements = BodyPartRequirements;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeCostMatrix_1 = __webpack_require__(11);
	const sporeRoomPosition_1 = __webpack_require__(12);
	class SporePathOptions {
	    constructor(costs, persist) {
	        this.costs = costs;
	        this.persist = persist;
	        this.plainCost = 1;
	        this.swampCost = 5;
	        this.maxRooms = 16;
	        this.maxOps = 2000;
	    }
	}
	SporePathOptions.Default = new SporePathOptions([], null);
	exports.SporePathOptions = SporePathOptions;
	class SporePath {
	    constructor(memory) {
	        this.memory = memory;
	        if (memory.rooms == null) {
	            this._cacheRoomBoundaries();
	        }
	    }
	    get ops() {
	        return this.memory.ops;
	    }
	    get cost() {
	        return this.memory.cost;
	    }
	    get incomplete() {
	        return this.memory.incomplete === true;
	    }
	    get needsUpdated() {
	        return this.memory.needsUpdated;
	    }
	    set needsUpdated(value) {
	        this.memory.needsUpdated = value;
	    }
	    get start() {
	        if (this._start != null) {
	            return this._start;
	        }
	        this._start = sporeRoomPosition_1.SporeRoomPosition.deserialize(this.memory.start);
	        return this._start;
	    }
	    get end() {
	        if (this._end != null) {
	            return this._end;
	        }
	        this._end = sporeRoomPosition_1.SporeRoomPosition.deserialize(this.memory.end);
	        return this._end;
	    }
	    getNextMove(index) {
	        if (index >= 0 && index < this.memory.directions.length) {
	            return +(this.memory.directions[index]);
	        }
	        return 0;
	    }
	    getPositions(roomName) {
	        if (this._positions != null) {
	            return _.filter(this._positions, { 'roomName': roomName });
	        }
	        if (this.memory.rooms[roomName] == null) {
	            return [];
	        }
	        let result = [];
	        let lastRoomPosition = sporeRoomPosition_1.SporeRoomPosition.deserialize(this.memory.rooms[roomName].entrance);
	        let index = this.memory.rooms[roomName].entranceIndex;
	        for (; index < this.memory.directions.length; ++index) {
	            result.push(lastRoomPosition);
	            let direction = +this.memory.directions[index];
	            lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
	        }
	        result.push(lastRoomPosition);
	        return result;
	    }
	    findLastPositionInRoom(roomName, direction) {
	        if (direction === exports.FORWARD) {
	            if (this.memory.rooms[roomName].exit == null) {
	                if (this.end.roomName === roomName) {
	                    return this.end;
	                }
	                else {
	                    return null;
	                }
	            }
	            return sporeRoomPosition_1.SporeRoomPosition.deserialize(this.memory.rooms[roomName].exit);
	        }
	        else if (direction === exports.REVERSE) {
	            if (this.memory.rooms[roomName].entrance == null) {
	                if (this.start.roomName === roomName) {
	                    return this.start;
	                }
	                else {
	                    return null;
	                }
	            }
	            return sporeRoomPosition_1.SporeRoomPosition.deserialize(this.memory.rooms[roomName].entrance);
	        }
	        return null;
	    }
	    getSubPath(roomName) {
	        let startIndex = this.memory.rooms[roomName].entranceIndex;
	        let start = this.memory.rooms[roomName].entrance;
	        if (start == null) {
	            startIndex = 0;
	            start = this.memory.start;
	        }
	        let endIndex = this.memory.rooms[roomName].exitIndex;
	        let end = this.memory.rooms[roomName].exit;
	        if (end == null) {
	            endIndex = this.memory.directions.length;
	            end = this.memory.end;
	        }
	        let directions = this.memory.directions.substring(startIndex, endIndex);
	        return new SporePath({
	            ops: -1,
	            cost: -1,
	            start: start,
	            end: end,
	            directions: directions,
	            rooms: {},
	            tickCalculated: this.memory.tickCalculated,
	            tickLifespan: this.memory.tickLifespan,
	            needsUpdated: false
	        });
	    }
	    findIntersectionWith(other) {
	        //@todo make this faster?
	        let lastRoomPosition = other.start;
	        for (let otherIndex = 0; otherIndex < other.memory.directions.length; ++otherIndex) {
	            let direction = +this.memory.directions[otherIndex];
	            lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
	            let baseIndex = this._getIndexOnPath(lastRoomPosition);
	            if (baseIndex >= 0) {
	                return { baseIndex: baseIndex, otherIndex: otherIndex };
	            }
	        }
	        return null;
	    }
	    _getIndexOnPath(pos) {
	        if (this._positionsMap == null) {
	            this._positionsMap = {};
	            let lastRoomPosition = this.start;
	            for (let index = 0; index < this.memory.directions.length; ++index) {
	                this._cachePositionToMap(lastRoomPosition, index);
	                let direction = +this.memory.directions[index];
	                lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
	            }
	            this._cachePositionToMap(lastRoomPosition, this.memory.directions.length);
	        }
	        let map = this._positionsMap[pos.x];
	        if (map == null) {
	            return -1;
	        }
	        map = map[pos.y];
	        if (map == null) {
	            return -1;
	        }
	        map = map[pos.roomName];
	        if (map == null) {
	            return -1;
	        }
	        return map;
	    }
	    _cachePositionToMap(pos, index) {
	        let x = this._positionsMap[pos.x];
	        if (x == null) {
	            let roomName = {};
	            roomName[pos.roomName] = index;
	            this._positionsMap[pos.x] = { [pos.y]: roomName };
	        }
	        let y = x[pos.y];
	        if (y == null) {
	            let roomName = {};
	            roomName[pos.roomName] = index;
	            x[pos.y] = roomName;
	        }
	        if (y[pos.roomName] == null) {
	            y[pos.roomName] = index;
	        }
	    }
	    _cacheRoomBoundaries() {
	        this.memory.rooms = {};
	        // assuming that a creep won't walk along the room edge
	        // we can then assume any position at 0 or 50 is an entrance or exit
	        let lastRoomPosition = this.start;
	        for (let index = 0; index < this.memory.directions.length; ++index) {
	            if (lastRoomPosition.x === 0 || lastRoomPosition.x === 50 ||
	                lastRoomPosition.y === 0 || lastRoomPosition.y === 50) {
	                if (this.memory.rooms[lastRoomPosition.roomName] == null) {
	                    this.memory.rooms[lastRoomPosition.roomName] = {};
	                }
	                if (this.memory.rooms[lastRoomPosition.roomName].entrance == null) {
	                    this.memory.rooms[lastRoomPosition.roomName].entrance = sporeRoomPosition_1.SporeRoomPosition.serialize(lastRoomPosition);
	                    this.memory.rooms[lastRoomPosition.roomName].entranceIndex = index;
	                }
	                else if (this.memory.rooms[lastRoomPosition.roomName].exit == null) {
	                    this.memory.rooms[lastRoomPosition.roomName].exit = sporeRoomPosition_1.SporeRoomPosition.serialize(lastRoomPosition);
	                    this.memory.rooms[lastRoomPosition.roomName].exitIndex = index;
	                }
	                else {
	                    console.log('///////////////////////////////// ERROR CACHING ROOM BOUNDARIES');
	                }
	            }
	            let direction = +this.memory.directions[index];
	            lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
	        }
	    }
	    setIndexAsDestination(index) {
	        this.memory.directions = this.memory.directions.substr(0, index);
	        let lastRoomPosition = this.start;
	        for (let index = 0; index < this.memory.directions.length; ++index) {
	            this._cachePositionToMap(lastRoomPosition, index);
	            let direction = +this.memory.directions[index];
	            lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
	        }
	    }
	    leadsTo(pos, direction, range) {
	        if (direction === exports.FORWARD) {
	            return this.end.inRangeTo(pos, range);
	        }
	        else if (direction === exports.REVERSE) {
	            return this.start.inRangeTo(pos, range);
	        }
	        return false;
	    }
	    isEqualTo(other) {
	        return !!(this.memory.start === other.memory.start &&
	            this.memory.end === other.memory.end &&
	            this.memory.directions === other.memory.directions);
	    }
	    serialize() {
	        return this.memory;
	    }
	}
	exports.SporePath = SporePath;
	exports.NON_WALKABLE = 255;
	exports.FORWARD = 1;
	exports.REVERSE = -1;
	exports.DIRECTION_OFFSETS = [];
	exports.DIRECTION_OFFSETS.push({ x: 0, y: 0 }); // NONE
	exports.DIRECTION_OFFSETS.push({ x: 0, y: -1 }); // TOP
	exports.DIRECTION_OFFSETS.push({ x: 1, y: -1 }); // TOP_RIGHT
	exports.DIRECTION_OFFSETS.push({ x: 1, y: 0 }); // RIGHT
	exports.DIRECTION_OFFSETS.push({ x: 1, y: 1 }); // BOTTOM_RIGHT
	exports.DIRECTION_OFFSETS.push({ x: 0, y: 1 }); // BOTTOM
	exports.DIRECTION_OFFSETS.push({ x: -1, y: 1 }); // BOTTOM_LEFT
	exports.DIRECTION_OFFSETS.push({ x: -1, y: 0 }); // LEFT
	exports.DIRECTION_OFFSETS.push({ x: -1, y: -1 }); // TOP_LEFT
	exports.OFFSETS_DIRECTION = [];
	exports.OFFSETS_DIRECTION.push([]);
	exports.OFFSETS_DIRECTION[0].push(TOP_LEFT);
	exports.OFFSETS_DIRECTION[0].push(LEFT);
	exports.OFFSETS_DIRECTION[0].push(BOTTOM_LEFT);
	exports.OFFSETS_DIRECTION.push([]);
	exports.OFFSETS_DIRECTION[1].push(TOP);
	exports.OFFSETS_DIRECTION[1].push(0);
	exports.OFFSETS_DIRECTION[1].push(BOTTOM);
	exports.OFFSETS_DIRECTION.push([]);
	exports.OFFSETS_DIRECTION[2].push(TOP_RIGHT);
	exports.OFFSETS_DIRECTION[2].push(RIGHT);
	exports.OFFSETS_DIRECTION[2].push(BOTTOM_RIGHT);
	class SporePathFinder {
	    constructor() {
	        this._costMatrixCache = new sporeCostMatrix_1.SporeCostMatrixCache();
	        this._pathCache = {};
	        let paths = Memory.paths;
	        if (paths == null) {
	            Memory.paths = {};
	            paths = Memory.paths;
	        }
	        let pathIds = Object.keys(paths);
	        for (let pathId in pathIds) {
	            let path = paths[pathId];
	            if (path.tickLifespan >= Game.time - path.tickCalculated) {
	                this._pathCache[pathId] = path; // we'll deserialize the path on demand
	            }
	            else {
	                delete paths[pathId];
	            }
	        }
	    }
	    static serializeDirections(start, path) {
	        if (path == null || path.length === 0) {
	            return '';
	        }
	        let value = '';
	        value += exports.OFFSETS_DIRECTION[(path[0].x - start.x) + 1][(path[0].y - start.y) + 1];
	        for (let index = 1; index < path.length; ++index) {
	            // 49 -> 0
	            // 0 -> 49
	            value += exports.OFFSETS_DIRECTION[Math.min(Math.max((path[index].x - path[index - 1].x), -1), 1) + 1][Math.min(Math.max((path[index].y - path[index - 1].y), -1), 1) + 1];
	        }
	        return value;
	    }
	    static deserializeDirections(value, start) {
	        let path = [];
	        if (value == null || value.length === 0) {
	            return path;
	        }
	        let lastRoomPosition = start;
	        path.push(lastRoomPosition);
	        for (let index = 0; index < value.length; ++index) {
	            let direction = +value[index];
	            lastRoomPosition = SporePathFinder.getNextPositionByDirection(lastRoomPosition, direction);
	            path.push(lastRoomPosition);
	        }
	        return path;
	    }
	    static getNextPositionByDirection(pos, direction) {
	        let transitionedRooms = false;
	        let offsets = exports.DIRECTION_OFFSETS[direction];
	        let roomXOffset = 0;
	        let roomYOffset = 0;
	        let x = pos.x + offsets.x;
	        let y = pos.y + offsets.y;
	        let roomName = pos.roomName;
	        if (x >= 49) {
	            x = 0;
	            ++roomXOffset;
	            transitionedRooms = true;
	        }
	        else if (x <= 0) {
	            x = 49;
	            --roomXOffset;
	            transitionedRooms = true;
	        }
	        if (y >= 49) {
	            y = 0;
	            ++roomYOffset;
	            transitionedRooms = true;
	        }
	        else if (y <= 0) {
	            y = 49;
	            --roomYOffset;
	            transitionedRooms = true;
	        }
	        if (transitionedRooms) {
	            let horizontalRoomDirection = pos.roomName[0];
	            let verticalRoomDirectionIndex = pos.roomName.indexOf('N');
	            if (verticalRoomDirectionIndex === -1) {
	                verticalRoomDirectionIndex = pos.roomName.indexOf('S');
	            }
	            let verticalRoomDirection = pos.roomName.slice(verticalRoomDirectionIndex, 1);
	            let roomX = +pos.roomName.substring(1, verticalRoomDirectionIndex);
	            let roomY = +pos.roomName.substring(verticalRoomDirectionIndex + 1, pos.roomName.length);
	            if (roomX < 0) {
	                if (horizontalRoomDirection === 'E') {
	                    horizontalRoomDirection = 'W';
	                }
	                else {
	                    horizontalRoomDirection = 'E';
	                }
	            }
	            if (roomY < 0) {
	                if (verticalRoomDirection === 'N') {
	                    verticalRoomDirection = 'S';
	                }
	                else {
	                    horizontalRoomDirection = 'N';
	                }
	            }
	            roomName = horizontalRoomDirection + (roomX + roomXOffset) + verticalRoomDirection + (roomY + roomYOffset);
	        }
	        return new RoomPosition(x, y, roomName);
	    }
	    findPathTo(origin, goals, options) {
	        if (options == null) {
	            options = SporePathOptions.Default;
	        }
	        let persistId = options.persist;
	        let persistTicks = 0;
	        // if (options.persist != null && (<any>options.persist).id != null)
	        // {
	        //     persistId = (<any>options.persist).id;
	        //     persistTicks = (<any>options.persist).ticks;
	        // }
	        //
	        // if (persistId == null || persistId.length === 0)
	        // {
	        //     persistId = _.join(_.map(options.costs, function(cost: SporeCostMatrixOption){ return cost.id; }));
	        //     persistTicks = 0;
	        // }
	        let path; // = this._pathCache[persistId];
	        if (path != null) {
	            return path;
	        }
	        console.log('//////////// New Path ');
	        let rawPath = PathFinder.search(origin, goals, {
	            plainCost: options.plainCost,
	            swampCost: options.swampCost,
	            roomCallback: function (roomName) {
	                return this._costMatrixCache.findCostMatrix(roomName, options.costs);
	            }.bind(this)
	        });
	        if (rawPath.path == null || rawPath.path.length === 0) {
	            return null;
	        }
	        let pathMemory = {
	            ops: rawPath.ops,
	            cost: rawPath.cost,
	            incomplete: rawPath.incomplete,
	            start: origin.serialize(),
	            end: rawPath.path[rawPath.path.length - 1].serialize(),
	            directions: SporePathFinder.serializeDirections(origin, rawPath.path),
	            rooms: {},
	            tickCalculated: Game.time,
	            tickLifespan: persistTicks,
	            needsUpdated: false
	        };
	        path = new SporePath(pathMemory);
	        path._positions = rawPath.path;
	        // if (persistId != null && persistId.length > 0)
	        // {
	        //     this._pathCache[persistId] = path;
	        //
	        //     if (persistTicks > 0)
	        //     {
	        //         Memory.paths[persistId] = pathMemory
	        //     }
	        // }
	        return path;
	    }
	}
	exports.SporePathFinder = SporePathFinder;


/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";
	class SporeCostMatrixCache {
	    constructor() {
	        this.rootNode = new CostMatrixNode('', null);
	    }
	    findCostMatrix(roomName, options) {
	        if (options == null || options.length === 0) {
	            return null;
	        }
	        let room = Game.rooms[roomName];
	        let currentNode = this.rootNode;
	        for (let option of options) {
	            let matchingChild = null;
	            if (currentNode.children == null) {
	                currentNode.children = [];
	            }
	            for (let node of currentNode.children) {
	                if (node.id === option.id) {
	                    matchingChild = node;
	                    break;
	                }
	            }
	            if (matchingChild == null) {
	                let newCostMatrix = currentNode.value;
	                if (newCostMatrix == null) {
	                    newCostMatrix = new PathFinder.CostMatrix();
	                }
	                let targets = option.targets;
	                if (targets == null && room != null) {
	                    targets = room[option.id];
	                    if (typeof targets === 'function') {
	                        targets = targets();
	                    }
	                }
	                if (targets != null) {
	                    for (let target of targets) {
	                        if (target instanceof RoomPosition) {
	                            newCostMatrix.set(target.x, target.y, option.cost);
	                        }
	                        else {
	                            newCostMatrix.set(target.pos.x, target.pos.y, option.cost);
	                        }
	                    }
	                }
	                console.log('//////////// New Cost Matrix: ' + option.id);
	                let newChild = new CostMatrixNode(option.id, newCostMatrix);
	                currentNode.children.push(newChild);
	                matchingChild = newChild;
	            }
	            currentNode = matchingChild;
	        }
	        return currentNode.value;
	    }
	}
	exports.SporeCostMatrixCache = SporeCostMatrixCache;
	class CostMatrixNode {
	    constructor(id, value) {
	        this.id = id;
	        this.value = value;
	    }
	}


/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	class SporeRoomPosition extends RoomPosition {
	    static serialize(pos) {
	        return pos.x + ',' + pos.y + ',' + pos.roomName;
	    }
	    serialize() {
	        return this.x + ',' + this.y + ',' + this.roomName;
	    }
	    static deserialize(value) {
	        let parameters = value.split(',');
	        return new RoomPosition(+parameters[0], +parameters[1], parameters[2]);
	    }
	    sortByRangeTo(targets) {
	        let cachedRange = {};
	        targets.sort(function (a, b) {
	            let rangeA = cachedRange[a.id];
	            if (rangeA == null) {
	                rangeA = this.getRangeTo(a);
	                if (rangeA == null) {
	                    rangeA = Game.map.getRoomLinearDistance(this.roomName, a.roomName) * 50;
	                }
	                cachedRange[a.id] = rangeA;
	            }
	            let rangeB = cachedRange[b.id];
	            if (rangeB == null) {
	                rangeB = this.getRangeTo(b);
	                if (rangeB == null) {
	                    rangeB = Game.map.getRoomLinearDistance(this.roomName, b.roomName) * 50;
	                }
	                cachedRange[b.id] = rangeB;
	            }
	            if (rangeA < rangeB) {
	                return -1;
	            }
	            if (rangeA > rangeB) {
	                return 1;
	            }
	            return 0;
	        }.bind(this));
	    }
	    findDistanceByPathTo(other, opts) {
	        //console.log('///////////////////// ' + this + " -> " + other);
	        let target = other;
	        if (!(other instanceof RoomPosition)) {
	            target = other.pos;
	        }
	        let result = PathFinder.search(this, { pos: target, range: 1 });
	        return result.path.length;
	    }
	    findFirstInRange(targets, range) {
	        for (let index = 0; index < targets.length; index++) {
	            let target = targets[index];
	            if (this.inRangeTo(target.pos, range)) {
	                return target;
	            }
	        }
	        return null;
	    }
	    findClosestInRange(targets, range) {
	        let closestTargetRange = 500;
	        let closestTarget = null;
	        for (let index = 0; index < targets.length; index++) {
	            let target = targets[index];
	            let range = this.getRangeTo(target.pos);
	            if (range < closestTargetRange) {
	                closestTargetRange = range;
	                closestTarget = target;
	            }
	        }
	        if (closestTargetRange <= range) {
	            return closestTarget;
	        }
	        return null;
	    }
	    getWalkableSurroundingArea() {
	        let availableSlots = 0;
	        let room = Game.rooms[this.roomName];
	        if (_.isNull(room)) {
	            for (var xOffset = -1; xOffset < 2; xOffset++) {
	                for (var yOffset = -1; yOffset < 2; yOffset++) {
	                    if (xOffset == 0 && yOffset == 0) {
	                        continue;
	                    }
	                    if (Game.map.getTerrainAt(this.x + xOffset, this.y + yOffset, this.roomName) != "wall") {
	                        availableSlots++;
	                    }
	                }
	            }
	        }
	        else {
	            let lookResults = room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);
	            for (var xOffset = -1; xOffset < 2; xOffset++) {
	                for (var yOffset = -1; yOffset < 2; yOffset++) {
	                    if (xOffset == 0 && yOffset == 0) {
	                        continue;
	                    }
	                    let resultArray = lookResults[this.y + yOffset][this.x + xOffset];
	                    let hasObstacle = false;
	                    for (let result of resultArray) {
	                        if (_.includes(OBSTACLE_OBJECT_TYPES, result[result.type])) {
	                            hasObstacle = true;
	                            break;
	                        }
	                    }
	                    if (hasObstacle === false) {
	                        availableSlots++;
	                    }
	                }
	            }
	        }
	        return availableSlots;
	    }
	    getWalkableSurroundingAreaInRange(target, range) {
	        let availableSlots = [];
	        let room = Game.rooms[this.roomName];
	        if (_.isNull(room)) {
	            for (var xOffset = -1; xOffset < 2; xOffset++) {
	                for (var yOffset = -1; yOffset < 2; yOffset++) {
	                    if (xOffset == 0 && yOffset == 0) {
	                        continue;
	                    }
	                    if (Game.map.getTerrainAt(this.x + xOffset, this.y + yOffset, this.roomName) != "wall") {
	                        let pos = new RoomPosition(this.x + xOffset, this.y + yOffset, target.roomName);
	                        if (target.inRangeTo(pos, range)) {
	                            availableSlots.push(pos);
	                        }
	                    }
	                }
	            }
	        }
	        else {
	            let lookResults = room.lookAtArea(this.y - 1, this.x - 1, this.y + 1, this.x + 1);
	            for (var xOffset = -1; xOffset < 2; xOffset++) {
	                for (var yOffset = -1; yOffset < 2; yOffset++) {
	                    if (xOffset == 0 && yOffset == 0) {
	                        continue;
	                    }
	                    let resultArray = lookResults[this.y + yOffset][this.x + xOffset];
	                    let hasObstacle = false;
	                    for (let result of resultArray) {
	                        if (_.includes(OBSTACLE_OBJECT_TYPES, result[result.type])) {
	                            hasObstacle = true;
	                            break;
	                        }
	                    }
	                    if (hasObstacle === false) {
	                        let pos = new RoomPosition(this.x + xOffset, this.y + yOffset, target.roomName);
	                        if (target.inRangeTo(pos, range)) {
	                            availableSlots.push(pos);
	                        }
	                    }
	                }
	            }
	        }
	        return availableSlots;
	    }
	}
	exports.SporeRoomPosition = SporeRoomPosition;


/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";
	class Remember {
	    static byName(groupName, dataPath, getter, reset) {
	        if (this.groupData[groupName] == null) {
	            this.groupData[groupName] = {};
	        }
	        return Remember.getData(this.groupData[groupName], dataPath, getter, reset);
	    }
	    static forTick(dataPath, getter, reset) {
	        return Remember.getData(Remember.tickData, dataPath, getter, reset);
	    }
	    static lastTick(dataPath) {
	        if (Memory.previousTick == null) {
	            return null;
	        }
	        return Remember.getData(Memory.previousTick, dataPath, null, null);
	    }
	    static forever(dataPath, getter, reset) {
	        return Remember.getData(Memory, dataPath, getter, reset);
	    }
	    static beginTick() {
	        this.tickData = {};
	        this.groupData = {};
	    }
	    static endTick() {
	        Memory.previousTick = this.tickData;
	    }
	    static getData(obj, dataPath, getter, reset) {
	        let pathArr = dataPath.split('.');
	        let pathNum = pathArr.length;
	        for (let idx = 0; idx < pathNum - 1; idx++) {
	            let member = pathArr[idx];
	            obj = obj[member] || (obj[member] = {});
	        }
	        if (getter != null) {
	            obj = reset ? (obj[pathArr[pathNum - 1]] = getter()) : (obj[pathArr[pathNum - 1]] || (obj[pathArr[pathNum - 1]] = getter()));
	        }
	        else if (obj != null) {
	            obj = obj[pathArr[pathNum - 1]];
	        }
	        return obj;
	    }
	}
	Remember.tickData = {};
	Remember.groupData = {};
	exports.Remember = Remember;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class UpgradeRoomController extends task_1.Task {
	    constructor(controller) {
	        super(false);
	        this.controller = controller;
	        this.collectOptions = new sporeCreep_1.CollectOptions([], [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]);
	        this.claimable = null;
	        this.id = "Upgrade " + controller;
	        this.name = "Upgrade " + controller.toHtml();
	        this.possibleWorkers = -1;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        this.roomName = controller.pos.roomName;
	        this.priority = 0 /* Low */;
	        this.near = controller;
	        this.upgraderSlots = [];
	        this.remainingUpgraderSlots = [];
	        if (!controller.isShrouded) {
	            let area = controller.instance.room.lookForByRadiusAt(LOOK_STRUCTURES, controller.instance, 4, true);
	            for (let pos of area) {
	                if (pos.structure.structureType === STRUCTURE_STORAGE) {
	                    this.idealCreepBody = sporeCreep_1.CREEP_TYPE.UPGRADER;
	                    this.upgraderSlots = pos.structure.pos.getWalkableSurroundingAreaInRange(controller.instance.pos, 3);
	                    this.claimable = pos.structure;
	                    break;
	                }
	                if (pos.structure.structureType === STRUCTURE_LINK) {
	                    this.idealCreepBody = sporeCreep_1.CREEP_TYPE.UPGRADER;
	                    this.upgraderSlots = pos.structure.pos.getWalkableSurroundingAreaInRange(controller.instance.pos, 3);
	                    this.claimable = pos.structure;
	                }
	                else if (pos.structure.structureType === STRUCTURE_CONTAINER && this.near === controller) {
	                    this.idealCreepBody = sporeCreep_1.CREEP_TYPE.UPGRADER;
	                    this.upgraderSlots = pos.structure.pos.getWalkableSurroundingAreaInRange(controller.instance.pos, 3);
	                    this.claimable = pos.structure;
	                }
	            }
	            for (let pos of this.upgraderSlots) {
	                this.remainingUpgraderSlots.push(pos);
	            }
	            //console.log(controller.pos.roomName + ' upgraderSlots ' + this.upgraderSlots.length);
	            if (controller.instance.ticksToDowngrade < 2000) {
	                this.priority = 1000 /* Mandatory */ * 2;
	            }
	            else if (controller.instance.ticksToDowngrade < 3000) {
	                this.priority = 1000 /* Mandatory */;
	            }
	            else if (controller.instance.level < 2) {
	                this.priority = 1000 /* Mandatory */ - 100;
	            }
	        }
	    }
	    createAppointment(spawn, request) {
	        return super.createBasicAppointment(spawn, request, this.controller);
	    }
	    getPrioritizingConditions(conditions) {
	        conditions.push((creep) => {
	            if (creep.carry[RESOURCE_ENERGY] === 0 && creep.carryCount === creep.carryCapacity) {
	                return -1;
	            }
	            return 0;
	        });
	        super.getBasicPrioritizingConditions(conditions, this.controller, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    hasWork() {
	        if (this.possibleWorkers === 0 || !this.controller.isValid) {
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
	        if (this.labor.types[this.idealCreepBody.name] != null) {
	            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
	            if (this.scheduledWork >= this.labor.types[this.idealCreepBody.name].parts[WORK] ||
	                this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max) {
	                return false;
	            }
	        }
	        return true;
	    }
	    beginScheduling() {
	        this.scheduledWorkers = 0;
	        this.scheduledWork = 0;
	    }
	    schedule(object) {
	        if (!this.hasWork()) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to upgrade a room controller with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        let code;
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        if (creep.type == sporeCreep_1.CREEP_TYPE.UPGRADER.name) {
	            if (this.remainingUpgraderSlots.length <= 0) {
	                return task_1.ERR_CANNOT_PERFORM_TASK;
	            }
	            let pos = this.remainingUpgraderSlots[0];
	            if (creep.taskMetadata != null && creep.taskMetadata.type == 'UpgradeRC') {
	                let oldPos = new RoomPosition(creep.taskMetadata.x, creep.taskMetadata.y, creep.taskMetadata.roomName);
	                for (let index = 0; index < this.remainingUpgraderSlots.length; index++) {
	                    let slot = this.remainingUpgraderSlots[index];
	                    if (slot.isEqualTo(oldPos)) {
	                        pos = oldPos;
	                        this.remainingUpgraderSlots.splice(index, 1);
	                        break;
	                    }
	                }
	            }
	            else {
	                this.remainingUpgraderSlots.splice(0, 1);
	            }
	            if (!creep.pos.isEqualTo(pos)) {
	                code = creep.moveTo(pos);
	                if (code === ERR_TIRED) {
	                    code = OK;
	                }
	            }
	            else {
	                code = OK;
	            }
	            if (code >= 0) {
	                creep.taskMetadata = { type: 'UpgradeRC', x: pos.x, y: pos.y, roomName: pos.roomName };
	            }
	            let claimReceipt = this.claimable.makeClaim(this, RESOURCE_ENERGY, creep.carryCapacityRemaining, creep.getActiveBodyparts(WORK), false);
	            if (claimReceipt != null) {
	                claimReceipt.target.collect(creep, claimReceipt);
	            }
	            if (!this.controller.isShrouded) {
	                creep.upgradeController(this.controller.instance);
	            }
	            creep.action = sporeCreep_1.ACTION_UPGRADE;
	            creep.actionTarget = this.controller.toString();
	        }
	        else {
	            if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
	                (creep.action === sporeCreep_1.ACTION_UPGRADE && creep.carry[RESOURCE_ENERGY] > 0)) {
	                code = creep.goUpgrade(this.controller);
	            }
	            else {
	                let amount = creep.carryCapacityRemaining;
	                //creep.moveOptions.favor.push({ target: this.controller, range: 3 });
	                code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.controller.pos, this.collectOptions, {});
	                if (code === task_1.ERR_NO_WORK) {
	                    if (creep.carry[RESOURCE_ENERGY] > 0) {
	                        code = creep.goUpgrade(this.controller);
	                    }
	                    else {
	                        code = creep.goCollect(RESOURCE_ENERGY, amount, 0, false, this.controller.pos, this.collectOptions, {});
	                    }
	                }
	                if (!this.controller.isShrouded) {
	                    creep.upgradeController(this.controller.instance);
	                }
	            }
	        }
	        if (code === OK) {
	            this.scheduledWorkers++;
	            this.scheduledWork += creep.getActiveBodyparts(WORK);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        this.updateLaborRequirements();
	        if (!this.hasWork()) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	    updateLaborRequirements() {
	        let room = null;
	        if (!this.controller.isShrouded) {
	            room = this.controller.instance.room;
	        }
	        let maxUpgraders = 50;
	        if (this.idealCreepBody.name === sporeCreep_1.CREEP_TYPE.UPGRADER.name && this.upgraderSlots.length > 0) {
	            maxUpgraders = this.upgraderSlots.length;
	        }
	        if (room != null && room.level >= 8) {
	            this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ work: 15 }, 1, maxUpgraders);
	        }
	        else {
	            if (room != null &&
	                room.economy != null &&
	                room.economy.resources != null &&
	                room.economy.resources[RESOURCE_ENERGY] > this.scheduledWork * 300) {
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
	                this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ work: (this.scheduledWork + 1) }, 1, maxUpgraders);
	            }
	            else {
	                maxUpgraders = this.scheduledWorkers;
	                this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ work: this.scheduledWork }, 1, maxUpgraders);
	            }
	        }
	    }
	    endScheduling() {
	        this.updateLaborRequirements();
	    }
	}
	exports.UpgradeRoomController = UpgradeRoomController;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class RepairStructure extends task_1.Task {
	    constructor(structure) {
	        super(false);
	        this.structure = structure;
	        this.id = 'Repair [structure (' + structure.lookTypeModifier + ') {room ' + this.structure.pos.roomName + '}]';
	        this.name = "Repair " + structure.toHtml();
	        this.priority = 75 /* MediumHigh */;
	        this.possibleWorkers = 2;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        this.near = structure;
	        this.roomName = 'E1N49';
	    }
	    getPrioritizingConditions(conditions) {
	        conditions.push((creep) => {
	            if (creep.carry[RESOURCE_ENERGY] === 0 && creep.carryCount === creep.carryCapacity) {
	                return -1;
	            }
	            if (creep.type === sporeCreep_1.CREEP_TYPE.MINER.name || creep.type === sporeCreep_1.CREEP_TYPE.UPGRADER.name) {
	                return -1;
	            }
	            return 0;
	        });
	        super.getBasicPrioritizingConditions(conditions, this.structure, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    schedule(object) {
	        if (this.possibleWorkers == 0) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to harvest with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let code;
	        let creep = object;
	        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
	            ((creep.action === sporeCreep_1.ACTION_REPAIR || creep.action === sporeCreep_1.ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0)) {
	            code = creep.goRepair(this.structure);
	        }
	        else {
	            let amount = creep.carryCapacityRemaining;
	            if (!this.structure.isShrouded) {
	                Math.min(creep.carryCapacityRemaining, this.structure.instance.hitsMissing / 100);
	            }
	            code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.structure.pos, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]), {});
	        }
	        if (code === OK && this.possibleWorkers > 0) {
	            this.possibleWorkers--;
	        }
	        return code;
	    }
	}
	exports.RepairStructure = RepairStructure;


/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	class ScreepsPtr {
	    constructor() {
	        this.toString = () => {
	            let result = '[';
	            if (this.lookType != null) {
	                result += this.lookType;
	                if (this.lookTypeModifier != null) {
	                    result += ' (' + this.lookTypeModifier + ')';
	                }
	            }
	            if (this.pos != null && this.lookType !== LOOK_FLAGS) {
	                if (result.length > 1) {
	                    result += ' ';
	                }
	                result += '{room ' + this.pos.roomName + ' pos ' + this.pos.x + ',' + this.pos.y + '}';
	            }
	            // [structure (container) {room E53S36 20,30}]
	            // [flag (Flag01)]
	            // [source {room E53S36 20,30}]
	            return result + ']';
	        };
	        this.toHtml = () => {
	            let result = "<font color='#ff4500'>[";
	            if (this.lookType != null) {
	                result += this.lookType;
	                if (this.lookTypeModifier != null) {
	                    result += ' (' + this.lookTypeModifier + ')';
	                }
	            }
	            if (this.pos != null && this.lookType !== LOOK_FLAGS) {
	                if (result.length > 1) {
	                    result += ' ';
	                }
	                result += '{room ' + this.pos.roomName + ' pos ' + this.pos.x + ',' + this.pos.y + '}';
	            }
	            // [structure (container) {room E53S36 20,30}]
	            // [flag (Flag01)]
	            // [source {room E53S36 20,30}]
	            return result + ']</font>';
	        };
	    }
	    get room() {
	        if (this.resolve().isValid) {
	            return this.cache.instance.room;
	        }
	        return null;
	    }
	    get isValid() {
	        return this.resolve().isValid;
	    }
	    get isShrouded() {
	        this.resolve();
	        return this.cache.isValid && this.cache.instance == null;
	    }
	    get instance() {
	        return this.resolve().instance;
	    }
	    resolve() {
	        if (this.cache != null) {
	            return this.cache;
	        }
	        this.cache = { instance: null, isValid: true };
	        if (this.id != null) {
	            this.cache.instance = Game.getObjectById(this.id);
	            if (this.cache.instance != null) {
	                return this.cache;
	            }
	            else if (this.pos == null || Game.rooms[this.pos.roomName] != null) {
	                // if we lack a position then we can't move towards the target.
	                // if we have a position but we can see into that room and still
	                // didn't find the id then we can't move towards the target.
	                this.cache.isValid = false;
	                return this.cache;
	            }
	        }
	        if (this.lookType === LOOK_FLAGS) {
	            this.cache.instance = Game.flags[this.lookTypeModifier];
	            // Flags go invalid immediately once they have been removed, as you can see them from any room
	            if (this.cache.instance == null) {
	                this.cache.isValid = false;
	            }
	        }
	        else if (this.pos != null) {
	            if (Game.rooms[this.pos.roomName] != null) {
	                let room = Game.rooms[this.pos.roomName];
	                if (this.lookTypeModifier == null) {
	                    let foundObjects = room.lookForAt(this.lookType, this.pos);
	                    if (foundObjects.length == 1) {
	                        this.cache.instance = foundObjects[0];
	                    }
	                    else {
	                        this.cache.isValid = false;
	                    }
	                }
	                else if (this.lookType == LOOK_STRUCTURES || this.lookType == LOOK_CONSTRUCTION_SITES) {
	                    let foundObjects = room.lookForAt(this.lookType, this.pos);
	                    this.cache.instance = _.find(foundObjects, function (o) { return o.structureType === this.lookTypeModifier; }.bind(this));
	                    if (this.cache.instance == null) {
	                        this.cache.isValid = false;
	                    }
	                }
	            }
	        }
	        else {
	            this.cache.isValid = false;
	        }
	        return this.cache;
	    }
	    static fromPosition(pos, lookType, lookTypeModifier) {
	        let promise = new ScreepsPtr();
	        promise.pos = pos;
	        promise.lookType = lookType;
	        promise.lookTypeModifier = lookTypeModifier;
	        return promise;
	    }
	    static from(object) {
	        let promise = new ScreepsPtr();
	        promise.id = object.id;
	        promise.pos = object.pos;
	        promise.cache = { instance: object, isValid: true };
	        if (object instanceof Creep) {
	            promise.lookType = LOOK_CREEPS;
	        }
	        else if (object instanceof Resource) {
	            promise.lookType = LOOK_RESOURCES;
	        }
	        else if (object instanceof Source) {
	            promise.lookType = LOOK_SOURCES;
	        }
	        else if (object instanceof Structure) {
	            promise.lookType = LOOK_STRUCTURES;
	            promise.lookTypeModifier = object.structureType;
	        }
	        else if (object instanceof Flag) {
	            promise.lookType = LOOK_FLAGS;
	            promise.lookTypeModifier = object.name;
	        }
	        else if (object instanceof ConstructionSite) {
	            promise.lookType = LOOK_CONSTRUCTION_SITES;
	            promise.lookTypeModifier = object.structureType;
	        }
	        return promise;
	    }
	}
	exports.ScreepsPtr = ScreepsPtr;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	const screepsPtr_1 = __webpack_require__(16);
	const sporeSource_1 = __webpack_require__(18);
	class HarvestEnergy extends task_1.Task {
	    constructor(source) {
	        super(false);
	        this.source = source;
	        this.scheduledWork = 0;
	        this.scheduledWorkers = [];
	        this.id = 'Harvesting ' + this.source;
	        this.name = 'Harvesting ' + this.source.toHtml();
	        this.possibleWorkers = -1;
	        this.priority = 1000 /* Mandatory */;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.MINER;
	        this.roomName = this.source.pos.roomName;
	        this.near = source;
	    }
	    createAppointment(spawn, request) {
	        return super.createBasicAppointment(spawn, request, this.source);
	    }
	    getPrioritizingConditions(conditions) {
	        conditions.push((creep) => {
	            if (creep.carry[RESOURCE_ENERGY] === 0 && creep.carryCount === creep.carryCapacity) {
	                return -1;
	            }
	            if (creep.type === sporeCreep_1.CREEP_TYPE.UPGRADER.name) {
	                return -1;
	            }
	            return 0;
	        });
	        super.getBasicPrioritizingConditions(conditions, this.source, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.scheduledWork = 0;
	        this.scheduledWorkers.length = 0;
	        let slots = sporeSource_1.SporeSource.getSlots(this.source);
	        if (slots === -1) {
	            slots = 8;
	        }
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ work: 5 }, 1, slots);
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || this.scheduledWork >= 1 || !this.source.isValid ||
	            (!this.source.isShrouded && this.scheduledWorkers.length >= this.source.instance.slots)) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to harvest with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        if (creep.spawnRequest == null && creep.task != this && creep.task instanceof HarvestEnergy) {
	            return task_1.ERR_SKIP_WORKER;
	        }
	        let code;
	        if (creep.spawnRequest != null) {
	            if (creep.spawnRequest.replacingCreep != null) {
	                code = creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            }
	            else {
	                code = creep.goMoveTo(this.source);
	            }
	        }
	        else if (!this.source.isShrouded && this.source.instance.energy === 0) {
	            code = creep.goMoveTo(this.source);
	        }
	        else {
	            code = creep.goHarvest(this.source);
	        }
	        if (code < 0) {
	            creep.action = null;
	        }
	        if (creep.carry[RESOURCE_ENERGY] > 0) {
	            let areaResults = creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep.pos, 1, true);
	            let areaResultsByType = _.groupBy(areaResults, function (l) { return l.structure.structureType; });
	            if (areaResultsByType[STRUCTURE_STORAGE] != null && areaResultsByType[STRUCTURE_STORAGE].length > 0) {
	                let storage = areaResultsByType[STRUCTURE_STORAGE][0].structure;
	                if (storage.storeCapacityRemaining > 0) {
	                    code = creep.goTransfer(RESOURCE_ENERGY, screepsPtr_1.ScreepsPtr.from(storage));
	                }
	            }
	            if (areaResultsByType[STRUCTURE_CONTROLLER] != null && areaResultsByType[STRUCTURE_CONTROLLER].length > 0) {
	                let controller = areaResultsByType[STRUCTURE_CONTROLLER][0].structure;
	                code = creep.goUpgrade(screepsPtr_1.ScreepsPtr.from(controller));
	            }
	            if (areaResultsByType[STRUCTURE_CONTAINER] != null && areaResultsByType[STRUCTURE_CONTAINER].length > 0) {
	                for (let result of areaResultsByType[STRUCTURE_CONTAINER]) {
	                    let container = result.structure;
	                    if (container.storeCapacityRemaining > 0) {
	                        code = creep.goTransfer(RESOURCE_ENERGY, screepsPtr_1.ScreepsPtr.from(container));
	                        break;
	                    }
	                }
	            }
	            if (areaResultsByType[STRUCTURE_LINK] != null && areaResultsByType[STRUCTURE_LINK].length > 0) {
	                let link = areaResultsByType[STRUCTURE_LINK][0].structure;
	                if (link.energyCapacityRemaining > 0) {
	                    code = creep.goTransfer(RESOURCE_ENERGY, screepsPtr_1.ScreepsPtr.from(link));
	                }
	            }
	            if (areaResultsByType[STRUCTURE_EXTENSION] != null && areaResultsByType[STRUCTURE_EXTENSION].length > 0) {
	                let extension = areaResultsByType[STRUCTURE_EXTENSION][0].structure;
	                if (extension.energyCapacityRemaining > 0) {
	                    code = creep.goTransfer(RESOURCE_ENERGY, screepsPtr_1.ScreepsPtr.from(extension));
	                }
	            }
	            if (areaResultsByType[STRUCTURE_SPAWN] != null && areaResultsByType[STRUCTURE_SPAWN].length > 0) {
	                let spawn = areaResultsByType[STRUCTURE_SPAWN][0].structure;
	                if (spawn.energyCapacityRemaining > 0) {
	                    code = creep.goTransfer(RESOURCE_ENERGY, screepsPtr_1.ScreepsPtr.from(spawn));
	                }
	            }
	            if (areaResultsByType[STRUCTURE_TOWER] != null && areaResultsByType[STRUCTURE_TOWER].length > 0) {
	                for (let result of areaResultsByType[STRUCTURE_TOWER]) {
	                    let tower = result.structure;
	                    if (tower.energyCapacityRemaining > 0) {
	                        code = creep.goTransfer(RESOURCE_ENERGY, screepsPtr_1.ScreepsPtr.from(tower));
	                        break;
	                    }
	                }
	            }
	        }
	        if (code === task_1.ERR_CANNOT_PERFORM_TASK) {
	            console.log(creep + ' is blocked from harvesting');
	            code = OK;
	        }
	        if (code === OK && creep.spawnRequest == null) {
	            this.scheduledWork += creep.getActiveBodyparts(WORK) / 5;
	            this.scheduledWorkers.push(creep);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (this.possibleWorkers === 0 || this.scheduledWork >= 1 || !this.source.isValid ||
	            (!this.source.isShrouded && this.scheduledWorkers.length >= this.source.instance.slots)) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	    doBusyWork(creep, code) {
	        if (creep.getActiveBodyparts(CARRY) > 0) {
	            let totalEnergyOnGround = 0;
	            let resources = [];
	            if (code != 0) {
	                console.log('?+?+?+?+?+?+?+?+?+?+?+?+? ' + creep + ' ' + code);
	            }
	            if (code !== task_1.ERR_NO_WORK) {
	                resources = creep.room.lookForByRadiusAt(LOOK_RESOURCES, creep.pos, 1, true);
	                for (let look of resources) {
	                    if (look.resource.resourceType === RESOURCE_ENERGY) {
	                        totalEnergyOnGround += look.resource.amount;
	                    }
	                }
	            }
	            if (totalEnergyOnGround > 2000 || code === task_1.ERR_NO_WORK) {
	                let structures = creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep.pos, 1, true);
	                let didRepaired = false;
	                for (let look of structures) {
	                    if (look.structure.hits < look.structure.hitsMax) {
	                        if (resources[0] != null) {
	                            creep.pickup(resources[0].resource);
	                        }
	                        else {
	                            creep.withdraw(look.structure, RESOURCE_ENERGY);
	                        }
	                        creep.repair(look.structure);
	                        didRepaired = true;
	                        break;
	                    }
	                }
	                if (!didRepaired) {
	                    let sites = creep.room.lookForByRadiusAt(LOOK_CONSTRUCTION_SITES, creep.pos, 1, true);
	                    if (sites.length > 0) {
	                        if (resources[0] != null) {
	                            creep.pickup(resources[0].resource);
	                        }
	                        creep.build(sites[0].constructionSite);
	                    }
	                }
	            }
	        }
	    }
	    endScheduling() {
	    }
	}
	exports.HarvestEnergy = HarvestEnergy;


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const sporeRemember_1 = __webpack_require__(13);
	class SourceClaims {
	    constructor(source) {
	        this.source = source;
	        this.count = 0;
	        this.work = 0;
	        this.energy = 0;
	    }
	}
	exports.SourceClaims = SourceClaims;
	// unused mirror class of the screeps Source class used to make Typescript happy
	class ScreepsSource {
	    collect(collector, claimReceipt) { return 0; }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) { return null; }
	}
	class SporeSource extends ScreepsSource {
	    get doTrack() {
	        return this.memory.track === true;
	    }
	    static getSlots(source) {
	        let roomMemory = Memory.rooms[source.pos.roomName];
	        if (roomMemory == null) {
	            return -1;
	        }
	        if (roomMemory.sources == null) {
	            roomMemory.sources = [];
	        }
	        let sourceMemory = roomMemory.sources[source.id];
	        if (sourceMemory == null) {
	            sourceMemory = {};
	            roomMemory.sources[source.id] = sourceMemory;
	        }
	        if (sourceMemory.claimSlots == null) {
	            sourceMemory.claimSlots = source.pos.getWalkableSurroundingArea();
	        }
	        return sourceMemory.claimSlots;
	    }
	    get slots() {
	        let slots = this.memory.claimSlots;
	        if (slots == null) {
	            slots = this.pos.getWalkableSurroundingArea();
	            this.memory.claimSlots = slots;
	        }
	        return slots;
	    }
	    get priorityModifier() {
	        return sporeRemember_1.Remember.forTick(`${this.id}.priorityModifier`, function () {
	            let pathToClosestSpawn = this.memory.pathToClosestSpawn;
	            let priorityModifier = 0;
	            if (pathToClosestSpawn == null || Game.time - pathToClosestSpawn.tickCalculated > 300) {
	                let colony = this.colony;
	                let path = null;
	                if (colony.cpuSpentPathing <= colony.pathingCpuLimit) {
	                    path = colony.pathFinder.findPathTo(this.pos, _.map(this.room.mySpawns, (spawn) => {
	                        return { pos: spawn.pos, range: 1 };
	                    }));
	                }
	                if (path != null) {
	                    this.memory.pathToClosestSpawn = path.serialize();
	                    priorityModifier += Math.max(0, 250 - path.cost);
	                }
	            }
	            else {
	                priorityModifier += Math.max(0, 250 - pathToClosestSpawn.cost);
	            }
	            return priorityModifier;
	        }.bind(this));
	    }
	    get memory() {
	        let roomMemory = this.room.memory;
	        if (roomMemory.sources == null) {
	            roomMemory.sources = [];
	        }
	        let memory = roomMemory.sources[this.id];
	        if (memory == null) {
	            memory = {};
	            roomMemory.sources[this.id] = memory;
	        }
	        return memory;
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (collector.harvest != null) {
	            let code = collector.harvest(this);
	            if (code === OK) {
	                this.room.energyHarvestedSinceLastInvasion += collector.getActiveBodyparts(WORK) * 2;
	            }
	            return code;
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        //console.log('makeClaim ' + claimer);
	        if (resourceType != RESOURCE_ENERGY ||
	            this.claims.count >= this.slots ||
	            (this.claims.work >= 1 && isExtended === true)) {
	            //console.log('makeClaim energy ' + (amount > this.energy - this.claims.energy && isExtended === false));
	            //console.log('makeClaim slots ' + (this.claims.count >= this.claims.slots));
	            //console.log('   makeClaim count ' + this.claims.count);
	            //console.log('   makeClaim slots ' + this.claims.slots);
	            //console.log('makeClaim work ' + (this.claims.work >= 1 && isExtended === true));
	            return null;
	        }
	        let claimAmount = amount;
	        if (isExtended === false) {
	            let remaining = this.energy - this.claims.energy;
	            // ensure our remaining resource meets their claim
	            if (claimAmount > remaining) {
	                if (minAmount > remaining) {
	                    return null;
	                }
	                claimAmount = remaining;
	            }
	        }
	        this.claims.count++;
	        this.claims.energy += claimAmount; // extended claims ignore the resource amount request on sources
	        if (isExtended === true && claimer.getActiveBodyparts != null) {
	            this.claims.work += claimer.getActiveBodyparts(WORK) / 5;
	        }
	        //console.log('makeClaim success');
	        return new sporeClaimable_1.ClaimReceipt(this, 'source', resourceType, claimAmount);
	    }
	    get claims() {
	        if (this._claims != null && this._claimTick == Game.time) {
	            return this._claims;
	        }
	        this._claimTick = Game.time;
	        this._claims = new SourceClaims(this);
	        //Object.defineProperty(this, "claims", {value: claims, configurable: true, enumerable: true});
	        return this._claims;
	    }
	}
	exports.SporeSource = SporeSource;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	const screepsPtr_1 = __webpack_require__(16);
	class BuildBarrier extends task_1.Task {
	    constructor(barriers) {
	        super(false);
	        this.barriers = barriers;
	        this.scheduledWorkers = 0;
	        this.scheduledCarry = 0;
	        this.direRampartHits = RAMPART_DECAY_AMOUNT * 10;
	        this.averageHits = 0;
	        this.averageDelta = 1000;
	        this.requiredCarryPerBarrier = 0.15;
	        this.id = 'Reinforce barriers ' + barriers[0].pos.roomName;
	        this.name = 'Reinforce barriers ' + barriers[0].pos.roomName;
	        this.possibleWorkers = -1;
	        this.priority = 50 /* Medium */;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.MASON;
	        let totalHits = 0;
	        let total = 0;
	        for (let barrier of barriers) {
	            if (barrier.isValid && !barrier.isShrouded && barrier.lookType === LOOK_STRUCTURES) {
	                total++;
	                totalHits += barrier.instance.hits;
	            }
	        }
	        this.averageHits = totalHits / total;
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ carry: Math.floor(this.requiredCarryPerBarrier * this.barriers.length) }, 1, 10);
	    }
	    sortBarriers() {
	        this.barriers.sort(function (a, b) {
	            let aIsRampart = a.lookTypeModifier === STRUCTURE_RAMPART;
	            let bIsRampart = b.lookTypeModifier === STRUCTURE_RAMPART;
	            let aIsStructure = a.lookType === LOOK_STRUCTURES;
	            let bIsStructure = b.lookType === LOOK_STRUCTURES;
	            let aIsShrouded = a.isShrouded;
	            let bIsShrouded = b.isShrouded;
	            let aIsDireRampart = aIsRampart && !aIsShrouded && a.instance.hits < this.direRampartHits;
	            let bIsDireRampart = bIsRampart && !bIsShrouded && b.instance.hits < this.direRampartHits;
	            if (aIsDireRampart && bIsDireRampart) {
	                let aHits = a.instance.hits;
	                let bHits = b.instance.hits;
	                if (aHits === bHits) {
	                    return this.comparePosition(a, b);
	                }
	                if (aHits < bHits) {
	                    return -1;
	                }
	                return 1;
	            }
	            if (aIsDireRampart && !bIsDireRampart) {
	                return -1;
	            }
	            if (!aIsDireRampart && bIsDireRampart) {
	                return 1;
	            }
	            if (!aIsStructure && !bIsStructure) {
	                return this.comparePosition(a, b);
	            }
	            if (aIsStructure && !bIsStructure) {
	                return 1;
	            }
	            if (!aIsStructure && bIsStructure) {
	                return -1;
	            }
	            if (aIsShrouded && bIsShrouded) {
	                return this.comparePosition(a, b);
	            }
	            if (!aIsShrouded && bIsShrouded) {
	                return -1;
	            }
	            if (aIsShrouded && !bIsShrouded) {
	                return 1;
	            }
	            let aHits = a.instance.hits;
	            let bHits = b.instance.hits;
	            let ideal = this.averageHits + this.averageDelta;
	            let aIsIdeal = aHits >= ideal;
	            let bIsIdeal = bHits >= ideal;
	            if (aIsIdeal && bIsIdeal) {
	                return this.comparePosition(a, b);
	            }
	            if (!aIsIdeal && bIsIdeal) {
	                return -1;
	            }
	            if (aIsIdeal && !bIsIdeal) {
	                return 1;
	            }
	            if (aHits < bHits) {
	                return -1;
	            }
	            if (aHits > bHits) {
	                return 1;
	            }
	            return this.comparePosition(a, b);
	        }.bind(this));
	        // for (let ptr of this.barriers)
	        // {
	        //     console.log(ptr);
	        // }
	    }
	    comparePosition(a, b) {
	        if (a.pos.x === b.pos.x) {
	            if (a.pos.y === b.pos.y) {
	                return 0;
	            }
	            if (a.pos.y < b.pos.y) {
	                return -1;
	            }
	            return 1;
	        }
	        if (a.pos.x < b.pos.x) {
	            return -1;
	        }
	        return 1;
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        return super.createBasicAppointment(spawn, request, { pos: new RoomPosition(25, 25, this.roomName), room: Game.rooms[this.roomName] });
	    }
	    getPrioritizingConditions(conditions) {
	        conditions.push((creep) => {
	            if (creep.carry[RESOURCE_ENERGY] === 0 && creep.carryCount === creep.carryCapacity) {
	                return -1;
	            }
	            if (creep.type === sporeCreep_1.CREEP_TYPE.MINER.name || creep.type === sporeCreep_1.CREEP_TYPE.UPGRADER.name) {
	                return -1;
	            }
	            return 0;
	        });
	        super.getBasicPrioritizingConditions(conditions, { pos: new RoomPosition(25, 25, this.roomName), room: Game.rooms[this.roomName] }, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.sortBarriers();
	        this.scheduledWorkers = 0;
	        this.scheduledCarry = 0;
	    }
	    hasWork() {
	        if (this.possibleWorkers === 0) {
	            return false;
	        }
	        if (this.labor.types[this.idealCreepBody.name] != null) {
	            if (this.scheduledCarry >= this.labor.types[this.idealCreepBody.name].parts[CARRY] ||
	                this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max) {
	                return false;
	            }
	        }
	        return true;
	    }
	    schedule(object) {
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to reinforce barriers with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let nextBarrier = 0; //Math.min(this.workers, this.barriers.length);
	        let creep = object;
	        let code;
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        if (!this.hasWork()) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
	            ((creep.action === sporeCreep_1.ACTION_BUILD || creep.action === sporeCreep_1.ACTION_REPAIR || creep.action === sporeCreep_1.ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0)) {
	            code = this.goReinforce(creep, nextBarrier);
	        }
	        else {
	            creep.taskMetadata = { type: 'BuildBarrier', target: null };
	            let amount = creep.carryCapacityRemaining;
	            code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.barriers[nextBarrier].pos, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]), {});
	            if (code === task_1.ERR_NO_WORK) {
	                if (creep.carry[RESOURCE_ENERGY] > 0) {
	                    code = this.goReinforce(creep, nextBarrier);
	                }
	                else {
	                    code = creep.goCollect(RESOURCE_ENERGY, amount, 0, false, this.barriers[nextBarrier].pos, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]), {});
	                }
	            }
	        }
	        if (code === OK) {
	            this.scheduledWorkers++;
	            this.scheduledCarry += creep.getActiveBodyparts(CARRY);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (!this.hasWork()) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	    goReinforce(creep, barrierIndex) {
	        let code;
	        let barrier = this.barriers[barrierIndex];
	        if (creep.taskMetadata != null &&
	            creep.taskMetadata.type === 'BuildBarrier' &&
	            creep.taskMetadata.target != null) {
	            let barrierId = creep.taskMetadata.target;
	            let object = Game.getObjectById(barrierId);
	            if (object != null) {
	                barrier = screepsPtr_1.ScreepsPtr.from(object);
	            }
	        }
	        if (this.barriers[barrierIndex].lookType === LOOK_CONSTRUCTION_SITES) {
	            code = creep.goBuild(barrier);
	        }
	        else {
	            code = creep.goRepair(barrier);
	        }
	        creep.taskMetadata = { type: 'BuildBarrier', target: barrier.id };
	        return code;
	    }
	    endScheduling() {
	    }
	}
	exports.BuildBarrier = BuildBarrier;


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class DefendRoom extends task_1.Task {
	    constructor(defendingRoomName) {
	        super(false);
	        this.defendingRoomName = defendingRoomName;
	        this.id = 'Defending ' + defendingRoomName;
	        this.name = 'Defending [' + defendingRoomName + ']';
	        this.possibleWorkers = -1;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.REMOTE_DEFENDER;
	        this.priority = 100 /* High */;
	        this.anchor = { pos: new RoomPosition(25, 25, this.defendingRoomName), room: Game.rooms[this.defendingRoomName] };
	        let room = Game.rooms[this.defendingRoomName];
	        if (room != null && room.hostileCreeps.length > 0) {
	            this.priority = 1000 /* Mandatory */ + 199;
	        }
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({}, 1, 1);
	        for (let flagName in Game.flags) {
	            let flag = Game.flags[flagName];
	            if (flag.color == COLOR_ORANGE && flag.secondaryColor == COLOR_ORANGE && flag.pos.roomName === this.defendingRoomName) {
	                this.anchor = flag;
	                break;
	            }
	        }
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        return super.createBasicAppointment(spawn, request, this.anchor);
	    }
	    getPrioritizingConditions(conditions) {
	        super.getBasicPrioritizingConditions(conditions, this.anchor, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.scheduledWorkers = 0;
	    }
	    hasWork() {
	        if (this.possibleWorkers === 0) {
	            return false;
	        }
	        if (this.labor.types[this.idealCreepBody.name] != null) {
	            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
	            if (this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max) {
	                return false;
	            }
	        }
	        return true;
	    }
	    schedule(object) {
	        if (!this.hasWork()) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to defend a room with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        let code;
	        if (creep.pos.roomName != this.defendingRoomName) {
	            code = creep.goMoveTo(this.anchor);
	            creep.heal(creep);
	        }
	        else if (creep.room.hostileCreeps.length === 0) {
	            if (creep.room.injuredFriendlyCreeps.length > 0) {
	                let injuredCreep = creep.room.injuredFriendlyCreeps[0];
	                if (creep.heal(injuredCreep) == ERR_NOT_IN_RANGE) {
	                    code = creep.moveTo(injuredCreep);
	                    if (creep.rangedHeal(injuredCreep) == ERR_NOT_IN_RANGE) {
	                        creep.heal(creep);
	                    }
	                }
	                else {
	                    code = OK;
	                }
	            }
	            else {
	                code = creep.goMoveTo(this.anchor);
	            }
	        }
	        else {
	            let hostile = null;
	            if (creep.taskMetadata != null && creep.taskMetadata.target != null && creep.task == this && creep.taskMetadata.time >= Game.time - 15) {
	                hostile = Game.getObjectById(creep.taskMetadata.target);
	            }
	            if (hostile == null) {
	                hostile = creep.pos.findClosestByPath(creep.room.hostileCreeps);
	                creep.taskMetadata = { target: hostile.id, time: Game.time };
	            }
	            code = creep.attack(hostile);
	            if (code === ERR_NOT_IN_RANGE) {
	                code = creep.moveTo(hostile);
	                if (code === ERR_TIRED) {
	                    code = OK;
	                }
	                creep.heal(creep);
	            }
	            creep.rangedAttack(hostile);
	        }
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            return OK;
	        }
	        if (code === OK) {
	            this.scheduledWorkers++;
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (!this.hasWork()) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	}
	exports.DefendRoom = DefendRoom;


/***/ },
/* 21 */
/***/ function(module, exports) {

	"use strict";
	class SporeRoomObject extends RoomObject {
	    get doTrack() {
	        return this.memory.track === true;
	    }
	}
	exports.SporeRoomObject = SporeRoomObject;


/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const taskBuildStructure_1 = __webpack_require__(23);
	const screepsPtr_1 = __webpack_require__(16);
	class SporeConstructionSite extends ConstructionSite {
	    get progressRemaining() {
	        return this.progressTotal - this.progress;
	    }
	    get memory() {
	        let roomMemory = this.room.memory;
	        if (roomMemory.sites == null) {
	            roomMemory.sites = {};
	        }
	        let memory = roomMemory.sites[this.id];
	        if (memory == null) {
	            memory = {};
	            roomMemory.sites[this.id] = memory;
	        }
	        return memory;
	    }
	    getTasks() {
	        let tasks = [];
	        if (this.structureType !== STRUCTURE_RAMPART && this.structureType !== STRUCTURE_WALL) {
	            let task = new taskBuildStructure_1.BuildStructure(screepsPtr_1.ScreepsPtr.from(this));
	            tasks.push(task);
	        }
	        return tasks;
	    }
	}
	exports.SporeConstructionSite = SporeConstructionSite;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	let STRUCTURE_BUILD_PRIORITY = {
	    "spawn": function (site) { return 1000 /* Mandatory */; },
	    "tower": function (site) { return 1000 /* Mandatory */; },
	    "extension": function (site) { return 100 /* High */; },
	    "container": function (site) { return 100 /* High */; },
	    "link": function (site) { return 100 /* High */; },
	    "extractor": function (site) { return 100 /* High */; },
	    "lab": function (site) { return 75 /* MediumHigh */; },
	    "storage": function (site) { return 100 /* High */; },
	    "terminal": function (site) { return 75 /* MediumHigh */; },
	    "rampart": function (site) { return 25 /* MediumLow */; },
	    "road": function (site) { return 75 /* MediumHigh */; },
	    "constructedWall": function (site) { return 25 /* MediumLow */; },
	    "observer": function (site) { return 25 /* MediumLow */; },
	    "powerSpawn": function (site) { return 25 /* MediumLow */; },
	    "nuker": function (site) { return 25 /* MediumLow */; },
	};
	class BuildStructure extends task_1.Task {
	    constructor(site) {
	        super(false);
	        this.site = site;
	        this.id = 'Build [structure (' + site.lookTypeModifier + ') {room ' + this.site.pos.roomName + '}]';
	        this.name = 'Build ' + site.toHtml();
	        this.possibleWorkers = -1;
	        this.priority = STRUCTURE_BUILD_PRIORITY[site.lookTypeModifier](site);
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        this.scheduledWork = 0;
	        this.desiredWork = 5;
	        this.near = site;
	        this.roomName = this.site.pos.roomName;
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({}, 1, 2);
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        return super.createBasicAppointment(spawn, request, this.site);
	    }
	    getPrioritizingConditions(conditions) {
	        conditions.push((creep) => {
	            if (creep.carry[RESOURCE_ENERGY] === 0 && creep.carryCount === creep.carryCapacity) {
	                return -1;
	            }
	            if (creep.type === sporeCreep_1.CREEP_TYPE.MINER.name || creep.type === sporeCreep_1.CREEP_TYPE.UPGRADER.name) {
	                return -1;
	            }
	            return 0;
	        });
	        super.getBasicPrioritizingConditions(conditions, this.site, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.scheduledWork = 0;
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || !this.site.isValid || this.scheduledWork >= this.desiredWork) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to build a structure with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        let code;
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
	            ((creep.action === sporeCreep_1.ACTION_BUILD || creep.action === sporeCreep_1.ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0)) {
	            code = creep.goBuild(this.site);
	        }
	        else {
	            let amount = creep.carryCapacityRemaining;
	            if (!this.site.isShrouded) {
	                Math.min(creep.carryCapacityRemaining, this.site.instance.progressRemaining);
	            }
	            code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.site.pos, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]), {});
	        }
	        if (code === OK) {
	            this.scheduledWork += creep.getActiveBodyparts(WORK);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (this.possibleWorkers === 0 || this.scheduledWork >= this.desiredWork) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	}
	exports.BuildStructure = BuildStructure;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const taskTransferResource_1 = __webpack_require__(4);
	const screepsPtr_1 = __webpack_require__(16);
	const sporeCreep_1 = __webpack_require__(7);
	const sporeRemember_1 = __webpack_require__(13);
	class SporeContainer extends StructureContainer {
	    get storeCount() {
	        return _.sum(this.store);
	    }
	    get storeCapacityRemaining() {
	        return this.storeCapacity - this.storeCount;
	    }
	    getTasks() {
	        let tasks = [];
	        // if (this.storeCount < this.storeCapacity)
	        // {
	        //     let linkFlag = null;
	        //     let flags = this.room.lookForAt<Flag>(LOOK_FLAGS, this.pos);
	        //     for (let index = 0; index < flags.length; index++)
	        //     {
	        //         let flag = flags[index];
	        //
	        //         if (flag.color == COLOR_YELLOW)
	        //         {
	        //             linkFlag = flag;
	        //             break;
	        //         }
	        //     }
	        //
	        //     if (linkFlag != null)
	        //     {
	        //         let otherFlags = this.room.find<Flag>(FIND_FLAGS, {
	        //             filter: {
	        //                 color: COLOR_YELLOW,
	        //                 secondaryColor: linkFlag.secondaryColor
	        //             }
	        //         });
	        //
	        //         for (let index = 0; index < otherFlags.length; index++)
	        //         {
	        //             let foundMatch = false;
	        //             let otherFlag = otherFlags[index];
	        //
	        //             if (otherFlag != null)
	        //             {
	        //                 for (let source of this.room.sources)
	        //                 {
	        //                     if (source.pos.isEqualTo(otherFlag.pos))
	        //                     {
	        //                         let transferEnergyTask = new TransferResource([ScreepsPtr.from<StoreContainerLike>(this)], RESOURCE_ENERGY, ScreepsPtr.from<Source>(source), null);
	        //                         transferEnergyTask.priority = TaskPriority.Mandatory;
	        //                         transferEnergyTask.name = "Transfer energy to " + this + " from " + source;
	        //                         transferEnergyTask.possibleWorkers = 1;
	        //                         transferEnergyTask.idealCreepBody = CREEP_TYPE.CITIZEN;
	        //                         tasks.push(transferEnergyTask);
	        //
	        //                         foundMatch = true;
	        //                         break;
	        //                     }
	        //                 }
	        //             }
	        //
	        //             if (foundMatch)
	        //             {
	        //                 break;
	        //             }
	        //         }
	        //     }
	        //     else
	        //     {
	        //         let closestSource = <Source>this.pos.findClosestInRange(this.room.sources, 2);
	        //
	        //         if (closestSource != null)
	        //         {
	        //             let transferEnergyTask = new TransferResource([ScreepsPtr.from<StoreContainerLike>(this)], RESOURCE_ENERGY, ScreepsPtr.from<Source>(closestSource), null);
	        //             transferEnergyTask.priority = TaskPriority.Mandatory;
	        //             transferEnergyTask.name = "Transfer energy to " + this + " from " + closestSource;
	        //             transferEnergyTask.possibleWorkers = 1;
	        //             transferEnergyTask.idealCreepBody = CREEP_TYPE.MINER;
	        //
	        //             tasks.push(transferEnergyTask);
	        //         }
	        //         else
	        //         {
	        //             let transferEnergyTask = new TransferResource([ScreepsPtr.from<StoreContainerLike>(this)], RESOURCE_ENERGY, null, [['dropped'], ['container']]);
	        //             transferEnergyTask.priority = TaskPriority.High;
	        //             transferEnergyTask.name = "Transfer energy to " + this;
	        //             transferEnergyTask.possibleWorkers = 1;
	        //             transferEnergyTask.idealCreepBody = CREEP_TYPE.COURIER;
	        //
	        //             tasks.push(transferEnergyTask);
	        //         }
	        //     }
	        // }
	        let closestSource = this.pos.findClosestInRange(this.room.sources, 2);
	        let nearExtractor = false;
	        if (this.room.extractor != null) {
	            nearExtractor = this.pos.inRangeTo(this.room.extractor.pos, 2) === true;
	        }
	        if (closestSource == null && !nearExtractor) {
	            let transferEnergyTask = new taskTransferResource_1.TransferResource([screepsPtr_1.ScreepsPtr.from(this)], RESOURCE_ENERGY, null, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['container'], ['dropped']]));
	            transferEnergyTask.priority = 0 /* Low */;
	            transferEnergyTask.name = "Fill " + screepsPtr_1.ScreepsPtr.from(this).toHtml();
	            tasks.push(transferEnergyTask);
	        }
	        return tasks;
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (collector.withdraw != null && collector.carryCapacityRemaining != null) {
	            return collector.withdraw(this, claimReceipt.resourceType, Math.min(this.store[claimReceipt.resourceType], collector.carryCapacityRemaining));
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        if (this.claims[resourceType] == null) {
	            this.claims[resourceType] = 0;
	        }
	        let claimAmount = amount;
	        let remaining = this.store[resourceType] - this.claims[resourceType];
	        // ensure our remaining resource meets their claim
	        if (claimAmount > remaining) {
	            if (minAmount > remaining) {
	                return null;
	            }
	            claimAmount = remaining;
	        }
	        this.claims.count++;
	        this.claims[resourceType] += claimAmount;
	        return new sporeClaimable_1.ClaimReceipt(this, 'container', resourceType, claimAmount);
	    }
	    get claims() {
	        return sporeRemember_1.Remember.byName(`container.${this.id}`, `claims`, () => {
	            return new Claims(this);
	        });
	    }
	}
	exports.SporeContainer = SporeContainer;
	class Claims {
	    constructor(container) {
	        this.container = container;
	        this.count = 0;
	    }
	}


/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";
	class SporeController extends StructureController {
	    get memory() {
	        let roomMemory = this.room.memory;
	        let memory = roomMemory.controller;
	        if (memory == null) {
	            memory = {};
	            roomMemory.controller = memory;
	        }
	        return memory;
	    }
	    static getSlots(controller) {
	        if (controller.isShrouded) {
	            return 1;
	        }
	        let memory = controller.instance.memory;
	        if (memory.claimSlots == null) {
	            memory.claimSlots = controller.pos.getWalkableSurroundingArea();
	        }
	        return memory.claimSlots;
	    }
	    get slots() {
	        let slots = this.memory.claimSlots;
	        if (slots == null) {
	            slots = this.pos.getWalkableSurroundingArea();
	            this.memory.claimSlots = slots;
	        }
	        return slots;
	    }
	}
	exports.SporeController = SporeController;


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const sporeRemember_1 = __webpack_require__(13);
	class SporeExtension extends StructureExtension {
	    get energyCapacityRemaining() {
	        return this.energyCapacity - this.energy;
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (claimReceipt.resourceType === RESOURCE_ENERGY &&
	            collector.withdraw != null &&
	            collector.carryCapacityRemaining != null) {
	            return collector.withdraw(this, claimReceipt.resourceType, Math.min(this.energy, collector.carryCapacityRemaining));
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        if (resourceType != RESOURCE_ENERGY) {
	            return null;
	        }
	        let claimAmount = amount;
	        let remaining = this.energy - this.claims.energy;
	        // ensure our remaining resource meets their claim
	        if (claimAmount > remaining) {
	            if (minAmount > remaining) {
	                return null;
	            }
	            claimAmount = remaining;
	        }
	        this.claims.count++;
	        this.claims.energy += claimAmount;
	        return new sporeClaimable_1.ClaimReceipt(this, 'spawn', resourceType, claimAmount);
	    }
	    get claims() {
	        return sporeRemember_1.Remember.byName(`extension.${this.id}`, `claims`, () => {
	            return new Claims(this);
	        });
	    }
	}
	exports.SporeExtension = SporeExtension;
	class Claims {
	    constructor(extension) {
	        this.extension = extension;
	        this.count = 0;
	        this.energy = 0;
	    }
	}


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const flagBuildStructure_1 = __webpack_require__(28);
	const flagDismantleStructure_1 = __webpack_require__(30);
	const taskClaimRoom_1 = __webpack_require__(31);
	const screepsPtr_1 = __webpack_require__(16);
	const taskReserveRoom_1 = __webpack_require__(32);
	const taskWire_1 = __webpack_require__(33);
	class SporeFlag extends Flag {
	    getTasks() {
	        let tasks = [];
	        let myRoom = this.room != null && this.room.my;
	        if (this.color == COLOR_GREEN) {
	            tasks.push(new flagBuildStructure_1.FlagBuildStructure("", Game.flags[this.name]));
	        }
	        else if (this.color == COLOR_RED) {
	            tasks.push(new flagDismantleStructure_1.FlagDismantleStructure("", Game.flags[this.name]));
	        }
	        else if (this.color == COLOR_WHITE) {
	            tasks.push(new taskWire_1.Wire(Game.flags[this.name].pos));
	        }
	        else if (this.color == COLOR_GREY) {
	            if (this.room != null) {
	                let lookResults = this.room.lookAt(this);
	                for (var lookIndex = 0; lookIndex < lookResults.length; lookIndex++) {
	                    let lookObject = lookResults[lookIndex];
	                    if (lookObject.type == LOOK_SOURCES) {
	                        lookObject.source.doIgnore = true;
	                    }
	                    else if (lookObject.type == LOOK_STRUCTURES) {
	                        lookObject.structure.doIgnore = true;
	                    }
	                    else if (lookObject.type == LOOK_CONSTRUCTION_SITES) {
	                        lookObject.constructionSite.doIgnore = true;
	                    }
	                }
	            }
	        }
	        else if (this.color == COLOR_BLUE) {
	            if (this.room != null) {
	                let lookResults = this.room.lookAt(this);
	                for (var lookIndex = 0; lookIndex < lookResults.length; lookIndex++) {
	                    let lookObject = lookResults[lookIndex];
	                    if (lookObject.type == LOOK_SOURCES) {
	                        lookObject.source.doFavor = true;
	                    }
	                    else if (lookObject.type == LOOK_STRUCTURES) {
	                        lookObject.structure.doFavor = true;
	                    }
	                    else if (lookObject.type == LOOK_CONSTRUCTION_SITES) {
	                        lookObject.constructionSite.doFavor = true;
	                    }
	                }
	            }
	        }
	        else if (this.color == COLOR_PURPLE) {
	            if (this.secondaryColor == COLOR_PURPLE) {
	                if (this.room == null || (this.room.controller != null && this.room.controller.owner == null)) {
	                    tasks.push(new taskClaimRoom_1.ClaimRoom(screepsPtr_1.ScreepsPtr.fromPosition(this.pos, LOOK_STRUCTURES, STRUCTURE_CONTROLLER)));
	                }
	                else if (this.room != null && this.room.controller != null && this.room.controller.owner != null && this.room.controller.owner.username == 'PCake0rigin') {
	                    this.remove();
	                }
	            }
	            else if (this.secondaryColor == COLOR_BLUE) {
	                if (this.room == null || (this.room.controller != null && this.room.controller.owner == null && (this.room.controller.reservation == null || this.room.controller.reservation.username == 'PCake0rigin'))) {
	                    let task = new taskReserveRoom_1.ReserveRoom(screepsPtr_1.ScreepsPtr.fromPosition(this.pos, LOOK_STRUCTURES, STRUCTURE_CONTROLLER));
	                    task.roomName = 'E1N49';
	                    tasks.push(task);
	                }
	                else if (this.room != null && this.room.controller.owner.username == 'PCake0rigin') {
	                    this.remove();
	                }
	            }
	        }
	        return tasks;
	    }
	}
	exports.SporeFlag = SporeFlag;


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const taskBuildStructure_1 = __webpack_require__(23);
	const taskDismantleStructure_1 = __webpack_require__(29);
	const screepsPtr_1 = __webpack_require__(16);
	var REQUESTED_CONSTRUCTION_SITES_THIS_TICK = {};
	class FlagBuildStructure extends task_1.Task {
	    constructor(parentId, flag) {
	        super(true);
	        this.flag = flag;
	        this.structureType = null;
	        this.id = ((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "FlagBuildStructure[" + flag.name + "]";
	        if (this.flag.secondaryColor == COLOR_GREEN) {
	            this.structureType = STRUCTURE_EXTENSION;
	        }
	        else if (this.flag.secondaryColor == COLOR_YELLOW) {
	            this.structureType = STRUCTURE_CONTAINER;
	        }
	        else if (this.flag.secondaryColor == COLOR_BROWN) {
	            this.structureType = STRUCTURE_TOWER;
	        }
	        else if (this.flag.secondaryColor == COLOR_CYAN) {
	            this.structureType = STRUCTURE_LINK;
	        }
	        else if (this.flag.secondaryColor == COLOR_BLUE) {
	            this.structureType = STRUCTURE_STORAGE;
	        }
	    }
	    static deserialize(input) {
	        let parentId = "";
	        let parentSplitIndex = input.lastIndexOf(">");
	        if (parentSplitIndex >= 0) {
	            parentId = input.substring(0, parentSplitIndex);
	        }
	        let startingBraceIndex = input.lastIndexOf("[");
	        let flagName = input.substring(startingBraceIndex, input.length - 1);
	        let flag = Game.flags[flagName];
	        if (flag == null) {
	            return null;
	        }
	        return new FlagBuildStructure(parentId, flag);
	    }
	    getSteps() {
	        let steps = [];
	        if (this.structureType == null) {
	            return steps;
	        }
	        var constructionSite;
	        var sitesUnderFlag = this.flag.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.flag.pos);
	        if (sitesUnderFlag != null && sitesUnderFlag.length > 0) {
	            for (var index = 0; index < sitesUnderFlag.length; index++) {
	                var type = sitesUnderFlag[index].structureType;
	                if (type != this.structureType &&
	                    type != STRUCTURE_RAMPART &&
	                    type != STRUCTURE_ROAD) {
	                    sitesUnderFlag[index].remove();
	                }
	                else if (type == this.structureType) {
	                    constructionSite = sitesUnderFlag[index];
	                }
	            }
	        }
	        if (constructionSite != null) {
	            this.flag.remove();
	            return steps;
	        }
	        var structuresUnderFlag = this.flag.room.lookForAt(LOOK_STRUCTURES, this.flag.pos);
	        if (structuresUnderFlag != null) {
	            for (var index = 0; index < structuresUnderFlag.length; index++) {
	                var type = structuresUnderFlag[index].structureType;
	                // if there is already an extension at this location then
	                if (type == this.structureType) {
	                    // remove the flag
	                    this.flag.remove();
	                    return steps;
	                }
	                else if (type != STRUCTURE_RAMPART && type != STRUCTURE_ROAD) {
	                    // create tasks to dismantle it to make room for the extension
	                    steps.push(new taskDismantleStructure_1.DismantleStructure(screepsPtr_1.ScreepsPtr.from(structuresUnderFlag[index])));
	                    return steps;
	                }
	            }
	        }
	        if (constructionSite == null) {
	            let sameStructures = this.flag.room[this.structureType + 's'];
	            if (sameStructures == null) {
	                sameStructures = this.flag.room.find(FIND_STRUCTURES, {
	                    filter: { structureType: this.structureType }
	                });
	            }
	            let sameSites = this.flag.room.find(FIND_CONSTRUCTION_SITES, {
	                filter: { structureType: this.structureType }
	            });
	            let requestedSameSites = 0;
	            if (REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType] != null) {
	                requestedSameSites = REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType];
	            }
	            if (CONTROLLER_STRUCTURES[this.structureType][this.flag.room.controller.level] - (sameStructures.length + sameSites.length + requestedSameSites) > 0) {
	                this.flag.room.createConstructionSite(this.flag.pos, this.structureType);
	                if (REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType] != null) {
	                    REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType]++;
	                }
	                else {
	                    REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType] = 1;
	                }
	                return steps;
	            }
	            else {
	                return steps;
	            }
	        }
	        steps.push(new taskBuildStructure_1.BuildStructure(screepsPtr_1.ScreepsPtr.from(constructionSite)));
	        return steps;
	    }
	}
	exports.FlagBuildStructure = FlagBuildStructure;


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class DismantleStructure extends task_1.Task {
	    constructor(structure) {
	        super(false);
	        this.structure = structure;
	        this.id = 'Dismantle ' + this.structure;
	        this.name = 'Dismantle ' + this.structure;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        this.near = structure;
	    }
	    getPrioritizingConditions(conditions) {
	        super.getBasicPrioritizingConditions(conditions, this.structure, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.scheduledWork = 0;
	        this.scheduledWorkers = 0;
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || !this.structure.isValid || !(object instanceof Creep)) {
	            return task_1.ERR_NO_WORK;
	        }
	        let creep = object;
	        if (creep.type === sporeCreep_1.CREEP_TYPE.MINER.name && this.scheduledWorkers > 0) {
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        let code = creep.goDismantle(this.structure);
	        if (code === OK) {
	            this.scheduledWorkers++;
	            this.scheduledWork += creep.getActiveBodyparts(WORK);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        return code;
	    }
	}
	exports.DismantleStructure = DismantleStructure;


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const taskDismantleStructure_1 = __webpack_require__(29);
	const screepsPtr_1 = __webpack_require__(16);
	class FlagDismantleStructure extends task_1.Task {
	    constructor(parentId, flag) {
	        super(true);
	        this.flag = flag;
	        this.id = ((parentId != null && parentId.length > 0) ? parentId + ">" : "") + "FlagDismantleStructure[" + flag.name + "]";
	        if (this.flag.secondaryColor == COLOR_RED) {
	            this.structureType = null;
	        }
	        else if (this.flag.secondaryColor == COLOR_GREEN) {
	            this.structureType = STRUCTURE_EXTENSION;
	        }
	        else if (this.flag.secondaryColor == COLOR_YELLOW) {
	            this.structureType = STRUCTURE_CONTAINER;
	        }
	    }
	    static deserialize(input) {
	        let parentId = "";
	        let parentSplitIndex = input.lastIndexOf(">");
	        if (parentSplitIndex >= 0) {
	            parentId = input.substring(0, parentSplitIndex);
	        }
	        let startingBraceIndex = input.lastIndexOf("[");
	        let flagName = input.substring(startingBraceIndex, input.length - 1);
	        let flag = Game.flags[flagName];
	        if (flag == null) {
	            return null;
	        }
	        return new FlagDismantleStructure(parentId, flag);
	    }
	    getSteps() {
	        let steps = [];
	        if (this.flag.room != null) {
	            let sitesUnderFlag = this.flag.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.flag.pos);
	            if (sitesUnderFlag != null && sitesUnderFlag.length > 0) {
	                for (var index = 0; index < sitesUnderFlag.length; index++) {
	                    var type = sitesUnderFlag[index].structureType;
	                    if (this.structureType == null || type == this.structureType) {
	                        sitesUnderFlag[index].remove();
	                    }
	                }
	            }
	            let structuresUnderFlag = this.flag.room.lookForAt(LOOK_STRUCTURES, this.flag.pos);
	            if (structuresUnderFlag != null) {
	                for (var index = 0; index < structuresUnderFlag.length; index++) {
	                    var type = structuresUnderFlag[index].structureType;
	                    if (this.structureType == null || this.structureType == type) {
	                        steps.push(new taskDismantleStructure_1.DismantleStructure(screepsPtr_1.ScreepsPtr.from(structuresUnderFlag[index])));
	                    }
	                }
	            }
	        }
	        return steps;
	    }
	}
	exports.FlagDismantleStructure = FlagDismantleStructure;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class ClaimRoom extends task_1.Task {
	    constructor(controller) {
	        super(false);
	        this.controller = controller;
	        this.id = 'Claim ' + controller;
	        this.name = 'Claim ' + controller.toHtml();
	        this.possibleWorkers = -1;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CLAIMER;
	        this.near = controller;
	        this.priority = 75 /* MediumHigh */;
	        if (!controller.isShrouded && controller.instance.owner != null) {
	            this.priority = -1 /* None */;
	        }
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ claim: 1 }, 1, 1);
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        return super.createBasicAppointment(spawn, request, this.controller);
	    }
	    getPrioritizingConditions(conditions) {
	        super.getBasicPrioritizingConditions(conditions, this.controller, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.scheduledClaim = 0;
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || !this.controller.isValid || this.scheduledClaim >= this.labor.types[this.idealCreepBody.name].parts[CLAIM]) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to reserve a controller with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        let code;
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        code = creep.goClaim(this.controller);
	        if (code === OK) {
	            this.scheduledClaim += creep.getActiveBodyparts(CLAIM);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (this.possibleWorkers === 0 || this.scheduledClaim >= this.labor.types[this.idealCreepBody.name].parts[CLAIM]) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	}
	exports.ClaimRoom = ClaimRoom;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class ReserveRoom extends task_1.Task {
	    constructor(controller) {
	        super(false);
	        this.controller = controller;
	        this.id = 'Reserve ' + controller;
	        this.name = 'Reserve ' + controller.toHtml();
	        this.possibleWorkers = -1;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.RESERVER;
	        this.near = controller;
	        this.roomName = controller.pos.roomName;
	        if (controller.isShrouded) {
	            this.priority = 1000 /* Mandatory */ - 100;
	        }
	        else if (controller.instance.reservation != null) {
	            if (controller.instance.reservation.ticksToEnd < 1000) {
	                this.priority = 1000 /* Mandatory */ + 400;
	            }
	            else {
	                this.priority = 100 /* High */;
	            }
	        }
	        else {
	            this.priority = 100 /* High */;
	        }
	        if (controller.isShrouded || controller.instance.reservation == null || controller.instance.reservation.ticksToEnd < 1500) {
	            this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ claim: 2 }, 1, 2);
	        }
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        return super.createBasicAppointment(spawn, request, this.controller);
	    }
	    shouldPlanToReplace(object) {
	        if (object instanceof Creep) {
	            if (this.controller.isShrouded ||
	                this.controller.instance.reservation == null ||
	                this.controller.instance.reservation.username != 'PCake0rigin' ||
	                this.controller.instance.reservation.ticksToEnd - object.ticksToLive < 1500) {
	                return true;
	            }
	        }
	        return false;
	    }
	    getPrioritizingConditions(conditions) {
	        super.getBasicPrioritizingConditions(conditions, this.controller, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.scheduledWorkers = 0;
	        this.scheduledClaim = 0;
	    }
	    schedule(object) {
	        let claimLabor = 0;
	        if (this.labor.types[this.idealCreepBody.name] != null) {
	            claimLabor = this.labor.types[this.idealCreepBody.name].parts[CLAIM];
	        }
	        if (this.possibleWorkers === 0 || !this.controller.isValid || (claimLabor > 0 && this.scheduledClaim >= claimLabor)) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to reserve a controller with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        let code;
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        if (creep.spawnRequest == null && creep.task != this && creep.task instanceof ReserveRoom) {
	            return task_1.ERR_SKIP_WORKER;
	        }
	        code = creep.goReserve(this.controller);
	        if (code === OK) {
	            this.scheduledWorkers++;
	            this.scheduledClaim += creep.getActiveBodyparts(CLAIM);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (this.possibleWorkers === 0 ||
	            this.scheduledClaim >= claimLabor ||
	            (!this.controller.isShrouded && this.scheduledWorkers >= this.controller.instance.slots)) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	}
	exports.ReserveRoom = ReserveRoom;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class Wire extends task_1.Task {
	    constructor(pos) {
	        super(false);
	        this.pos = pos;
	        this.id = 'Wiring ' + pos;
	        this.name = 'Wiring {room ' + pos.roomName + ' pos ' + pos.x + ',' + pos.y + '}';
	        this.possibleWorkers = -1;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.WIRE;
	        this.priority = 100 /* High */ + 350;
	        this.anchor = { pos: pos, room: Game.rooms[pos.roomName] };
	        this.roomName = pos.roomName;
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({}, 1, 1);
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        return super.createBasicAppointment(spawn, request, this.anchor);
	    }
	    getPrioritizingConditions(conditions) {
	        super.getBasicPrioritizingConditions(conditions, this.anchor, this.idealCreepBody);
	    }
	    isIdeal(object) {
	        if (object instanceof Creep) {
	            return object.type === this.idealCreepBody.name;
	        }
	        return false;
	    }
	    beginScheduling() {
	        this.scheduledWorkers = 0;
	    }
	    hasWork() {
	        if (this.possibleWorkers === 0) {
	            return false;
	        }
	        if (this.labor.types[this.idealCreepBody.name] != null) {
	            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
	            if (this.scheduledWorkers >= this.labor.types[this.idealCreepBody.name].max) {
	                return false;
	            }
	        }
	        return true;
	    }
	    schedule(object) {
	        if (!this.hasWork()) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to defend a room with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        let code;
	        if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	            creep.goMoveTo(creep.spawnRequest.replacingCreep);
	            return OK;
	        }
	        if (!creep.pos.isEqualTo(this.pos)) {
	            code = creep.moveTo(this.pos);
	            if (code === ERR_TIRED) {
	                code = OK;
	            }
	        }
	        else {
	            code = OK;
	            let area = creep.room.lookForByRadiusAt(LOOK_STRUCTURES, creep, 1, true);
	            for (let spot of area) {
	                if (spot.structure.structureType === STRUCTURE_LINK) {
	                    creep.withdraw(spot.structure, RESOURCE_ENERGY);
	                }
	                if (spot.structure.structureType === STRUCTURE_TERMINAL) {
	                    creep.withdraw(spot.structure, RESOURCE_ENERGY);
	                }
	                else if (spot.structure.structureType === STRUCTURE_STORAGE) {
	                    creep.transfer(spot.structure, RESOURCE_ENERGY);
	                }
	            }
	        }
	        if (code === OK) {
	            this.scheduledWorkers++;
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (!this.hasWork()) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	}
	exports.Wire = Wire;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const sporeRemember_1 = __webpack_require__(13);
	class SporeSpawn extends Spawn {
	    get energyCapacityRemaining() {
	        return this.energyCapacity - this.energy;
	    }
	    getBody(creepBody, energyCapacityAvailable) {
	        if (energyCapacityAvailable == null) {
	            energyCapacityAvailable = this.room.energyCapacityAvailable;
	        }
	        let body = [];
	        let bodyCost = 0;
	        let totalRequirements = creepBody.requirements.length;
	        let startingRequirementIndex = 0;
	        let requiredPartsAdded = [];
	        for (let index = 0; index < 50; ++index) {
	            let cost = null;
	            let requirementIndex = startingRequirementIndex;
	            if (requirementIndex >= totalRequirements) {
	                requirementIndex = 0;
	                startingRequirementIndex = totalRequirements - 1;
	            }
	            do {
	                let requirement = creepBody.requirements[requirementIndex];
	                if (requiredPartsAdded[requirementIndex] == null || requiredPartsAdded[requirementIndex] < requirement.max) {
	                    cost = BODYPART_COST[requirement.type] * requirement.increment;
	                    startingRequirementIndex = requirementIndex + 1;
	                    break;
	                }
	                requirementIndex++;
	                if (requirementIndex >= totalRequirements) {
	                    requirementIndex = 0;
	                }
	            } while (startingRequirementIndex != requirementIndex);
	            if (cost == null) {
	                break;
	            }
	            else if ((bodyCost + cost) <= energyCapacityAvailable) {
	                bodyCost += cost;
	                let requirement = creepBody.requirements[startingRequirementIndex - 1];
	                if (requiredPartsAdded[startingRequirementIndex - 1] == null) {
	                    requiredPartsAdded[startingRequirementIndex - 1] = 0;
	                }
	                let originalRequiredPartsAdded = Math.floor(requiredPartsAdded[startingRequirementIndex - 1]);
	                requiredPartsAdded[startingRequirementIndex - 1] += requirement.increment;
	                let totalIncrement = Math.floor(requiredPartsAdded[startingRequirementIndex - 1]) - originalRequiredPartsAdded;
	                for (let increment = 0; increment < totalIncrement; ++increment) {
	                    if (requirement.type === TOUGH) {
	                        body.unshift(requirement.type);
	                    }
	                    else {
	                        body.push(requirement.type);
	                    }
	                }
	            }
	            else {
	                break;
	            }
	        }
	        return body.reverse();
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (claimReceipt.resourceType === RESOURCE_ENERGY &&
	            collector.withdraw != null &&
	            collector.carryCapacityRemaining != null) {
	            return collector.withdraw(this, claimReceipt.resourceType, Math.min(this.energy, collector.carryCapacityRemaining));
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        if (resourceType != RESOURCE_ENERGY ||
	            amount > this.energy - this.claims.energy) {
	            return null;
	        }
	        let claimAmount = amount;
	        let remaining = this.energy - this.claims.energy;
	        // ensure our remaining resource meets their claim
	        if (claimAmount > remaining) {
	            if (minAmount > remaining) {
	                return null;
	            }
	            claimAmount = remaining;
	        }
	        this.claims.count++;
	        this.claims.energy += claimAmount;
	        return new sporeClaimable_1.ClaimReceipt(this, 'spawn', resourceType, claimAmount);
	    }
	    get claims() {
	        return sporeRemember_1.Remember.byName(`spawn.${this.id}`, `claims`, function () {
	            return new Claims(this);
	        }.bind(this));
	    }
	}
	exports.SporeSpawn = SporeSpawn;
	class Claims {
	    constructor(spawn) {
	        this.spawn = spawn;
	        this.count = 0;
	        this.energy = 0;
	    }
	}


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const sporeRemember_1 = __webpack_require__(13);
	class SporeStorage extends StructureStorage {
	    get storeCount() {
	        return _.sum(this.store);
	    }
	    get storeCapacityRemaining() {
	        return this.storeCapacity - this.storeCount;
	    }
	    get memory() {
	        let roomMemory = this.room.memory;
	        let memory = roomMemory.storage;
	        if (memory == null) {
	            memory = {};
	            roomMemory.storage = memory;
	        }
	        return memory;
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (collector.withdraw != null && collector.carryCapacityRemaining != null) {
	            return collector.withdraw(this, claimReceipt.resourceType, Math.min(this.store[claimReceipt.resourceType], collector.carryCapacityRemaining));
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        if (this.claims[resourceType] == null) {
	            this.claims[resourceType] = 0;
	        }
	        let claimAmount = amount;
	        let savings = 0;
	        if (this.room.budget.savings[resourceType] != null && this.room.budget.savings[resourceType] > 0) {
	            savings = this.room.budget.savings[resourceType];
	        }
	        let remaining = this.store[resourceType] - this.claims[resourceType];
	        remaining = Math.max(remaining - savings, 0);
	        // ensure our remaining resource meets their claim
	        if (claimAmount > remaining) {
	            if (minAmount > remaining) {
	                return null;
	            }
	            claimAmount = remaining;
	        }
	        this.claims.count++;
	        this.claims[resourceType] += claimAmount;
	        return new sporeClaimable_1.ClaimReceipt(this, 'storage', resourceType, claimAmount);
	    }
	    get claims() {
	        return sporeRemember_1.Remember.byName(`storage.${this.id}`, `claims`, function () {
	            return new Claims(this);
	        }.bind(this));
	    }
	}
	exports.SporeStorage = SporeStorage;
	class Claims {
	    constructor(storage) {
	        this.storage = storage;
	        this.count = 0;
	    }
	}


/***/ },
/* 36 */
/***/ function(module, exports) {

	"use strict";
	class SporeStructure extends Structure {
	    get hitsMissing() {
	        return this.hitsMax - this.hits;
	    }
	    get needsRepair() {
	        if (this._needsRepair != null) {
	            return this._needsRepair === true;
	        }
	        let memory = this.memory;
	        if (memory == null) {
	            if (this.room.memory.structures == null) {
	                this.room.memory.structures = {};
	            }
	            memory = this.room.memory.structures[this.id];
	            if (memory == null) {
	                memory = {};
	                this.room.memory.structures[this.id] = memory;
	            }
	        }
	        this._needsRepair = memory.needsRepair;
	        return this._needsRepair === true;
	    }
	    set needsRepair(value) {
	        this._needsRepair = value;
	        if (this.memory != null) {
	            if (value === false) {
	                delete this.memory.needsRepair;
	            }
	            else {
	                this.memory.needsRepair = value;
	            }
	        }
	        else {
	            if (this.room.memory.structures == null) {
	                this.room.memory.structures = {};
	            }
	            let memory = this.room.memory.structures[this.id];
	            if (memory == null) {
	                if (value === true) {
	                    this.room.memory.structures[this.id] = {};
	                    memory.needsRepair = value;
	                }
	            }
	            else {
	                if (value === true) {
	                    memory.needsRepair = value;
	                }
	                else {
	                    delete memory.needsRepair;
	                    if (Object.getOwnPropertyNames(memory).length === 0) {
	                        delete this.room.memory.structures[this.id];
	                    }
	                }
	            }
	        }
	    }
	    get dire() {
	        if (this._dire != null) {
	            return this._dire === true;
	        }
	        let memory = this.memory;
	        if (memory == null) {
	            if (this.room.memory.structures == null) {
	                this.room.memory.structures = {};
	            }
	            memory = this.room.memory.structures[this.id];
	            if (memory == null) {
	                memory = {};
	                this.room.memory.structures[this.id] = memory;
	            }
	        }
	        this._dire = memory.dire;
	        return this._dire === true;
	    }
	    set dire(value) {
	        this._dire = value;
	        if (this.memory != null) {
	            if (value === false) {
	                delete this.memory.dire;
	            }
	            else {
	                this.memory.dire = value;
	            }
	        }
	        else {
	            if (this.room.memory.structures == null) {
	                this.room.memory.structures = {};
	            }
	            let memory = this.room.memory.structures[this.id];
	            if (memory == null) {
	                if (value === true) {
	                    this.room.memory.structures[this.id] = {};
	                    memory.dire = value;
	                }
	            }
	            else {
	                if (value === true) {
	                    memory.dire = value;
	                }
	                else {
	                    delete memory.dire;
	                    if (Object.getOwnPropertyNames(memory).length === 0) {
	                        delete this.room.memory.structures[this.id];
	                    }
	                }
	            }
	        }
	    }
	}
	exports.SporeStructure = SporeStructure;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const taskTransferResource_1 = __webpack_require__(4);
	const screepsPtr_1 = __webpack_require__(16);
	const sporeCreep_1 = __webpack_require__(7);
	const sporeRemember_1 = __webpack_require__(13);
	class SporeTower extends StructureTower {
	    get attackTarget() {
	        if (this._attackTarget != null) {
	            return this._attackTarget;
	        }
	        if (this.memory.attackTargetId != null) {
	            this._attackTarget = Game.getObjectById(this.memory.attackTargetId);
	        }
	        return this._attackTarget;
	    }
	    set attackTarget(value) {
	        this._attackTarget = value;
	        if (value != null && value.id != null) {
	            this.memory.attackTargetId = value.id;
	        }
	        else {
	            delete this.memory.attackTargetId;
	        }
	    }
	    get energyCapacityRemaining() {
	        return this.energyCapacity - this.energy;
	    }
	    get memory() {
	        let roomMemory = this.room.memory;
	        if (roomMemory.structures == null) {
	            roomMemory.structures = {};
	        }
	        let memory = roomMemory.structures[this.id];
	        if (memory == null) {
	            memory = {};
	            roomMemory.structures[this.id] = memory;
	        }
	        return memory;
	    }
	    getTasks() {
	        let tasks = [];
	        if (this.energy < this.energyCapacity) {
	            let transferEnergyTask = new taskTransferResource_1.TransferResource([screepsPtr_1.ScreepsPtr.from(this)], RESOURCE_ENERGY, null, new sporeCreep_1.CollectOptions(null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]));
	            transferEnergyTask.priority = 1000 /* Mandatory */;
	            transferEnergyTask.name = "Fill " + screepsPtr_1.ScreepsPtr.from(this).toHtml();
	            tasks.push(transferEnergyTask);
	        }
	        return tasks;
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (claimReceipt.resourceType === RESOURCE_ENERGY &&
	            collector.withdraw != null &&
	            collector.carryCapacityRemaining != null) {
	            return collector.withdraw(this, claimReceipt.resourceType, Math.min(this.energy, collector.carryCapacityRemaining));
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        if (resourceType != RESOURCE_ENERGY) {
	            return null;
	        }
	        let claimAmount = amount;
	        let remaining = this.energy - this.claims.energy;
	        // ensure our remaining resource meets their claim
	        if (claimAmount > remaining) {
	            if (minAmount > remaining) {
	                return null;
	            }
	            claimAmount = remaining;
	        }
	        this.claims.count++;
	        this.claims.energy += claimAmount;
	        return new sporeClaimable_1.ClaimReceipt(this, 'spawn', resourceType, claimAmount);
	    }
	    get claims() {
	        return sporeRemember_1.Remember.byName(`tower.${this.id}`, `claims`, function () {
	            return new Claims(this);
	        }.bind(this));
	    }
	}
	exports.SporeTower = SporeTower;
	class Claims {
	    constructor(tower) {
	        this.tower = tower;
	        this.count = 0;
	        this.energy = 0;
	    }
	}


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const sporeRemember_1 = __webpack_require__(13);
	class SporeResource extends Resource {
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (claimReceipt.resourceType === this.resourceType &&
	            collector.withdraw != null && collector.carryCapacityRemaining != null) {
	            return collector.pickup(this);
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        if (resourceType != this.resourceType) {
	            return null;
	        }
	        let claimAmount = amount;
	        let remaining = this.amount - this.claims.amount;
	        // ensure our remaining resource meets their claim
	        if (claimAmount > remaining) {
	            if (minAmount > remaining) {
	                return null;
	            }
	            claimAmount = remaining;
	        }
	        this.claims.count++;
	        this.claims.amount += claimAmount;
	        return new sporeClaimable_1.ClaimReceipt(this, 'dropped', resourceType, claimAmount);
	    }
	    get claims() {
	        return sporeRemember_1.Remember.byName(`resource.${this.id}`, `claims`, () => {
	            return new Claims(this);
	        });
	    }
	}
	exports.SporeResource = SporeResource;
	class Claims {
	    constructor(resource) {
	        this.resource = resource;
	        this.count = 0;
	        this.amount = 0;
	    }
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const sporeRemember_1 = __webpack_require__(13);
	class SporeLink extends StructureLink {
	    get energyCapacityRemaining() {
	        return this.energyCapacity - this.energy;
	    }
	    get takesTransfers() {
	        return this.memory.takesTransfers === true;
	    }
	    set takesTransfers(value) {
	        this.memory.takesTransfers = value;
	    }
	    get bond() {
	        if (this._bond != null) {
	            return this._bond;
	        }
	        if (this.memory.bondTargetId != null) {
	            this._bond = new Bond();
	            this._bond.type = this.memory.bondType;
	            this._bond.targetId = this.memory.bondTargetId;
	            this._bond.target = Game.getObjectById(this.memory.bondTargetId);
	            this._bond.targetFlag = Game.flags[this.memory.bondTargetFlagName];
	            this._bond.myFlag = Game.flags[this.memory.bondMyFlagName];
	            if (!this._bond.exists()) {
	                this._bond = null;
	                delete this.memory.bondTargetId;
	                delete this.memory.bondTargetFlagName;
	                delete this.memory.bondMyFlagName;
	                delete this.memory.bondType;
	            }
	            else if (this._bond.targetId == null && this._bond.targetFlag.room != null) {
	                if (this._bond.targetFlag.room != null) {
	                    let found = this._bond.targetFlag.room.lookForAt(this._bond.type, this._bond.targetFlag);
	                    if (found.length > 0) {
	                        this._bond.target = found[0];
	                    }
	                }
	                if (this._bond.target != null) {
	                    this._bond.targetId = this._bond.target.id;
	                }
	                if (this._bond.target == null) {
	                    this._bond = null;
	                    delete this.memory.bondTargetId;
	                    delete this.memory.bondTargetFlagName;
	                    delete this.memory.bondMyFlagName;
	                    delete this.memory.bondType;
	                }
	            }
	        }
	        return this._bond;
	    }
	    set bond(value) {
	        this._bond = value;
	        if (value == null) {
	            delete this.memory.bondType;
	            delete this.memory.bondTargetId;
	            delete this.memory.bondTargetFlagName;
	            delete this.memory.bondMyFlagName;
	        }
	        else {
	            this.memory.bondType = value.type;
	            if (value.target != null) {
	                this.memory.bondTargetId = value.target.id;
	            }
	            if (value.targetFlag != null) {
	                this.memory.bondTargetFlagName = value.targetFlag.name;
	            }
	            if (value.myFlag != null) {
	                this.memory.bondMyFlagName = value.myFlag.name;
	            }
	        }
	    }
	    get nearBySource() {
	        return sporeRemember_1.Remember.byName(`link.${this.id}`, `nearBySource`, () => {
	            if (this.memory.nearBySourceId != null) {
	                return Game.getObjectById(this.memory.nearBySourceId);
	            }
	            let nearBySource = this.pos.findClosestInRange(this.room.sources, 2);
	            if (nearBySource == null) {
	                this.memory.nearBySourceId = '';
	            }
	            else {
	                this.memory.nearBySourceId = nearBySource.id;
	            }
	            return nearBySource;
	        });
	    }
	    get memory() {
	        let roomMemory = this.room.memory;
	        if (roomMemory.structures == null) {
	            roomMemory.structures = {};
	        }
	        let memory = roomMemory.structures[this.id];
	        if (memory == null) {
	            memory = {};
	            roomMemory.structures[this.id] = memory;
	        }
	        return memory;
	    }
	    getTasks() {
	        this.memory.takesTransfers = false;
	        let transferTarget = null;
	        let tasks = [];
	        //
	        // if (this.bond == null)
	        // {
	        //     this.bond = Bond.discover(this, LOOK_SOURCES);
	        // }
	        //
	        // if (this.bond != null)
	        // {
	        //     let target: any = this.bond.target;
	        //
	        //     if (target == null)
	        //     {
	        //         target = this.bond.targetFlag.pos;
	        //     }
	        //
	        //     let transferEnergyTask = new TransferResource([ScreepsPtr.from<EnergyContainerLike>(this)], RESOURCE_ENERGY, ScreepsPtr.from<Source>(target), null);
	        //     transferEnergyTask.priority = TaskPriority.Mandatory;
	        //     transferEnergyTask.name = "Transfer energy to " + this + " from " + target;
	        //     transferEnergyTask.possibleWorkers = 1;
	        //     tasks.push(transferEnergyTask);
	        // }
	        // else
	        // {
	        if (this.nearBySource == null) {
	            this.takesTransfers = true;
	        }
	        // }
	        //
	        if (this.energy > 0 && !this.takesTransfers) {
	            transferTarget = this.findLinkTakingTransfers();
	            if (transferTarget != null) {
	                this.transferEnergy(transferTarget);
	            }
	        }
	        return tasks;
	    }
	    findLinkTakingTransfers() {
	        for (let link of this.room.links) {
	            if (link.takesTransfers === true && link.energyCapacityRemaining > 0) {
	                return link;
	            }
	        }
	        return null;
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (collector.withdraw != null && collector.carryCapacityRemaining != null) {
	            return collector.withdraw(this, claimReceipt.resourceType, Math.min(this.energy, collector.carryCapacityRemaining));
	        }
	        return ERR_INVALID_ARGS;
	    }
	    makeClaim(claimer, resourceType, amount, minAmount, isExtended) {
	        if (this.takesTransfers !== true ||
	            resourceType != RESOURCE_ENERGY) {
	            return null;
	        }
	        let claimAmount = amount;
	        let remaining = this.energy - this.claims.energy;
	        // ensure our remaining resource meets their claim
	        if (claimAmount > remaining) {
	            if (minAmount > remaining) {
	                return null;
	            }
	            claimAmount = remaining;
	        }
	        this.claims.count++;
	        this.claims.energy += claimAmount;
	        return new sporeClaimable_1.ClaimReceipt(this, 'link', resourceType, claimAmount);
	    }
	    get claims() {
	        return sporeRemember_1.Remember.byName(`link.${this.id}`, `claims`, () => {
	            return new Claims(this);
	        });
	    }
	}
	exports.SporeLink = SporeLink;
	class Claims {
	    constructor(link) {
	        this.link = link;
	        this.count = 0;
	        this.energy = 0;
	    }
	}
	class Bond {
	    exists() {
	        return (this.type != null &&
	            this.targetFlag != null &&
	            this.myFlag != null &&
	            this.myFlag.color === COLOR_YELLOW && this.targetFlag.color === COLOR_YELLOW &&
	            this.myFlag.secondaryColor === this.targetFlag.secondaryColor);
	    }
	    static discover(obj, lookType) {
	        let flagA = null;
	        let flagB = null;
	        let flags = obj.room.lookForAt(LOOK_FLAGS, obj.pos);
	        for (let index = 0; index < flags.length; index++) {
	            let flag = flags[index];
	            if (flag.color === COLOR_YELLOW) {
	                flagA = flag;
	                break;
	            }
	        }
	        if (flagA == null) {
	            return null;
	        }
	        let startsWith = function (baseString, searchString, position) {
	            position = position || 0;
	            return baseString.substr(position, searchString.length) === searchString;
	        };
	        for (let flagName in Game.flags) {
	            let flag = Game.flags[flagName];
	            if (flag != flagA &&
	                flag.color === COLOR_YELLOW &&
	                flag.secondaryColor === flagA.secondaryColor &&
	                startsWith(flag.name, flagA.name)) {
	                flagB = flag;
	                break;
	            }
	        }
	        if (flagB == null) {
	            return null;
	        }
	        let bond = new Bond();
	        bond.type = lookType;
	        bond.target = null;
	        bond.targetId = null;
	        if (flagB.room != null) {
	            let found = flagB.room.lookForAt(lookType, flagB);
	            if (found.length > 0) {
	                bond.target = found[0];
	            }
	        }
	        if (bond.target != null) {
	            bond.targetId = bond.target.id;
	        }
	        bond.targetFlag = flagB;
	        bond.myFlag = flagA;
	        return bond;
	    }
	}


/***/ },
/* 40 */
/***/ function(module, exports) {

	"use strict";
	let usedOnStart = 0;
	let enabled = false;
	let depth = 0;
	var profilingSymbol = Symbol('profiling');
	function setupProfiler() {
	    depth = 0; // reset depth, this needs to be done each tick.
	    Game.profiler = {
	        stream(duration, filter) {
	            setupMemory('stream', duration || 10, filter);
	        },
	        email(duration, filter) {
	            setupMemory('email', duration || 100, filter);
	        },
	        profile(duration, filter) {
	            setupMemory('profile', duration || 100, filter);
	        },
	        reset: resetMemory,
	    };
	    overloadCPUCalc();
	}
	function setupMemory(profileType, duration, filter) {
	    resetMemory();
	    if (!Memory.profiler) {
	        Memory.profiler = {
	            map: {},
	            totalTime: 0,
	            enabledTick: Game.time + 1,
	            disableTick: Game.time + duration,
	            type: profileType,
	            filter,
	        };
	    }
	}
	function resetMemory() {
	    Memory.profiler = null;
	}
	function overloadCPUCalc() {
	    /*if (false) {
	     usedOnStart = 0; // This needs to be reset, but only in the sim.
	     Game.cpu.getUsed = function getUsed() {
	     return performance.now() - usedOnStart;
	     };
	     }*/
	}
	function getFilter() {
	    return Memory.profiler.filter;
	}
	function wrapFunction(name, originalFunction) {
	    return function wrappedFunction() {
	        debugger;
	        if (Profiler.isProfiling()) {
	            const nameMatchesFilter = name === getFilter();
	            const start = Game.cpu.getUsed();
	            if (nameMatchesFilter) {
	                depth++;
	            }
	            const result = originalFunction.apply(this, arguments);
	            if (depth > 0 || !getFilter()) {
	                const end = Game.cpu.getUsed();
	                Profiler.record(name, end - start);
	            }
	            if (nameMatchesFilter) {
	                depth--;
	            }
	            return result;
	        }
	        return originalFunction.apply(this, arguments);
	    };
	}
	function hookUpPrototypes() {
	    Profiler.prototypes.forEach(proto => {
	        profileObjectInheritance(proto.val, proto.name);
	    });
	}
	function profileObjectInheritance(object, label) {
	    console.log('[' + label + ']');
	    let count = 0;
	    while (object != null && object != Object) {
	        if (_.includes(Object.getOwnPropertySymbols(object), profilingSymbol)) {
	            console.log('    ##########################################');
	            break;
	        }
	        if (count > 0) {
	            console.log('    ------------------------------------------');
	        }
	        profileObject(object, label);
	        object[profilingSymbol] = 'profiling';
	        object = Object.getPrototypeOf(object);
	        count++;
	    }
	}
	function profileObject(object, label) {
	    let skipMembers = [
	        "valueOf",
	        "propertyIsEnumerable",
	        "hasOwnProperty",
	        "caller",
	        "arguments",
	        "apply",
	        "call",
	        "bind",
	        "toLocaleString",
	        "toString",
	        "isPrototypeOf",
	        "prototype",
	        "__defineGetter__",
	        "__defineSetter__",
	        "__lookupGetter__",
	        "__lookupSetter__",
	        "__proto__",
	        "constructor",
	        "getUsed",
	        "length",
	        "toJSON",
	    ];
	    let propertyNames = Object.getOwnPropertyNames(object);
	    for (let index = 0; index < propertyNames.length; index++) {
	        let key = propertyNames[index];
	        if (_.includes(skipMembers, key)) {
	            continue;
	        }
	        let descriptor = Object.getOwnPropertyDescriptor(object, key);
	        let extendedLabel = `${label}.${key}`;
	        let progressLog = `    ${label}.${key}: `;
	        if (!descriptor.configurable) {
	            console.log(progressLog + ' NON-CONFIGURABLE');
	            continue;
	        }
	        let newDescriptor = {
	            enumerable: descriptor.enumerable,
	            configurable: false
	        };
	        if (typeof descriptor.value === 'function') {
	            const originalFunction = object[key];
	            object[key] = wrapFunction(key, originalFunction);
	            console.log(progressLog + 'FUNC VALUE DONE');
	            continue;
	        }
	        if (descriptor.get != null) {
	            progressLog += 'GET ';
	            newDescriptor.get = function () {
	                //console.log('Calling GET ' + label + '.' + key);
	                if (Profiler.isProfiling()) {
	                    const nameMatchesFilter = extendedLabel === getFilter();
	                    const start = Game.cpu.getUsed();
	                    if (nameMatchesFilter) {
	                        depth++;
	                    }
	                    const result = descriptor.get.apply(this);
	                    if (depth > 0 || !getFilter()) {
	                        const end = Game.cpu.getUsed();
	                        Profiler.record(extendedLabel, end - start);
	                    }
	                    if (nameMatchesFilter) {
	                        depth--;
	                    }
	                    return result;
	                }
	                return descriptor.get.apply(this);
	            };
	        }
	        if (descriptor.set != null) {
	            progressLog += 'SET ';
	            newDescriptor.set = function (value) {
	                //console.log('Calling SET ' + label + '.' + key);
	                if (Profiler.isProfiling()) {
	                    const nameMatchesFilter = extendedLabel === getFilter();
	                    const start = Game.cpu.getUsed();
	                    if (nameMatchesFilter) {
	                        depth++;
	                    }
	                    descriptor.set.apply(this, value);
	                    if (depth > 0 || !getFilter()) {
	                        const end = Game.cpu.getUsed();
	                        Profiler.record(extendedLabel, end - start);
	                    }
	                    if (nameMatchesFilter) {
	                        depth--;
	                    }
	                    return;
	                }
	                descriptor.set.apply(this, value);
	            };
	        }
	        if (newDescriptor.get == null && newDescriptor.set == null && newDescriptor.value == null) {
	            console.log(progressLog + 'SKIPPED');
	        }
	        else {
	            Object.defineProperty(object, key, newDescriptor);
	            console.log(progressLog + 'DONE');
	        }
	    }
	}
	function profileFunction(fn, functionName) {
	    const fnName = functionName || fn.name;
	    if (!fnName) {
	        console.log('Couldn\'t find a function name for - ', fn);
	        console.log('Will not profile this function.');
	        return fn;
	    }
	    return wrapFunction(fnName, fn);
	}
	const Profiler = {
	    printProfile() {
	        console.log(Profiler.output());
	    },
	    emailProfile() {
	        Game.notify(Profiler.output());
	    },
	    output() {
	        const elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
	        const header = 'calls\t\ttime\t\tavg\t\ttickAvg\t\tfunction';
	        const footer = [
	            `Avg: ${(Memory.profiler.totalTime / elapsedTicks).toFixed(2)}`,
	            `Total: ${Memory.profiler.totalTime.toFixed(2)}`,
	            `Ticks: ${elapsedTicks}`,
	        ].join('\t');
	        return [].concat(header, Profiler.lines(elapsedTicks).slice(0, 30), footer).join('\n');
	    },
	    lines(elapsedTicks) {
	        const stats = Object.keys(Memory.profiler.map).map(functionName => {
	            const functionCalls = Memory.profiler.map[functionName];
	            return {
	                name: functionName,
	                calls: functionCalls.calls,
	                totalTime: functionCalls.time,
	                averageTime: functionCalls.time / functionCalls.calls,
	                averageTick: (functionCalls.time / functionCalls.calls) * (functionCalls.calls / elapsedTicks),
	            };
	        }).sort((val1, val2) => {
	            return val2.averageTick - val1.averageTick;
	        });
	        const lines = stats.map(data => {
	            return [
	                data.calls,
	                data.totalTime.toFixed(1),
	                data.averageTime.toFixed(3),
	                data.averageTick.toFixed(3),
	                data.name,
	            ].join('\t\t');
	        });
	        return lines;
	    },
	    prototypes: [
	        { name: 'Game', val: Game },
	        { name: 'Room', val: Room.prototype },
	    ],
	    record(functionName, time) {
	        if (!Memory.profiler.map[functionName]) {
	            Memory.profiler.map[functionName] = {
	                time: 0,
	                calls: 0,
	            };
	        }
	        Memory.profiler.map[functionName].calls++;
	        Memory.profiler.map[functionName].time += time;
	    },
	    endTick() {
	        if (Game.time >= Memory.profiler.enabledTick) {
	            const cpuUsed = Game.cpu.getUsed();
	            Memory.profiler.totalTime += cpuUsed;
	            Profiler.report();
	        }
	    },
	    report() {
	        if (Profiler.shouldPrint()) {
	            Profiler.printProfile();
	        }
	        else if (Profiler.shouldEmail()) {
	            Profiler.emailProfile();
	        }
	    },
	    isProfiling() {
	        return enabled && !!Memory.profiler && Game.time <= Memory.profiler.disableTick;
	    },
	    type() {
	        return Memory.profiler.type;
	    },
	    shouldPrint() {
	        const streaming = Profiler.type() === 'stream';
	        const profiling = Profiler.type() === 'profile';
	        const onEndingTick = Memory.profiler.disableTick === Game.time;
	        return streaming || (profiling && onEndingTick);
	    },
	    shouldEmail() {
	        return Profiler.type() === 'email' && Memory.profiler.disableTick === Game.time;
	    },
	};
	exports.profiler = {
	    wrap(callback) {
	        if (enabled) {
	            setupProfiler();
	        }
	        if (Profiler.isProfiling()) {
	            usedOnStart = Game.cpu.getUsed();
	            // Commented lines are part of an on going experiment to keep the profiler
	            // performant, and measure certain types of overhead.
	            // var callbackStart = Game.cpu.getUsed();
	            const returnVal = callback();
	            // var callbackEnd = Game.cpu.getUsed();
	            Profiler.endTick();
	            // var end = Game.cpu.getUsed();
	            // var profilerTime = (end - start) - (callbackEnd - callbackStart);
	            // var callbackTime = callbackEnd - callbackStart;
	            // var unaccounted = end - profilerTime - callbackTime;
	            // console.log('total-', end, 'profiler-', profilerTime, 'callbacktime-',
	            // callbackTime, 'start-', start, 'unaccounted', unaccounted);
	            return returnVal;
	        }
	        return callback();
	    },
	    enable() {
	        enabled = true;
	        hookUpPrototypes();
	    },
	    registerObject(object, label) {
	        return profileObjectInheritance(object, label);
	    },
	    registerFN(fn, functionName) {
	        return profileFunction(fn, functionName);
	    },
	};


/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const taskRecycleCreep_1 = __webpack_require__(42);
	const screepsPtr_1 = __webpack_require__(16);
	const spawnRequest_1 = __webpack_require__(6);
	const sporeCreep_1 = __webpack_require__(7);
	const sporeRoom_1 = __webpack_require__(3);
	const sporePathFinder_1 = __webpack_require__(10);
	const sporeRemember_1 = __webpack_require__(13);
	const priority_queue_1 = __webpack_require__(43);
	class LaborPoolType {
	    constructor(parts, count) {
	        this.parts = parts;
	        this.count = count;
	        for (let name in BODYPART_COST) {
	            if (parts[name] == null) {
	                parts[name] = 0;
	            }
	        }
	    }
	}
	exports.LaborPoolType = LaborPoolType;
	class LaborPool {
	    constructor() {
	        this.types = {};
	    }
	    addCreep(creep) {
	        if (creep.type == null) {
	            return;
	        }
	        if (this.types[creep.type] == null) {
	            this.types[creep.type] = new LaborPoolType({}, 0);
	        }
	        this.types[creep.type].count++;
	        for (let part of creep.body) {
	            if (part.hits > 0) {
	                this.types[creep.type].parts[part.type]++;
	            }
	        }
	    }
	}
	exports.LaborPool = LaborPool;
	var GATHER_RESOURCE_STORES = {
	    'source': function (collection, resourceType, amount, claimer, near, excludes) {
	        if (resourceType !== RESOURCE_ENERGY) {
	            return;
	        }
	        if (!(claimer instanceof Creep)) {
	            return;
	        }
	        else if (claimer.getActiveBodyparts(WORK) === 0) {
	            return;
	        }
	        for (let source of this.sources) {
	            if (source.doIgnore !== true && source.energy > 0 && excludes[source.id] == null) {
	                collection.push(source);
	            }
	        }
	    },
	    'near_dropped': function (collection, resourceType, amount, claimer, near, excludes) {
	        let nearClaimerResources = claimer.pos.findInRange(FIND_DROPPED_RESOURCES, 5);
	        for (let resource of nearClaimerResources) {
	            if (resource.doIgnore !== true &&
	                resource.resourceType === resourceType &&
	                resource.amount > 0 &&
	                excludes[resource.id] == null) {
	                collection.push(resource);
	            }
	        }
	        if (near != null) {
	            let nearTargetResources = near.findInRange(FIND_DROPPED_RESOURCES, 5);
	            for (let resource of nearTargetResources) {
	                if (resource.doIgnore !== true &&
	                    resource.resourceType === resourceType &&
	                    resource.amount > 0 &&
	                    excludes[resource.id] == null) {
	                    collection.push(resource);
	                }
	            }
	        }
	    },
	    'dropped': function (collection, resourceType, amount, claimer, near, excludes) {
	        for (let resource of this.resources) {
	            if (resource.doIgnore !== true &&
	                resource.resourceType === resourceType &&
	                resource.amount > 0 &&
	                excludes[resource.id] == null) {
	                collection.push(resource);
	            }
	        }
	    },
	    'container': function (collection, resourceType, amount, claimer, near, excludes) {
	        for (let container of this.containers) {
	            if (container.doIgnore !== true &&
	                container.store[resourceType] > 0 &&
	                excludes[container.id] == null) {
	                collection.push(container);
	            }
	        }
	    },
	    'link': function (collection, resourceType, amount, claimer, near, excludes) {
	        if (resourceType !== RESOURCE_ENERGY) {
	            return;
	        }
	        for (let link of this.links) {
	            if (link.doIgnore !== true &&
	                link.energy > 0 &&
	                link.takesTransfers &&
	                excludes[link.id] == null) {
	                collection.push(link);
	            }
	        }
	    },
	    'storage': function (collection, resourceType, amount, claimer, near, excludes) {
	        if (this.storage != null &&
	            this.storage.doIgnore !== true &&
	            this.storage.store[resourceType] > 0 &&
	            excludes[this.storage.id] == null) {
	            let savings = this.budget.savings[resourceType];
	            if (savings != null && this.storage.store[resourceType] - amount >= savings) {
	                collection.push(this.storage);
	            }
	        }
	    },
	    'extension': function (collection, resourceType, amount, claimer, near, excludes) {
	        if (resourceType !== RESOURCE_ENERGY) {
	            return;
	        }
	        for (let extension of this.extensions) {
	            if (extension.doIgnore !== true &&
	                extension.energy > 0 &&
	                excludes[extension.id] == null) {
	                collection.push(extension);
	            }
	        }
	    },
	    'spawn': function (collection, resourceType, amount, claimer, near, excludes) {
	        if (resourceType !== RESOURCE_ENERGY) {
	            return;
	        }
	        for (let spawn of this.mySpawns) {
	            if (spawn.doIgnore !== true &&
	                spawn.energy > 0 &&
	                excludes[spawn.id] == null) {
	                collection.push(spawn);
	            }
	        }
	    },
	    'tower': function (collection, resourceType, amount, claimer, near, excludes) {
	        if (resourceType !== RESOURCE_ENERGY) {
	            return;
	        }
	        for (let tower of this.towers) {
	            if (tower.doIgnore !== true &&
	                tower.energy > 0 &&
	                excludes[tower.id] == null) {
	                collection.push(tower);
	            }
	        }
	    }
	};
	function* getCreepsToSchedule(task, creeps) {
	    console.log('[spawn requests]');
	    let spawnedCreeps = sporeRemember_1.Remember.forTick(`${task.id}.spawnedCreeps`, () => { return []; });
	    if (spawnedCreeps != null) {
	        for (let index = 0; index < spawnedCreeps.length; index++) {
	            let creep = Game.getObjectById(spawnedCreeps[index]);
	            if (creep != null) {
	                //console.log(`    ${creep.name}`);
	                yield creep;
	            }
	        }
	    }
	    // start returning the previously used creeps in order
	    console.log('[previous workers]');
	    let taskCreeps = sporeRemember_1.Remember.lastTick(`${task.id}.creeps`);
	    if (taskCreeps != null) {
	        for (let taskIndex = 0; taskIndex < taskCreeps.length; taskIndex++) {
	            let creep = Game.getObjectById(taskCreeps[taskIndex]);
	            if (creep != null) {
	                //console.log(`    ${creep.name}`);
	                yield creep;
	            }
	        }
	    }
	    // once exhausted
	    console.log('[prioritized]');
	    let conditions = [];
	    task.getPrioritizingConditions(conditions);
	    let collection = new priority_queue_1.PriorityQueue([{ value: 0, conditionIndex: 0, elements: _.values(creeps) }], (a, b) => {
	        return b.value - a.value;
	    });
	    while (collection.length > 0) {
	        let group = collection.pop();
	        if (group.elements.length === 1) {
	            //console.log(`    ${group.elements[0].name}`);
	            yield group.elements[0];
	            continue;
	        }
	        if (conditions.length <= group.conditionIndex) {
	            for (let index = 0; index < group.elements.length; index++) {
	                //console.log(`    ${group.elements[index].name}`);
	                yield group.elements[index];
	            }
	            continue;
	        }
	        //console.log(group.conditionIndex);
	        for (let index = 0; index < group.elements.length; index++) {
	            let conditionValue = conditions[group.conditionIndex](group.elements[index]);
	            if (conditionValue < 0) {
	                // No longer consider this creep for scheduling
	                continue;
	            }
	            let newValue = conditionValue + group.value;
	            let newConditionIndex = group.conditionIndex + 1;
	            let addNewGroup = true;
	            for (let cIndex = 0; cIndex < collection.length; cIndex++) {
	                let existingGroup = collection.get(cIndex);
	                if (existingGroup.conditionIndex !== newConditionIndex) {
	                    break;
	                }
	                if (existingGroup.value === newValue) {
	                    addNewGroup = false;
	                    existingGroup.elements.push(group.elements[index]);
	                    break;
	                }
	            }
	            if (addNewGroup) {
	                collection.push({ value: newValue, conditionIndex: newConditionIndex, elements: [group.elements[index]] });
	            }
	        }
	    }
	    console.log('[done]');
	}
	class SporeColony {
	    constructor() {
	        this.pathFinder = new sporePathFinder_1.SporePathFinder();
	        this.tasks = [];
	        this.tasksById = {};
	        this.spawnRequests = [];
	        this.requestsCurrentlySpawning = [];
	        this.cpuSpentPathing = 0;
	        this.pathingCpuLimit = 30;
	    }
	    get myRooms() {
	        return sporeRemember_1.Remember.byName(`colony`, `myRooms`, (function () {
	            let myRooms = [];
	            for (let roomId in Game.rooms) {
	                let room = Game.rooms[roomId];
	                if (room.my) {
	                    myRooms.push(room);
	                }
	            }
	            myRooms.sort(function (a, b) {
	                if (a.priority < b.priority) {
	                    return 1;
	                }
	                if (a.priority > b.priority) {
	                    return -1;
	                }
	                if (a.name < b.name) {
	                    return 1;
	                }
	                if (a.name > b.name) {
	                    return -1;
	                }
	                return 0;
	            });
	            return myRooms;
	        }).bind(this));
	    }
	    run() {
	        this.tasks = [];
	        this.tasksById = {};
	        this.spawnRequests.length = 0;
	        this.requestsCurrentlySpawning.length = 0;
	        let rooms = this.myRooms;
	        for (let room of rooms) {
	            room.trackEconomy();
	        }
	        this.collectTasks(rooms);
	        let creeps = {};
	        for (let name in Game.creeps) {
	            let creep = Game.creeps[name];
	            if (creep.spawning) {
	                continue;
	            }
	            let spawnRequest = creep.spawnRequest;
	            if (spawnRequest != null) {
	                if (spawnRequest.id == null || spawnRequest.id.length === 0 || spawnRequest.replacingCreep == null) {
	                    creep.spawnRequest = null;
	                }
	                else {
	                    if (spawnRequest.task != null) {
	                        let spawnedCreeps = sporeRemember_1.Remember.forTick(`${spawnRequest.task.id}.spawnedCreeps`, () => { return []; });
	                        spawnedCreeps.push(creep.id);
	                    }
	                    else if (spawnRequest.replacingCreep != null && spawnRequest.replacingCreep.task != null) {
	                        let spawnedCreeps = sporeRemember_1.Remember.forTick(`${spawnRequest.replacingCreep.task.id}.spawnedCreeps`, () => { return []; });
	                        spawnedCreeps.push(creep.id);
	                    }
	                    this.requestsCurrentlySpawning.push(creep.spawnRequest.id);
	                }
	            }
	            if (creep.spawnRequest == null) {
	                creeps[creep.name] = creep;
	            }
	        }
	        for (let index = 0; !_.isEmpty(creeps) && index < this.tasks.length; index++) {
	            let task = this.tasks[index];
	            console.log(`[[${task.name}]]`);
	            this.scheduleTask(task, creeps);
	        }
	        for (let name in creeps) {
	            let creep = creeps[name];
	            if (creep != null) {
	                creep.task = null;
	                creep.say('\u{1F4A4}');
	            }
	        }
	        this.spawnCreeps();
	        let totalSurplusCreeps = _.size(creeps);
	        console.log("Surplus Creeps: " + totalSurplusCreeps);
	        //this.recycleCreeps(creeps);
	    }
	    scheduleTask(task, creeps) {
	        let scheduledCreeps = [];
	        task.beginScheduling();
	        let code = OK;
	        let creepTaskPriority = 0;
	        for (let creep of getCreepsToSchedule(task, creeps)) {
	            if (code === task_1.ERR_NO_WORK) {
	                break;
	            }
	            code = task.schedule(creep);
	            // if (task instanceof TransferResource)
	            // {
	            //     console.log('    ' + code);
	            // }
	            if (code >= 0 || (creep.spawnRequest != null && creep.spawnRequest.task == task)) {
	                scheduledCreeps.push(creep);
	                if (task.isIdeal(creep)) {
	                    creep.task = task;
	                    creep.taskPriority = creepTaskPriority;
	                    creepTaskPriority++;
	                }
	                else {
	                    creep.task = null;
	                }
	                // remove creep now that it's been scheduled
	                creeps[creep.name] = null;
	                delete creeps[creep.name];
	                if (creep.spawnRequest != null && creep.spawnRequest.replacingCreep != null) {
	                    console.log("Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id) + ' ' + creep.type + ' REPLACEMENT');
	                }
	                else {
	                    console.log("Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id) + ' ' + creep.type);
	                }
	                if (creep.ticksToLive < 300 &&
	                    sporeCreep_1.CREEP_TYPE[creep.type] != null &&
	                    creep.task != null &&
	                    task.labor.types[creep.type] != null &&
	                    task.shouldPlanToReplace(creep)) {
	                    this.spawnRequests.push(new spawnRequest_1.SpawnRequest('replace_' + creep.name, null, creep, sporeCreep_1.CREEP_TYPE[creep.type]));
	                }
	                this.schedulePassives(creep);
	                if (code === task_1.NO_MORE_WORK) {
	                    break;
	                }
	            }
	            else {
	                if (creep.task == task) {
	                    creep.task = null;
	                }
	                if (creep.spawnRequest != null && creep.spawnRequest.task == task) {
	                    creep.spawnRequest = null;
	                }
	                if (code === task_1.ERR_NO_WORK) {
	                    break;
	                }
	                else if (code === task_1.ERR_CANNOT_PERFORM_TASK) {
	                    //skip this creep
	                    console.log('   ' + creep + ' ERR_CANNOT_PERFORM_TASK ' + task.id);
	                }
	                else if (code === task_1.ERR_SKIP_WORKER) {
	                }
	                else {
	                    console.log("UNKNOWN ERROR FROM SCHEDULING: " + task.id + " creep: " + creep + " code: " + code);
	                }
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
	        if (code !== task_1.NO_MORE_WORK && code !== task_1.ERR_NO_WORK) {
	            this.calculateLaborPool(task, scheduledCreeps);
	        }
	    }
	    calculateLaborPool(task, scheduledCreeps) {
	        debugger;
	        let laborPool = new LaborPool();
	        for (let index = 0; index < scheduledCreeps.length; index++) {
	            let creep = scheduledCreeps[index];
	            if (creep.type != null && task.labor.types[creep.type] != null) {
	                laborPool.addCreep(creep);
	            }
	        }
	        let log = false;
	        // if (task instanceof UpgradeRoomController)
	        // {
	        //     log = true;
	        // }
	        for (let name in task.labor.types) {
	            let type = task.labor.types[name];
	            if (type == null) {
	                continue;
	            }
	            if (laborPool.types[name] == null) {
	                laborPool.types[name] = new LaborPoolType({}, 0);
	            }
	            let typePool = laborPool.types[name];
	            let doSpawn = false;
	            if (log) {
	                console.log(task.name + ' -> ' + name + ': ' + type.min + ' > ' + typePool.count);
	            }
	            if (type.min > typePool.count) {
	                //console.log(task.name + ' -> ' + name + ': '+ type.min + ' > ' + typePool.count);
	                doSpawn = true;
	            }
	            if (!doSpawn) {
	                for (let partName in type.parts) {
	                    if (log) {
	                        console.log(task.name + ' -> ' + partName + ': ' + type.parts[partName] + ' > ' + typePool.parts[partName]);
	                    }
	                    if (type.parts[partName] > typePool.parts[partName]) {
	                        //console.log(task.name + ' -> ' + partName + ': '+ type.parts[partName] + ' > ' + typePool.parts[partName]);
	                        doSpawn = true;
	                        break;
	                    }
	                }
	            }
	            if (log) {
	                console.log(task.name + ' -> ' + name + ': ' + type.max + ' > ' + typePool.count);
	            }
	            if (doSpawn && type.max > typePool.count) {
	                //console.log(task.name + ' -> ' + name + ': '+ type.max + ' > ' + typePool.count);
	                this.spawnRequests.push(new spawnRequest_1.SpawnRequest('new_: ' + task.id, task, null, sporeCreep_1.CREEP_TYPE[name]));
	            }
	        }
	    }
	    schedulePassives(creep) {
	        if (creep.action === sporeCreep_1.ACTION_MOVE || creep.action == null) {
	            let structures = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos);
	            if (structures.length > 0) {
	                for (let structure of structures) {
	                    if (structure.hits < structure.hitsMax) {
	                        creep.repair(structure);
	                        break;
	                    }
	                }
	            }
	            else {
	                let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos);
	                if (sites.length > 0) {
	                    creep.build(sites[0]);
	                }
	            }
	        }
	    }
	    collectTasks(rooms) {
	        let globalTasks = [];
	        //////////////////////////////////////////////////////////////////////////////
	        // turn flags into tasks
	        for (let name in Game.flags) {
	            let flag = Game.flags[name];
	            globalTasks.push.apply(globalTasks, flag.getTasks());
	        }
	        for (let room of rooms) {
	            globalTasks.push.apply(globalTasks, room.getTasks());
	        }
	        this.breakdownTasks(globalTasks, this.tasks);
	        this.sortTasks(this.tasks);
	        console.log("total tasks: " + this.tasks.length);
	        for (let taskIndex = 0; taskIndex < this.tasks.length; taskIndex++) {
	            let task = this.tasks[taskIndex];
	            if (task.roomName == null) {
	                console.log('   [global]' + task.priority + " -> " + ((task.name != null) ? task.name : task.id));
	            }
	            else {
	                console.log('   [' + task.roomName + ']' + task.priority + " -> " + ((task.name != null) ? task.name : task.id));
	            }
	        }
	    }
	    sortTasks(tasks) {
	        // Sort the basic tasks by their priority
	        tasks.sort(function (a, b) {
	            if (a.roomName == null && b.roomName != null) {
	                return 1;
	            }
	            if (a.roomName != null && b.roomName == null) {
	                return -1;
	            }
	            if (a.roomName != null && b.roomName != null) {
	                if (sporeRoom_1.SporeRoom.getPriority(a.roomName) < sporeRoom_1.SporeRoom.getPriority(b.roomName)) {
	                    return 1;
	                }
	                if (sporeRoom_1.SporeRoom.getPriority(a.roomName) > sporeRoom_1.SporeRoom.getPriority(b.roomName)) {
	                    return -1;
	                }
	            }
	            if (a.priority < b.priority) {
	                return 1;
	            }
	            if (a.priority > b.priority) {
	                return -1;
	            }
	            if (a.id < b.id) {
	                return 1;
	            }
	            if (a.id > b.id) {
	                return -1;
	            }
	            return 0;
	        });
	    }
	    breakdownTasks(tasks, outputTasks) {
	        // Breakdown tasks
	        for (let index = 0; index < tasks.length; index++) {
	            let task = tasks[index];
	            if (task.isComplex) {
	                let subTasks = task.getSteps();
	                tasks.push.apply(tasks, subTasks);
	            }
	            else if (this.tasksById[task.id] == null) {
	                outputTasks.push(task);
	                this.tasksById[task.id] = task;
	            }
	            else {
	                if (this.tasksById[task.id].priority !== task.priority) {
	                    outputTasks.push(task);
	                    this.tasksById[task.id] = task;
	                }
	            }
	        }
	    }
	    sortAppointments(appointments) {
	        appointments.sort(function (a, b) {
	            let spawnRoomName = a.spawn.pos.roomName;
	            let taskA = a.task;
	            if (taskA == null && a.replacingCreep != null) {
	                taskA = a.replacingCreep.task;
	            }
	            let taskB = b.task;
	            if (taskB == null && b.replacingCreep != null) {
	                taskB = b.replacingCreep.task;
	            }
	            if (taskA == null && taskB != null) {
	                return 1;
	            }
	            if (taskA != null && taskB == null) {
	                return -1;
	            }
	            if (taskA == null && taskB == null) {
	                // tasks with more urgency should be favored
	                if (a.spawnPriority < b.spawnPriority) {
	                    return 1;
	                }
	                if (a.spawnPriority > b.spawnPriority) {
	                    return -1;
	                }
	                if (a.ticksTillRequired < b.ticksTillRequired) {
	                    return -1;
	                }
	                if (a.ticksTillRequired > b.ticksTillRequired) {
	                    return 1;
	                }
	            }
	            // global tasks should only be favored after all of the individual rooms needs are met
	            if (taskA.roomName == null && (taskB.roomName != null && taskB.roomName === spawnRoomName)) {
	                console.log(taskA.name + ' missing room identifier');
	                return 1;
	            }
	            if ((taskA.roomName != null && taskA.roomName === spawnRoomName) && taskB.roomName == null) {
	                console.log(taskB.name + ' missing room identifier');
	                return -1;
	            }
	            // tasks in the same room as the spawn should be favored over other rooms needs
	            if (taskA.roomName !== spawnRoomName && taskB.roomName === spawnRoomName) {
	                return 1;
	            }
	            if (taskA.roomName === spawnRoomName && taskB.roomName !== spawnRoomName) {
	                return -1;
	            }
	            let roomA = Game.rooms[taskA.roomName];
	            let roomB = Game.rooms[taskB.roomName];
	            if (roomA == null && roomB != null) {
	                return 1;
	            }
	            if (roomA != null && roomB == null) {
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
	            if (taskA.priority < taskB.priority) {
	                return 1;
	            }
	            if (taskA.priority > taskB.priority) {
	                return -1;
	            }
	            // tasks with more urgency should be favored
	            if (a.spawnPriority < b.spawnPriority) {
	                return 1;
	            }
	            if (a.spawnPriority > b.spawnPriority) {
	                return -1;
	            }
	            if (a.ticksTillRequired < b.ticksTillRequired) {
	                return -1;
	            }
	            if (a.ticksTillRequired > b.ticksTillRequired) {
	                return 1;
	            }
	            return 0;
	        });
	    }
	    getSpawnAppointments(request, spawns) {
	        let appointments = [];
	        for (let name in spawns) {
	            let spawn = spawns[name];
	            let appointment;
	            let task = request.task;
	            if (task == null && request.replacingCreep != null) {
	                task = request.replacingCreep.task;
	            }
	            if (task != null) {
	                appointment = task.createAppointment(spawn, request);
	                if (appointment == null || appointment.spawnPriority === -1) {
	                    console.log('Skipping Appointment: ' + request.id + ' ' + request.creepBody.name);
	                    continue;
	                }
	            }
	            else if (request.replacingCreep == null) {
	                appointment = new spawnRequest_1.SpawnAppointment(request.id, null, 0.001, spawn, 0, null, request.creepBody);
	            }
	            else {
	                console.log('Skipping Appointment: ' + request.id + ' ' + request.creepBody.name);
	            }
	            if (appointment != null) {
	                appointments.push(appointment);
	            }
	        }
	        return appointments;
	    }
	    spawnCreeps() {
	        // 1. Rooms should not spawn creeps for low level tasks that can't be completed before a higher level task needs a spawn
	        // 2. Rooms should favor requests from their own room
	        // 3. When available, higher level rooms should build better creeps for nearby lower level rooms [aka favor over building them in the lower level rooms]
	        // 4. When available, higher level rooms should build creeps for other rooms who can't
	        let appointmentsBySpawn = {};
	        let spawns = {};
	        let hasNonWorkingSpawn = false;
	        for (let name in Game.spawns) {
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
	        if (!hasNonWorkingSpawn) {
	            return;
	        }
	        for (let request of this.spawnRequests) {
	            if (this.requestsCurrentlySpawning.indexOf(request.id) !== -1) {
	                continue;
	            }
	            let prioritizedSpawnAppointments = this.getSpawnAppointments(request, spawns);
	            for (let appointment of prioritizedSpawnAppointments) {
	                appointmentsBySpawn[appointment.spawn.name].push(appointment);
	            }
	        }
	        let spawnsList = _.values(spawns);
	        spawnsList.sort(function (a, b) {
	            if (a.room.energyCapacityAvailable < b.room.energyCapacityAvailable) {
	                return 1;
	            }
	            if (a.room.energyCapacityAvailable > b.room.energyCapacityAvailable) {
	                return -1;
	            }
	            if (a.room.name < b.room.name) {
	                return 1;
	            }
	            if (a.room.name > b.room.name) {
	                return -1;
	            }
	            return 0;
	        });
	        for (let spawn of spawnsList) {
	            if (appointmentsBySpawn[spawn.name].length === 0) {
	                continue;
	            }
	            this.sortAppointments(appointmentsBySpawn[spawn.name]);
	            for (let appointment of appointmentsBySpawn[spawn.name]) {
	                console.log('Appointment: ' + appointment.id + ' ' + appointment.creepBody.name + ' ' + appointment.ticksTillRequired);
	            }
	            // have each vote for what it can handle
	            // the highest prioritize spawn for each request that vote wins
	            let priorityAppointment = null;
	            let priorityBody = null;
	            let priorityBodySpawnTime = null;
	            for (let index = 0; index < appointmentsBySpawn[spawn.name].length; index++) {
	                let appointment = appointmentsBySpawn[spawn.name][index];
	                let body = appointment.spawn.getBody(appointment.creepBody);
	                let bodySpawnTime = body.length * CREEP_SPAWN_TIME;
	                if (priorityAppointment == null || appointment.ticksTillRequired + bodySpawnTime < priorityAppointment.ticksTillRequired - 10) {
	                    priorityAppointment = appointment;
	                    priorityBody = body; //priorityAppointment.spawn.getBody(priorityAppointment.creepBody);
	                    priorityBodySpawnTime = bodySpawnTime; //priorityBody.length * CREEP_SPAWN_TIME;
	                }
	            }
	            if (priorityAppointment != null && priorityAppointment.ticksTillRequired <= 0) {
	                this.spawnCreep(priorityAppointment);
	            }
	        }
	    }
	    spawnCreep(appointment) {
	        let spawn = appointment.spawn;
	        let creepBody = appointment.creepBody;
	        if (spawn.spawning != null) {
	            return;
	        }
	        let body = spawn.getBody(creepBody);
	        if (spawn.canCreateCreep(body, undefined) === OK) {
	            let taskId = (appointment.task != null) ? appointment.task.id : null;
	            let replacingCreepName = (appointment.replacingCreep != null) ? appointment.replacingCreep.name : null;
	            spawn.createCreep(body, undefined, { type: creepBody.name, spawnRequest: { id: appointment.id, taskId: taskId, replacingCreepName: replacingCreepName } });
	        }
	    }
	    recycleCreeps(creeps, rooms) {
	        let totalSurplusCreeps = _.size(creeps);
	        console.log("Surplus Creeps: " + totalSurplusCreeps);
	        // Recycle surplus creeps
	        let allowedSurplusCreepsPerRoom = 6;
	        if (totalSurplusCreeps > allowedSurplusCreepsPerRoom) {
	            let creepByRoom = _.groupBy(creeps, function (c) { return c.room.name; });
	            for (let room of rooms) {
	                let roomCreeps = creepByRoom[room.name];
	                if (roomCreeps == null) {
	                    continue;
	                }
	                if (roomCreeps.length > allowedSurplusCreepsPerRoom && room.mySpawns.length > 0) {
	                    let recycleTask = new taskRecycleCreep_1.RecycleCreep(screepsPtr_1.ScreepsPtr.from(room.mySpawns[0]));
	                    // Sort the creeps so the cheapest ones get recycled first
	                    roomCreeps.sort(function (a, b) {
	                        if (a.body.length < b.body.length) {
	                            return 1;
	                        }
	                        if (a.body.length > b.body.length) {
	                            return -1;
	                        }
	                        return 0;
	                    });
	                    for (let index = 0; index < roomCreeps.length - allowedSurplusCreepsPerRoom; index++) {
	                        let creep = roomCreeps[index];
	                        if (recycleTask.schedule(creep) === ERR_NO_BODYPART) {
	                            creep.suicide();
	                        }
	                    }
	                }
	            }
	        }
	    }
	    claimResource(claimer, resourceType, amount, minAmount, isExtended, near, options, excludes, receipt) {
	        if (receipt != null && receipt.target != null && excludes[receipt.target.id] == null) {
	            let flatStorePriorities = _.flattenDeep(options.storePriorities);
	            if (_.includes(flatStorePriorities, receipt.type) ||
	                _.includes(flatStorePriorities, receipt.target.id)) {
	                let claim = receipt.target.makeClaim(claimer, resourceType, amount, minAmount, isExtended);
	                if (claim !== null) {
	                    return claim;
	                }
	            }
	        }
	        if (options.roomNames == null || options.roomNames.length === 0) {
	            options.roomNames = [];
	            options.roomNames.push(claimer.pos.roomName);
	        }
	        for (let priorityIndex = 0; priorityIndex < options.storePriorities.length; priorityIndex++) {
	            let group = options.storePriorities[priorityIndex];
	            let claimables = [];
	            for (let index = 0; index < group.length; index++) {
	                for (let roomName of options.roomNames) {
	                    if (Game.rooms[roomName] != null) {
	                        GATHER_RESOURCE_STORES[group[index]].bind(Game.rooms[roomName])(claimables, resourceType, amount, claimer, near, excludes);
	                    }
	                }
	            }
	            if (claimables.length > 0) {
	                near.sortByRangeTo(claimables);
	                for (let claimable of claimables) {
	                    if (claimable.makeClaim == null) {
	                        continue;
	                    }
	                    let newReceipt = claimable.makeClaim(claimer, resourceType, amount, minAmount, isExtended);
	                    if (newReceipt != null) {
	                        return newReceipt;
	                    }
	                }
	            }
	        }
	        return null;
	    }
	}
	exports.SporeColony = SporeColony;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	class RecycleCreep extends task_1.Task {
	    constructor(spawn) {
	        super(false);
	        this.spawn = spawn;
	        this.id = "Recycle " + spawn;
	        this.priority = 75 /* MediumHigh */;
	        this.name = "Recycling at " + spawn;
	        this.possibleWorkers = -1;
	        this.near = spawn;
	    }
	    getPrioritizingConditions(conditions) {
	        conditions.push((creep) => {
	            return (50 - creep.body.length) / 50;
	        });
	    }
	    isIdeal(object) {
	        return false;
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || !this.spawn.isValid || !(object instanceof Creep)) {
	            return task_1.ERR_NO_WORK;
	        }
	        let creep = object;
	        let code = creep.goRecycle(this.spawn);
	        if (code == OK && this.possibleWorkers > 0) {
	            this.possibleWorkers--;
	        }
	        return code;
	    }
	}
	exports.RecycleCreep = RecycleCreep;


/***/ },
/* 43 */
/***/ function(module, exports) {

	'use strict';
	class PriorityQueue {
	    constructor(data, compare) {
	        this.data = data;
	        this.data = data || [];
	        this.length = this.data.length;
	        this.compare = compare || PriorityQueue.defaultCompare;
	        if (data != null) {
	            for (let i = Math.floor(this.length / 2); i >= 0; i--) {
	                this._down(i);
	            }
	        }
	    }
	    push(item) {
	        this.data.push(item);
	        this.length++;
	        this._up(this.length - 1);
	    }
	    pop() {
	        let top = this.data[0];
	        this.data[0] = this.data[this.length - 1];
	        this.length--;
	        this.data.pop();
	        this._down(0);
	        return top;
	    }
	    peek() {
	        return this.data[0];
	    }
	    get(index) {
	        return this.data[index];
	    }
	    _up(pos) {
	        let data = this.data;
	        let compare = this.compare;
	        while (pos > 0) {
	            let parent = Math.floor((pos - 1) / 2);
	            if (compare(data[pos], data[parent]) < 0) {
	                PriorityQueue.swap(data, parent, pos);
	                pos = parent;
	            }
	            else
	                break;
	        }
	    }
	    _down(pos) {
	        let data = this.data, compare = this.compare, len = this.length;
	        while (true) {
	            let left = 2 * pos + 1, right = left + 1, min = pos;
	            if (left < len && compare(data[left], data[min]) < 0)
	                min = left;
	            if (right < len && compare(data[right], data[min]) < 0)
	                min = right;
	            if (min === pos)
	                return;
	            PriorityQueue.swap(data, min, pos);
	            pos = min;
	        }
	    }
	    static defaultCompare(a, b) {
	        return a < b ? -1 : a > b ? 1 : 0;
	    }
	    static swap(data, i, j) {
	        let tmp = data[i];
	        data[i] = data[j];
	        data[j] = tmp;
	    }
	}
	exports.PriorityQueue = PriorityQueue;


/***/ }
/******/ ]);