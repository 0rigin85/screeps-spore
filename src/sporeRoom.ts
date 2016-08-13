import {Task, TaskPriority, TaskSet} from "./task";
import {SourceMemory} from "./sporeSource";
import {Claimable, ClaimReceipt} from "./sporeClaimable";
import {TransferResource} from "./taskTransferResource";
import {StorageMemory} from "./sporeStorage";
import {StructureMemory, StructureMemorySet} from "./sporeStructure";
import {ConstructionSiteMemory} from "./sporeConstructionSite";
import {ControllerMemory} from "./sporeController";
import {UpgradeRoomController} from "./taskUpgradeRoomController";
import {RepairStructure} from "./taskRepairStructure";

declare global
{
    interface Room
    {
        getTasks(): Task[];
        claimResource(claimer: any, resourceType: string, amount: number, isExtended: boolean, near: RoomPosition, storePriorities: string[][], receipt?: ClaimReceipt): ClaimReceipt;

        tasksById: TaskSet;
        tasks: Task[];
        basicTasks: Task[];
        needsWorkers: boolean;

        sources: Source[];
        links: StructureLink[];
        structures: Structure[];
        constructionSites: ConstructionSite[];
        containers: StructureContainer[];
        extensions: StructureExtension[];
        towers: StructureTower[];
        mySpawns: Spawn[];
        hostileCreeps: Creep[];

        my: boolean;
    }

    interface RoomMemory
    {
        sources: SourceMemory[];
        spawns: SpawnMemory[];
        structures: StructureMemorySet;
        sites: ConstructionSiteMemory[];
        controller: ControllerMemory;
        storage: StorageMemory;
    }
}

var GATHER_RESOURCE_STORES =
{
    'source': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let source of this.sources)
        {
            if (source.doIgnore !== true && source.energy > 0)
            {
                collection.push(source);
            }
        }
    },
    'dropped': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        let resources = claimer.pos.findInRange(FIND_DROPPED_ENERGY, 5);

        for (let resource of resources)
        {
            if (resource.doIgnore !== true &&
                resource.resourceType === resourceType &&
                resource.amount > 0)
            {
                collection.push(resource);
            }
        }
    },
    'container': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        for (let container of this.containers)
        {
            if (container.doIgnore !== true &&
                container.store[resourceType] > 0)
            {
                collection.push(container);
            }
        }
    },
    'link': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let link of this.links)
        {
            if (link.doIgnore !== true &&
                link.energy > 0 &&
                link.takesTransfers)
            {
                collection.push(link);
            }
        }
    },
    'storage': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        if (this.storage != null &&
            this.storage.doIgnore !== true &&
            this.storage.store[resourceType] > 0)
        {
            collection.push(this.storage);
        }
    },
    'extension': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let extension of this.extensions)
        {
            if (extension.doIgnore !== true &&
                extension.energy > 0)
            {
                collection.push(extension);
            }
        }
    },
    'spawn': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let spawn of this.mySpawns)
        {
            if (spawn.doIgnore !== true &&
                spawn.energy > 0)
            {
                collection.push(spawn);
            }
        }
    },
    'tower': function(collection: Claimable[], resourceType: string, claimer: any, near: RoomPosition)
    {
        if (resourceType !== RESOURCE_ENERGY)
        {
            return;
        }

        for (let tower of this.towers)
        {
            if (tower.doIgnore !== true &&
                tower.energy > 0)
            {
                collection.push(tower);
            }
        }
    }
};

let STRUCTURE_REPAIR_VALUES = {};
STRUCTURE_REPAIR_VALUES[STRUCTURE_CONTAINER] = { ideal: CONTAINER_HITS, regular: { threshold: 200000, priority: TaskPriority.High}, dire:{threshold: 100000, priority: TaskPriority.Mandatory} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_TOWER] = { ideal: TOWER_HITS, regular: { threshold: 2000, priority: TaskPriority.High}, dire:{threshold: 1000, priority: TaskPriority.Mandatory} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_ROAD] = { ideal: ROAD_HITS, regular: { threshold: 2500, priority: TaskPriority.High}, dire:{threshold: 500, priority: TaskPriority.Medium} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_RAMPART] = { ideal: 20000, regular: { threshold: 10000, priority: TaskPriority.High}, dire:{threshold: 1000, priority: TaskPriority.Mandatory} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_WALL] = { ideal: 10000, regular: { threshold: 10000, priority: TaskPriority.Medium}, dire:{threshold: 1000, priority: TaskPriority.Medium} };
STRUCTURE_REPAIR_VALUES[STRUCTURE_LINK] = { ideal: LINK_HITS_MAX, regular: { threshold: LINK_HITS_MAX * 0.8, priority: TaskPriority.High}, dire:{threshold: LINK_HITS_MAX * 0.3, priority: TaskPriority.Mandatory} };

// declare var STRUCTURE_KEEPER_LAIR: string;
// declare var STRUCTURE_STORAGE: string;
// declare var STRUCTURE_OBSERVER: string;
// declare var STRUCTURE_POWER_BANK: string;
// declare var STRUCTURE_POWER_SPAWN: string;
// declare var STRUCTURE_EXTRACTOR: string;
// declare var STRUCTURE_LAB: string;
// declare var STRUCTURE_TERMINAL: string;


export class SporeRoom extends Room
{
    tasksById: TaskSet = {};
    tasks: Task[] = [];
    basicTasks: Task[] = [];
    needsWorkers: boolean = false;

    get my(): boolean
    {
        let my = this.controller != null && (this.controller.my || (this.controller.reservation != null && this.controller.reservation.username == 'PCake0rigin'));
        Object.defineProperty(this, "my", {value: my});
        return my;
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

        Object.defineProperty(this, "extensions", {value: extensions});
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

    get resources(): Resource[]
    {
        let resources = this.find<Resource>(FIND_DROPPED_RESOURCES);

        Object.defineProperty(this, "resources", {value: resources});
        return resources;
    }

    get constructionSites(): ConstructionSite[]
    {
        let constructionSites = this.find<ConstructionSite>(FIND_CONSTRUCTION_SITES);

        Object.defineProperty(this, "constructionSites", {value: constructionSites});
        return constructionSites;
    }

    get hostileCreeps(): Creep[]
    {
        let hostileCreeps = this.find<Creep>(FIND_HOSTILE_CREEPS);

        Object.defineProperty(this, "hostileCreeps", {value: hostileCreeps});
        return hostileCreeps;
    }

    claimResource(claimer: any, resourceType: string, amount: number, isExtended: boolean, near: RoomPosition, storePriorities: string[][], receipt?: ClaimReceipt): ClaimReceipt
    {
        if (receipt != null && receipt.target != null)
        {
            let flatStorePriorities = _.flattenDeep<string>(storePriorities);
            if (_.includes(flatStorePriorities, receipt.type) ||
                _.includes(flatStorePriorities, receipt.target.id))
            {
                let claim = receipt.target.makeClaim(claimer, resourceType, amount, isExtended);
                if (claim !== null)
                {
                    return claim;
                }
            }
        }

        for (let priorityIndex = 0; priorityIndex < storePriorities.length; priorityIndex++)
        {
            let group = storePriorities[priorityIndex];
            let claimables: Claimable[] = [];

            for (let index = 0; index < group.length; index++)
            {
                GATHER_RESOURCE_STORES[group[index]].bind(this)(claimables, resourceType, claimer, near);
            }

            if (claimables.length > 0)
            {
                near.sortByRangeTo(claimables);

                for (let claimable of claimables)
                {
                    if (claimable.makeClaim == null)
                    {
                        console.log(claimable);
                    }

                    let newReceipt = claimable.makeClaim(claimer, resourceType, amount, isExtended);

                    if (newReceipt != null)
                    {
                        return newReceipt;
                    }
                }
            }
        }

        return null;
    }

    getTasks(): Task[]
    {
        let tasks: Task[] = [];

        //////////////////////////////////////////////////////////////////////////////
        // Fill Spawn and Extensions
        {
            let transferTargets: RoomObject[] = [];

            transferTargets.push.apply(transferTargets, this.mySpawns);
            transferTargets.push.apply(transferTargets, this.extensions);

            if (transferTargets.length > 0)
            {
                let task = new TransferResource("", transferTargets, RESOURCE_ENERGY, [['dropped'], ['link', 'container'], ['source'], ['storage']]);
                task.priority = TaskPriority.Mandatory + 100;
                task.name = "Transfer energy to all Spawns and Extensions";
                task.possibleWorkers = 4;

                tasks.push(task);
            }
        }


        //////////////////////////////////////////////////////////////////////////////
        // Fill storage
        {
            if (this.storage != null && this.storage.storeCapacityRemaining)
            {
                let transferEnergyTask = new TransferResource("", [this.storage], RESOURCE_ENERGY, [['dropped'], ['link', 'container']]);
                transferEnergyTask.priority = TaskPriority.High;
                transferEnergyTask.name = "Transfer energy to " + this;
                transferEnergyTask.possibleWorkers = 1;
                tasks.push(transferEnergyTask);
            }
        }


        //////////////////////////////////////////////////////////////////////////////
        // Upgrade room controller
        {
            let task = new UpgradeRoomController("", this);
            tasks.push(task);
        }

        //////////////////////////////////////////////////////////////////////////////
        // Construction sites
        {
            let sitesOrderedByProgress = _.sortBy(this.constructionSites, function(site: ConstructionSite){ return site.progressRemaining; });
            for (let site of sitesOrderedByProgress)
            {
                if (site.doIgnore && !site.my)
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
        // Structures
        {
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
                if (structure.structureType == STRUCTURE_CONTROLLER)
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
                    let repairTask = new RepairStructure("", structure);
                    repairTask.priority = structureValue.regular.priority;

                    if (structure.dire == true || structure.hits < structureValue.dire.threshold)
                    {
                        structure.dire = true;
                        repairTask.priority = structureValue.dire.priority;
                        repairTask.name = "Repair " + structure;
                    }

                    structure.needsRepair = true;
                    tasks.push(repairTask);
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
