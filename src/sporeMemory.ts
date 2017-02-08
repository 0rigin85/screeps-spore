
import {SporePathMemory} from "./sporePathFinder";

declare global
{
    interface Memory
    {
        paths: {
            [id: string]: SporePathMemory;
        };

        config: Configuration;
    }
}

export interface Configuration
{
    tasks: { [key: string]: any }
}
