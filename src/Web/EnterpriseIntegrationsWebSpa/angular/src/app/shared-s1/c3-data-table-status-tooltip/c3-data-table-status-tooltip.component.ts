import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-c3-data-table-status-tooltip',
  templateUrl: './c3-data-table-status-tooltip.component.html',
  styleUrls: ['./c3-data-table-status-tooltip.component.css']
})
export class C3DataTableStatusTooltipComponent {
  @Input() title!: string;
  @Input() content!: string;
}
