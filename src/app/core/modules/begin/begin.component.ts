import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoryService } from '../../services/history/history.service';
import { CoreConstants } from "../../core-constants";
import { forkJoin } from 'rxjs';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-begin',
  templateUrl: './begin.component.html',
  styleUrls: ['./begin.component.scss']
})
export class BeginComponent implements OnInit {

  isLoading : boolean = false;
  dataLoaded: boolean = false;
  id: string = "";

  historias : any[] = [];
  preguntas : any[] = [];

  formGroup : FormGroup;
  form: FormArray;

  constructor(
    private historyService: HistoryService,
    private route: ActivatedRoute,
    private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.isLoading = true;
    this.chargeData();
  }

  chargeData(){
    
    this.route.paramMap.subscribe(
      (success: any) => {
        this.id = success.params.id;
        var tasks$ = [];

        tasks$.push(this.historyService.getHistorias());
        tasks$.push(this.historyService.getPreguntas(CoreConstants.PREGUNTA_TIPO_PERFIL));

        forkJoin(...tasks$).subscribe(
          (results: any) => {
            this.historias = results[0].data[0];
            this.preguntas = results[1].data;

            this.formGroup = this._formBuilder.group({
              form : this._formBuilder.array([this.init()])
            }) 

            this.isLoading = false;
            this.dataLoaded = true;
          },
          (error) => {
            console.error(error);
          }
        );
      },
      (error) => {
        console.error(error);
        this.isLoading = false;
        this.dataLoaded = false;
      });
      }

  init(){
    return this._formBuilder.group({
      option :new FormControl('', [Validators.required]),
    })
  }

}
