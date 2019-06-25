import { Ptr } from "./Ptr";

export class SporeController extends StructureController {
  get memory(): ControllerMemory {
    let roomMemory = this.room.memory;
    let memory = roomMemory.controller;

    if (memory == null) {
      memory = <any>{};
      roomMemory.controller = memory;
    }

    return memory;
  }

  static getSlots(controller: Ptr<StructureController>): number {
    if (controller.isShrouded) {
      return 1;
    }

    let memory = controller.instance.memory;

    if (memory.claimSlots == null) {
      memory.claimSlots = controller.pos.getWalkableSurroundingArea();
    }

    return memory.claimSlots;
  }

  get slots(): number {
    let slots = this.memory.claimSlots;

    if (slots == null) {
      slots = this.pos.getWalkableSurroundingArea();
      this.memory.claimSlots = slots;
    }

    return slots;
  }
}
