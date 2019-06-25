// //
// //
// //
// // Attack  ✊[82c411ff7efad8de8e9f84c3]
// // AttackController ⚔[82c411ff7efad8de8e9f84c3]
// // Build ⛪[82c411ff7efad8de8e9f84c3]
// // ClaimController ♛[82c411ff7efad8de8e9f84c3]
// // Dismantle ☢[82c411ff7efad8de8e9f84c3]
// // Drop ✦[energy|30], ✦[energy], ✦
// // GenerateSafeMode ✨[82c411ff7efad8de8e9f84c3]
// // Harvest ⛏[82c411ff7efad8de8e9f84c3]♺
// // Heal ⛑[82c411ff7efad8de8e9f84c3]
// // PickUp ✋[82c411ff7efad8de8e9f84c3]
// // Pull[82c411ff7efad8de8e9f84c3]
// // RangedAttack ➼[82c411ff7efad8de8e9f84c3]
// // RangedHeal ❥[82c411ff7efad8de8e9f84c3]
// // RangedMassAttack ❉
// // Repair  ⚠[82c411ff7efad8de8e9f84c3]
// // ReserveController ♚[82c411ff7efad8de8e9f84c3]
// // SignController ✍[82c411ff7efad8de8e9f84c3|I love you]
// // Suicide ☹
// // Transfer ⛟[82c411ff7efad8de8e9f84c3|energy|30], ⛟[82c411ff7efad8de8e9f84c3|energy]
// // UpgradeController ♜[82c411ff7efad8de8e9f84c3]
// // Withdraw ☒[82c411ff7efad8de8e9f84c3|energy|30], ☒[82c411ff7efad8de8e9f84c3|energy]
// //
// // Move ✥[11233445]
// //
// //
// //
// //
// // 
// // ✥ᑅ82c411ff7efad8de8e9f84c3ᑀ☒ᑅ82c411ff7efad8de8e9f84c3᎒energyᑀ✥ᑅ66666666667766877666455444ᑀ⚠ᑅ[resource (energy) #7a32f382c0a109da36a46a10]ᑀ

// // [C|82c411ff7efad8de8e9f84c3|E12S45|43|42]
// // [structure (container) #7a32f382c0a109da36a46a10 {43,42,E14S35}], [resource (energy) #7a32f382c0a109da36a46a10]

// // 


// class FakeGameLoop
// {
//     run() {
//         let reader = new ActionStreamReader();
    
//         let actionStreams: ActionStream[] = [];
//         for (let stream of actionStreams) {
//             reader.read(stream);
//         }
    
//     }
// }

// export interface ActionStream {
//     data: string,
//     stakeholders: string[];
    
// }

// export class Action {
//     constructor(public key: ActionKeyConstant, public meta: any[]) { }
// }

// export class 

// export class CreepAttackAction extends Action {
//     constructor(attacker: Creep, target: Ptr<Creep | Structure>) {
//         super(ACTION_CREEP_ATTACK_KEY, [ attacker.id ], [ target ]);
//     }
// }

// export class TowerAttackAction extends Action {
//     constructor(attacker: StructureTower, target: Ptr<Creep>) {
//         super(ACTION_TOWER_ATTACK_KEY, [ attacker.id ], [ target ]);
//     }
// }

// type ActionKeyConstant = 
//     | ACTION_CREEP_ATTACK_KEY;

// type ACTION_CREEP_ATTACK_KEY = '✊'; // \u270A
// declare const ACTION_CREEP_ATTACK_KEY: '✊'; // \u270A

// interface ActionExecutor
// {
//     execute(meta: string[]);
// }

// export class CreepAttackExecutor implements ActionExecutor {
//     execute(owners: Ptr<RoomObject>, meta: any[]) {
//         if (owners.length != 1 || meta.length != 1) {
//             return ERR_INVALID_ARGS;
//         }

//         const target = meta[0] as Ptr<Creep | Structure>;

//         if (target == null || target.instance == null) {
//             return ERR_INVALID_TARGET;
//         }

//         if (owners[0].prototype === StructureTower) {

//         }

//         return owners[0].attack(target.instance);
//     }
// }

// export class ActionStreamReader {

//     private _actions: Record<string, Action>;

//     register(action: Action) {
//         _actions[] = action;
//     }

//     read(stream: ActionStream) : number {

//         return OK;
//     }
// }

// export class ActionStreamWriter {

//     readonly position: number;
//     readonly stream: ActionStream;

//     write(action: Action) {
//         this.stream.data += `${action.key}ᑅ${action.meta}ᑀ`;
//     }
// }