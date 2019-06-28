declare class SourceClaims {
  count: number;
  work: number;
  energy: number;
}

interface Source extends RoomObject, EnergyContainerLike {
  doIgnore: boolean;
  doFavor: boolean;
  doTrack: boolean;

  memory: SourceMemory;
  slots: number;
  priorityModifier: number;

  collect(collector: any, claimReceipt: ClaimReceipt): number;

  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
  claims: SourceClaims;
}

declare class LaborDemandType {
  parts: {
    [name: string]: number;
  };
  min: number;
  max: number;
  constructor(
    parts: {
      [name: string]: number;
    },
    min: number,
    max: number
  );
}

declare class LaborDemand {
  types: Record<string, LaborDemandType>;
}

declare class SpawnRequest {
  id: string;
  task: Task;
  replacingCreep: Creep;
  creepBody: BodyDefinition;
  constructor(id: string, task: Task, replacingCreep: Creep, creepBody: BodyDefinition);
}

declare class SpawnAppointment extends SpawnRequest {
  id: string;
  task: Task;
  spawnPriority: number;
  spawn: StructureSpawn;
  ticksTillRequired: number;
  replacingCreep: Creep;
  creepBody: BodyDefinition;
  constructor(
    id: string,
    task: Task,
    spawnPriority: number,
    spawn: StructureSpawn,
    ticksTillRequired: number,
    replacingCreep: Creep,
    creepBody: BodyDefinition
  );
}

interface RawMemory {
  _parsed: Memory;
}

interface TaskMemory {}

interface BuildBarrierMemory {
  tick: number;
  barriers: Ptr<ConstructionSite | StructureWall | StructureRampart>[] | string[];
  averageHits: number;
}

declare class Task {
  id: string;
  name: string;
  possibleWorkers: number;
  priority: number;
  roomName: string;
  labor: LaborDemand;
  near: RoomObject | Ptr<RoomObject>;
  isComplex: boolean;
  getSteps(): Task[];
  createAppointment(spawn: StructureSpawn, request: SpawnRequest): SpawnAppointment;
  shouldPlanToReplace(object: RoomObject): boolean;
  getPrioritizingConditions(conditions: Array<any>): void;
  isIdeal(object: RoomObject): boolean;
  beginScheduling(): void;
  schedule(object: RoomObject): number;
  endScheduling(): void;
}

type OBJECT_CREEP = "creep";
type OBJECT_SOURCE = "source";
type OBJECT_FLAG = "flag";
type OBJECT_CONSTRUCTION_SITE = "site";
type OBJECT_NUKE = "nuke";
type OBJECT_TOMBSTONE = "tombstone";
type OBJECT_POWER_CREEP = "powerCreep";

declare const OBJECT_CREEP: "creep";
declare const OBJECT_SOURCE: "source";
declare const OBJECT_FLAG: "flag";
declare const OBJECT_CONSTRUCTION_SITE: "site";
declare const OBJECT_NUKE: "nuke";
declare const OBJECT_TOMBSTONE: "tombstone";
declare const OBJECT_POWER_CREEP: "powerCreep";

type PtrTypeConstant =
  | StructureConstant
  | ResourceConstant
  | OBJECT_CREEP
  | OBJECT_SOURCE
  | OBJECT_FLAG
  | OBJECT_CONSTRUCTION_SITE
  | OBJECT_NUKE
  | OBJECT_TOMBSTONE
  | OBJECT_POWER_CREEP;

declare class Ptr<T extends RoomObject> {
  pos: RoomPosition;
  id: string;
  type: PtrTypeConstant;
  modifier: string;

  toString(): string;
  toHtml(): string;

  readonly room: Room;
  readonly isValid: boolean;
  readonly isShrouded: boolean;
  readonly instance: T;

  static fromPosition<T extends RoomObject>(
    pos: RoomPosition,
    lookType: LookConstant,
    lookTypeModifier: string
  ): Ptr<T>;

  static from<T extends RoomObject>(object: T): Ptr<T>;
}

interface SporeCostMatrixOption {
  id: string;
  cost: number;
  targets?: RoomPosition | RoomObject | (RoomPosition | RoomObject)[];
}

declare class SporePathOptions {
  plainCost: number;
  swampCost: number;
  maxRooms: number;
  maxOps: number;
  costs: SporeCostMatrixOption[];
  persist?:
    | string
    | {
        id: string;
        ticks: number;
      };
  constructor(
    costs: SporeCostMatrixOption[],
    persist?:
      | string
      | {
          id: string;
          ticks: number;
        }
  );
}

declare class SporePathFinder {
  findPathTo(
    origin: RoomPosition,
    goals:
      | RoomPosition
      | { pos: RoomPosition; range: number }
      | (RoomPosition | { pos: RoomPosition; range: number })[],
    options?: SporePathOptions
  ): SporePath;
  static getNextPositionByDirection(pos: RoomPosition, direction: number): RoomPosition;
}

interface SporeColony {
  pathFinder: SporePathFinder;
  tasks: Task[];
  tasksById: Record<string, Task>;
  spawnRequests: SpawnRequest[];
  requestsCurrentlySpawning: string[];

  cpuSpentPathing: number;
  pathingCpuLimit: number;

  claimResource(
    claimer: any,
    resourceType: string,
    amount: number,
    minAmount: number,
    isExtended: boolean,
    near: RoomPosition | RoomObject,
    options: CollectOptions,
    excludes: Record<string, Claimable>,
    receipt?: ClaimReceipt
  ): ClaimReceipt;
}

interface Creep {
  carryCount: number;
  task: Task;
  taskPriority: number;
  taskMetadata: any;
  action: string;
  actionTarget: string;
  claimReceipt: ClaimReceipt;
  carryCapacityRemaining: number;
  pos: RoomPosition;
  room: Room;
  type: string;
  spawnRequest: SpawnRequest;
  cost: number;

  colony: SporeColony;

  getEfficiencyAs(bodyDefinition: BodyDefinition): number;

  goMoveTo(target: RoomObject | RoomPosition | Ptr<RoomObject>, navigation?: NavigationRules): number;
  goHarvest(source: Ptr<Source>, navigation?: NavigationRules): number;
  goTransfer(
    resourceType: ResourceConstant,
    target: Ptr<EnergyContainerLike | StoreContainerLike | CarryContainerLike>,
    navigation?: NavigationRules
  ): number;
  goBuild(site: Ptr<ConstructionSite>, navigation?: NavigationRules): number;
  goDismantle(structure: Ptr<Structure>, navigation?: NavigationRules): number;
  goRepair(structure: Ptr<Structure>, navigation?: NavigationRules): number;
  goCollect(
    resourceType: ResourceConstant,
    amount: number,
    minAmount: number,
    isExtended: boolean,
    near: RoomObject | RoomPosition,
    options: CollectOptions,
    excludes: Record<string, Claimable>,
    navigation?: NavigationRules
  ): number;
  goUpgrade(controller: Ptr<StructureController>, navigation?: NavigationRules): number;
  goReserve(controller: Ptr<StructureController>, navigation?: NavigationRules): number;
  goClaim(controller: Ptr<StructureController>, navigation?: NavigationRules): number;
  goRecycle(spawn: Ptr<StructureSpawn>, navigation?: NavigationRules): number;
}

interface PowerCreepMemory extends RoomObjectMemory {}

interface PowerCreep {}

declare class Bond {
  target: RoomObject;
  targetId: string;
  targetFlag: Flag;
  myFlag: Flag;
  type: string;
  exists(): boolean;
  static discover(obj: RoomObject, lookType: string): Bond;
}

interface Structure extends RoomObject {
  hitsMissing: number;
  needsRepair: boolean;
  dire: boolean;

  memory: StructureMemory;
}

declare class ClaimReceipt {
  target: Claimable;
  type: string;
  resourceType: string;
  amount: number;
  constructor(target: Claimable, type: string, resourceType: string, amount: number);
}

interface StructureMemory extends RoomObjectMemory {
  needsRepair: boolean;
  dire: boolean;
}

interface StructureExtension {
  energyCapacityRemaining: number;

  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface TowerMemory extends StructureMemory {
  attackTargetId: string;
}

interface StructureTower {
  attackTarget: Creep;
  repairTarget: Structure;

  energyCapacityRemaining: number;
  memory: TowerMemory;

  getTasks(): Task[];

  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface StructureContainer {
  storeCount: number;
  storeCapacityRemaining: number;

  getTasks(): Task[];

  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface SpawnMemory extends StructureMemory {}

declare class BodyPartRequirements {
  public type: BodyPartConstant;
  public max: number;
  public min: number;
  public increment: number;
  constructor(type: BodyPartConstant, max: number, min: number, increment: number);
}

declare class BodyDefinition {
  name: string;
  requirements: BodyPartRequirements[];
  getPossibleParts(part: string): number;
  constructor(name: string);
}

interface StructureSpawn extends RoomObject {
  energyCapacityRemaining: number;
  needsRepair: boolean;
  dire: boolean;

  getBody(creepBody: BodyDefinition, energyCapacityAvailable?: number): BodyPartConstant[];

  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface LinkMemory extends StructureMemory {
  takesTransfers: boolean;
  nearBySourceId: string;
  bondTargetId: string;
  bondTargetFlagName: string;
  bondMyFlagName: string;
  bondType: LookConstant;
}

interface StructureLink {
  energyCapacityRemaining: number;
  memory: LinkMemory;
  takesTransfers: boolean;
  bond: Bond;

  getTasks(): Task[];

  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface ControllerMemory extends StructureMemory {
  claimSlots: number;
}

interface StructureController extends RoomObject {
  memory: ControllerMemory;
  slots: number;
}

interface Configuration {
  tasks: { [key: string]: any };
}

interface SporePathMemory {
  ops: number;
  cost: number;
  incomplete?: boolean;
  needsUpdated: boolean;
  tickCalculated: number;
  tickLifespan: number;
  start: string;
  end: string;
  rooms: {
    [roomName: string]: {
      entrance?: string;
      exit?: string;
      entranceIndex?: number;
      exitIndex?: number;
    };
  };
  directions: string;
}

interface Memory {
  scriptVersion: number;
  previousTick: {};
  paths: {
    [id: string]: SporePathMemory;
  };

  previousTasks: { [key: string]: any };
  tasks: { [key: string]: any };

  config: Configuration;
}

interface SporePath {
  readonly ops: number;
  readonly cost: number;
  readonly incomplete: boolean;
  readonly start: RoomPosition;
  readonly end: RoomPosition;
  needsUpdated: boolean;

  getNextMove(index: number): DirectionConstant;
  getNextPositions(pos: RoomPosition, index: number, count?: number): RoomPosition[];
  getPositions(roomName?: string, start?: number): RoomPosition[];
  findLastPositionInRoom(roomName: string, direction: number): RoomPosition;
  getSubPath(roomName: string): SporePath;
  findIntersectionWith(other: SporePath): { baseIndex: number; otherIndex: number };
  setIndexAsDestination(index: number);
  leadsTo(pos: RoomPosition, direction: number, range: number): boolean;
  isEqualTo(other: SporePath): boolean;
  serialize(): SporePathMemory;
}

interface NavigationRules {
  path?: SporePath;
  direction?: number;
  range?: number;
}

interface SpawnRequestMemory {
  id: string;
  taskId: string;
  replacingCreepName: string;
}

interface CreepMovementMemory {
  improv: SporePathMemory;
  mergeIndex: number;

  path: SporePathMemory;
  pathIndex: number;

  expectedPosRoomName: string;
  expectedPosX: number;
  expectedPosY: number;

  failedMoveAttempts: number;
}

interface CreepMemory extends RoomObjectMemory {
  type: string;
  speed: number;

  taskId: string;
  taskPriority: number;
  taskMetadata: any;
  spawnRequest: SpawnRequestMemory;
  cost: number;

  action: string;
  actionTarget: string;

  movement: CreepMovementMemory;
  bodyEfficiency: Record<string, number>;

  claimReceiptTargetId: string;
  claimReceiptTargetType: string;
  claimReceiptResourceType: string;
  claimReceiptAmount: number;
}

interface RoomObjectMemory {
  track: boolean;
}

interface RoomObject {
  doIgnore: boolean;
  doFavor: boolean;
  doTrack: boolean;

  id: string;
  memory: RoomObjectMemory;
}

interface RoomPosition {
  serialize(): string;
  sortByRangeTo(targets: RoomObject[]): void;
  getWalkableSurroundingArea(ignoreObjects?: boolean): number;
  getWalkableSurroundingAreaInRange(target: RoomPosition, range: number, ignoreObjects?: boolean): RoomPosition[];
  findFirstInRange(targets: RoomObject[], range: number): RoomObject;
  findClosestInRange(targets: RoomObject[], range: number): RoomObject;
  findDistanceByPathTo(other: RoomPosition | RoomObject, opts?: FindPathOpts): number;
}

interface CarryContainerLike extends RoomObject {
  carry: StoreDefinition;
  carryCapacity: number;
  carryCapacityRemaining: number;
}

interface Claimable extends RoomObject {
  id: string;
  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface StoreContainerLike extends RoomObject {
  store: StoreDefinition;
  storeCapacity: number;
  storeCapacityRemaining: number;
}

interface EnergyContainerLike extends RoomObject {
  energy: number;
  energyCapacity: number;
  energyCapacityRemaining: number;
}

interface Resource {
  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface FlagMemory extends RoomObjectMemory {}

interface Flag {
  getTasks(): Task[];
}

interface SourceMemory {
  track: boolean;
  claimSlots: number;
  pathToClosestSpawn: SporePathMemory;
}

interface ConstructionSiteMemory extends RoomObjectMemory {}

interface ConstructionSite extends RoomObject {
  readonly progressRemaining: number;
  readonly memory: ConstructionSiteMemory;
  getTasks(): Task[];
}

interface StructureStorage {
  storeCount: number;
  storeCapacityRemaining: number;

  collect(collector: any, claimReceipt: ClaimReceipt): number;
  makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}

interface StorageMemory extends StructureMemory {}

declare class Budget {
  savings: {
    [resourceType: string]: number;
  };
}

interface RoomMemory {
  priority: number;
  sources: Record<string, SourceMemory>;
  spawns: SpawnMemory[];
  structures: Record<string, StructureMemory>;
  sites: Record<string, ConstructionSiteMemory>;
  tasks: Record<string, TaskMemory>;
  controller: ControllerMemory;
  storage: StorageMemory;
  budget: Budget;
  energyHarvestedSinceLastInvasion: number;
  reservedBy?: string;
}

declare class CollectOptions {
  roomNames: string[];
  storePriorities: string[][];
  constructor(roomNames: string[], storePriorities: string[][]);
}

declare class Economy {
  resources: StoreDefinition;
  demand: StoreDefinition;
  countStoreResources(store: StoreDefinition): void;
}

interface Room {
  getTasks(): Task[];
  trackEconomy(): void;
  claimResource(
    claimer: any,
    resourceType: string,
    amount: number,
    minAmount: number,
    isExtended: boolean,
    near: RoomPosition,
    options: CollectOptions,
    excludes: Record<string, Claimable>,
    receipt?: ClaimReceipt
  ): ClaimReceipt;
  getRouteTo(roomName: string): any[];
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

  sources: Source[];
  extractor: StructureExtractor;
  links: StructureLink[];
  structures: Structure[];
  nonwalkableStructures: Structure | ConstructionSite[];
  constructionSites: ConstructionSite[];
  allySites: ConstructionSite[];
  containers: StructureContainer[];
  extensions: StructureExtension[];
  roads: Structure[];
  towers: StructureTower[];
  ramparts: StructureRampart[];
  mySpawns: StructureSpawn[];
  creeps: Creep[];
  myCreeps: Creep[];
  hostileCreeps: Creep[];
  friendlyCreeps: Creep[];
  injuredFriendlyCreeps: Creep[];

  economy: Economy;
  budget: Budget;
  energyHarvestedSinceLastInvasion: number;

  my: boolean;
  isReserved: boolean;
  priority: number;
}
