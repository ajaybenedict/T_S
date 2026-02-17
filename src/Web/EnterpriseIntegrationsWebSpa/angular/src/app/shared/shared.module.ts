import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PpcCardComponent } from './ppc-card/ppc-card.component';
import { PpcDialogComponent } from './ppc-dialog/ppc-dialog.component';
import { ErrorComponent } from './error/error.component';
import { ValidationErrorComponent } from './validation-error/validation-error.component';
import { PpcApiResultsHeaderComponent } from '../ppc-api-results-header/ppc-api-results-header.component';
import { PpcNavTabsComponent } from './ppc-nav-tabs/ppc-nav-tabs.component';
import { PpcDataTableComponent } from './ppc-data-table/ppc-data-table.component';
import { PpcPaginatorComponent } from './ppc-paginator/ppc-paginator.component';
import { FileNameComponent } from './file-name/file-name.component';
import { MaterialPPCModule } from '../material/material-ppc.module';
import { PpcProgressBarComponent } from './ppc-progress-bar/ppc-progress-bar.component';
import { FormsModule } from '@angular/forms';
import { NgBootstrapPpcModule } from '../ng-bootstrap-ppc/ng-bootstrap-ppc.module';
import { PpcOverlayComponent } from './ppc-overlay/ppc-overlay.component';
import { PpcStatusBarComponent } from './ppc-status-bar/ppc-status-bar.component';
import { PpcSnackBarComponent } from './ppc-snack-bar/ppc-snack-bar.component';
import { PpcMastheadDropdownComponent } from './ppc-masthead-dropdown/ppc-masthead-dropdown.component';
import { PpcMastheadDropdownTriggerDirective } from './directives/ppc-masthead-dropdown-trigger.directive';
import { PowerbiReportWrapperComponent } from './powerbi-report-wrapper/powerbi-report-wrapper.component';
import { PowerBIEmbedModule } from 'powerbi-client-angular';
import { AIPanelDirective } from './directives/ai-panel.directive';
import { ChartComponent } from './common/chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FieldTransformPipe } from '../pipe/field-transform-pipe';
import { ExtractChartJsonObjectPipe } from '../pipe/extract-chart-json';
import { ExtractTextBeforeJsonPipe } from "../pipe/extract-text-before-json";
import { SelectDropdownComponent } from './select-dropdown/select-dropdown.component';
import { RuleEnginePanelDirective } from './directives/rule-engine.directive';
import { InputFilterDirective } from './directives/validators/input-filter.directive';
import { S1ButtonDirective } from './directives/s1-button.directive';
import { NormalizeStringPipe } from './pipes/normalize-string.pipe';

const sharedComponents = [
  PpcCardComponent,
  PpcDialogComponent,
  ErrorComponent,
  ValidationErrorComponent,
  PpcApiResultsHeaderComponent,
  PpcNavTabsComponent,
  PpcDataTableComponent,
  PpcPaginatorComponent,
  FileNameComponent,
  ErrorComponent,
  PpcProgressBarComponent,
  PpcOverlayComponent,
  PpcStatusBarComponent,
  PpcSnackBarComponent,
  PpcMastheadDropdownComponent,
  PowerbiReportWrapperComponent,
  ChartComponent,
  SelectDropdownComponent,
];

const pipes = [
  FieldTransformPipe,
  ExtractChartJsonObjectPipe,
  ExtractTextBeforeJsonPipe,
  NormalizeStringPipe,
];

const modules = [
  CommonModule,
  FormsModule,
  MaterialPPCModule,
  NgBootstrapPpcModule,
  PowerBIEmbedModule,
  NgxChartsModule,
];

const directives = [
  InputFilterDirective,
  PpcMastheadDropdownTriggerDirective,
  AIPanelDirective,
  RuleEnginePanelDirective,
  S1ButtonDirective,
]
@NgModule({
  declarations: [
    ...sharedComponents,
    ...pipes,
    ...directives
  ],
  imports: [
    ...modules
  ],
  exports: [
    ...modules,
    ...sharedComponents,
    ...pipes,
    ...directives
  ]

})
export class SharedModule { }
