import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { debounceTime, switchMap, tap } from 'rxjs/operators';
import { OrderService } from 'src/app/supplying/services/order.service';
import { DatePipe } from '@angular/common';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { of } from 'rxjs';

export interface RowElement {
  article: string;
  article_code: string;
  article_name: string;
  quantity: string;
}

@Component({
  selector: 'app-order-new',
  templateUrl: './order-new.component.html',
  styleUrls: ['./order-new.component.scss']
})
export class OrderNewComponent implements OnInit {

  isLoading: boolean = false;
  isLoadingDestinations : boolean = false;

  currentProfileData: any;
  orderFormGroup: FormGroup;
  articleFormGroup: FormGroup;
  articlesFGroup: FormArray;

  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;

  locations: any[] = [];
  costCenters: any[] = []; 
  destinations$: any;
  dataSend: any = {};

  dataSource = new MatTableDataSource<RowElement>([]);
  articleList: any[] = [];

  displayedColumns: string[] = ['article_code', 'article_name', 'quantity', 'actions'];
  today: Date = new Date();
  movementDefaultInfoSet: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private ordersService: OrderService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.currentUser = this.userService.getCurrentUserData();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl("supplying/orders/create");

    this.userService.getUserLocations().map((x: any) => {
      if (x.type.id == SupplyingConstants.ORIGIN_TYPE_CELLAR && x.is_active == true) {
        this.locations.push(x);
      }
    });

    this.userService.getUserCostCenter().map((x: any) => {
      if (x.type.id == SupplyingConstants.ORIGIN_TYPE_COST_CENTER && x.is_active == true) {
        this.costCenters.push(x);
      }
    });

    this.orderFormGroup = this.fb.group({
      origin: [null, Validators.required],
      destination: [null, Validators.required],
      comment: [null, null],
      _origin: [null, Validators.required],
      _destination: [null, Validators.required],
      articles: this.fb.array([]),
    })

    this.articleFormGroup = this.fb.group({
      article: ["", Validators.required],
      quantityInput: ["1", [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
    })

    this.destinations$ = this.orderFormGroup
      .get('origin')
      .valueChanges
      .pipe(
        tap(() => this.isLoadingDestinations = true),
        switchMap((value: string) => 
        {
          if(value!=null)
          {
            this.orderFormGroup.get("_origin").setValue(value);
            this.orderFormGroup.controls['destination'].setValue(this.orderFormGroup.get('_destination').value);
            return this.ordersService.searchDestinations( this.orderFormGroup.value._origin.id, this.orderFormGroup.value._origin.type.id, this.currentInstitution);
          }
          return of([]);
        }),
        tap(() => this.isLoadingDestinations = false),
      );

    this.dataSource = new MatTableDataSource<RowElement>([]);
    this.isLoading = false;

  }


  addArticle() {

    let article = this.articleList.find(x => x.article == this.articleFormGroup.value.article.id);
    if (!article) {
      let quantity = this.articleFormGroup.value.quantityInput;
      this.articleList.push({ article: this.articleFormGroup.value.article.id, article_code: this.articleFormGroup.value.article.code, article_name: this.articleFormGroup.value.article.name, quantity: this.articleFormGroup.value.quantityInput, comment_mov_detail: null });
      this.articleFormGroup.get('article').setValue("");
      this.articleFormGroup.get('quantityInput').setValue("1");
      this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

      let FormGroup = this.fb.group(
        {
          quantity: [{ value: (quantity), disabled: false }, [Validators.min(0), Validators.pattern("^[0-9]*$")]],
        });
      (this.orderFormGroup.get('articles') as FormArray).push(FormGroup);

      if (this.articleList.length == 1) {
        this.orderFormGroup.get('_origin').setValue(this.orderFormGroup.value.origin);
        this.orderFormGroup.get('_destination').setValue(this.orderFormGroup.value.destination);
      }

    }
    else {
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }

    if (this.articleList.length >= 1) {
      this.orderFormGroup.get('origin').disable();
      this.orderFormGroup.get('destination').disable();
      this.movementDefaultInfoSet = true;
    }
    else {
      this.orderFormGroup.get('origin').enable();
      this.orderFormGroup.get('destination').enable();
      this.movementDefaultInfoSet = false;
    }

  }

  removeArticle(ind: number) {

    (this.orderFormGroup.get('articles') as FormArray).removeAt(ind);
    this.articleList.splice(ind, 1);
    this.dataSource = new MatTableDataSource<RowElement>(this.articleList);

    if (this.articleList.length == 0) {
      this.orderFormGroup.get('origin').enable();
      this.orderFormGroup.get('destination').enable();
    }

  }

  send() {

    let items = {}

    // Articles
    items = this.orderFormGroup.value.articles.map(
      (x: any, index) => {
        let article = this.articleList[index];
        article.quantity = x.quantity;
        return article;
      }
    )

    

    if (this.orderFormGroup.value._origin.type == 1) //bodega
    {
      console.log('paseee');
      console.log(this.orderFormGroup.value._origin)
      this.dataSend.movement_type_id = SupplyingConstants.MOVEMENT_TYPE_CELLAR;
      this.dataSend.destination = this.orderFormGroup.value._origin.id;
    }
    else //centro de costo
    {
      this.dataSend.movement_type_id = SupplyingConstants.MOVEMENT_TYPE_COST_CENTER;
      this.dataSend.destination = this.orderFormGroup.value._origin.id;
    }

    this.dataSend.is_service = false;

    this.dataSend.movement_state_id = SupplyingConstants.MOVEMENT_STATE_REQUESTED;
    this.dataSend.user = this.currentUser.id;
    this.dataSend.institution = this.currentInstitution;
    this.dataSend.date = this.datePipe.transform(this.today, 'yyyy-MM-dd HH:mm:ss');
    this.dataSend.state_date = this.datePipe.transform(this.today, 'yyyy-MM-dd HH:mm:ss');
    this.dataSend.comment = this.orderFormGroup.value.comment; // Añadir campo comentario para incluri este dato
    this.dataSend.origin = this.orderFormGroup.value._destination.id;
    this.dataSend.movement_detail = items;
    this.dataSend.correlative = 0;
    
    this.ordersService.create(this.dataSend).subscribe(
      (successData) => {
        this.openDialog(successData);
      },
      (errorData) => {
        this.snackBar.open(errorData.error.message.detail, null, {
          duration: 4000,
        });
      });

    return this.dataSend;

  }

  return() {
    this.router.navigate(['/supplying/orders/']);
  }


  openDialog(data: any): void {
    const dialogRef = this.dialog.open(OrderNewDialog, {
      width: '450px',
      data: data
    });

    dialogRef.afterClosed().subscribe(result => {
      this.snackBar.open("¡Datos guardados con exito!", null, {
        duration: 4000,
      });
      this.router.navigate(['/supplying/orders/detail/' + result.id ]);
    });
  }

  clearForm() : void{
    this.orderFormGroup.reset();

    this.articleList = [];
    this.dataSource = new MatTableDataSource<RowElement>(this.articleList);
    this.orderFormGroup.get('origin').enable();
    this.orderFormGroup.get('destination').enable();
    this.movementDefaultInfoSet = false;
  }

} 

export interface OrderNewDialogData {
  orderId: any;
}

@Component({
  selector: 'order-new-dialog',
  templateUrl: './order-new-dialog.html',
})
export class OrderNewDialog {
  correlative: string;

  constructor(
    public dialogRef: MatDialogRef<OrderNewDialogData>,
    @Inject(MAT_DIALOG_DATA) public data: OrderNewDialog) {
    this.correlative = data.correlative;
  }

  accept() {
    let data: any = this.data.data;
    this.correlative = data.correlative;
    this.correlative = data.id;
    this.dialogRef.close(data);
  }
  
}
