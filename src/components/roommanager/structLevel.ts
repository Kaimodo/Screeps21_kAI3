import * as Profiler from "screeps-profiler";
import * as Inscribe from "screeps-inscribe";

import { log } from "tools/logger/logger";
import { ENABLE_DEBUG_MODE } from "config";

import * as Mem from "memory";

import { Emoji } from "tools/emoji";

export class StructLevel {

    //private _structure: StructureConstant;
    //private _controller: StructureController

    /*
    constructor(structure: StructureConstant, controller: StructureController) {
        this._structure = structure;
        this._controller = controller
    }
    */


    public getMaxStructs(_structure: StructureConstant, _controller: StructureController) {


        if (_controller != (null || undefined) && _structure != (null || undefined)) {
            switch (_structure) {
                case STRUCTURE_EXTENSION: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 5;
                        case 3: return 10;
                        case 4: return 20;
                        case 5: return 30;
                        case 6: return 40;
                        case 7: return 50;
                        case 8: return 60;
                    }
                    return 0;
                }
                case STRUCTURE_CONTAINER: {
                    return 5;
                }
                case STRUCTURE_TOWER: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 1;
                        case 4: return 1;
                        case 5: return 2;
                        case 6: return 2;
                        case 7: return 3;
                        case 8: return 6;
                    }
                    return 0;
                }
                case STRUCTURE_STORAGE: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 1;
                        case 5: return 1;
                        case 6: return 1;
                        case 7: return 1;
                        case 8: return 1;
                    }
                    return 0;
                }
                case STRUCTURE_LINK: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 1;
                        case 5: return 2;
                        case 6: return 3;
                        case 7: return 4;
                        case 8: return 6;
                    }
                    return 0;
                }
                case STRUCTURE_EXTRACTOR: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 0;
                        case 5: return 0;
                        case 6: return 1;
                        case 7: return 1;
                        case 8: return 1;
                    }
                    return 0;
                }
                case STRUCTURE_LAB: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 0;
                        case 5: return 0;
                        case 6: return 3;
                        case 7: return 6;
                        case 8: return 10;
                    }
                    return 0;
                }
                case STRUCTURE_TERMINAL: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 0;
                        case 5: return 0;
                        case 6: return 1;
                        case 7: return 1;
                        case 8: return 1;
                    }
                    return 0;
                }
                case STRUCTURE_OBSERVER: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 0;
                        case 5: return 0;
                        case 6: return 0;
                        case 7: return 0;
                        case 8: return 1;
                    }
                    return 0;
                }
                case STRUCTURE_POWER_SPAWN: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 0;
                        case 5: return 0;
                        case 6: return 0;
                        case 7: return 0;
                        case 8: return 1;
                    }
                    return 0;
                }
                case STRUCTURE_SPAWN: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 0;
                        case 5: return 0;
                        case 6: return 1;
                        case 7: return 2;
                        case 8: return 3;
                    }
                    return 0;
                }
                case STRUCTURE_FACTORY: {
                    switch(_controller.level) {
                        case 1: return 0;
                        case 2: return 0;
                        case 3: return 0;
                        case 4: return 0;
                        case 5: return 0;
                        case 6: return 0;
                        case 7: return 1;
                        case 8: return 1;
                    }
                    return 0;
                }
            }
            return 0;
        }
        return 0;
    }
}
