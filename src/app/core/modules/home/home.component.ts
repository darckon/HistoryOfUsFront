import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoryService } from '../../services/history/history.service';
import { Graphs } from '../../../shared/classes/Graphs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentProfileData: any = null;
  currentInstitution: string = null;
  escenarios: any;

  isLoading: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private historyService: HistoryService,
    private Graphs: Graphs
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.start_story();
  }

  // Comenzar Historia
  start_story()
  {
    this.historyService.getCurrentStory().subscribe(
      (successData: any) => {
        let data = successData.data[0];
        this.escenarios = data
        this.isLoading = false;
      },
      (errorData) => {
        console.log(errorData)
      },
      () => {

      }
    );
  }
}