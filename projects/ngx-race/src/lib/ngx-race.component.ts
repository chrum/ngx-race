import {Component, Input, OnInit, Output} from '@angular/core';
import {GameManagerService} from "./services/game-manager.service";

@Component({
    selector: 'ngx-race',
    template: `
        <ngx-race-board
            [data]="grid$ | async"></ngx-race-board>
    `,
    styles: [],
    providers: [GameManagerService]
})
export class NgxRaceComponent implements OnInit {
    @Input() boardHeight: number = 20;
    @Input() boardWidth: number = 9;

    @Output() foodEaten = this._manager.foodEaten$;
    @Output() gameOver = this._manager.gameOver$;

    public grid$ = this._manager.grid$;

    constructor(
        private _manager: GameManagerService
    ) {
    }

    ngOnInit(): void {
        this._manager.initialize(this.boardHeight, this.boardWidth);
    }

    public actionUp() { this._manager.up(); }
    public actionRight() { this._manager.right(); }
    public actionDown() { this._manager.down(); }
    public actionLeft() { this._manager.left(); }

    public actionStart() {
        this._manager.start();
    }

    public actionStop() {
        this._manager.pause();
    }

    public actionReset() {
        this._manager.reset();
    }

}
