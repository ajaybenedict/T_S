import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { S1DataTableComponent } from './s1-data-table/s1-data-table.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { S1SearchBarComponent } from './s1-search-bar/s1-search-bar.component';
import { S1DetailsCardComponent } from './s1-details-card/s1-details-card.component';
import { S1TextDisplayComponent } from './s1-text-display/s1-text-display.component';
import { S1CardDataTableComponent } from './s1-card-data-table/s1-card-data-table.component';
import { S1MenuComponent } from './s1-menu/s1-menu.component';
import { S1FilterNumericFieldComponent } from './s1-filter-numeric-field/s1-filter-numeric-field.component';
import { S1DateRangePickerComponent } from './s1-date-range-picker/s1-date-range-picker.component';
import { S1FilterButtonsComponent } from './s1-filter-buttons/s1-filter-buttons.component';
import { S1FilterButtonContainerComponent } from './s1-filter-button-container/s1-filter-button-container.component';
import { S1CheckboxComponent } from './s1-checkbox/s1-checkbox.component';
import { S1FlatCheckboxComponent } from './s1-flat-checkbox/s1-flat-checkbox.component';
import { S1DescriptionCheckboxComponent } from './s1-description-checkbox/s1-description-checkbox.component';
import { S1GroupCheckboxComponent } from './s1-group-checkbox/s1-group-checkbox.component';
import { SharedModule } from '../shared/shared.module';
import { S1BreadcrumbComponent } from './s1-breadcrumb/s1-breadcrumb.component';
import { S1ActionBarComponent } from './s1-action-bar/s1-action-bar.component';
import { S1ChipComponent } from './s1-chip/s1-chip.component';
import { S1TableColumnManagerComponent } from './s1-table-column-manager/s1-table-column-manager.component';
import { C3DataTableStatusTooltipComponent } from './c3-data-table-status-tooltip/c3-data-table-status-tooltip.component';
import { StatusTooltipDirective } from './directives/status-tooltip.directive';
import { S1CheckboxDropdownComponent } from './s1-checkbox-dropdown/s1-checkbox-dropdown.component';
import { S1DropDownButtonComponent } from './s1-drop-down-button/s1-drop-down-button.component';
const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  SharedModule,
];

const sharedComponents = [
  S1DataTableComponent,
  S1SearchBarComponent,
  S1DetailsCardComponent,    
  S1TextDisplayComponent,
  S1CardDataTableComponent,
  S1MenuComponent,
  S1FilterNumericFieldComponent,
  S1DateRangePickerComponent,  
  S1FilterButtonsComponent,
  S1FilterButtonContainerComponent, 
  S1CheckboxComponent,
  S1FlatCheckboxComponent,
  S1DescriptionCheckboxComponent,
  S1GroupCheckboxComponent,
  S1BreadcrumbComponent,
  S1ActionBarComponent,
  S1ChipComponent,
  C3DataTableStatusTooltipComponent,
  S1TableColumnManagerComponent,
  S1CheckboxDropdownComponent,
  S1DropDownButtonComponent,
];

const sharedDirectives = [
  StatusTooltipDirective,
];

@NgModule({
  declarations: [
    ...sharedComponents,
    ...sharedDirectives,    
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...sharedComponents,
    ...sharedDirectives,
  ], 
})
export class SharedS1Module { }
