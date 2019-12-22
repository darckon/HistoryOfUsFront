import { Component, Input, forwardRef, ViewChild, OnInit, Output, EventEmitter, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { MatFormField, MatSelect } from '@angular/material';
import { debounceTime, tap, switchMap, catchError, finalize } from 'rxjs/operators';
import { ArticlesService } from 'src/app/supplying/services/articles.service';
import { of } from 'rxjs';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants';

@Component({
  selector: 'supplying-article-autocomplete',
  templateUrl: './article-autocomplete.component.html',
  styleUrls: ['./article-autocomplete.component.scss'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ArticleAutocompleteComponent),
      multi: true
    }
  ]  
})
export class ArticleAutocompleteComponent implements ControlValueAccessor, OnInit {

  @ViewChild(MatFormField, { static: false }) textField: MatFormField;
  
  @Input('placeholder') placeholder: string = "Seleccionar...";


  @Output() ArticleChange:EventEmitter<any> = new EventEmitter<any>();

  articleList:any;
  formGroup: FormGroup;
  _origin:any = null;
  _destination:any = null;
  _locationType:any = null;

  _target:any    = null;
  _institution:string = null;
  _service: boolean = false;

  propagateChange = (_: any) => {};
  transferAutocompleteLoading: boolean;

  @Input('service') 
  set service(serv: boolean) {
    this._service = serv;
    this.inputsChanged();
  }


  get institution(): string 
  {
    return this._institution;
  }
  
  @Input()
  set institution(institution: string) {
    this._institution = institution;
    this.inputsChanged();
  }

  get origin(): any 
  {
    return this._origin;
  }
  
  @Input()
  set origin(origin: any) {
    this._origin = origin;
    console.log(this._origin);
    this.inputsChanged();
  }


  get locationType(): any 
  {
    return this._locationType;
  }
  
  @Input()
  set locationType(mType: any) {
    this._locationType = mType;
    console.log(this._locationType);
    this.inputsChanged();
  }

  get destination(): any 
  {
    return this._destination;
  }
  
  @Input()
  set destination(destination: any) {
    this._destination = destination;
    console.log(this._destination);
    this.inputsChanged();
  }


  get targetValue() {
    return this._target;
  }

  set targetValue(val) {
    this._target = val;
    this.propagateChange(this._target);

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
        article_text: [null,Validators.required],
      })
    }
    
    
  }

  removeTarget()
  {
    this.targetValue = null;
    this.formGroup.get('article_text').setValue("");
    this.articleList = of([]);
    this.formGroup.reset();

    this.articleList = this.formGroup
    .get('article_text')
    .valueChanges
    .pipe(
      tap(() => this.transferAutocompleteLoading = true),
      debounceTime(400),
      switchMap( (value:string) => 
                  { 
                    this.transferAutocompleteLoading = false;
                    if(value && value.length>=4)
                    {
                      let filters = null;
                      
                      if(this.origin && this.institution)
                      {
                        filters = {   
                                    origin: ( this.origin.id == SupplyingConstants.ORIGIN_TYPE_CELLAR ? this.origin.id : this.origin.id), 
                                    destination: (!this._destination)? 0 : ( this._destination.id != SupplyingConstants.ORIGIN_TYPE_CELLAR ? this._destination.id : this._destination.location_id),
                                    type: (this.origin.type.id)? this.origin.type.id : this.origin.type, 
                                    institution: this.institution  }
                      }
                      console.log('asdasdasd')
                      
                      console.log(this._locationType)
                      if(this._locationType == SupplyingConstants.ORIGIN_TYPE_HEALTH_NETWORK)
                      {
                        filters.destination = 0;
                      }

                      let returnService = null;
                      if(this._service == false)
                      {
                        returnService = this.articleService.searchArticles(value,1,filters);
                      }
                      else
                      {
                        returnService = this.movementService.searchServices(value, 1);
                      }

                      return returnService
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
      finalize(() => this.transferAutocompleteLoading = false),
      );
  }

  writeValue(value: any) {
    this.targetValue = value;
    if(value==null) value = "";
    this.formGroup.get('article_text').setValue(value);
  }

  registerOnChange(fn) {
    this.propagateChange = fn;
  }

  registerOnTouched() {}

  displayFn(target?: any): string | undefined 
  {
    return target ? target.name : undefined;
  }

  onSelectedTransferOption(article: any)
  {
    this.targetValue = article;
    this.ArticleChange.emit(article);
  }
  
  ngOnInit(){
    this.formGroup = this.fb.group({
      article_text: [null,Validators.required],
    })
    this.removeTarget();
  }


  constructor(private fb: FormBuilder, 
              private articleService: ArticlesService, 
              private movementService:MovementService) {
  }

}
