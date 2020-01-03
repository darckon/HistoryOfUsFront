import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoryService } from '../../services/history/history.service';
import { CoreConstants } from "../../core-constants";
import { forkJoin } from 'rxjs';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

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
  options: FormArray;

  optionsList: any[] = [];

  constructor(
    private historyService: HistoryService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar) { }

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

        this.formGroup = this.fb.group({
          options : this.fb.array([this.init()])
        }) 

        forkJoin(...tasks$).subscribe(
          (results: any) => {
            this.historias = results[0].data[0];
            this.preguntas = results[1].data;

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
    return this.fb.group({
      option : ['', [Validators.required]],
    })
  }

  change(e: any){
    let option = this.optionsList.find(x => x.option == e.option.value.id);
    if (!option) {
      this.optionsList.push({ option: e.option.value.id, otro_dato: 'x' });
    }
    else {
      this.optionsList =  this.optionsList.filter(x => x.option != e.option.value.id);
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }
  }

  guardarPerfil(){
    console.log(this.optionsList)
  }

}
