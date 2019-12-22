import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { OrderService } from 'src/app/supplying/services/order.service';
import { DatePipe } from '@angular/common';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { SeisMatPopoverComponent } from 'src/app/core/components/popover/popover.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { SupplyingConstants } from '../../../supplying-constants';
import { Movement } from '../../movement/Movement';

@Component({
  selector: 'seis-movement-dispatch-info',
  templateUrl: './movement-dispatch-info.component.html',
  styleUrls: ['./movement-dispatch-info.component.scss']
})
export class MovementDispatchInfoComponent implements OnInit {

  @Input('id') dispatch_id: string;
  dataLoaded:Boolean = false;
  isLoading:Boolean = true;
  currentProfileData: any;
  currentInstitution: any;

  data:any = null;
  dispatches:any[] = [];
  isAuthorized: boolean;
  canAuthorize:boolean;
  currentUser: any;
  date:Date;

  currentModule: ModuleInfo;
  dispatchModule:ModuleInfo = null;

  @ViewChild('popover', { static: true }) popover: SeisMatPopoverComponent;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private datePipe: DatePipe
  ) { }
  
  ngOnInit() {
    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    


    this.dispatchModule = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/info');
    this.popover.PopOverMenu.onMenuOpen.subscribe(
      (event) =>
      {
        if(this.dataLoaded==false)
        {
          this.Init();
        }
      }
    );


  }

  Init()
  {

    this.movementService.dispatchList(this.dispatchModule, this.dispatch_id).subscribe(
      (successData: any) => {
        console.log(successData);

        this.isLoading = false;
        this.dataLoaded = true;
        
        this.dispatches = successData.data.transaction;
        if(this.dispatches && this.dispatches.length>0)
        {
          this.date = this.dispatches[0].created_at;
        }

      },
      (error) =>
      {
        this.isLoading = false;
        this.dataLoaded = true;        
        console.error(error);
      });
     
  }

}
