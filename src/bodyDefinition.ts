
export class BodyDefinition
{
    constructor(public name: string)
    {
        this.requirements = [];
    }

    requirements: BodyPartRequirements[];
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
