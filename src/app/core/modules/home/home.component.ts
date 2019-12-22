import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart } from 'chart.js';
import { HomeService } from '../../services/home/home.service';
import { Graphs } from '../../../shared/classes/Graphs';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  currentProfileData: any = null;
  currentInstitution: string = null;
  graphData: any[] = [];
  type_chart: string = null;
  instance_chart: string = null;
  LineChart = []
  LineChart2 = []
  LineChart3 = []


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private homeService: HomeService,
    private Graphs: Graphs
  ) { }

  ngOnInit() {
    
  }

  // Comenzar Historia
  start_story()
  {
    this.homeService.start(this.currentInstitution).subscribe(
      (successData: any) => {
        let data = successData.data;
        data.map(
          (status) => {
            this.graphData.push(data);
            this.type_chart = 'horizontalBar';
            this.instance_chart = 'lineChart2';
            this.LineChart2 = this.Graphs.bar_chart(this.type_chart, this.instance_chart, data[0]);
          }
        );
      },
      (errorData) => {
      },
      () => {

      }
    );
  }
}