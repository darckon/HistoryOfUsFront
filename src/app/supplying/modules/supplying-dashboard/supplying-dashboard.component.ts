import { Component, OnInit } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-supplying-dashboard',
  templateUrl: './supplying-dashboard.component.html',
  styleUrls: ['./supplying-dashboard.component.scss']
})
export class SupplyingDashboardComponent implements OnInit {

  currentUser: any;
  currentInstitution: any;
  currentModule: ModuleInfo;
  currentProfileData: any;
  previlegies: any[] = [];
  previlegeCategories:any[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {

    this.currentUser        = this.authService.getCurrentUserData();
    this.currentInstitution = this.authService.getCurrentUserInstitutionId();
    this.currentProfileData = this.authService.getCurrentProfile();

    this.previlegies = this.moduleManagerService.MenuPrevilegies;
    console.log(this.previlegies);

    this.previlegies.map(
      (prev:any) =>
      {
        let prevCategory = this.previlegeCategories.find(x=>x.name == prev.module_name);
        if(!prevCategory)
        {
          this.previlegeCategories.push({name:prev.module_name, list: [prev]});
        }
        else
        {
          prevCategory.list.push(prev);
        }
      }
    );
    this.previlegeCategories = this.previlegeCategories.filter((x:any)=>x.name == "supplying");
    console.log(this.previlegeCategories);
    
  }

}
