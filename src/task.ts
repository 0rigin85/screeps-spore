
export interface Task {
    id: number;

    getSteps(): Task[];
}