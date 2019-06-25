export class LaborPoolType {
  constructor(public parts: {
    [name: string]: number;
  }, public count: number) {
    for (let name in BODYPART_COST) {
      if (parts[name] == null) {
        parts[name] = 0;
      }
    }
  }
}
