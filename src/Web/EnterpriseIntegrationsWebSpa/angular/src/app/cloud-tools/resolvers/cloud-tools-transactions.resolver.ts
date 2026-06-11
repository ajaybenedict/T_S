import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of, take } from 'rxjs';
import { routeToCloudToolsTaskId } from 'src/app/core/config/cloud-tools.config';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { CloudToolsDataService } from 'src/app/core/services/cloud-tools/cloud-tools-data.service';
import { TransactionRequest, TransactionResponse } from 'src/app/models/cloud-tools/cloud-tools.interface';


export const cloudToolsTransactionsResolver: ResolveFn<TransactionResponse | null> = (route) => {
    const apiSvc = inject(CloudToolsAPIService);
    const dataSvc = inject(CloudToolsDataService);    

    const urlKey = route.routeConfig?.path ?? route.url[0]?.path ?? '';
    if (!urlKey) {
      console.warn(`CloudTools resolver: Invalid or missing route key.`);
      return of(null);
    }

    const taskId = routeToCloudToolsTaskId[urlKey];
    if (!taskId) {
      console.warn(`CloudTools resolver: No tool type found for "${urlKey}".`);
      return of(null);
    }

    const base = dataSvc.getInitialTransactionRequestData();
    const request: TransactionRequest = {
        ...base,
        taskIds: [taskId],
    };
    
    dataSvc.setTransactionRequestData(request);    
    return apiSvc.getTransactions(request).pipe(
        take(1),
        catchError((err) => {
            // Resolver errors should not block navigation.
            // Component will handle null as "no data" state.
            console.error('CloudTools transactions resolver failed:', err);
            return of(null);
        })
    );
};
