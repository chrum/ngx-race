import {Component, ViewChild} from '@angular/core';
import {NgxRaceComponent} from "../../../ngx-race/src/lib/ngx-race.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    @ViewChild('game') game!: NgxRaceComponent;
    public bw = false;

    public shortcuts = [
        {
            key: "up",
            preventDefault: true,
            command: (e: any) => this.game.actionTurboOn()
        },
        {
            key: "left",
            preventDefault: true,
            command: (e: any) => this.game.actionLeft()
        },
        {
            key: "right",
            preventDefault: true,
            command: (e: any) => this.game.actionRight()
        },
        {
            key: "down",
            preventDefault: true,
            command: (e: any) => this.game.actionTurboOff()
        },
    ]

    public onGrow() {
        console.log('grow');
    }

    public onGameOver() {
        alert('game over');
    }
}
