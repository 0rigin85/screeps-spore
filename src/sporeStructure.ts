///<reference path="../../../../.WebStorm2016.2/config/javascript/extLibs/http_github.com_DefinitelyTyped_DefinitelyTyped_raw_master_lodash_lodash.d.ts"/>

declare global
{
    interface Structure
    {
        hitsMissing: number;
        needsRepair: boolean;
        dire: boolean;
    }
}

export interface StructureMemorySet
{
    [id: string]: StructureMemory;
}

export interface StructureMemory
{
    needsRepair: boolean;
    dire: boolean;
}

export class SporeStructure extends Structure
{
    get hitsMissing(): number
    {
        return this.hitsMax - this.hits;
    }

    _needsRepair: boolean;
    get needsRepair(): boolean
    {
        if (this._needsRepair != null)
        {
            return this._needsRepair === true;
        }

        let memory = this.memory;

        if (memory == null)
        {
            if (this.room.memory.structures == null)
            {
                this.room.memory.structures = {};
            }

            memory = this.room.memory.structures[this.id];

            if (memory == null)
            {
                memory = <any>{};
                this.room.memory.structures[this.id] = memory;
            }
        }

        this._needsRepair = memory.needsRepair;
        return this._needsRepair === true;
    }

    set needsRepair(value: boolean)
    {
        this._needsRepair = value;

        if (this.memory != null)
        {
            if (value === false)
            {
                delete this.memory.needsRepair;
            }
            else
            {
                this.memory.needsRepair = value;
            }
        }
        else
        {
            if (this.room.memory.structures == null)
            {
                this.room.memory.structures = {};
            }

            let memory = this.room.memory.structures[this.id];

            if (memory == null)
            {
                if (value === true)
                {
                    this.room.memory.structures[this.id] = <any>{};
                    memory.needsRepair = value;
                }
            }
            else
            {
                if (value === true)
                {
                    memory.needsRepair = value;
                }
                else
                {
                    delete memory.needsRepair;

                    if (Object.getOwnPropertyNames(memory).length === 0)
                    {
                        delete this.room.memory.structures[this.id];
                    }
                }
            }
        }
    }

    _dire: boolean;
    get dire(): boolean
    {
        if (this._dire != null)
        {
            return this._dire === true;
        }

        let memory = this.memory;

        if (memory == null)
        {
            if (this.room.memory.structures == null)
            {
                this.room.memory.structures = {};
            }

            memory = this.room.memory.structures[this.id];

            if (memory == null)
            {
                memory = <any>{};
                this.room.memory.structures[this.id] = memory;
            }
        }

        this._dire = memory.dire;
        return this._dire === true;
    }

    set dire(value: boolean)
    {
        this._dire = value;

        if (this.memory != null)
        {
            if (value === false)
            {
                delete this.memory.dire;
            }
            else
            {
                this.memory.dire = value;
            }
        }
        else
        {
            if (this.room.memory.structures == null)
            {
                this.room.memory.structures = {};
            }

            let memory = this.room.memory.structures[this.id];

            if (memory == null)
            {
                if (value === true)
                {
                    this.room.memory.structures[this.id] = <any>{};
                    memory.dire = value;
                }
            }
            else
            {
                if (value === true)
                {
                    memory.dire = value;
                }
                else
                {
                    delete memory.dire;

                    if (Object.getOwnPropertyNames(memory).length === 0)
                    {
                        delete this.room.memory.structures[this.id];
                    }
                }
            }
        }
    }
}