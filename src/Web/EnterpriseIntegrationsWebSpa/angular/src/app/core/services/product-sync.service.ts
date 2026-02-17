import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductSyncService {
  private apiUrl = 'http://localhost:55102/api/v1';

  constructor(private http: HttpClient) {
    if (window.location.href.includes('int')) {
      this.apiUrl = 'https://int-streamone-api.tdsynnex.org/core-ppc/api/v1'
    }
  }

  uploadFile(endpoint: string, formData: FormData): Observable<any> {
    const url = `${this.apiUrl}${endpoint}`;
    return this.http.post(url, formData);
  }
}
