import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'cbc-oldui',
    loadChildren: () => import('./legacyui/billingconsole.module').then(m => m.BillingConsoleModule)
  },
  {
    path: 'CollectionSKUMaping',
    loadChildren: () => import('./CollectionSkuMapping/productcollection.module').then(m => m.ProductCollectionModule)
  },
  {
    path: 'cbc-newui',
    loadChildren: () => import('./newui/cbc.module').then(m => m.CBCModule)
  },
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
