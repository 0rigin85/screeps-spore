
export class BodyDefinition
{
    constructor(public name: string)
    {
        this.requirements = [];
    }

    requirements: BodyPartRequirements[];

    getPossibleParts(part: string): number
    {
        for (let requirement of this.requirements)
        {
            if (requirement.type === part)
            {
                return requirement.max;
            }
        }

        return 0;
    }
}

export class BodyPartRequirements
{
    constructor(
        public type: string,
        public max: number,
        public min: number,
        public increment: number)
    { }
}
