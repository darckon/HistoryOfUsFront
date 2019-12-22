import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'seis-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {

  constructor() { }

  @ViewChild('file', { static: true }) file;
  currentFiles: any[] = [];

  get Files(): File[] {
    return this.currentFiles;
  }

  addFiles() {
    this.file.nativeElement.click();
  }

  async onFilesAdded() {

    const files: { [key: string]: File } = this.file.nativeElement.files;
    for (let key in files) {
      if (!isNaN(parseInt(key))) {

        let fileReader = new FileReader();
        let file: File = files[key];
        fileReader.onload = (e) => {
          let fileData = { name: files[key].name, data: fileReader.result };
          this.currentFiles.push(fileData);
        }
        fileReader.readAsDataURL(file);
        break;
      }

    }
  }

  removeFile(file: any) {
    this.currentFiles.splice(file, 1);
    this.file.nativeElement.value = "";
  }

  ngOnInit() {
  }



}
