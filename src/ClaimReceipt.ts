export class ClaimReceipt {
  constructor(
    public target: Claimable,
    public type: string,
    public resourceType: string,
    public amount: number
  ) {}
}
