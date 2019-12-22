import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SeisMatPopoverComponent } from 'src/app/core/components/popover/popover.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { OrderService } from 'src/app/supplying/services/order.service';
import { DatePipe } from '@angular/common';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { SupplyingConstants } from '../../../supplying-constants';
import { Movement } from '../../movement/Movement';

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.scss']
})
export class OrderInfoComponent implements OnInit {

  @Input('id') movementId: string;
  @Input('detailRoute') detailRoute: string;
  @Input('order') order: string;

  @Input('AllowDispatch') allowDispatch: boolean = false;
  @Input('AllowAuthorize') allowAuthorize: boolean = false;

  @ViewChild('popover', { static: true }) popover: SeisMatPopoverComponent;
  dataLoaded:Boolean = false;
  isLoading:Boolean = true;
  currentProfileData: any;
  currentInstitution: any;

  currentModule: ModuleInfo = null;
  dispatchModule:ModuleInfo = null;
  ordersModule: ModuleInfo  = null;

  data:any = null;
  articles:any[] = [];
  isAuthorized: boolean;
  canAuthorize:boolean;
  currentUser: any;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['article_code','article_name','quantity'];
  
  // permissions
  priv_dispatchesDetail: ModuleInfo = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private ordersService: OrderService,
    private movementService: MovementService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe
  ) { }

  ngOnInit() 
  {
    //console.log("***");
    //console.log(this.detailRoute);
    //console.log(this.movementId);

    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    


    this.currentModule  = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/detail');
    this.dispatchModule = this.moduleManagerService.getModuleByInternalUrl('supplying/dispatches/button');
    this.ordersModule   = this.moduleManagerService.getModuleByInternalUrl('supplying/orders/detail');


    this.currentUser          = this.userService.getCurrentUserData();
    this.canAuthorize         = this.userService.getUserCanAuthorize();

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

    this.ordersService.detail(this.currentModule, this.movementId).subscribe(
      (successData: Movement) => {
        //console.log(successData);

        this.data = successData;
        this.isLoading = false;
        this.dataLoaded = true;        

        this.isAuthorized = this.data.is_authorized;
        this.articles = this.data.detail_article;
        this.dataSource = new MatTableDataSource<any>(this.articles);


      },
      (error) =>
      {
        this.isLoading = false;
        this.dataLoaded = false;        
        console.error(error);
      });
     
  }

  authorize()
  {
    let sendData:any = {};
    sendData.is_authorized     = true;
    sendData.authorized_by     = this.currentUser.id;
    sendData.movement_state_id = SupplyingConstants.MOVEMENT_STATE_ORDER_AUTHORIZED;

    this.isAuthorized = true;

    this.ordersService.patch(sendData,this.data.id).subscribe(
      (successData) => {
        this.snackBar.open("¡El pedido fue autorizado!", null, {
          duration: 4000,
        });
        this.allowDispatch = false;
      },
      (errorData) => {
        this.snackBar.open(errorData.error.message.detail, null, {
          duration: 4000,
        });
      });

  }

  dispatch()
  {
    let userId = this.currentUser.id;

    /**
    this.movementService.dispatch(this.dispatchModule,this.data.id, userId).subscribe(
      (successData) => {
        this.snackBar.open("¡El pedido fue despachado!", null, {
          duration: 4000,
        });
      },
      (errorData) => {
        this.snackBar.open(errorData.error.message.detail, null, {
          duration: 4000,
        });
      });
       */
  }

}
