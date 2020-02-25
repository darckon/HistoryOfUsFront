import { Component, OnInit, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth/auth.service';
import { MovimientosService } from "../../services/movimientos/movimientos.service";
import { ActivatedRoute, Router } from '@angular/router';
import { HistoryService } from '../../services/history/history.service';
import { CoreConstants } from "../../core-constants";
import { forkJoin } from 'rxjs';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { MatSnackBar, MatSelectionList } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-begin',
  templateUrl: './begin.component.html',
  styleUrls: ['./begin.component.scss']
})
export class BeginComponent implements OnInit {

  currentUser: any;
  isLoading : boolean = false;
  dataLoaded: boolean = false;
  id: string = "";

  stories : any[] = [];
  prologo : any[] = [];
  html: any;

  formGroup: FormGroup;
  options: FormArray;

  optionsList: any[] = [];

  @ViewChild('option_list', {static: true}) private names_list: any;

  constructor(
    private historyService: HistoryService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private movementService: MovimientosService,
    private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.isLoading = true;
    this.chargeData();
  }

  chargeData(){
    this.currentUser = this.authService.getCurrentUserData();
    this.route.paramMap.subscribe(
      (success: any) => {
        this.id = success.params.id;
        var tasks$ = [];

        tasks$.push(this.historyService.getHistorias());
        tasks$.push(this.historyService.getPrologo());

        this.formGroup = this.fb.group({
          options: this.fb.array([this.init()])
        })

        forkJoin(...tasks$).subscribe(
          (results: any) => {
            this.stories = results[0].data[0];
            this.html = this.sanitizer.bypassSecurityTrustHtml(this.prologo = results[1].data[0].description);

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

  init() {
    return this.fb.group({
      option: ['', [Validators.required]],
    })
  }

  change(e: any, pregunta:any){
    console.log(this.names_list)
    let option = this.optionsList.find(x => (x.alternativa_id == e.option.value.id));
    if (!option) {
      this.optionsList.push({ alternativa_id: e.option.value.id, pregunta_id: pregunta });
    }
    else {
      console.log(e.option.value.id)
      console.log(pregunta)
      this.optionsList =  this.optionsList.filter(x => x.alternativa_id != e.option.value.id);
      this.snackBar.open("ERROR:" + " El articulo ya está en el listado.", null, {
        duration: 4000,
      });
    }
  }

  guardarPerfil(){
    let formData = {
      usuario: this.currentUser.data.id,
      respuestas: this.optionsList
    };

    this.movementService.create(formData).subscribe(
      (result)=>{
        this.snackBar.open("Perfil creado con éxito", null, {
          duration: 4000,
        });
        //this.router.navigateByUrl('/supplying/cost-centers');
      },
      (error)=>
      {
        this.snackBar.open("Hubo un error al crear el perfil.", null, {
          duration: 4000,
        });      
        console.error(error);
      });
  }

}
