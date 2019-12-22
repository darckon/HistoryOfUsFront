import { Component, OnInit, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ProviderService } from 'src/app/supplying/services/provider.service';
import { finalize, catchError, tap, debounceTime, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { UserService } from 'src/app/core/services/users/user.service';


@Component({
  selector: 'seis-user-autocomplete',
  templateUrl: './user-autocomplete.component.html',
  styleUrls: ['./user-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserAutocompleteComponent),
      multi: true
    }
  ]
})
export class UserAutocompleteComponent implements OnInit, ControlValueAccessor {
  _providerName: string;
  formGroup: FormGroup;
  userList$: any;
  autocompleteLoading: boolean;
  _target: any = null;
  _isDisabled: boolean = false;

  constructor(private fb: FormBuilder,
    private userService: UserService) {

  }


  @Input('fieldname') _fieldname: string = null;
  @Input('placeholder') placeholder: string = "Seleccionar usuario...";


  get fieldname() {
    return this._fieldname;
  }

  set fieldname(val) {
    this._fieldname = val;
    this.propagateChange(this._target);
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

  propagateChange = (_: any) => { };
  @Output() ProviderChange: EventEmitter<any> = new EventEmitter<any>();

  setDisabledState(isDisabled: boolean) {
    this._isDisabled = isDisabled;
  }



  inputsChanged() {
    if (this.formGroup) {
      this.removeTarget();
    }
    else {
      this.formGroup = this.fb.group({
        user_text: [null, Validators.required],
      })
    }

    this.userList$ = this.formGroup
      .get('user_text')
      .valueChanges
      .pipe(
        tap(() => this.autocompleteLoading = true),
        debounceTime(400),
        switchMap((value: string) => {
          this.autocompleteLoading = false;
          if (value && value.length >= 3) {
            return this.userService.search(value)
              .pipe(
                catchError(err => of([]))
              );

          }
          else {
            let returnData = { data: { results: [] } };
            return of(returnData);
          }

        }
        ),
        finalize(() => this.autocompleteLoading = false),
      );


  }


  removeTarget() {
    this.targetValue = null;
    this.formGroup.get('user_text').setValue("");
    this.userList$ = of([]);
    this.formGroup.reset();

    this.userList$ = this.formGroup
      .get('user_text')
      .valueChanges
      .pipe(
        tap(() => this.autocompleteLoading = true),
        debounceTime(400),
        switchMap((value: string) => {
          this.autocompleteLoading = false;
          if (value && value.length >= 3) {
            return this.userService.search(value)
              .pipe(
                catchError(err => of([]))
              );

          }
          else {
            let returnData = { data: { results: [] } };
            return of(returnData);
          }

        }
        ),
        finalize(() => this.autocompleteLoading = false),
      );
  }

  onSelectedTransferOption(article: any) {
    this.targetValue = article;
    this.ProviderChange.emit(article);
  }

  displayFn(target?: any): string | undefined {
    return target ? target.name : undefined;
  }


  writeValue(value: any) {
    this.targetValue = value;
    if (value == null) value = "";
    this.formGroup.get('user_text').setValue(value);
  }

  registerOnTouched() { }

  ngOnInit() {
    this.inputsChanged()
  }

}
