import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'seis-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  _progress: number = 0;
  _extra: number = 0;

  constructor() { }

  @Input('progress')
  set progress(value: number) {

    if (value > 100) {
      this._progress = 100;
      this._extra = value - 100;
    }
    else {
      this._progress = value;
      this._extra = 0;
    }

  }

  ngOnInit() {

  }

}
