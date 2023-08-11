import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {GameGrid} from '../../definitions';

@Component({
    selector: 'ngx-race-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
    @Input() data!: GameGrid | null;

    constructor() {
    }

    ngOnInit(): void {
    }

    getCellId(index : number, cell : any) {
        return index;
    }

    getRowId(index : number, row : any) {
        return index;
    }

}
