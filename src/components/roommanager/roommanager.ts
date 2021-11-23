import * as Profiler from "screeps-profiler";
import * as Inscribe from "screeps-inscribe";

import { log } from "tools/logger/logger";
import { ENABLE_DEBUG_MODE } from "config";

import * as Config from "config";
import {DESIRED_BUILDERS} from "config";
import * as Orga from "../../organize.json";

import * as Mem from "memory";

import {Builder} from "components/creeps/builder";
import {Miner} from "components/creeps/miner";

import {roadBuilder} from "components/roadbuilder";


import { Emoji } from "tools/emoji";
import { Tower } from 'components/tower';

import { StructLevel } from "./structLevel";



export class RoomManager {
    public static run (room: Room, roomMem: Mem.RoomMemory): void {

        RoomManager.scanRoom(room, roomMem);

        RoomManager.showSpawnTextIfSpawn(room, roomMem);

        RoomManager.buildMissingCreeps(room, roomMem);


        // Loop Creeps
        _.each(Mem.roomState.creeps, (creep: Creep) => {
            const creepMem = Mem.cm(creep);
            if (creepMem.role === Mem.CreepRoles.ROLE_MINER) {
                Miner.run(room, roomMem, creep);
            } else if(creepMem.role === Mem.CreepRoles.ROLE_BUILDER) {
                Builder.run(room, roomMem, creep);
            } else {
                RoomManager.assignRoleToCreep(creep, creepMem);
            }
        });
        // Run Tower
        Tower.run(room);

    }
    private static showSpawnTextIfSpawn(room: Room, roomMem: Mem.RoomMemory): void {
        if (roomMem.spawnText !== undefined && roomMem.spawnTextId !== undefined) {
            const spawnId: Id<StructureSpawn> = roomMem.spawnTextId as Id<StructureSpawn>;
            const spawn = Game.getObjectById(spawnId) as StructureSpawn;
            const offset = Number(spawn.name.slice(-1)) % 2 === 0 ? 1 : -1;


            room.visual.text(
                roomMem.spawnText,
                spawn.pos.x + 1,
                spawn.pos.y + offset,
                { align: "left", opacity: 0.8 });

            if (spawn.spawning === null) {
                roomMem.spawnText = undefined;
            }
        }

    }
    private static assignRoleToCreep(creep: Creep, creepMem: Mem.MyCreepMemory): void {
        creepMem.name = creep.name;
        if (creep.name.search("ROLE_MINER") >= 0) {
            creepMem.role = Mem.CreepRoles.ROLE_MINER;
        } else if (creep.name.search("ROLE_BUILDER") >= 0) {
            creepMem.role = Mem.CreepRoles.ROLE_BUILDER;
        }
    }
    private static getTechLevel(room: Room, roomMem: Mem.RoomMemory, numExtensionToBuild: number, numTowersToBuild: number, numStoragesToBuild: number): number {
        // Tech level 1 = building miners
        // Tech level 2 = building containers
        // Tech level 3 = building builders
        // Tech level 4 = building extensions
        // Tech level 5 = ?
        if (Mem.roomState.miners.length < roomMem.minerTasks.length - 2) {
            return 1
        }
        if (Mem.roomState.containers.length !== roomMem.energySources.length) {
            return 2;
        }

        if (Mem.roomState.builders.length < roomMem.desiredBuilders - 2) {
            return 3;
        }

        if (Mem.roomState.extensions.length < numExtensionToBuild) {
            return 4;
        }
        // log.debug(`${Emoji.debug} rStateTow: ${Mem.roomState.towers.length}/${numTowersToBuild}`);
        if (Mem.roomState.towers.length < numTowersToBuild) {
            return 5;
        }

        if (Mem.roomState.storages.length < numStoragesToBuild) {
            return 6
        }

        return 7;
    }
    // TODO Check for Export Task-manager
    // TODO Hauler
    // TODO Container Controller
    private static scanRoom (room: Room, roomMem: Mem.RoomMemory) {
        Mem.roomState.creeps = room.find(FIND_MY_CREEPS);
        Mem.roomState.creepCount = _.size(Mem.roomState.creeps);
        Mem.roomState.miners = _.filter(Mem.roomState.creeps, (creep) => Mem.cm(creep).role === Mem.CreepRoles.ROLE_MINER);
        Mem.roomState.builders = _.filter(Mem.roomState.creeps, (creep) => Mem.cm(creep).role === Mem.CreepRoles.ROLE_BUILDER);
        Mem.roomState.structures = room.find<StructureContainer>(FIND_STRUCTURES);
        Mem.roomState.controllers = _.filter(Mem.roomState.structures, (structure) => structure.structureType === STRUCTURE_CONTROLLER) as StructureController[];
        Mem.roomState.spawns = _.filter(Mem.roomState.structures, (structure) => structure.structureType === STRUCTURE_SPAWN) as StructureSpawn[];
        Mem.roomState.sources = room.find(FIND_SOURCES);
        Mem.roomState.storages = _.filter(Mem.roomState.structures, (structure) => structure.structureType === STRUCTURE_STORAGE) as StructureStorage[];
        Mem.roomState.containers = _.filter(Mem.roomState.structures, (structure) => structure.structureType === STRUCTURE_CONTAINER) as StructureContainer[];
        Mem.roomState.extensions = _.filter(Mem.roomState.structures, (structure) => structure.structureType === STRUCTURE_EXTENSION) as StructureExtension[];
        Mem.roomState.constructionSites = room.find(FIND_MY_CONSTRUCTION_SITES);
        Mem.roomState.constructionSites = _.sortBy(Mem.roomState.constructionSites, (constructionSite: ConstructionSite) => constructionSite.id);
        Mem.roomState.towers = _.filter(Mem.roomState.structures, (structure) => structure.structureType === STRUCTURE_TOWER) as StructureTower[];

        roomMem.room = room;

        RoomManager.findNonRoadNeedingRepair(room, roomMem);
        // TODO BUILD Container for Controller: miner.ts

        const numExtensionToBuild = new StructLevel().getMaxStructs(STRUCTURE_EXTENSION, Mem.roomState.controllers[0]);
        const numTowersToBuild = new StructLevel().getMaxStructs(STRUCTURE_TOWER, Mem.roomState.controllers[0]);
        const numStoragesToBuild = new StructLevel().getMaxStructs(STRUCTURE_STORAGE, Mem.roomState.controllers[0]);

        roomMem.techLevel = RoomManager.getTechLevel(room, roomMem, numExtensionToBuild, numTowersToBuild, numStoragesToBuild);
        roomMem.energyLevel = RoomManager.getRoomEnergyLevel(room, roomMem);
        roomMem.buildsThisTick = 0;

        if (Game.time % 10 === 0) {
            RoomManager.buildExtension(room, roomMem, numExtensionToBuild);
            if (room.controller) {
                if (room.controller?.level >= 3) {
                    RoomManager.buildTower(room, roomMem, numTowersToBuild);
                }
                if(room.controller.level >= 4 && roomMem.techLevel >=5) {
                    RoomManager.buildStorage(room, roomMem, numStoragesToBuild);
                    const buildSource = roadBuilder.placeRoadSourceToSpawn(room);
                    if (buildSource === OK) {
                        // log.info(`${Emoji.info} Created road from Spawn to Source`);
                    }
                    const buildS2S = roadBuilder.placeRoadSource2Source(room);
                    if (buildS2S === OK ) {
                        // log.info(`${Emoji.info} Created road from Source to Source`);
                    }
                    const buildController = roadBuilder.placeRoadControllerToSpawn(room);
                    if (buildController === OK) {
                        // log.info(`${Emoji.info} Created road from Spawn to Controller`);
                    }
                    const buildExtension = roadBuilder.placeRoadSpawnToExtensions(room);
                    if (buildExtension === OK) {
                        // log.info(`${Emoji.info} Created road from Spawn to Extensions`);
                    }
                    const buildStorage = roadBuilder.placeRoadSpawnToStorage(room);
                    if (buildStorage === OK) {
                         // log.info(`${Emoji.info} Created road from Spawn to Storage`);
                    }
                }
            }
        }
        if (Game.time % 50 === 0) {
            roomMem.extensionIdsAssigned = [];
        }
        if (Game.time % 25 === 0) {
            log.info(`[${Inscribe.color(`TL=${roomMem.techLevel} Mem:${Mem.m().memVersion}/${Mem.memoryVersion} M:${Mem.roomState.miners.length}/${roomMem.minerTasks.length} B:${Mem.roomState.builders.length}/${roomMem.desiredBuilders} S=${Mem.roomState.structures.length} Con=${Mem.roomState.containers.length}/${roomMem.containerPositions.length} Ext=${Mem.roomState.extensions.length}/${numExtensionToBuild} RoRe:${Mem.roomState.notRoadNeedingRepair.length} ExtA:${roomMem.extensionIdsAssigned.length} Eng:${roomMem.energyLevel} Tow:${Mem.roomState.towers.length}/${numTowersToBuild} St:${Mem.roomState.storages.length}/${numStoragesToBuild}`, "skyblue")}]`);

        }
    }

    private static findNonRoadNeedingRepair(room: Room, roomMem: Mem.RoomMemory) {
        Mem.roomState.notRoadNeedingRepair = _.filter(Mem.roomState.structures, (structure) => {
            if (structure.structureType !== STRUCTURE_ROAD) {
                if (structure.structureType === STRUCTURE_WALL) {
                    const hitsToRepair = roomMem.desiredWallHitPoints - structure.hits;
                    //if (hitsToRepair > rm.desiredWallHitPoints * 0.25)
                    if (hitsToRepair > 0){
                        return true;
                    }
                } else if (structure.structureType === STRUCTURE_RAMPART) {
                    const hitsToRepair = roomMem.desiredWallHitPoints - structure.hits;
                    if (hitsToRepair > roomMem.desiredWallHitPoints * 0.25){
                        return true;
                    }
                } else {
                    const hitsToRepair = structure.hitsMax - structure.hits;
                    if (hitsToRepair > structure.hitsMax * 0.25){
                        return true;
                    }
                }
            }
            return false;
        }) as StructureExtension[];
        Mem.roomState.notRoadNeedingRepair = _.sortBy(Mem.roomState.notRoadNeedingRepair, (struct: Structure) => struct.id);
    }
    private static buildMissingCreeps(room: Room, roomMem: Mem.RoomMemory) {
        let bodyParts: BodyPartConstant[];

        const inactiveSpawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS, {
            filter: (spawn: StructureSpawn) => {
                return spawn.spawning === null;
            },
        });
        if (Mem.roomState.miners.length < roomMem.minerTasks.length) {
            switch (roomMem.energyLevel) {
                case 1: bodyParts = [WORK, WORK, CARRY, MOVE]; break; // 300
                case 2: bodyParts = [WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE]; break; // 550
                default:
                case 3: bodyParts = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE]; break; // 6x100,3x50=750
                case 4: bodyParts = [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE]; break; // 1150
            }
            RoomManager.tryToSpawnCreep(inactiveSpawns, bodyParts, Mem.CreepRoles.ROLE_MINER, roomMem);
        }
        if (roomMem.techLevel >= 3) {
            if (Mem.roomState.builders.length < roomMem.desiredBuilders) {
                switch (roomMem.energyLevel) {
                    case 1: bodyParts = [WORK, CARRY, CARRY, MOVE]; break; // 250
                    case 2: bodyParts = [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE]; break; // 550;
                    default:
                    case 3: bodyParts = [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE]; break; // 750;
                    case 4: bodyParts = [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]; break; // 1150
                }
                RoomManager.tryToSpawnCreep(inactiveSpawns, bodyParts, Mem.CreepRoles.ROLE_BUILDER, roomMem);
            }
        }
    }
    private static tryToSpawnCreep(inactiveSpawns: StructureSpawn[], bodyParts: BodyPartConstant[], role: Mem.CreepRoles, roomMem: Mem.RoomMemory) {
        let spawned: boolean = false;
        _.each(inactiveSpawns, (spawn: StructureSpawn) => {
            if (!spawned) {
                const status = RoomManager.spawnCreep(spawn, bodyParts, role, roomMem);
                if (status === OK) {
                    spawned = true;
                    return;
                }
            }
        });
    }
    private static spawnCreep(spawn: StructureSpawn, bodyParts: BodyPartConstant[], role: Mem.CreepRoles, roomMem: Mem.RoomMemory): number {
        const uuid: number = Mem.m().uuid;
        let status: number | string = spawn.spawnCreep(bodyParts, 'status' , {dryRun: true});

        status = _.isString(status) ? OK : status;
        if (status === OK) {
            Mem.m().uuid = Mem.m().uuid + 1;
            const creepName: string = spawn.room.name + "-" + Mem.roleToString(role) + "-" + uuid;

            let properties: any = {
                memory: {
                    name: creepName,
                    log: false,
                    role: role,
                    roleString: Mem.roleToString(role),
                    gathering: true,
                    isUpgradingController: false,
                }
            };
            log.info("Started creating new creep: " + creepName);
            if (Config.ENABLE_DEBUG_MODE){
                log.info("Body: " + bodyParts);
                log.info("Memory: " + JSON.stringify(properties));
            }

            status = spawn.spawnCreep(bodyParts, creepName, properties as SpawnOptions);
            roomMem.spawnText = `🐣 ${Mem.roleToString(role)}`;
            roomMem.spawnTextId = spawn.id;
            return _.isString(status) ? OK : status;
        } else {
            if (Config.ENABLE_DEBUG_MODE && status !== ERR_NOT_ENOUGH_ENERGY) {
                log.info("Failed creating new creep: " + status);
            }

            return status;
        }
    }
    private static getOptimalExtensionPosition(room: Room, roomMem: Mem.RoomMemory, extPositions: RoomPosition[]): RoomPosition | null {
        const sources = room.find(FIND_SOURCES);
        const firstSpawn = RoomManager.getFirstSpawn(room);
        if (firstSpawn == null) {
            return null;
        }

        const maxRange = 10;
        const choices: Mem.NodeChoice[] = [];
        log.info(`finding optimal extension pos`);
        for (let x = firstSpawn.pos.x - maxRange; x < firstSpawn.pos.x + maxRange; x++) {
            for (let y = firstSpawn.pos.y - maxRange; y < firstSpawn.pos.y + maxRange; y++) {
                const searchRoomPos: RoomPosition | null = room.getPositionAt(x, y);
                if (searchRoomPos !== null) {
                    const found: string = searchRoomPos.lookFor(LOOK_TERRAIN) as any;
                    if (found != "wall") {
                        let tooClose = false;
                        for (const extensionPos of extPositions) {
                            const rangeToExt = extensionPos.getRangeTo(x, y);
                            if (rangeToExt <= 1) {
                                tooClose = true;
                                break;
                            }
                        }
                        if (tooClose) {
                            continue;
                        }

                        let range = 0;
                        _.each(sources, (source: Source) => {
                            const rangeToSource = source.pos.getRangeTo(x, y);
                            if (rangeToSource <= 3) {
                                tooClose = true;
                            }
                            range += rangeToSource;
                        });
                        if (tooClose){
                            continue;
                        }

                        const rangeToSpawn = firstSpawn.pos.getRangeTo(x, y);
                        range += rangeToSpawn;
                        if (rangeToSpawn <= 2){
                            continue;
                        }

                        //log.info(`Choice is ${x}, ${y} == ${range}`);
                        const choice: Mem.NodeChoice ={
                            x, y, dist: range
                        };
                        choices.push(choice);
                    }
                }
            }
        }
        const sortedChoices = _.sortBy(choices, (choice: Mem.NodeChoice) => choice.dist);
        if (sortedChoices.length > 0) {
            log.info(`Best choice is ${sortedChoices[0].x}, ${sortedChoices[0].y} == ${sortedChoices[0].dist}`);
            const roomPos: RoomPosition | null = room.getPositionAt(sortedChoices[0].x, sortedChoices[0].y);
            return roomPos;
        }

        return null;
    }
    private static buildExtension(room: Room, roomMem: Mem.RoomMemory,  numExtensionToBuild: number) {
        const extConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES, { filter: (structure: ConstructionSite) => (structure.structureType === STRUCTURE_EXTENSION) });
        const numExtensionsBuilt = Mem.roomState.extensions.length + extConstructionSites.length;
        const numExtensionsNeeded = numExtensionToBuild - numExtensionsBuilt;

        if (numExtensionsNeeded > 0) {
            const extPos: RoomPosition[] = [];
            _.each(Mem.roomState.extensions, (extension: StructureExtension) => extPos.push(extension.pos));
            _.each(extConstructionSites, (extension: ConstructionSite) => extPos.push(extension.pos));

            log.info(`numExtensionsNeeded=${numExtensionsNeeded}`);
            const roomPos: RoomPosition | null = RoomManager.getOptimalExtensionPosition(room, roomMem, extPos);
            if (roomPos != null) {
                const errCode = room.createConstructionSite(roomPos, STRUCTURE_EXTENSION);
                if (errCode === OK){
                    log.info(`Created extension at ${roomPos}`);
                    return;
                } else {
                    log.info(`ERROR: created extension at ${roomPos} ${errCode}`);
                }
            } else {
                log.info(`ERROR: couldn't create more extensions`);
            }
        }
    }

    private static buildStorage(room: Room, roomMem: Mem.RoomMemory,  numStoragesToBuild: number) {
        const extConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES, { filter: (structure: ConstructionSite) => (structure.structureType === STRUCTURE_STORAGE) });
        const numStoragesBuilt = Mem.roomState.storages.length + extConstructionSites.length;
        const numStoragesNeeded = numStoragesToBuild - numStoragesBuilt;

        if (numStoragesNeeded > 0) {
            const extPos: RoomPosition[] = [];
            _.each(Mem.roomState.extensions, (storage: StructureStorage) => extPos.push(storage.pos));
            _.each(extConstructionSites, (storage: ConstructionSite) => extPos.push(storage.pos));

            // log.info(`numStoragesNeeded=${numStoragesNeeded}`);
            const roomPos: RoomPosition | null = RoomManager.getOptimalStoragePosition(room, roomMem, extPos);
            if (roomPos != null) {
                const errCode = room.createConstructionSite(roomPos, STRUCTURE_STORAGE);
                if (errCode === OK){
                    log.info(`${Emoji.info}Created Storage at ${roomPos}`);
                    return;
                } else {
                    log.error(`${Emoji.cross}ERROR: created Storage at ${roomPos} ${errCode}`);
                }
            } else {
                log.error(`${Emoji.cross}ERROR: couldn't create more Storages`);
            }
        }
    }
    private static getOptimalStoragePosition(room: Room, roomMem: Mem.RoomMemory, storagePositions: RoomPosition[]): RoomPosition | null {
        const sources = room.find(FIND_SOURCES);
        const firstSpawn = RoomManager.getFirstSpawn(room);
        if (firstSpawn == null) {
            return null;
        }

        const maxRange = 6;
        const choices: Mem.NodeChoice[] = [];
        log.info(`finding optimal storage pos`);
        for (let x = firstSpawn.pos.x - maxRange; x < firstSpawn.pos.x + maxRange; x++) {
            for (let y = firstSpawn.pos.y - maxRange; y < firstSpawn.pos.y + maxRange; y++) {
                const searchRoomPos: RoomPosition | null = room.getPositionAt(x, y);
                if (searchRoomPos !== null) {
                    const found: string = searchRoomPos.lookFor(LOOK_TERRAIN) as any;
                    if (found != "wall") {
                        let tooClose = false;
                        let range = 0;
                        _.each(sources, (source: Source) => {
                            const rangeToSource = source.pos.getRangeTo(x, y);
                            if (rangeToSource <= 3) {
                                tooClose = true;
                            }
                            range += rangeToSource;
                        });
                        if (tooClose){
                            continue;
                        }

                        const rangeToSpawn = firstSpawn.pos.getRangeTo(x, y);
                        range += rangeToSpawn;
                        if (rangeToSpawn <= 2){
                            continue;
                        }

                        //log.info(`Choice is ${x}, ${y} == ${range}`);
                        const choice: Mem.NodeChoice ={
                            x, y, dist: range
                        };
                        choices.push(choice);
                    }
                }
            }
        }
        const sortedChoices = _.sortBy(choices, (choice: Mem.NodeChoice) => choice.dist);
        if (sortedChoices.length > 0) {
            log.info(`Best choice is ${sortedChoices[0].x}, ${sortedChoices[0].y} == ${sortedChoices[0].dist}`);
            const roomPos: RoomPosition | null = room.getPositionAt(sortedChoices[0].x, sortedChoices[0].y);
            return roomPos;
        }

        return null;
    }

    private static buildTower(room: Room, roomMem: Mem.RoomMemory,  numTowersToBuild: number) {
        const towConstructionSites = room.find(FIND_MY_CONSTRUCTION_SITES, { filter: (structure: ConstructionSite) => (structure.structureType === STRUCTURE_TOWER) });
        const numTowersBuilt = Mem.roomState.towers.length + towConstructionSites.length;
        const numTowersNeeded = numTowersToBuild - numTowersBuilt;
        log.debug(`${Emoji.debug} TowersNeeded: ${numTowersNeeded}`);
        if (numTowersNeeded > 0) {
            let towerPos: RoomPosition = RoomManager.findCenterOfStructs(room);
            const maxRange = 3;
            const choices: Mem.NodeChoice[] = [];
            log.info(`${Emoji.info} finding optimal Pos for Tower`);
            for (let x: number = towerPos.x - maxRange; x < towerPos.x + maxRange; x++) {
                for (let y: number = towerPos.y - maxRange; y < towerPos.y + maxRange; x++) {
                    const searchRoomPos: RoomPosition | null = room.getPositionAt(x, y);
                    if (searchRoomPos !== null) {
                        const found: string = searchRoomPos.lookFor(LOOK_TERRAIN) as any;
                        if (found != "wall") {
                            let range =2;
                            const choice: Mem.NodeChoice ={
                                x, y, dist: range
                            };
                            choices.push(choice);
                        }
                    }
                }
            }
            const sortedChoices = _.sortBy(choices, (choice: Mem.NodeChoice) => choice.dist);
            if (sortedChoices.length > 0) {
                log.info(`Best choice is ${sortedChoices[0].x}, ${sortedChoices[0].y} == ${sortedChoices[0].dist}`);
                const roomPos: RoomPosition | null = room.getPositionAt(sortedChoices[0].x, sortedChoices[0].y);
                towerPos = roomPos as RoomPosition;
                log.debug(`${Emoji.debug} towerPos: ${JSON.stringify(towerPos)}`);
            }
            if(towerPos !== null) {
                const errCode = room.createConstructionSite(towerPos, STRUCTURE_TOWER);
                if (errCode === OK) {
                    log.info(`${Emoji.info} Created Tower at ${towerPos}`);
                    return;
                } else {
                    log.error(`${Emoji.cross}Error Creating Tower at ${towerPos}`);
                }
            } else {
                log.error(`${Emoji.cross} Cannot create more Towers`);
            }
        }
    }
    private static findCenterOfStructs(room: Room) : RoomPosition {
        const myStructures = Mem.roomState.structures;
        let x = 0;
        let y = 0;
        let count = 0;
        for (const struct of myStructures) {
            x += struct.pos.x;
            y += struct.pos.y;
            count++;
        }
        const centerPos = new RoomPosition(x / count, y / count, room.name);
        return centerPos
    }
    public static initRoomMemory(room: Room, roomName: string) {
        const roomMem: Mem.RoomMemory = Mem.m().rooms[roomName];
        roomMem.roomName = roomName;
        roomMem.minerTasks = [];
        roomMem.energySources = [];
        roomMem.containerPositions = [];
        roomMem.extensionIdsAssigned = [];
        roomMem.desiredBuilders = DESIRED_BUILDERS;
        //log.debug(`DesBuild: ${roomMem.desiredBuilders}`);
        roomMem.techLevel = 0;
        roomMem.desiredWallHitPoints = Config.WALL_MAXHP;
        roomMem.desiredRampHitPoints = Config.RAMP_MAXHP;

        let taskIdNum = 0;

        const sources = room.find(FIND_SOURCES);
        for (const sourceName in sources) {
            const source: Source = sources[sourceName] as Source;

            const sourcePos: Mem.PositionPlusTarget ={
                targetId: source.id,
                x: source.pos.x,
                y: source.pos.y
            };
            roomMem.energySources.push(sourcePos);

            const positions = [
                [source.pos.x - 1, source.pos.y - 1],
                [source.pos.x - 1, source.pos.y + 0],
                [source.pos.x - 1, source.pos.y + 1],

                [source.pos.x + 1, source.pos.y - 1],
                [source.pos.x + 1, source.pos.y + 0],
                [source.pos.x + 1, source.pos.y + 1],

                [source.pos.x + 0, source.pos.y - 1],
                [source.pos.x + 0, source.pos.y + 1]
            ];

            const minerTasksForSource: Mem.MinerTask[] = [];
            for (const pos of positions) {
                const roomPos: RoomPosition | null = room.getPositionAt(pos[0], pos[1]);
                if (roomPos !== null) {
                    const found: string = roomPos.lookFor(LOOK_TERRAIN) as any;
                    if (found != "wall") {
                        log.info("pos " + pos[0] + "," + pos[1] + "=" + found);
                        const minerPos: Mem.PositionPlusTarget ={
                            targetId: source.id,
                            x: pos[0],
                            y: pos[1]
                        };
                        taskIdNum++;
                        const minerTask: Mem.MinerTask ={
                            minerPosition: minerPos,
                            taskId: taskIdNum,
                            sourceContainer: undefined
                        };

                        roomMem.minerTasks.push(minerTask);
                        minerTasksForSource.push(minerTask);
                    }
                }
            }
            const containerPos = RoomManager.getOptimalContainerPosition(minerTasksForSource, sourcePos, room);
            if (containerPos !== null) {
                roomMem.containerPositions.push(containerPos);
            }
            // TODO const storagePos = getOptimalStoragePosition(minerTasksForSource, sourcePos, room);
        }
    }
    private static getFirstSpawn(room: Room): StructureSpawn | null{
        const spawns: StructureSpawn[] = room.find(FIND_MY_SPAWNS);
        if (spawns.length === 0) {
            return null;
        }
        return spawns[0] as StructureSpawn;
    }
    private static getOptimalContainerPosition(minerTasksForSource: Mem.MinerTask[], sourcePos: Mem.PositionPlusTarget, room: Room): Mem.PositionPlusTarget | null {
        const roomPos: RoomPosition | null = room.getPositionAt(sourcePos.x, sourcePos.y);
        if (roomPos === null) {
            return null;
        }

        const firstSpawn = RoomManager.getFirstSpawn(room);
        if (firstSpawn == null) {
            return null;
        }

        const choices: Mem.NodeChoice[] = [];
        log.info(`finding optimal container pos for ${sourcePos.x}, ${sourcePos.y}`);
        for (let x = sourcePos.x - 2; x <= sourcePos.x + 2; x++) {
            for (let y = sourcePos.y - 2; y <= sourcePos.y + 2; y++) {
                const range = roomPos.getRangeTo(x, y);
                if (range === 2) {
                    const searchPos: RoomPosition | null = room.getPositionAt(x, y);
                    if (searchPos !== null) {
                        const found: string = searchPos.lookFor(LOOK_TERRAIN) as any;
                        if (found != "wall") {
                            // log.info(`${x}, ${y} == ${range} is not wall`);

                            let dist = _.sum(minerTasksForSource, (task: Mem.MinerTask) => {
                                const taskPos: RoomPosition | null = room.getPositionAt(task.minerPosition.x, task.minerPosition.y);
                                if (taskPos === null) {
                                    return 0;
                                } else {
                                    return taskPos.getRangeTo(x, y);
                                }
                            });
                            // log.info(`${x}, ${y} == ${dist} total`);
                            dist += firstSpawn.pos.getRangeTo(x, y);
                            log.info(`${x}, ${y} == ${dist} total dist including to spawn`);

                            const choice: Mem.NodeChoice = {
                                x, y, dist
                            };
                            choices.push(choice);
                        }
                    }
                }
            }
        }
        const sortedChoices = _.sortBy(choices, (choice: Mem.NodeChoice) => choice.dist);
        if (sortedChoices.length > 0) {
            log.info(`Best choice is ${sortedChoices[0].x}, ${sortedChoices[0].y} == ${sortedChoices[0].dist}`);
            const containerPos: Mem.PositionPlusTarget ={
                targetId: sourcePos.targetId,
                x: sortedChoices[0].x,
                y: sortedChoices[0].y
            };

            return containerPos;
        }

        return null;
    }
    public static cleanupAssignedMiners(roomMem: Mem.RoomMemory) {
        for (const task of roomMem.minerTasks) {
            if (task.assignedMinerName !== undefined) {
                const creep = Game.creeps[task.assignedMinerName];
                if (creep as any === undefined) {
                    log.info(`Clearing mining task assigned to ${task.assignedMinerName}`);
                    task.assignedMinerName = undefined;
                } else if (Mem.cm(creep).role !== Mem.CreepRoles.ROLE_MINER) {
                    log.info(`Clearing mining task assigned to ${task.assignedMinerName}`);
                    task.assignedMinerName = undefined;
                }
            }
        }
    }
    public static getContainerIdWithLeastBuildersAssigned(room: Room, roomMem: Mem.RoomMemory): string | undefined {
        const choices: Mem.NodeContainerIdChoice[] = [];

        _.each(Mem.roomState.containers, (container: StructureContainer) => {
            let count = 0;
            _.each(Mem.roomState.builders, (tmpBuilder: Creep) => {
                if (Mem.cm(tmpBuilder).assignedContainerId === container.id) {
                    count++;
                }
            });

            const choice: Mem.NodeContainerIdChoice =
            {
                id: container.id, count
            };
            log.info(`Container ${container.id} = ${count}`);
            choices.push(choice);
        });

        const sortedChoices = _.sortBy(choices, (choice: Mem.NodeContainerIdChoice) => choice.count);
        if (sortedChoices.length > 0) {
            log.info(`Best container ${sortedChoices[0].id} = ${sortedChoices[0].count}`);
            return sortedChoices[0].id;
        }

        return undefined;
    }
    private static getRoomEnergyLevel(room: Room, roomMen: Mem.RoomMemory): number {
        if ((roomMen.techLevel <= 4 && room.energyAvailable < 550) || Mem.roomState.miners.length < 2 || Mem.roomState.builders.length < 2) {
            return 1; // less than 550
        }
        else if (room.energyCapacityAvailable < 800) {
            return 2;
        }
        else if (room.energyCapacityAvailable < 1300) {
            return 3;
        }
        else if (room.energyCapacityAvailable < 1800) {
            return 4;
        }
        else if (room.energyCapacityAvailable < 2300) {
            return 5;
        }
        else if (room.energyCapacityAvailable < 2800) {
            return 6;
        }
        else if (room.energyCapacityAvailable < 3200) {
            return 7;
        }
        else {
            return 8;
        }
    }

    public static removeAssignedExt(targetId: string, roomMen: Mem.RoomMemory) {
        //log.info(`was rm.extensionIdsAssigned = ${rm.extensionIdsAssigned.length}`);
        _.remove(roomMen.extensionIdsAssigned, (ext: string) => ext === targetId);
        //log.info(`now rm.extensionIdsAssigned = ${rm.extensionIdsAssigned.length}`);
    }
}
