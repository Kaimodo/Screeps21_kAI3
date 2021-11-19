import * as Inscribe from "screeps-inscribe";
import * as Mem from "memory"

import {roadBuilder} from "../components/roadbuilder";

const Colors = ["cyan", "red", "green", "yellow", "white", "purple", "pink", "orange"];

export const ConsoleCommands = {

  /**
   * To Test if Console Commands work
   */
  test() {
    console.log(`[${Inscribe.color("CC", "red")}] Commands working`);
  },
  /**
   * Shows List of Commands
   */
   help(): void {
    console.log(`[${Inscribe.color("CC", "skyblue")}] List of Commands:`);
    console.log(`[${Inscribe.color("CC", "skyblue")}] help() | Shows this list.`);
    console.log(`[${Inscribe.color("CC", "skyblue")}] test() | Check if Commands work`);
    console.log(`[${Inscribe.color("CC", "green")}] setMem(number) | Set the Memory-Version to number`);
    console.log(`[${Inscribe.color("CC", "skyblue")}] getMem() | show the Memory-Version`);
    console.log(`[${Inscribe.color("CC", "skyblue")}] cpuUsedParsing() | Show how much CPU is used for parsing the Memory`);
    console.log(`[${Inscribe.color("CC", "red")}] killAll(room name) | Kill all Screeps in given Room`);
    console.log(`[${Inscribe.color("CC", "red")}] destroyAllStruct() | Destroy all own Structures in ALL Rooms`);
    console.log(`[${Inscribe.color("CC", "red")}] rc(room-name, leaveStarted, StructType) | Remove construction Sites`);
    console.log(`[${Inscribe.color("CC", "skyblue")}] drawRoad(origin, target, range)`);
  },
  drawRoad(origin: RoomPosition, target: RoomPosition, range: number) {
    const room = Game.rooms[origin.roomName];
    const path = roadBuilder.planRoad(origin, target, range);
    room.visual.poly(path.path);
  },
  /**
   * Destroy all own Structures in ALL Rooms
   */
  destroyAllStruct(): void {
    for (const R in Game.rooms) {
      const room: Room = Game.rooms[R];
      let structures = room.find(FIND_STRUCTURES);
      if (structures.length > 0) {
        for (const s in structures) {
          structures[s].destroy();
        }
      }
    }
  },

  removeConstructionSites(roomName: string, leaveProgressStarted: boolean, structureType: string) {
    Game.rooms[roomName].find(FIND_MY_CONSTRUCTION_SITES).forEach((site) => {
        if ((!structureType || site.structureType === structureType) &&
            (!leaveProgressStarted || site.progress === 0)) {
            site.remove();
        }
    });
  },
  rc(roomName: string, leaveProgressStarted: boolean, structureType: string) {
      this.removeConstructionSites(roomName, leaveProgressStarted, structureType);
  },
  /**
   * Set the actual Memory Version
   * @param The Number u wanna Set
   */
   setMem(Version: number) {
    Mem.setMemVersion(Version);
    console.log(`[${Inscribe.color("CC", "blue")}] Setting Game-Memory-Version to ${Mem.memoryVersion}`);
  },

  /**
   * Get the actual Memory version
   */
  getMem() {
    console.log(`[${Inscribe.color("CC", "green")}] Game-Memory-Version: ${Mem.memoryVersion}`);
  },

  /**
   * Show CPU used for parsing Memory
   */
  cpuUsedParsing(){
    let stringified = JSON.stringify(Memory);
    let startCpu = Game.cpu.getUsed();
    JSON.parse(stringified);
    console.log("CPU used on Memory parsing: " + (Game.cpu.getUsed() - startCpu));
  },
  /**
   * Kill all Creeps in given Room
   * @param roomName The Room Name
   */
  killAll(roomName?: string) {
    for (const R in Game.rooms) {
      const room: Room = Game.rooms[R];
      for (const c in Game.creeps) {
        const creep = Game.creeps[c]
        if ((creep.room.name && room.name === roomName) || !roomName) {
            creep.suicide();
        }
      }
    }
  }

};
