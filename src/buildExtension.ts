/// <reference path="./../node_modules/screeps-typescript-declarations/dist/screeps.d.ts" />

import {Task} from './task';

export class BuildExtension extends Task {

    constructor() {
        super();
    }

    getSteps(): Task[] {

        if (Game.creeps)
        {

        }

        return [];
    }

}