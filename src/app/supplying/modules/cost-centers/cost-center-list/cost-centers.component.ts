import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, PageEvent, MatTreeNestedDataSource } from '@angular/material';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { TranslateService } from '@ngx-translate/core';
import { FilterSearchDataService } from 'src/app/core/services/general/filter-search-data.service';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { NestedTreeControl } from '@angular/cdk/tree';


@Component({
  selector: 'app-cost-centers',
  templateUrl: './cost-centers.component.html',
  styleUrls: ['./cost-centers.component.scss']
})
export class CostCentersComponent implements OnInit {

  pageEvent: any;
  currentProfileData: any;
  currentInstitution: string = null;
  isLoading: boolean = false;
 
  currentModule: ModuleInfo = null;
  createPrevilege: ModuleInfo = null;

  dataList: any[] = [];

  isLoadingData: boolean = false;
  noData: boolean = false;
  results: any[] = [];
  tree:CostCenterInfo[] = [];

  treeControl = new NestedTreeControl<any>(node => node.children);
  dataSource = new MatTreeNestedDataSource<any>();
  hasChild = (_: number, node: any) => !!node.children && node.children.length > 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService,
    private fb: FormBuilder,
    private movementService: MovementService,
    private filterSearchDataService: FilterSearchDataService,
  ) { }


  ngOnInit() {
    this.currentInstitution = this.userService.getCurrentUserInstitutionId();
    this.currentProfileData = this.userService.getCurrentProfile();


    this.currentModule = this.moduleManagerService.getModuleByInternalUrl('supplying/cost-centers');
    this.createPrevilege = this.moduleManagerService.getModuleByInternalUrl('supplying/cost-centers/create');
    

    this.loadData();

  }


  loadData() {
    this.isLoadingData = true;

    this.movementService.getCostCentersList(this.currentModule, this.currentInstitution).
      subscribe(
        (dSuccess: any) => {

          this.dataList = dSuccess.data;
          

          this.generateTree();
          this.dataSource.data = this.tree;

          this.noData = false;
          this.isLoadingData = false;
        },
        (error) => {
          this.dataList = [];



          this.noData = true;
          this.isLoadingData = false;
        });
  }


  generateTree() {
    
    let data = this.dataList.sort((a,b)=>b-a);
    let tree:CostCenterInfo[] = [];
    let parents  = [];

    //BUSCAR TODAS LAS RAICES E INSERTARLAS
    data.map(
      (costCenter)=>
      {
        if(!costCenter.cost_center)
        {
          tree.push(new CostCenterInfo(costCenter));
          parents.push(costCenter.id);
        }
      }
    )

    parents.map
    (
      (parent) =>
      {
        data.splice( data.findIndex(x=>x.id==parent), 1 );
      }
    )


    while(parents.length > 0)
    {
      let parentId:number = parents.pop();
      do
      {
        let costCenter = data.find(x=>x.cost_center == parentId);
        let parentModeFound:boolean = false;
        if(costCenter)
        { 
          tree.map(
            (node) =>
            {
              let parentNode = node.findInChildrens(parentId);
              if(parentNode)
              {
                parentNode.children.push(new CostCenterInfo(costCenter));
                parents.push(costCenter.id);
                parentModeFound = true;
              }

              if(!parentNode)
              {
                if(node.id == parentId)
                {
                  node.children.push(new CostCenterInfo(costCenter));
                  parentModeFound = true;
                }
              }

            }
          );
          if(parentModeFound==false) 
          {
            console.error("No se encontro padre en árbol para",costCenter);
          }
          data.splice(data.findIndex(x=>x.cost_center == parentId),1);

        }

      }while(data.find(x=>x.cost_center == parentId));
    }
    this.tree = tree; 
  }

}

export class CostCenterInfo
{
  id: number;
  can_associate_recipe: boolean;
  can_request: boolean;
  is_active: boolean;
  name: string;
  perc_name: any;
  children: CostCenterInfo[];

  constructor(costCenterData:any)
  {
    this.id = costCenterData.id;
    this.can_associate_recipe = costCenterData.can_associate_recipe;
    this.can_request = costCenterData.can_request;
    this.is_active = costCenterData.is_active;
    this.name = costCenterData.name;
    this.perc_name = costCenterData.perc_name;
    this.children = [];
  }

  findInChildrens(id:number) : CostCenterInfo
  {

    if(this.id == id)
    {
      return this
    }
    if(this.children.length > 0)
    {
      let aux = null;
      this.children.map(
        (children:CostCenterInfo) =>
        {
          let searchInChildrens = children.findInChildrens(id);
          if(searchInChildrens)
          {
            aux = searchInChildrens;
          }
        }
      )
      return aux;
    }
    return null;
  }


}