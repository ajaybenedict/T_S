import { Component, Input, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs';
import { MultiSelectButtonConfigs } from 'src/app/config/multi-select-buttons.config';
import { DataTableService } from 'src/app/services/data-table.service';

@Component({
  selector: 'app-selection-toolbar',
  templateUrl: './selection-toolbar.component.html',
  styleUrls: ['./selection-toolbar.component.css']
})
export class SelectionToolbarComponent {
  @Input() selectedCount: number = 0;
  @Input() allSelectedOnPage?: boolean = false;

  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() buttonAction = new EventEmitter<any>();

    buttonConfigs$ = this.datatableservice.tab$.pipe(
  map((tab: string) =>
    MultiSelectButtonConfigs.filter(
      btn => Array.isArray(btn.tab) && btn.tab.includes(tab)
    )
  )
);



 
    constructor(private readonly datatableservice : DataTableService){}

  onToggleSelectAllClick() {
    if (this.allSelectedOnPage) {
      this.deselectAll.emit();

      
    } else {
      this.selectAll.emit();
    }
  }


  onActionClicked(key: string){

    this.buttonAction.emit(key);
  }

 
}
