import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';
import { PPCNavData } from 'src/app/models/ppc-nav.model';

@Component({
  selector: 'app-ppc-nav-tabs',
  templateUrl: './ppc-nav-tabs.component.html',
  styleUrls: ['./ppc-nav-tabs.component.css']
})
export class PpcNavTabsComponent implements AfterViewInit {
  showNavTab = false;
  @Input() declare tabs: PPCNavData[];   
  @Output() tabChange = new EventEmitter<number>();
  @Input() selectedIndex: number = 0;  
  ngAfterViewInit(): void {
    this.showNavTab = true;
  }
}
