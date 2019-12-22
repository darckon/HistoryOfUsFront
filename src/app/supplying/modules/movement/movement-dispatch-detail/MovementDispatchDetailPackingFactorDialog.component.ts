import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';
import { MovementService } from '../../../services/movement.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'movement-dispatch-detail-packing-factor-dialog',
    templateUrl: './movement-dispatch-detail-packing-factor-dialog.html',
    styleUrls: ['./movement-dispatch-detail.component.scss']
  })
  export class MovementDispatchDetailPackingFactorDialog {
  
    loading: boolean = false;
    currentUser: any;
    dataSent: boolean = false;
    
    constructor(
      public dialogRef: MatDialogRef<MovementDispatchDetailPackingFactorDialog>,
      private movementService: MovementService,
      private userService: AuthService,
      @Inject(MAT_DIALOG_DATA) public data: any) { }
  
    accept() {
      this.loading = true;
      let finalData = [];
     
      
  
      let option = this.data.current_action_option;
  
      this.currentUser = this.userService.getCurrentUserData();
      let masssiveCodModule: ModuleInfo = this.data.massiveCodificationModule;
      let massiveRecodificationModule: ModuleInfo = this.data.massiveRecodificationModule;
      let massiveRevertModule:ModuleInfo = this.data.massiveRevertModule;
  
      //CASO CODIFICACION MASIVA
      switch(option)
      {
        //CODIFICACION MASIVA
        case 0: 
          {
            let transFerArray = (this.data as any).data as [];
            transFerArray.map(
              (element: any) => {
                if (element._type == "ARTICLE")
                  finalData.push({ 
                    comment: element.comment, 
                    type: 1, 
                    item: element._target.id,
                    user: this.currentUser.id
                  });
                if (element._type == "SERVICE")
                  finalData.push({ 
                    comment: element.comment, 
                    type: 0, 
                    item: element._target.id,
                    user: this.currentUser.id
                  });
              }
            );
  
            this.movementService.massiveSystemCodification(masssiveCodModule,finalData).subscribe(
              (sucessData) => {
                console.log("SUCCESS");
                this.dialogRef.close(true);
              },
              (errorData) => {
                console.error("ERROR AL Realizar codificación masiva.")
                this.dialogRef.close(false);
              }
            );
            break;
          }
        case 1:
          {
            let recodificationArray = [];
            let revertArray = [];
            let transFerArray = (this.data as any).data as [];
  
            transFerArray.map(
              (element: any) => {
                if(element._editInfo.set_for_revert==false)
                {
                  if (element._type == "ARTICLE")
                    recodificationArray.push({ 
                      type: 1, 
                      current_item: element.item_id,
                      new_item: element._target.id,
                      user: this.currentUser.id
                    });
                  if (element._type == "SERVICE")
                    recodificationArray.push({ 
                      type: 0, 
                      current_item: element.item_id,
                      item: element._target.id,
                      user: this.currentUser.id
                    });
                }
                else
                {
                  revertArray.push({ 
                    current_item: element.item_id,
                    user: this.currentUser.id,
                    type: element.item_type
                  });
                }
              }
            );
  

            var tasks$ = [];
  
            if(massiveRecodificationModule)
              tasks$.push(this.movementService.massiveRecodification(massiveRecodificationModule,recodificationArray));
            
            if(massiveRevertModule)
              tasks$.push(this.movementService.massiveRevert(massiveRevertModule,revertArray));
            
            console.log(tasks$);
            forkJoin(...tasks$).subscribe(
              (results: any) => 
              {
                console.log(results);
                this.dialogRef.close(true);
              },
              (errors)=>
              {
                console.error("ERROR AL Realizar codificación masiva.")
                this.dialogRef.close(false);
              }
            );
  
            break;
          }
      }
  
     
  
    }
  
    onNoClick(): void {
      this.dialogRef.close();
    }
  
  }