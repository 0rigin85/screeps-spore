export class SporePathOptions {
    static Default: SporePathOptions = new SporePathOptions([], null);
    plainCost: number = 1;
    swampCost: number = 5;
    maxRooms: number = 16;
    maxOps: number = 2000;
    constructor(public costs: SporeCostMatrixOption[], public persist?: string | {
        id: string;
        ticks: number;
    }) { }
}
