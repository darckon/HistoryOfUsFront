import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Component, Inject } from '@angular/core';
import { MovementService } from '../../../services/movement.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ModuleInfo } from 'src/app/shared/classes/ModuleInfo';
import { forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormArray, Form } from '@angular/forms';

@Component({
    selector: 'movement-dispatch-cancel-dialog',
    templateUrl: './movement-dispatch-detail-cancel-dialog.html',
    styleUrls: ['./movement-dispatch-detail.component.scss']
  })
  export class MovementDispatchCancelDialog {

    detailCancelFormGroup: FormGroup;
    detail:any;
  
    constructor(
    public dialogRef: MatDialogRef<MovementDispatchCancelDialog>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any) 
    { 
      this.detail={};
      this.detailCancelFormGroup = this.fb.group({
          comment: [null, [Validators.required]]
        })
    }

    onNoClick(): void {
      this.detail.valid = false;
      this.dialogRef.close(this.detail);
    }
  
    editTransfer() 
    {
      let comment_target = this.detailCancelFormGroup.value.comment;
      this.detail.comment = comment_target;
      this.detail.valid = false;

      if (comment_target){
        this.detail.valid = true;
        this.dialogRef.close(this.detail);
      }
    }
  }

