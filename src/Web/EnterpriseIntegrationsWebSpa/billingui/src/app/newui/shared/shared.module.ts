import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from './data-table/data-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { DynamicPipe } from 'src/app/pipes/pipehelper.pipe';
import { OrderDetailsFormatPipe,ResellerDetailFormatPipe, InvoiceIDFormatPipe, CountryFormatPipe, PriceFormatPipe, IssueCountFormatPipe, SalesOrderDetailedViewPipe, DateTimeFormatPipe, StatusDateDetailedViewPipe } from 'src/app/pipes/order-details-data-format.pipe';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DataModalComponent } from './data-modal/data-modal.component';
import { ActionButtonComponent } from './action-button/action-button.component';
import { SelectionToolbarComponent } from './selection-toolbar/selection-toolbar.component';
import { OrderSecondLevelComponent } from '../order-second-level-component/order-second-level-component.component';
import { TraverseinfoComponentComponent } from './traverseinfo-component/traverseinfo-component.component';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { FilterButtonComponent } from './filter-button/filter-button.component';
import { FlatCheckBoxComponent } from './flat-checkbox/flat-checkbox.component';
import { HostMenuWrapperComponent } from './host-menu-wrapper/host-menu-wrapper.component';
import { ManageTablecolumnComponent } from './manage-tablecolumn/manage-tablecolumn.component';
import { ReorderableButtonComponent } from './reorderable-button/reorderable-button.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { InfoTooltipDirective } from 'src/app/shared/directive/info-tooltip.directive';
import { InfoToolTipComponent } from './info-tool-tip/info-tool-tip.component';
import { MultiselectDropdownLabeledComponent } from './multiselect-dropdown-labeled/multiselect-dropdown-labeled.component';
import { ChipComponent } from './chip/chip.component';

const modules = [ CommonModule,
    MatTableModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    DragDropModule,
    OverlayModule,
  MatMenuModule];
const sharedComponents = [ReorderableButtonComponent, 
  ManageTablecolumnComponent, 
  HostMenuWrapperComponent, 
  FilterButtonComponent, 
  FlatCheckBoxComponent, 
  OrderSecondLevelComponent, 
  DataTableComponent, 
  DynamicPipe, 
  OrderDetailsFormatPipe, 
  ResellerDetailFormatPipe, 
  InvoiceIDFormatPipe, 
  CountryFormatPipe, 
  PriceFormatPipe, 
  ConfirmDialogComponent, 
  DataModalComponent, 
  ActionButtonComponent, 
  SelectionToolbarComponent, 
  TraverseinfoComponentComponent, 
  SidePanelComponent, 
  SalesOrderDetailedViewPipe, 
  DateTimeFormatPipe, 
  StatusDateDetailedViewPipe, 
  InfoTooltipDirective, 
  InfoToolTipComponent, 
  MultiselectDropdownLabeledComponent,
  ChipComponent   ];
const providers = [OrderDetailsFormatPipe,
    ResellerDetailFormatPipe,
    InvoiceIDFormatPipe,
    CountryFormatPipe,
    PriceFormatPipe,
    IssueCountFormatPipe,
    SalesOrderDetailedViewPipe,
    DateTimeFormatPipe,
    StatusDateDetailedViewPipe];

@NgModule({
  declarations: [...sharedComponents],
  imports: [...modules],
  providers: [...providers],
  exports: [...sharedComponents] 
})
export class SharedModule {}