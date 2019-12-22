import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {  MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'seis-movement-record',
  templateUrl: './movement-record.component.html',
  styleUrls: ['./movement-record.component.scss']
})
export class MovementRecordComponent implements OnInit {

  _data: any;
  @Input('display-dispatch') display_dispatch: boolean = true;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  historicaldisplayedColumns: string[] = ['dispatch', 'status', 'user', 'created_at'];
  historicalDataSource = new MatTableDataSource<any>([]);
  constructor() { }

  @Input()
  set data(historicalData: any[]) {
    this._data = historicalData;
    console.log(this._data);
    this.historicalDataSource           = new MatTableDataSource<any>(this._data);
    this.historicalDataSource.paginator = this.paginator;    
  }

  get data(): any[] 
  {
    return this._data;
  }

  ngOnInit() {
    if(this.display_dispatch==false)
    {
      this.historicaldisplayedColumns = this.historicaldisplayedColumns.filter(item => item !== "dispatch");
    }
  }

}
