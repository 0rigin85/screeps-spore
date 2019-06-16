
import {SporePathMemory} from "./sporePathFinder";

declare global
{
    interface Memory
    {
        paths: {
            [id: string]: SporePathMemory;
        };

        previousTasks: { [key: string]: any },
        tasks: { [key: string]: any },

        config: Configuration;
    }
}

export interface Configuration
{
    tasks: { [key: string]: any }
}
