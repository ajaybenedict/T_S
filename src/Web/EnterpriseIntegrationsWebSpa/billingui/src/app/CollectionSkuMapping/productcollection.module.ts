// src/app/productCollection/product-collection/productcollection.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCollectionComponent } from './product-collection/product-collection.component';
import { allIcons, NgxBootstrapIconsModule } from 'ngx-bootstrap-icons';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

import { ProductCollectionService } from '../services/product-collection.service';

@NgModule({
  declarations: [    
    ProductCollectionComponent
  ],
  imports: [
    
    ReactiveFormsModule, 
    NgxPaginationModule,  
    NgxBootstrapIconsModule.pick(allIcons),
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProductCollectionComponent,
      }
    ])
  ],
  providers: [DatePipe, ProductCollectionService]
})
export class ProductCollectionModule {}
