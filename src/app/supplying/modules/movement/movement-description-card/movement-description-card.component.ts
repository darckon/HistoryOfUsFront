import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'seis-movement-description-card',
  templateUrl: './movement-description-card.component.html',
  styleUrls: ['./movement-description-card.component.scss']
})
export class MovementDescriptionCardComponent implements OnInit {

  @Input('location-A') location_A: any;
  @Input('location-B') location_B: any;
  @Input('movement')   movement: any;

  constructor() { }

  ngOnInit() {
  }

}
