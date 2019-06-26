//import stringify from "fast-stringify";

let lastMemory: Memory;
let lastTime: number = 0;

export class SporeMemory {
  static load() {
    if (lastTime && lastMemory && Game.time == lastTime + 1) {
      RawMemory._parsed = lastMemory;
    } else {
      new RoomVisual().text('<< Parsed Memory >>', 25, 25, { color: 'green', font: 2.5 });
      RawMemory._parsed = JSON.parse(RawMemory.get());
      lastMemory = RawMemory._parsed;
    }

    // @ts-ignore
    delete global.Memory;
    // @ts-ignore
    global.Memory = lastMemory;
    lastTime = Game.time;
  }

  static save() {
    //import('fast-stringify')
    //  .then(stringify => {
     //   RawMemory.set((stringify as any)(Memory));
    //  })
    //  .catch(() => {
        RawMemory.set(JSON.stringify(Memory));
    //  });
  }
}
