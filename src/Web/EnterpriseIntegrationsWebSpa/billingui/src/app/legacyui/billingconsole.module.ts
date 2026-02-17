import { Injector, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { UpgradeModule } from '@angular/upgrade/static'; 
import { BillingconsoleComponent } from './billingconsole/billingconsole.component';

const routes: Routes = [
  {
    path: '',
    component: BillingconsoleComponent,
  },
];

@NgModule({
  declarations: [BillingconsoleComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    UpgradeModule
  ],
   schemas: []  
})
export class BillingConsoleModule { }
