import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { MovementService } from '../../services/movement.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { MatTableDataSource, MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatSnackBar, MatPaginator, PageEvent } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ArticlesService } from '../../services/articles.service';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { MassiveCodificationDialog } from './MassiveCodificationDialog.component';
import { MassiveCodificationTargetsDialog } from './MassiveCodificationTargetDialog';

export interface CodificationEditData {
  edited: boolean;
  set_for_revert: boolean;
}

@Component({
  selector: 'app-massive-codification',
  templateUrl: './massive-codification.component.html',
  styleUrls: ['./massive-codification.component.scss']
})
export class MassiveCodificationComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  currentProfileData: any;
  currentInstitution: string = null;
  currentModule: ModuleInfo = null;
  massiveCodificationModule : ModuleInfo = null;

  currentUser: any;
  isLoading: boolean = false;

  currentFilterData: any = {};
  itemsPerpage: number = 10;
  pageNumber: any;
  pageEvent: any;
  filteredArticles: any;
  page: any;


  detailTransferDataSource = new MatTableDataSource<any>([]);
  detailTransferData: any;
  detailTransferDisplayedColumns: string[] = ['comment','item_name','n_concurrence','status', 'action', ];

  
  selectedTransfer: any = null;
  transferTargets: any;
  transferAutocompleteLoading: boolean = true;
  articlesLoading: boolean = false;

  transferElementCount: number = 0;
  articleElementCount: number = 0;
  serviceElementCount: number = 0;
  editedTransfersCount: number = 0;
  ocType: string;

  selected = '0';
  currentOption:number = 0;

  noData: boolean = false;
  massiveRecodificationModule: ModuleInfo;
  massiveRevertModule: ModuleInfo;

  constructor(
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private movementService: MovementService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  displayFn(target?: any): string | undefined {
    return target ? target.name : undefined;
  }

  ngOnInit() {
    this.currentProfileData = this.userService.getCurrentProfile();
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();

    
    let currentPath = this.router.url.split("/")[1] + '/' + this.router.url.split("/")[2] ;
    this.currentModule = this.moduleManagerService.getModuleByInternalUrl(currentPath);
    this.massiveCodificationModule    = this.moduleManagerService.getModuleByInternalUrl('supplying/massive-codification-button');
    this.massiveRecodificationModule =  this.moduleManagerService.getModuleByInternalUrl('supplying/massive-recodification-button');
    this.massiveRevertModule =  this.moduleManagerService.getModuleByInternalUrl('supplying/massive-revert-button');

    this.detailTransferDataSource.paginator = this.paginator;
    this.paginator.pageIndex = 0; 
    
    this.isLoading = true;
    this.loadTransferData();

  }

  selectedTabChange($event:any)
  {
    this.paginator.pageIndex = 0;
    this.loadTransferData();
    
  }


  loadPageData(pageEvent: PageEvent) {
    this.loadTransferData();
  }

  loadTransferData() 
  {
    this.isLoading = true;
    this.detailTransferData   = [];
    this.editedTransfersCount = 0;
    //

    this.movementService.getListProductPendingCodification(this.currentModule, this.currentInstitution, (this.paginator.pageIndex + 1).toString(), this.currentOption).subscribe(
      (successData: any) => {
        this.detailTransferDataSource = new MatTableDataSource<any>(successData.data.results);
        this.detailTransferData       = successData.data.results;
        this.pageNumber               = (successData.data.count).toFixed(0);

        console.log(this.detailTransferData);

        this.noData = (successData.data.count > 0) ? false : true;

        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.noData = true;
      });
  }


  selectTransferForEdition(transfer) {

    const dialogRef = this.dialog.open(MassiveCodificationTargetsDialog, {
      width: '600px',
      data: {transfer: transfer, currentOption: this.currentOption}
    });

    dialogRef.afterClosed().subscribe(
      (resultTransfer:any) => 
      {  
        this.editedTransfersCount = this.getMarkedForEditionTransfers().length;
      }
    );

  }

  

  getMarkedForEditionTransfers(): any[] {
    let marked = this.detailTransferData as any[];
    return  marked.filter( 
      (x:any) => 
      {
        if(x._editInfo)
        {
          if(x._editInfo.edited==true)
            return true;
          return false;
        }
        return false;
      }    
    );
  }



  articleOrService() {

    let marked = this.detailTransferData as any[];
    marked = marked.filter( 
      (x:any) => 
      {
        if(x._editInfo)
        {
          if(x._editInfo.edited==true)
            return true;
          return false;
        }
        return false;
      }    
    );

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

  closeTransferWindow() {
    this.selectedTransfer = null;
  }

  saveAllTransfers() {
    this.openDialog(this.getMarkedForEditionTransfers());
  }

  clearForm()
  {
    
  }

  openDialog(transferList: any): void {
    let dialogData = { 
                        data: transferList,
                        current_action_option: this.currentOption,  
                        massiveCodificationModule: this.massiveCodificationModule,
                        massiveRecodificationModule : this.massiveRecodificationModule,
                        massiveRevertModule: this.massiveRevertModule

                     }
    const dialogRef = this.dialog.open(MassiveCodificationDialog, {
      width: '450px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == true) 
      {
        this.isLoading = true;
        this.editedTransfersCount = 0;
        this.snackBar.open("La codificación masiva fue realizada con exito!", null, {
          duration: 4000,
        });
        this.loadTransferData();
      }
      else
      {
        this.snackBar.open("¡La codificación masiva no pudo ser realizada con éxito.!", null, {
          duration: 5000,
        });    
        this.loadTransferData();            
      }
    });
  }

}

