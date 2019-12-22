import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';
import { MovementService } from '../../services/movement.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { forkJoin } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'massive-codification-dialog',
    templateUrl: './massive-codification-target-dialog.html',
    styleUrls: ['./massive-codification.component.scss']
  })
  export class MassiveCodificationTargetsDialog {

    detailTransferFormGroup: FormGroup;
    selectedTransfer:any;
    currentOption:number = 0;
  
    constructor(
    public dialogRef: MatDialogRef<MassiveCodificationTargetsDialog>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) 
    { 
      this.selectedTransfer = data.transfer;
      this.currentOption    = data.currentOption;

      this.detailTransferFormGroup = this.fb.group({
          transferRadioButton: null,
        })
    }

    onNoClick(): void {
      this.selectedTransfer._temporaryTarget = null;
      this.dialogRef.close();
    }
  
    editTransfer() 
    {

      let type = this.selectedTransfer._type;
      let target = this.selectedTransfer._temporaryTarget;
  
      this.selectedTransfer._type = type;
      this.selectedTransfer._editInfo = { edited: true, set_for_revert: (type!='REMOVE')?false:true };
      this.selectedTransfer._selected = false;
      this.selectedTransfer._target = (type!='REMOVE')?target:null;
      this.selectedTransfer._name = (type!='REMOVE')?target.name:this.selectedTransfer.comment;
      this.dialogRef.close(this.selectedTransfer);
    }

    removeTemporaryTransfer() 
    {
      if(this.selectedTransfer)
      {
        this.selectedTransfer._temporaryTarget = null;
        this.selectedTransfer._target = null;
        this.selectedTransfer._editInfo.edited = false;
        this.selectedTransfer._name = null;
      }
    }

    onSelectedTransferOption(target: any) 
    {
      this.selectedTransfer._temporaryTarget = target;
    }

  }
