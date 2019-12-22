import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {  MatTableDataSource, MatPaginator } from '@angular/material';

@Component({
  selector: 'seis-movement-article-list',
  templateUrl: './movement-article-list.component.html',
  styleUrls: ['./movement-article-list.component.scss']
})
export class MovementArticleListComponent implements OnInit {

  _data: any;
  _showDestination:boolean = false;
  _maxRows:number = 10;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  displayedColumns: string[] = ['article_code','article_name','quantity'];
  dataSource = new MatTableDataSource<any>([]);
  constructor() { }

  @Input()
  set data(data: any[]) {
    this._data                = data;

    this.dataSource           = new MatTableDataSource<any>(this._data);
    this.dataSource.paginator = this.paginator;    
  }

  @Input()
  set MaxRows(rows:number) {
    this._maxRows = rows;  
  }

  @Input()
  set ShowDestination(status: boolean) {
    this._showDestination = status;

    this.dataSource           = new MatTableDataSource<any>(this._data);
    this.dataSource.paginator = this.paginator;    
    this.displayedColumns = ['article_code','article_name','destination','order','quantity'];
  }

  get data(): any[] 
  {
    return this._data;
  }

  ngOnInit() {

  }

}
