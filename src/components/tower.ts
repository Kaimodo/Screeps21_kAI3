import { log } from "tools/logger/logger";
import { ENABLE_DEBUG_MODE } from "config";

import * as Mem from "memory";

import * as Config from 'config';

export const Tower = {
    run: function(room: Room) {
        let towers: StructureTower[] = Mem.roomState.towers;
        for (const tower of towers) {
            this.attackHostile();
            this.healCreep();
            this.repairStruct(room);
        }
    },
    attackHostile: function() {
        let towers: StructureTower[] = Mem.roomState.towers;
        for (const tower of towers){
            let target = tower.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                filter: creep => {
                    tower.pos.getRangeTo(creep.pos) < Config.TOWER_MAX_ATTACK_RANGE
                }
            });
            if (target) {
                tower.attack(target);
                continue;
            }
        }
    },
    healCreep: function() {
        let towers: StructureTower[] = Mem.roomState.towers;
        for (const tower of towers){
            let target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: creep => {
                    creep.hits < creep.hitsMax && tower.pos.getRangeTo(creep.pos) < Config.TOWER_MAX_HEAL_RANGE
                }
            });
            if (target) {
                tower.heal(target);
                continue;
            }
        }
    },
    repairStruct: function (room: Room) {
        let towers: StructureTower[] = Mem.roomState.towers;
        for (const tower of towers) {
            const structNeedRep = room
                .find(FIND_MY_STRUCTURES, {filter: struct => struct.hitsMax - struct.hits >= TOWER_POWER_REPAIR || struct.hits < Config.WALL_MAXHP})
                .find(struct => tower.pos.inRangeTo(struct.pos.x, struct.pos.y, Config.TOWER_MAX_REPAIR_RANGE ));
            if (structNeedRep) {
                tower.repair(structNeedRep);
                continue;
            }
        }
    }
}
