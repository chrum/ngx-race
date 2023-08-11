import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NgxRaceModule } from '../../../ngx-race/src/lib/ngx-race.module';
import { KeyboardShortcutsModule } from 'ng-keyboard-shortcuts';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        KeyboardShortcutsModule.forRoot(),
        NgxRaceModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
