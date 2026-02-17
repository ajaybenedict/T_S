import { Component } from '@angular/core';
import { ProductSyncService } from '../core/services/product-sync.service';

@Component({
  selector: 'app-product-sync',
  templateUrl: './product-sync.component.html'
})
export class ProductSyncComponent {
  selectedTask: string = 'skuSync';
  fileToUpload: File | null = null;
  results: any[] = [];
  validationError: boolean = false;
  showLoader: boolean = false;
  constructor(private productSyncService: ProductSyncService) { }

  onFileSelected(event: any): void {
    this.fileToUpload = event.target.files[0];
  }

  submit(): void {
    this.results = [];
    this.validationError = false;

    if (!this.selectedTask || !this.fileToUpload) {
      this.validationError = true;
      return;
    }

    const formData = new FormData();
    formData.append('file', this.fileToUpload);

    const endpoint = this.selectedTask === 'skuSync' ? '/ProductSync/UploadSkus' : '/ProductSync/UploadProducts';

    this.showLoader = true;
    this.productSyncService.uploadFile(endpoint, formData).subscribe(
      (data: any) => {
        this.results = data;
        this.showLoader = false;
      },
      (error: any) => {
        console.error('Error uploading file:', error);
        this.showLoader = false;
      }
    );
  }
}
