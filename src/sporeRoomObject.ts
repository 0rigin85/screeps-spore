
declare global
{
    export interface RoomObject
    {
        doIgnore: boolean;
        doFavor: boolean;
        doTrack: boolean;

        id: string;
        memory: any;
    }
}

export interface RoomObjectMemory
{
    track: boolean;
}

export class SporeRoomObject extends RoomObject
{
    doIgnore: boolean;

    get doTrack(): boolean
    {
        return (<RoomObjectMemory>this.memory).track === true;
    }

    doFavor: boolean;
}