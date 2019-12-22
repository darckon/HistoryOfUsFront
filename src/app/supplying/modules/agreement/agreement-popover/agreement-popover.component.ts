import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { SeisMatPopoverComponent } from 'src/app/core/components/popover/popover.component';
import { AgreementService } from 'src/app/supplying/services/agreement.service';
import { forkJoin } from 'rxjs';
import { MatTableDataSource, PageEvent, MatPaginator } from '@angular/material';

@Component({
  selector: 'seis-agreement-popover',
  templateUrl: './agreement-popover.component.html',
  styleUrls: ['./agreement-popover.component.scss']
})
export class AgreementPopoverComponent implements OnInit {
  @Input('agreement-id') agreement_id: string;
  @Input('code') code: string;

  @Input('bidding-id') bidding_id: number = null;
  @Input('agreement-amount') agreement_amount: number = null;
  @Input('days-end') days_end: number = null;
  @Input('terminated') terminated: boolean = null;

  @Input('text') text: string = null;
  @ViewChild('popover', { static: true }) popover: SeisMatPopoverComponent;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;


  data: any = null;
  currentProfileData: any;
  isLoading: boolean = false;
  detailModule: ModuleInfo;
  agreementData: any = null;
  dataLoaded: boolean = false;
  executionData: any = null;
  typeClass: string = "";
  typeName: string = "";
  fineCreatePrivilege: ModuleInfo = null;
  fineEditPrivilege: ModuleInfo = null;

  dataList: any[] = [];
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['amount', 'fine_state', 'discharge_date', 'resolution_date', 'actions'];
  pageNumber: number = 0;
  dataListLoading: boolean;


  constructor(private movementService: MovementService,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private agreementService: AgreementService, ) { }

  ngOnInit() {
    if (this.days_end >= 180) {
      this.typeClass = "md-chip-icon-default";
      this.typeName = "Quedan " + this.days_end + " dias para la expiración.";
    }
    if (this.days_end < 180 && this.days_end >= 90) {
      this.typeClass = "md-chip-icon-low";
      this.typeName = "Quedan " + this.days_end + " dias para la expiración.";
    }
    if (this.days_end < 90 && this.days_end >= 5) {
      this.typeClass = "md-chip-icon-medium";
      this.typeName = "Quedan " + this.days_end + " dias para la expiración.";
    }
    if (this.days_end < 5 && this.days_end >= 0) {
      this.typeClass = "md-chip-icon-high";
      this.typeName = "Quedan " + this.days_end + " dias para la expiración.";
    }
    if (!this.typeClass) {
      this.typeClass = "md-chip-icon-default";
      this.typeName = "Quedan " + this.days_end + " dias para la expiración.";
    }

    if (this.days_end <0) {
      this.typeClass = "md-chip-icon-anticipated";
      this.typeName = "Terminado";
    }
    
    if (this.terminated) {
      this.typeClass = "md-chip-icon-anticipated";
      this.typeName = "Terminado anticipadamente";
    }


    this.popover.PopOverMenu.onMenuOpen.subscribe(
      (event) => {
        if (this.dataLoaded == false) {
          this.Init();
        }
      }
    );

  }

  Init() {

    if (!this.dataLoaded) {
      this.currentProfileData = this.userService.getCurrentProfile();
      this.detailModule = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/detail');
      this.fineCreatePrivilege = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/create');
      this.fineEditPrivilege = this.moduleManagerService.getModuleByInternalUrl('supplying/agreements/fines/detail');

      this.isLoading = true;

      var tasks$ = [];

      tasks$.push(this.agreementService.detail(this.detailModule, this.agreement_id));
      tasks$.push(this.agreementService.getFines(this.agreement_id));
      if (this.agreement_amount > 0 && this.bidding_id) {
        tasks$.push(this.agreementService.getExecution(this.agreement_id, this.agreement_amount, this.bidding_id));
      }


      forkJoin(...tasks$).subscribe(
        (results: any) => {
          this.agreementData = results[0].data;
          if (this.agreement_amount > 0 && this.bidding_id) {
            this.executionData = results[2].data.results[0];
          }

          this.dataList = results[1].data.results;
          this.dataSource = new MatTableDataSource<any>(this.dataList);
          this.pageNumber = (results[1].data.count).toFixed(0);
          
          if (this.agreementData.anticipated_term) {
            this.typeClass = "md-chip-icon-anticipated";
            this.typeName = "Terminado anticipadamente";
          }

          this.dataListLoading = false;

          this.dataLoaded = true;
        },
        (error) => {
          this.dataLoaded = false;
        },
        () => {
          this.isLoading = false;
        });

    }

  }

  loadPageData(pageEvent: PageEvent) {
    this.loadData();
  }

  loadData() {

    this.dataListLoading = true;
    this.agreementService.getFines(this.agreement_id, (this.paginator.pageIndex + 1)).
      subscribe(
        (dSuccess: any) => {

          this.dataList = dSuccess.data.results;
          this.dataSource = new MatTableDataSource<any>(this.dataList);
          this.pageNumber = (dSuccess.data.count).toFixed(0);
          this.dataListLoading = false;
        },
        (error) => {
          this.dataList = [];
          this.dataSource = new MatTableDataSource<any>(this.dataList);
          this.pageNumber = 0;
          this.dataListLoading = false;
        });
  }

}
