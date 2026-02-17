import { Injectable } from '@angular/core';
import { OrderStatusMap } from '../config/order-status.config';

@Injectable({
  providedIn: 'root',
})
export class OrderStatusService {
  getOrderStatus(row: any): { imgURL: string; key: string } {
    const status = row?.statusCode;
    return OrderStatusMap[status] || { imgURL: '', key: '' };
  }
}
