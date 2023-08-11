import {Injectable, OnDestroy} from '@angular/core';
import {
    BehaviorSubject, combineLatest,
    distinctUntilChanged,
    map, NEVER,
    ReplaySubject, scan, startWith,
    Subject,
    Subscription,
    timer
} from 'rxjs';
import {GameGrid, MoveDirections, TileState} from '../definitions';
import { switchMap, tap} from 'rxjs/operators';

interface Part {
    x: number, y: number
}

const SPEEDZ = [
    400,
    300,
    200,
    150,
    100,
    90,
    80,
    70
];

const TURBO_SPEED = 50;
const OVERTAKES_PER_LEVEL = 5;

const ALLOWED_CAR_DISTANCES = [9, 10, 11];
const SPAWN_COIN_CHANGE = [true, false, false, false];

@Injectable()
export class GameManagerService implements OnDestroy {
    private _grid: GameGrid = [];
    private _grid$ = new ReplaySubject<GameGrid>(1);
    public grid$ = this._grid$.asObservable();

    private _gameOver$ = new Subject();
    public gameOver$ = this._gameOver$;

    private _carOvertaken$ = new Subject<void>();
    public carOvertaken$ = this._carOvertaken$.asObservable();
    private _carsOvertaken$ = this.carOvertaken$
        .pipe(
            startWith(0),
            scan((acc) => ++acc, 0)
        )

    private _gridSize = {
        h: 20,
        w: 12
    }

    private _player: Array<Part> = [];
    private _walls: Array<number> = []; // Array of Y coords of walls (X are always 0 and width -1)
    private _nextMoveDir: MoveDirections = MoveDirections.RIGHT;
    private _moveDir: MoveDirections = MoveDirections.RIGHT;

    private _movesSinceLastCar = 5;
    private _availableXStartingPositions: Array<number> = [];
    private _cars: Array<Array<Part>> = [];

    private _level$ = this._carsOvertaken$
        .pipe(
            map((co) => (co - co % OVERTAKES_PER_LEVEL ) / OVERTAKES_PER_LEVEL)
        )
    private _turbo$ = new BehaviorSubject(false);
    private _speed$ = combineLatest([
        this._level$,
        this._turbo$.pipe(distinctUntilChanged())
    ]).pipe(
        map(([level, turboOn]) => turboOn ? TURBO_SPEED : SPEEDZ[level]),
    )

    private _paused$ = new BehaviorSubject(true);
    private _signalSub!: Subscription;
    public signal$ = combineLatest([
        this._paused$.pipe(distinctUntilChanged()),
        this._speed$
    ])
        .pipe(
            switchMap(([paused, speed]) => paused ? NEVER : timer(0, speed)),
            tap(() => this._gameCycle()),
        );

    initialize(height: number, width: number) {
        this._gridSize.w = width;
        this._gridSize.h = height;

        for (let x = 2; x < width-2; x++) {
            const right = width-3 - x;
            const left = x - 2;
            if (right >= 3 || left >=3) {
                this._availableXStartingPositions.push(x);
            }
        }

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
        this._paused$.next(false);
    }

    public pause() {
        this._paused$.next(true);
    }

    public reset() {
        this.pause();
        this._turbo$.next(false);

        this._movesSinceLastCar = 0;
        this._moveDir = MoveDirections.RIGHT;
        this._nextMoveDir = this._moveDir;
        this._cars = [];

        this._buildEmptyGrid();
        this._initPlayer();
        this._initWalls();
        this._drawPlayer();
        this._drawWalls();

        this._gridChanged();
    }

    public right() {    this._movePlayer('right') }
    public left() {     this._movePlayer('left') }
    public turboOn() { this._turbo$.next(true) }
    public turboOff() { this._turbo$.next(false) }

    private _endGame() {
        this.pause();

        this._gameOver$.next(null);
    }

    private _buildEmptyGrid() {
        const newGrid = [];
        let id = 0;
        for(let y = 0; y < this._gridSize.h; y++) {
            const row = [];
            for(let x = 0; x < this._gridSize.w; x++) {
                row.push({
                    id,
                    state: TileState.Free
                });
                id++;
            }

            newGrid.push(row);
        }

        this._grid = newGrid;
    }

    private _clearGrid() {
        for(let y = 0; y < this._gridSize.h; y++) {
            for(let x = 0; x < this._gridSize.w; x++) {
                this._grid[y][x].state = TileState.Free;
            }
        }
    }

    private _gridChanged() {
        this._grid$.next(this._grid)
    }

    private _initPlayer() {
        const xCenter = Math.floor(this._gridSize.w / 2);
        const yCenter = Math.floor(this._gridSize.h / 2);
        const yBottom = Math.floor(this._gridSize.h -4);

        this._player = this._createCar(xCenter, yBottom);
    }

    private _initWalls() {
        this._walls = [];
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

    private _moveCars() {
        this._cars = this._cars
            .map((car) => {
                return car.map((part) => {
                    part.y = part.y + 1;

                    return part;
                });
            })
    }

    private _clearOvertakenCars() {
        const carsCount = this._cars.length;

        this._cars = this._cars
            .filter((car) => {
                const head = car[0];

                return head.y < this._gridSize.h
            })

        return carsCount - this._cars.length > 0;
    }

    private _movePlayer(dir: 'left' | 'right' | 'up' | 'down') {
        this._drawPlayer(true);
        const move = ['left', 'up'].includes(dir) ? -1 : 1;
        const axis = ['up', 'down'].includes(dir) ? 'y' : 'x';
        this._player = this._player
            .map((part) => {
                part[axis] = part[axis] + move;
                return part;
            });

        this._drawPlayer();
    }

    private _spawnObject() {
        const newCarCenter = this._spawnCar();

        if (newCarCenter) {

        }
    }

    private _spawnCar()  {
        const distance = ALLOWED_CAR_DISTANCES[
            ALLOWED_CAR_DISTANCES.length * Math.random() | 0
        ];
        if (this._movesSinceLastCar < distance) {
            this._movesSinceLastCar++;
            return null;
        }
        this._movesSinceLastCar = 0;

        const x = this._availableXStartingPositions[
            this._availableXStartingPositions.length * Math.random() | 0
        ];

        const y = -3;
        const newCar = this._createCar(x, y);

        this._cars.unshift(newCar);

        return {x, y};
    }

    private _drawPlayer(clear = false) {
        this._player
            .map((part: Part) => {
                this._grid[part.y][part.x].state = clear ? TileState.Free : TileState.Car;
            })
    }

    private _drawCars() {
        this._cars
            .map((car) => {
                car
                    .filter((part) => part.y >= 0 && part.y <= this._gridSize.h-1)
                    .map((part) => {
                        this._grid[part.y][part.x].state = TileState.OtherCar;
                    })
            })
    }

    private _drawWalls() {
        this._walls
            .filter((y) => y >= 0)
            .map((y) => {
                this._grid[y][0].state = TileState.Wall;
                this._grid[y][this._gridSize.w-1].state = TileState.Wall;
            })
    }

    private _gameCycle() {
        // this._buildEmptyGrid();
        this._clearGrid();

        this._moveWalls();
        this._moveCars();

        const carOvertaken = this._clearOvertakenCars();
        if (carOvertaken) {
            this._carOvertaken$.next();
        }

        this._drawCars();
        this._drawWalls();

        if (this._willCrash()) {
            this._endGame();
        }

        this._drawPlayer();

        this._spawnObject();

        this._gridChanged();
    }

    private _willCrash(): boolean {
        const CRASHABLE_FIELDS: Array<TileState> = [
            TileState.OtherCar,
            TileState.Wall
        ];

        return this._player
            .reduce((acc, part) => {
                return CRASHABLE_FIELDS.includes(this._grid[part.y][part.x].state) || acc;
            }, false)
    }
}
