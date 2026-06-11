import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';

import { S1DetailsCardComponent } from './s1-details-card.component';
import {
  C3DashboardTabTypeEnum,
  C3DetailsCardActionEnum,
  S1ApprovedDeclinedDetailsCard,
  S1NeedsApprovalDetailsCard
} from 'src/app/models/s1/s1-details-card.interface';
import { S1DetailsCardHelper } from './s1-details-card.helper';
import { UTC_TIMEZONE } from 'src/app/core/constants/constants';

describe('S1DetailsCardComponent', () => {
  let component: S1DetailsCardComponent;
  let fixture: ComponentFixture<S1DetailsCardComponent>;

  const baseOrderLineResponse = {
    address: '123 Main St',
    endCustomerName: 'Acme Corp',
    contactName: 'Jane Doe',
    phoneContact: '111-222-3333',
    emailContact: 'jane@example.com',
    orderLines: [
      {
        vendorName: 'Vendor A',
        qty: 2 as 2,
        fx: 'USD',
        value: 200,
        partNumber: 'SKU-123',
        billingFrequency: 'Monthly',
        billingType: 'Recurring',
        orderType: 'New'
      }
    ]
  };

  const needsApprovalInput: S1NeedsApprovalDetailsCard = {
    orderLines: [baseOrderLineResponse],
    fx: 'USD',
    tabType: C3DashboardTabTypeEnum.NeedsApproval,
    outstanding: 450,
    orderTotal: '650.00'
  };

  const declinedInput: S1ApprovedDeclinedDetailsCard = {
    orderLines: [baseOrderLineResponse],
    fx: 'USD',
    tabType: C3DashboardTabTypeEnum.Declined,
    updatedBy: 'Approver User',
    updatedOn: '2024-01-15T13:05:00Z',
    approvalType: 'Manual',
    orderTotal: '650.00'
  };

  const approvedInput: S1ApprovedDeclinedDetailsCard = {
    ...declinedInput,
    tabType: C3DashboardTabTypeEnum.Approved,
    approvalType: 'Auto'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ S1DetailsCardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(S1DetailsCardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize table columns in ngOnInit', () => {
    const tableColumnsSpy = spyOn(S1DetailsCardHelper, 'initTablecolumns').and.callThrough();

    component.ngOnInit();

    expect(tableColumnsSpy).toHaveBeenCalled();
    expect(component.tableColumns.length).toBeGreaterThan(0);
  });

  it('should populate text displays and table data for Needs Approval cards', () => {
    component.inputData = needsApprovalInput;

    component.initDetailsCard();

    expect(component.orderLines.endCustomerName).toBe('Acme Corp');
    expect(component.tableData.length).toBe(1);
    expect(component.addressTextDisplay.content).toContain('Jane Doe');
    expect(component.contactTextDisplay.content).toContain('jane@example.com');
    expect(component.unbilledTextDisplay.content).toBe('450');
  });

  it('should prepare declined footer menu for Declined tab', () => {
    component.inputData = declinedInput;

    component.initDetailsCard();

    expect(component.declinedFooterMenu).toBeTruthy();
    expect(component.declinedFooterMenu.subMenu.length).toBe(2);
    expect(component.declinedFooterMenu.subMenu[0].onClickEmit).toBe(C3DetailsCardActionEnum.NeedsApproval);
    expect(component.declinedFooterMenu.subMenu[1].onClickEmit).toBe(C3DetailsCardActionEnum.Approve);
  });

  it('should emit Goto action when onGotoClick is called', () => {
    const emitSpy = spyOn(component.outputAction, 'emit');

    component.onGotoClick();

    expect(emitSpy).toHaveBeenCalledWith(C3DetailsCardActionEnum.Goto);
  });

  it('should emit dismiss event when dismissClick is called', () => {
    const dismissSpy = spyOn(component.dismissEmit, 'emit');

    component.dismissClick();

    expect(dismissSpy).toHaveBeenCalled();
  });

  it('should route menu actions to matching output actions', () => {
    const outputSpy = spyOn(component, 'emitOutputAction');

    component.menuActionHandler(C3DetailsCardActionEnum.Approve);
    component.menuActionHandler(C3DetailsCardActionEnum.NeedsApproval);
    component.menuActionHandler('Invalid Action');

    expect(outputSpy).toHaveBeenCalledWith(C3DetailsCardActionEnum.Approve);
    expect(outputSpy).toHaveBeenCalledWith(C3DetailsCardActionEnum.NeedsApproval);
    expect(outputSpy).toHaveBeenCalledTimes(2);
  });

  it('should return expected approval type letters', () => {
    expect(component.getApprovalTypeLetter('Auto')).toBe('A');
    expect(component.getApprovalTypeLetter('Manual')).toBe('M');
    expect(component.getApprovalTypeLetter('Other')).toBe('E');
  });

  it('should expose approvedData only for Approved and Declined tabs', () => {
    component.inputData = needsApprovalInput;
    expect(component.approvedData).toBeNull();

    component.inputData = approvedInput;
    expect(component.approvedData).toEqual(approvedInput);

    component.inputData = declinedInput;
    expect(component.approvedData).toEqual(declinedInput);
  });

  it('should format date and time through DatePipe for getOrderDateTime', () => {
    const datePipeTransformSpy = spyOn((component as any).datePipe, 'transform').and.returnValues('15 Jan, 2024', '01:05 PM');

    const dateResult = component.getOrderDateTime('2024-01-15T13:05:00Z', 'date');
    const timeResult = component.getOrderDateTime('2024-01-15T13:05:00Z', 'time');

    expect(datePipeTransformSpy).toHaveBeenCalledWith(jasmine.any(Date), 'dd MMM, yyyy');
    expect(datePipeTransformSpy).toHaveBeenCalledWith(jasmine.any(Date), 'hh:mm a');
    expect(dateResult).toBe('15 Jan, 2024');
    expect(timeResult).toBe('01:05 PM');
  });

  it('should call initDetailsCard when inputData changes', () => {
    const initSpy = spyOn(component, 'initDetailsCard');

    component.ngOnChanges({
      inputData: new SimpleChange(null, needsApprovalInput, true)
    });

    expect(initSpy).toHaveBeenCalled();
  });

  it('should expose the UTC constant used in footer template', () => {
    expect(component.utcConstant).toBe(UTC_TIMEZONE);
  });
});
