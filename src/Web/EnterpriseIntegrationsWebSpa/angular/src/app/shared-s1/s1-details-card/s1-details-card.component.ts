import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { OrderLine, OrderLineResponse } from 'src/app/models/ppc/order-line.interface';
import { S1DataTableColumn } from 'src/app/models/s1/s1-data-table.interface';
import { C3DashboardTabTypeEnum, C3DetailsCardActionEnum, S1ApprovedDeclinedDetailsCard, S1DetailsCard } from 'src/app/models/s1/s1-details-card.interface';
import { S1TextDisplay } from 'src/app/models/s1/s1-text-display.interface';
import { S1DetailsCardHelper } from './s1-details-card.helper';
import { S1Menu } from 'src/app/models/s1/s1-menu.interface';

@Component({
  selector: 's1-details-card',
  templateUrl: './s1-details-card.component.html',
  styleUrls: ['./s1-details-card.component.css'],
  standalone: false,
})
export class S1DetailsCardComponent implements OnInit, OnChanges , OnDestroy {

  @Input() declare inputData: S1DetailsCard;
  @Output() outputAction = new EventEmitter<C3DetailsCardActionEnum>();
  @Output() dismissEmit = new EventEmitter<void>();

  tabTypeEnum = C3DashboardTabTypeEnum;
  showDetailsCard = false;
  orderLines!: OrderLineResponse;
  addressTextDisplay!: S1TextDisplay;
  contactTextDisplay!: S1TextDisplay;
  unbilledTextDisplay!: S1TextDisplay;
  tableColumns!: S1DataTableColumn[];
  tableData!: OrderLine[];
  declinedFooterMenu!: S1Menu;
  outputActionEnum = C3DetailsCardActionEnum;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.initDetailsCard();
    this.tableColumns = S1DetailsCardHelper.initTablecolumns();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['inputData']) {
      this.initDetailsCard();
    }
  }

  initDetailsCard() {
    if(this.inputData?.orderLines?.length) {
      this.tableData = this.inputData.orderLines[0].orderLines;
      this.orderLines = this.inputData.orderLines[0];
      this.processTextDisplays();
      this.chooseFooterAndPrepareMenuData();
    }
  }

  onGotoClick() {
    this.outputAction.emit(C3DetailsCardActionEnum.Goto);
  }

  emitOutputAction(action: C3DetailsCardActionEnum) {
    this.outputAction.emit(action);
  }

  dismissClick() {
    this.dismissEmit.emit();
  }

  processTextDisplays() {
    this.addressTextDisplay = {
      height: '92px',
      width: '100%',
      padding: '12px',
      title: 'Address',
      content: `${this.orderLines.contactName}<br>${this.orderLines.address}`,
    };
    this.contactTextDisplay = {
      height: '92px',
      width: '100%',
      padding: '12px',
      title: 'Contact',
      content: `Phone: ${this.orderLines.phoneContact}<br>Email: ${this.orderLines.emailContact}`,
    };
    if(this.inputData.tabType == this.tabTypeEnum.NeedsApproval) {
      this.unbilledTextDisplay = {
        height: '48px',
        width: '140px',
        padding: '8px 12px',
        content: this.inputData.outstanding.toString(),
      };
    }
  }

  chooseFooterAndPrepareMenuData() {
    if(this.inputData.tabType == this.tabTypeEnum.Declined) {
      this.prepareDeclinedFooterData();
    }
  }

  prepareDeclinedFooterData() {
    this.declinedFooterMenu = S1DetailsCardHelper.getDeclinedMenu();
  }

  getApprovalTypeLetter(type: string) {
    if (type == 'Auto') {
      return 'A';
    } else if (type == 'Manual') {
      return 'M';
    } else {
      return 'E';
    }
  }

  menuActionHandler(action: string) {
    if(action == C3DetailsCardActionEnum.Approve) this.emitOutputAction(this.outputActionEnum.Approve);
    if(action == C3DetailsCardActionEnum.NeedsApproval) this.emitOutputAction(this.outputActionEnum.NeedsApproval);
  }

  // typed view-model for the approved/declined branch
  get approvedData(): S1ApprovedDeclinedDetailsCard | null {
    return (this.inputData.tabType === C3DashboardTabTypeEnum.Approved
      || this.inputData.tabType === C3DashboardTabTypeEnum.Declined)
      ? this.inputData
      : null;
  }

  getOrderDateTime(data: string, type: 'date' | 'time') {
    const date = new Date(data);
    return type == 'date' ? this.datePipe.transform(date, 'dd MMM, yyyy') : this.datePipe.transform(date, 'hh:mm a');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
