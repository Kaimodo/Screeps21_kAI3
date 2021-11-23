const startCpu = Game.cpu.getUsed()
import { ErrorMapper } from "tools/ErrorMapper";

import * as Profiler from "screeps-profiler";
import { USE_PROFILER } from "config";

import * as Inscribe from "screeps-inscribe";

import { log } from "tools/logger/logger";
import {ENABLE_DEBUG_MODE} from "config";

import * as Tools from "tools/tools"

import { ConsoleCommands } from "tools/consolecommands";

import { Emoji, Splash } from './tools/Emoji';

import * as Orga from "./organize.json";
import * as Config from "config";

import * as Mem from "memory"

import { RoomManager } from "components/internal";
import { StatsManager } from './tools/stats';


//New Script loaded
console.log(`[${Inscribe.color("New Script loaded", "red")}] ${Emoji.reload}`);
log.info(`[${Inscribe.color(`| Memory Version=${Mem.memoryVersion} |`, "skyblue")}]`);

if (USE_PROFILER) {
  log.info("Profiler an: "+ USE_PROFILER);
  Profiler.enable();
}

function memoryInit() {
  log.info("initing game");
  for (const name in Memory.flags) {
      if (!(name in Game.flags)) {
        delete Memory.flags[name];
      }
  }
  for (const name in Memory.spawns) {
      if (!(name in Game.spawns)) {
        delete Memory.spawns[name];
      }
  }
  for (const name in Memory.creeps) {
      if (!(name in Game.creeps)) {
        delete Memory.creeps[name];
      }
  }
  for (const name in Memory.rooms) {
      if (!(name in Game.rooms)) {
        delete Memory.rooms[name];
      }
  }
  const mem = Mem.m();
  mem.creeps = {};
  mem.rooms = {};

  mem.uuid = 0;
  //mem.logLevel = M.LogLevel.Low;
  mem.memVersion = Mem.memoryVersion ;
}

// Get Script loading time
const elapsedCPU = Game.cpu.getUsed() - startCpu;
Splash();
console.log(`[${Inscribe.color("Script Loading needed: ", "skyblue") + elapsedCPU.toFixed(2) + " Ticks"}]`);

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  Profiler.wrap(() => {

    global.cc = ConsoleCommands;
    // console.log(`Current game tick is ${Game.time}`);

    // Main Loop here
    if (Mem.m().memVersion === undefined || Mem.m().memVersion !== Mem.memoryVersion) {
        memoryInit()
    }
    if (!Mem.m().uuid || Mem.m().uuid > 1000) {
        Mem.m().uuid = 0;
    }
    for (const R in Game.rooms){
        const room: Room = Game.rooms[R];
        const rm: Mem.RoomMemory = Mem.m().rooms[room.name];
        if (rm === undefined) {
            log.info(`Init room Memory for ${room.name}`);
            Memory.rooms[room.name] = {};
            RoomManager.initRoomMemory(room, room.name);
        } else {
            RoomManager.run(room, rm);
        }
        if (Game.time % 10 === 0){
            RoomManager.cleanupAssignedMiners(rm);
        }
    }


    Tools.log_info()
    Tools.ClearNonExistingCreeMemory();
    StatsManager.runForAllRooms();
  });
});
