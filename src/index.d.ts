// import { RoomMemory } from './memory';
// Game Memory
interface Memory {
    version?: string;
    date: string;
    stats: any;
}


interface RoomMemory {
    rooms?:
    {
        [name: string]: RoomMemory;
    }
    lastProgressChecktime?: number;
    lastProgress?: number;
    isUnderSiege?: number;
}


interface CreepMemory {
    homeRoom: string;
    role: string;
}

// Syntax for adding properties to `global` (ex "global.log")
declare namespace NodeJS {
    interface Global {
        cc: any;
        Profiler: any;
        log: {
            level: number,
            showSource: boolean,
            showTick: boolean
        };
    }
}
