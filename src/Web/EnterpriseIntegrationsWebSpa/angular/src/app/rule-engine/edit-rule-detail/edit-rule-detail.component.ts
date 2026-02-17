import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { C3_RULE_ENGINE_WORKFLOW_ID, C3OverrideLevels, c3RuleEngineAlertRecipientAllowedDomains, c3RuleEngineDialogConfig, c3RuleEngineDialogType, c3RuleEngineOverrideData } from 'src/app/core/config/rule-engine.config';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { RuleEngineExpressionHelper, RuleEngineHelper } from '../rule-engine-helper';
import { RuleEngineApiService } from 'src/app/core/services/rule-engine/rule-engine-api.service';
import { DialogType, PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleDetail } from 'src/app/models/rule-engine/rule-engine';
import { APP_ROUTE_CONFIG_URL } from 'src/app/core/constants/constants';

@Component({
  selector: 'app-edit-rule-detail',
  templateUrl: './edit-rule-detail.component.html',
  styleUrls: ['./edit-rule-detail.component.css'],
})
export class EditRuleDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>;

  private readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  editForm!: FormGroup;
  countryData!: { countries: SelectDropdown[], regions: SelectDropdown[] };
  overrideData = [...c3RuleEngineOverrideData];
  selectedOverride!: C3OverrideLevels;
  levelValues: string[] = [];
  apiErrorMsg!: string | null;
  workflowId = C3_RULE_ENGINE_WORKFLOW_ID;
  ruleDetail: RuleDetail | null = null;
  isEditmode = false;
  ruleId: string | null = null;
  levelValueSubs!: Subscription;

  private readonly dialog = inject(MatDialog);
  private declare dialogRef: MatDialogRef<PpcDialogComponent>;

  readonly allowedEmailList = c3RuleEngineAlertRecipientAllowedDomains;

  formControlList = {
    OVERRIDE: 'override',
    NAME: 'name',
    PURPOSE: 'purpose',
    LEVEL_VALUE: 'levelValue',
    RESELLER_INPUT: 'resellerInput',
    COUNTRY_REGION: 'countryRegion',
    ALERT_RECIPIENT_INPUT: 'alertRecipientInput',
    ALERT_RECIPIENTS: 'alertRecipients',
    CHILD_FORM: 'childForm',
  };

  childFormControlList = {
    EXPRESSIONS: 'expressions',
    ACTION: 'action',
  };

  overrideList = {
    GLOBAL: 'Global',
    COUNTRY_GROUP: 'CountryGroup',
    COUNTRY: 'Country',
    RESELLER: 'Reseller',
  };

  MAX_RESELLER_LENGTH = 50;

  private readonly resolverData: { mode: 'edit' | 'create' | 'duplicate', data: RuleDetail | null, ruleId: string | null } = this.route.snapshot.data['ruleDetail'];
  
  constructor(
    private readonly fb: FormBuilder,    
    private readonly dashboardDataSVC: PPCDashboardDataService,
    private readonly ruleEngineDataSVC: RuleEngineDataService,
    private readonly ruleEngineAPISVC: RuleEngineApiService,
    private readonly snackbarSVC: PpcSnackBarService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,    
  ) { }

  ngOnInit(): void {    
    this.initForm();
    this.getCountryRegionData(); 
    //  Breadcrumb logic
    this.ruleEngineDataSVC.setBreadcrumb(
      (this.resolverData.mode == 'create' || this.resolverData.mode == 'duplicate') 
        ? 'Rules Engine$Add Rule' : 'Rules Engine$Edit Rule'
    );         
  }

  private initForm() {
    this.editForm = this.fb.group({
      [this.formControlList.NAME]: ['', [Validators.required, Validators.maxLength(100)]],
      [this.formControlList.PURPOSE]: ['', [Validators.required, Validators.maxLength(250)]],
      [this.formControlList.OVERRIDE]: ['', Validators.required],
      // below are dummy formControlNames to handle the logic & design
      [this.formControlList.COUNTRY_REGION]: [null],
      [this.formControlList.RESELLER_INPUT]: [null, [Validators.maxLength(this.MAX_RESELLER_LENGTH)]],
      [this.formControlList.ALERT_RECIPIENT_INPUT]: ['', Validators.email],
      [this.formControlList.ALERT_RECIPIENTS]: [[]],
      [this.formControlList.CHILD_FORM]: this.fb.control(null, { validators: [Validators.required] }),
    });
  }

  private initRuleDetail(ruleDetail: RuleDetail) {
    if (ruleDetail) {
      const uiForm = RuleEngineExpressionHelper.apiToUiForm({ expressions: ruleDetail.expressions, action: ruleDetail.action });
      const override = ruleDetail.overrideLevel ? c3RuleEngineOverrideData.find(el => el.value.toLowerCase() == ruleDetail.overrideLevel.name.toLowerCase()) : null;
      this.editForm.patchValue({
        [this.formControlList.NAME]: ruleDetail.name,
        [this.formControlList.PURPOSE]: ruleDetail.purpose,
        // we have the overrides defined in config. API value tries to match any one from it, else override will be empty & user can select available value          
        [this.formControlList.OVERRIDE]: override ?? null,
        [this.formControlList.LEVEL_VALUE]: ruleDetail.levelValues,
        [this.formControlList.ALERT_RECIPIENTS]: ruleDetail.emails ?? [],
        [this.formControlList.ALERT_RECIPIENT_INPUT]: '',
        [this.formControlList.CHILD_FORM]: {
          [this.childFormControlList.EXPRESSIONS]: uiForm.expressions,
          [this.childFormControlList.ACTION]: uiForm.action
        }
      });
      this.editForm.updateValueAndValidity({ emitEvent: false });
      // Ensure service is always in sync in edit/duplicate
      if (override) {
        this.ruleEngineDataSVC.setOverrideValue(override.value as C3OverrideLevels);
      }
      if (ruleDetail.levelValues?.length) {
        this.ruleEngineDataSVC.setLevelValue(ruleDetail.levelValues);
      }
    }
  }

  private getCountryRegionData() {
    this.dashboardDataSVC.countryRegionData$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        if (!res) return;
        this.countryData = RuleEngineHelper.getAllCountryRegionList(res);
        this.subscribeToOverride();
        this.subscribeToCountryRegion();        
        if (this.resolverData.mode === 'edit' && this.resolverData.data) {
          this.isEditmode = true;
          this.ruleId = this.resolverData.ruleId;
          this.addFormControl(this.formControlList.LEVEL_VALUE, null);
          this.initRuleDetail(this.resolverData.data);
        } else if (this.resolverData.mode == 'duplicate' && this.resolverData.data) {
          this.addFormControl(this.formControlList.LEVEL_VALUE, null);
          this.initRuleDetail(this.resolverData.data);
        }
      });
  }
  
  private subscribeToOverride() {
    // Core logic for override level values
    this.editForm.get(this.formControlList.OVERRIDE)?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (controlValue: SelectDropdown | undefined) => {
          if(!controlValue) return;
          this.selectedOverride = controlValue.value as C3OverrideLevels;
          this.ruleEngineDataSVC.setOverrideValue(this.selectedOverride);
          if (
            [
              this.overrideList.COUNTRY_GROUP,
              this.overrideList.COUNTRY,
              this.overrideList.RESELLER
            ].includes(controlValue.value)
          ) {
            this.addFormControl(this.formControlList.LEVEL_VALUE, []);
            this.subscribeToLevelValue();
          } else {
            if (this.editForm.get(this.formControlList.LEVEL_VALUE)) this.removeFormControl(this.formControlList.LEVEL_VALUE);
            this.nullifyFormControl(this.formControlList.RESELLER_INPUT);
            if(this.levelValueSubs) this.levelValueSubs.unsubscribe();
          }
        }
      });
  }
  // setting levelValue in data service for use in rule component.
  private subscribeToLevelValue() {
    const formControl = this.editForm.get(this.formControlList.LEVEL_VALUE);
    if(!formControl) return;
    this.levelValueSubs = formControl.valueChanges.subscribe({
      next: (controlValue: string[]) => {
        if(controlValue?.length) this.ruleEngineDataSVC.setLevelValue(controlValue);
      }
    });
  }

  private subscribeToCountryRegion() {
    // logic for changing level value based on country/countryRegion drodown
    this.editForm.get(this.formControlList.COUNTRY_REGION)?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: value => {
          if (value) {
            const inputValue = this.editForm.get(this.formControlList.LEVEL_VALUE)?.value ?? [];
            if (inputValue) {
              this.appendLevelValue(value.value);
              this.nullifyFormControl(this.formControlList.COUNTRY_REGION);
            }
          }
        }
      });
  }

  blockExtraTyping(event: KeyboardEvent): void {
    const control = this.getResellerControl();
    if (!control) return;

    const value = control.value ? String(control.value) : '';

    // Allow navigation keys, backspace, delete
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    if (allowedKeys.includes(event.key)) return;

    // If already at limit → block typing
    if (value.length >= this.MAX_RESELLER_LENGTH) {
      event.preventDefault();
    }
  }

  blockInvalidPaste(event: ClipboardEvent): void {
    const control = this.getResellerControl();
    if (!control) return;

    const clipboardText = event.clipboardData?.getData('text') ?? '';
    const currentVal = control.value ? String(control.value) : '';

    const newLength = currentVal.length + clipboardText.length;

    if (newLength > this.MAX_RESELLER_LENGTH) {
      event.preventDefault();
    }
  }

  private getResellerControl(): FormControl | null {
    const c = this.editForm.get(this.formControlList.RESELLER_INPUT);
    return c instanceof FormControl ? c : null;
  }

  // Keyboard enter event callback in UI
  addResellerValue() {
    const control = this.getResellerControl();
    if (!control) return;

    const raw = control.value ? String(control.value).trim() : '';

    // Just block — no trimming
    if (raw.length > this.MAX_RESELLER_LENGTH) {      
      return;
    }

    if (!raw) return;

    this.appendLevelValue(raw);
    control.setValue('');
  }

  private appendLevelValue(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    // Prevent duplicates
    const levelValueControl = this.editForm.get(this.formControlList.LEVEL_VALUE);
    const current: string[] = Array.isArray(levelValueControl?.value) ? levelValueControl!.value : [];

    if (current.includes(trimmed)) {
      return;
    }

    const next = [...current, trimmed];
    if (levelValueControl) {
      levelValueControl.setValue(next, { emitEvent: true });
    }
  }

  chipDismissHandler(value: string) {
    const current = this.editForm.get(this.formControlList.LEVEL_VALUE)?.value || [];
    this.editForm.get(this.formControlList.LEVEL_VALUE)?.setValue(current.filter((v: string) => v !== value));
  }

  addAlertRecipientValue() {
    const inputControl = this.getAlertRecipientInputControl();
    const recipientsControl = this.getAlertRecipientsControl();
    if (!inputControl || !recipientsControl) return;

    const raw = this.getTrimmedControlValue(inputControl);
    if (!raw) return;

    const candidate = this.getValidAlertRecipientEmail(raw);
    if (!candidate) return;

    const current = this.getStringArrayControlValue(recipientsControl);
    if (this.hasEmail(current, candidate)) {
      inputControl.setValue('');
      return;
    }

    recipientsControl.setValue([...current, candidate]);
    inputControl.setValue('');
  }

  private getTrimmedControlValue(control: FormControl): string {
    const value = control.value;
    return value ? String(value).trim() : '';
  }

  private getValidAlertRecipientEmail(raw: string): string | null {
    // Do not block the form with invalid email; just ignore the entry
    if (!this.emailRegex.test(raw)) {
      return null;
    }

    if (!this.isAllowedAlertRecipientEmail(raw)) {
      return null;
    }
    
    return raw;
  }

  private getStringArrayControlValue(control: FormControl): string[] {
    const value = control.value;
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter(v => typeof v === 'string');
  }

  private hasEmail(current: string[], email: string): boolean {
    const normalized = email.toLowerCase();
    return current.some(v => v.toLowerCase() === normalized);
  }

  private isAllowedAlertRecipientEmail(email: string): boolean {
    const allowedDomains = (this.allowedEmailList ?? [])
      .map(d => String(d).trim().toLowerCase())
      .filter(d => d.length > 0)
      .map(d => (d.startsWith('@') ? d.slice(1) : d))
      .map(d => (d.startsWith('.') ? d.slice(1) : d));

    // If not configured, do not block (keeps behavior safe across envs)
    if (allowedDomains.length === 0) {
      return true;
    }

    const atIndex = email.lastIndexOf('@');
    if (atIndex <= 0 || atIndex === email.length - 1) {
      return false;
    }

    const domain = email.slice(atIndex + 1).trim().toLowerCase().replace(/^\./, '');
    if (!domain) {
      return false;
    }

    return allowedDomains.some(allowed => domain === allowed || domain.endsWith(`.${allowed}`));
  }

  alertRecipientChipDismissHandler(value: string) {
    const recipientsControl = this.getAlertRecipientsControl();
    if (!recipientsControl) return;
    const current: string[] = Array.isArray(recipientsControl.value) ? recipientsControl.value : [];
    recipientsControl.setValue(current.filter(v => v !== value));
  }

  private getAlertRecipientInputControl(): FormControl | null {
    const c = this.editForm.get(this.formControlList.ALERT_RECIPIENT_INPUT);
    return c instanceof FormControl ? c : null;
  }

  private getAlertRecipientsControl(): FormControl | null {
    const c = this.editForm.get(this.formControlList.ALERT_RECIPIENTS);
    return c instanceof FormControl ? c : null;
  }

  private addFormControl(controlName: string, controlValue: any) {
    if (!this.editForm.get(controlName)) {
      this.editForm.addControl(controlName, new FormControl(controlValue, Validators.required))
    } else {
      this.nullifyFormControl(controlName);
    }
  }

  private removeFormControl(controlName: string) {
    if (this.editForm.get(controlName)) this.editForm.removeControl(controlName);
  }

  private nullifyFormControl(controlName: string) {
    if (this.editForm.get(controlName)) this.editForm.get(controlName)?.setValue(null);
  }

  publishRule(isDraft: boolean) {
    if (!this.editForm.valid) return;
    this.apiErrorMsg = null;
    this.openDialog('RuleEngineConfirmation', isDraft);
  }

  saveChanges() {
    if(!this.editForm.valid) return;
    this.apiErrorMsg = null;
    this.openDialog('RuleEngineConfirmationWithRadioBtn', false);
  }

  discardChanges() {
    this.router.navigate([{ outlets: { ruleEngineOutlet: [APP_ROUTE_CONFIG_URL.RULE_ENGINE] } }]);
  }

  // Should be used only when user creates a new Rule. Do not use while edit/duplicate!!!
  makePublishApiCall(isDraft: boolean, mode: string) {
    const datatoSend = RuleEngineHelper.getAPIRuleformat(this.editForm.value, isDraft, mode);
    this.ruleEngineAPISVC.createRule(datatoSend, this.workflowId)
      .subscribe({
        next: res => {
          if (res) {
            const snackbarMsg =
              datatoSend.isDraft ?
                `<span class="ppc-bold-txt"> ${datatoSend.name} </span> has been drafted successfully` :
                `<span class="ppc-bold-txt"> ${datatoSend.name} </span> has been published successfully`;
            this.snackbarSVC.show(snackbarMsg);
            this.router.navigate([{ outlets: { ruleEngineOutlet: [APP_ROUTE_CONFIG_URL.RULE_ENGINE] } }]);
          }
        },
        error: err => {
          const domainErrors = err?.error?.errors?.domainValidations;
          const errorMessage = Array.isArray(domainErrors)
            ? domainErrors.join(' ')
            : '';
          this.apiErrorMsg = errorMessage;
        }
      });
  }

  updateApiCall(isDraft:boolean, mode: string) {    
    const datatoSend = RuleEngineHelper.getAPIRuleformat(this.editForm.value, isDraft, mode);
    if(!this.ruleId) return;
    this.ruleEngineAPISVC.updateRule({...datatoSend, ruleId: this.ruleId}, this.workflowId, this.ruleId)
      .subscribe({
        next: res => {
          if (res) {
            const snackbarMsg =
              datatoSend.isDraft ?
                `<span class="ppc-bold-txt"> ${datatoSend.name} </span> has been drafted successfully` :
                `<span class="ppc-bold-txt"> ${datatoSend.name} </span> has been modified and published`;
            this.snackbarSVC.show(snackbarMsg);
            this.router.navigate([{ outlets: { ruleEngineOutlet: [APP_ROUTE_CONFIG_URL.RULE_ENGINE] } }]);
          }
        },
        error: err => {
          const domainErrors = err?.error?.errors?.domainValidations;
          const errorMessage = Array.isArray(domainErrors)
            ? domainErrors.join(' ')
            : '';
          this.apiErrorMsg = errorMessage;
        }
      });
  }

  private openDialog(type: DialogType, isDraft: boolean) {
    this.closeDialog();
    let dialogData: { height: string, data: PPCDialogData };
    let position = { bottom: '0', right: '0' };
    let key = this.getDialogType(isDraft, this.isEditmode);    
    let data: PPCDialogData = { ...c3RuleEngineDialogConfig[key], type };
    dialogData = {
      height: type == 'RuleEngineConfirmationWithRadioBtn' ? '310px' : '229px',
      data, 
    };
    this.dialogRef = this.dialog.open(
      PpcDialogComponent,
      {
        ...dialogData,
        width: '75vw',
        maxWidth: '75vw',
        disableClose: false,
        position
      }
    );
    this.dialogRef.afterClosed().subscribe(res => {
      if (res) {        
        if (res == 'Publish') {
          this.makePublishApiCall(isDraft, res);
        }
        if (res == 'SaveDraft') {
          this.makePublishApiCall(isDraft, res)
        }
        if(res == 'EditDraft') {
          // create new draft - using create API
          this.makePublishApiCall(true, res);
        }
        if(res == 'EditPublish') {
          // update API call
          this.updateApiCall(false, res);
        }
      }
    });
  }

  private closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  private getDialogType(isDraft: boolean, isEditMode: boolean): c3RuleEngineDialogType {
    if (isEditMode) return 'edit';
    if (isDraft && !isEditMode) return 'createDraft';
    if (!isDraft && !isEditMode) return 'createPublish';
    return 'moveToDraft';
  }

  ngOnDestroy(): void {
    if(this.levelValueSubs) this.levelValueSubs.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
