import {Task, TaskPriority} from "./task";
import {SourceMemory} from "./sporeSource";
import {Claimable, ClaimReceipt} from "./sporeClaimable";
import {TransferResource} from "./taskTransferResource";
import {StorageMemory} from "./sporeStorage";
import {StructureMemory} from "./sporeStructure";
import {ConstructionSiteMemory} from "./sporeConstructionSite";
import {ControllerMemory} from "./sporeController";
import {UpgradeRoomController} from "./taskUpgradeRoomController";
import {RepairStructure} from "./taskRepairStructure";
import {ScreepsPtr, EnergyContainerLike, StoreContainerLike, CarryContainerLike, RoomObjectLike} from "./screepsPtr";
import {HarvestEnergy} from "./taskHarvestEnergy";
import {BuildBarrier} from "./taskBuildBarrier";
import {CREEP_TYPE, CollectOptions} from "./sporeCreep";
import Dictionary = _.Dictionary;
import {DefendRoom} from "./taskDefendRoom";

declare global
{
    interface Room
    {
        getTasks(): Task[];
        trackEconomy(): void;
        claimResource(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended: boolean, near: RoomPosition, options: CollectOptions, excludes: Dictionary<Claimable>, receipt?: ClaimReceipt): ClaimReceipt;
        getRouteTo(roomName: string): any[];
        lookForByRadiusAt(type: string, location: RoomObjectLike | RoomPosition, radius: number, asArray?: boolean): LookAtResultMatrix | LookAtResultWithPos[];

        sources: Source[];
        extractor: StructureExtractor;
        links: StructureLink[];
        structures: Structure[];
        constructionSites: ConstructionSite[];
        containers: StructureContainer[];
        extensions: StructureExtension[];
        towers: StructureTower[];
        ramparts: StructureRampart[];
        mySpawns: Spawn[];
        myCreeps: Creep[];
        hostileCreeps: Creep[];
        friendlyCreeps: Creep[];
        injuredFriendlyCreeps: Creep[];

        economy: Economy;
        budget: Budget;

        my: boolean;
        isReserved: boolean;
        priority: number;
    }

    interface RoomMemory
    {
        sources: SourceMemory[];
        spawns: SpawnMemory[];
        structures: Dictionary<StructureMemory>;
        sites: Dictionary<ConstructionSiteMemory>;
        controller: ControllerMemory;
        storage: StorageMemory;
        budget: Budget;
    }
}

// List of allies, name must be lower case.
const USERNAME_WHITELIST =
    [
        'pcake0rigin', // Jacob
        'pcakecysote', // Jacob
        'barney',      // Mr McBarnabas
        'pcakecysote', // Jacob
        'swifty',      // Leigh
        'yeurch',       // Richard
        '0xdeadfeed'    // Wes
    ];

let STRUCTURE_REPAIR_VALUES = {};
STRUCTURE_REPAIR_VALUES[STRUCTURE_CONTAINER] = { ideal: CONTAINER_HITS, regular: { threshold: 200000, priority: TaskPriority.High}, dire:{threshold: 100000, priority: TaskPriority.Mandatory} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_TOWER] = { ideal: TOWER_HITS, regular: { threshold: 2000, priority: TaskPriority.High}, dire:{threshold: 1000, priority: TaskPriority.Mandatory} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_ROAD] = { ideal: ROAD_HITS, regular: { threshold: 2500, priority: TaskPriority.High}, dire:{threshold: 500, priority: TaskPriority.Medium} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_RAMPART] = { ideal: 20000, regular: { threshold: 15000, priority: TaskPriority.High}, dire:{threshold: 10000, priority: TaskPriority.Medium} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_WALL] = { ideal: 20000, regular: { threshold: 20000, priority: TaskPriority.Medium}, dire:{threshold: 10000, priority: TaskPriority.MediumLow} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_LINK] = { ideal: LINK_HITS_MAX, regular: { threshold: LINK_HITS_MAX * 0.8, priority: TaskPriority.High}, dire:{threshold: LINK_HITS_MAX * 0.3, priority: TaskPriority.Mandatory} };

// declare var STRUCTURE_KEEPER_LAIR: string;
// declare var STRUCTURE_STORAGE: string;
// declare var STRUCTURE_OBSERVER: string;
// declare var STRUCTURE_POWER_BANK: string;
// declare var STRUCTURE_POWER_SPAWN: string;
// declare var STRUCTURE_EXTRACTOR: string;
// declare var STRUCTURE_LAB: string;
// declare var STRUCTURE_TERMINAL: string;


export class Economy
{
    resources: StoreDefinition = <any>{};
    demand: StoreDefinition = <any>{};

    constructor()
    {
        for (let name of RESOURCES_ALL)
        {
            this.resources[name] = 0;
            this.demand[name] = 0;
        }
    }

    countStoreResources(store: StoreDefinition): void
    {
        for (let prop in store)
        {
            if (this.resources[prop] == null)
            {
                this.resources[prop] = 0;
            }

            this.resources[prop] += store[prop];
        }
    }
}

export class Budget
{
    savings: { [resourceType: string]:number } = {};
}

export class SporeRoom extends Room
{
    economy: Economy;

    get budget(): Budget
    {
        let memory = Memory.rooms[this.name];
        if (memory == null)
        {
            memory = <RoomMemory>{};
            Memory.rooms[this.name] = memory;
        }

        if (memory.budget == null)
        {
            memory.budget = new Budget();
        }

        Object.defineProperty(this, "budget", {value: memory.budget});
        return memory.budget;
    }

    get my(): boolean
    {
        let my = this.controller != null && (this.controller.my || (this.controller.reservation != null && this.controller.reservation.username == 'PCake0rigin'));
        Object.defineProperty(this, "my", {value: my});
        return my;
    }

    get isReserved(): boolean
    {
        let isReserved = false;

        if (this.controller != null && this.controller.reservation != null)
        {
            isReserved = this.controller.reservation.username == 'PCake0rigin';
        }

        Object.defineProperty(this, "isReserved", {value: isReserved});
        return isReserved;
    }

    static getPriority(roomName: string): number
    {
        let memory = Memory.rooms[this.name];
        if (memory == null)
        {
            memory = <RoomMemory>{};
            Memory.rooms[this.name] = memory;
        }

        if (memory.priority == null)
        {
            memory.priority = 100;
        }

        if (Game.rooms[roomName] != null && Game.rooms[roomName].my && memory.priority <= 100)
        {
            memory.priority = 500;
        }

        return memory.priority;
    }

    get priority(): number
    {
        let priority = SporeRoom.getPriority(this.name);

        Object.defineProperty(this, "priority", {value: priority});
        return priority;
    }

    get sources(): Source[]
    {
        let memory = Memory.rooms[this.name];
        if (memory == null)
        {
            memory = <RoomMemory>{};
            Memory.rooms[this.name] = memory;
        }

        let sources: Source[];
        let sourceIds = memory.sources;

        if (sourceIds == null)
        {
            memory.sources = {};

            sources = this.find<Source>(FIND_SOURCES);
            _.forEach(sources, function(source: Source) { memory.sources[source.id] = <SourceMemory>{}; });
        }
        else
        {
            sources = [];
            for (let id in sourceIds)
            {
                let source = Game.getObjectById<Source>(id);

                if (source != null)
                {
                    sources.push(source);
                }
            }
        }

        Object.defineProperty(this, "sources", {value: sources});
        return sources;
    }

    get extractor(): StructureExtractor
    {
        let extractors = this.find<StructureExtension>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_EXTRACTOR
            }
        });

        let extractor = null;

        if (extractors != null && extractors.length > 0)
        {
            extractor = extractors[0];
        }

        Object.defineProperty(this, "extractor", {value: extractor});
        return extractor;
    }

    get mySpawns(): Spawn[]
    {
        let spawns = this.find<Spawn>(FIND_MY_SPAWNS);

        Object.defineProperty(this, "mySpawns", {value: spawns});
        return spawns;
    }

    get structures(): Structure[]
    {
        let structures = this.find<Structure>(FIND_STRUCTURES);

        Object.defineProperty(this, "structures", {value: structures});
        return structures;
    }

    get extensions(): StructureExtension[]
    {
        let extensions = this.find<StructureExtension>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_EXTENSION
            }
        });

        //Object.defineProperty(this, "extensions", {value: extensions});
        return extensions;
    }

    get containers(): StructureContainer[]
    {
        let containers = this.find<StructureContainer>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_CONTAINER
            }
        });

        Object.defineProperty(this, "containers", {value: containers});
        return containers;
    }

    get ramparts(): StructureRampart[]
    {
        let ramparts = this.find<any>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_RAMPART
            }
        });

        Object.defineProperty(this, "ramparts", {value: ramparts});
        return ramparts;
    }

    get towers(): StructureTower[]
    {
        let towers = this.find<any>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_TOWER
            }
        });

        Object.defineProperty(this, "towers", {value: towers});
        return towers;
    }

    get links(): StructureLink[]
    {
        let links = this.find<any>(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_LINK
            }
        });

        Object.defineProperty(this, "links", {value: links});
        return links;
    }

    _resources: Resource[] = null;
    _resourcesFindTick: number = -1;
    get resources(): Resource[]
    {
        if (this._resources != null && this._resourcesFindTick === Game.time)
        {
            return this._resources;
        }

        this._resources = this.find<Resource>(FIND_DROPPED_RESOURCES);
        this._resourcesFindTick = Game.time;

        return this._resources;
    }

    get constructionSites(): ConstructionSite[]
    {
        let constructionSites = this.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

        Object.defineProperty(this, "constructionSites", {value: constructionSites});
        return constructionSites;
    }

    get myCreeps(): Creep[]
    {
        let myCreeps = this.find<Creep>(FIND_MY_CREEPS);

        Object.defineProperty(this, "myCreeps", {value: myCreeps});
        return myCreeps;
    }

    get hostileCreeps(): Creep[]
    {
        let hostilesCreeps = this.find<Creep>(FIND_HOSTILE_CREEPS,
            {
                filter: (creep) =>
                {
                    return USERNAME_WHITELIST.indexOf(creep.owner.username.toLowerCase()) === -1;
                }
            });

        Object.defineProperty(this, "hostileCreeps", { value: hostilesCreeps });
        return hostilesCreeps;
    }

    get friendlyCreeps() : Creep[]
    {
        let friendlyCreeps = this.find<Creep>(FIND_HOSTILE_CREEPS,
            {
                filter: (creep) =>
                {
                    return USERNAME_WHITELIST.indexOf(creep.owner.username.toLowerCase()) > -1;
                }
            });

        Object.defineProperty(this, "friendlyCreeps", { value: friendlyCreeps });
        return friendlyCreeps;
    }

    get injuredFriendlyCreeps(): Creep[]
    {
        let injuredFriendlyCreeps = this.find<Creep>(FIND_CREEPS,
            {
                filter: (creep) =>
                {
                    return creep.hits < creep.hitsMax && USERNAME_WHITELIST.indexOf(creep.owner.username.toLowerCase()) > -1;
                }
            });

        Object.defineProperty(this, "injuredFriendlyCreeps", { value: injuredFriendlyCreeps });
        return injuredFriendlyCreeps;
    }

    lookForByRadiusAt(type: string, location: RoomObjectLike | RoomPosition, radius: number, asArray?: boolean): LookAtResultMatrix | LookAtResultWithPos[]
    {
        let pos = <RoomPosition>location;
        if ((<RoomObjectLike>location).pos != null)
        {
            pos = (<RoomObjectLike>location).pos;
        }

        return this.lookForAtArea(type, Math.max(pos.y - radius, 0), Math.max(pos.x - radius, 0), Math.min(pos.y + radius, 49), Math.min(pos.x + radius, 49), asArray);
    }

    trackEconomy(): void
    {
        this.economy = new Economy();

        if (this.budget.savings[RESOURCE_ENERGY] == null)
        {
            this.budget.savings[RESOURCE_ENERGY] = 100000;
        }

        for (let structure of this.containers)
        {
            if (structure.structureType === STRUCTURE_CONTAINER)
            {
                this.economy.countStoreResources((<StructureContainer>structure).store);
            }
        }

        for (let structure of this.links)
        {
            if (structure.structureType === STRUCTURE_LINK)
            {
                this.economy.resources[RESOURCE_ENERGY] += (<StructureLink>structure).energy;
            }
        }

        if (this.storage != null)
        {
            for (let prop in this.storage.store)
            {
                if (this.economy.resources[prop] == null)
                {
                    this.economy.resources[prop] = 0;
                }

                let savings = 0;
                if (this.budget.savings[prop] != null && this.budget.savings[prop] > 0)
                {
                    savings = this.budget.savings[prop];
                }

                this.economy.resources[prop] += Math.max(this.storage.store[prop] - savings, 0);
            }
        }

        for (let resource of this.resources)
        {
            this.economy.resources[resource.resourceType] += resource.amount;
        }

        for (let creep of this.myCreeps)
        {
            //this.economy.countStoreResources(creep.carry);
            this.economy.demand[RESOURCE_ENERGY] += creep.cost;
        }

        console.log(this + ' economy energy supply ' + this.economy.resources.energy);
        console.log(this + ' economy energy demand ' + Math.ceil(this.economy.demand.energy / 1500));
    }

    getTasks(): Task[]
    {
        let tasks: Task[] = [];

        //////////////////////////////////////////////////////////////////////////////
        // Activate safe mode
        {
            if (this.controller.safeModeAvailable > 0 && this.controller.safeMode == null)
            {
                let structures = _.filter(this.structures, function(structure: Structure)
                {
                    return !!(structure.structureType !== STRUCTURE_RAMPART &&
                        structure.structureType !== STRUCTURE_WALL &&
                        structure.structureType !== STRUCTURE_CONTAINER &&
                        structure.structureType !== STRUCTURE_LINK &&
                        structure.structureType !== STRUCTURE_ROAD);
                });

                for (let creep of this.hostileCreeps)
                {
                    if (creep.pos.findFirstInRange(structures, 2))
                    {
                        this.controller.activateSafeMode();
                    }
                }
            }
        }

        //////////////////////////////////////////////////////////////////////////////
        // Harvest energy
        {
            for (let source of this.sources)
            {
                if (source.doIgnore)
                {
                    continue;
                }

                let task = new HarvestEnergy(ScreepsPtr.from<Source>(source));
                task.priority = TaskPriority.Mandatory + 25;

                if (this.isReserved)
                {
                    task.idealCreepBody = CREEP_TYPE.REMOTE_MINER;
                }

                let spawn = source.pos.findClosestByPath<Spawn>(this.mySpawns, <any>{ ignoreCreeps:true });
                if (spawn != null)
                {
                    task.priority += Math.max(0, 150 - source.pos.findPathTo(spawn.pos, { ignoreCreeps:true }).length);
                }

                if (this.isReserved)
                {
                    task.id += 'E1N49';
                    task.roomName = 'E1N49';
                }

                tasks.push(task);
            }
        }
        //////////////////////////////////////////////////////////////////////////////
        // Carry remote energy
        if (this.isReserved)
        {
            if (this.name === 'E2N49' || this.name === 'E2N48' || this.name === 'E1N48')
            {
                let targets = [];
                let link = Game.getObjectById<StructureLink>('57f697aab36576753223a1c4');
                if (link != null && this.name === 'E2N49')
                {
                    targets.push(ScreepsPtr.from<StructureStorage>(Game.rooms['E1N49'].storage));
                }
                else
                {
                    targets.push(ScreepsPtr.from<StructureStorage>(Game.rooms['E1N49'].storage));
                }

                let task = new TransferResource(targets, RESOURCE_ENERGY, null, new CollectOptions([this.name], [['near_dropped'], ['link', 'container','storage'], ['dropped']]));

                task.priority = TaskPriority.High + 200;
                task.id = "Remote gather " + this;
                task.name = task.id;
                task.idealCreepBody = CREEP_TYPE.REMOTE_COURIER;

                task.id += 'E1N49';
                task.roomName = 'E1N49';

                task.capacityCap = 0;
                for (let source of this.sources)
                {
                    task.capacityCap += source.energyCapacity;
                }

                tasks.push(task);

                let defendTask = new DefendRoom(this.name);
                defendTask.roomName = 'E1N49';
                tasks.push(defendTask);
            }
        }

        //////////////////////////////////////////////////////////////////////////////
        // Fill Spawn and Extensions
        {
            let transferTargets: ScreepsPtr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>[] = [];

            for (let spawn of this.mySpawns)
            {
                transferTargets.push(ScreepsPtr.from<Spawn>(spawn));
            }

            for (let extension of this.extensions)
            {
                transferTargets.push(ScreepsPtr.from<StructureExtension>(extension));
            }

            if (transferTargets.length > 0)
            {
                let task;

                if (this.economy.resources[RESOURCE_ENERGY] > 0)
                {
                    task = new TransferResource(transferTargets, RESOURCE_ENERGY, null, new CollectOptions(null, [['near_dropped'], ['link', 'container','storage'], ['dropped']]));
                }
                else
                {
                    task = new TransferResource(transferTargets, RESOURCE_ENERGY, null, new CollectOptions(null, [['near_dropped'], ['link', 'container','storage'], ['dropped'], ['source']]));
                }

                task.priority = TaskPriority.Mandatory + 200;
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
            if (this.storage != null && this.storage.storeCapacityRemaining)
            {
                let transferEnergyTask = new TransferResource([ScreepsPtr.from<StructureStorage>(this.storage)], RESOURCE_ENERGY, null, new CollectOptions(null, [['near_dropped'], ['link', 'container'], ['dropped']]));
                transferEnergyTask.priority = TaskPriority.High;
                transferEnergyTask.name = "Transfer energy to " + ScreepsPtr.from<StructureStorage>(this.storage).toHtml();
                transferEnergyTask.capacityCap = 600;
                tasks.push(transferEnergyTask);
            }
        }


        //////////////////////////////////////////////////////////////////////////////
        // Upgrade room controller
        if (this.controller.owner != null && this.controller.owner.username == 'PCake0rigin')
        {
            let task = new UpgradeRoomController(ScreepsPtr.from<Controller>(this.controller));
            task.collectOptions.roomNames.push(this.name);
            tasks.push(task);
        }

        //////////////////////////////////////////////////////////////////////////////
        // Reinforce barriers
        if (!this.isReserved && this.controller.level >= 2)
        {
            let sites = _.filter(this.constructionSites, function(site:ConstructionSite)
            {
                if (!site.doIgnore && site.structureType === STRUCTURE_RAMPART || site.structureType === STRUCTURE_WALL)
                {
                    return true;
                }

                return false;
            });

            let structures = _.filter(this.structures, function(structure:Structure)
            {
                if (structure.structureType === STRUCTURE_WALL &&
                    (structure.pos.x === 0 || structure.pos.x === 49 ||
                    structure.pos.y === 0 || structure.pos.y === 49))
                {
                    // don't repair newbie walls
                    return false;
                }

                if (!structure.doIgnore && (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL))
                {
                    return true;
                }

                return false;
            }.bind(this));

            let barriers: ScreepsPtr<ConstructionSite | StructureWall | StructureRampart>[] =
                _.map(sites, function(site: ConstructionSite)
                {
                    return ScreepsPtr.from<ConstructionSite>(site);
                }).concat(
                    _.map(structures, function(structure: Structure)
                    {
                        return ScreepsPtr.from<any>(structure);
                    }));

            if (barriers.length > 0)
            {
                let task = new BuildBarrier(barriers);
                task.roomName = this.name;
                tasks.push(task);
            }
        }

        //////////////////////////////////////////////////////////////////////////////
        // Manage Ramparts
        {
            this.ramparts.forEach(x => {
                let site = x.pos.lookFor<ConstructionSite>(LOOK_CONSTRUCTION_SITES);
                if (site == null || site.length === 0)
                {
                    x.setPublic(x.pos.findInRange(this.hostileCreeps, 2).length === 0);
                }
                else
                {
                    x.setPublic(false);
                }
            });
        }

        //////////////////////////////////////////////////////////////////////////////
        // Construction sites
        {
            let sitesOrderedByProgress = _.sortBy(this.constructionSites, function(site: ConstructionSite){ return site.progressRemaining; });
            for (let site of sitesOrderedByProgress)
            {
                if (site.doIgnore || !site.my)
                {
                    continue;
                }

                let siteTasks = site.getTasks();

                if (site.doFavor)
                {
                    _.forEach(siteTasks, function(task: Task){ task.priority = TaskPriority.Mandatory + TaskPriority.ExtraDemandBoost});
                }

                tasks.push.apply(tasks, siteTasks);
            }
        }

        //////////////////////////////////////////////////////////////////////////////
        // Towers
        if (this.towers.length > 0)
        {
            if (this.hostileCreeps.length > 0)
            {
                for (let tower of this.towers)
                {
                    if (tower.attackTarget != null &&
                        tower.attackTarget.room != null &&
                        tower.attackTarget.room.name === tower.room.name &&
                        tower.attackTarget.pos.inRangeTo(tower.pos, 40))
                    {
                        tower.attack(tower.attackTarget);
                        continue;
                    }

                    tower.attackTarget = null;

                    let closestCreep = tower.pos.findClosestByRange<Creep>(this.hostileCreeps);

                    if (closestCreep.pos.inRangeTo(tower.pos, 30))
                    {
                        tower.attack(closestCreep);
                        tower.attackTarget = closestCreep;
                    }
                }
            }
            else if (this.injuredFriendlyCreeps.length > 0)
            {
                for (let tower of this.towers)
                {
                    console.log('/////////////////////////////////// ' + this.injuredFriendlyCreeps[0].name);
                    tower.heal(this.injuredFriendlyCreeps[0]);
                }
            }
        }

        //////////////////////////////////////////////////////////////////////////////
        // Structures
        {
            let hasTowersForRepair = this.towers.length > 0 && this.hostileCreeps.length === 0;
            for (let structure of this.structures)
            {
                if (structure.doIgnore)
                {
                    continue;
                }

                if ((<any>structure).getTasks != null)
                {
                    let structureTasks = (<any>structure).getTasks();

                    if (structure.doFavor)
                    {
                        structureTasks.forEach(function(task: Task){ task.priority = TaskPriority.Mandatory + TaskPriority.ExtraDemandBoost});
                    }

                    tasks.push.apply(tasks, structureTasks);
                }

                //////////////////////////////////////////////////////////////////////////////
                // Repair structures
                if (structure.structureType === STRUCTURE_CONTROLLER)
                {
                    continue;
                }

                if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART)
                {
                    continue;
                }

                let structureValue = { ideal: 10000, regular: { threshold: 0.5, priority: TaskPriority.High}, dire:{threshold: 0.85, priority: TaskPriority.Mandatory} };
                if (STRUCTURE_REPAIR_VALUES[structure.structureType] != null)
                {
                    structureValue = STRUCTURE_REPAIR_VALUES[structure.structureType];
                }

                if ((structure.needsRepair && structure.hits < structureValue.ideal) || structure.hits < structureValue.regular.threshold)
                {
                    structure.needsRepair = true;

                    let wasTowerRepaired = false;
                    if (hasTowersForRepair)
                    {
                        for (let tower of this.towers)
                        {
                            if (tower.repairTarget == null &&
                                tower.attackTarget == null &&
                                tower.energyCapacityRemaining < 300)
                            {
                                tower.repair(structure);
                                tower.repairTarget = structure;
                                wasTowerRepaired = true;
                                break;
                            }
                        }
                    }

                    if (wasTowerRepaired === false)
                    {
                        hasTowersForRepair = false;

                        let repairTask = new RepairStructure(ScreepsPtr.from<Structure>(structure));
                        repairTask.priority = structureValue.regular.priority;

                        if (structure.dire == true || structure.hits < structureValue.dire.threshold)
                        {
                            structure.dire = true;
                            repairTask.priority = structureValue.dire.priority;
                            repairTask.name = "Repair " + structure;
                        }

                        tasks.push(repairTask);
                    }
                }
                else
                {
                    structure.needsRepair = false;
                    structure.dire = false;
                }
            }
        }

        return tasks;
    }
}
