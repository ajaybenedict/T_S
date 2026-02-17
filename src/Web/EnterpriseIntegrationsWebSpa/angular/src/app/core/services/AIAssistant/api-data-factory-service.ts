import { Injectable } from '@angular/core';
import { ApiDataService } from './api-data-service';
import { IonDataDiscoveryApiDataService } from './ion-data-discovery.service';
import { IonApiDataService } from './ion-data-service';

@Injectable({
  providedIn: 'root',
})
export class ApiDataFactory {
  constructor(private ionDataDiscoveryApiDataService: IonDataDiscoveryApiDataService
    , private ionApiDataService: IonApiDataService
  ) { }

  getApiDataService(assistantId: string): ApiDataService {
    let service: ApiDataService
    if (assistantId == "asst_0yeESUiA8vHOuAt4K9wVdeu1" || assistantId == "asst_nwtVcw8HA2DigwzvkU7dZBee"
      || assistantId == "asst_6YVWwOymaMeATpZACxsJqULo"
    ) {
      service = this.ionDataDiscoveryApiDataService;
    }
    else if (assistantId == "asst_pfeJc8dTC4O2FsD6GhpcjHH3" || assistantId ==  "asst_Ch8CEc5m1Gy7aeSeRmc9Qr6f") {
      service = this.ionApiDataService;
    }
    else
      service = this.ionDataDiscoveryApiDataService;

      return service;
    
  }
}
