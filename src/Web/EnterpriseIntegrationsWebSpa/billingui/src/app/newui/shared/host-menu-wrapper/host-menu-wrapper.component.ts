import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';
import { SubMenuItem } from 'src/app/interface/button.interface';
import { SubMenuConfig } from 'src/app/config/sub-menu.config';
import { DataTableService } from 'src/app/services/data-table.service';

@Component({
  selector: 'app-host-menu-wrapper',
  templateUrl: './host-menu-wrapper.component.html'
})
export class HostMenuWrapperComponent implements OnInit{
   @ViewChild('remoteContainer', { read: ViewContainerRef, static: true })
  container!: ViewContainerRef;
  @Output() actionSelected = new EventEmitter<string>();


  constructor(
    private readonly dataTableService: DataTableService
  ) {}

  async ngOnInit(): Promise<void> {
    const { S1MenuComponent } = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './S1MenuComponent',
    });

    const compRef = this.container.createComponent(S1MenuComponent);

    // Subscribe to current tab and load submenu accordingly
    this.dataTableService.tab$.subscribe((tab) => {
      const subMenu: SubMenuItem[] = this.getSubMenuForTab(tab);

      (compRef.instance as any).inputData = {
        hasName: false,
        hasIcon: true,
        iconURL: '/assets/moreOption_horizontal.svg',
        subMenu,
      };

      (compRef.instance as any).actionEmitter.subscribe((action: string) => {
        console.log('Remote menu action:', action);
        this.actionSelected.emit(action);

      });

      compRef.changeDetectorRef.detectChanges();
    });
  }

  getSubMenuForTab(tab: string): SubMenuItem[] {
    return SubMenuConfig[tab] || SubMenuConfig['default'];
  }
}

