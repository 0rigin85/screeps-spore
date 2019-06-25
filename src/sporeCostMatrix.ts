
export class SporeCostMatrixCache
{
    rootNode: CostMatrixNode = new CostMatrixNode('', null);

    findCostMatrix(roomName: string, options: SporeCostMatrixOption[])
    {
        if (options == null || options.length === 0) // use the basic terrain only costs
        {
            return null;
        }

        let room = Game.rooms[roomName];
        let currentNode = this.rootNode;

        for (let option of options)
        {
            let nodeId = `${roomName}:${option.id}`;
            let matchingChild = null;

            if (currentNode.children == null)
            {
                currentNode.children = [];
            }

            for (let node of currentNode.children)
            {
                if (node.id === nodeId)
                {
                    matchingChild = node;
                    break;
                }
            }

            if (matchingChild == null)
            {
                let newCostMatrix = currentNode.value;
                if (newCostMatrix == null)
                {
                    newCostMatrix = new PathFinder.CostMatrix();
                } else {
                    newCostMatrix = currentNode.value.clone();
                }

                let targets: any = option.targets;

                if (targets == null && room != null)
                {
                    targets = room[option.id];

                    if (typeof targets === 'function')
                    {
                        targets = targets();
                    }
                }

                if (targets != null)
                {
                    for (let target of targets)
                    {
                        if (target instanceof RoomPosition)
                        {
                            newCostMatrix.set(target.x, target.y, option.cost);
                        }
                        else
                        {
                            newCostMatrix.set(target.pos.x, target.pos.y, option.cost);
                        }
                    }
                }

                //console.log('//////////// New Cost Matrix: ' + option.id);
                let newChild = new CostMatrixNode(nodeId, newCostMatrix);
                currentNode.children.push(newChild);
                matchingChild = newChild;
            }

            currentNode = matchingChild;
        }

        return currentNode.value;
    }
}

class CostMatrixNode
{
    children: CostMatrixNode[];

    constructor(public id: string, public value: CostMatrix)
    { }
}