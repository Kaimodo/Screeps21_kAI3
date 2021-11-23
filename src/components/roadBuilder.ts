import { RoomState } from "memory";
import { log } from "tools/logger/logger";
import * as Mem from "memory"
import path from "path";

class RoadBuilder {
    private readonly state: RoomState;
    public constructor(private readonly _state: RoomState) {
        this.state = _state;
      }

    public placeRoadSourceToSpawn(room: Room): ScreepsReturnCode {
        //log.debug("placeRoadSourceToSpawn: " + room)
        const sources: Source[] = this.state.sources;
        const spawns: StructureSpawn[] = this.state.spawns;
        if (spawns.length <= 0) {
            return OK
        }
        if (sources.length <= 0) {
            return OK
        }
        for (const source of sources ) {
            for (const spawn of spawns) {
                //log.debug (" searching path source-spawn")
                const path: PathFinderPath = this.planRoad(source.pos, spawn.pos, 1);
                if (!path.incomplete) {
                    //log.debug(`Placing road from ${spawn} to ${source}`)
                    this.placeRoadOnPath(path, room);
                }
            }
        }
        return OK
    }
    public placeRoadSource2Source(room: Room): ScreepsReturnCode {
        const sources: Source[] = this.state.sources;
        if (sources.length != 2) {
            return OK
        }
        let result: ScreepsReturnCode = ERR_NOT_IN_RANGE;
        let first: RoomPosition = sources[0].pos;
        let second: RoomPosition = sources[1].pos;
        const path = this.planRoad(first, second, 1);
        if(!path.incomplete) {
            result = this.placeRoadOnPath(path, room);
        }
        return result
    }

    public placeRoadControllerToSpawn(room: Room): ScreepsReturnCode {
        let result: ScreepsReturnCode = ERR_NOT_IN_RANGE;
        if (room.controller) {
            const spawns = this.state.spawns;
            if (spawns.length > 0) {
                //log.debug(`Place road to ${spawns[0]}`);
                const path = this.planRoad(spawns[0].pos, room.controller.pos, 1)
                if (!path.incomplete) {
                    result = this.placeRoadOnPath(path, room);
                }
            }
        }
        return result;
    }

    public placeRoadSpawnToExtensions(room: Room): ScreepsReturnCode {
        const extensions = this.state.extensions ;
        const spawns = this.state.spawns;
        for(const spawn of spawns) {
            for (const extension of extensions) {
                const path = this.planRoad(spawn.pos, extension.pos, 1);
                if (!path.incomplete) {
                    const result = this.placeRoadOnPath(path, room);
                    if (result !== OK) {
                        return result;
                    }
                }
            }
        }
        return OK;
    }
    public placeRoadSpawnToStorage(room: Room): ScreepsReturnCode {
        const storage = this.state.storages[0] ;
        const spawns = this.state.spawns;
        for(const spawn of spawns) {
            const path = this.planRoad(spawn.pos, storage.pos, 1);
            if (!path.incomplete) {
                const result = this.placeRoadOnPath(path, room);
                if (result !== OK) {
                    return result;
                }
            }
        }
        return OK;
    }

    public placeRoadToTarget(room: Room, creep: Creep, target: Structure): ScreepsReturnCode {
        let result: ScreepsReturnCode = ERR_NOT_IN_RANGE;
        const origin = creep.pos;
        const _target = target.pos;
        const path = this.planRoad(origin, _target, 1);
        if (!path.incomplete) {
            result = this.placeRoadOnPath(path, room);
        }
        return result
    }

    public planRoad(origin: RoomPosition, goal: RoomPosition, range = 0): PathFinderPath {
        //log.debug(`planRoad:  ${origin}/${goal}`)
        const path = PathFinder.search(
            origin,
            {pos: goal, range},
            { swampCost: 2, plainCost: 2 }
        )
        return path;
    }

    private placeRoadOnPath(path: PathFinderPath, room: Room): ScreepsReturnCode {
        //log.debug(`placeRoadOnPath: ${room}`);
        for (const pos of path.path) {
            const hasRoad = this.checkForRoadAtPos(pos);
            if (!hasRoad) {
                const result = room.createConstructionSite(pos, STRUCTURE_ROAD);
                if (result !== 0) {
                    log.error(`road failed: ${result}, pos: ${String(pos)}`);
                    return result;
                }
            }
        }
    return OK
    }

    private checkForRoadAtPos(pos: RoomPosition): boolean {
        //log.debug(`checkForRoadAtPos: ${pos}`);
        return (
            pos.look().filter(things => {
                const isRoad = things.structure?.structureType === STRUCTURE_ROAD;
                const isRoadSite = things.constructionSite?.structureType === STRUCTURE_ROAD;
                return isRoad || isRoadSite;
            }).length > 0
        );
    }
}

export let roadBuilder = new RoadBuilder(Mem.roomState);
