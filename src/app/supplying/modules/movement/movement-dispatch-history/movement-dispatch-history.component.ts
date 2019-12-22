import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {  MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'seis-movement-dispatch-history',
  templateUrl: './movement-dispatch-history.component.html',
  styleUrls: ['./movement-dispatch-history.component.scss']
})
export class MovementDispatchHistoryComponent implements OnInit {

  _data: any;
  @Input('display-dispatch')   display_dispatch: boolean = true;
  @Input('display-date')       display_date: boolean = true;
  @Input('display-SN')         display_SN: boolean = true;
  @Input('display-expiration') diplay_expiration: boolean = true;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['dispatch','article_code','article_name','batch','SN','quantity','expiration','date','status'];
  dataSource = new MatTableDataSource<any>([]);
  constructor() { }

  @Input()
  set data(data: any[]) {
    this._data                = data;
    this.dataSource           = new MatTableDataSource<any>(this._data);
    this.dataSource.paginator = this.paginator;    

    console.log(data);
  }

  get data(): any[] 
  {
    return this._data;
  }

  ngOnInit() {
    if(this.display_dispatch==false)
    {
      this.displayedColumns = this.displayedColumns.filter(item => item !== "dispatch");
    }
    if(this.display_date==false)
    {
      this.displayedColumns = this.displayedColumns.filter(item => item !== "date");
    }
    if(this.display_SN==false)
    {
      this.displayedColumns = this.displayedColumns.filter(item => item !== "SN");
    }
    if(this.diplay_expiration==false)
    {
      this.displayedColumns = this.displayedColumns.filter(item => item !== "expiration");
    }    

  }
}
