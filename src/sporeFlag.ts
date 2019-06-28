import { FlagBuildStructure } from "./flagBuildStructure";
import { FlagDismantleStructure } from "./flagDismantleStructure";
import { Wire } from "./tasks/taskWire";
import { ClaimRoom } from "./tasks/taskClaimRoom";
import { ReserveRoom } from "./tasks/taskReserveRoom";
import { Ptr } from "./Ptr";

export class SporeFlag extends Flag {
  getTasks(): Task[] {
    let tasks: Task[] = [];

    let myRoom = this.room != null && this.room.my;
    if (this.color == COLOR_GREEN) {
      tasks.push(new FlagBuildStructure("", Game.flags[this.name]));
    } else if (this.color == COLOR_RED) {
      tasks.push(new FlagDismantleStructure("", Game.flags[this.name]));
    } else if (this.color == COLOR_WHITE) {
      tasks.push(new Wire(Game.flags[this.name].pos));
    } else if (this.color == COLOR_GREY) {
      if (this.room != null) {
        let lookResults: LookAtResult[] = this.room.lookAt(this);

        for (var lookIndex = 0; lookIndex < lookResults.length; lookIndex++) {
          let lookObject = lookResults[lookIndex];

          if (lookObject.type == LOOK_SOURCES) {
            lookObject.source.doIgnore = true;
          } else if (lookObject.type == LOOK_STRUCTURES) {
            (lookObject.structure as RoomObject).doIgnore = true;
          } else if (lookObject.type == LOOK_CONSTRUCTION_SITES) {
            lookObject.constructionSite.doIgnore = true;
          }
        }
      }
    } else if (this.color == COLOR_BLUE) {
      if (this.room != null) {
        let lookResults: LookAtResult[] = this.room.lookAt(this);

        for (var lookIndex = 0; lookIndex < lookResults.length; lookIndex++) {
          let lookObject = lookResults[lookIndex];

          if (lookObject.type == LOOK_SOURCES) {
            lookObject.source.doFavor = true;
          } else if (lookObject.type == LOOK_STRUCTURES) {
            lookObject.structure.doFavor = true;
          } else if (lookObject.type == LOOK_CONSTRUCTION_SITES) {
            lookObject.constructionSite.doFavor = true;
          }
        }
      }
    } else if (this.color == COLOR_PURPLE) {
      if (this.secondaryColor == COLOR_PURPLE) {
        if (
          this.room == null ||
          (this.room.controller != null && this.room.controller.owner == null)
        ) {
          tasks.push(
            new ClaimRoom(
              Ptr.fromPosition<StructureController>(
                this.pos,
                STRUCTURE_CONTROLLER
              )
            )
          );
        } else if (
          this.room != null &&
          this.room.controller != null &&
          this.room.controller.owner != null &&
          this.room.controller.owner.username == "PCake0rigin"
        ) {
          this.remove();
        }
      } else if (this.secondaryColor == COLOR_BLUE) {
        if (
          this.room == null ||
          (this.room.controller != null &&
            this.room.controller.owner == null &&
            (this.room.controller.reservation == null ||
              this.room.controller.reservation.username == "PCake0rigin"))
        ) {
          let task = new ReserveRoom(
            Ptr.fromPosition<StructureController>(
              this.pos,
              STRUCTURE_CONTROLLER
            )
          );
          task.roomName = this.name.split(':')[0];
          tasks.push(task);

          if (this.room != null) {
            this.room.memory.reservedBy = task.roomName;
          }
        } else if (
          this.room != null &&
          this.room.controller.owner.username == "PCake0rigin"
        ) {
          this.remove();
        }
      }
    }

    return tasks;
  }
}
