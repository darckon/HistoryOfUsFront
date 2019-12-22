import { Component, OnInit, Input } from '@angular/core';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { ModulemanagerService } from 'src/app/core/services/modulemanager/modulemanager.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ArticlesService } from 'src/app/supplying/services/articles.service';

@Component({
  selector: 'app-article-info',
  templateUrl: './article-info.component.html',
  styleUrls: ['./article-info.component.scss']
})
export class ArticleInfoComponent implements OnInit {

  @Input('code') code: string;
  @Input('id') id: number;
  @Input('name') name: string = "";
  @Input('content-mode') contentMode: boolean = false;
  @Input('show-name') showName: boolean = true;

  loaded: boolean = false;
  data: any = null;
  currentProfileData: any;
  articleModule: ModuleInfo;

  constructor(private articleService: ArticlesService,
    private userService: AuthService,
    private moduleManagerService: ModulemanagerService, ) { }

  ngOnInit() {
  }

  handleTooltipEvents(event: string) {

    if (this.loaded == false) {

      this.currentProfileData = this.userService.getCurrentProfile();

      this.articleModule = this.moduleManagerService.getModuleByInternalUrl('supplying/articles/detail');

      if (this.articleModule) {

        
        this.articleService.getDetail(this.articleModule, this.id).subscribe(
          (successData: any) => {
            this.loaded = true;
            this.data = successData.data;
            console.log(successData);
          },
          (error) => {
            this.loaded = true;
            console.error(error);
          }
        )
      }
      else {
        //No tiene previlegios
        this.loaded = true;
      }
    }
  }
}
