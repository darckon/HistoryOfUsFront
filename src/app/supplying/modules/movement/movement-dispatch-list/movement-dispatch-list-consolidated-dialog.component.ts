import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';

import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { forkJoin, Observable } from 'rxjs';
import { MovementService } from 'src/app/supplying/services/movement.service';
import { saveAs } from 'file-saver';

@Component({
    selector: 'seis-movement-dispatch-list-consolidated-dialog',
    templateUrl: './movement-dispatch-list-consolidated-dialog.html',
    styleUrls: ['./movement-dispatch-list.component.scss']
  })
  export class MovementDispatchListConsolidatedDialog {
  
    loading: boolean = false;
    currentUser: any;
    
    consolidation: any[] = null;
    consolidationForArticle:any[] = null;

    articleList: any[] = [];
    selectedArticle:any = null;

    detail:any= null;
    $listHander: any;
  movementList: any;
  
    constructor(
      public dialogRef: MatDialogRef<MovementDispatchListConsolidatedDialog>,
      private movementService: MovementService,
      @Inject(MAT_DIALOG_DATA) public data: any) { 

        let sendData = { movements: data };
        this.movementList = data;
        this.loading = true;
        this.$listHander =  this.movementService.getConsolidatedList(sendData).subscribe(
          (resultData:any) =>
          {
            console.log(resultData);
            this.consolidation = resultData.consolidated;
            this.detail = resultData.resume;

            this.articleList = [];
            this.detail.map(
              (articleInfo) =>{
                if( !this.articleList.find((x:any)=>x.article_id == articleInfo.article_id) )
                {
                  this.articleList.push({article_id: articleInfo.article_id, article_name: articleInfo.article_name});
                }
              }
            );

            this.loading = false;
          },
          (error)=>
          {
            console.error(error);
            this.loading = false;
          }
        );

     
      }

    print()
    {
      this.movementService.ExportExcel(this.movementList, this.selectedArticle).subscribe(
        (result:any) => {
          var blob = new Blob([result], {type: 'application/xlsx; charset=utf-8'});
          saveAs(blob, "Report.xlsx");
        });
      return true;
    }

    close() 
    {
      this.$listHander.unsubscribe();
      this.dialogRef.close(true);
    }

    articleSelectChange(event:any)
    {
      let article_id = (this.selectedArticle) ? this.selectedArticle.article_id : null;
      console.log(article_id);
      if(article_id)
      {
        this.consolidationForArticle = this.detail.filter( (x:any) => x.article_id == article_id );
      }
    }
  
  
  }