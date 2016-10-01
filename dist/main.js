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

	/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
	"use strict";
	const spore_1 = __webpack_require__(2);
	const sporeColony_1 = __webpack_require__(33);
	module.exports.loop = function () {
	    for (let name in Memory.creeps) {
	        if (!Game.creeps[name]) {
	            delete Memory.creeps[name];
	            console.log('Clearing non-existing creep memory:', name);
	        }
	    }
	    spore_1.Spore.inject();
	    spore_1.Spore.colony = new sporeColony_1.SporeColony();
	    spore_1.Spore.colony.run();
	};
	//# sourceMappingURL=main.js.map

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeRoom_1 = __webpack_require__(3);
	const sporeCreep_1 = __webpack_require__(7);
	const sporeSource_1 = __webpack_require__(14);
	const sporeRoomObject_1 = __webpack_require__(16);
	const sporeConstructionSite_1 = __webpack_require__(17);
	const sporeContainer_1 = __webpack_require__(19);
	const sporeController_1 = __webpack_require__(20);
	const sporeExtension_1 = __webpack_require__(21);
	const sporeFlag_1 = __webpack_require__(22);
	const sporeRoomPosition_1 = __webpack_require__(26);
	const sporeSpawn_1 = __webpack_require__(27);
	const sporeStorage_1 = __webpack_require__(28);
	const sporeStructure_1 = __webpack_require__(29);
	const sporeTower_1 = __webpack_require__(30);
	const sporeResource_1 = __webpack_require__(31);
	const sporeLink_1 = __webpack_require__(32);
	class Spore {
	    constructor() {
	    }
	    static inject() {
	        function completeAssign(target, ...sources) {
	            sources.forEach(source => {
	                let descriptors = Object.getOwnPropertyNames(source).reduce((descriptors, key) => {
	                    if (key != "constructor" && key != "colony") {
	                        descriptors[key] = Object.getOwnPropertyDescriptor(source, key);
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
	                    Object.defineProperty(target, "colony", { get: function () { return Spore.colony; } });
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
	    }
	}
	Spore.colony = null;
	exports.Spore = Spore;
	//# sourceMappingURL=spore.js.map

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const taskTransferResource_1 = __webpack_require__(4);
	const taskUpgradeRoomController_1 = __webpack_require__(10);
	const taskRepairStructure_1 = __webpack_require__(11);
	const screepsPtr_1 = __webpack_require__(12);
	const taskHarvestEnergy_1 = __webpack_require__(13);
	const taskBuildBarrier_1 = __webpack_require__(15);
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
	// List of allies, name must be lower case.
	const USERNAME_WHITELIST = [
	    'pcakecysote',
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
	// declare var STRUCTURE_KEEPER_LAIR: string;
	// declare var STRUCTURE_STORAGE: string;
	// declare var STRUCTURE_OBSERVER: string;
	// declare var STRUCTURE_POWER_BANK: string;
	// declare var STRUCTURE_POWER_SPAWN: string;
	// declare var STRUCTURE_EXTRACTOR: string;
	// declare var STRUCTURE_LAB: string;
	// declare var STRUCTURE_TERMINAL: string;
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
	    constructor(...args) {
	        super(...args);
	        this.untaskedCreepsByName = {};
	        this.tasksById = {};
	        this.tasks = [];
	        this.basicTasks = [];
	        this._resources = null;
	        this._resourcesFindTick = -1;
	    }
	    get budget() {
	        let memory = Memory.rooms[this.name];
	        if (memory == null) {
	            memory = {};
	            Memory.rooms[this.name] = memory;
	        }
	        if (memory.budget == null) {
	            memory.budget = new Budget();
	        }
	        Object.defineProperty(this, "budget", { value: memory.budget });
	        return memory.budget;
	    }
	    get my() {
	        let my = this.controller != null && (this.controller.my || (this.controller.reservation != null && this.controller.reservation.username == 'PCake0rigin'));
	        Object.defineProperty(this, "my", { value: my });
	        return my;
	    }
	    get priority() {
	        let memory = Memory.rooms[this.name];
	        if (memory == null) {
	            memory = {};
	            Memory.rooms[this.name] = memory;
	        }
	        if (memory.priority == null) {
	            memory.priority = 100;
	        }
	        if (this.my && memory.priority <= 100) {
	            memory.priority = 500;
	        }
	        Object.defineProperty(this, "priority", { value: memory.priority });
	        return memory.priority;
	    }
	    get sources() {
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
	        Object.defineProperty(this, "sources", { value: sources });
	        return sources;
	    }
	    get mySpawns() {
	        let spawns = this.find(FIND_MY_SPAWNS);
	        Object.defineProperty(this, "mySpawns", { value: spawns });
	        return spawns;
	    }
	    get structures() {
	        let structures = this.find(FIND_STRUCTURES);
	        Object.defineProperty(this, "structures", { value: structures });
	        return structures;
	    }
	    get extensions() {
	        let extensions = this.find(FIND_STRUCTURES, {
	            filter: {
	                structureType: STRUCTURE_EXTENSION
	            }
	        });
	        //Object.defineProperty(this, "extensions", {value: extensions});
	        return extensions;
	    }
	    get containers() {
	        let containers = this.find(FIND_STRUCTURES, {
	            filter: {
	                structureType: STRUCTURE_CONTAINER
	            }
	        });
	        Object.defineProperty(this, "containers", { value: containers });
	        return containers;
	    }
	    get ramparts() {
	        let ramparts = this.find(FIND_STRUCTURES, {
	            filter: {
	                structureType: STRUCTURE_RAMPART
	            }
	        });
	        Object.defineProperty(this, "ramparts", { value: ramparts });
	        return ramparts;
	    }
	    get towers() {
	        let towers = this.find(FIND_STRUCTURES, {
	            filter: {
	                structureType: STRUCTURE_TOWER
	            }
	        });
	        Object.defineProperty(this, "towers", { value: towers });
	        return towers;
	    }
	    get links() {
	        let links = this.find(FIND_STRUCTURES, {
	            filter: {
	                structureType: STRUCTURE_LINK
	            }
	        });
	        Object.defineProperty(this, "links", { value: links });
	        return links;
	    }
	    get resources() {
	        if (this._resources != null && this._resourcesFindTick === Game.time) {
	            return this._resources;
	        }
	        this._resources = this.find(FIND_DROPPED_RESOURCES);
	        this._resourcesFindTick = Game.time;
	        return this._resources;
	    }
	    get constructionSites() {
	        let constructionSites = this.find(FIND_CONSTRUCTION_SITES);
	        Object.defineProperty(this, "constructionSites", { value: constructionSites });
	        return constructionSites;
	    }
	    get myCreeps() {
	        let myCreeps = this.find(FIND_MY_CREEPS);
	        Object.defineProperty(this, "myCreeps", { value: myCreeps });
	        return myCreeps;
	    }
	    get hostileCreeps() {
	        let hostilesCreeps = this.find(FIND_HOSTILE_CREEPS, {
	            filter: (creep) => {
	                return USERNAME_WHITELIST.indexOf(creep.owner.username.toLowerCase()) === -1;
	            }
	        });
	        Object.defineProperty(this, "hostileCreeps", { value: hostilesCreeps });
	        return hostilesCreeps;
	    }
	    get friendlyCreeps() {
	        let friendlyCreeps = this.find(FIND_HOSTILE_CREEPS, {
	            filter: (creep) => {
	                return USERNAME_WHITELIST.indexOf(creep.owner.username.toLowerCase()) > -1;
	            }
	        });
	        Object.defineProperty(this, "friendlyCreeps", { value: friendlyCreeps });
	        return friendlyCreeps;
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
	        // for (let creep of this.myCreeps)
	        // {
	        //     this.economy.countStoreResources(creep.carry);
	        // }
	        console.log(this + ' economy energy ' + this.economy.resources.energy);
	    }
	    claimResource(claimer, resourceType, amount, minAmount, isExtended, near, storePriorities, excludes, receipt) {
	        if (receipt != null && receipt.target != null && excludes[receipt.target.id] == null) {
	            let flatStorePriorities = _.flattenDeep(storePriorities);
	            if (_.includes(flatStorePriorities, receipt.type) ||
	                _.includes(flatStorePriorities, receipt.target.id)) {
	                let claim = receipt.target.makeClaim(claimer, resourceType, amount, minAmount, isExtended);
	                if (claim !== null) {
	                    return claim;
	                }
	            }
	        }
	        for (let priorityIndex = 0; priorityIndex < storePriorities.length; priorityIndex++) {
	            let group = storePriorities[priorityIndex];
	            let claimables = [];
	            for (let index = 0; index < group.length; index++) {
	                GATHER_RESOURCE_STORES[group[index]].bind(this)(claimables, resourceType, amount, claimer, near, excludes);
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
	    getTasks() {
	        let tasks = [];
	        //////////////////////////////////////////////////////////////////////////////
	        // Activate safe mode
	        {
	            if (this.controller.safeModeAvailable > 0 && this.controller.safeMode == null) {
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
	                task.priority = 1000 /* Mandatory */ + 25;
	                let spawn = source.pos.findClosestByPath(this.mySpawns, { ignoreCreeps: true });
	                if (spawn != null) {
	                    task.priority += Math.max(0, 150 - source.pos.findPathTo(spawn.pos, { ignoreCreeps: true }).length);
	                }
	                tasks.push(task);
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
	                let task = new taskTransferResource_1.TransferResource(transferTargets, RESOURCE_ENERGY, null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped'], ['source']]);
	                task.priority = 1000 /* Mandatory */ + 200;
	                task.id = "Fill Spawns and Extensions " + this;
	                task.name = task.id;
	                //task.reserveWorkers = true;
	                tasks.push(task);
	            }
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Fill storage
	        {
	            if (this.storage != null && this.storage.storeCapacityRemaining) {
	                let transferEnergyTask = new taskTransferResource_1.TransferResource([screepsPtr_1.ScreepsPtr.from(this.storage)], RESOURCE_ENERGY, null, [['near_dropped'], ['link', 'container'], ['dropped']]);
	                transferEnergyTask.priority = 100 /* High */;
	                transferEnergyTask.name = "Transfer energy to " + this;
	                transferEnergyTask.possibleWorkers = 1;
	                tasks.push(transferEnergyTask);
	            }
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Upgrade room controller
	        {
	            let task = new taskUpgradeRoomController_1.UpgradeRoomController(screepsPtr_1.ScreepsPtr.from(this.controller));
	            tasks.push(task);
	        }
	        //////////////////////////////////////////////////////////////////////////////
	        // Reinforce barriers
	        {
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
	                if (!structure.doIgnore && structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL) {
	                    return true;
	                }
	                return false;
	            });
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
	            this.ramparts.forEach(x => {
	                let site = x.pos.lookFor(LOOK_CONSTRUCTION_SITES);
	                if (site == null || site.length === 0) {
	                    x.setPublic(x.pos.findInRange(this.hostileCreeps, 2).length === 0);
	                }
	                else {
	                    x.setPublic(false);
	                }
	            });
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
	//# sourceMappingURL=sporeRoom.js.map

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class TransferResource extends task_1.Task {
	    constructor(targets, resourceType, source, storePriorities) {
	        super(false);
	        this.targets = targets;
	        this.resourceType = resourceType;
	        this.source = source;
	        this.storePriorities = storePriorities;
	        this.scheduledTransfer = 0;
	        this.scheduledCarry = 0;
	        this.reserveWorkers = false;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.COURIER;
	        this.resourcesNeeded = -1;
	        this.needsResources = [];
	        this.resourceCapacity = -1;
	        this.id = "Transfer:" + resourceType + " " + targets.map(function (t) { return t.id; }).join(',');
	        let room = null;
	        if (source != null) {
	            this.id += " " + source;
	            this.roomName = source.pos.roomName;
	            room = source.room;
	        }
	        else {
	            for (let index = 0; index < storePriorities.length; index++) {
	                this.id += storePriorities[index].join(',');
	            }
	            this.roomName = targets[0].pos.roomName;
	            room = targets[0].room;
	        }
	        this.name = "Transfer " + resourceType + " to " + targets.length + " objects";
	        this.near = source;
	        this.calculateRequirements();
	        if (room.economy.resources[RESOURCE_ENERGY] > 0) {
	        }
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
	    prioritize(object) {
	        if (object instanceof Creep) {
	            if (object.carryCount === object.carryCapacity && object.carry[this.resourceType] === 0) {
	                return 0;
	            }
	            return super.basicPrioritizeCreep(object, this.source, this.idealCreepBody);
	        }
	        return 0;
	    }
	    beginScheduling() {
	        this.scheduledTransfer = 0;
	        this.scheduledCarry = 0;
	    }
	    schedule(object) {
	        let room = null;
	        if (this.source != null) {
	            room = this.source.room;
	        }
	        else {
	            room = this.targets[0].room;
	        }
	        if (this.possibleWorkers === 0) {
	            return task_1.ERR_NO_WORK;
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
	        //if (this.resourcesNeeded === 0 || this.resourcesNeeded < this.scheduledTransfer || this.needsResources.length === 0)
	        let maxCarryReached = false;
	        if (this.labor.types[this.idealCreepBody.name] != null) {
	            //console.log(this.scheduledCarry + ' >= ' + this.labor.types[this.idealCreepBody.name].parts[CARRY]);
	            maxCarryReached = this.scheduledCarry >= this.labor.types[this.idealCreepBody.name].parts[CARRY];
	        }
	        if (this.scheduledTransfer >= this.resourceCapacity || maxCarryReached) {
	            // console.log(creep + " resourcesNeeded: " + this.resourcesNeeded + " scheduledTransfer: " + this.scheduledTransfer + " needsResources: " + this.needsResources.length);
	            return task_1.ERR_NO_WORK;
	        }
	        if (creep.type === sporeCreep_1.CREEP_TYPE.MINER.name && this.scheduledTransfer > 0) {
	            return task_1.ERR_CANNOT_PERFORM_TASK;
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
	                (creep.action === sporeCreep_1.ACTION_TRANSFER && creep.carry[this.resourceType] > 0)) {
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
	            this.scheduledCarry += Math.floor((creep.carryCapacity / compatibleTransfer) / CARRY_CAPACITY);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (this.possibleWorkers === 0 || this.scheduledTransfer >= this.resourceCapacity || maxCarryReached) {
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
	            code = creep.goCollect(this.resourceType, amount, amount, false, ((needsResources.length > 0) ? needsResources[0].pos : creep.pos), this.storePriorities, _.indexBy(this.targets, 'id'));
	        }
	        return code;
	    }
	    endScheduling() {
	    }
	}
	exports.TransferResource = TransferResource;
	//# sourceMappingURL=taskTransferResource.js.map

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const spawnRequest_1 = __webpack_require__(6);
	exports.NO_MORE_WORK = 123;
	exports.ERR_NO_WORK = -400;
	exports.ERR_CANNOT_PERFORM_TASK = -401;
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
	                spawnDistanceFromNear = Map.getRoomLinearDistance(spawn.pos.roomName, near.pos.roomName) * 50;
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
	    prioritize(object) {
	        return 0;
	    }
	    basicPrioritizeCreep(creep, near, idealBody) {
	        let objectPriority = 0;
	        if (creep.spawnRequest != null && creep.spawnRequest.id != null && creep.spawnRequest.id.length > 0) {
	            if (creep.spawnRequest.task == this ||
	                (creep.spawnRequest.replacingCreep != null && creep.spawnRequest.replacingCreep.task == this)) {
	                // this creep is intended for this task
	                return 1;
	            }
	            else {
	                // this creep is intended for a different task
	                return 0;
	            }
	        }
	        // 1 - 40
	        if (near != null && creep.pos.roomName == near.pos.roomName) {
	            objectPriority += 0.40;
	        }
	        // 41 - 60
	        if (creep.type === idealBody.name) {
	            objectPriority += 0.2;
	            // 61 - 70
	            if (creep.task == this) {
	                if (creep.taskPriority >= 0) {
	                    objectPriority += 0.1 + (((100 - creep.taskPriority) / 100) * 0.01);
	                }
	                else {
	                    objectPriority += 0.1;
	                }
	            }
	        }
	        else if (creep.task != null && creep.task != this) {
	            objectPriority = Math.max(0, objectPriority - .1);
	        }
	        // 71 - 90 : objectPriority
	        let taskEfficiency = creep.getEfficiencyAs(idealBody);
	        if (taskEfficiency === 0) {
	            return 0;
	        }
	        objectPriority += (20 * taskEfficiency) / 100;
	        //console.log(object + ' objectPriority as ' + this.idealCreepBody.name + ' ' + objectPriority);
	        return objectPriority;
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
	//# sourceMappingURL=task.js.map

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
	//# sourceMappingURL=spawnRequest.js.map

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeClaimable_1 = __webpack_require__(8);
	const bodyDefinition_1 = __webpack_require__(9);
	const spawnRequest_1 = __webpack_require__(6);
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
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('COURIER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 12, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 12, 1, 1));
	exports.CREEP_TYPE.COURIER = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('CITIZEN');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(WORK, 5, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 10, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CARRY, 5, 1, 1));
	exports.CREEP_TYPE.CITIZEN = bodyDefinition;
	var bodyDefinition = new bodyDefinition_1.BodyDefinition('RESERVER');
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(MOVE, 4, 1, 1));
	bodyDefinition.requirements.push(new bodyDefinition_1.BodyPartRequirements(CLAIM, 1, 1, 1));
	exports.CREEP_TYPE.RESERVER = bodyDefinition;
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
	    getEfficiencyAs(bodyDefinition) {
	        let totalRequiredParts = 0;
	        let totalMaxRequiredParts = 0;
	        let bodyPartsByType = _.groupBy(this.body, function (part) { return part.type; });
	        for (let requirement of bodyDefinition.requirements) {
	            let bodyParts = bodyPartsByType[requirement.type];
	            if (bodyParts == null ||
	                bodyParts.length < requirement.min) {
	                return 0;
	            }
	            totalMaxRequiredParts += requirement.max;
	            totalRequiredParts += Math.min(bodyParts.length, requirement.max);
	        }
	        return totalRequiredParts / totalMaxRequiredParts;
	    }
	    get type() {
	        return this.memory.type;
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
	    goMoveTo(target) {
	        if (target.pos == null) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = this.moveTo(target.pos, { noPathFinding: true });
	        // Perform pathfinding only if we have enough CPU
	        if (code == ERR_NOT_FOUND && Game.cpu.tickLimit - Game.cpu.getUsed() > 20) {
	            code = this.moveTo(target.pos);
	        }
	        if (this.doTrack) {
	            console.log(this + " goMoveTo " + code);
	        }
	        if (code == OK ||
	            code == ERR_TIRED) {
	            this.action = exports.ACTION_MOVE;
	            this.actionTarget = target.toString();
	            return OK;
	        }
	        if (code == ERR_INVALID_TARGET) {
	            return task_1.ERR_NO_WORK;
	        }
	        // ERR_NO_PATH
	        // ERR_NO_BODYPART
	        // ERR_BUSY
	        // ERR_NOT_OWNER
	        console.log("ERROR: Attempted to move to '" + target + "' but encountered unknown error. " + code);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goHarvest(source) {
	        if (!source.isValid) {
	            return ERR_INVALID_TARGET;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (source.isShrouded) {
	            code = this.goMoveTo(source);
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
	                code = this.goMoveTo(claimReceipt.target);
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
	    goTransfer(resourceType, target) {
	        if (!target.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (target.isShrouded) {
	            code = this.goMoveTo(target);
	        }
	        else {
	            code = this.transfer(target.instance, resourceType);
	            if (code == OK) {
	                this.action = exports.ACTION_TRANSFER;
	                this.actionTarget = target.toString();
	                return OK;
	            }
	            else if (code == ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(target);
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
	    goBuild(site) {
	        if (!site.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (this.getActiveBodyparts(WORK) === 0) {
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (site.isShrouded) {
	            code = this.goMoveTo(site);
	        }
	        else {
	            code = this.build(site.instance);
	            if (code === OK) {
	                this.action = exports.ACTION_BUILD;
	                this.actionTarget = site.toString();
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                code = this.goMoveTo(site);
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
	    goDismantle(structure) {
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
	            code = this.goMoveTo(structure);
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
	                code = this.goMoveTo(structure);
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
	    goRepair(structure) {
	        if (!structure.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (structure.isShrouded) {
	            code = this.goMoveTo(structure);
	        }
	        else {
	            code = this.repair(structure.instance);
	            if (code === OK) {
	                this.action = exports.ACTION_REPAIR;
	                this.actionTarget = structure.toString();
	                return OK;
	            }
	            else if (code === ERR_NOT_IN_RANGE) {
	                return this.goMoveTo(structure);
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
	    goCollect(resourceType, amount, minAmount, isExtended, near, storePriorities, excludes) {
	        if (this.action != exports.ACTION_COLLECT && this.action != exports.ACTION_MOVE) {
	            this.claimReceipt = null;
	        }
	        let claimReceipt = Game.rooms[near.roomName].claimResource(this, resourceType, amount, minAmount, isExtended, near, storePriorities, excludes, this.claimReceipt);
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
	            code = this.goMoveTo(claimReceipt.target);
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
	    goUpgrade(controller) {
	        if (!controller.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (controller.isShrouded) {
	            code = this.goMoveTo(controller);
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
	                return this.goMoveTo(controller);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        console.log("goUpgrade error code: " + code + " " + this);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goReserve(controller) {
	        if (!controller.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (controller.isShrouded) {
	            code = this.goMoveTo(controller);
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
	                return this.goMoveTo(controller);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        console.log("goReserve error code: " + code + " " + this);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goClaim(controller) {
	        if (!controller.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (controller.isShrouded) {
	            code = this.goMoveTo(controller);
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
	                return this.goMoveTo(controller);
	            }
	        }
	        if (code === OK) {
	            return OK;
	        }
	        console.log("goClaim error code: " + code + " " + this);
	        return task_1.ERR_CANNOT_PERFORM_TASK;
	    }
	    goRecycle(spawn) {
	        if (!spawn.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        let code = task_1.ERR_NO_WORK;
	        if (spawn.isShrouded) {
	            code = this.goMoveTo(spawn);
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
	                return this.goMoveTo(spawn);
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
	//# sourceMappingURL=sporeCreep.js.map

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
	//# sourceMappingURL=sporeClaimable.js.map

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	class BodyDefinition {
	    constructor(name) {
	        this.name = name;
	        this.requirements = [];
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
	//# sourceMappingURL=bodyDefinition.js.map

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class UpgradeRoomController extends task_1.Task {
	    constructor(controller) {
	        super(false);
	        this.controller = controller;
	        this.id = "Upgrade " + controller;
	        this.name = "Upgrade " + controller.toHtml();
	        this.possibleWorkers = -1;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        this.roomName = controller.pos.roomName;
	        this.priority = 0 /* Low */;
	        this.near = controller;
	        if (!controller.isShrouded) {
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
	        let carryDemand = 12; //Math.ceil((controller.room.economy.resources.energy * controller.room.budget.upgrade) / CARRY_CAPACITY);
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ carry: carryDemand }, 1, 50);
	    }
	    createAppointment(spawn, request) {
	        return super.createBasicAppointment(spawn, request, this.controller);
	    }
	    prioritize(object) {
	        if (object instanceof Creep) {
	            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0) {
	                return 0;
	            }
	            return super.basicPrioritizeCreep(object, this.controller, this.idealCreepBody);
	        }
	        return 0;
	    }
	    beginScheduling() {
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || !this.controller.isValid) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to upgrade a room controller with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let creep = object;
	        let code;
	        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
	            (creep.action === sporeCreep_1.ACTION_UPGRADE && creep.carry[RESOURCE_ENERGY] > 0)) {
	            code = creep.goUpgrade(this.controller);
	        }
	        else {
	            let amount = creep.carryCapacityRemaining;
	            code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.controller.pos, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']], {});
	            if (code === task_1.ERR_NO_WORK) {
	                if (creep.carry[RESOURCE_ENERGY] > 0) {
	                    code = creep.goUpgrade(this.controller);
	                }
	                else {
	                    code = creep.goCollect(RESOURCE_ENERGY, amount, 0, false, this.controller.pos, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']], {});
	                }
	            }
	        }
	        if (code === OK) {
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        else {
	            console.log(code);
	        }
	        if (this.possibleWorkers === 0) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	    endScheduling() {
	    }
	}
	exports.UpgradeRoomController = UpgradeRoomController;
	//# sourceMappingURL=taskUpgradeRoomController.js.map

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class RepairStructure extends task_1.Task {
	    constructor(structure) {
	        super(false);
	        this.structure = structure;
	        this.id = "Repair " + structure;
	        this.name = "Repair " + structure;
	        this.priority = 75 /* MediumHigh */;
	        this.possibleWorkers = 2;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        this.near = structure;
	    }
	    prioritize(object) {
	        if (object instanceof Creep) {
	            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0) {
	                return 0;
	            }
	            return super.basicPrioritizeCreep(object, this.structure, this.idealCreepBody);
	        }
	        return 0;
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
	            (creep.action === sporeCreep_1.ACTION_REPAIR && creep.carry[RESOURCE_ENERGY] > 0)) {
	            code = creep.goRepair(this.structure);
	        }
	        else {
	            let amount = creep.carryCapacityRemaining;
	            if (!this.structure.isShrouded) {
	                Math.min(creep.carryCapacityRemaining, this.structure.instance.hitsMissing / 100);
	            }
	            code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.structure.pos, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']], {});
	        }
	        if (code === OK && this.possibleWorkers > 0) {
	            this.possibleWorkers--;
	        }
	        return code;
	    }
	}
	exports.RepairStructure = RepairStructure;
	//# sourceMappingURL=taskRepairStructure.js.map

/***/ },
/* 12 */
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
	//# sourceMappingURL=screepsPtr.js.map

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	const screepsPtr_1 = __webpack_require__(12);
	const sporeSource_1 = __webpack_require__(14);
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
	        let slots = sporeSource_1.SporeSource.getSlots(this.source);
	        if (slots === -1) {
	            slots = 8;
	        }
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ work: 5 }, 1, slots);
	    }
	    createAppointment(spawn, request) {
	        return super.createBasicAppointment(spawn, request, this.source);
	    }
	    prioritize(object) {
	        if (object instanceof Creep) {
	            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0) {
	                return 0;
	            }
	            return super.basicPrioritizeCreep(object, this.source, this.idealCreepBody);
	        }
	        return 0;
	    }
	    beginScheduling() {
	        this.scheduledWork = 0;
	        this.scheduledWorkers.length = 0;
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
	        if (creep.carry[RESOURCE_ENERGY] > 0) {
	            let areaResults = creep.room.lookForAtArea(LOOK_STRUCTURES, creep.pos.y - 1, creep.pos.x - 1, creep.pos.y + 1, creep.pos.x + 1, true);
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
	    endScheduling() {
	    }
	}
	exports.HarvestEnergy = HarvestEnergy;
	//# sourceMappingURL=taskHarvestEnergy.js.map

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
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
	        Object.defineProperty(this, "slots", { value: slots });
	        return slots;
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
	        Object.defineProperty(this, "memory", { value: memory });
	        return memory;
	    }
	    collect(collector, claimReceipt) {
	        if (claimReceipt.target !== this) {
	            return ERR_INVALID_TARGET;
	        }
	        if (collector.harvest != null) {
	            return collector.harvest(this);
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
	//# sourceMappingURL=sporeSource.js.map

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class BuildBarrier extends task_1.Task {
	    constructor(barriers) {
	        super(false);
	        this.barriers = barriers;
	        this.workers = 0;
	        this.direRampartHits = RAMPART_DECAY_AMOUNT * 10;
	        this.averageHits = 0;
	        this.averageDelta = 1000;
	        this.requiredCarryPerBarrier = 0.25;
	        this.scheduledCarry = 0;
	        this.id = 'Reinforce barriers';
	        this.name = 'Reinforce barriers';
	        this.possibleWorkers = -1;
	        this.priority = 50 /* Medium */;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        let totalHits = 0;
	        let total = 0;
	        for (let barrier of barriers) {
	            if (barrier.isValid && !barrier.isShrouded && barrier.lookType === LOOK_STRUCTURES) {
	                total++;
	                totalHits += barrier.instance.hits;
	            }
	        }
	        this.averageHits = totalHits / total;
	        this.labor.types[this.idealCreepBody.name] = new task_1.LaborDemandType({ carry: Math.floor((this.requiredCarryPerBarrier * this.barriers.length) / CARRY_CAPACITY) }, 1, 10);
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
	    prioritize(object) {
	        if (object instanceof Creep) {
	            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0) {
	                return 0;
	            }
	            return super.basicPrioritizeCreep(object, { pos: new RoomPosition(25, 25, this.roomName), room: Game.rooms[this.roomName] }, this.idealCreepBody);
	        }
	        return 0;
	    }
	    beginScheduling() {
	        this.sortBarriers();
	        this.scheduledCarry = 0;
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || this.scheduledCarry >= this.requiredCarryPerBarrier * this.barriers.length) {
	            return task_1.ERR_NO_WORK;
	        }
	        if (!(object instanceof Creep)) {
	            console.log('ERROR: Attempted to reinforce barriers with a non-creep room object. ' + object);
	            return task_1.ERR_CANNOT_PERFORM_TASK;
	        }
	        let nextBarrier = 0; //Math.min(this.workers, this.barriers.length);
	        let creep = object;
	        let code;
	        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
	            ((creep.action === sporeCreep_1.ACTION_BUILD || creep.action === sporeCreep_1.ACTION_REPAIR || creep.action === sporeCreep_1.ACTION_MOVE) && creep.carry[RESOURCE_ENERGY] > 0)) {
	            this.goReinforce(creep, nextBarrier);
	        }
	        else {
	            let amount = creep.carryCapacityRemaining;
	            code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.barriers[nextBarrier].pos, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']], {});
	            if (code === task_1.ERR_NO_WORK) {
	                if (creep.carry[RESOURCE_ENERGY] > 0) {
	                    this.goReinforce(creep, nextBarrier);
	                }
	                else {
	                    code = creep.goCollect(RESOURCE_ENERGY, amount, 0, false, this.barriers[nextBarrier].pos, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']], {});
	                }
	            }
	        }
	        if (code === OK) {
	            this.workers++;
	            this.scheduledCarry += creep.getActiveBodyparts(CARRY);
	            if (this.possibleWorkers > 0) {
	                this.possibleWorkers--;
	            }
	        }
	        if (this.possibleWorkers === 0 || this.scheduledCarry >= this.requiredCarryPerBarrier * this.barriers.length) {
	            return task_1.NO_MORE_WORK;
	        }
	        return code;
	    }
	    goReinforce(creep, barrierIndex) {
	        let code;
	        if (this.barriers[barrierIndex].lookType === LOOK_CONSTRUCTION_SITES) {
	            code = creep.goBuild(this.barriers[barrierIndex]);
	        }
	        else {
	            code = creep.goRepair(this.barriers[barrierIndex]);
	        }
	        return code;
	    }
	    endScheduling() {
	    }
	}
	exports.BuildBarrier = BuildBarrier;
	//# sourceMappingURL=taskBuildBarrier.js.map

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";
	class SporeRoomObject extends RoomObject {
	    get doTrack() {
	        return this.memory.track === true;
	    }
	}
	exports.SporeRoomObject = SporeRoomObject;
	//# sourceMappingURL=sporeRoomObject.js.map

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const taskBuildStructure_1 = __webpack_require__(18);
	const screepsPtr_1 = __webpack_require__(12);
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
	        Object.defineProperty(this, "memory", { value: memory });
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
	//# sourceMappingURL=sporeConstructionSite.js.map

/***/ },
/* 18 */
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
	    }
	    createAppointment(spawn, request) {
	        if (request.replacingCreep != null) {
	            return super.createBasicAppointment(spawn, request, request.replacingCreep);
	        }
	        return super.createBasicAppointment(spawn, request, this.site);
	    }
	    prioritize(object) {
	        if (object instanceof Creep) {
	            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0) {
	                return 0;
	            }
	            return super.basicPrioritizeCreep(object, this.site, this.idealCreepBody);
	        }
	        return 0;
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
	        if (creep.carry[RESOURCE_ENERGY] === creep.carryCapacity ||
	            (creep.action === sporeCreep_1.ACTION_BUILD && creep.carry[RESOURCE_ENERGY] > 0)) {
	            code = creep.goBuild(this.site);
	        }
	        else {
	            let amount = creep.carryCapacityRemaining;
	            if (!this.site.isShrouded) {
	                Math.min(creep.carryCapacityRemaining, this.site.instance.progressRemaining);
	            }
	            code = creep.goCollect(RESOURCE_ENERGY, amount, amount, false, this.site.pos, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']], {});
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
	//# sourceMappingURL=taskBuildStructure.js.map

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const taskTransferResource_1 = __webpack_require__(4);
	const screepsPtr_1 = __webpack_require__(12);
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
	        if (closestSource == null) {
	            let transferEnergyTask = new taskTransferResource_1.TransferResource([screepsPtr_1.ScreepsPtr.from(this)], RESOURCE_ENERGY, null, [['near_dropped'], ['container'], ['dropped']]);
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
	        let claims = new Claims(this);
	        Object.defineProperty(this, "claims", { value: claims });
	        return claims;
	    }
	}
	exports.SporeContainer = SporeContainer;
	class Claims {
	    constructor(container) {
	        this.container = container;
	        this.count = 0;
	    }
	}
	//# sourceMappingURL=sporeContainer.js.map

/***/ },
/* 20 */
/***/ function(module, exports) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	class SporeController extends StructureController {
	    get memory() {
	        let roomMemory = this.room.memory;
	        let memory = roomMemory.controller;
	        if (memory == null) {
	            memory = {};
	            roomMemory.controller = memory;
	        }
	        Object.defineProperty(this, "memory", { value: memory });
	        return memory;
	    }
	}
	exports.SporeController = SporeController;
	//# sourceMappingURL=sporeController.js.map

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
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
	        let claims = new Claims(this);
	        Object.defineProperty(this, "claims", { value: claims });
	        return claims;
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
	//# sourceMappingURL=sporeExtension.js.map

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const flagBuildStructure_1 = __webpack_require__(23);
	const flagDismantleStructure_1 = __webpack_require__(25);
	class SporeFlag extends Flag {
	    getTasks() {
	        let tasks = [];
	        if (this.color == COLOR_GREEN) {
	            tasks.push(new flagBuildStructure_1.FlagBuildStructure("", Game.flags[this.name]));
	        }
	        else if (this.color == COLOR_RED) {
	            tasks.push(new flagDismantleStructure_1.FlagDismantleStructure("", Game.flags[this.name]));
	        }
	        else if (this.color == COLOR_GREY) {
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
	        else if (this.color == COLOR_BLUE) {
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
	        return tasks;
	    }
	}
	exports.SporeFlag = SporeFlag;
	//# sourceMappingURL=sporeFlag.js.map

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
	"use strict";
	const task_1 = __webpack_require__(5);
	const taskBuildStructure_1 = __webpack_require__(18);
	const taskDismantleStructure_1 = __webpack_require__(24);
	const taskUpgradeRoomController_1 = __webpack_require__(10);
	const screepsPtr_1 = __webpack_require__(12);
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
	            let sameStructures = this.flag.room.find(FIND_STRUCTURES, {
	                filter: { structureType: this.structureType }
	            });
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
	                let step = new taskUpgradeRoomController_1.UpgradeRoomController(screepsPtr_1.ScreepsPtr.from(this.flag.room.controller));
	                steps.push(step);
	                return steps;
	            }
	        }
	        steps.push(new taskBuildStructure_1.BuildStructure(screepsPtr_1.ScreepsPtr.from(constructionSite)));
	        return steps;
	    }
	}
	exports.FlagBuildStructure = FlagBuildStructure;
	//# sourceMappingURL=flagBuildStructure.js.map

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const sporeCreep_1 = __webpack_require__(7);
	class DismantleStructure extends task_1.Task {
	    constructor(structure) {
	        super(false);
	        this.id = 'Dismantle ' + this.structure;
	        this.name = 'Dismantle ' + this.structure;
	        this.idealCreepBody = sporeCreep_1.CREEP_TYPE.CITIZEN;
	        this.near = structure;
	    }
	    prioritize(object) {
	        if (object instanceof Creep) {
	            if (object.carryCount === object.carryCapacity && object.carry[RESOURCE_ENERGY] === 0) {
	                return 0;
	            }
	            return super.basicPrioritizeCreep(object, this.structure, this.idealCreepBody);
	        }
	        return 0;
	    }
	    schedule(object) {
	        if (this.possibleWorkers === 0 || !this.structure.isValid || !(object instanceof Creep)) {
	            return task_1.ERR_NO_WORK;
	        }
	        let creep = object;
	        let code = creep.goDismantle(this.structure);
	        if (code === OK && this.possibleWorkers > 0) {
	            this.possibleWorkers--;
	        }
	        return code;
	    }
	}
	exports.DismantleStructure = DismantleStructure;
	//# sourceMappingURL=taskDismantleStructure.js.map

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/// <reference path="../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />
	"use strict";
	const task_1 = __webpack_require__(5);
	const taskDismantleStructure_1 = __webpack_require__(24);
	const screepsPtr_1 = __webpack_require__(12);
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
	        return steps;
	    }
	}
	exports.FlagDismantleStructure = FlagDismantleStructure;
	//# sourceMappingURL=flagDismantleStructure.js.map

/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";
	class RouteMemory {
	}
	exports.RouteMemory = RouteMemory;
	class SporeRoomPosition extends RoomPosition {
	    sortByRangeTo(targets) {
	        let cachedRange = {};
	        targets.sort(function (a, b) {
	            let rangeA = cachedRange[a.id];
	            if (rangeA == null) {
	                rangeA = this.getRangeTo(a);
	                cachedRange[a.id] = rangeA;
	            }
	            let rangeB = cachedRange[b.id];
	            if (rangeB == null) {
	                rangeB = this.getRangeTo(b);
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
	    getRouteTo(toRoom) {
	        let routeMemory = Memory.routes[this.roomName];
	        if (routeMemory == null) {
	            routeMemory = {};
	            Memory.routes[this.roomName] = routeMemory;
	        }
	        if (routeMemory[toRoom] === undefined) {
	            routeMemory[toRoom] = Game.map.findRoute(this.roomName, toRoom);
	            if (routeMemory[toRoom] === ERR_NO_PATH) {
	                routeMemory[toRoom] = null;
	            }
	        }
	        return routeMemory[toRoom];
	    }
	    findDistanceByPathTo(other, opts) {
	        console.log('///////////////////// ' + this + " -> " + other);
	        let rangeToSite = 0;
	        let toRoomName = '';
	        if (other instanceof RoomPosition) {
	            toRoomName = other.roomName;
	        }
	        else {
	            toRoomName = other.pos.roomName;
	        }
	        if (this.roomName != toRoomName) {
	            if (Game.rooms[this.roomName] == null) {
	                return 0;
	            }
	            let route = this.getRouteTo(toRoomName);
	            if (route.length === 0) {
	                // creep can't navigate to this room
	                return 0;
	            }
	            let closestExit = this.findClosestByRange(route[0].exit);
	            rangeToSite = this.findPathTo(closestExit, opts).length;
	            if (route.length >= 2) {
	                rangeToSite += (route.length - 1) * 50;
	            }
	            let lastExit = route[route.length - 1];
	            if (lastExit < 4) {
	                lastExit += 4;
	            }
	            else {
	                lastExit -= 4;
	            }
	            let closestLastExit = this.findClosestByRange(lastExit);
	            rangeToSite += this.findPathTo(closestLastExit, opts).length;
	        }
	        else {
	            let path = this.findPathTo(other, opts);
	            rangeToSite = path.length;
	        }
	        return rangeToSite;
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
	}
	exports.SporeRoomPosition = SporeRoomPosition;
	//# sourceMappingURL=sporeRoomPosition.js.map

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
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
	                    body.push(requirement.type);
	                }
	            }
	            else {
	                break;
	            }
	        }
	        return body;
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
	        let claims = new Claims(this);
	        Object.defineProperty(this, "claims", { value: claims });
	        return claims;
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
	//# sourceMappingURL=sporeSpawn.js.map

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
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
	        Object.defineProperty(this, "memory", { value: memory });
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
	        if (resourceType != RESOURCE_ENERGY) {
	            return null;
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
	        return new sporeClaimable_1.ClaimReceipt(this, 'storage', resourceType, claimAmount);
	    }
	    get claims() {
	        let claims = new Claims(this);
	        Object.defineProperty(this, "claims", { value: claims });
	        return claims;
	    }
	}
	exports.SporeStorage = SporeStorage;
	class Claims {
	    constructor(storage) {
	        this.storage = storage;
	        this.count = 0;
	    }
	}
	//# sourceMappingURL=sporeStorage.js.map

/***/ },
/* 29 */
/***/ function(module, exports) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
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
	//# sourceMappingURL=sporeStructure.js.map

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
	const taskTransferResource_1 = __webpack_require__(4);
	const screepsPtr_1 = __webpack_require__(12);
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
	        Object.defineProperty(this, "memory", { value: memory });
	        return memory;
	    }
	    getTasks() {
	        let tasks = [];
	        if (this.energy < this.energyCapacity) {
	            let transferEnergyTask = new taskTransferResource_1.TransferResource([screepsPtr_1.ScreepsPtr.from(this)], RESOURCE_ENERGY, null, [['near_dropped'], ['link', 'container', 'storage'], ['dropped']]);
	            transferEnergyTask.priority = 1000 /* Mandatory */;
	            transferEnergyTask.name = "Fill " + this;
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
	        let claims = new Claims(this);
	        Object.defineProperty(this, "claims", { value: claims });
	        return claims;
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
	//# sourceMappingURL=sporeTower.js.map

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
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
	        let claims = new Claims(this);
	        Object.defineProperty(this, "claims", { value: claims });
	        return claims;
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
	//# sourceMappingURL=sporeResource.js.map

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>
	"use strict";
	const sporeClaimable_1 = __webpack_require__(8);
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
	        if (this.memory.nearBySourceId != null) {
	            let nearBySource = Game.getObjectById(this.memory.nearBySourceId);
	            Object.defineProperty(this, "nearBySource", { value: nearBySource });
	            return nearBySource;
	        }
	        let nearBySource = this.pos.findClosestInRange(this.room.sources, 2);
	        if (nearBySource == null) {
	            this.memory.nearBySourceId = '';
	        }
	        else {
	            this.memory.nearBySourceId = nearBySource.id;
	        }
	        Object.defineProperty(this, "nearBySource", { value: nearBySource });
	        return nearBySource;
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
	        Object.defineProperty(this, "memory", { value: memory });
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
	        let claims = new Claims(this);
	        Object.defineProperty(this, "claims", { value: claims });
	        return claims;
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
	        for (let flagName in Game.flags) {
	            let flag = Game.flags[flagName];
	            if (flag != flagA &&
	                flag.color === COLOR_YELLOW &&
	                flag.secondaryColor === flagA.secondaryColor &&
	                flag.name.startsWith(flagA.name)) {
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
	//# sourceMappingURL=sporeLink.js.map

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const task_1 = __webpack_require__(5);
	const taskRecycleCreep_1 = __webpack_require__(34);
	const screepsPtr_1 = __webpack_require__(12);
	const spawnRequest_1 = __webpack_require__(6);
	const sporeCreep_1 = __webpack_require__(7);
	const taskUpgradeRoomController_1 = __webpack_require__(10);
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
	class SporeColony {
	    constructor() {
	        this.tasksById = {};
	        this.laborPool = new LaborPool();
	        this.spawnRequests = [];
	        this.requestsCurrentlySpawning = [];
	    }
	    get myRooms() {
	        let myRooms = [];
	        for (let roomId in Game.rooms) {
	            let room = Game.rooms[roomId];
	            if (room.my) {
	                myRooms.push(room);
	            }
	        }
	        myRooms.sort(function (a, b) {
	            if (a.priority < b.priority) {
	                return -1;
	            }
	            if (a.priority > b.priority) {
	                return 1;
	            }
	            if (a.name < b.name) {
	                return 1;
	            }
	            if (a.name > b.name) {
	                return -1;
	            }
	            return 0;
	        });
	        Object.defineProperty(this, "myRooms", { value: myRooms });
	        return myRooms;
	    }
	    run() {
	        this.tasksById = {};
	        this.laborPool = new LaborPool();
	        this.spawnRequests.length = 0;
	        this.requestsCurrentlySpawning.length = 0;
	        for (let room of this.myRooms) {
	            room.trackEconomy();
	        }
	        this.collectTasks();
	        let creeps = {};
	        let taskLaborPools = {};
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
	                    this.requestsCurrentlySpawning.push(creep.spawnRequest.id);
	                }
	            }
	            creeps[creep.name] = creep;
	            this.laborPool.addCreep(creep);
	        }
	        for (let room of this.myRooms) {
	            for (let task of room.basicTasks) {
	                let priorityCache = {};
	                taskLaborPools[task.id] = new LaborPool();
	                task.beginScheduling();
	                let prioritizedCreeps = this.getCreepsByTier(task, creeps, priorityCache);
	                let code = OK;
	                let creepTaskPriority = 0;
	                for (let index = 0; index < prioritizedCreeps.length; index++) {
	                    let tierCreeps = prioritizedCreeps[index];
	                    if (tierCreeps.length > 1) {
	                        console.log('//////  Sorting Tier ' + index + ' for ' + task.name);
	                        this.sortCreepsBySecondPriority(task, tierCreeps);
	                    }
	                    for (let creep of tierCreeps) {
	                        if (creep.type != null && task.labor.types[creep.type] != null) {
	                            taskLaborPools[task.id].addCreep(creep);
	                        }
	                        if (code === task_1.ERR_NO_WORK) {
	                            break;
	                        }
	                        code = task.schedule(creep);
	                        if (code >= 0 || (creep.spawnRequest != null && creep.spawnRequest.task == task)) {
	                            creep.task = task;
	                            creep.taskPriority = creepTaskPriority;
	                            creepTaskPriority++;
	                            // remove creep now that it's been scheduled
	                            creeps[creep.name] = null;
	                            delete creeps[creep.name];
	                            console.log("Scheduled " + creep.name + " for " + ((task.name != null) ? task.name : task.id) + ' ' + creep.type);
	                            if (creep.ticksToLive < 300 && sporeCreep_1.CREEP_TYPE[creep.type] != null && creep.task != null) {
	                                this.spawnRequests.push(new spawnRequest_1.SpawnRequest('replace_' + creep.name, null, creep, sporeCreep_1.CREEP_TYPE[creep.type]));
	                            }
	                            if (code === task_1.NO_MORE_WORK) {
	                                break;
	                            }
	                        }
	                        else if (code === task_1.ERR_NO_WORK) {
	                        }
	                        else if (code === task_1.ERR_CANNOT_PERFORM_TASK) {
	                            //skip this creep
	                            console.log('   ' + creep + ' ERR_CANNOT_PERFORM_TASK ' + task.id);
	                        }
	                        else {
	                            console.log("UNKNOWN ERROR FROM SCHEDULING: " + task.id + " creep: " + creep + " code: " + code);
	                        }
	                    }
	                    if (code === task_1.NO_MORE_WORK || code === task_1.ERR_NO_WORK) {
	                        break;
	                    }
	                }
	                task.endScheduling();
	                for (let index = 0; index < prioritizedCreeps.length; index++) {
	                    for (let creep of prioritizedCreeps[index]) {
	                        if (task instanceof taskUpgradeRoomController_1.UpgradeRoomController) {
	                            console.log('    ' + priorityCache[creep.id] + ' - ' + creep);
	                        }
	                    }
	                }
	                for (let name in task.labor.types) {
	                    let type = task.labor.types[name];
	                    if (type == null) {
	                        continue;
	                    }
	                    if (taskLaborPools[task.id].types[name] == null) {
	                        taskLaborPools[task.id].types[name] = new LaborPoolType({}, 0);
	                    }
	                    let typePool = taskLaborPools[task.id].types[name];
	                    let doSpawn = false;
	                    if (type.min > typePool.count) {
	                        //console.log(name + ': '+ type.min + ' > ' + typePool.count);
	                        doSpawn = true;
	                    }
	                    if (!doSpawn) {
	                        for (let partName in type.parts) {
	                            if (type.parts[partName] > typePool.parts[partName]) {
	                                console.log(partName + ': ' + type.parts[partName] + ' > ' + typePool.parts[partName]);
	                                doSpawn = true;
	                                break;
	                            }
	                        }
	                    }
	                    if (doSpawn && type.max > typePool.count) {
	                        //console.log(type.max + ' > ' + typePool.count);
	                        this.spawnRequests.push(new spawnRequest_1.SpawnRequest('new_: ' + task.id, task, null, sporeCreep_1.CREEP_TYPE[name]));
	                    }
	                }
	            }
	        }
	        for (let name in creeps) {
	            let creep = creeps[name];
	            if (creep != null) {
	                creep.task = null;
	            }
	        }
	        this.spawnCreeps();
	        let totalSurplusCreeps = _.size(creeps);
	        console.log("Surplus Creeps: " + totalSurplusCreeps);
	        //this.recycleCreeps(creeps);
	    }
	    collectTasks() {
	        this.tasksById = {};
	        for (let room of this.myRooms) {
	            room.tasksById = {};
	            room.tasks = [];
	            room.basicTasks = [];
	            //////////////////////////////////////////////////////////////////////////////
	            // turn flags into tasks
	            for (let name in Game.flags) {
	                let flag = Game.flags[name];
	                if (flag.room != room) {
	                    continue;
	                }
	                flag.room.tasks.push.apply(flag.room.tasks, flag.getTasks());
	            }
	            room.tasks.push.apply(room.tasks, room.getTasks());
	            // Breakdown tasks
	            for (let index = 0; index < room.tasks.length; index++) {
	                let task = room.tasks[index];
	                if (task.isComplex) {
	                    let subTasks = task.getSteps();
	                    room.tasks.push.apply(room.tasks, subTasks);
	                }
	                else if (room.tasksById[task.id] == null) {
	                    room.basicTasks.push(task);
	                    room.tasksById[task.id] = task;
	                    this.tasksById[task.id] = task;
	                }
	                else {
	                    if (room.tasksById[task.id].priority !== task.priority) {
	                        room.basicTasks.push(task);
	                        room.tasksById[task.id] = task;
	                        this.tasksById[task.id] = task;
	                    }
	                }
	            }
	            // Sort the basic tasks by their priority
	            room.basicTasks.sort(function (a, b) {
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
	            console.log(room + " basic tasks: " + room.basicTasks.length);
	            for (let taskIndex = 0; taskIndex < room.basicTasks.length; taskIndex++) {
	                let task = room.basicTasks[taskIndex];
	                console.log('   ' + task.priority + " -> " + ((task.name != null) ? task.name : task.id));
	            }
	        }
	    }
	    getCreepsByPriority(task, creeps, priorityCache) {
	        if (priorityCache == null) {
	            priorityCache = {};
	        }
	        let creepsByPriority = [];
	        for (let name in creeps) {
	            let creep = creeps[name];
	            let priority = task.prioritize(creep);
	            if (priority > 0) {
	                priorityCache[creep.id] = priority;
	                creepsByPriority.push(creep);
	            }
	        }
	        let distanceCache = {};
	        creepsByPriority.sort(function (a, b) {
	            let priorityA = priorityCache[a.id];
	            let priorityB = priorityCache[b.id];
	            if (priorityA < priorityB) {
	                return 1;
	            }
	            if (priorityA > priorityB) {
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
	    getCreepsByTier(task, creeps, priorityCache) {
	        if (priorityCache == null) {
	            priorityCache = {};
	        }
	        let creepsByPriority = [];
	        for (let name in creeps) {
	            let creep = creeps[name];
	            let priority = task.prioritize(creep);
	            if (priority > 0) {
	                priorityCache[creep.id] = priority;
	                creepsByPriority.push(creep);
	            }
	        }
	        creepsByPriority.sort(function (a, b) {
	            let priorityA = priorityCache[a.id];
	            let priorityB = priorityCache[b.id];
	            if (priorityA < priorityB) {
	                return 1;
	            }
	            if (priorityA > priorityB) {
	                return -1;
	            }
	            return 0;
	        });
	        let tier = -1;
	        let creepsByTier = [];
	        let lastPriority = -1;
	        for (let creep of creepsByPriority) {
	            if (priorityCache[creep.id] != lastPriority) {
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
	    sortCreepsBySecondPriority(task, creeps) {
	        let distanceCache = {};
	        creeps.sort(function (a, b) {
	            if (task.near != null) {
	                let aDistance = distanceCache[a.pos.toString()];
	                if (aDistance == null) {
	                    aDistance = a.pos.findDistanceByPathTo(task.near);
	                    distanceCache[a.pos.toString()] = aDistance;
	                }
	                let bDistance = distanceCache[b.pos.toString()];
	                if (bDistance == null) {
	                    bDistance = b.pos.findDistanceByPathTo(task.near);
	                    distanceCache[b.pos.toString()] = bDistance;
	                }
	                if (aDistance < bDistance) {
	                    return 1;
	                }
	                if (aDistance > bDistance) {
	                    return -1;
	                }
	            }
	            if (a.name < b.name) {
	                return 1;
	            }
	            if (a.name > b.name) {
	                return -1;
	            }
	            return 0;
	        });
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
	                return 1;
	            }
	            if ((taskA.roomName != null && taskA.roomName === spawnRoomName) && taskB.roomName == null) {
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
	            if (roomA != null && roomB != null) {
	                if (roomA.energyCapacityAvailable < roomB.energyCapacityAvailable) {
	                    return 1;
	                }
	                if (roomA.energyCapacityAvailable > roomB.energyCapacityAvailable) {
	                    return -1;
	                }
	            }
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
	                    priorityBody = priorityAppointment.spawn.getBody(priorityAppointment.creepBody);
	                    priorityBodySpawnTime = priorityBody.length * CREEP_SPAWN_TIME;
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
	    recycleCreeps(creeps) {
	        let totalSurplusCreeps = _.size(creeps);
	        console.log("Surplus Creeps: " + totalSurplusCreeps);
	        // Recycle surplus creeps
	        let allowedSurplusCreepsPerRoom = 6;
	        if (totalSurplusCreeps > allowedSurplusCreepsPerRoom) {
	            let creepByRoom = _.groupBy(creeps, function (c) { return c.room.name; });
	            for (let room of this.myRooms) {
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
	}
	exports.SporeColony = SporeColony;
	//# sourceMappingURL=sporeColony.js.map

/***/ },
/* 34 */
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
	    prioritize(object) {
	        if (object instanceof Creep) {
	            let creep = object;
	            return (50 - creep.body.length) / 50;
	        }
	        return 0;
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
	//# sourceMappingURL=taskRecycleCreep.js.map

/***/ }
/******/ ]);