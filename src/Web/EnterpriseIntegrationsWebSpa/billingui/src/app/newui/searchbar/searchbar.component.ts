import {
  AfterViewInit,
  Component,
  ViewChild,
  ViewContainerRef,
  Output,
  EventEmitter,
  OnDestroy
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';
import { S1SearchBarComponentInstance } from 'src/app/interface/search-bar-component.interface';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.css']
})
export class SearchbarComponent implements AfterViewInit, OnDestroy {

  @ViewChild('search', { read: ViewContainerRef }) searchVC!: ViewContainerRef;
  @Output() searchValue = new EventEmitter<string>();

  private readonly destroy$ = new Subject<void>();

  async ngAfterViewInit() {
    const searchModule = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './searchbar'
    });

    const searchComponentRef = this.searchVC.createComponent(
      searchModule.S1SearchBarComponent
    );

    const instance = searchComponentRef.instance as S1SearchBarComponentInstance;
    instance.inputData = {
      placeHolder: 'Search for Order Number',
      width: '400px',
      searchText: '',
    };

    instance.outputData
      .pipe(takeUntil(this.destroy$))
      .subscribe((searchValue: string) => {      
        this.searchValue.emit(searchValue);
      });

    searchComponentRef.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
