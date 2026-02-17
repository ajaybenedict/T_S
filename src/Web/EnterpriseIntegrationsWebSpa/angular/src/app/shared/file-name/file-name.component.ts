import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-file-name',
  templateUrl: './file-name.component.html',
  styleUrls: ['./file-name.component.css']
})
export class FileNameComponent {
    
  @Input('fileName') _fileName: string | null | undefined = '';  
  @Input() declare isDownloadable: boolean;
  @Input() isClosable = false;
  @Output() downloadClicked = new EventEmitter<boolean>();
  @Output() dismissClicked = new EventEmitter<void>();
  @ViewChild('el') declare el: ElementRef<HTMLElement>;

  downloadClick() {
    this.downloadClicked.emit(true);
  }

}
