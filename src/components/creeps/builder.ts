import * as Profiler from "screeps-profiler";

import * as Inscribe from "screeps-inscribe";

import { log } from "tools/logger/logger";
import { ENABLE_DEBUG_MODE } from "config";

import { RoomManager } from "components/internal";

import  {Emoji} from "../../tools/emoji"

import * as Mem from "memory";

// TODO Storages
export class Builder {
    static run (room: Room, roomMem: Mem.RoomMemory, creep: Creep): void {

        const creepMem = Mem.cm(creep);
        if (creepMem.assignedContainerId === undefined) {
            creepMem.assignedContainerId = RoomManager.getContainerIdWithLeastBuildersAssigned(room, roomMem);
        }
        room.visual.text(
            `🛠️`,
            creep.pos.x,
            creep.pos.y,
            { align: "center", opacity: 0.8 });

        if (creepMem.assignedContainerId === undefined) {
            log.error(`${Mem.l(creepMem)}not assigned to container`);
            return;
        }
        if (creepMem.gathering && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
            creepMem.gathering = false;
        }
        if (!creepMem.gathering && creep.store[RESOURCE_ENERGY] === 0) {
            creepMem.gathering = true;
            creepMem.isUpgradingController = false;
            if (creepMem.assignedTargetId !== undefined) {
                const targetId: Id<StructureExtension> = creepMem.assignedTargetId as Id<StructureExtension>
                const target = Game.getObjectById(targetId) as Structure;
                if (target.structureType === STRUCTURE_EXTENSION) {
                    RoomManager.removeAssignedExt(target.id, roomMem);
                }
            }
            creepMem.assignedTargetId = undefined;
        }
        if (creepMem.gathering) {
            //log.info(`${Mem.l(creepMem)}builder is moving to container`);
            Builder.pickupEnergy(roomMem, creep, creepMem);
        } else {
            //log.info(`${Mem.l(creepMem)}builder is using energy`);
            Builder.useEnergy(room, roomMem, creep, creepMem);
        }
        // TODO BUILDER ROAD
        // Builder.tryToBuildRoad(room, roomMem, creep, creepMem);
    }
    static pickupEnergy(roomMem: Mem.RoomMemory, creep: Creep, creepMem: Mem.MyCreepMemory): void {
        if (creepMem.assignedContainerId === undefined) {
            return;
        }
        const targetId: Id<StructureContainer> = creepMem.assignedContainerId as Id<StructureContainer>;
        const target = Game.getObjectById(targetId) as StructureContainer;
        if (target === null) {
            creepMem.assignedContainerId = undefined;
            return;
        }
        let energyCount = 0;
        if (creep.store[RESOURCE_ENERGY] !== undefined) {
            energyCount = creep.store[RESOURCE_ENERGY];
        }
        creep.say(`${Emoji.withdrawing}`);
        const amtEnergy = creep.store[RESOURCE_ENERGY] - energyCount;
        const errCode = creep.withdraw(target, RESOURCE_ENERGY, amtEnergy);
        if (errCode === ERR_NOT_IN_RANGE) {
            creep.say(`${Emoji.travelling}`);
            creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        if (errCode !== OK && errCode !== ERR_NOT_IN_RANGE && errCode !== ERR_NOT_ENOUGH_RESOURCES) {
            log.error(`${Mem.l(creepMem)}Transfer error ${errCode}`);
        }
    }
    static isAlreadyTaken(structure: Structure, roomMem: Mem.RoomMemory): boolean {
        if (structure.structureType === STRUCTURE_EXTENSION) {
            const isAssigned = _.find(roomMem.extensionIdsAssigned, (ext: string) => ext === structure.id);
            if (isAssigned !== undefined) {
                return true;
            }
        }
        return false;
    }
    static isStructureFullOfEnergy(structure: Structure): boolean {
        if (structure.structureType === STRUCTURE_EXTENSION) {
            const structExt: StructureExtension = structure as StructureExtension;
            return structExt.store[RESOURCE_ENERGY] >= structExt.store.getCapacity(RESOURCE_ENERGY);
        }
        if (structure.structureType === STRUCTURE_SPAWN) {
            const structSpawn: StructureSpawn = structure as StructureSpawn;
            return structSpawn.store[RESOURCE_ENERGY] >= structSpawn.store.getCapacity(RESOURCE_ENERGY);
        }
        if (structure.structureType === STRUCTURE_TOWER) {
            const structTower: StructureTower = structure as StructureTower;
            return structTower.store[RESOURCE_ENERGY] >= structTower.store.getCapacity(RESOURCE_ENERGY);
        }
        return true;
    }
    static useEnergy(room: Room, roomMem: Mem.RoomMemory, creep: Creep, creepMem: Mem.MyCreepMemory): void {
        let target: Structure | undefined;
        if (creepMem.assignedTargetId !== undefined) {
            const targetId :Id<Structure> = creepMem.assignedTargetId as Id<Structure>;
            target = Game.getObjectById(targetId) as Structure;
            if (Builder.isStructureFullOfEnergy(target)) {
                if (target.structureType === STRUCTURE_EXTENSION) {
                    log.info(`Mem.roomState.removeAssignedExt ${target.id}.  full`);
                    RoomManager.removeAssignedExt(target.id, roomMem);
                }
                creepMem.assignedTargetId = undefined;
                target = undefined;
            }
        }
        //log.info(`${Mem.l(creepMem)}cm.assignedTargetId=${creepMem.assignedTargetId} cm.isUpgradingController=${creepMem.isUpgradingController}`);
        if (creepMem.assignedTargetId === undefined && !creepMem.isUpgradingController) {
            const targets: Structure[] = creep.room.find(FIND_STRUCTURES, {
                filter: (structure: Structure) => {
                    return !Builder.isStructureFullOfEnergy(structure) && !Builder.isAlreadyTaken(structure, roomMem);
                }
            });
            if (targets.length > 0) {
                target = targets[0];
                creepMem.assignedTargetId = target.id;
                if (target.structureType === STRUCTURE_EXTENSION) {
                    log.info(`${Mem.l(creepMem)}Assigned ext ${target.id}`);
                    //_.each(rm.extensionIdsAssigned, (e: string) => log.info(`BeforeRM = ${e}`));
                    roomMem.extensionIdsAssigned.push(target.id);
                    //_.each(rm.extensionIdsAssigned, (e: string) => log.info(`RM = ${e}`));
                }
            }
        }
        if (room.controller !== undefined && room.controller.ticksToDowngrade < 1000) {
            target = undefined;
        }
        if (target !== undefined) {
            creep.say(`${Emoji.charging}`);
            room.visual.text(`T`, creep.pos.x, creep.pos.y, { align: "center", opacity: 0.8 });
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.say(`${Emoji.travelling}`);
                creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
            }
        } else {
            if (room.controller !== undefined && room.controller.ticksToDowngrade > 1000) {
                if (Builder.repairIfCan(room, roomMem, creep, creepMem)) {
                    creep.say(`${Emoji.repairing}`);
                    room.visual.text(`R`, creep.pos.x, creep.pos.y, { align: "center", opacity: 0.8 });
                    return;
                }

                if (Builder.buildIfCan(room, creep, creepMem)) {
                    creep.say(`${Emoji.building}`);
                    room.visual.text(`B`, creep.pos.x, creep.pos.y, { align: "center", opacity: 0.8 });
                    return;
                }
            }
            if (room.controller !== undefined) {
                creepMem.isUpgradingController = true;
                creep.say(`${Emoji.upgrading}`);
                const status = creep.upgradeController(room.controller);
                if (status === ERR_NOT_IN_RANGE) {
                    creep.say(`${Emoji.travelling}`);
                    const moveCode = creep.moveTo(room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
                    if (moveCode !== OK && moveCode !== ERR_TIRED) {
                        log.error(`${Mem.l(creepMem)}move and got ${moveCode}`);
                    }
                }
            }
        }
    }
    static repairIfCan(room: Room, roomMem: Mem.RoomMemory, creep: Creep, creepMem: Mem.MyCreepMemory): boolean {
        let repairTarget: Structure | undefined;
        if (creepMem.repairTargetId !== undefined) {
            const repairId: Id<Structure> = creepMem.repairTargetId as Id<Structure>;
            repairTarget = Game.getObjectById(repairId) as Structure;
            if (repairTarget === null) {
                creepMem.assignedTargetId = undefined;
                return false
            } else if (repairTarget.structureType === STRUCTURE_RAMPART) {
                if (repairTarget.hits > roomMem.desiredWallHitPoints) {
                    creepMem.repairTargetId = undefined;
                    return false;
                }
            } else {
                creepMem.repairTargetId = undefined;
                return false;
            }
        } else {
            if (Mem.roomState.notRoadNeedingRepair.length > 0) {
                repairTarget = Mem.roomState.notRoadNeedingRepair[0];
                if (repairTarget.structureType === STRUCTURE_RAMPART && repairTarget.hits < roomMem.desiredWallHitPoints) {
                    creepMem.repairTargetId = repairTarget.id;
                }
            }
        }
        if (repairTarget === undefined) {
            const structuresUnderFeet = creep.pos.lookFor(LOOK_STRUCTURES) as Structure[];
            if (structuresUnderFeet.length > 0) {
                const roadsUnderFeed = _.filter(structuresUnderFeet, (structure) => structure.structureType === STRUCTURE_ROAD) as StructureRoad[];
                if (roadsUnderFeed.length > 0) {
                    if (roadsUnderFeed[0].hits + 50 < roadsUnderFeed[0].hitsMax) {
                        repairTarget = roadsUnderFeed[0];
                    }
                }
            }
        }
        if (repairTarget !== undefined) {
            const status = creep.repair(repairTarget);
            if (status === ERR_NOT_IN_RANGE) {
                creep.say(`${Emoji.travelling}`);
                const moveCode = creep.moveTo(repairTarget, { visualizePathStyle: { stroke: "#ffffff" } });
                if (moveCode !== OK && moveCode !== ERR_TIRED) {
                    log.error(`${Mem.l(creepMem)}move and got ${moveCode}`);
                }
            }
            return true;
        }
        return false
    }
    static buildIfCan (room: Room, creep: Creep, creepMem: Mem.MyCreepMemory): boolean {
        if (Mem.roomState.constructionSites.length > 0) {
            const status = creep.build(Mem.roomState.constructionSites[0]);
            if (status === ERR_NOT_IN_RANGE) {
                creep.say(`${Emoji.travelling}`);
                const moveCode = creep.moveTo(Mem.roomState.constructionSites[0], { visualizePathStyle: { stroke: "#ffffff" } });
                if (moveCode !== OK && moveCode !== ERR_TIRED) {
                    log.error(`${Mem.l(creepMem)}move and got ${moveCode}`);
                }
            }
            return true;
        } else {
            return false;
        }
    }
    // TODO Road Code
    static tryToBuildRoad (room: Room, roomMem: Mem.RoomMemory, creep: Creep, creepMem: Mem.MyCreepMemory): void {
        if ((Game.time + 5) % 10 === 0) {
            if (roomMem.techLevel >= 2 && roomMem.buildsThisTick === 0) {
                const errCode = creep.room.createConstructionSite(creep.pos, STRUCTURE_ROAD);
                if (errCode === OK) {
                    // log.info(`${Mem.l(creepMem)} Created road at ${creep.pos}`);
                    roomMem.buildsThisTick++;
                    return;
                }
            }
        }
    }
}
