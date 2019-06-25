export class Economy {
  resources: StoreDefinition = <any>{};
  demand: StoreDefinition = <any>{};
  constructor() {
    for (let name of RESOURCES_ALL) {
      this.resources[name] = 0;
      this.demand[name] = 0;
    }
  }
  countStoreResources(store: StoreDefinition): void {
    for (let prop in store) {
      if (this.resources[prop] == null) {
        this.resources[prop] = 0;
      }
      this.resources[prop] += store[prop];
    }
  }
}
