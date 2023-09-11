# ngx-race

Race game as an angular component  
![Race Demo](https://github.com/chrum/ngx-race/blob/master/assets/race.gif)

***ngx-race*** is actually only the ***core of the game***... YOU need to add everything around it (controls, score...)  yourself :)


Check the demo [here](http://chrum.it/pages/ngx-race)

## Using it:
#### Install:
```bash
npm install ngx-race
```

#### Import
```javascript
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {NgxRaceModule} from 'ngx-race';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        NgxRaceModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
```

#### Add/Connect to your fancy control interface
```html
    <ngx-race #game
              (carOvertaken)="grantPoints()"></ngx-race>

<button (click)="game.actionStart()">Start</button>
<button (click)="game.actionStop()">Stop</button>
<button (click)="game.actionReset()">Reset</button>
<button (click)="game.actionTurboOn()">Turbo ON</button>
<button (click)="game.actionLeft()">Left</button>
<button (click)="game.actionRight()">Right</button>
<button (click)="game.actionTurboOff()">Turbo OFF</button>
```

#### Inputs

Name  | Default | Type    | Description
--- |---------|---------| ---
boardHeight | 20      | number  | Board Height
boardWidth | 12      | number | Board Width

#### Outputs

Name  | Description
--- | ---
carOvertaken | Called whenever you safely took over a competitors car
gameOver | :( player was flooded with pieces and didn't make it (remember about reset button)

#### Public methods
- `actionStart`
- `actionStop`
- `actionReset`
- `actionLeft`
- `actionTurboOn`
- `actionRight`
- `actionTurboOff`

which can be used like:
```html
<button (click)="onTurboOnButtonPressed()">Turbo ON</button>
```
```typescript
...
export class RaceContainingComponent {
    @ViewChild(NgxRaceComponent)
    private _race: NgxRaceComponent;

    public onTurboOnButtonPressed() {
        this._race.actionTurboOn();
    }
}
```
OR
```html
<ngx-race #game>
</ngx-race>
<button (click)="game.actionTurboOn()">Turbo ON</button>
```

### Styling

To change colors and tiles (to **black and white** for example) define styles with colors like
```scss
ngx-race {
    ngx-race-tile {
        background: white;
        &.car {
            div {
                background: #000000;
            }
        }
    }
}
```
for full example (and all class names) [go here](https://github.com/chrum/ngx-race/blob/master/projects/ngx-race-app/src/styles.scss)

## Development


Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Authors

[Chrystian Ruminowicz](http://chrum.it)

## Licence

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
