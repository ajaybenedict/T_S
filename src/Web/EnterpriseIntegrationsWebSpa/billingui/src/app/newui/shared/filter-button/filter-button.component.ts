import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  EventEmitter,
  Output,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';

@Component({
  selector: 'app-filterbutton',
  templateUrl: './filter-button.component.html',
  styleUrls: ['./filter-button.component.css'],
})
export class FilterButtonComponent implements AfterViewInit, OnChanges {
  @ViewChild('filterbuttonContainer', { read: ViewContainerRef })
  container!: ViewContainerRef;

  @Input() tabCounts: { [key: string]: number } = {};
  @Input() buttonConfigs: any[] = [];

  @Output() buttonClicked = new EventEmitter<string>();
  @Output() clearTab = new EventEmitter<string>();

  private componentRefs: any[] = [];

  async ngAfterViewInit() {
    const module = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './filterButtons',
    });

    const RemoteButton = module.S1FilterButtonsComponent;

    this.buttonConfigs.forEach((config, index) => {
      const compRef = this.container.createComponent(RemoteButton);
      compRef.setInput('input', config);
      compRef.changeDetectorRef.detectChanges();
      this.componentRefs[index] = compRef;

      const instance = compRef.instance as any;

      instance.btnClick?.subscribe(() => {
        this.buttonConfigs.forEach((btn, i) => {
          btn.selected = i === index;
        });
        compRef.setInput('input', this.buttonConfigs[index]);
        compRef.changeDetectorRef.detectChanges();
        this.buttonClicked.emit(config.displayName);
      });

      instance.closeBtnClick?.subscribe(() => {
        config.selectedCount = 0;
        config.hasCloseBtn = false;
        compRef.setInput('input', config);
        compRef.changeDetectorRef.detectChanges();
        this.clearTab.emit(config.displayName);
      });
    });
  }


  ngOnChanges(changes: SimpleChanges): void {

    if (changes['tabCounts']) {
      // Update all buttons
      this.buttonConfigs.forEach((btn, i) => {
        btn.selectedCount = this.tabCounts[btn.displayName] || 0;
        btn.hasCloseBtn = btn.selectedCount > 0;

        if (this.componentRefs[i]) {
          this.componentRefs[i].setInput('input', btn);
          this.componentRefs[i].changeDetectorRef.detectChanges();
        }
      });
    }
  }


}
