import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';

@Component({
  selector: 'app-flatCheckBox',
  templateUrl: './flat-checkbox.component.html',
  styleUrls: ['./flat-checkbox.component.css'],
})
export class FlatCheckBoxComponent implements AfterViewInit, OnChanges {
  @ViewChild('checkboxContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  @Input() CheckboxesValue: any[] = [];
  @Output() CheckboxesChange = new EventEmitter<any[]>();

  private compRef: any;

  async ngAfterViewInit() {
    const module = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './checkbox',
    });

    const RemoteCheckbox = module.S1FlatCheckboxComponent;
    if (!RemoteCheckbox) {
      throw new Error(
        `Remote did not export S1FlatCheckboxComponent. Got: ${Object.keys(module)}`
      );
    }

    this.compRef = this.container.createComponent(RemoteCheckbox);

    // Initial push
    this.updateRemote();

    const instance = this.compRef.instance;

    // Listen to checkbox changes from remote
    instance.checked?.subscribe((selected: any[]) => {
      this.CheckboxesValue = [...selected];
      this.CheckboxesChange.emit(this.CheckboxesValue); 
    });
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes['CheckboxesValue'] && this.compRef) {
      this.updateRemote();
    }
  }

  private updateRemote() {
    this.compRef.setInput('inputData', Array.isArray(this.CheckboxesValue) ? [...this.CheckboxesValue] : []);
    this.compRef.changeDetectorRef.detectChanges();
  }
}
