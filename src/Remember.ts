export class Remember {
  static byName(groupName: string, dataPath: string, getter, reset?: boolean) {
    if (this.groupData[groupName] == null) {
      this.groupData[groupName] = {};
    }

    return Remember.getData(this.groupData[groupName], dataPath, getter, reset);
  }

  static forTick(dataPath: string, getter, reset?: boolean) {
    return Remember.getData(Remember.tickData, dataPath, getter, reset);
  }

  static lastTick(dataPath: string) {
    if (Memory.previousTick == null) {
      return null;
    }

    return Remember.getData(Memory.previousTick, dataPath, null, null);
  }

  static forever(dataPath: string, getter, reset?: boolean) {
    return Remember.getData(Memory, dataPath, getter, reset);
  }

  static beginTick(): void {
    this.tickData = {};
    this.groupData = {};
  }

  static endTick(): void {
    Memory.previousTick = this.tickData;
  }

  private static tickData = {};
  private static groupData = {};

  private static getData(obj, dataPath, getter, reset) {
    let pathArr = dataPath.split('.');
    let pathNum = pathArr.length;
    for (let idx = 0; idx < pathNum - 1; idx++) {
      let member = pathArr[idx];
      obj = obj[member] || (obj[member] = {});
    }

    if (getter != null) {
      obj = reset
        ? (obj[pathArr[pathNum - 1]] = getter())
        : obj[pathArr[pathNum - 1]] || (obj[pathArr[pathNum - 1]] = getter());
    } else if (obj != null) {
      obj = obj[pathArr[pathNum - 1]];
    }

    return obj;
  }
}
