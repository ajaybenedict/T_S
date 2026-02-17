import {
  Component,
  ViewChild,
  ViewContainerRef,
  AfterViewInit,
  Input,
  SimpleChanges
} from '@angular/core';
import { loadRemoteModule } from '@angular-architects/module-federation';
import { REMOTE_ENTRY_URL } from 'src/app/constants/constants';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements AfterViewInit {
  @ViewChild('paginatorContainer', { read: ViewContainerRef })
  paginatorContainer!: ViewContainerRef;

  @Input() inputData!: {
    page: number;
    pageSize: number;
    total: number;
    pageSizeOption: number[];
  };

  @Input() onPageChange!: (page: number, pageSize: number) => void;

  componentRef: any;

  async ngAfterViewInit() {
    const module = await loadRemoteModule({
      type: 'module',
      remoteEntry: REMOTE_ENTRY_URL,
      exposedModule: './paginator',
    });

    this.componentRef = this.paginatorContainer.createComponent(module.PpcPaginatorComponent);

    // Set initial data
    this.setPaginatorData();

    // Override page change
    this.componentRef.instance.pageChangeEvent = (page: number) => {
      this.inputData.page = page;

      if (this.onPageChange) {
        this.onPageChange(page, this.inputData.pageSize);
      }

      this.componentRef.instance.inputData.page = page;
      this.componentRef.instance.init?.();
      this.componentRef.changeDetectorRef.detectChanges();
    };

    //  Override page size change
    this.componentRef.instance.getItemsPerPage = (event: Event) => {
      const ele = event.target as HTMLElement;
      const newSize = parseInt(ele.innerText);

      this.inputData.pageSize = newSize;
      this.inputData.page = 1;

      if (this.onPageChange) {
        this.onPageChange(1, newSize);
      }

      this.componentRef.instance.inputData.pageSize = newSize;
      this.componentRef.instance.inputData.page = 1;
      this.componentRef.instance.init?.();
      this.componentRef.changeDetectorRef.detectChanges();
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inputData'] && this.componentRef?.instance) {
      this.setPaginatorData();
    }
  }

  getCurrentRange(): number {
    if (this.componentRef?.instance) {
      return this.componentRef.instance.startIndex;
    }
    return 0; 
  }


  private setPaginatorData() {
    if (this.componentRef?.instance && this.inputData) {
      this.componentRef.instance.inputData = { ...this.inputData };
      this.componentRef.instance.init?.();
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }

  updateTotalCount(newTotal: number) {
    if (this.componentRef?.instance) {
      this.componentRef.instance.inputData.total = newTotal;
      this.componentRef.instance.init?.();
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }
}
