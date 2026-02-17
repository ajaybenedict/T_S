import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent implements OnChanges {

  selectedFile: File | null = null;
  
  @Output() fileSelected = new EventEmitter<File | null>();
  @Output() fileError = new EventEmitter<string | null>();

  @Input() clearFileTrigger!: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearFileTrigger']) {
      this.clearFile();
    }
  }

  private clearFile() {
    this.selectedFile = null;
    this.fileSelected.emit(null);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    this.validateFile(file);
  }

  onFileSelect(event: Event) {    
    const element = event.target as HTMLInputElement;
    const files = element.files;
    if(files && files.length > 0) this.validateFile(files[0]);
    element.value = ''; // // support re-upload of same file.
  }

  validateFile(file?: File) {
    this.fileError.emit(null); // to reset the previous validation errors.
    if (!file){
      this.fileError.emit('No file attached.');
      return;
    } 

    if (file.type !== 'text/csv') {
      this.fileError.emit('Incorrect file type attached.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      this.fileError.emit('Attached file size exceeds 2 MB.');
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  removeFile() {
    this.selectedFile = null;
    this.fileSelected.emit(this.selectedFile);
  }
}
