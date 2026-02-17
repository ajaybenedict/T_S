import { NgModule } from '@angular/core';
import { RuleEditComponent } from './rule-edit/rule-edit.component';
import { MaterialPPCModule } from '../material/material-ppc.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule, Routes } from '@angular/router';
import { PanelShellComponent } from './panel-shell/panel-shell.component';
import { RuleEngineDashboardComponent } from './rule-engine-dashboard/rule-engine-dashboard.component';
import { SharedS1Module } from '../shared-s1/shared-s1.module';
import { ViewRuleDetailComponent } from './view-rule-detail/view-rule-detail.component';
import { EditRuleDetailComponent } from './edit-rule-detail/edit-rule-detail.component';
import { LogicalOperatorComponent } from './logical-operator/logical-operator.component';
import { ViewRuleComponent } from './view-rule/view-rule.component';
import { ruleDetailResolver } from './rule-detail.resolver';
import { RULE_ENGINE_ROUTE_CONFIG_URL } from '../core/constants/constants';

const modules = [
  MaterialPPCModule,
  SharedModule,
  SharedS1Module,
];

const components = [
  RuleEditComponent,
  PanelShellComponent,
  RuleEngineDashboardComponent,  
  ViewRuleDetailComponent,
  EditRuleDetailComponent,
  LogicalOperatorComponent,
  ViewRuleComponent,
];

const routes: Routes = [
  {
    path: '',
    component: RuleEngineDashboardComponent,
  },
  {
    path: `${RULE_ENGINE_ROUTE_CONFIG_URL.EDIT}`,
    component: EditRuleDetailComponent,
    resolve: { ruleDetail: ruleDetailResolver }
  },
  {
    path: `${RULE_ENGINE_ROUTE_CONFIG_URL.EDIT_PARAM_ID}`,
    component: EditRuleDetailComponent,
    resolve: { ruleDetail: ruleDetailResolver }
  },
];


@NgModule({
  declarations: [
    ...components,
  ],
  imports: [
    ...modules,    
    RouterModule.forChild(routes),
  ],
  exports: [
    ...components,
  ]
})
export class RuleEngineModule { }
