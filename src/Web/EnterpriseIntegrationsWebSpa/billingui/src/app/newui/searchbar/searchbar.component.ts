import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements AfterViewInit {
  
  @ViewChild('search', { read: ViewContainerRef }) searchVC!: ViewContainerRef;
    
  async ngAfterViewInit() {
    const searchModule = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './searchbar'
    });

    const searchComponentRef = this.searchVC.createComponent(
      searchModule.S1SearchBarComponent
    );

    (searchComponentRef.instance as any).inputData = {
      placeHolder: 'Search for Order Number',
      width: '400px',
      searchText: '',
    };

    searchComponentRef.changeDetectorRef.detectChanges();
  }


}
