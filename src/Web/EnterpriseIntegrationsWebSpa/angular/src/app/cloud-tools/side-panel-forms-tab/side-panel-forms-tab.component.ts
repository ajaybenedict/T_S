import { Component, Input } from '@angular/core';
import { FormRow } from 'src/app/models/cloud-tools/cloud-tools.interface';

@Component({
  selector: 'app-side-panel-forms-tab',
  template: `
<ng-container *ngIf="data.length">
    <div class="d-flex flex-column" style="gap: 8px;" *ngFor="let item of data">
        <span class="s1-FW700 s1-C-Charcoal s1-FS14px">{{item.label}}</span>
        <span class="s1-FW400 s1-C-Charcoal s1-FS14px content-holder">{{item.value}}</span>
    </div>
</ng-container>
  `,
  styleUrls: ['./side-panel-forms-tab.component.css'],
})
/** Used only for the Cloud tools - side panel details - form tab */
export class SidePanelFormsTabComponent {
  /** FormRow data being passed from side panel content */
  @Input() data!: FormRow[];
}
