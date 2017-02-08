
export class Remember
{
    static forTick(dataPath: string, getter, reset?: boolean)
    {
        return Remember.getData(Remember.tickData, dataPath, getter, reset);
    }

    static forever(dataPath: string, getter, reset?: boolean)
    {
        return Remember.getData(Memory, dataPath, getter, reset);
    }

    static tick(): void
    {
        this.tickData = {};
    }

    private static tickData = {};

    private static getData(obj, dataPath, getter, reset)
    {
        let pathArr = dataPath.split('.');
        let pathNum = pathArr.length;
        for(let idx = 0; idx < pathNum - 1; idx++)
        {
            let member = pathArr[idx];
            obj = obj[member] || (obj[member] = {});
        }
        obj = reset ? (obj[pathArr[pathNum-1]] = getter()) : (obj[pathArr[pathNum-1]] || (obj[pathArr[pathNum-1]] = getter()));
        return obj;
    }
}