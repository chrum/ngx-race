export type GameGrid = Array<Array<{ id: number; state: TileState }>>;

export enum GameState {
    Paused = 0,
    Started = 1,
    Over = 2
}

export enum TileState {
    Free = 'free',
    Wall = 'wall',
    Car = 'car',
    OtherCar = 'othercar'
}

export enum MoveDirections {
    UP,
    RIGHT,
    DOWN,
    LEFT
}
