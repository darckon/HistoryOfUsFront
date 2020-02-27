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

  story : any;
  prologue : any;
  initial_text: any;

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

        tasks$.push(this.historyService.getCurrentStory());
        tasks$.push(this.historyService.getPrologue());
        forkJoin(...tasks$).subscribe(
          (results: any) => {
            this.story = results[0].data[0];
            this.prologue = results[1].data[0];
            
            this.select_story(this.story.id, tasks$);

    
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

  select_story(story, tasks$){
    switch (story) {
      case CoreConstants.GameOfThrones:
        
            this.initial_text = this.byPassSanitize(this.prologue.description);
            this.formGroup = this.fb.group({
              alternatives: this.fb.array([this.init()])
            });



        break;
    
      default:
        break;
    }
  }

  change(e: any, question:any){
    console.log(e)
    this.optionsList = [];
    this.optionsList.push({ alternative_id: e.option.value, question_id: question });
    this.guardarPerfil();
  }

  guardarPerfil(){
    let formData = {
      user: this.currentUser.data.id,
      answers: this.optionsList
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


  byPassSanitize(text){
    text = this.sanitizer.bypassSecurityTrustHtml(text);
    return text
  }

}
