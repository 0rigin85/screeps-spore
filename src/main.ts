import { Spore } from './spore';
import { SporeColony } from './sporeColony';
import { Remember } from './Remember';
import { Ptr } from './Ptr';
import { SCRIPT_VERSION } from './version';
import { SporePathFinder, SporePath } from './sporePathFinder';
import { SporeCreepMovement } from './SporeCreepMovement';
import { SporeCostMatrixCache } from './sporeCostMatrix';

import { Task } from './task';
import { BuildBarrier } from './tasks/taskBuildBarrier';
import { BuildStructure } from './tasks/taskBuildStructure';
import { ClaimRoom } from './tasks/taskClaimRoom';
import { DismantleStructure } from './tasks/taskDismantleStructure';
import { DefendRoom } from './tasks/taskDefendRoom';
import { HarvestEnergy } from './tasks/taskHarvestEnergy';
import { RecycleCreep } from './tasks/taskRecycleCreep';
import { RepairStructure } from './tasks/taskRepairStructure';
import { ReserveRoom } from './tasks/taskReserveRoom';
import { TransferResource } from './tasks/taskTransferResource';
import { UpgradeRoomController } from './tasks/taskUpgradeRoomController';
import { Wire } from './tasks/taskWire';

declare var module: any;

Spore.inject();

import profiler = require('./screepsProfiler');
profiler.enable();

profiler.registerClass(Remember, 'Remember');
profiler.registerClass(Ptr, 'Ptr');

profiler.registerClass(SporeColony, 'SporeColony');
profiler.registerClass(SporePathFinder, 'SporePathFinder');
profiler.registerClass(SporePath, 'SporePath');
profiler.registerClass(SporeCreepMovement, 'SporeCreepMovement');
profiler.registerClass(SporeCostMatrixCache, 'SporeCostMatrixCache');

profiler.registerClass(Task, 'Task');
profiler.registerClass(BuildBarrier, 'BuildBarrier');
profiler.registerClass(BuildStructure, 'BuildStructure');
profiler.registerClass(ClaimRoom, 'ClaimRoom');
profiler.registerClass(DismantleStructure, 'DismantleStructure');
profiler.registerClass(DefendRoom, 'DefendRoom');
profiler.registerClass(HarvestEnergy, 'HarvestEnergy');
profiler.registerClass(RecycleCreep, 'RecycleCreep');
profiler.registerClass(RepairStructure, 'RepairStructure');
profiler.registerClass(ReserveRoom, 'RepairReserveRoom');
profiler.registerClass(TransferResource, 'TransferResource');
profiler.registerClass(UpgradeRoomController, 'UpgradeRoomController');
profiler.registerClass(Wire, 'Wire');


module.exports.loop = function() {
  profiler.wrap(function() {
    PathFinder.use(true);
    Remember.beginTick();

    if (!Memory.scriptVersion || Memory.scriptVersion != SCRIPT_VERSION) {
      Memory.scriptVersion = SCRIPT_VERSION;
      const codeLoadedMsg = '<<<<< NEW CODE LOADED >>>>>';

      new RoomVisual().text(codeLoadedMsg, 25, 25, { color: 'green', font: 2.5 });
      console.log(codeLoadedMsg);
    }

    if (Memory.config == null) {
      Memory.config = { tasks: {} };
    }

    for (let name in Memory.creeps) {
      if (!Game.creeps[name]) {
        delete Memory.creeps[name];
        console.log('Clearing non-existing creep memory:', name);
      }
    }

    Spore.colony = new SporeColony();
    Spore.colony.run();

    Remember.endTick();
  });
};
