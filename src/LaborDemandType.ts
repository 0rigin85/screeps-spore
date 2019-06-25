export class LaborDemandType {
  constructor(
    public parts: {
      [name: string]: number;
    },
    public min: number,
    public max: number
  ) {
    for (let name in BODYPART_COST) {
      if (parts[name] == null) {
        parts[name] = 0;
      }
    }
  }
}
