import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject, Subscription, catchError, of, take, takeUntil } from 'rxjs';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { c3RuleEngineDialogType } from 'src/app/core/config/rule-engine.config';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { RuleEngineExpressionHelper, RuleEngineHelper } from '../rule-engine-helper';
import { RuleEngineApiService } from 'src/app/core/services/rule-engine/rule-engine-api.service';
import { DialogType, PPCDialogData } from 'src/app/models/ppc-dialog-data.model';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RuleDetail, RuleTypeEnum } from 'src/app/models/rule-engine/rule-engine';
import { APP_ROUTE_CONFIG_URL } from 'src/app/core/constants/constants';
import { RuleEditorConfigAdapter } from 'src/app/core/services/rule-engine/rule-editor-config-adapter.service';
import { RuleEditorField, RuleEditorShellConfig, UIRuleConfigApiResponse } from 'src/app/models/rule-engine/rule-editor-config.model';

@Component({
  selector: 'app-edit-rule-detail',
  templateUrl: './edit-rule-detail.component.html',
  styleUrls: ['./edit-rule-detail.component.css'],
})
export class EditRuleDetailComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>;

  editForm!: FormGroup;
  countryData!: { countries: SelectDropdown[], regions: SelectDropdown[] };
  overrideData: SelectDropdown[] = [];
  selectedOverride!: string;
  levelValues: string[] = [];
  apiErrorMsg!: string | null;
  workflowId!: number;
  ruleDetail: RuleDetail | null = null;
  isEditmode = false;
  ruleId: string | null = null;
  levelValueSubs!: Subscription;
  shellConfig!: RuleEditorShellConfig;
  private resellerInputHasText = false;
  private alertRecipientInputHasText = false;

  private readonly dialog = inject(MatDialog);
  private declare dialogRef: MatDialogRef<PpcDialogComponent>;

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

  private readonly resolverData: { mode: 'edit' | 'create' | 'duplicate', data: RuleDetail | null, ruleId: string | null } = this.route.snapshot.data['ruleDetail'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly ruleEngineDataSVC: RuleEngineDataService,
    private readonly ruleEngineAPISVC: RuleEngineApiService,
    private readonly ruleConfigAdapter: RuleEditorConfigAdapter,
    private readonly snackbarSVC: PpcSnackBarService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.workflowId = this.getWorkflowId();
    this.shellConfig = this.ruleConfigAdapter.getShellConfigForWorkflow(this.workflowId);
    this.initForm();  
    this.loadDataForUI();
    //  Breadcrumb logic
    this.ruleEngineDataSVC.setBreadcrumb(
      (this.resolverData.mode == 'create' || this.resolverData.mode == 'duplicate')
        ? 'Rules Engine$Add Rule' : 'Rules Engine$Edit Rule'
    );
  }

  /**
   * Returns the list of email domains allowed for the current workflow shell.
   */
  get allowedEmailList(): string[] {
    return this.shellConfig?.allowedEmailDomains ?? [];
  }

  /**
   * Indicates whether the current workflow exposes geo-based level value selection.
   */
  get hasGeoSelection(): boolean {
    return !!this.shellConfig?.geoDataSourceKey;
  }

  /**
   * Indicates whether the currently selected override uses dropdown-based geo selection.
   */
  get usesGeoSelector(): boolean {
    return this.shellConfig?.geoSelectorOverrideKeys.includes(this.selectedOverride) ?? false;
  }

  /**
   * Indicates whether the current geo selector should render region values instead of country values.
   */
  get usesRegionSelector(): boolean {
    return this.shellConfig?.regionSelectorOverrideKeys.includes(this.selectedOverride) ?? false;
  }

  /**
   * Indicates whether the currently selected override uses reseller free-text input.
   */
  get usesResellerInput(): boolean {
    return this.shellConfig?.resellerOverrideKeys.includes(this.selectedOverride) ?? false;
  }

  /**
   * Indicates whether the reseller-specific override hint should be displayed.
   */
  get showResellerOverrideHint(): boolean {
    return this.usesResellerInput;
  }

  /**
   * Returns the configured reseller input max length for the active workflow.
   */
  get resellerMaxLength(): number {
    return this.shellConfig?.resellerMaxLength ?? 0;
  }

  /**
   * Indicates whether the email recipients section should be rendered.
   */
  get showAlertRecipients(): boolean {
    return this.shellConfig?.emailRecipientsEnabled ?? false;
  }

  /**
   * Shows inline Add action for reseller input only when user has typed text.
   */
  get showResellerAddButton(): boolean {
    const control = this.getResellerControl();
    const value = control?.value ? String(control.value).trim() : '';
    return this.resellerInputHasText || value.length > 0;
  }

  /**
   * Shows inline Add action for alert recipients input only when user has typed text.
   */
  get showAlertRecipientAddButton(): boolean {
    const control = this.getAlertRecipientInputControl();
    const value = control?.value ? String(control.value).trim() : '';
    if (!value.length || !control) {
      return false;
    }

    control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    return this.alertRecipientInputHasText || control.valid;
  }

  onResellerInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    this.resellerInputHasText = value.trim().length > 0;
  }

  onAlertRecipientInputChange(event: Event): void {
    const value = (event.target as HTMLInputElement | null)?.value ?? '';
    const control = this.getAlertRecipientInputControl();
    if (!control) {
      this.alertRecipientInputHasText = false;
      return;
    }

    control.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    this.alertRecipientInputHasText = value.trim().length > 0 && control.valid;
  }

  private loadDataForUI(): void {
    const cachedConfig = this.ruleEngineDataSVC.getUIRuleConfig();
    if (cachedConfig) {
      this.initializeRuleConfigData(cachedConfig);
      return;
    }

    this.ruleEngineAPISVC.getUIRuleConfig(this.workflowId)
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Error fetching UI rule config:', error);
          return of(null);
        }),
      )
      .subscribe((config) => {
        if (!config) {
          return;
        }
        this.ruleEngineDataSVC.setUIRuleConfig(config);
        this.initializeRuleConfigData(config);
      });
  }

  /**
   * Initializes adapter-driven shell data and hydrates edit or duplicate state.
   */
  private initializeRuleConfigData(config: UIRuleConfigApiResponse): void {
    this.setDistinctOverrideData(config);

    if (this.hasGeoSelection) {
      this.setCountryRegionData(config);
      return;
    }

    this.subscribeToOverride();
    this.initializeResolverMode(config);
  }

  private setDistinctOverrideData(config: UIRuleConfigApiResponse): void {
    const distinctAllowedOverrides = RuleEngineHelper.getDistinctAllowedOverrides(config);
    this.overrideData = distinctAllowedOverrides.map((override) => ({
      label: this.getOverrideLabel(override),
      value: override,
    }));
  }

  private getOverrideLabel(override: string): string {
    return override === 'CountryGroup' ? 'Region' : override;
  }

  /**
   * Initializes edit or duplicate state once shell-specific data sources are ready.
   */
  private initializeResolverMode(config: UIRuleConfigApiResponse): void {
    if (this.resolverData.mode !== 'edit' && this.resolverData.mode !== 'duplicate') {
      this.ruleEngineDataSVC.setEditingExpression(null);
    }

    if ((this.resolverData.mode === 'edit' || this.resolverData.mode === 'duplicate') && this.resolverData.data) {
      this.addFormControl(this.formControlList.LEVEL_VALUE, null);
      this.initRuleDetail(
        this.resolverData.data,
        this.getSupportedExpressionAttributes(config, this.resolverData.data.expression),
      );

      if (this.resolverData.mode === 'edit') {
        this.isEditmode = true;
        this.ruleId = this.resolverData.ruleId;
      }
    }
  }

  private initForm() {
    this.editForm = this.fb.group({
      [this.formControlList.NAME]: ['', [Validators.required, Validators.maxLength(100)]],
      [this.formControlList.PURPOSE]: ['', [Validators.required, Validators.maxLength(250)]],
      [this.formControlList.OVERRIDE]: ['', Validators.required],
      // below are dummy formControlNames to handle the logic & design
      [this.formControlList.COUNTRY_REGION]: [null],
      [this.formControlList.RESELLER_INPUT]: [null, [Validators.maxLength(this.resellerMaxLength)]],
      [this.formControlList.ALERT_RECIPIENT_INPUT]: [''],
      [this.formControlList.ALERT_RECIPIENTS]: [[]],
      [this.formControlList.CHILD_FORM]: this.fb.control(null, { validators: [Validators.required] }),
    });
  }

  private parseCommaSeparatedTokens(value: string): string[] {
    return value
      .split(/[\s,;]+/)
      .map(token => token.trim())
      .filter(token => token.length > 0);
  }

  private initRuleDetail(ruleDetail: RuleDetail, supportedExpressionAttributes: RuleEditorField[]) {
    if (ruleDetail) {
      this.ruleEngineDataSVC.setEditingExpression(ruleDetail.expression ?? null);
      const uiForm = RuleEngineExpressionHelper.apiToUiForm(
        { expression: ruleDetail.expression, action: ruleDetail.action },
        supportedExpressionAttributes,
      );
      const overrideName = String(ruleDetail.overrideLevelName ?? '').trim();
      if (overrideName && !this.overrideData.some((el) => String(el.value).toLowerCase() === overrideName.toLowerCase())) {
        this.overrideData = [...this.overrideData, { label: this.getOverrideLabel(overrideName), value: overrideName }];
      }

      const override = overrideName
        ? this.overrideData.find((el) => String(el.value).toLowerCase() == overrideName.toLowerCase())
        : null;
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
      // Keep service state aligned with the selected override for workflows using adapter-driven level values.
      if (override && this.hasGeoSelection) {
        this.ruleEngineDataSVC.setOverrideValue(override.value as any);
      }
      if (ruleDetail.levelValues?.length && this.hasGeoSelection) {
        this.ruleEngineDataSVC.setLevelValue(ruleDetail.levelValues);
      }
    }
  }

  private getSupportedExpressionAttributes(config: UIRuleConfigApiResponse, expression: string): RuleEditorField[] {
    const ruleType = RuleEngineExpressionHelper.inferRuleTypeFromExpression(expression);
    const isComparable = ruleType === RuleTypeEnum.Compare;    
    return this.ruleEngineDataSVC.getExpressionAttributesByComparability(
      isComparable,
      config.attributeList,
    );
  }

  /**
   * Loads workflow-specific geo data when configured by the shell adapter.
   */
  private setCountryRegionData(config: UIRuleConfigApiResponse): void {
    const regionCountryDropDown = this.shellConfig.geoDataSourceKey
      ? config.dataSource?.[this.shellConfig.geoDataSourceKey]
      : null;

    if (!regionCountryDropDown) {
      this.subscribeToOverride();
      this.initializeResolverMode(config);
      return;
    }

    this.countryData = RuleEngineHelper.getAllCountryRegionList(regionCountryDropDown);    
    this.subscribeToOverride();
    this.subscribeToCountryRegion();
    this.initializeResolverMode(config);
  }

  /**
   * Synchronizes shell-driven override behavior with level value controls.
   */
  private subscribeToOverride() {
    this.editForm.get(this.formControlList.OVERRIDE)?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (controlValue: SelectDropdown | undefined) => {
          if(!controlValue) return;
          this.selectedOverride = String(controlValue.value);
          this.ruleEngineDataSVC.setOverrideValue(this.selectedOverride);

          if (this.shellConfig.overridesRequiringLevelValue.includes(this.selectedOverride)) {
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
    if (value.length >= this.resellerMaxLength) {
      event.preventDefault();
    }
  }

  blockInvalidPaste(event: ClipboardEvent): void {
    const control = this.getResellerControl();
    if (!control) return;

    const clipboardText = event.clipboardData?.getData('text') ?? '';
    const currentVal = control.value ? String(control.value) : '';

    const newLength = currentVal.length + clipboardText.length;

    if (newLength > this.resellerMaxLength) {
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
    if (raw.length > this.resellerMaxLength) {
      return;
    }

    if (!raw) return;

    this.appendLevelValue(raw);
    control.setValue('');
    this.resellerInputHasText = false;
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

    inputControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });
    if (inputControl.invalid) {
      inputControl.markAsTouched();
      return;
    }

    const raw = this.getTrimmedControlValue(inputControl);
    if (!raw) {
      return;
    }

    const tokens = this.parseCommaSeparatedTokens(raw);
    if (tokens.length === 0) {
      inputControl.setValue('');
      return;
    }

    const current = this.getStringArrayControlValue(recipientsControl);
    let next = current;

    for (const token of tokens) {
      if (this.hasEmail(next, token)) {
        continue;
      }
      next = [...next, token];
    }

    if (next !== current) {
      recipientsControl.setValue(next);
    }

    inputControl.setValue('');
    this.alertRecipientInputHasText = false;
  }

  private getTrimmedControlValue(control: FormControl): string {
    const value = control.value;
    return value ? String(value).trim() : '';
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
  makePublishApiCall(isDraft: boolean) {
    const datatoSend = RuleEngineHelper.getAPIRuleformat(this.editForm.value, isDraft, this.workflowId, this.ruleEngineDataSVC.getUIRuleConfig()?.attributeList);
    this.ruleEngineAPISVC.createRule(this.shellConfig.applicationId, datatoSend, this.workflowId)
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

  updateApiCall(isDraft:boolean) {
    const datatoSend = RuleEngineHelper.getAPIRuleformat(this.editForm.value, isDraft, this.workflowId, this.ruleEngineDataSVC.getUIRuleConfig()?.attributeList);
    if(!this.ruleId) return;
    this.ruleEngineAPISVC.updateRule(this.shellConfig.applicationId, {...datatoSend, ruleId: this.ruleId}, this.workflowId, this.ruleId)
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

  /**
   * Opens the workflow-specific confirmation dialog and routes the selected action.
   */
  private openDialog(type: DialogType, isDraft: boolean) {
    this.closeDialog();
    let dialogData: { height: string, data: PPCDialogData };
    let position = { bottom: '0', right: '0' };
    let key = this.getDialogType(isDraft, this.isEditmode);
    let data: PPCDialogData = { ...this.shellConfig.dialogConfig[key], type };
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
        if (res == this.shellConfig.dialogActions.publish) {
          this.makePublishApiCall(isDraft);
        }
        if (res == this.shellConfig.dialogActions.saveDraft) {
          this.makePublishApiCall(isDraft)
        }
        if(res == this.shellConfig.dialogActions.editDraft) {
          // create new draft - using create API
          this.makePublishApiCall(true);
        }
        if(res == this.shellConfig.dialogActions.editPublish) {
          // update API call
          this.updateApiCall(false);
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

  private getWorkflowId(): number {
    const workflowId = this.ruleEngineDataSVC.getWorkflowId();
    if (workflowId === null || !Number.isInteger(workflowId) || workflowId <= 0) {
      throw new Error('Missing mandatory workflowId from RuleEngineDataService');
    }
    return workflowId;
  }

  ngOnDestroy(): void {
    if(this.levelValueSubs) this.levelValueSubs.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
