import { Component, OnInit, Inject, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { switchMap, tap, finalize, debounceTime } from 'rxjs/operators';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService } from '../../../services/movement.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatPaginator } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'
import { forkJoin } from 'rxjs';
import { AgreementService } from 'src/app/supplying/services/agreement.service';

export interface TransferDialogData {
  transferDialogData: any;
}

export interface PurchaseOrderRowElement {
  id: string;
  status: string,
  date: string,
}

export interface DetailArticleRowElement {
  id: string;
  charge: string,
  comment: string,
  discount: string,
  provider_product_code: string,
  quantity: string,
  subtotal: string,
  tax_amount: string,
  unit_value: string,
  article_name: string,
  _type: string,
  _selected: boolean,
  _edited: boolean,
  _target: string,
  _total_recept: number
}

export interface DetailServiceRowElement {
  id: string;
  charge: string,
  name: string,
  discount: string,
  provider_product_code: string,
  quantity: string,
  subtotal: string,
  tax_amount: string,
  unit_value: string,
  _type: string,
  _selected: boolean,
  _edited: boolean,
  _target: string,
}

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent implements OnInit {

  @ViewChildren(MatPaginator) paginator = new QueryList<MatPaginator>();

  currentProfileData: any;
  currentInstitution: string = null;
  currentModule: ModuleInfo = null;
  movement: any = {};
  isLoading: boolean = false;
  code: string;
  document: any = null;
  provider: any = null;

  historicalData:any[] = null;

  detailArticleDataSource = new MatTableDataSource<DetailArticleRowElement>([]);
  detailServiceDataSource = new MatTableDataSource<DetailServiceRowElement>([]);
  detailTransferDataSource = new MatTableDataSource<DetailArticleRowElement>([]);

  detailArticleDisplayedColumns: string[] = [ 'comment', 'charge', 'discount', 'provider_product_code', 'quantity', 'unit_value', 'tax_amount', 'subtotal'];
  detailServiceDisplayedColumns: string[] = ['name', 'charge', 'discount', 'provider_product_code', 'quantity', 'unit_value', 'tax_amount', 'subtotal'];
  detailTransferDisplayedColumns: string[] = ['comment', 'action', 'status'];

  detailTransferFormGroup: FormGroup;
  selectedTransfer: any = null;
  transferAutocompleteLoading: boolean = true;

  transferElementCount: number = 0;
  articleElementCount: number = 0;
  serviceElementCount: number = 0;
  editedTransfersCount: number = 0;
  total_recept: number = 0;
  ocType: string;
  
  withIva: boolean = false;
  transactions: any;
  father_movement_transactions: any;
  canRecept: boolean;
  //Tax OC
  iva_percentage: any = null;
  tax_name: any = null;
  tax: any = null;
  total_oc:any = null;
  charge_oc:any = null;
  discount_oc:any = null;
  //permissions
  priv_canCodificate: ModuleInfo;
  priv_canRecept: ModuleInfo;
  receptValid: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private agreementService: AgreementService,

  ) { }

  displayFn(target?: any): string | undefined {
    return target ? target.name : undefined;
  }


  loadOrderData() {
    this.route.paramMap.subscribe(
      (success: any) => {
        this.code = success.params.code;

        this.movementService.detail(this.currentModule, this.code).subscribe(
          (successData: any) => {

            if (successData.data.count == 1) {
              this.movement = successData.data.results[0];
              this.document = this.movement.document[0].document;
              this.provider = this.movement.document[0].provider;
              this.total_oc = this.document.purchase_amount;
              this.discount_oc = this.document.purchase_discount;
              this.charge_oc = this.document.purchase_charge;

              console.log("===============");
              console.log(this.document);
              console.log("===============");

              this.ocType = this.purchaseOrderIsService();
              this.movement.detail_transfer = (this.movement.detail_transfer as []).filter((x: any) => x.is_processed == false);
              this.transferElementCount = this.movement.detail_transfer.length;
              this.articleElementCount = this.movement.detail_article.length;
              this.serviceElementCount = this.movement.detail_service.length;
              this.iva_percentage = this.document.iva_percentage;

          

              this.paginator.changes.subscribe(
                (c) => {
                  let paginators = c.toArray();
                  let aux = 0;

                  if (this.transferElementCount > 0 && paginators.length > 0) {
                    this.detailTransferDataSource = new MatTableDataSource<DetailArticleRowElement>(this.movement.detail_transfer);
                    this.detailTransferDataSource.paginator = this.paginator.toArray()[aux];
                    aux = aux + 1;
                  }
                  else {
                    this.detailTransferDataSource = null;
                  }

                  if (this.articleElementCount > 0 && (paginators.length - 1) >= aux) {
                    let data: [] = []
                    data = this.totalTransferByItem();
                    console.log('trasnfer')
                    console.log(data)
                    this.detailArticleDataSource = new MatTableDataSource<DetailArticleRowElement>(data);
                    this.detailArticleDataSource.paginator = this.paginator.toArray()[aux];
                    aux = aux + 1;
                  }
                  else {
                    this.detailArticleDataSource = null;
                  }

                  if (this.serviceElementCount > 0 && (paginators.length - 1) >= aux) {
                    this.detailServiceDataSource = new MatTableDataSource<DetailServiceRowElement>(this.movement.detail_service);
                    this.detailServiceDataSource.paginator = this.paginator.toArray()[aux];
                    aux = aux + 1;
                  }
                  else {
                    this.detailServiceDataSource = null;
                  }

                  this.historicalData = this.movement.state_movement_historical;

                }
              );

              this.detailTransferFormGroup = this.fb.group({
                transferRadioButton: null,
                transferTargetInput: null,
                transferTargetRealInput: null
              })

              var tasks$ = [];
              tasks$.push(this.movementService.getOrderDebts(this.movement.id, this.ocType));
              tasks$.push(this.movementService.articleTransactions(this.movement.id));
              tasks$.push(this.movementService.fatherArticleTransactions(this.movement.id));
              tasks$.push(this.agreementService.getTax());

              
              forkJoin(...tasks$).subscribe(
                (results) => {
                  let count = 0
                  let data = results[0].data;
                  this.transactions = results[1].data.results;
                  this.father_movement_transactions = results[2].data.results;
                  this.canRecept = (data.find((x: any) => x.debt != 0) ? true : false) && this.transferElementCount == 0;
                  this.isLoading = false;
                  this.tax = results[3].data.results;
                  this.tax = this.tax.find(x => this.document.tax.id == x.id);
                  this.tax_name = this.tax.name;

                  this.transactions.map(
                    (x:any) => {
                      count = count + x.quantity
                    })
                  this.total_recept = count
                },
                (error)=>
                {
                  this.isLoading = false;
                  this.transactions = null;
                }
              )
            }
          },
          (errorData) => {
            console.error(errorData);
            this.isLoading = false;
          }
        );
      }
    );
  }

  ngOnInit() {

    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    
    //permission
    this.currentModule = this.moduleManagerService.getModuleByInternalUrl("supplying/purchase-orders/detail");
    this.priv_canCodificate = this.moduleManagerService.getModuleByInternalUrl('supplying/massive-coding');
    this.priv_canRecept = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders/recept');

    this.isLoading = true;
    this.loadOrderData();
  }

  openDialog(transferList: any): void {
    const dialogRef = this.dialog.open(DialogTransferDialog, {
      width: '450px',
      data: transferList
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) {
        this.isLoading = true;
        this.editedTransfersCount = 0;
        this.loadOrderData();
        this.snackBar.open("¡Datos guardados con exito!", null, {
          duration: 4000,
        });
      }
    });
  }

  onSelectedTransferOption(target: any) {
    this.selectedTransfer._temporaryTarget = target;
    this.detailTransferFormGroup.controls['transferTargetInput'].setValue(null);
    this.ocType = this.purchaseOrderIsService();
  }

  removeTemporaryTransfer() {
    this.selectedTransfer._temporaryTarget = null;
    this.selectedTransfer._target = null;
    this.selectedTransfer._edited = false;
    this.selectedTransfer._name = null;
    this.detailTransferFormGroup.controls['transferTargetInput'].setValue(null);
    this.ocType = this.purchaseOrderIsService();
  }

  selectTransferForEdition(transfer) {

    this.selectedTransfer = transfer;
    transfer._selected = true;

    this.selectedTransfer._temporaryTarget = null;
    if (this.selectedTransfer._target)
      this.selectedTransfer._temporaryTarget = this.selectedTransfer._target;

    if (this.ocType == "UNDEFINED" || this.ocType == "ARTICLE") {
      this.selectedTransfer._type = "ARTICLE";
    }
    else {
      this.selectedTransfer._type = "SERVICE";
    }

  }

  totalTransferByItem(){
    this.movement.detail_article.map(
      (x:any) => {
        let total = 0
        let total_devolution = 0
        this.transactions.filter((y: any) => y.article.id == x.article_id).map(
          (j: any) => {
            total += j.quantity
          });

        this.father_movement_transactions.filter((z:any) => z.article.id == x.article_id && z.movement_type==SupplyingConstants.MOVEMENT_TYPE_RETURN ).map(
          (l: any) => {
            total_devolution += l.quantity
          });

        x._total_recept = total - total_devolution
        
        return x
      }
    )
    return this.movement.detail_article
  }

  editTransfer() {
    let type = this.detailTransferFormGroup.value.transferRadioButton;
    let target = this.selectedTransfer._temporaryTarget;

    this.selectedTransfer._type = type;
    this.selectedTransfer._edited = true;
    this.selectedTransfer._selected = false;
    this.selectedTransfer._target = target;
    this.selectedTransfer._name = target.name;

    this.detailTransferFormGroup.controls['transferTargetInput'].setValue(null);
    this.selectedTransfer = null;

    this.ocType = this.purchaseOrderIsService();
    this.editedTransfersCount = this.getMarkedForEditionTransfers().length;

  }

  getMarkedForEditionTransfers(): any[] {
    let marked = this.movement.detail_transfer as any[];
    return marked = marked.filter(x => x._edited == true);
  }

  cancelTransfer() {
    this.detailTransferFormGroup.controls['transferTargetInput'].setValue(null);
    this.selectedTransfer = null;
    this.ocType = this.purchaseOrderIsService();
  }

  closeTransferWindow() {
    this.selectedTransfer = null;
  }

  saveAllTransfers() {
    this.openDialog(this.getMarkedForEditionTransfers());
  }

  return() {
    this.router.navigate(['/supplying/purchase-orders']);
  }

  purchaseOrderIsService() {
    let countServices = this.movement.detail_service.length;
    let countArticles = this.movement.detail_article.length;
    if (countServices > 0) {
      return "SERVICE";
    }
    else if (countArticles > 0) {
      return "ARTICLE";
    }

    let marked = this.movement.detail_transfer as any[];
    marked = marked.filter(x => x._edited == true);
    if (marked.length > 0) {
      let findOneService = marked.find(x => x._type == "SERVICE");
      let findOneArticle = marked.find(x => x._type == "ARTICLE");
      if (findOneService)
        return "SERVICE";
      else if (findOneArticle)
        return "ARTICLE";
    }

    return "UNDEFINED";
  }

}


@Component({
  selector: 'transfer-dialog',
  templateUrl: './transfer-dialog.html',
})
export class DialogTransferDialog {

  loading: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<DialogTransferDialog>,
    private purchaseOrderService: MovementService,
    @Inject(MAT_DIALOG_DATA) public data: TransferDialogData) { }

  accept() {
    this.loading = true;
    let finalData = [];
    let transFerArray = this.data as unknown as [];

    transFerArray.map(
      (element: any) => {
        if (element._type == "ARTICLE")
          finalData.push({ id: element.id, movement_id: element.movement, type: 0, item: element._target.id })
        if (element._type == "SERVICE")
          finalData.push({ id: element.id, movement_id: element.movement, type: 1, item: element._target.id })
      }
    );

    this.purchaseOrderService.massiveCodification(finalData).subscribe(
      (sucessData) => {
        console.log("SUCCESS");
        this.dialogRef.close(true);
      },
      (errorData) => {
        console.error("ERROR AL Realizar codificación masiva.")
        this.dialogRef.close(false);
      }
    );

  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
