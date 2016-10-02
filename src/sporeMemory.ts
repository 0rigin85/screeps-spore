
declare global
{
    interface Memory
    {
        routes: {
            [fromRoom: string]: any;
        };

        config: Configuration;
    }
}

export interface Configuration
{
    tasks: { [key: string]: any }
}
