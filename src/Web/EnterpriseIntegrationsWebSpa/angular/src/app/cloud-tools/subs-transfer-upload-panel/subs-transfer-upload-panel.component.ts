import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { SidePanelRef } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.ref';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.tokens';
import { PanelData } from '../upload-panel/upload-panel.component';
import { CLOUD_TOOLS_UPLOAD_WARNING, c3RuleEngineAlertRecipientAllowedDomains } from 'src/app/core/constants/constants';
import { DialogType } from 'src/app/models/ppc-dialog-data.model';
import { CloudToolsHelper } from '../cloud-tools-helper';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { finalize, Subject, take, takeUntil } from 'rxjs';
import { SubscriptionTransferCustomer, SubsTransferRegion } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { CloudToolsAPIService } from 'src/app/core/services/cloud-tools/cloud-tools-api.service';
import { subscriptionTransferTypeDropdownOptions } from 'src/app/core/config/cloud-tools.config';
import { SidePanelService } from 'src/app/shared-s1/s1-cdk-side-panel/side-panel.service';
import { SubsTransferCustomerPreviewComponent } from '../subs-transfer-customer-preview/subs-transfer-customer-preview.component';
import { SubsTransferCustomerPreviewPanelData, SubsTransferCustomerPreviewRow, SubsTransferFormValues } from 'src/app/models/cloud-tools/subs-transfer-preview.interface';
import { normalizeSubsTransferFormValues, SubsTransferRawLikeFormValues } from '../subs-transfer-form.helper';

type SubsTransferRawFormValues = SubsTransferRawLikeFormValues;

type ApiErrorPayload = {
  errorMessage?: string;
  message?: string;
  errorDetails?: Array<{ message?: string }>;
};

@Component({
  selector: 'app-subs-transfer-upload-panel',
  templateUrl: './subs-transfer-upload-panel.component.html',
  styleUrls: ['./subs-transfer-upload-panel.component.css']
})
export class SubsTransferUploadPanelComponent implements OnInit, OnDestroy {

  private readonly guidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  readonly warningMessage = CLOUD_TOOLS_UPLOAD_WARNING.MSG;
  readonly formControlList = {
    REGION: 'region',
    TRANSFER_TYPE: 'transferType',
    MPN_ID: 'mpnId',
    SOURCE_PARTNER_TENANT_ID: 'sourcePartnerTenantId',
    SOURCE_PARTNER_NAME: 'sourcePartnerName',
    EMAIL: 'email',
    REQUESTED_BY: 'requestedBy',
  } as const;

  panelForm!: FormGroup;
  uploadErrors: string[] = [];
  showOverlay = false;
  regionDropdownOptions: SelectDropdown[] = [];
  readonly transferTypeDropdownOptions: SelectDropdown[] = subscriptionTransferTypeDropdownOptions;
  readonly emailAllowedDomains = c3RuleEngineAlertRecipientAllowedDomains;

  private dialogRef?: MatDialogRef<PpcDialogComponent>;
  private readonly destroy$ = new Subject<void>();

  constructor(    
    @Inject(SIDE_PANEL_REF) private readonly panelRef: SidePanelRef<PanelData>,
    @Inject(SIDE_PANEL_DATA) private readonly panelData: PanelData,
    private readonly dialog: MatDialog,
    private readonly formBuilder: FormBuilder,
    private readonly cloudToolsAPIService: CloudToolsAPIService,
    private readonly sidePanelService: SidePanelService,
  ) { }

  ngOnInit(): void {
    this.uploadErrors = [];
    this.fetchRegionOptions();
    this.initializeForm();
    this.restoreFormValues(this.panelData.subsTransferFormValues);
    if (this.panelData.uploadError) {
      this.uploadErrors.push(this.panelData.uploadError);
    }
  }

  private initializeForm(): void {
    this.panelForm = this.formBuilder.group({
      [this.formControlList.REGION]: [null, Validators.required],
      [this.formControlList.TRANSFER_TYPE]: [null, Validators.required],
      [this.formControlList.MPN_ID]: ['', Validators.required],
      [this.formControlList.SOURCE_PARTNER_TENANT_ID]: ['', [Validators.required, Validators.pattern(this.guidPattern)]],
      [this.formControlList.SOURCE_PARTNER_NAME]: [''],
      [this.formControlList.EMAIL]: ['', Validators.required],
      [this.formControlList.REQUESTED_BY]: ['', Validators.required],
    });
  }

  onSourcePartnerTenantIdInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = input.value.replaceAll(/[^0-9a-fA-F-]/g, '').slice(0, 36);

    if (sanitizedValue === input.value) {
      return;
    }

    input.value = sanitizedValue;
    this.panelForm.get(this.formControlList.SOURCE_PARTNER_TENANT_ID)?.setValue(sanitizedValue, { emitEvent: false });
  }

  onRequestedByInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const sanitizedValue = this.normalizeRequestedByValue(input.value);

    if (sanitizedValue === input.value) {
      return;
    }

    input.value = sanitizedValue;
    this.panelForm.get(this.formControlList.REQUESTED_BY)?.setValue(sanitizedValue, { emitEvent: false });
  }
  
  onRequestedByPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const input = event.target as HTMLInputElement;
    if (!input) return;

    const selectionStart = input.selectionStart ?? 0;
    const selectionEnd = input.selectionEnd ?? selectionStart;
    const currentValue = input.value;
    const sanitizedPastedText = CloudToolsHelper.sanitizeFilenameString(event.clipboardData?.getData('text') ?? '');
    const availableLength = Math.max(0, 100 - (currentValue.length - (selectionEnd - selectionStart)));
    const truncatedPastedText = sanitizedPastedText.slice(0, availableLength);

    if (typeof input.setRangeText === 'function') {
      input.setRangeText(truncatedPastedText, selectionStart, selectionEnd, 'end');
    } else {
      input.value = `${currentValue.slice(0, selectionStart)}${truncatedPastedText}${currentValue.slice(selectionEnd)}`;
    }

    const sanitizedValue = this.normalizeRequestedByValue(input.value);
    if (sanitizedValue !== input.value) {
      input.value = sanitizedValue;
    }

    this.panelForm.get(this.formControlList.REQUESTED_BY)?.setValue(sanitizedValue, { emitEvent: false });
  }

  onProceedClick() {
    if (this.panelForm.invalid) {
      this.panelForm.markAllAsTouched();
      return;
    }

    this.uploadErrors = [];

    const formValue = this.panelForm.getRawValue() as SubsTransferRawFormValues;
    const formValuesSnapshot = this.normalizeFormValues(formValue);
    const selectedRegionKey = this.toRegionKey(formValue[this.formControlList.REGION]);
    const mpnIdRaw = String(formValue[this.formControlList.MPN_ID] ?? '').trim();
    const mpnId = Number(mpnIdRaw);

    // Keep the mapped regionKey ready for follow-up API calls.
    if (!selectedRegionKey) {
      this.uploadErrors.push('Please select a valid region.');
      return;
    }

    if (!/^\d+$/.test(mpnIdRaw) || !Number.isFinite(mpnId)) {
      this.uploadErrors.push('Please provide a valid MPNID.');
      return;
    }

    // Validate email
    const emailControl = this.panelForm.get(this.formControlList.EMAIL);
    if (emailControl?.errors) {
      if (emailControl.errors['required']) {
        this.uploadErrors.push('Email is required.');
      } else if (emailControl.errors['multipleEmails']) {
        this.uploadErrors.push('Only one email address is allowed.');
      } else if (emailControl.errors['invalidEmailFormat']) {
        this.uploadErrors.push('Please provide a valid email format (e.g., user@domain.com).');
      } else if (emailControl.errors['invalidDomain']) {
        const allowedDomains = emailControl.errors['invalidDomain'].allowedDomains.join(', ');
        this.uploadErrors.push(`Email domain must be one of the following: ${allowedDomains}.`);
      }
      return;
    }

    this.showOverlay = true;

    this.cloudToolsAPIService
      .getSubscriptionTransferCustomers(selectedRegionKey, mpnIdRaw)
      .pipe(
        take(1),
        finalize(() => {
          this.showOverlay = false;
        }),
      )
      .subscribe({
        next: (customers: SubscriptionTransferCustomer[]) => {
          if (!customers?.length) {
            this.openDialog('SubsTransferNoCustomerFound', formValuesSnapshot);
            return;
          }

          this.openCustomerPreviewPanel(customers, formValue, formValuesSnapshot, selectedRegionKey);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error fetching subscription transfer customers - ', err);
          const errMsg = this.getErrorMessage(err);
          this.uploadErrors.push(errMsg);
        },
      });
  }

  private openCustomerPreviewPanel(
    customers: SubscriptionTransferCustomer[],
    formValue: SubsTransferRawFormValues,
    formValuesSnapshot: SubsTransferFormValues,
    selectedRegionKey: string,
  ): void {
    const rows = customers.map((customer: SubscriptionTransferCustomer): SubsTransferCustomerPreviewRow => ({
      region: selectedRegionKey,
      customerTenantId: customer.companyProfile?.tenantId ?? customer.id,
      sourcePartnerName: String(formValue[this.formControlList.SOURCE_PARTNER_NAME] ?? '').trim(),
      sourcePartnerTenantId: String(formValue[this.formControlList.SOURCE_PARTNER_TENANT_ID] ?? '').trim(),
      customerEmailId: String(formValue[this.formControlList.EMAIL] ?? '').trim(),
    }));

    this.sidePanelService.open<SubsTransferCustomerPreviewPanelData, void>(
      SubsTransferCustomerPreviewComponent,
      {
        disableClose: true,
        hasBackdrop: false,
        width: '75vw',
        position: 'right',
        data: {
          rows,
          formValues: formValuesSnapshot,
        },
        layoutMode: 'below-header',
        headerHeightPx: 68,
      },
    );
  }

  private getErrorMessage(err: HttpErrorResponse): string {
    const genericMessage = 'Something went wrong. Please try again later.';

    if (err.status === 500) {
      return genericMessage;
    }

    const apiError = this.getApiErrorPayload(err.error);

    const errorDetails = apiError?.errorDetails;
    const detailedErrorMessages: string[] = Array.isArray(errorDetails)
      ? errorDetails
        .map((detail: { message?: string }) => detail?.message?.trim())
        .filter((message: string | undefined): message is string => Boolean(message))
      : [];

    if (detailedErrorMessages.length) {
      return detailedErrorMessages.join(' ');
    }

    const apiErrorMessage = apiError?.errorMessage ?? apiError?.message;
    if (typeof apiErrorMessage === 'string' && apiErrorMessage.trim()) {
      return apiErrorMessage.trim();
    }

    return genericMessage;
  }

  private getApiErrorPayload(error: unknown): ApiErrorPayload | null {
    if (!error) {
      return null;
    }

    if (typeof error === 'string') {
      const trimmed = error.trim();
      if (!trimmed) {
        return null;
      }

      try {
        return JSON.parse(trimmed);
      } catch {
        return { message: trimmed };
      }
    }

    if (typeof error === 'object') {
      return error as ApiErrorPayload;
    }

    return null;
  }

  private openDialog(
    type: Extract<DialogType, 'SubsTransferNoCustomerFound'>,
    formValuesSnapshot: SubsTransferFormValues,
  ) {
    this.closeDialog();
    const data = CloudToolsHelper.getPpcDialogData(type);
    this.dialogRef = this.dialog.open(PpcDialogComponent, {
      height: '261px',
      width: '375px',
      maxWidth: '375px',
      disableClose: false,
      position: { bottom: '0', right: '0' },
      data,
    });

    this.dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((dialogResult: string | boolean | undefined) => {
        if (dialogResult === 'rework' || dialogResult === false) {
          this.restoreFormValues(formValuesSnapshot);
        }
      });
  }

  private closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  closeHandler() {
    this.panelRef.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchRegionOptions(): void {
    this.showOverlay = true;

    this.cloudToolsAPIService
      .getSubscriptionTransferRegions()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.showOverlay = false;
        }),
      )
      .subscribe({
        next: (regions: SubsTransferRegion[]) => {
          this.regionDropdownOptions = this.mapRegionsToDropdownOptions(regions);
          this.restoreFormValues(this.panelData.subsTransferFormValues);
        },
        error: (err) => {
          this.regionDropdownOptions = [];
          console.error('Error fetching subscription transfer regions - ', err);
          this.uploadErrors.push('Failed to load regions. Please try again later.');
        },
      });
  }

  private mapRegionsToDropdownOptions(regions: SubsTransferRegion[]): SelectDropdown[] {
    return regions
      .map((region: SubsTransferRegion) => ({
        label: region.regionKey,
        value: region.regionKey,
      }));
  }

  private toRegionKey(option: SelectDropdown | string | null): string {
    if (typeof option === 'string') {
      return option;
    }

    return option?.value ?? '';
  }

  private normalizeFormValues(formValue: SubsTransferRawFormValues): SubsTransferFormValues {
    return normalizeSubsTransferFormValues(formValue);
  }

  private normalizeRequestedByValue(value: string): string {
    return CloudToolsHelper.sanitizeFilenameString(value).slice(0, 100);
  }

  private restoreFormValues(formValues?: SubsTransferFormValues): void {
    if (!formValues) {
      return;
    }

    this.panelForm.patchValue({
      [this.formControlList.REGION]: this.findDropdownOptionByValue(this.regionDropdownOptions, formValues.region),
      [this.formControlList.TRANSFER_TYPE]: this.findDropdownOptionByValue(this.transferTypeDropdownOptions, formValues.transferType),
      [this.formControlList.MPN_ID]: formValues.mpnId,
      [this.formControlList.SOURCE_PARTNER_TENANT_ID]: formValues.sourcePartnerTenantId,
      [this.formControlList.SOURCE_PARTNER_NAME]: formValues.sourcePartnerName,
      [this.formControlList.EMAIL]: formValues.email,
    });
  }

  private findDropdownOptionByValue(
    options: SelectDropdown[],
    value: string | null,
  ): SelectDropdown | null {
    if (!value) {
      return null;
    }

    return options.find((option: SelectDropdown) => option.value === value) ?? null;
  }

}
