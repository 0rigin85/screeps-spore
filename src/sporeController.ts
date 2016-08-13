///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

declare global
{
    interface StructureController
    {
        memory: ControllerMemory;
    }
}

export interface ControllerMemory
{

}

export class SporeController extends StructureController
{
    get memory(): ControllerMemory
    {
        let roomMemory = this.room.memory;
        let memory = roomMemory.controller;

        if (memory == null)
        {
            memory = { };
            roomMemory.controller = memory;
        }

        Object.defineProperty(this, "memory", {value: memory});
        return memory;
    }
}
