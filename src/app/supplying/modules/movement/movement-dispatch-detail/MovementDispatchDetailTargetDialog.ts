import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';
import { MovementService } from '../../../services/movement.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormArray, Form } from '@angular/forms';

@Component({
    selector: 'movement-dispatch-detail-target-dialog',
    templateUrl: './movement-dispatch-detail-target-dialog.html',
    styleUrls: ['./movement-dispatch-detail.component.scss']
  })
  export class MovementDispatchDetailTargetDialog {

    detailTransferFormGroup: FormGroup;
    selectedTransfer:any;
    index: FormGroup;
    fatherForm: FormGroup;
    currentOption:number = 0;
  
    constructor(
    public dialogRef: MatDialogRef<MovementDispatchDetailTargetDialog>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) 
    { 
      this.selectedTransfer = data.transfer;
      this.index = data.index;
      this.fatherForm = data.fatherForm;
      this.currentOption    = data.currentOption;

      this.detailTransferFormGroup = this.fb.group({
          new_quantity: [null, [Validators.min(this.selectedTransfer.requested), Validators.required ]],
          new_comment: [null, [Validators.required ]]
        })
    }

    onNoClick(): void {
      this.selectedTransfer._temporaryTarget = null;
      this.dialogRef.close();
    }
  
    editTransfer() 
    {
      console.log(this.detailTransferFormGroup)
      
      let target = this.detailTransferFormGroup.value.new_quantity;
      let comment_target = this.detailTransferFormGroup.value.new_comment;
      let old_quantity = this.selectedTransfer.requested;
      if (target > old_quantity  && comment_target){
        this.selectedTransfer.requested = parseInt(target);
        this.selectedTransfer.debt = parseInt(target);
        this.selectedTransfer.quantity = parseInt(target);
        this.selectedTransfer.current_quantity = parseInt(target);
        this.selectedTransfer.comment = comment_target;
        this.fatherForm.updateValueAndValidity();
        this.dialogRef.close(this.selectedTransfer);
      }
    }
  }
