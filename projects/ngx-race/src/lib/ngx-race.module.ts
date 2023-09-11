import {ModuleWithProviders, NgModule} from '@angular/core';
import {NgxRaceComponent} from './ngx-race.component';
import {BoardComponent} from './components/board/board.component';
import {TileComponent} from './components/tile/tile.component';
import {CommonModule} from '@angular/common';

@NgModule({
    declarations: [
        NgxRaceComponent,
        BoardComponent,
        TileComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        NgxRaceComponent
    ]
})
export class NgxRaceModule {
    static forRoot(): ModuleWithProviders<NgxRaceModule> {
        return {
            ngModule: NgxRaceModule
        };
    }
}
