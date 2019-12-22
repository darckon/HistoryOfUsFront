import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NotificationsService } from 'src/app/core/services/notifications/notifications.service';
import { forkJoin } from 'rxjs';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  types: any;
  users: any;
  groups: any;
  formGroup: FormGroup;
  enable_groups: any = false;
  enable_users: any = false;

  constructor(
    private NotificationsService: NotificationsService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.types = [
      {
        'id': 2,
        'name': 'Usuario'
      },
      {
        'id': 3,
        'name': 'Grupos'
      },
    ];

    //var list_groups$ = this.NotificationsService.

    var tasks$ = [];
    tasks$.push(this.NotificationsService.getGroups())
    tasks$.push(this.NotificationsService.getUsers())

    forkJoin(...tasks$).subscribe(
      (results: any) => {
        this.groups = results[0]
        this.users = results[1].data
      })

    this.formGroup = this.fb.group({
      type: '',
      user: '',
      group: '',
      text: '',
      by_system: false,
      by_email: false,
      by_push: false
    })
  }


  changeType(e: any) {
    let value = e.value;
    if (value == 2) {
      this.enable_users = true;
      this.enable_groups = false;
    } else if (value == 3) {
      this.enable_groups = true
      this.enable_users = false
    }
    else {
      this.enable_groups = false
      this.enable_users = false
    }
  }

  send() {
    let data_id = 0;
    if (this.formGroup.value.type == 2) {
      data_id = this.formGroup.value.user
    }
    else if (this.formGroup.value.type == 3) {
      data_id = this.formGroup.value.group
    }

    let formData = {
      type: this.formGroup.value.type,
      id: data_id,
      text: this.formGroup.value.text,
      by_system: this.formGroup.value.by_system,
      by_email: this.formGroup.value.by_email,
      by_push: this.formGroup.value.by_push
    }

    this.NotificationsService.sendMessage(formData).subscribe(
      (result) => {
        this.snackBar.open("Mensaje enviado con exito", null, {
          duration: 4000,
        });
      },
      (error) => {
        this.snackBar.open("Ha ocurrido un error al enviar.", null, {
          duration: 4000,
        });
      });
  }

}
