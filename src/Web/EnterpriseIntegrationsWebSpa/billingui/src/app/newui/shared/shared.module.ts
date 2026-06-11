import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { SalesOrderDetailsFormatPipe, DateTimeFormatPipe } from 'src/app/pipes/order-details-data-format.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DataModalComponent } from './data-modal/data-modal.component';
import { ActionButtonComponent } from './action-button/action-button.component';
import { SelectionToolbarComponent } from './selection-toolbar/selection-toolbar.component';
import { OrderSecondLevelComponent } from '../order-second-level-component/order-second-level-component.component';
import { TraverseinfoComponentComponent } from './traverseinfo-component/traverseinfo-component.component';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { FilterButtonComponent } from './filter-button/filter-button.component';
import { HostCheckboxComponent } from './host-checkbox/host-checkbox.component';
import { HostMenuWrapperComponent } from './host-menu-wrapper/host-menu-wrapper.component';
import { ManageTablecolumnComponent } from './manage-tablecolumn/manage-tablecolumn.component';
import { ReorderableButtonComponent } from './reorderable-button/reorderable-button.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { InfoTooltipDirective } from 'src/app/shared/directive/info-tooltip.directive';
import { InfoToolTipComponent } from './info-tool-tip/info-tool-tip.component';
import { MultiselectDropdownLabeledComponent } from './multiselect-dropdown-labeled/multiselect-dropdown-labeled.component';
import { ChipComponent } from './chip/chip.component';
import { TableModule } from 'primeng/table';
import { GroupedTableViewTemplateComponent } from './grouped-table-view-template/grouped-table-view-template.component';
import { ExpandedTableViewTemplateComponent } from './expanded-table-view-template/expanded-table-view-template.component';
import { TableProgressBarComponent } from './table-progress-bar/table-progress-bar.component'; 
const modules = [ CommonModule,
    MaterialModule,   
    DragDropModule,
    OverlayModule,
TableModule];
const sharedComponents = [ReorderableButtonComponent, 
  ManageTablecolumnComponent, 
  HostMenuWrapperComponent, 
  FilterButtonComponent, 
  HostCheckboxComponent, 
  OrderSecondLevelComponent, 
  SalesOrderDetailsFormatPipe,
  DateTimeFormatPipe,
  ConfirmDialogComponent, 
  DataModalComponent, 
  ActionButtonComponent, 
  SelectionToolbarComponent, 
  TraverseinfoComponentComponent, 
  SidePanelComponent, 
  InfoTooltipDirective, 
  InfoToolTipComponent, 
  MultiselectDropdownLabeledComponent,
  ChipComponent,
 GroupedTableViewTemplateComponent,
ExpandedTableViewTemplateComponent,
TableProgressBarComponent];
const providers = [SalesOrderDetailsFormatPipe, DateTimeFormatPipe];

@NgModule({
  declarations: [...sharedComponents ],
  imports: [...modules],
  providers: [...providers],
  exports: [...sharedComponents] 
})
export class SharedModule {}