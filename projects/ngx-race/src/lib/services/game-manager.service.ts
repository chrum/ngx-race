import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, interval, ReplaySubject, Subject, Subscription} from 'rxjs';
import {GameGrid, MoveDirections, TileState} from '../definitions';
import {filter, switchMap, take, tap} from 'rxjs/operators';

interface Part {
    x: number, y: number
}

const INITIAL_SPEED = 700;

@Injectable()
export class GameManagerService implements OnDestroy {
    private _grid: GameGrid = [];
    private _grid$ = new ReplaySubject<GameGrid>(1);
    public grid$ = this._grid$.asObservable();

    private _gameOver$ = new Subject();
    public gameOver$ = this._gameOver$;

    private _foodEaten$ = new Subject();
    public foodEaten$ = this._foodEaten$;


    private _gridSize = {
        h: 10,
        w: 10
    }

    private _player: Array<Part> = [];
    private _walls: Array<number> = []; // Array of Y coords of walls (X are always 0 and width -1)
    private _nextMoveDir: MoveDirections = MoveDirections.RIGHT;
    private _moveDir: MoveDirections = MoveDirections.RIGHT;

    private _food: Part | null = null;

    private _interval$ = new BehaviorSubject(INITIAL_SPEED);
    private _paused = true;
    private _playable = true;
    private _signalSub!: Subscription;
    public signal$ = this._interval$
        .asObservable()
        .pipe(
            switchMap((period) => interval(period)),
            filter(() => !this._paused),
            tap(() => this._gameCycle()),
        );

    initialize(height: number, width: number) {
        this._gridSize.w = width;
        this._gridSize.h = height;

        this._buildEmptyGrid();
        this._initPlayer();
        this._initWalls();
        this._drawPlayer();
        this._drawWalls();

        this._gridChanged();

        this._signalSub = this.signal$.subscribe();
    }

    ngOnDestroy() {
        if (this._signalSub) {
            this._signalSub.unsubscribe();
        }
    }

    public start() {
        if (this._playable) {
            this._paused = false;
        }
    }

    public changeSpeed(period: number): void {
        this._interval$.next(period);
    }

    public pause() {
        this._paused = true;
    }

    public reset() {
        this.pause();
        this._playable = true;
        this._moveDir = MoveDirections.RIGHT;
        this._nextMoveDir = this._moveDir;
        this._interval$.next(INITIAL_SPEED);

        this._buildEmptyGrid();
        this._initPlayer();
        this._initWalls();
        this._drawPlayer();
        this._drawWalls();

        this._gridChanged();
    }

    public up() {       this._moveDir !== MoveDirections.DOWN   ? this._nextMoveDir = MoveDirections.UP : this._moveDir }
    public right() {    this._movePlayer('right') }
    public down() {     this._moveDir !== MoveDirections.UP     ? this._nextMoveDir = MoveDirections.DOWN : this._moveDir }
    public left() {     this._movePlayer('left') }

    private _endGame() {
        this._playable = false;
        this.pause();

        this._gameOver$.next(null);
    }

    private _buildEmptyGrid() {
        const newGrid = [];
        for(let y = 0; y < this._gridSize.h; y++) {
            const row = [];
            for(let x = 0; x < this._gridSize.w; x++) {
                row.push(TileState.Free);
            }

            newGrid.push(row);
        }

        this._grid =  newGrid;
    }

    private _gridChanged() {
        this._grid$.next(this._grid)
    }

    private _initPlayer() {
        const xCenter = Math.floor(this._gridSize.w / 2);
        const yCenter = Math.floor(this._gridSize.h / 2);

        this._player = this._createCar(xCenter, yCenter);
    }

    private _initWalls() {
        for(let y = 1; y <= this._gridSize.h - 1; y = y + 4) {
            this._walls.push(y);
            this._walls.push(y -1);
        }
    }

    private _createCar(xCenter: number, yCenter: number) {
        const car = [];
        car.push({ x: xCenter, y: yCenter - 1 });
        car.push({ x: xCenter - 1, y: yCenter })
        car.push({ x: xCenter, y: yCenter });
        car.push({ x: xCenter + 1, y: yCenter });
        car.push({ x: xCenter, y: yCenter + 1 });
        car.push({ x: xCenter + 1, y: yCenter + 2 });
        car.push({ x: xCenter - 1, y: yCenter + 2 });

        return car;
    }

    private _moveWalls() {
        this._walls = this._walls
            .map((y) => {
                return ++y;
            })
            .filter((y) => y < this._gridSize.h)
            .sort((a, b) => a - b);

        if (this._walls[0] >= 3 && this._walls[1] > 3) {
            this._walls.unshift(0);
            this._walls.unshift(-1);
        }
    }

    private _movePlayer(dir: 'left' | 'right') {
        this._drawPlayer(true);
        const move = dir === 'left' ? -1 : 1;
        this._player = this._player
            .map((part) => {
                part.x = part.x + move;
                return part;
            });

        this._drawPlayer();
    }

    private _spawnFood() {
        if (!this._food) {
            const eligibleFields = [];
            for(let y = 1; y <= this._gridSize.h - 1; y++) {
                for(let x = 1; x <= this._gridSize.w - 1 ; x++) {
                    if (this._grid[y][x] === TileState.Free) {
                        eligibleFields.push({
                            x, y
                        })
                    }
                }
            }

            const shuffled = eligibleFields.sort((a, b) => 0.5 - Math.random());
            this._food = shuffled[0];

        }

        // this._grid[this._food.y][this._food.x] = TileState.Food;
    }

    private _drawPlayer(clear = false) {
        for(let i = 0; i < this._player.length; i++) {
            const part = this._player[i];
            this._grid[part.y][part.x] = clear ? TileState.Free : TileState.Car;
        }
    }

    private _drawWalls() {
        this._walls
            .filter((y) => y >= 0)
            .map((y) => {
                this._grid[y][0] = TileState.Wall;
                this._grid[y][this._gridSize.w-1] = TileState.Wall;
            })
    }

    private _gameCycle() {
        this._buildEmptyGrid();

        this._moveWalls();

        this._drawPlayer();
        this._drawWalls();
        this._spawnFood();
        this._gridChanged();
    }

    /**
     * Checks if field is not currently occupied (is free to take)
     * @param newHead
     * @private
     */
    private _willCrash(newHead: Part): boolean {
        // Gets out of the board
        if (newHead.x < 0 || newHead.y < 0 || newHead.x > this._gridSize.w || newHead.y > this._gridSize.h) {
            return true;
        }

        const CRASHABLE_FIELDS: Array<TileState> = [
            // TileState.Body,
            TileState.Wall
        ];
        if (CRASHABLE_FIELDS.includes(this._grid[newHead.y][newHead.x])) {
            return true;
        }

        // If crashing with tail then check if tail will move...
        // if (this._grid[newHead.y][newHead.x] === TileState.Tail && this._willGrow(newHead)) {
        //     return true;
        // }

        return false;
    }

    private _willGrow(newHead: Part): boolean {
        if (this._food && this._food.y === newHead.y && this._food.x === newHead.x) {
            return true;
        }
        return false;
    }

    private _increaseSpeed() {
        this._interval$
            .pipe(take(1))
            .subscribe((current) => {
                if (current >= 600) {
                    this._interval$.next(current - 100);

                } else if (current >= 500) {
                    this._interval$.next(current - 30);

                } else if (current >= 400) {
                    this._interval$.next(current - 20);

                } else {
                    this._interval$.next(current - 10);
                }
            })
    }
}
