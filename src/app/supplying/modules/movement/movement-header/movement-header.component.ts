import { Component, OnInit, Input } from '@angular/core';
import { Movement } from '../Movement';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants';

@Component({
  selector: 'seis-movement-header',
  templateUrl: './movement-header.component.html',
  styleUrls: ['./movement-header.component.scss']
})
export class MovementHeaderComponent implements OnInit {

  _movement: Movement;
  dispatched: number;
  transit: number;
  requested: number;


  constructor() { }

  @Input()
  set Movement(movement: Movement) {
    this._movement   = movement;   

    console.log(this._movement);

    this.dispatched = this._movement.transactions.filter(x=>x.status==SupplyingConstants.TRANSACTION_STATUS_ACCEPTED).reduce( (a:number,b:any) => { return (a + b.quantity)}, 0 );
    this.transit    = this._movement.transactions.filter(x=>x.status==SupplyingConstants.TRANSACTION_STATUS_TRANSIT).reduce( (a:number,b:any) => { return (a + b.quantity)}, 0 );
    this.requested  = this._movement.detail_article.reduce( (a:number,b:any) => { return (a + b.quantity)}, 0 );

  }

  get Movement(): Movement
  {
    return this._movement;
  }

  ngOnInit() 
  {

  }

}
