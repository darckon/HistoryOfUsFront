import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'seis-yesno',
  templateUrl: './yesno.component.html',
  styleUrls: ['./yesno.component.scss']
})
export class YesnoComponent implements OnInit {

  @Input('status') status: boolean;
  @Input('show-text') showTest: boolean = false;
  @Input('text') text: string = "";

  constructor() { }

  ngOnInit() {

  }

}
