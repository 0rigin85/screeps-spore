export class Bond {
  target: RoomObject;
  targetId: string;
  targetFlag: Flag;
  myFlag: Flag;
  type: LookConstant;
  exists(): boolean {
    return (
      this.type != null &&
      this.targetFlag != null &&
      this.myFlag != null &&
      this.myFlag.color === COLOR_YELLOW &&
      this.targetFlag.color === COLOR_YELLOW &&
      this.myFlag.secondaryColor === this.targetFlag.secondaryColor
    );
  }
  static discover(obj: RoomObject, lookType: LookConstant): Bond {
    let flagA = null;
    let flagB = null;
    let flags = obj.room.lookForAt(LOOK_FLAGS, obj.pos);

    for (let index = 0; index < flags.length; index++) {
      let flag = flags[index];
      if (flag.color === COLOR_YELLOW) {
        flagA = flag;
        break;
      }
    }

    if (flagA == null) {
      return null;
    }

    let startsWith = function(baseString, searchString, position?) {
      position = position || 0;
      return baseString.substr(position, searchString.length) === searchString;
    };

    for (let flagName in Game.flags) {
      let flag = Game.flags[flagName];
      if (
        flag != flagA &&
        flag.color === COLOR_YELLOW &&
        flag.secondaryColor === flagA.secondaryColor &&
        startsWith(flag.name, flagA.name)
      ) {
        flagB = flag;
        break;
      }
    }

    if (flagB == null) {
      return null;
    }

    let bond = new Bond();
    bond.type = lookType;
    bond.target = null;
    bond.targetId = null;

    if (flagB.room != null) {
      let found = flagB.room.lookForAt(lookType, flagB);
      if (found.length > 0) {
        bond.target = found[0];
      }
    }

    if (bond.target != null) {
      bond.targetId = (<any>bond.target).id;
    }

    bond.targetFlag = flagB;
    bond.myFlag = flagA;
    return bond;
  }
}
