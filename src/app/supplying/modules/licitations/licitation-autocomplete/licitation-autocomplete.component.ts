import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ProviderService } from 'src/app/supplying/services/provider.service';
import { finalize, catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { AgreementService } from 'src/app/supplying/services/agreement.service';

@Component({
  selector: 'seis-licitation-autocomplete',
  templateUrl: './licitation-autocomplete.component.html',
  styleUrls: ['./licitation-autocomplete.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LicitationAutocompleteComponent),
      multi: true
    }
  ]      
})
export class LicitationAutocompleteComponent implements OnInit, ControlValueAccessor {

  _licitationName: string;
  formGroup: FormGroup;
  licitationList$: any;
  autocompleteLoading: boolean;
  _target:any    = null;
  _isDisabled:boolean = false;

  @Input('fieldname') fieldname: string = "";
  @Input('placeholder') placeholder: string = "Seleccionar licitación...";


  constructor(
    private fb: FormBuilder,
    private agreementService: AgreementService,) 
  {

  }


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
  @Output() LicitationChange:EventEmitter<any> = new EventEmitter<any>();

  inputsChanged()
  {
    if(this.formGroup)
    {
      this.removeTarget();
    }
    else
    {
      this.formGroup = this.fb.group({
        licitation_text: [null,Validators.required],
      })
    }
   
      this.licitationList$ = this.formGroup
      .get('licitation_text')
      .valueChanges
      .pipe(
        tap(() => this.autocompleteLoading = true),
        debounceTime(400),
        switchMap( (value:string) => 
                    { 
                      this.autocompleteLoading = false;
                      if(value && value.length>=1)
                      {
                        console.log(value);
                        return this.agreementService.searchLicitation(value)
                        .pipe(
                          catchError(err => of([]))
                        );
                      }
                      else
                      {
                        return this.agreementService.getLicitations()
                        .pipe(
                          catchError(err => of([]))
                        );
                      }
                      
                    }
                  ),
        finalize(() => this.autocompleteLoading = false),
        );
      
    
  }

  removeTarget()
  {
    this.targetValue = null;
    this.formGroup.get('licitation_text').setValue("");
    this.licitationList$ = of([]);
    this.formGroup.reset();

    this.licitationList$ = this.formGroup
    .get('licitation_text')
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
                      return this.agreementService.searchLicitation(value)
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

  onSelectedTransferOption(licitation: any)
  {
    this.targetValue = licitation;
    this.LicitationChange.emit(licitation);
  }

  displayFn(target?: any): string | undefined 
  {
    return target ? target.name : undefined;
  }


  writeValue(value: any) {
    this.targetValue = value;
    if(value==null) value = "";
    this.formGroup.get('licitation_text').setValue(value);
  }

  registerOnTouched() {}

  ngOnInit() {
    this.inputsChanged()
  }

  setDisabledState(isDisabled: boolean){
    this._isDisabled = isDisabled;
  }

}
