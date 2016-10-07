///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

import {ScreepsPtr} from "./screepsPtr";
declare global
{
    interface StructureController
    {
        memory: ControllerMemory;
        slots: number;
    }
}

export interface ControllerMemory
{
    claimSlots: number;
}

export class SporeController extends StructureController
{
    get memory(): ControllerMemory
    {
        let roomMemory = this.room.memory;
        let memory = roomMemory.controller;

        if (memory == null)
        {
            memory = (<any>{ });
            roomMemory.controller = memory;
        }

        Object.defineProperty(this, "memory", {value: memory});
        return memory;
    }

    static getSlots(controller: ScreepsPtr<StructureController>): number
    {
        if (controller.isShrouded)
        {
            return 1;
        }

        let memory = controller.instance.memory;

        if (memory.claimSlots == null)
        {
            memory.claimSlots = controller.pos.getWalkableSurroundingArea();
        }

        return memory.claimSlots;
    }

    get slots(): number
    {
        let slots = this.memory.claimSlots;

        if (slots == null)
        {
            slots = this.pos.getWalkableSurroundingArea();
            this.memory.claimSlots = slots;
        }

        Object.defineProperty(this, "slots", {value: slots});
        return slots;
    }
}
