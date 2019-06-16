let usedOnStart = 0;
let enabled = false;
let depth = 0;
declare var Source: any;
var profilingSymbol = Symbol('profiling');

function setupProfiler()
{
    depth = 0; // reset depth, this needs to be done each tick.
    (<any>Game).profiler = {
        stream(duration, filter) {
            setupMemory('stream', duration || 10, filter);
        },
        email(duration, filter) {
            setupMemory('email', duration || 100, filter);
        },
        profile(duration, filter) {
            setupMemory('profile', duration || 100, filter);
        },
        reset: resetMemory,
    };

    overloadCPUCalc();
}

function setupMemory(profileType, duration, filter)
{
    resetMemory();
    if (!Memory.profiler)
    {
        Memory.profiler = {
            map: {},
            totalTime: 0,
            enabledTick: Game.time + 1,
            disableTick: Game.time + duration,
            type: profileType,
            filter,
        };
    }
}

function resetMemory()
{
    Memory.profiler = null;
}

function overloadCPUCalc()
{
    /*if (false) {
     usedOnStart = 0; // This needs to be reset, but only in the sim.
     Game.cpu.getUsed = function getUsed() {
     return performance.now() - usedOnStart;
     };
     }*/
}

function getFilter()
{
    return Memory.profiler.filter;
}

function wrapFunction(name, originalFunction)
{
    return function wrappedFunction()
    {
        debugger;
        if (Profiler.isProfiling())
        {
            const nameMatchesFilter = name === getFilter();
            const start = Game.cpu.getUsed();
            if (nameMatchesFilter)
            {
                depth++;
            }
            const result = originalFunction.apply(this, arguments);
            if (depth > 0 || !getFilter())
            {
                const end = Game.cpu.getUsed();
                Profiler.record(name, end - start);
            }
            if (nameMatchesFilter)
            {
                depth--;
            }
            return result;
        }

        return originalFunction.apply(this, arguments);
    };
}

function hookUpPrototypes()
{
    Profiler.prototypes.forEach(proto =>
    {
        profileObjectInheritance(proto.val, proto.name);
    });
}

function profileObjectInheritance(object, label)
{
    console.log('[' + label + ']');

    let count = 0;
    while(object != null && object != Object)
    {
        if (_.includes(Object.getOwnPropertySymbols(object), profilingSymbol))
        {
            console.log('    ##########################################');
            break;
        }

        if (count > 0)
        {
            console.log('    ------------------------------------------');
        }

        profileObject(object, label);
        object[profilingSymbol] = 'profiling';
        object = Object.getPrototypeOf(object);
        count++;
    }
}

function profileObject(object, label)
{
    let skipMembers = [
        "valueOf",
        "propertyIsEnumerable",
        "hasOwnProperty",
        "caller",
        "arguments",
        "apply",
        "call",
        "bind",
        "toLocaleString",
        "toString",
        "isPrototypeOf",
        "prototype",
        "__defineGetter__",
        "__defineSetter__",
        "__lookupGetter__",
        "__lookupSetter__",
        "__proto__",
        "constructor",
        "getUsed",
        "length",
        "toJSON",
    ];

    let propertyNames = Object.getOwnPropertyNames(object);

    for (let index = 0; index < propertyNames.length; index++)
    {
        let key = propertyNames[index];

        if (_.includes(skipMembers, key))
        {
            continue;
        }

        let descriptor = Object.getOwnPropertyDescriptor(object, key);
        let extendedLabel = `${label}.${key}`;
        let progressLog = `    ${label}.${key}: `;

        if (!descriptor.configurable)
        {
            console.log(progressLog + ' NON-CONFIGURABLE');
            continue;
        }

        let newDescriptor: PropertyDescriptor =
            {
                enumerable: descriptor.enumerable,
                configurable: false
            };

        if (typeof descriptor.value === 'function')
        {
            const originalFunction = object[key];
            object[key] = wrapFunction(key, originalFunction);

            console.log(progressLog + 'FUNC VALUE DONE');
            continue;
        }

        if (descriptor.get != null)
        {
            progressLog += 'GET ';

            newDescriptor.get = function()
            {
                //console.log('Calling GET ' + label + '.' + key);
                if (Profiler.isProfiling())
                {
                    const nameMatchesFilter = extendedLabel === getFilter();
                    const start = Game.cpu.getUsed();
                    if (nameMatchesFilter)
                    {
                        depth++;
                    }
                    const result = descriptor.get.apply(this);
                    if (depth > 0 || !getFilter())
                    {
                        const end = Game.cpu.getUsed();
                        Profiler.record(extendedLabel, end - start);
                    }
                    if (nameMatchesFilter)
                    {
                        depth--;
                    }
                    return result;
                }

                return descriptor.get.apply(this);
            };
        }

        if (descriptor.set != null)
        {
            progressLog += 'SET ';

            newDescriptor.set = function (value)
            {
                //console.log('Calling SET ' + label + '.' + key);
                if (Profiler.isProfiling())
                {
                    const nameMatchesFilter = extendedLabel === getFilter();
                    const start = Game.cpu.getUsed();
                    if (nameMatchesFilter)
                    {
                        depth++;
                    }
                    descriptor.set.apply(this, value);
                    if (depth > 0 || !getFilter())
                    {
                        const end = Game.cpu.getUsed();
                        Profiler.record(extendedLabel, end - start);
                    }
                    if (nameMatchesFilter)
                    {
                        depth--;
                    }
                    return;
                }

                descriptor.set.apply(this, value);
            };
        }

        if (newDescriptor.get == null && newDescriptor.set == null && newDescriptor.value == null)
        {
            console.log(progressLog + 'SKIPPED');
        }
        else
        {
            Object.defineProperty(object, key, newDescriptor);
            console.log(progressLog + 'DONE');
        }
    }
}

function profileFunction(fn, functionName)
{
    const fnName = functionName || fn.name;
    if (!fnName)
    {
        console.log('Couldn\'t find a function name for - ', fn);
        console.log('Will not profile this function.');
        return fn;
    }

    return wrapFunction(fnName, fn);
}

const Profiler = {
    printProfile() {
        console.log(Profiler.output());
    },

    emailProfile() {
        Game.notify(Profiler.output());
    },

    output() {
        const elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
        const header = 'calls\t\ttime\t\tavg\t\ttickAvg\t\tfunction';
        const footer = [
            `Avg: ${(Memory.profiler.totalTime / elapsedTicks).toFixed(2)}`,
            `Total: ${Memory.profiler.totalTime.toFixed(2)}`,
            `Ticks: ${elapsedTicks}`,
        ].join('\t');
        return ([] as string[]).concat(header, Profiler.lines(elapsedTicks).slice(0, 30), footer).join('\n');
    },

    lines(elapsedTicks: number) {
        const stats = Object.keys(Memory.profiler.map).map(functionName =>
        {
            const functionCalls = Memory.profiler.map[functionName];
            return {
                name: functionName,
                calls: functionCalls.calls,
                totalTime: functionCalls.time,
                averageTime: functionCalls.time / functionCalls.calls,
                averageTick: (functionCalls.time / functionCalls.calls) * (functionCalls.calls / elapsedTicks),
            };
        }).sort((val1, val2) =>
        {
            return val2.averageTick - val1.averageTick;
        });

        const lines = stats.map(data =>
        {
            return [
                data.calls,
                data.totalTime.toFixed(1),
                data.averageTime.toFixed(3),
                data.averageTick.toFixed(3),
                data.name,
            ].join('\t\t');
        });

        return lines;
    },

    prototypes: [
        {name: 'Game', val: Game},
        {name: 'Room', val: Room.prototype},
        //{name: 'Structure', val: Structure.prototype},
        //{name: 'Spawn', val: Spawn.prototype},
        //{name: 'Creep', val: Creep.prototype},
        //{name: 'RoomPosition', val: RoomPosition.prototype},
        //{name: 'Source', val: Source.prototype},
        //{name: 'Flag', val: Flag.prototype},
    ],

    record(functionName, time) {
        if (!Memory.profiler.map[functionName])
        {
            Memory.profiler.map[functionName] = {
                time: 0,
                calls: 0,
            };
        }
        Memory.profiler.map[functionName].calls++;
        Memory.profiler.map[functionName].time += time;
    },

    endTick() {
        if (Game.time >= Memory.profiler.enabledTick)
        {
            const cpuUsed = Game.cpu.getUsed();
            Memory.profiler.totalTime += cpuUsed;
            Profiler.report();
        }
    },

    report() {
        if (Profiler.shouldPrint())
        {
            Profiler.printProfile();
        } else if (Profiler.shouldEmail())
        {
            Profiler.emailProfile();
        }
    },

    isProfiling() {
        return enabled && !!Memory.profiler && Game.time <= Memory.profiler.disableTick;
    },

    type() {
        return Memory.profiler.type;
    },

    shouldPrint() {
        const streaming = Profiler.type() === 'stream';
        const profiling = Profiler.type() === 'profile';
        const onEndingTick = Memory.profiler.disableTick === Game.time;
        return streaming || (profiling && onEndingTick);
    },

    shouldEmail() {
        return Profiler.type() === 'email' && Memory.profiler.disableTick === Game.time;
    },
};

export let profiler = {
    wrap(callback) {
        if (enabled)
        {
            setupProfiler();
        }

        if (Profiler.isProfiling())
        {
            usedOnStart = Game.cpu.getUsed();

            // Commented lines are part of an on going experiment to keep the profiler
            // performant, and measure certain types of overhead.

            // var callbackStart = Game.cpu.getUsed();
            const returnVal = callback();
            // var callbackEnd = Game.cpu.getUsed();
            Profiler.endTick();
            // var end = Game.cpu.getUsed();

            // var profilerTime = (end - start) - (callbackEnd - callbackStart);
            // var callbackTime = callbackEnd - callbackStart;
            // var unaccounted = end - profilerTime - callbackTime;
            // console.log('total-', end, 'profiler-', profilerTime, 'callbacktime-',
            // callbackTime, 'start-', start, 'unaccounted', unaccounted);
            return returnVal;
        }

        return callback();
    },

    enable() {
        enabled = true;
        hookUpPrototypes();
    },

    registerObject(object, label) {
        return profileObjectInheritance(object, label);
    },

    registerFN(fn, functionName) {
        return profileFunction(fn, functionName);
    },
};