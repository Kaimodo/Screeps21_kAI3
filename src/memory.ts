
/**
 * The memory Version
 */
export let memoryVersion: number = 2;



export enum ScreepsReturnCode {
    ERR_NOT_OWNER = -1,
    ERR_NO_PATH = -2,
    ERR_NAME_EXISTS = -3,
    ERR_BUSY = -4,
    ERR_NOT_FOUND = -5,
    ERR_NOT_ENOUGH_RESOURCES = -6,
    ERR_NOT_ENOUGH_ENERGY = -6,
    ERR_INVALID_TARGET = -7,
    ERR_FULL = -8,
    ERR_NOT_IN_RANGE = -9,
    ERR_INVALID_ARGS = -10,
    ERR_TIRED = -11,
    ERR_NO_BODYPART = -12,
    ERR_NOT_ENOUGH_EXTENSIONS = -6,
    ERR_RCL_NOT_ENOUGH = -14,
    ERR_GCL_NOT_ENOUGH = -15
}

/**
 * The Gam Memory
 * @interface GameMemory
 */
interface GameMemory
{
    memVersion: number | undefined;
    uuid: number;
    log: any;
    //Profiler: Profiler;

    creeps:
    {
        [name: string]: any;
    };

    flags:
    {
        [name: string]: any;
    };

    rooms:
    {
        [name: string]: RoomMemory;
    };

    spawns:
    {
        [name: string]: any;
    };
}

/**
 * The Creep Roles as Number
 * @export CreepRoles
 * @enum {number}
 */
export const enum CreepRoles
{
    ROLE_UNASSIGNED = 0,
    ROLE_ALL,
    ROLE_BUILDER,
    ROLE_MINER,
    ROLE_MINEHAULER,
    ROLE_HEALER,
    ROLE_FIGHTER,
    ROLE_RANGER,
    ROLE_CLAIMER,
    ROLE_REMOTEMINER,
    ROLE_REMOTEMINEHAULER,
    ROLE_CUSTOMCONTROL,
    ROLE_UPGRADER,
    ROLE_UPGRADETRANSPORT
}

/**
 * makes string from the enum role
 * @export roleToString
 * @param {CreepRoles} job
 * @return {*}  {string}
 */
export function roleToString(job: CreepRoles): string
{
    switch (job)
    {
        case CreepRoles.ROLE_BUILDER: return "ROLE_BUILDER";
        case CreepRoles.ROLE_MINER: return "ROLE_MINER";
        case CreepRoles.ROLE_MINEHAULER: return "ROLE_MINEHAULER";
        case CreepRoles.ROLE_HEALER: return "ROLE_HEALER";
        case CreepRoles.ROLE_FIGHTER: return "ROLE_FIGHTER";
        case CreepRoles.ROLE_RANGER: return "ROLE_RANGER";
        case CreepRoles.ROLE_CLAIMER: return "ROLE_CLAIMER";
        case CreepRoles.ROLE_REMOTEMINER: return "ROLE_REMOTEMINER";
        case CreepRoles.ROLE_REMOTEMINEHAULER: return "ROLE_REMOTEMINEHAULER";
        case CreepRoles.ROLE_CUSTOMCONTROL: return "ROLE_CUSTOMCONTROL";
        default: return "unknown role";
    }
}

/**
 * a position (x/y) + range
 * @export NodeChoice
 * @interface NodeChoice
 */
export interface NodeChoice
{
    x: number;
    y: number;
    dist: number;
}
export interface NodeContainerIdChoice
{
    id: string;
    count: number;
}

/**
 * A Position (x/y)
 * @export MyPosition
 * @interface MyPosition
 */
export interface MyPosition
{
    x: number;
    y: number;
}
/**
 * Position (x/y)
 * @export PositionPlusTarget
 * @interface PositionPlusTarget
 */
export interface PositionPlusTarget
{
    x: number;
    y: number;
    targetId: string;
}
/**
 * A Room Position (x/y) plus target
 * @export RoomPositionPlusTarget
 * @interface RoomPositionPlusTarget
 */
export interface RoomPositionPlusTarget
{
    roomTarget: string;
    x: number;
    y: number;
    targetId: string;
}

/**
 * A task given from the Room to the Creep
 * @export MinerTask
 * @interface MinerTask
 */
export interface MinerTask
{
    taskId: number;
    minerPosition: PositionPlusTarget;
    assignedMinerName?: string;
    sourceContainer: PositionPlusTarget | undefined;

    //linkPullFrom: PositionPlusTarget | undefined;
    //linkPushTo: PositionPlusTarget | undefined;
    //linkPushToTarget: PositionPlusTarget | undefined;
    //desiredHaulers: number;
    //assignedHaulers: string[];
    //haulToStorage: boolean;
    //haulPos: MyPosition;
    //lastPickUpPos: MyPosition;
}

/**
 * @export RoomState
 * @class RoomState
 */
export class RoomState
{
    public towers: StructureTower[] = [];
    public rooms: Room[] = [];
    public creeps: Creep[] = [];
    public creepCount: number = 0;
    public miners: Creep[] = [];
    public builders: Creep[] = [];
    public structures: Structure[] = [];
    public controllers: StructureController[] = [];
    public spawns: StructureSpawn[] = [];
    public sources: Source [] = [];
    public storages: StructureStorage[] = [];
    public containers: StructureContainer[] = [];
    public constructionSites: ConstructionSite[] = [];
    public extensions: StructureExtension[] = [];
    public notRoadNeedingRepair: Structure[] = [];
}
/**
 * Roomstate
 */
export let roomState = new RoomState();

export class RoomMemory
{
    public room!: Room;
    public roomName!: string;
    public techLevel!: number;
    public energyLevel!: number;
    public minerTasks!: MinerTask[];
    public desiredBuilders!: number;
    public energySources!: PositionPlusTarget[];
    public containerPositions!: PositionPlusTarget[];
    public buildsThisTick!: number;
    public desiredWallHitPoints!: number;
    public desiredRampHitPoints!: number;

    public spawnText?: string;
    public spawnTextId?: string;
    public extensionIdsAssigned!: string[];

    // public ticksSinceUpgrade : number;
    // public desiredWorkHaulers : number;
    // public desiredClaimers : number;
    // public desiredUpgraders : number;
    // public desiredUpgradeTransports : number;

    // public ticksSinceDesiredhaulers : number;
    // public spawnId : string | undefined;
    // public roomCount : RoomCount;
    // public paths: {[name: string]: string | undefined};
    // public workHaulerRallyPos : MyPosition;

    // public assignedCreepNames : string[];
    // public assignedTowers : string[];
    // public tasks : WorkTask[];
    // public energyTasks :  EnergyTask[];
    // public remoteminerTasks : RemoteMinerTask[];
    // public sourcePositions : PositionPlusTarget[];
    // public attackWaves : AttackWave[];
    // public attackWavePlan : AttackWavePlan;
    // public desiredWallHitPoints : number;
    // public desiredEnergyInStorage : number;

    // public minerPositions : {[i: number]: number};
}
/**
 * My own Creep Memory
 */
export interface MyCreepMemory
{
    name: string;
    role: CreepRoles;
    roleString: string;
    log: boolean;
    gathering: boolean;
    assignedMineTaskId?: number;
    assignedContainerId?: string;
    assignedTargetId?: string;
    isUpgradingController: boolean;
    repairTargetId?: string;

    // roomName ?: string;
    // path ?: CreepPath;
    // assignedCreepTaskId ?: number;
    // assignedEnergyTaskId ?: number;
    // assignedPullEnergyFromStorage : boolean;
    // attackWave ?: CreepAttackWaveMemory;
    // claimerRoomTarget ?: string;
    // customControl ?: number;
    // customControlState ?: number;
}

/**
 * Return Creep memory
 * @param creep The creep
 * @returns Creep memory
 */
export function cm(creep: Creep): MyCreepMemory
{
    return creep.memory as unknown as MyCreepMemory;
}

/**
 * return Game MemoryS
 * @returns game Memory
 */
export function m(): GameMemory
{
    return Memory as any as GameMemory;
}

/**
 *  Log current Line
 * @param cmLog
 * @returns a Log
 */
export function l(cmLog: MyCreepMemory): string
{
    return `${cmLog.name}: `;
}

/**
 * @export number Set the current Game MemoryVersion
 * @param {number} value The number
 */
export function setMemVersion(value: number): void {
    memoryVersion = value;
}

/**
 * @export number current Game Memory Version
 * @return {*}  {number} Memory Version
 */
export function getMemVersion(): number {
    return memoryVersion;
}
