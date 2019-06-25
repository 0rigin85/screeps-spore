import { Task } from './task';
import { BuildStructure } from './tasks/taskBuildStructure';
import { DismantleStructure } from './tasks/taskDismantleStructure';
import { Ptr } from './Ptr';

var REQUESTED_CONSTRUCTION_SITES_THIS_TICK: {
  [structureType: string]: number;
} = {};

export class FlagBuildStructure extends Task {
  structureType: StructureConstant = null;

  constructor(parentId: string, public flag: Flag) {
    super(true);
    this.id = (parentId != null && parentId.length > 0 ? parentId + '>' : '') + 'FlagBuildStructure[' + flag.name + ']';

    if (this.flag.secondaryColor == COLOR_GREEN) {
      this.structureType = STRUCTURE_EXTENSION;
    } else if (this.flag.secondaryColor == COLOR_YELLOW) {
      this.structureType = STRUCTURE_CONTAINER;
    } else if (this.flag.secondaryColor == COLOR_BROWN) {
      this.structureType = STRUCTURE_TOWER;
    } else if (this.flag.secondaryColor == COLOR_CYAN) {
      this.structureType = STRUCTURE_LINK;
    } else if (this.flag.secondaryColor == COLOR_BLUE) {
      this.structureType = STRUCTURE_STORAGE;
    }
  }

  static deserialize(input: string): FlagBuildStructure {
    let parentId = '';
    let parentSplitIndex = input.lastIndexOf('>');

    if (parentSplitIndex >= 0) {
      parentId = input.substring(0, parentSplitIndex);
    }

    let startingBraceIndex = input.lastIndexOf('[');
    let flagName = input.substring(startingBraceIndex, input.length - 1);

    let flag = Game.flags[flagName];

    if (flag == null) {
      return null;
    }

    return new FlagBuildStructure(parentId, flag);
  }

  getSteps(): Task[] {
    let steps: Task[] = [];

    if (this.structureType == null) {
      return steps;
    }

    let constructionSite: ConstructionSite;

    let sitesUnderFlag = this.flag.room.lookForAt(LOOK_CONSTRUCTION_SITES, this.flag.pos);
    if (sitesUnderFlag != null && sitesUnderFlag.length > 0) {
      for (let index = 0; index < sitesUnderFlag.length; index++) {
        let type = sitesUnderFlag[index].structureType;

        if (type != this.structureType && type != STRUCTURE_RAMPART && type != STRUCTURE_ROAD) {
          sitesUnderFlag[index].remove();
        } else if (type == this.structureType) {
          constructionSite = sitesUnderFlag[index];
        }
      }
    }

    if (constructionSite != null) {
      this.flag.remove();
      return steps;
    }

    let structuresUnderFlag = this.flag.room.lookForAt(LOOK_STRUCTURES, this.flag.pos);
    if (structuresUnderFlag != null) {
      for (let index = 0; index < structuresUnderFlag.length; index++) {
        let type = structuresUnderFlag[index].structureType;

        // if there is already an extension at this location then
        if (type == this.structureType) {
          // remove the flag
          this.flag.remove();
          return steps;
        }
        // else if there is another type of building which can't share the space with an extension
        else if (type != STRUCTURE_RAMPART && type != STRUCTURE_ROAD) {
          // create tasks to dismantle it to make room for the extension
          steps.push(new DismantleStructure(Ptr.from<Structure>(structuresUnderFlag[index])));
          return steps;
        }
      }
    }

    if (constructionSite == null) {
      let sameStructures = this.flag.room[this.structureType + 's'];
      if (sameStructures == null) {
        sameStructures = this.flag.room.find<Structure>(FIND_STRUCTURES, {
          filter: { structureType: this.structureType }
        });
      }

      let sameSites = this.flag.room.find(FIND_CONSTRUCTION_SITES, {
        filter: { structureType: this.structureType }
      });

      let requestedSameSites = 0;
      if (REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType] != null) {
        requestedSameSites = REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType];
      }

      if (
        CONTROLLER_STRUCTURES[this.structureType][this.flag.room.controller.level] -
          (sameStructures.length + sameSites.length + requestedSameSites) >
        0
      ) {
        this.flag.room.createConstructionSite(this.flag.pos, this.structureType);

        if (REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType] != null) {
          REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType]++;
        } else {
          REQUESTED_CONSTRUCTION_SITES_THIS_TICK[this.structureType] = 1;
        }

        return steps;
      } else {
        return steps;
      }
    }

    steps.push(new BuildStructure(Ptr.from<ConstructionSite>(constructionSite)));
    return steps;
  }
}
