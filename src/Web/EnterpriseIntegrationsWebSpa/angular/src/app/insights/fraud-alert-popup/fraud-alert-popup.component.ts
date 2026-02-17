import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { catchError, of, Subject, take, takeUntil } from 'rxjs';
import { eventStatusConfig, resolvedReasonConfig } from 'src/app/core/config/fraud-alert-event.config';
import { FRAUD_ALERT_EVENT_API, PARTNER_CENTER } from 'src/app/core/constants/constants';
import { FraudAlertPopupService } from 'src/app/core/services/insights/fraud-alert-popup.service';
import { VendorService } from 'src/app/core/services/vendor/vendor.service';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { FruadAlertPopupInput, PostRequest, PostResponse, UpdateFraudEventStatusRequest, VendorApiType, VendorAuthType } from 'src/app/models/vendor/vendor-api.models';

@Component({
  selector: 'app-fraud-alert-popup',
  templateUrl: './fraud-alert-popup.component.html',
  styleUrls: ['./fraud-alert-popup.component.css']
})
export class FraudAlertPopupComponent implements OnInit{

  private readonly destroy$ = new Subject<void>();

  fraudAlertForm!: FormGroup;
  displayMessage!: string;
  filteredFraudEventList!: PostResponse[];
  eventStatusDropdown: SelectDropdown[] = eventStatusConfig.map(el => ({ label: el, value: el }));
  resolvedReasonDropdown: SelectDropdown[] = resolvedReasonConfig.map(el => ({ label: el, value: el }));
  showDropdown = false;

  formControlList = {
    EVENT_STATUS: 'eventStatus',
    RESOLVED_REASON: 'resolvedReason',
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly _input: FruadAlertPopupInput,
    private readonly fb: FormBuilder,
    private readonly vendorSVC: VendorService,
    private readonly popupSVC: FraudAlertPopupService,
  ){}

  ngOnInit(): void {
    this.displayMessage = FRAUD_ALERT_EVENT_API.LOADING;
    this.loadForm();
    this.getFraudEventStatus();
  }

  loadForm() {
    this.fraudAlertForm = this.fb.group({
      [this.formControlList.EVENT_STATUS]: ['', [Validators.required]],
      [this.formControlList.RESOLVED_REASON]: ['', [Validators.required]],
    });

    this.fraudAlertForm.get(this.formControlList.EVENT_STATUS)?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (res: SelectDropdown) => {
        if(this.displayMessage === FRAUD_ALERT_EVENT_API.IDENTICAL) {
          this.displayMessage = ''; //resetting the display message after the Identical message is shown while user changes the event status.
        }
      }
    });
  }

  getFraudEventStatus() {
    const apiData: PostRequest = {
      resourceUri: `${PARTNER_CENTER.FRAUD_EVENTS_RESOURCE_URI}${this._input.subId}`,
      authResourceUri: PARTNER_CENTER.AUTH_URI,
      apiType: VendorApiType.Graph,
      authType: VendorAuthType.Oauth,
      region: this._input.region,
      vendorId: this._input.vendorId,
    }

    this.vendorSVC.post(apiData).pipe(
      take(1),
      catchError(err => {
        this.displayMessage = FRAUD_ALERT_EVENT_API.NO_STATUS;
        return of(null);
      })
    ).subscribe({
      next: res => {
        if(res?.length) {
          this.displayMessage = '';
          this.showDropdown = true;
          this.filteredFraudEventList = res.filter(el => el.eventId === this._input.eventId);
          this.fraudAlertForm.patchValue({
            [this.formControlList.EVENT_STATUS]: {label: this.filteredFraudEventList[0].eventStatus, value: this.filteredFraudEventList[0].eventStatus },
            [this.formControlList.RESOLVED_REASON]: {label: this.filteredFraudEventList[0].resolvedReason, value: this.filteredFraudEventList[0].resolvedReason },
          });
          this.fraudAlertForm.updateValueAndValidity();
        } else {
          this.displayMessage = FRAUD_ALERT_EVENT_API.NO_STATUS;
        }
      }
    });
  }

  updateEventHandler() {
    if(this.fraudAlertForm.valid) {
      const newEventStatus = this.fraudAlertForm.get(this.formControlList.EVENT_STATUS);
      const newResolvedReason = this.fraudAlertForm.get(this.formControlList.RESOLVED_REASON);
      if(!newEventStatus || !newResolvedReason) return;
      const newEventStatusValue: SelectDropdown = newEventStatus.value
      if(newEventStatusValue.value === this.filteredFraudEventList[0].eventStatus) {
        this.displayMessage = FRAUD_ALERT_EVENT_API.IDENTICAL;
      } else {
        this.updateFraudEvent(newEventStatus.value, newResolvedReason.value);
      }
    }
  }

  updateFraudEvent(eventStatus: SelectDropdown, resolvedReason: SelectDropdown) {
    const apiData: UpdateFraudEventStatusRequest = {
      eventIds: this.filteredFraudEventList[0].eventId,
      OldEventStatus: this.filteredFraudEventList[0].eventStatus,
      OldResolvedReason: this.filteredFraudEventList[0].resolvedReason,
      eventStatus: eventStatus.value,
      resolvedReason: resolvedReason.value,
      Region: this._input.region,
      SubscriptionId: this._input.subId,
      VendorId: this._input.vendorId,
    };

    this.vendorSVC.updateFraudEventStatus(apiData).pipe(
      take(1),
      catchError(err => {
        this.displayMessage = FRAUD_ALERT_EVENT_API.DISPLAY_MESSAGE.NOT_UPDATED;
        return of(null);
      }),
    ).subscribe({
      next: res => {
        this.displayMessage =
          res?.toLowerCase() === FRAUD_ALERT_EVENT_API.RESPONSE.UPDATED.toLowerCase()
            ? FRAUD_ALERT_EVENT_API.DISPLAY_MESSAGE.UPDATED
            : FRAUD_ALERT_EVENT_API.DISPLAY_MESSAGE.NOT_UPDATED;
      }
    });
  }

  computeStatusMsgClass() {
    return (this.displayMessage === FRAUD_ALERT_EVENT_API.DISPLAY_MESSAGE.UPDATED) || (this.displayMessage === FRAUD_ALERT_EVENT_API.LOADING) ? 's1-C-Teal' : 's1-C-Cherry';
  }

  closePopup() {
    this.popupSVC.closeDialog();
  }

}
