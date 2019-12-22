import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ProviderService } from 'src/app/supplying/services/provider.service';
import { finalize, catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'seis-provider-autocomplete',
  templateUrl: './provider-autocomplete.component.html',
  styleUrls: ['./provider-autocomplete.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProviderAutocompleteComponent),
      multi: true
    }
  ]    
})
export class ProviderAutocompleteComponent implements ControlValueAccessor, OnInit  {
  _providerName: string;
  formGroup: FormGroup;
  providerList$: any;
  autocompleteLoading: boolean;
  _target:any    = null;
  _isDisabled:boolean = false;

  @Input('placeholder') placeholder: string = "Seleccionar proveedor...";
  
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
  @Output() ProviderChange:EventEmitter<any> = new EventEmitter<any>();

  constructor(private fb: FormBuilder,
              private providerService: ProviderService) 
  {
 
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
        provider_text: [null,Validators.required],
      })
    }
   
      this.providerList$ = this.formGroup
      .get('provider_text')
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
                        return this.providerService.searchProviders(value)
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
    this.formGroup.get('provider_text').setValue("");
    this.providerList$ = of([]);
    this.formGroup.reset();

    this.providerList$ = this.formGroup
    .get('provider_text')
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
                      return this.providerService.searchProviders(value)
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

  onSelectedTransferOption(article: any)
  {
    this.targetValue = article;
    this.ProviderChange.emit(article);
  }

  displayFn(target?: any): string | undefined 
  {
    return target ? target.name : undefined;
  }


  writeValue(value: any) {
    this.targetValue = value;
    if(value==null) value = "";
    this.formGroup.get('provider_text').setValue(value);
  }

  registerOnTouched() {}

  ngOnInit() {
    this.inputsChanged()
  }

  setDisabledState(isDisabled: boolean){
    this._isDisabled = isDisabled;
  }

}
