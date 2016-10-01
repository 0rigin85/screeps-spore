

export class ClaimReceipt
{
    constructor(
        public target: Claimable,
        public type: string,
        public resourceType: string,
        public amount: number)
    { }
}

export interface Claimable extends RoomObject
{
    id: string;
    pos: RoomPosition;
    room: Room;

    collect(collector: any, claimReceipt: ClaimReceipt): number;

    makeClaim(claimer: any, resourceType: string, amount: number, minAmount: number, isExtended?: boolean): ClaimReceipt;
}
