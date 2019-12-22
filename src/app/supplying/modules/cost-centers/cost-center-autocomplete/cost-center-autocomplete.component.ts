import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ProviderService } from 'src/app/supplying/services/provider.service';
import { finalize, catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MovementService } from 'src/app/supplying/services/movement.service';

@Component({
  selector: 'seis-cost-center-autocomplete',
  templateUrl: './cost-center-autocomplete.component.html',
  styleUrls: ['./cost-center-autocomplete.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CostCenterAutocompleteComponent),
      multi: true
    }
  ]      
})
export class CostCenterAutocompleteComponent implements OnInit {

  _costCenterName: string;
  formGroup: FormGroup;
  ccList$: any;
  autocompleteLoading: boolean;
  _target:any    = null;

  @Input('fieldname') fieldname: string = "";
  @Input('placeholder') placeholder: string = "Seleccionar centro de costo...";
  @Input('enabled') enabled: boolean = true;


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
  @Output() CostCenterChange:EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private fb: FormBuilder,
    private movementService: MovementService,) 
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
        cost_center_text: [null,Validators.required],
      })
    }
   
      this.ccList$ = this.formGroup
      .get('cost_center_text')
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
                        return this.movementService.searchCostCenters(value)
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
    this.formGroup.get('cost_center_text').setValue("");
    this.ccList$ = of([]);
    this.formGroup.reset();

    this.ccList$ = this.formGroup
    .get('cost_center_text')
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
                      return this.movementService.searchCostCenters(value)
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
    this.CostCenterChange.emit(article);
  }

  displayFn(target?: any): string | undefined 
  {
    return target ? target.name : undefined;
  }


  writeValue(value: any) {
    this.targetValue = value;
    if(value==null) value = "";
    this.formGroup.get('cost_center_text').setValue(value);
  }

  registerOnTouched() {}

  ngOnInit() {
    this.inputsChanged()
  }


}
