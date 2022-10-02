export type GameGrid = Array<Array<TileState>>;

export enum GameState {
    Paused = 0,
    Started = 1,
    Over = 2
}

export enum TileState {
    Free = 'free',
    Wall = 'wall',
    Car = 'car',
}

export enum MoveDirections {
    UP,
    RIGHT,
    DOWN,
    LEFT
}
