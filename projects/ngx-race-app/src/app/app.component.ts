import {Component} from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public bw = false;

    public onGrow() {
        console.log('grow');
    }

    public onGameOver() {
        alert('game over');
    }
}
