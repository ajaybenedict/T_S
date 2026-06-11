import { Injectable } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly defaultConfig: Partial<IndividualConfig> = {
    timeOut: 4000,
    positionClass: 'toast-top-right',
    closeButton: true,
    progressBar: true
  };

  constructor(private readonly toastr: ToastrService) {}

  success(message: string, title?: string, config?: Partial<IndividualConfig>): void {
    this.toastr.success(message, title, { ...this.defaultConfig, ...config });
  }

  error(message: string, title?: string, config?: Partial<IndividualConfig>): void {
    this.toastr.error(message, title, { ...this.defaultConfig, ...config });
  }

  warning(message: string, title?: string, config?: Partial<IndividualConfig>): void {
    this.toastr.warning(message, title, { ...this.defaultConfig, ...config });
  }

  info(message: string, title?: string, config?: Partial<IndividualConfig>): void {
    this.toastr.info(message, title, { ...this.defaultConfig, ...config });
  }

  clear(): void {
    this.toastr.clear();
  }
}