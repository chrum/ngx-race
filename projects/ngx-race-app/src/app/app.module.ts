import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {NgxRaceModule} from '../../../ngx-race/src/lib/ngx-race.module';

@NgModule({
    declarations: [
        AppComponent
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
