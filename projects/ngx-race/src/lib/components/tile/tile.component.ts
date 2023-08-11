import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input, OnChanges,
    Renderer2, SimpleChange, SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import {TileState} from '../../definitions';

@Component({
    selector: 'ngx-race-tile',
    template: `<div></div>`,
    styleUrls: ['./tile.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TileComponent implements OnChanges {
    @Input() state!: TileState;

    constructor(
        public el: ElementRef,
        private _renderer: Renderer2
    ) {
    }

    ngOnChanges(changes: SimpleChanges) {
        if (this.state) {
            this._renderer.removeClass(this.el.nativeElement, changes['state'].previousValue);
            this._renderer.addClass(this.el.nativeElement, this.state);
        }

    }

}
