/**
 * Enable this to enable screeps profiler
 */
 export const USE_PROFILER: boolean = true

 /**
 * Enable this if you want a lot of text to be logged to console.
 * @type {boolean}
 */
export const ENABLE_DEBUG_MODE: boolean = true;

/**
 * Name of the Initial Room
 */
export const FIRST_ROOM_NAME = Game.spawns.Spawn1.room.name;

/**
 * Desired Builders
 */
 export const DESIRED_BUILDERS: number = 8;

 /**
 * Max HP a Wall should be healed
 */
export const WALL_MAXHP: number = 100000;

/**
 * Max HP a Rampart should be healed
 */
 export const RAMP_MAXHP: number = 100000;

/**
 * Tower Ranges
 */
export const TOWER_MAX_REPAIR_RANGE = TOWER_OPTIMAL_RANGE;
export const TOWER_MAX_ATTACK_RANGE = TOWER_OPTIMAL_RANGE * 2;
export const TOWER_MAX_HEAL_RANGE = TOWER_OPTIMAL_RANGE * 2;

//Debug Mode
import { LogLevel } from "tools/logger/logLevel";

/**
 * Debug level for log output
 */
 export const LOG_LEVEL: number = LogLevel.DEBUG;

 /**
  * Prepend log output with current tick number.
  */
 export const LOG_PRINT_TICK: boolean = true;

 /**
  * Prepend log output with source line.
  */
 export const LOG_PRINT_LINES: boolean = true;

 /**
  * Load source maps and resolve source lines back to typescript.
  */
 export const LOG_LOAD_SOURCE_MAP: boolean = true;

 /**
  * Maximum padding for source links (for aligning log output).
  */
 export const LOG_MAX_PAD: number = 100;

  /**
 * VSC location, used to create links back to source.
 * Repo and revision are filled in at build time for git repositories.
 */
export const LOG_VSC = { repo: '@@_repo_@@', revision: '1', valid: false }
//export const LOG_VSC = { repo: '@@_repo_@@', revision: __REVISION__, valid: false }

/**
 * URL template for VSC links, this one works for github and gitlab.
 */
export const LOG_VSC_URL_TEMPLATE = (path: string, line: string) => {
  return `${LOG_VSC.repo}/blob/${LOG_VSC.revision}/${path}#${line}`
}
