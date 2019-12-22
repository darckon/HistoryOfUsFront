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
import { of, forkJoin } from 'rxjs';
import { ArticlesService } from 'src/app/supplying/services/articles.service';
import { MovementService } from 'src/app/supplying/services/movement.service';

@Component({
  selector: 'app-service-create',
  templateUrl: './service-create.component.html',
  styleUrls: ['./service-create.component.scss']
})
export class ServiceCreateComponent implements OnInit {
  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  serviceFormgroup: FormGroup;
  budgetItem: any[] = [];
  isLoading:boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private moduleManagerService: ModulemanagerService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private articleService: ArticlesService,
    private movementService: MovementService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserData();
    this.currentInstitution = this.authService.getCurrentUserInstitutionId();
    this.currentProfileData = this.authService.getCurrentProfile();

    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/articles/services/create');

    this.serviceFormgroup = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      code: [null, null],
      budget_item: [null, Validators.required],
      is_active: [false, null]
    })

    var tasks$ = [];
    tasks$.push(this.articleService.getBudgetItems());

    forkJoin(...tasks$).subscribe(
    (results: any) => 
    {
      this.budgetItem = results[0].data;
    });
  }

  clearForm() : void{
    this.serviceFormgroup.reset();

  }

  send()
  {
    let formData = this.serviceFormgroup.value;
    this.isLoading = true
    this.movementService.create(formData, this.currentModule).subscribe(
    (result)=>{
      this.snackBar.open("Servicio creado con exito", null, {
        duration: 4000,
      });
      this.isLoading = false
      this.router.navigateByUrl('/supplying/articles/services');
    },
    (error)=>
    {
      this.isLoading = false
      this.snackBar.open(error.error.message.detail, null, {
        duration: 4000,
      });      
      
    });
  }

}
