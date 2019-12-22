import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ProviderService } from 'src/app/supplying/services/provider.service';
import { finalize, catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'seis-purchase-order-autocomplete',
  templateUrl: './purchase-order-autocomplete.component.html',
  styleUrls: ['./purchase-order-autocomplete.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PurchaseOrderAutocompleteComponent),
      multi: true
    }
  ]    
})
export class PurchaseOrderAutocompleteComponent implements OnInit {

  _name: string;
  formGroup: FormGroup;
  ocList$: any;
  autocompleteLoading: boolean;
  _target:any    = null;
  _isDisabled:boolean = false;
  ocModule:ModuleInfo;
  currentInstitution: string = null;

  @Input('placeholder') placeholder: string = "Seleccionar oc...";

  get targetValue() {
    return this._target;
  }

  set targetValue(val) {
    this._target = val;
    this.propagateChange(this._target);
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  propagateChange = (_: any) => {};
  @Output() ocChange:EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
              private userService: AuthService,
              private moduleManagerService: ModulemanagerService,
              private ocService: MovementService) 
  {
 
  }



  onSelectedTransferOption(target: any)
  {
    this.targetValue = target;
    this.ocChange.emit(target);
  }

  displayFn(target?: any): string | undefined 
  {
    return target ? target.name : undefined;
  }


  writeValue(value: any) {
    this.targetValue = value;
    if(value==null) value = "";
    this.formGroup.get('text').setValue(value);
  }

  registerOnTouched() {}

  ngOnInit() {
    this.ocModule = this.moduleManagerService.getModuleByInternalUrl('supplying/purchase-orders'); 
    this.currentInstitution   = this.userService.getCurrentUserInstitutionId();


    this.inputsChanged();
  }


  inputsChanged()
  {
    if(this.formGroup)
    {
      this.removeTarget();
    }
    else
    {
      this.formGroup = this.fb.group({
        text: [null,Validators.required],
      })
    }
   
      this.ocList$ = this.formGroup
      .get('text')
      .valueChanges
      .pipe(
        tap(() => this.autocompleteLoading = true),
        debounceTime(400),
        switchMap( (value:string) => 
                    { 
                      this.autocompleteLoading = false;
                      if(value && value.length>=3)
                      {
                        console.log(value);
                        return this.ocService.searchOc(this.currentInstitution, value)
                        .pipe(
                          catchError(err => of([]))
                        );
                        
                      }
                      else
                      {
                        let returnData = { data: { results: [] } }; 
                        return of(returnData);
                      }
                      
                    }
                  ),
        finalize(() => this.autocompleteLoading = false),
        );
      
    
  }


  removeTarget()
  {
    this.targetValue = null;
    this.formGroup.get('text').setValue("");
    this.ocList$ = of([]);
    this.formGroup.reset();

    this.ocList$ = this.formGroup
    .get('text')
    .valueChanges
    .pipe(
      tap(() => this.autocompleteLoading = true),
      debounceTime(400),
      switchMap( (value:string) => 
                  { 
                    this.autocompleteLoading = false;
                    if(value && value.length>=3)
                    {
                      console.log(value);
                      return this.ocService.searchOc(this.currentInstitution, value)
                      .pipe(
                        catchError(err => of([]))
                      );
                      
                    }
                    else
                    {
                      let returnData = { data: { results: [] } }; 
                      return of(returnData);
                    }
                    
                  }
                ),
      finalize(() => this.autocompleteLoading = false),
      );
  }


  setDisabledState(isDisabled: boolean){
    this._isDisabled = isDisabled;
  }

}
