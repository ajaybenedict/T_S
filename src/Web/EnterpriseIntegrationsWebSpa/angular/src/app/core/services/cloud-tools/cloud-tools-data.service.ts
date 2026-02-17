import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DEFAULT_PAGE_SIZE_CLOUD_TOOLS, DEFAULT_PREVIOUS_DAYS_FILTER_CLOUD_TOOLS } from "../../constants/constants";
import { TransactionRequest } from "src/app/models/cloud-tools/cloud-tools.interface";
import { cloneDeep } from "lodash";

@Injectable({providedIn: 'root'})

export class CloudToolsDataService {
    // Calculation of fromdate, toDate.
    private readonly previousNumberOfDays: number = DEFAULT_PREVIOUS_DAYS_FILTER_CLOUD_TOOLS;
    private readonly today = new Date();
    private readonly fromDate = new Date(new Date().setDate(this.today.getDate() - this.previousNumberOfDays));
    private readonly toDate = this.today;

    /** Default request. Will be modified over time by other events/components. */
    private transctionRequestData: TransactionRequest = {
        fromDate: new Date(this.fromDate.toISOString().split('T')[0]),
        toDate: new Date(this.toDate.toISOString().split('T')[0]),
        searchText: '',
        pageNumber: 1,
        pageSize: DEFAULT_PAGE_SIZE_CLOUD_TOOLS,
        sortBy: "CreatedDate", // defaulted as of now.
        sortDescending: true,
        statusIds: [3], // default tab - Success
        taskIds: [],
    };
    /** Initial request data. Cannot be modified. */
    private readonly initialTransactionRequestData: TransactionRequest = cloneDeep(this.transctionRequestData);
    /** Maintains the transaction API InProgress state. */
    private readonly transactionAPIInProgress = new BehaviorSubject<boolean>(false);
    /** MAintains the Upload API state. */
    private readonly uploadAPIState = new BehaviorSubject<'InProgress' | 'Failed' | 'Success' | null>(null);

    transactionAPIInProgress$ = this.transactionAPIInProgress.asObservable();
    uploadAPIState$ = this.uploadAPIState.asObservable();

    constructor(){}

    getInitialTransactionRequestData() {
        return this.initialTransactionRequestData;
    }

    getTransactionRequestData() {
        return this.transctionRequestData;
    }

    setTransactionRequestData(data: Partial<TransactionRequest>) {
        let temp: TransactionRequest = {...this.transctionRequestData, ...data};
        this.transctionRequestData = temp;
    }

    setTransactionAPIInProgress(data: boolean){
        this.transactionAPIInProgress.next(data);
    }

    setUploadAPIState(data: 'InProgress' | 'Failed' | 'Success') {
        this.uploadAPIState.next(data);
    }
}
