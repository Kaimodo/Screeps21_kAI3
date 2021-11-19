import * as Profiler from "screeps-profiler";

import * as Inscribe from "screeps-inscribe";

import { log } from "tools/logger/logger";
import { ENABLE_DEBUG_MODE } from "config";

import * as Mem from "memory";

import {Emoji} from "../../tools/emoji";

export class Miner {
    public static run(room: Room, roomMem: Mem.RoomMemory, creep: Creep): void {
        const creepMem = Mem.cm(creep);
        if (creepMem.assignedMineTaskId === undefined) {
            log.info(`${Mem.l(creepMem)} has no Miner task`);

            const unassignedTasks = _.filter(roomMem.minerTasks, (task: Mem.MinerTask) => task.assignedMinerName === undefined);
            log.info(`unassignedTask.length: ${unassignedTasks.length}`);
            if (unassignedTasks.length === 0) {
                log.info(`${Mem.l(creepMem)} no unassigned Miner task found`);
            } else {
                unassignedTasks[0].assignedMinerName = creep.name;
                creepMem.assignedMineTaskId = unassignedTasks[0].taskId;
                log.info(`${Mem.l(creepMem)}Now assigned miner task ${creepMem.assignedMineTaskId}`);
            }
        } else {
            if (creepMem.gathering && creep.store[RESOURCE_ENERGY] === creep.store.getCapacity(RESOURCE_ENERGY)) {
                creepMem.gathering = false;
            }
            if (!creepMem.gathering && creep.store[RESOURCE_ENERGY] === 0) {
                creepMem.gathering = true;
            }
            const minerTask = roomMem.minerTasks.find((task: Mem.MinerTask) => task.taskId === creepMem.assignedMineTaskId);
            if (minerTask === undefined) {
                return;
            }
            //log.info(`${Mem.l(creepMem)}got miner task ${minerTask.taskId }`);

            if (!creepMem.gathering) {
                Miner.dropOffEnergy(room, roomMem, creep, creepMem, minerTask);
            } else {
                room.visual.text(`🚧`, creep.pos.x, creep.pos.y, { align: "center", opacity: 0.8 });
                Miner.harvestEnergy(roomMem, creep, creepMem, minerTask);
            }
        }
    }
    private static harvestEnergy(roomMem: Mem.RoomMemory, creep: Creep, creepMem: Mem.MyCreepMemory, minerTask: Mem.MinerTask): void {
        //log.info(`${Mem.l(creepMem)}is moving to mine`);
        if (creep.pos.x !== minerTask.minerPosition.x ||
            creep.pos.y !== minerTask.minerPosition.y) {
            //log.info(`${Mem.l(creepMem)}is not in position at ${minerTask.minerPosition.x }, ${minerTask.minerPosition.y }`);
            const pos = creep.room.getPositionAt(minerTask.minerPosition.x, minerTask.minerPosition.y);
            if (pos !== null) {
                creep.say(`${Emoji.travelling}`);
                creep.moveTo(pos, { visualizePathStyle: { stroke: "#0000ff" } });
            } else {
                log.error(`${Mem.l(creepMem)}Can't find ${pos}`);
            }
        } else {
            //log.info(`${Mem.l(creepMem)}is in position at ${minerTask.minerPosition.x}, ${minerTask.minerPosition.y}`);
            const sourceId: Id<Source> = minerTask.minerPosition.targetId as Id<Source>;
            const source = Game.getObjectById(sourceId) as Source;
            const errCode = creep.harvest(source);
            if (errCode !== OK && errCode !== ERR_NOT_IN_RANGE && errCode !== ERR_NOT_ENOUGH_RESOURCES) {
                log.error(`${Mem.l(creepMem)}Harvest error ${errCode}`);
            }
        }
    }
    private static buildIfCan(room: Room, roomMem: Mem.RoomMemory, creep: Creep, creepMem: Mem.MyCreepMemory) : boolean {
        //log.info(`${Mem.l(creepMem)}buildIfCan ${room.name}, ${creep.name}`);

        // Find container construction sites
        const targets = room.find(FIND_CONSTRUCTION_SITES, {
            filter: (constSite: ConstructionSite) => {
                return (constSite.structureType === STRUCTURE_CONTAINER);
            }
        }) as ConstructionSite[];
        if (targets.length > 0) {
            const status = creep.build(targets[0]);
            if (status === ERR_NOT_IN_RANGE) {
                creep.say(`${Emoji.travelling}`);
                const moveCode = creep.moveTo(targets[0],  { visualizePathStyle: { stroke: "#ffffff" } });
                if (moveCode !== OK && moveCode !== ERR_TIRED) {
                    log.error(`${Mem.l(creepMem)}move and got ${moveCode}`);
                }
            }
            return true;
        } else {
            // Do I have all construction sites for all the containers?
            if (Mem.roomState.containers.length !== roomMem.containerPositions.length) {
                log.info(`${Mem.l(creepMem)}M.roomState.containers.length=${Mem.roomState.containers.length}. rm.containerPositions.length=${roomMem.containerPositions.length}`);
                _.each(roomMem.containerPositions, (containerPos: Mem.PositionPlusTarget) => {
                    log.info(`${Mem.l(creepMem)}Creating container at ${containerPos.x}, ${containerPos.y}`);
                    const roomPos: RoomPosition | null = room.getPositionAt(containerPos.x, containerPos.y);
                    if (roomPos !== null) {
                        creep.room.createConstructionSite(roomPos, STRUCTURE_CONTAINER);
                    }
                });
            }
            return false
        }
    }
    private static dropOffEnergy(room: Room, roomMem: Mem.RoomMemory, creep: Creep, creepMem: Mem.MyCreepMemory, minerTask: Mem.MinerTask): void {
        let target: Structure | undefined;
        if (minerTask.sourceContainer === undefined ||
            roomMem.techLevel < 3 ||
            Mem.roomState.builders.length === 0) {

            //log.info(`${Mem.l(creepMem)}no source container or low tech`);
            if (Mem.roomState.containers.length === roomMem.containerPositions.length &&
                roomMem.techLevel >= 3) {

                log.info(`${Mem.l(creepMem)}room has containers and tech 3+`);
                const foundContainerPos = _.find(roomMem.containerPositions, (containerPos: Mem.PositionPlusTarget) => containerPos.targetId === minerTask.minerPosition.targetId);
                if (foundContainerPos !== null && foundContainerPos != undefined) {
                    const roomPos: RoomPosition | null = room.getPositionAt(foundContainerPos.x, foundContainerPos.y);
                    if (roomPos !== null) {
                        const targets = roomPos.lookFor<LOOK_STRUCTURES>(LOOK_STRUCTURES) as Structure[];
                        if (targets.length > 0) {
                            target = targets[0];
                            log.info(`${Mem.l(creepMem)}Found matching containerPos ${target.id}`);
                            minerTask.sourceContainer =
                            {
                                targetId: target.id,
                                x: target.pos.x,
                                y: target.pos.y
                            };
                        }
                    }
                }
            }
            if (target === undefined) {
                //log.info(`${M.l(cm)}looking for non-container target`);
                const targets: Structure[] = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure: Structure) => {
                        if (structure.structureType === STRUCTURE_EXTENSION) {
                            const structExt: StructureExtension = structure as StructureExtension;
                            return structExt.store[RESOURCE_ENERGY] < structExt.store.getCapacity(RESOURCE_ENERGY);
                        }
                        if (structure.structureType === STRUCTURE_SPAWN) {
                            const structSpawn: StructureSpawn = structure as StructureSpawn;
                            return structSpawn.store[RESOURCE_ENERGY] < structSpawn.store.getCapacity(RESOURCE_ENERGY);
                        }
                        if (structure.structureType === STRUCTURE_TOWER) {
                            const structTower: StructureTower = structure as StructureTower;
                            return structTower.store[RESOURCE_ENERGY] < structTower.store.getCapacity(RESOURCE_ENERGY);
                        }
                        return false;
                    }
                });
                if (targets.length > 0 ) {
                    target = targets[0];
                    //creep.say(`Hauling`);
                }
            }
        } else {
            //log.info(`${Mem.l(creepMem)}container = ${minerTask.sourceContainer.targetId}`);
            const targetId: Id<StructureContainer> = minerTask.sourceContainer.targetId as Id<StructureContainer>;
            target = Game.getObjectById(targetId) as Structure;
            //log.info(`${Mem.l(creepMem)}target = ${target}`);
            if (target === null) {
                minerTask.sourceContainer = undefined;
            }
            //creep.say(`unloading`);
            //log.info(`${M.l(cm)}Going to ${target}`);
        }
        if (target !== undefined) {
            creep.say(`${Emoji.charging}`)
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.say(`${Emoji.travelling}`);
                creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
            }
        } else {
            if (room.controller !== undefined) {
                let isBuilding = false;
                if (room.controller.ticksToDowngrade > 1000) {
                    isBuilding = Miner.buildIfCan(room, roomMem, creep, creepMem);
                }
                if (!isBuilding) {
                    creep.say(`upgrading`);
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
    }
}
