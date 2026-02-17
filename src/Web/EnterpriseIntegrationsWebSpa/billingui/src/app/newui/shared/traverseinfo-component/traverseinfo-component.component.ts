import { Component, Input } from '@angular/core';
import { TraverseStateService } from 'src/app/services/traverse-state.service';
import { DataTableService } from 'src/app/services/data-table.service';
import { Button } from 'src/app/interface/button.interface';

@Component({
  selector: 'app-traverseinfo-component',
  templateUrl: './traverseinfo-component.component.html',
  styleUrls: ['./traverseinfo-component.component.css']
})
export class TraverseinfoComponentComponent {
  currentIndex: number | null = null;
  totalRows: number = 0;

  backbutton: Button[] = [{
    key: 'BackToList',
    label: 'Back to List',
    icon: '/cbc/BackToList',
    showLabel: true,
    showIcon: true,
    disabled: false,
    class: 'btn-action'
  }];


  constructor(
    private readonly traverseService: TraverseStateService,
    private readonly dataTableService: DataTableService) { }

  @Input() tableId: string = '';

  ngOnInit() {
    if (!this.tableId) throw new Error('tableId is required for Traverse');

    // Subscribe to current index and total rows
    this.traverseService.currentIndex$(this.tableId)?.subscribe(idx => this.currentIndex = idx);
    this.traverseService.totalRows$(this.tableId)?.subscribe(total => this.totalRows = total);
  }

  next() { this.traverseService.goNext(this.tableId); }
  prev() { this.traverseService.goPrev(this.tableId); }


  backToListAction(key: string) {
    this.dataTableService.setTableExpandable(null); 
  }


}